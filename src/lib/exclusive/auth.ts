import { NextRequest, NextResponse } from "next/server";
import {
  readDb,
  mutateDb,
  toPublicMemberView,
  hasPermission,
} from "./db";
import {
  MemberRecord,
  PublicMemberView,
  PermissionKey,
  TVCExclusiveDatabaseSchema,
} from "./types";

export const SESSION_COOKIE_NAME = "tvc_session";
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export function extractSessionToken(req: NextRequest): string | null {
  const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  const queryToken = req.nextUrl.searchParams.get("token");
  if (queryToken) return queryToken;

  return null;
}

export interface AuthResult {
  authenticated: boolean;
  inactive?: boolean;
  statusReason?: string;
  member?: MemberRecord;
  publicView?: PublicMemberView;
  db: TVCExclusiveDatabaseSchema;
}

export function resolveRequestAuth(req: NextRequest): AuthResult {
  const db = readDb();
  const token = extractSessionToken(req);
  if (!token) {
    return { authenticated: false, db };
  }

  const now = Date.now();
  const session = db.sessions.find((s) => s.token === token);
  if (!session) {
    return { authenticated: false, db };
  }

  if (new Date(session.expires_at).getTime() <= now) {
    mutateDb((d) => {
      d.sessions = d.sessions.filter((s) => s.token !== token);
    });
    return { authenticated: false, db };
  }

  const member = db.members.find((m) => m.id === session.member_id);
  if (!member) {
    return { authenticated: false, db };
  }

  if (member.membership_status !== "active") {
    return {
      authenticated: false,
      inactive: true,
      statusReason:
        member.membership_status === "suspended"
          ? "Your TVC Exclusive account is currently suspended. Contact TVC Executive Leadership."
          : "Your TVC Exclusive membership account is currently inactive. Contact TVC Executive Leadership to reactivate access.",
      member,
      publicView: toPublicMemberView(db, member),
      db,
    };
  }

  return {
    authenticated: true,
    member,
    publicView: toPublicMemberView(db, member),
    db,
  };
}

export function requireActiveMember(
  req: NextRequest
):
  | { ok: true; member: MemberRecord; publicView: PublicMemberView; db: TVCExclusiveDatabaseSchema }
  | { ok: false; response: NextResponse } {
  const auth = resolveRequestAuth(req);

  if (auth.inactive) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "ACCOUNT_INACTIVE",
          message: auth.statusReason,
        },
        { status: 403 }
      ),
    };
  }

  if (!auth.authenticated || !auth.member || !auth.publicView) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "UNAUTHENTICATED",
          message: "Please sign in with your TVC member credentials.",
        },
        { status: 401 }
      ),
    };
  }

  return {
    ok: true,
    member: auth.member,
    publicView: auth.publicView,
    db: auth.db,
  };
}

export function requirePermission(
  req: NextRequest,
  permission: PermissionKey
):
  | { ok: true; member: MemberRecord; publicView: PublicMemberView; db: TVCExclusiveDatabaseSchema }
  | { ok: false; response: NextResponse } {
  const base = requireActiveMember(req);
  if (!base.ok) return base;

  if (!hasPermission(base.db, base.member, permission)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "FORBIDDEN",
          message: `Insufficient permissions: requires '${permission}'.`,
        },
        { status: 403 }
      ),
    };
  }

  return base;
}

