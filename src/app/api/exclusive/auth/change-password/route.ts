import { NextRequest, NextResponse } from "next/server";
import { requireActiveMember } from "@/lib/exclusive/auth";
import { mutateDb, recordAuditLog, toPublicMemberView } from "@/lib/exclusive/db";
import { hashPassword, verifyPassword } from "@/lib/exclusive/crypto";

export async function POST(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Both current and new passwords are required." },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "WEAK_PASSWORD", message: "New password must be at least 8 characters long." },
      { status: 400 }
    );
  }

  if (!verifyPassword(currentPassword, auth.member.password_hash)) {
    return NextResponse.json(
      { error: "INVALID_CURRENT_PASSWORD", message: "Current password is incorrect." },
      { status: 401 }
    );
  }

  const updated = mutateDb((db) => {
    const target = db.members.find((m) => m.id === auth.member.id)!;
    target.password_hash = hashPassword(newPassword);
    target.must_change_password = false;
    target.updated_at = new Date().toISOString();

    recordAuditLog(db, {
      actor_id: target.id,
      action: "PASSWORD_CHANGED",
      target_type: "member",
      target_id: target.id,
      summary: `${target.name} (${target.roll_number}) updated their account password.`,
    });

    return toPublicMemberView(db, target);
  });

  return NextResponse.json({
    success: true,
    member: updated,
    message: "Password updated successfully.",
  });
}

