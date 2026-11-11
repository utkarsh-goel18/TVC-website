import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/primus/firebase-admin";
import {
  cleanParticipant,
  createTeamCode,
  enforceRateLimit,
  isThaparEmail,
  normaliseEmail,
  parseJsonBody,
  PRIMUS_TRACKS,
  setParticipantIndex,
  teamReference,
  timestamp,
} from "@/lib/primus/registration";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

async function verifiedParticipant(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new Error("AUTH_REQUIRED");
  let decoded;
  try {
    decoded = await getFirebaseAuth().verifyIdToken(token, true);
  } catch {
    throw new Error("AUTH_REQUIRED");
  }
  const email = normaliseEmail(decoded.email || "");
  if (!decoded.email_verified || !isThaparEmail(email)) throw new Error("THAPAR_EMAIL_REQUIRED");
  return { uid: decoded.uid, email };
}

export async function POST(req: NextRequest) {
  try {
    const participant = await verifiedParticipant(req);
    const body = await parseJsonBody(req);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "INVALID_INPUT", message: "Provide valid registration details." }, { status: 400, headers: NO_STORE });
    }
    const details = cleanParticipant(body);
    const teamName = typeof body.teamName === "string" ? body.teamName.trim() : "";
    const track = body.track;

    if (!details || teamName.length < 2 || teamName.length > 60 || !PRIMUS_TRACKS.includes(track)) {
      return NextResponse.json({ error: "INVALID_INPUT", message: "Provide a valid team name, track and complete participant details." }, { status: 400, headers: NO_STORE });
    }

    await enforceRateLimit(participant.uid, "create", 3, 15 * 60 * 1000);

    const code = createTeamCode();
    const teamRef = teamReference(code);
    const db = getFirebaseFirestore();
    const participantRef = db.collection("primusParticipantIndex").doc(participant.uid);
    const createdAt = timestamp();

    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(participantRef);
      if (existing.exists) throw new Error("ALREADY_REGISTERED");

      transaction.create(teamRef, {
        code,
        teamName,
        track,
        leaderUid: participant.uid,
        leaderEmail: participant.email,
        members: [{
          ...details,
          uid: participant.uid,
          email: participant.email,
          joinedAt: createdAt,
          role: "leader",
        }],
        status: "OPEN",
        createdAt,
        submittedAt: null,
      });
      setParticipantIndex(transaction, participant.uid, code, participant.email);
      transaction.set(db.collection("primusRegistrationMeta").doc("counts"), {
        teamsCreated: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    return NextResponse.json({ success: true, teamCode: code, teamName, track, memberCount: 1 }, { status: 201, headers: NO_STORE });
  } catch (error) {
    console.error("[PRIMUS teams POST]", error);
    const message = error instanceof Error ? error.message : "";
    const status = message === "AUTH_REQUIRED" ? 401 : message === "THAPAR_EMAIL_REQUIRED" ? 403 : message === "ALREADY_REGISTERED" ? 409 : message === "RATE_LIMITED" ? 429 : 500;
    return NextResponse.json({
      error: message === "ALREADY_REGISTERED" || message === "RATE_LIMITED" ? message : "REGISTRATION_ERROR",
      message: message === "ALREADY_REGISTERED" ? "This account is already part of a PRIMUS team." : message === "RATE_LIMITED" ? "Too many team creation attempts. Please wait 15 minutes before trying again." : status === 401 ? "Sign in with your verified Thapar email first." : status === 403 ? "Only verified Thapar student email accounts can register here." : "Unable to create the team. Please try again.",
    }, { status, headers: NO_STORE });
  }
}

export async function GET(req: NextRequest) {
  try {
    const participant = await verifiedParticipant(req);
    const db = getFirebaseFirestore();
    const index = await db.collection("primusParticipantIndex").doc(participant.uid).get();
    if (!index.exists) return NextResponse.json({ team: null }, { headers: NO_STORE });
    const code = String(index.data()?.teamCode || "");
    const team = await teamReference(code).get();
    if (!team.exists) return NextResponse.json({ team: null }, { headers: NO_STORE });

    const data = team.data() || {};
    const members = Array.isArray(data.members)
      ? data.members.map((member: Record<string, unknown>) => ({
          name: member.name,
          email: member.email,
          role: member.role,
        }))
      : [];

    return NextResponse.json({
      team: {
        code: team.id,
        teamName: data.teamName,
        track: data.track,
        status: data.status,
        members,
      },
    }, { headers: NO_STORE });
  } catch (error) {
    console.error("[PRIMUS teams GET]", error);
    const message = error instanceof Error ? error.message : "";
    const status = message === "AUTH_REQUIRED" ? 401 : message === "THAPAR_EMAIL_REQUIRED" ? 403 : 500;
    return NextResponse.json({ error: "REQUEST_FAILED", message: status === 401 ? "Authentication required." : status === 403 ? "A verified Thapar email is required." : "Unable to load your team." }, { status, headers: NO_STORE });
  }
}
