import { NextRequest, NextResponse } from "next/server";
import { requireActiveMember } from "@/lib/exclusive/auth";
import { toPublicMemberView } from "@/lib/exclusive/db";

export async function GET(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const { db } = auth;
  const search = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  const levelFilter = req.nextUrl.searchParams.get("level");
  const deptFilter = req.nextUrl.searchParams.get("department");
  const positionFilter = req.nextUrl.searchParams.get("position");
  const includeInactive = req.nextUrl.searchParams.get("includeInactive") === "true";

  const canViewInactive =
    includeInactive &&
    auth.publicView.permissions.includes("manage_members");

  const directory = db.members
    .filter((m) => (canViewInactive ? true : m.membership_status === "active"))
    .map((m) => toPublicMemberView(db, m))
    .filter((m) => {
      if (levelFilter && levelFilter !== "all" && String(m.level) !== levelFilter) {
        return false;
      }
      if (
        deptFilter &&
        deptFilter !== "all" &&
        !m.departments.some(
          (d) => d.id === deptFilter || d.slug === deptFilter || d.name.toLowerCase() === deptFilter.toLowerCase()
        )
      ) {
        return false;
      }
      if (
        positionFilter &&
        positionFilter !== "all" &&
        m.position_slug !== positionFilter &&
        m.position_id !== positionFilter
      ) {
        return false;
      }
      if (search) {
        const hay = [
          m.name,
          m.roll_number,
          m.position_name,
          `level ${m.level}`,
          ...m.departments.map((d) => d.name),
          ...m.skills,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return a.name.localeCompare(b.name);
    });

  return NextResponse.json({
    members: directory,
    departments: db.departments,
    positions: db.positions.filter((p) => p.is_active),
  });
}

