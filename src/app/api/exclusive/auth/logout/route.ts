import { NextRequest, NextResponse } from "next/server";
import { mutateDb } from "@/lib/exclusive/db";
import { extractSessionToken, SESSION_COOKIE_NAME } from "@/lib/exclusive/auth";

export async function POST(req: NextRequest) {
  const token = extractSessionToken(req);
  if (token) {
    mutateDb((db) => {
      db.sessions = db.sessions.filter((s) => s.token !== token);
    });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}

