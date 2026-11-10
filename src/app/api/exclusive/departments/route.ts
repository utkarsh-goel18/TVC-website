import { NextRequest, NextResponse } from "next/server";
import { requireActiveMember, requirePermission } from "@/lib/exclusive/auth";
import {
  mutateDb,
  toPublicMemberView,
  createNotification,
  recordAuditLog,
} from "@/lib/exclusive/db";

export async function GET(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const { db } = auth;

  const departments = db.departments.map((dept) => {
    const memberLinks = db.member_departments.filter(
      (md) => md.department_id === dept.id
    );
    const deptMembers = memberLinks
      .map((md) => db.members.find((m) => m.id === md.member_id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m && m.membership_status === "active"))
      .map((m) => toPublicMemberView(db, m))
      .sort((a, b) => b.level - a.level);

    const deptTasks = db.tasks.filter((t) => t.department_id === dept.id);

    return {
      ...dept,
      memberCount: deptMembers.length,
      members: deptMembers,
      activeTaskCount: deptTasks.filter(
        (t) => !["completed", "approved", "cancelled"].includes(t.status)
      ).length,
      conversationId: `conv-${dept.id}`,
    };
  });

  return NextResponse.json({ departments });
}

export async function POST(req: NextRequest) {
  const auth = requirePermission(req, "manage_departments");
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const action = String(body.action || ""); // "add_member" | "remove_member"
  const departmentId = String(body.departmentId || "");
  const memberId = String(body.memberId || "");

  if (!departmentId || !memberId) {
    return NextResponse.json(
      { error: "MISSING_FIELDS", message: "departmentId and memberId are required." },
      { status: 400 }
    );
  }

  const result = mutateDb((db) => {
    const dept = db.departments.find((d) => d.id === departmentId);
    const targetMember = db.members.find((m) => m.id === memberId);

    if (!dept || !targetMember) {
      return { error: "NOT_FOUND", message: "Department or member not found." };
    }

    if (action === "add_member") {
      const exists = db.member_departments.some(
        (md) => md.department_id === departmentId && md.member_id === memberId
      );
      if (!exists) {
        db.member_departments.push({
          member_id: memberId,
          department_id: departmentId,
          assigned_by: auth.member.id,
          assigned_at: new Date().toISOString(),
        });

        createNotification(db, {
          recipient_id: memberId,
          type: "department_change",
          title: `Added to ${dept.name} Department`,
          body: `${auth.member.name} added you to the ${dept.name} department and community channel.`,
          reference_type: "department",
          reference_id: dept.id,
          deep_link: `/members?module=departments&dept=${dept.id}`,
        });

        recordAuditLog(db, {
          actor_id: auth.member.id,
          action: "DEPARTMENT_MEMBER_ADDED",
          target_type: "department",
          target_id: dept.id,
          summary: `Added ${targetMember.name} (${targetMember.roll_number}) to ${dept.name} department.`,
          metadata: { member_id: memberId, department_id: departmentId },
        });
      }
      return { success: true, message: `Added ${targetMember.name} to ${dept.name}.` };
    }

    if (action === "remove_member") {
      db.member_departments = db.member_departments.filter(
        (md) => !(md.department_id === departmentId && md.member_id === memberId)
      );

      createNotification(db, {
        recipient_id: memberId,
        type: "department_change",
        title: `Removed from ${dept.name} Department`,
        body: `Your membership in the ${dept.name} department was updated by ${auth.member.name}.`,
        reference_type: "department",
        reference_id: dept.id,
        deep_link: "/members?module=departments",
      });

      recordAuditLog(db, {
        actor_id: auth.member.id,
        action: "DEPARTMENT_MEMBER_REMOVED",
        target_type: "department",
        target_id: dept.id,
        summary: `Removed ${targetMember.name} (${targetMember.roll_number}) from ${dept.name} department.`,
        metadata: { member_id: memberId, department_id: departmentId },
      });

      return { success: true, message: `Removed ${targetMember.name} from ${dept.name}.` };
    }

    return { error: "INVALID_ACTION", message: "Unsupported action." };
  });

  if ("error" in result) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest) {
  const auth = requirePermission(req, "manage_departments");
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const departmentId = String(body.departmentId || "");
  const description = String(body.description || "").trim();

  if (!departmentId || !description) {
    return NextResponse.json(
      { error: "MISSING_FIELDS", message: "departmentId and description are required." },
      { status: 400 }
    );
  }

  mutateDb((db) => {
    const dept = db.departments.find((d) => d.id === departmentId);
    if (dept) {
      dept.description = description;
      const conv = db.conversations.find((c) => c.id === `conv-${dept.id}`);
      if (conv) conv.subtitle = description;
      recordAuditLog(db, {
        actor_id: auth.member.id,
        action: "DEPARTMENT_UPDATED",
        target_type: "department",
        target_id: dept.id,
        summary: `Updated description for ${dept.name} department.`,
      });
    }
  });

  return NextResponse.json({
    success: true,
    message: "Department details updated.",
  });
}

