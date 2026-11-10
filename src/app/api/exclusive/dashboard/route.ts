import { NextRequest, NextResponse } from "next/server";
import { requireActiveMember } from "@/lib/exclusive/auth";
import { canAccessConversation, toPublicMemberView } from "@/lib/exclusive/db";

export async function GET(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const { db, member, publicView } = auth;

  const myAssignments = db.task_assignments.filter(
    (ta) => ta.member_id === member.id
  );
  const myTaskIds = new Set(myAssignments.map((ta) => ta.task_id));

  const assignedTasks = db.tasks
    .filter((t) => myTaskIds.has(t.id))
    .map((t) => {
      const assignment = myAssignments.find((a) => a.task_id === t.id)!;
      const creator = db.members.find((m) => m.id === t.created_by);
      const dept = db.departments.find((d) => d.id === t.department_id);
      return {
        ...t,
        my_assignment: assignment,
        creator_name: creator?.name || "TVC Leadership",
        department_name: dept?.name,
      };
    });

  // Tasks created by this member or in their hierarchy that are submitted & awaiting review
  const tasksRequiringReview = db.tasks
    .filter((t) => {
      const isCreator = t.created_by === member.id;
      const parentTask = t.parent_task_id
        ? db.tasks.find((pt) => pt.id === t.parent_task_id)
        : null;
      const isParentCreator = parentTask?.created_by === member.id;
      const hasSubmittedAssignment = db.task_assignments.some(
        (ta) =>
          ta.task_id === t.id &&
          (ta.status === "submitted" || ta.status === "under_review")
      );
      return (isCreator || isParentCreator) && hasSubmittedAssignment;
    })
    .map((t) => {
      const creator = db.members.find((m) => m.id === t.created_by);
      const dept = db.departments.find((d) => d.id === t.department_id);
      const assignments = db.task_assignments
        .filter((ta) => ta.task_id === t.id)
        .map((ta) => ({
          ...ta,
          member_name:
            db.members.find((m) => m.id === ta.member_id)?.name || "Member",
        }));
      return {
        ...t,
        creator_name: creator?.name || "TVC",
        department_name: dept?.name,
        assignments,
      };
    });

  // Count unread messages in accessible conversations
  const accessibleConvs = db.conversations.filter((c) =>
    canAccessConversation(db, member, c.id)
  );
  const accessibleConvIds = new Set(accessibleConvs.map((c) => c.id));
  const unreadMessagesCount = db.messages.filter(
    (m) =>
      accessibleConvIds.has(m.conversation_id) &&
      m.sender_id !== member.id &&
      !m.read_by.includes(member.id)
  ).length;

  const unreadNotificationsCount = db.notifications.filter(
    (n) => n.recipient_id === member.id && !n.is_read
  ).length;

  // Announcements
  const announcements = db.messages
    .filter((m) => m.conversation_id === "conv-announcements")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5)
    .map((m) => {
      const sender = db.members.find((mem) => mem.id === m.sender_id);
      const senderView = sender ? toPublicMemberView(db, sender) : null;
      return {
        ...m,
        sender_name: senderView?.name || "TVC Leadership",
        sender_position: senderView?.position_name || "Executive Board",
      };
    });

  // Recent Activity respecting access permissions
  const recentActivity = db.task_activity
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 8)
    .map((act) => {
      const actor = db.members.find((m) => m.id === act.actor_id);
      const task = db.tasks.find((t) => t.id === act.task_id);
      return {
        id: act.id,
        action: act.action,
        actor_name: actor?.name || "Member",
        task_title: task?.title || "Task",
        task_id: act.task_id,
        created_at: act.created_at,
        metadata: act.metadata,
      };
    });

  // Pending applications count for quick action badge
  const pendingApplicationsCount = db.membership_applications.filter((app) => {
    if (app.status !== "pending") return false;
    if (
      app.requested_level === 2 &&
      publicView.permissions.includes("approve_level_2_applications")
    ) {
      return true;
    }
    if (
      app.requested_level === 1 &&
      (publicView.permissions.includes("approve_level_1_applications") ||
        publicView.permissions.includes("approve_level_2_applications"))
    ) {
      return true;
    }
    return false;
  }).length;

  return NextResponse.json({
    member: publicView,
    metrics: {
      assignedTasks: assignedTasks.length,
      pendingTasks: assignedTasks.filter((t) =>
        ["pending", "accepted", "in_progress", "revision_requested"].includes(
          t.my_assignment.status
        )
      ).length,
      completedTasks: assignedTasks.filter((t) =>
        ["approved", "completed"].includes(t.my_assignment.status)
      ).length,
      unreadMessages: unreadMessagesCount,
      unreadNotifications: unreadNotificationsCount,
      pendingApplications: pendingApplicationsCount,
      tasksRequiringReview: tasksRequiringReview.length,
    },
    myTasks: {
      active: assignedTasks.filter(
        (t) => !["approved", "completed", "cancelled"].includes(t.my_assignment.status)
      ),
      completed: assignedTasks.filter((t) =>
        ["approved", "completed"].includes(t.my_assignment.status)
      ),
      requiringReview: tasksRequiringReview,
    },
    announcements,
    recentActivity,
  });
}

