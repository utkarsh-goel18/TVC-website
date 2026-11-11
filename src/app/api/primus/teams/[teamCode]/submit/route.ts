import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/primus/firebase-admin";
import { isThaparEmail, isValidTeamCode, normaliseEmail, teamReference, timestamp } from "@/lib/primus/registration";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function POST(req: NextRequest, context: { params: Promise<{ teamCode: string }> }) {
  try {
    const header = req.headers.get("authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) {
      return NextResponse.json(
        { error: "AUTH_REQUIRED", message: "Authentication required." },
        { status: 401, headers: NO_STORE }
      );
    }

    let decoded;
    try {
      decoded = await getFirebaseAuth().verifyIdToken(token, true);
    } catch {
      return NextResponse.json(
        { error: "AUTH_REQUIRED", message: "Your session is invalid or expired. Sign in again." },
        { status: 401, headers: NO_STORE }
      );
    }

    const email = normaliseEmail(decoded.email || "");
    if (!decoded.email_verified || !isThaparEmail(email)) {
      return NextResponse.json(
        { error: "THAPAR_EMAIL_REQUIRED", message: "A verified Thapar email is required." },
        { status: 403, headers: NO_STORE }
      );
    }

    const { teamCode } = await context.params;
    const code = teamCode.trim().toUpperCase();
    // Accept both current 64-bit codes and legacy 32-bit codes.
    if (!isValidTeamCode(code)) {
      return NextResponse.json(
        { error: "INVALID_TEAM_CODE", message: "The team code is invalid." },
        { status: 400, headers: NO_STORE }
      );
    }

    const teamRef = teamReference(code);
    const submittedAt = timestamp();

    await getFirebaseFirestore().runTransaction(async (transaction) => {
      const snapshot = await transaction.get(teamRef);
      if (!snapshot.exists) throw new Error("TEAM_NOT_FOUND");

      const team = snapshot.data()!;
      if (team.leaderUid !== decoded.uid) throw new Error("LEADER_ONLY");
      if (team.status !== "OPEN") throw new Error("ALREADY_SUBMITTED");

      const members = Array.isArray(team.members) ? team.members : [];
      if (members.length < 2) throw new Error("MIN_TEAM_SIZE");
      if (members.length > 4) throw new Error("MAX_TEAM_SIZE");

      transaction.update(teamRef, {
        status: "SUBMITTED",
        submittedAt,
        updatedAt: submittedAt,
      });
    });

    return NextResponse.json(
      { success: true, status: "SUBMITTED", message: "Your PRIMUS team registration has been submitted." },
      { headers: NO_STORE }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const errors: Record<string, { status: number; message: string }> = {
      TEAM_NOT_FOUND: { status: 404, message: "Team not found." },
      LEADER_ONLY: { status: 403, message: "Only the team leader can submit the registration." },
      ALREADY_SUBMITTED: { status: 409, message: "This team has already been submitted." },
      MIN_TEAM_SIZE: { status: 409, message: "A team needs at least two members before submission." },
      MAX_TEAM_SIZE: { status: 409, message: "A team cannot have more than four members." },
    };

    const known = errors[message];
    const status = known?.status || (message === "AUTH_REQUIRED" ? 401 : message === "THAPAR_EMAIL_REQUIRED" ? 403 : 500);
    return NextResponse.json(
      {
        error: known ? message : "SUBMISSION_FAILED",
        message: known?.message || (status === 401
          ? "Authentication required."
          : status === 403
            ? "A verified Thapar email is required."
            : "Unable to submit registration."),
      },
      { status, headers: NO_STORE }
    );
  }
}
