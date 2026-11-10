import { NextRequest, NextResponse } from "next/server";
import { requireActiveMember } from "@/lib/exclusive/auth";
import { mutateDb } from "@/lib/exclusive/db";
import { generateSecureToken } from "@/lib/exclusive/crypto";

export async function GET(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const { db, member } = auth;
  const list = db.notifications
    .filter((n) => n.recipient_id === member.id)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return NextResponse.json({
    notifications: list,
    unreadCount: list.filter((n) => !n.is_read).length,
    preferences: member.notification_preferences,
  });
}

export async function PATCH(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const action = String(body.action || "");

  mutateDb((db) => {
    if (action === "mark_read") {
      const id = String(body.notificationId || "");
      const notif = db.notifications.find(
        (n) => n.id === id && n.recipient_id === auth.member.id
      );
      if (notif) notif.is_read = true;
    } else if (action === "mark_all_read") {
      for (const n of db.notifications) {
        if (n.recipient_id === auth.member.id) {
          n.is_read = true;
        }
      }
    } else if (action === "update_preferences") {
      const target = db.members.find((m) => m.id === auth.member.id);
      if (target && body.preferences && typeof body.preferences === "object") {
        target.notification_preferences = {
          ...target.notification_preferences,
          ...body.preferences,
        };
      }
    } else if (action === "toggle_mute_conversation") {
      const convId = String(body.conversationId || "");
      const target = db.members.find((m) => m.id === auth.member.id);
      if (target && convId) {
        const current = target.notification_preferences?.muted_conversations || [];
        const next = current.includes(convId)
          ? current.filter((id) => id !== convId)
          : [...current, convId];
        target.notification_preferences = {
          ...target.notification_preferences,
          muted_conversations: next,
        };
      }
    }
  });

  return NextResponse.json({ success: true });
}

// Register Expo Push Token for Mobile Device
export async function POST(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const deviceToken = String(body.deviceToken || "").trim();
  const platform = ["ios", "android", "web"].includes(body.platform)
    ? (body.platform as "ios" | "android" | "web")
    : "android";

  if (!deviceToken) {
    return NextResponse.json(
      { error: "MISSING_TOKEN", message: "deviceToken is required." },
      { status: 400 }
    );
  }

  mutateDb((db) => {
    const now = new Date().toISOString();
    const existing = db.device_tokens.find(
      (dt) => dt.device_token === deviceToken
    );
    if (existing) {
      existing.member_id = auth.member.id;
      existing.platform = platform;
      existing.updated_at = now;
    } else {
      db.device_tokens.push({
        id: `dt-${generateSecureToken(6)}`,
        member_id: auth.member.id,
        device_token: deviceToken,
        platform,
        created_at: now,
        updated_at: now,
      });
    }
  });

  return NextResponse.json({
    success: true,
    message: "Push notification token registered securely.",
  });
}

