import { NextRequest, NextResponse } from "next/server";
import { requireActiveMember } from "@/lib/exclusive/auth";
import { mutateDb, toPublicMemberView } from "@/lib/exclusive/db";

export async function GET(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const { db, member, publicView } = auth;
  const assignments = db.task_assignments
    .filter((ta) => ta.member_id === member.id)
    .map((ta) => {
      const task = db.tasks.find((t) => t.id === ta.task_id);
      const dept = db.departments.find((d) => d.id === task?.department_id);
      return {
        ...ta,
        task_title: task?.title || "Task",
        task_priority: task?.priority || "medium",
        task_deadline: task?.deadline || "",
        department_name: dept?.name,
      };
    });

  return NextResponse.json({
    profile: publicView,
    activeTasks: assignments.filter(
      (a) => !["approved", "completed", "cancelled"].includes(a.status)
    ),
    completedTasks: assignments.filter((a) =>
      ["approved", "completed"].includes(a.status)
    ),
  });
}

export async function PATCH(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();

  // Security rule: Members CANNOT change their own level, official position, membership status, or department assignments here.
  const updatedView = mutateDb((db) => {
    const target = db.members.find((m) => m.id === auth.member.id)!;

    if (typeof body.phone === "string") {
      target.phone = body.phone.trim().slice(0, 30);
    }
    if (typeof body.bio === "string") {
      target.bio = body.bio.trim().slice(0, 500);
    }
    if (Array.isArray(body.skills)) {
      target.skills = body.skills
        .map((s: unknown) => String(s).trim())
        .filter(Boolean)
        .slice(0, 20);
    }
    if (Array.isArray(body.interests)) {
      target.interests = body.interests
        .map((s: unknown) => String(s).trim())
        .filter(Boolean)
        .slice(0, 20);
    }
    if (typeof body.linkedin === "string") {
      target.linkedin = body.linkedin.trim().slice(0, 200);
    }
    if (typeof body.profile_image === "string") {
      target.profile_image = body.profile_image.trim();
    }
    target.updated_at = new Date().toISOString();

    return toPublicMemberView(db, target);
  });

  return NextResponse.json({
    success: true,
    profile: updatedView,
    message: "Profile updated successfully.",
  });
}

