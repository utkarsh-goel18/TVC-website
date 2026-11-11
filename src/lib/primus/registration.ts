import { FieldValue, type Transaction } from "firebase-admin/firestore";
import { randomBytes } from "crypto";
import type { NextRequest } from "next/server";
import { getFirebaseFirestore } from "./firebase-admin";

export const PRIMUS_HOSTELS = [
  "Agira Hall", "Amritam Hall", "Prithvi Hall", "Neeram Hall", "Vyan Hall",
  "Tejas Hall", "Ambaram Hall", "Viyat Hall", "Anantam Hall", "Vyom Hall",
  "FRF/G", "Vasudha Hall", "Ira Hall", "Ananta Hall", "Dhriti Hall",
  "Vahni Hall", "Pavani Hall", "Day Scholar",
] as const;

export const PRIMUS_TRACKS = ["Product", "Consulting", "Finance"] as const;
export type PrimusTrack = (typeof PRIMUS_TRACKS)[number];

export interface ParticipantInput {
  name: string;
  phone: string;
  hostel: (typeof PRIMUS_HOSTELS)[number];
}

export interface PrimusMember extends ParticipantInput {
  uid: string;
  email: string;
  joinedAt: string;
  role: "leader" | "member";
}

export interface PrimusTeam {
  code: string;
  teamName: string;
  track: PrimusTrack;
  leaderUid: string;
  leaderEmail: string;
  members: PrimusMember[];
  status: "OPEN" | "SUBMITTED";
  createdAt: string;
  submittedAt: string | null;
}

export function cleanParticipant(body: unknown): ParticipantInput | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const value = body as Record<string, unknown>;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const phone = typeof value.phone === "string" ? value.phone.replace(/[\s-]/g, "") : "";
  const hostel = typeof value.hostel === "string" ? value.hostel : "";

  if (name.length < 2 || name.length > 80) return null;
  if (!/^\+?[0-9]{10,14}$/.test(phone)) return null;
  if (!PRIMUS_HOSTELS.includes(hostel as (typeof PRIMUS_HOSTELS)[number])) return null;

  return { name, phone, hostel: hostel as ParticipantInput["hostel"] };
}

export function isThaparEmail(email: string): boolean {
  const domain = (process.env.THAPAR_EMAIL_DOMAIN || "thapar.edu").trim().toLowerCase();
  return email.toLowerCase().endsWith(`@${domain}`);
}

// New team codes have 64 bits of randomness. The API continues accepting
// legacy 32-bit codes so teams created before this change remain usable.
export function createTeamCode(): string {
  return `PRM-${randomBytes(8).toString("hex").toUpperCase()}`;
}

export function isValidTeamCode(code: string): boolean {
  return /^PRM-(?:[A-F0-9]{8}|[A-F0-9]{16})$/.test(code);
}

export function teamReference(code: string) {
  return getFirebaseFirestore().collection("primusTeams").doc(code);
}

export function participantReference(uid: string) {
  return getFirebaseFirestore().collection("primusParticipantIndex").doc(uid);
}

export function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

export function asTeam(data: FirebaseFirestore.DocumentData): PrimusTeam {
  return data as PrimusTeam;
}

export function timestamp() {
  return new Date().toISOString();
}

/**
 * Read a small JSON request body without buffering an unbounded payload.
 * PRIMUS forms need only a few hundred bytes; 8 KiB leaves ample headroom.
 */
export async function parseJsonBody(req: NextRequest, maxBytes = 8 * 1024): Promise<unknown | null> {
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > maxBytes) return null;
  if (!req.body) return null;

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  try {
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    return null;
  }
}

/**
 * Transactional per-UID limits protect join-code guessing and automated team
 * creation. These are abuse controls, not a substitute for edge-level limits.
 */
export async function enforceRateLimit(
  uid: string,
  action: "join" | "create",
  maxAttempts: number,
  windowMs: number
) {
  const db = getFirebaseFirestore();
  const safeUid = Buffer.from(uid, "utf8").toString("base64url");
  const reference = db.collection("primusRateLimits").doc(`${action}_${safeUid}`);

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const now = Date.now();
    const data = snapshot.data() || {};
    const previousStart = typeof data.windowStartedAt === "number" ? data.windowStartedAt : 0;
    const sameWindow = previousStart > 0 && now - previousStart < windowMs;
    const attempts = sameWindow && Number.isInteger(data.attempts) ? data.attempts : 0;

    if (attempts >= maxAttempts) throw new Error("RATE_LIMITED");

    transaction.set(reference, {
      windowStartedAt: sameWindow ? previousStart : now,
      attempts: attempts + 1,
      updatedAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(now + windowMs * 2),
    });
  });
}

export function setParticipantIndex(
  transaction: Transaction,
  uid: string,
  code: string,
  email: string
) {
  transaction.create(participantReference(uid), {
    teamCode: code,
    email: normaliseEmail(email),
    createdAt: FieldValue.serverTimestamp(),
  });
}
