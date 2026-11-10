import { FieldValue, type Transaction } from "firebase-admin/firestore";
import { randomBytes } from "crypto";
import { getFirebaseFirestore } from "./firebase-admin";

export const PRIMUS_HOSTELS = [
  "Agira Hall",
  "Amritam Hall",
  "Prithvi Hall",
  "Neeram Hall",
  "Vyan Hall",
  "Tejas Hall",
  "Ambaram Hall",
  "Viyat Hall",
  "Anantam Hall",
  "Vyom Hall",
  "FRF/G",
  "Vasudha Hall",
  "Ira Hall",
  "Ananta Hall",
  "Dhriti Hall",
  "Vahni Hall",
  "Pavani Hall",
  "Day Scholar",
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
  if (!body || typeof body !== "object") return null;
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

export function createTeamCode(): string {
  return `PRM-${randomBytes(4).toString("hex").toUpperCase()}`;
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
