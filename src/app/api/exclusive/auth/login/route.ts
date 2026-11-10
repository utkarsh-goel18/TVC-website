import { NextRequest, NextResponse } from "next/server";
import { mutateDb, readDb, toPublicMemberView } from "@/lib/exclusive/db";
import { verifyPassword, generateSecureToken } from "@/lib/exclusive/crypto";
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/exclusive/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = String(body.username || body.rollNumber || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "MISSING_CREDENTIALS", message: "Enter your roll number (or username) and password." },
        { status: 400 }
      );
    }

    const db = readDb();
    const member = db.members.find(
      (m) =>
        m.roll_number.toLowerCase() === identifier ||
        m.username.toLowerCase() === identifier ||
        m.email.toLowerCase() === identifier
    );

    if (!member || !verifyPassword(password, member.password_hash)) {
      return NextResponse.json(
        { error: "INVALID_CREDENTIALS", message: "Invalid roll number/username or password." },
        { status: 401 }
      );
    }

    if (member.membership_status !== "active") {
      return NextResponse.json(
        {
          error: "ACCOUNT_INACTIVE",
          message:
            member.membership_status === "suspended"
              ? "Your TVC Exclusive account is currently suspended. Contact TVC Executive Leadership."
              : "Your TVC Exclusive membership account is currently inactive. Contact TVC Executive Leadership.",
          status: member.membership_status,
        },
        { status: 403 }
      );
    }

    const token = generateSecureToken(32);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

    const publicMember = mutateDb((d) => {
      // Remove expired sessions
      d.sessions = d.sessions.filter(
        (s) => new Date(s.expires_at).getTime() > Date.now()
      );
      d.sessions.push({
        token,
        member_id: member.id,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });
      return toPublicMemberView(d, member);
    });

    const res = NextResponse.json({
      authenticated: true,
      token,
      member: publicMember,
    });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return res;
  } catch {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Unable to process sign-in request." },
      { status: 500 }
    );
  }
}

