import { NextRequest, NextResponse } from "next/server";
import { requireActiveMember } from "@/lib/exclusive/auth";
import {
  mutateDb,
  createNotification,
  recordAuditLog,
} from "@/lib/exclusive/db";
import { generateSecureToken } from "@/lib/exclusive/crypto";
import { TaskStatus } from "@/lib/exclusive/types";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const { id: taskId } = await context.params;
  const body = await req.json();
  const action = String(body.action || "");

  const outcome = mutateDb((db) => {
    const task = db.tasks.find((t) => t.id === taskId);
    if (!task) {
      return { status: 404, payload: { error: "NOT_FOUND", message: "Task not found." } };
    }

    const now = new Date().toISOString();
    const myAssignment = db.task_assignments.find(
      (ta) => ta.task_id === task.id && ta.member_id === auth.member.id
    );

    const parentTask = task.parent_task_id
      ? db.tasks.find((pt) => pt.id === task.parent_task_id)
      : null;

    const isCreatorOrSupervisor =
      task.created_by === auth.member.id ||
      parentTask?.created_by === auth.member.id ||
      auth.member.level === 3;

    // 1. CLAIM OPEN TASK POOL OR DEPARTMENT TASK SLOT (Atomic slot reservation)
    if (action === "claim") {
      if (
        (task.assignment_mode !== "open_pool" &&
          (task.assignment_mode as string) !== "department") ||
        !task.open_pool_config
      ) {
        return {
          status: 400,
          payload: {
            error: "NOT_OPEN_POOL",
            message: "This task is not an open pool or department claimable task.",
          },
        };
      }

      const pool = task.open_pool_config;
      if (new Date(pool.claim_deadline).getTime() < Date.now()) {
        return {
          status: 400,
          payload: { error: "CLAIM_EXPIRED", message: "The claim deadline for this open pool has passed." },
        };
      }

      if (
        task.assignment_mode !== "department" &&
        !pool.eligible_levels.includes(auth.member.level as 1 | 2 | 3)
      ) {
        return {
          status: 403,
          payload: {
            error: "LEVEL_INELIGIBLE",
            message: `This open task pool is restricted to Level ${pool.eligible_levels.join(", ")}.`,
          },
        };
      }

      if (pool.eligible_department_ids.length > 0) {
        const myDeptIds = db.member_departments
          .filter((md) => md.member_id === auth.member.id)
          .map((md) => md.department_id);
        const hasEligibleDept =
          auth.member.level === 3 ||
          pool.eligible_department_ids.some((id) => myDeptIds.includes(id));
        if (!hasEligibleDept) {
          return {
            status: 403,
            payload: {
              error: "DEPARTMENT_INELIGIBLE",
              message: "You do not belong to an eligible department for this task pool.",
            },
          };
        }
      }

      if (pool.claimed_member_ids.includes(auth.member.id) || myAssignment) {
        return {
          status: 409,
          payload: { error: "ALREADY_CLAIMED", message: "You have already claimed a slot on this task." },
        };
      }

      // Atomic slot check: prevent two members from claiming the final slot
      if (pool.claimed_member_ids.length >= pool.max_slots) {
        return {
          status: 409,
          payload: { error: "POOL_FULL", message: "All available slots on this task have been claimed." },
        };
      }

      pool.claimed_member_ids.push(auth.member.id);
      db.task_assignments.push({
        id: `ta-${generateSecureToken(6)}`,
        task_id: task.id,
        member_id: auth.member.id,
        status: "accepted",
        progress: 10,
        submission_links: [],
        accepted_at: now,
      });

      if (task.status === "pending") {
        task.status = "in_progress";
      }
      task.updated_at = now;

      db.task_activity.unshift({
        id: `tact-${generateSecureToken(6)}`,
        task_id: task.id,
        actor_id: auth.member.id,
        action: "POOL_SLOT_CLAIMED",
        metadata: {
          slots_used: pool.claimed_member_ids.length,
          max_slots: pool.max_slots,
        },
        created_at: now,
      });

      createNotification(db, {
        recipient_id: task.created_by,
        type: "task_claimed",
        title: `Open Task Claimed: ${task.title}`,
        body: `${auth.member.name} claimed slot ${pool.claimed_member_ids.length}/${pool.max_slots} on "${task.title}".`,
        reference_type: "task",
        reference_id: task.id,
        deep_link: `/members?module=tasks&task=${task.id}`,
      });

      return {
        status: 200,
        payload: {
          success: true,
          message: `Slot claimed (${pool.claimed_member_ids.length}/${pool.max_slots})! Task added to your active queue.`,
        },
      };
    }

    // 2. ASSIGNEE PROGRESS & SUBMISSION ACTIONS
    if (action === "accept" || action === "start" || action === "update_progress" || action === "submit") {
      if (!myAssignment) {
        return {
          status: 403,
          payload: { error: "NOT_ASSIGNED", message: "You are not assigned to this task." },
        };
      }

      if (action === "accept") {
        myAssignment.status = "accepted";
        myAssignment.accepted_at = now;
        myAssignment.progress = Math.max(myAssignment.progress, 10);
        if (task.status === "pending") task.status = "accepted";
      } else if (action === "start") {
        myAssignment.status = "in_progress";
        myAssignment.accepted_at = myAssignment.accepted_at || now;
        myAssignment.progress = Math.max(myAssignment.progress, 25);
        task.status = "in_progress";
      } else if (action === "update_progress") {
        const nextProgress = Math.min(100, Math.max(0, Number(body.progress) || 0));
        myAssignment.progress = nextProgress;
        myAssignment.status = nextProgress > 0 ? "in_progress" : myAssignment.status;
        task.status = "in_progress";
      } else if (action === "submit") {
        myAssignment.status = "submitted";
        myAssignment.progress = 100;
        myAssignment.submitted_at = now;
        myAssignment.submission_notes = String(body.submission_notes || "").trim();
        if (Array.isArray(body.submission_links)) {
          myAssignment.submission_links = body.submission_links
            .map((l: unknown) => String(l).trim())
            .filter(Boolean);
        }
        task.status = "submitted";

        createNotification(db, {
          recipient_id: task.created_by,
          type: "task_submitted",
          title: `Task Submitted: ${task.title}`,
          body: `${auth.member.name} submitted deliverables for "${task.title}".`,
          reference_type: "task",
          reference_id: task.id,
          deep_link: `/members?module=tasks&task=${task.id}`,
        });

        if (parentTask && parentTask.created_by !== task.created_by) {
          createNotification(db, {
            recipient_id: parentTask.created_by,
            type: "task_submitted",
            title: `Subtask Submitted in Hierarchy: ${task.title}`,
            body: `${auth.member.name} submitted subtask "${task.title}" under "${parentTask.title}".`,
            reference_type: "task",
            reference_id: task.id,
            deep_link: `/members?module=tasks&task=${task.id}`,
          });
        }
      }

      // Recalculate aggregate task progress
      const allTaskAssignments = db.task_assignments.filter(
        (ta) => ta.task_id === task.id
      );
      if (allTaskAssignments.length > 0) {
        const avg = Math.round(
          allTaskAssignments.reduce((acc, item) => acc + item.progress, 0) /
            allTaskAssignments.length
        );
        task.progress = avg;
      }
      task.updated_at = now;

      db.task_activity.unshift({
        id: `tact-${generateSecureToken(6)}`,
        task_id: task.id,
        actor_id: auth.member.id,
        action: `ASSIGNEE_${action.toUpperCase()}`,
        metadata: { progress: myAssignment.progress, status: myAssignment.status },
        created_at: now,
      });

      return {
        status: 200,
        payload: {
          success: true,
          message:
            action === "submit"
              ? "Deliverables submitted for review!"
              : "Task progress updated.",
        },
      };
    }

    // 3. CREATOR / SUPERVISOR REVIEW ACTIONS (under_review, approve, request_revision, reject, complete, cancel)
    if (
      ["under_review", "approve", "request_revision", "reject", "complete", "cancel"].includes(
        action
      )
    ) {
      if (!isCreatorOrSupervisor) {
        return {
          status: 403,
          payload: {
            error: "FORBIDDEN",
            message: "Only the task creator or parent hierarchy supervisor can review this task.",
          },
        };
      }

      const targetMemberId = body.member_id ? String(body.member_id) : undefined;
      const feedback = String(body.feedback || "").trim();

      const targetAssignments = db.task_assignments.filter(
        (ta) =>
          ta.task_id === task.id &&
          (targetMemberId ? ta.member_id === targetMemberId : true)
      );

      const statusMap: Record<string, TaskStatus> = {
        under_review: "under_review",
        approve: "approved",
        request_revision: "revision_requested",
        reject: "rejected",
        complete: "completed",
        cancel: "cancelled",
      };
      const nextStatus = statusMap[action];

      for (const ta of targetAssignments) {
        ta.status = nextStatus;
        ta.reviewed_at = now;
        ta.reviewed_by = auth.member.id;
        if (feedback) ta.review_feedback = feedback;
        if (nextStatus === "approved" || nextStatus === "completed") {
          ta.progress = 100;
        } else if (nextStatus === "revision_requested") {
          ta.progress = 70;
        }

        if (nextStatus === "approved" || nextStatus === "completed") {
          createNotification(db, {
            recipient_id: ta.member_id,
            type: "task_approved",
            title: `Task Approved: ${task.title}`,
            body: `${auth.member.name} approved your submission on "${task.title}".`,
            reference_type: "task",
            reference_id: task.id,
            deep_link: `/members?module=tasks&task=${task.id}`,
          });
        } else if (nextStatus === "revision_requested") {
          createNotification(db, {
            recipient_id: ta.member_id,
            type: "revision_requested",
            title: `Revision Requested: ${task.title}`,
            body: feedback || `${auth.member.name} requested revisions on "${task.title}".`,
            reference_type: "task",
            reference_id: task.id,
            deep_link: `/members?module=tasks&task=${task.id}`,
          });
        }
      }

      task.status = nextStatus;
      if (nextStatus === "approved" || nextStatus === "completed") {
        task.progress = 100;
      }
      task.updated_at = now;

      db.task_activity.unshift({
        id: `tact-${generateSecureToken(6)}`,
        task_id: task.id,
        actor_id: auth.member.id,
        action: `REVIEW_${action.toUpperCase()}`,
        metadata: { feedback, target_member_id: targetMemberId },
        created_at: now,
      });

      recordAuditLog(db, {
        actor_id: auth.member.id,
        action: `TASK_${action.toUpperCase()}`,
        target_type: "task",
        target_id: task.id,
        summary: `${auth.member.name} marked task "${task.title}" as ${nextStatus}.`,
        metadata: { feedback },
      });

      return {
        status: 200,
        payload: {
          success: true,
          message: `Task updated to '${nextStatus.replace("_", " ")}'.`,
        },
      };
    }

    // 4. ADD COMMENT
    if (action === "comment") {
      const content = String(body.content || "").trim();
      if (!content) {
        return {
          status: 400,
          payload: { error: "EMPTY_COMMENT", message: "Comment cannot be empty." },
        };
      }

      db.task_comments.push({
        id: `tc-${generateSecureToken(6)}`,
        task_id: task.id,
        member_id: auth.member.id,
        content,
        created_at: now,
      });

      db.task_activity.unshift({
        id: `tact-${generateSecureToken(6)}`,
        task_id: task.id,
        actor_id: auth.member.id,
        action: "COMMENT_ADDED",
        metadata: { preview: content.slice(0, 80) },
        created_at: now,
      });

      return {
        status: 200,
        payload: { success: true, message: "Comment posted." },
      };
    }

    return {
      status: 400,
      payload: { error: "INVALID_ACTION", message: "Unsupported task action." },
    };
  });

  return NextResponse.json(outcome.payload, { status: outcome.status });
}

