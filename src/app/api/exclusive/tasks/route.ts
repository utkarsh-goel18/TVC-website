import { NextRequest, NextResponse } from "next/server";
import { requireActiveMember } from "@/lib/exclusive/auth";
import {
  mutateDb,
  hasPermission,
  toPublicMemberView,
  createNotification,
  recordAuditLog,
} from "@/lib/exclusive/db";
import { generateSecureToken } from "@/lib/exclusive/crypto";
import {
  TaskAssignmentMode,
  TaskPriority,
  RandomDistributionMode,
} from "@/lib/exclusive/types";

export async function GET(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const { db, member, publicView } = auth;

  const enrichedTasks = db.tasks
    .map((task) => {
      const creator = db.members.find((m) => m.id === task.created_by);
      const dept = db.departments.find((d) => d.id === task.department_id);
      const parentTask = task.parent_task_id
        ? db.tasks.find((pt) => pt.id === task.parent_task_id)
        : null;
      const subtasks = db.tasks
        .filter((st) => st.parent_task_id === task.id)
        .map((st) => ({
          id: st.id,
          title: st.title,
          status: st.status,
          progress: st.progress,
          deadline: st.deadline,
        }));

      const assignments = db.task_assignments
        .filter((ta) => ta.task_id === task.id)
        .map((ta) => {
          const assignee = db.members.find((m) => m.id === ta.member_id);
          const reviewer = ta.reviewed_by
            ? db.members.find((m) => m.id === ta.reviewed_by)
            : null;
          return {
            ...ta,
            member_name: assignee?.name || "Member",
            member_roll: assignee?.roll_number || "",
            member_level: assignee?.level || 1,
            reviewer_name: reviewer?.name,
          };
        });

      const comments = db.task_comments
        .filter((tc) => tc.task_id === task.id)
        .map((tc) => {
          const author = db.members.find((m) => m.id === tc.member_id);
          return {
            ...tc,
            author_name: author?.name || "Member",
            author_level: author?.level || 1,
          };
        });

      const attachments = db.task_attachments.filter(
        (att) => att.task_id === task.id
      );

      const activity = db.task_activity
        .filter((act) => act.task_id === task.id)
        .map((act) => {
          const actor = db.members.find((m) => m.id === act.actor_id);
          return {
            ...act,
            actor_name: actor?.name || "Member",
          };
        })
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      return {
        ...task,
        creator_name: creator?.name || "TVC Leadership",
        creator_level: creator?.level || 3,
        department_name: dept?.name,
        department_color: dept?.accent_color,
        parent_task: parentTask
          ? {
              id: parentTask.id,
              title: parentTask.title,
              created_by: parentTask.created_by,
              status: parentTask.status,
            }
          : null,
        subtasks,
        assignments,
        comments,
        attachments,
        activity,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  // Eligible recipients for task creation by this member:
  // - Level 3 (3rd year) can assign to Level 3 (each other), Level 2 (Core & General), and Level 1
  // - Level 2 (2nd year) can assign to any Level 2 member or Core, and Level 1
  const eligibleRecipients = db.members
    .filter((m) => {
      if (m.membership_status !== "active") return false;
      if (member.level === 3) {
        return m.level === 3 || m.level === 2 || m.level === 1; // Level 3 can assign across all levels including fellow 3rd years
      }
      if (member.level === 2) {
        return m.level === 1 || m.level === 2; // Level 2 can assign to any 2nd year member/core and 1st year
      }
      return false; // Level 1 cannot create official tasks
    })
    .map((m) => {
      const activeCount = db.task_assignments.filter(
        (ta) =>
          ta.member_id === m.id &&
          !["approved", "completed", "cancelled"].includes(ta.status)
      ).length;
      return {
        ...toPublicMemberView(db, m),
        active_task_count: activeCount,
      };
    });

  return NextResponse.json({
    tasks: enrichedTasks,
    eligibleRecipients,
    canCreateTasks:
      member.level >= 2 &&
      (publicView.permissions.includes("create_level_2_tasks") ||
        publicView.permissions.includes("create_level_1_tasks")),
  });
}

export async function POST(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const { db, member } = auth;

  // Backend enforcement: Level 1 members CANNOT create official tasks!
  if (
    member.level === 1 ||
    (!hasPermission(db, member, "create_level_2_tasks") &&
      !hasPermission(db, member, "create_level_1_tasks"))
  ) {
    return NextResponse.json(
      {
        error: "FORBIDDEN",
        message: "Level 1 members cannot create official tasks.",
      },
      { status: 403 }
    );
  }

  const body = await req.json();
  const previewOnly = Boolean(body.previewOnly);

  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const instructions = String(body.instructions || "").trim();
  const expectedDeliverables = String(body.expected_deliverables || "").trim();
  const referenceLinks = Array.isArray(body.reference_links)
    ? body.reference_links.map((l: unknown) => String(l).trim()).filter(Boolean)
    : [];
  const departmentId = body.department_id ? String(body.department_id) : undefined;
  const parentTaskId = body.parent_task_id ? String(body.parent_task_id) : undefined;
  const priority: TaskPriority = ["low", "medium", "high", "critical"].includes(
    body.priority
  )
    ? body.priority
    : "medium";
  const deadline = body.deadline
    ? new Date(body.deadline).toISOString()
    : new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString();

  const assignmentMode: TaskAssignmentMode = [
    "individual",
    "multiple",
    "department",
    "everyone",
    "random",
    "open_pool",
  ].includes(body.assignment_mode)
    ? body.assignment_mode
    : "individual";

  if (!previewOnly && (!title || !description)) {
    return NextResponse.json(
      { error: "MISSING_FIELDS", message: "Task title and description are required." },
      { status: 400 }
    );
  }

  // Filter eligible members strictly by organisational authority rules:
  // - Level 3 (3rd year) can assign tasks across all levels: Level 3 (each other), Level 2, and Level 1
  // - Level 2 (2nd year - any department) can assign tasks to any member or core in Level 2, and Level 1
  const allowedRecipientLevels: number[] =
    member.level === 3 ? [1, 2, 3] : member.level === 2 ? [1, 2] : [];

  const allEligiblePool = db.members.filter(
    (m) =>
      m.membership_status === "active" &&
      allowedRecipientLevels.includes(m.level)
  );

  let selectedRecipientIds: string[] = [];
  let randomMode: RandomDistributionMode | undefined;

  if (assignmentMode === "individual" || assignmentMode === "multiple") {
    const requestedIds: string[] = Array.isArray(body.assignee_ids)
      ? body.assignee_ids.map(String)
      : body.assignee_id
      ? [String(body.assignee_id)]
      : [];

    for (const rid of requestedIds) {
      const target = db.members.find((m) => m.id === rid);
      if (!target || target.membership_status !== "active") {
        return NextResponse.json(
          { error: "INVALID_RECIPIENT", message: "Selected recipient is not an active member." },
          { status: 400 }
        );
      }
      if (!allowedRecipientLevels.includes(target.level)) {
        return NextResponse.json(
          {
            error: "AUTHORITY_VIOLATION",
            message: `Level ${member.level} cannot assign tasks to Level ${target.level}.`,
          },
          { status: 403 }
        );
      }
      selectedRecipientIds.push(target.id);
    }

    if (selectedRecipientIds.length === 0) {
      return NextResponse.json(
        { error: "NO_RECIPIENTS", message: "Select at least one eligible assignee." },
        { status: 400 }
      );
    }
  } else if (assignmentMode === "department") {
    if (!departmentId) {
      return NextResponse.json(
        { error: "MISSING_DEPARTMENT", message: "Please select a department to assign the task to." },
        { status: 400 }
      );
    }
  } else if (assignmentMode === "everyone") {
    const targetLevel = body.target_level ? Number(body.target_level) : null;
    if (targetLevel && !allowedRecipientLevels.includes(targetLevel)) {
      return NextResponse.json(
        {
          error: "AUTHORITY_VIOLATION",
          message: `You cannot assign tasks to Level ${targetLevel}.`,
        },
        { status: 403 }
      );
    }

    selectedRecipientIds = allEligiblePool
      .filter((m) => {
        if (targetLevel && m.level !== targetLevel) return false;
        if (departmentId) {
          return db.member_departments.some(
            (md) => md.member_id === m.id && md.department_id === departmentId
          );
        }
        return true;
      })
      .map((m) => m.id);

    if (selectedRecipientIds.length === 0) {
      return NextResponse.json(
        { error: "EMPTY_POOL", message: "No active eligible members matched the filter." },
        { status: 400 }
      );
    }
  } else if (assignmentMode === "random") {
    randomMode = ["pure", "balanced", "department"].includes(
      body.random_distribution_mode
    )
      ? body.random_distribution_mode
      : "balanced";

    const count = Math.max(1, Number(body.random_count) || 2);
    const targetLevel = body.target_level ? Number(body.target_level) : null;

    if (targetLevel && !allowedRecipientLevels.includes(targetLevel)) {
      return NextResponse.json(
        {
          error: "AUTHORITY_VIOLATION",
          message: `You cannot assign tasks to Level ${targetLevel}.`,
        },
        { status: 403 }
      );
    }

    let pool = allEligiblePool.filter((m) =>
      targetLevel ? m.level === targetLevel : true
    );

    if (randomMode === "department" && departmentId) {
      pool = pool.filter((m) =>
        db.member_departments.some(
          (md) => md.member_id === m.id && md.department_id === departmentId
        )
      );
    }

    if (pool.length === 0) {
      return NextResponse.json(
        {
          error: "EMPTY_RANDOM_POOL",
          message: "No eligible members match the random distribution criteria.",
        },
        { status: 400 }
      );
    }

    // Shuffle pool first
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    if (randomMode === "balanced") {
      // Sort by current active workload ascending so members with fewer active tasks are selected first
      shuffled.sort((a, b) => {
        const loadA = db.task_assignments.filter(
          (ta) =>
            ta.member_id === a.id &&
            !["approved", "completed", "cancelled"].includes(ta.status)
        ).length;
        const loadB = db.task_assignments.filter(
          (ta) =>
            ta.member_id === b.id &&
            !["approved", "completed", "cancelled"].includes(ta.status)
        ).length;
        return loadA - loadB;
      });
    }

    selectedRecipientIds = shuffled.slice(0, count).map((m) => m.id);

    if (previewOnly) {
      const previewMembers = selectedRecipientIds.map((id) => {
        const m = db.members.find((mem) => mem.id === id)!;
        const activeLoad = db.task_assignments.filter(
          (ta) =>
            ta.member_id === m.id &&
            !["approved", "completed", "cancelled"].includes(ta.status)
        ).length;
        return {
          ...toPublicMemberView(db, m),
          active_task_count: activeLoad,
        };
      });
      return NextResponse.json({
        preview: true,
        mode: randomMode,
        proposedAssignees: previewMembers,
      });
    }
  } else if (assignmentMode === "open_pool") {
    const requestedLevels: (1 | 2)[] = Array.isArray(body.eligible_levels)
      ? body.eligible_levels
          .map(Number)
          .filter((l: number): l is 1 | 2 => l === 1 || l === 2)
      : member.level === 3
      ? [2]
      : [1, 2];

    for (const lvl of requestedLevels) {
      if (!allowedRecipientLevels.includes(lvl)) {
        return NextResponse.json(
          {
            error: "AUTHORITY_VIOLATION",
            message: `Level ${member.level} cannot open task pools for Level ${lvl}.`,
          },
          { status: 403 }
        );
      }
    }
  }

  const createdTask = mutateDb((d) => {
    const now = new Date().toISOString();
    const taskId = `task-${generateSecureToken(6)}`;

    const openPoolConfig =
      assignmentMode === "open_pool"
        ? {
            eligible_levels: (Array.isArray(body.eligible_levels) &&
            body.eligible_levels.length > 0
              ? body.eligible_levels.map(Number).filter((l: number) => allowedRecipientLevels.includes(l))
              : member.level === 3
              ? [1, 2, 3]
              : [1, 2]) as (1 | 2)[],
            eligible_department_ids: Array.isArray(body.eligible_department_ids)
              ? body.eligible_department_ids.map(String)
              : departmentId
              ? [departmentId]
              : [],
            max_slots: Math.max(1, Number(body.max_slots) || 3),
            claimed_member_ids: [] as string[],
            claim_deadline: body.claim_deadline
              ? new Date(body.claim_deadline).toISOString()
              : deadline,
          }
        : assignmentMode === "department"
        ? {
            eligible_levels: [1, 2, 3] as (1 | 2)[],
            eligible_department_ids: [departmentId || ""],
            max_slots: Math.max(
              1,
              Number(body.max_slots) || (body.allow_multiple_collaborators ? 4 : 1)
            ),
            claimed_member_ids: [] as string[],
            claim_deadline: deadline,
          }
        : undefined;

    const newTask = {
      id: taskId,
      title,
      description,
      instructions,
      expected_deliverables: expectedDeliverables,
      reference_links: referenceLinks,
      created_by: member.id,
      parent_task_id: parentTaskId,
      department_id: departmentId,
      priority,
      deadline,
      assignment_mode: assignmentMode,
      random_distribution_mode: randomMode,
      open_pool_config: openPoolConfig,
      status: "pending" as const,
      progress: 0,
      created_at: now,
      updated_at: now,
    };

    d.tasks.unshift(newTask);

    // Create task assignments for selected recipients
    for (const recipientId of selectedRecipientIds) {
      d.task_assignments.push({
        id: `ta-${generateSecureToken(6)}`,
        task_id: taskId,
        member_id: recipientId,
        status: "pending",
        progress: 0,
        submission_links: [],
      });

      createNotification(d, {
        recipient_id: recipientId,
        type: "task_assigned",
        title: `New Task Assigned: ${title}`,
        body: `${member.name} assigned you "${title}" (${priority.toUpperCase()} priority).`,
        reference_type: "task",
        reference_id: taskId,
        deep_link: `/members?module=tasks&task=${taskId}`,
      });
    }

    // Attachments if provided
    if (Array.isArray(body.attachments)) {
      for (const att of body.attachments) {
        if (att && att.file_name && att.file_path) {
          d.task_attachments.push({
            id: `att-${generateSecureToken(6)}`,
            task_id: taskId,
            uploaded_by: member.id,
            file_name: String(att.file_name),
            file_path: String(att.file_path),
            created_at: now,
          });
        }
      }
    }

    d.task_activity.unshift({
      id: `tact-${generateSecureToken(6)}`,
      task_id: taskId,
      actor_id: member.id,
      action: parentTaskId ? "SUBTASK_CREATED" : "TASK_CREATED",
      metadata: {
        assignment_mode: assignmentMode,
        assignee_count: selectedRecipientIds.length,
        parent_task_id: parentTaskId,
      },
      created_at: now,
    });

    recordAuditLog(d, {
      actor_id: member.id,
      action: parentTaskId ? "SUBTASK_CREATED" : "TASK_CREATED",
      target_type: "task",
      target_id: taskId,
      summary: `${member.name} created ${parentTaskId ? "subtask" : "task"} "${title}" (${assignmentMode}).`,
      metadata: { assignment_mode: assignmentMode, assignees: selectedRecipientIds },
    });

    return newTask;
  });

  return NextResponse.json({
    success: true,
    task: createdTask,
    message: `Task "${createdTask.title}" created successfully.`,
  });
}

