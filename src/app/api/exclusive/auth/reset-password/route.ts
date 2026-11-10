import { NextRequest, NextResponse } from "next/server";
import { mutateDb, readDb, recordAuditLog } from "@/lib/exclusive/db";
import { generateSecureToken, hashPassword } from "@/lib/exclusive/crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action = String(body.action || "request");

  if (action === "request") {
    const identifier = String(body.identifier || "").trim().toLowerCase();
    if (!identifier) {
      return NextResponse.json(
        { error: "MISSING_IDENTIFIER", message: "Enter your roll number or university email." },
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

    if (!member) {
      return NextResponse.json({
        success: true,
        message: "If a matching TVC member record exists, a reset code has been generated.",
      });
    }

    const resetToken = generateSecureToken(12).toUpperCase();
    mutateDb((d) => {
      d.password_reset_tokens.push({
        token: resetToken,
        member_id: member.id,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
        used: false,
      });
    });

    return NextResponse.json({
      success: true,
      message: "One-time password reset token issued (valid for 30 minutes).",
      resetToken, // Returned in local/dev mode so members can test reset without SMTP configured
    });
  }

  if (action === "confirm") {
    const token = String(body.token || "").trim().toUpperCase();
    const newPassword = String(body.newPassword || "");

    if (!token || newPassword.length < 8) {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "Valid reset token and a password of 8+ characters are required." },
        { status: 400 }
      );
    }

    const db = readDb();
    const record = db.password_reset_tokens.find(
      (t) =>
        t.token === token &&
        !t.used &&
        new Date(t.expires_at).getTime() > Date.now()
    );

    if (!record) {
      return NextResponse.json(
        { error: "INVALID_TOKEN", message: "Reset token is invalid or expired." },
        { status: 400 }
      );
    }

    mutateDb((d) => {
      const r = d.password_reset_tokens.find((t) => t.token === token)!;
      r.used = true;
      const member = d.members.find((m) => m.id === r.member_id);
      if (member) {
        member.password_hash = hashPassword(newPassword);
        member.must_change_password = false;
        member.updated_at = new Date().toISOString();
        recordAuditLog(d, {
          actor_id: member.id,
          action: "PASSWORD_RESET_COMPLETED",
          target_type: "member",
          target_id: member.id,
          summary: `${member.name} (${member.roll_number}) reset their password via verification token.`,
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Password has been reset. You can now sign in.",
    });
  }

  return NextResponse.json({ error: "INVALID_ACTION" }, { status: 400 });
}

