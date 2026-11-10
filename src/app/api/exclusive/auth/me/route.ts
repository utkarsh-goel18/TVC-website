import { NextRequest, NextResponse } from "next/server";
import { resolveRequestAuth } from "@/lib/exclusive/auth";

export async function GET(req: NextRequest) {
  const auth = resolveRequestAuth(req);

  if (auth.inactive) {
    return NextResponse.json(
      {
        authenticated: false,
        inactive: true,
        message: auth.statusReason,
        memberName: auth.member?.name,
        rollNumber: auth.member?.roll_number,
      },
      { status: 403 }
    );
  }

  if (!auth.authenticated || !auth.publicView) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const unreadNotifications = auth.db.notifications.filter(
    (n) => n.recipient_id === auth.publicView!.id && !n.is_read
  ).length;

  return NextResponse.json({
    authenticated: true,
    member: auth.publicView,
    unreadNotifications,
  });
}

