import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/primus/firebase-admin";
import { cleanParticipant, enforceRateLimit, isThaparEmail, normaliseEmail, participantReference, teamReference, timestamp } from "@/lib/primus/registration";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const header = req.headers.get("authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return NextResponse.json({ error: "AUTH_REQUIRED", message: "Sign in with your verified Thapar email first." }, { status: 401 });

    let decoded;
    try {
      decoded = await getFirebaseAuth().verifyIdToken(token, true);
    } catch {
      return NextResponse.json({ error: "AUTH_REQUIRED", message: "Your session is invalid or expired. Sign in again." }, { status: 401 });
    }
    const email = normaliseEmail(decoded.email || "");
    if (!decoded.email_verified || !isThaparEmail(email)) return NextResponse.json({ error: "THAPAR_EMAIL_REQUIRED", message: "Only verified Thapar student email accounts can join a team." }, { status: 403 });

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "INVALID_INPUT", message: "Provide a valid team code and participant details." }, { status: 400 });
    }
    const code = typeof body.teamCode === "string" ? body.teamCode.trim().toUpperCase() : "";
    const details = cleanParticipant(body);
    if (!/^PRM-[A-F0-9]{8}$/.test(code) || !details) return NextResponse.json({ error: "INVALID_INPUT", message: "Enter a valid team code and complete participant details." }, { status: 400 });

    await enforceRateLimit(decoded.uid, "join", 8, 15 * 60 * 1000);

    const teamRef = teamReference(code);
    const indexRef = participantReference(decoded.uid);
    const joinedAt = timestamp();

    await getFirebaseFirestore().runTransaction(async (transaction) => {
      const [teamSnapshot, indexSnapshot] = await Promise.all([transaction.get(teamRef), transaction.get(indexRef)]);
      if (!teamSnapshot.exists) throw new Error("TEAM_NOT_FOUND");
      if (indexSnapshot.exists) throw new Error("ALREADY_REGISTERED");

      const team = teamSnapshot.data()!;
      const members = Array.isArray(team.members) ? team.members : [];
      if (team.status !== "OPEN") throw new Error("TEAM_LOCKED");
      if (members.length >= 4) throw new Error("TEAM_FULL");
      if (members.some((member: { email?: string }) => normaliseEmail(member.email || "") === email)) throw new Error("ALREADY_REGISTERED");

      transaction.update(teamRef, {
        members: [...members, { ...details, uid: decoded.uid, email, joinedAt, role: "member" }],
        updatedAt: joinedAt,
      });
      transaction.create(indexRef, { teamCode: code, email, createdAt: joinedAt });
    });

    return NextResponse.json({ success: true, teamCode: code, message: "You have joined the team successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const errors: Record<string, { status: number; message: string }> = {
      TEAM_NOT_FOUND: { status: 404, message: "No team was found with that code." },
      ALREADY_REGISTERED: { status: 409, message: "This account is already part of a PRIMUS team." },
      TEAM_LOCKED: { status: 409, message: "This team has already submitted its registration." },
      TEAM_FULL: { status: 409, message: "This team already has four members." },
      RATE_LIMITED: { status: 429, message: "Too many join attempts. Please wait 15 minutes before trying again." },
    };
    const known = errors[message];
    return NextResponse.json({ error: known ? message : "JOIN_FAILED", message: known?.message || "Unable to join this team. Please try again." }, { status: known?.status || 500 });
  }
}
