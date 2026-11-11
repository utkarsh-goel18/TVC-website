import { FieldPath } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/primus/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TRACKS = ["Product", "Consulting", "Finance"] as const;
const STATUSES = ["OPEN", "SUBMITTED"] as const;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 50;
// Search and CSV are in-memory substring operations. Bound the number of
// documents read so a broad admin query cannot scan an unbounded collection.
const MAX_SCAN_TEAMS = 5000;

type Cursor =
  | { mode: "ordered"; createdAt: string; code: string }
  | { mode: "search"; offset: number };

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: status === 401 ? "AUTH_REQUIRED" : status === 403 ? "FORBIDDEN" : "INVALID_REQUEST", message },
    { status, headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

function decodeCursor(value: string | null): Cursor | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Cursor;
    if (parsed.mode === "ordered" && typeof parsed.createdAt === "string" && typeof parsed.code === "string") return parsed;
    if (parsed.mode === "search" && Number.isSafeInteger(parsed.offset) && parsed.offset >= 0 && parsed.offset <= MAX_SCAN_TEAMS) return parsed;
  } catch {
    // Invalid cursors are rejected by the caller.
  }
  return null;
}

function encodeCursor(cursor: Cursor) {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

function includesSearchTerm(team: Record<string, unknown>, term: string) {
  const members = Array.isArray(team.members) ? team.members : [];
  const searchable = [
    team.code, team.teamName, team.track, team.status, team.leaderEmail,
    ...members.flatMap((member) => {
      if (!member || typeof member !== "object") return [];
      const value = member as Record<string, unknown>;
      return [value.name, value.email, value.phone, value.hostel];
    }),
  ];
  return searchable.some((value) => typeof value === "string" && value.toLowerCase().includes(term));
}

function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(teams: Record<string, unknown>[]) {
  const header = ["Team code", "Team name", "Track", "Status", "Created at", "Submitted at", "Member name", "Member email", "Phone", "Hostel", "Role"];
  const rows = teams.flatMap((team) => {
    const members = Array.isArray(team.members) ? team.members : [];
    return members.map((member) => {
      const value = member && typeof member === "object" ? member as Record<string, unknown> : {};
      return [
        team.code, team.teamName, team.track, team.status, team.createdAt, team.submittedAt,
        value.name, value.email, value.phone, value.hostel, value.role,
      ].map(csvCell).join(",");
    });
  });
  return [header.map(csvCell).join(","), ...rows].join("\r\n");
}

export async function GET(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return jsonError("Sign in with an authorised admin account.", 401);

  let uid = "";
  try {
    const decoded = await getFirebaseAuth().verifyIdToken(token, true);
    uid = decoded.uid;
  } catch {
    return jsonError("Your session is invalid or expired. Sign in again.", 401);
  }

  const allowedAdmins = (process.env.PRIMUS_ADMIN_UIDS || "").split(",").map((value) => value.trim()).filter(Boolean);
  if (!allowedAdmins.includes(uid)) return jsonError("This account is not authorised to view PRIMUS registrations.", 403);

  const params = req.nextUrl.searchParams;
  const rawLimit = Number(params.get("limit") || DEFAULT_PAGE_SIZE);
  if (!Number.isInteger(rawLimit) || rawLimit < 1 || rawLimit > MAX_PAGE_SIZE) return jsonError(`Page size must be between 1 and ${MAX_PAGE_SIZE}.`, 400);

  const track = params.get("track") || "";
  const status = params.get("status") || "";
  const search = (params.get("q") || "").trim().toLowerCase();
  const exportCsv = params.get("format") === "csv";
  const rawCursor = params.get("cursor");
  const cursor = decodeCursor(rawCursor);
  if (rawCursor && !cursor) return jsonError("The pagination cursor is invalid. Refresh the dashboard.", 400);
  if (cursor && ((search && cursor.mode !== "search") || (!search && cursor.mode !== "ordered"))) return jsonError("The pagination cursor does not match the current filters. Refresh the dashboard.", 400);
  if (search.length > 100) return jsonError("Search text must be 100 characters or fewer.", 400);
  if (track && !TRACKS.includes(track as (typeof TRACKS)[number])) return jsonError("Unknown track filter.", 400);
  if (status && !STATUSES.includes(status as (typeof STATUSES)[number])) return jsonError("Unknown status filter.", 400);

  try {
    const db = getFirebaseFirestore();
    let query: FirebaseFirestore.Query = db.collection("primusTeams");
    if (track) query = query.where("track", "==", track);
    if (status) query = query.where("status", "==", status);

    const countQuery = (field?: "track" | "status", value?: string) => {
      let count: FirebaseFirestore.Query = db.collection("primusTeams");
      if (field && value) count = count.where(field, "==", value);
      return count.count().get().then((result) => result.data().count);
    };

    const [totalTeams, submittedTeams, openTeams, totalParticipants, productTeams, consultingTeams, financeTeams] = await Promise.all([
      countQuery(), countQuery("status", "SUBMITTED"), countQuery("status", "OPEN"),
      db.collection("primusParticipantIndex").count().get().then((result) => result.data().count),
      countQuery("track", "Product"), countQuery("track", "Consulting"), countQuery("track", "Finance"),
    ]);

    const summary = { totalTeams, submittedTeams, openTeams, totalParticipants, byTrack: { Product: productTeams, Consulting: consultingTeams, Finance: financeTeams } };

    if (search || exportCsv) {
      const snapshot = await query.orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc").limit(MAX_SCAN_TEAMS + 1).get();
      if (snapshot.size > MAX_SCAN_TEAMS) return jsonError("This search or export exceeds the 5,000-team safety limit. Narrow the track or status filters before retrying.", 413);
      const matching = snapshot.docs
        .map((doc) => ({ ...doc.data(), code: doc.id }) as Record<string, unknown>)
        .filter((team) => !search || includesSearchTerm(team, search));

      if (exportCsv) {
        return new NextResponse(toCsv(matching), {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="primus-registrations.csv"',
            "Cache-Control": "no-store, max-age=0",
          },
        });
      }

      const offset = cursor?.mode === "search" ? cursor.offset : 0;
      const page = matching.slice(offset, offset + rawLimit);
      const nextOffset = offset + page.length;
      return NextResponse.json({
        teams: page, summary,
        pagination: { pageSize: rawLimit, totalFiltered: matching.length, hasMore: nextOffset < matching.length, nextCursor: nextOffset < matching.length ? encodeCursor({ mode: "search", offset: nextOffset }) : null },
      }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    }

    if (cursor && cursor.mode !== "ordered") return jsonError("The pagination cursor does not match the current filters.", 400);
    let pageQuery = query.orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc");
    if (cursor?.mode === "ordered") pageQuery = pageQuery.startAfter(cursor.createdAt, cursor.code);
    const snapshot = await pageQuery.limit(rawLimit + 1).get();
    const hasMore = snapshot.docs.length > rawLimit;
    const pageDocs = snapshot.docs.slice(0, rawLimit);
    const teams = pageDocs.map((doc) => ({ ...doc.data(), code: doc.id }));
    const last = pageDocs[pageDocs.length - 1];
    return NextResponse.json({
      teams, summary,
      pagination: {
        pageSize: rawLimit, totalFiltered: null, hasMore,
        nextCursor: hasMore && last ? encodeCursor({ mode: "ordered", createdAt: String(last.data().createdAt), code: last.id }) : null,
      },
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("[PRIMUS admin registrations]", error);
    return jsonError("Unable to load registrations. Please try again.", 500);
  }
}
