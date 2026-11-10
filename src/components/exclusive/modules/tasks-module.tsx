"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Shuffle,
  Layers,
  CheckCircle2,
  Clock,
  Send,
  GitBranch,
  ExternalLink,
  X,
  Eye,
  Award,
} from "lucide-react";
import {
  PublicMemberView,
  DepartmentRecord,
  TaskAssignmentMode,
  RandomDistributionMode,
  TaskPriority,
} from "@/lib/exclusive/types";

interface TasksModuleProps {
  member: PublicMemberView;
  initialTaskId?: string | null;
  initialCreateOpen?: boolean;
}

interface EnrichedTask {
  id: string;
  title: string;
  description: string;
  instructions: string;
  expected_deliverables: string;
  reference_links: string[];
  created_by: string;
  creator_name: string;
  creator_level: number;
  parent_task_id?: string;
  parent_task?: { id: string; title: string; created_by: string; status: string } | null;
  subtasks: Array<{ id: string; title: string; status: string; progress: number; deadline: string }>;
  department_id?: string;
  department_name?: string;
  priority: TaskPriority;
  deadline: string;
  assignment_mode: TaskAssignmentMode;
  random_distribution_mode?: RandomDistributionMode;
  open_pool_config?: {
    eligible_levels: number[];
    eligible_department_ids: string[];
    max_slots: number;
    claimed_member_ids: string[];
    claim_deadline: string;
  };
  status: string;
  progress: number;
  created_at: string;
  assignments: Array<{
    id: string;
    member_id: string;
    member_name: string;
    member_roll: string;
    member_level: number;
    status: string;
    progress: number;
    submission_notes?: string;
    submission_links: string[];
    review_feedback?: string;
    reviewer_name?: string;
  }>;
  comments: Array<{
    id: string;
    member_id: string;
    author_name: string;
    author_level: number;
    content: string;
    created_at: string;
  }>;
  activity: Array<{
    id: string;
    actor_name: string;
    action: string;
    metadata: Record<string, unknown>;
    created_at: string;
  }>;
}

export function TasksModule({
  member,
  initialTaskId,
  initialCreateOpen,
}: TasksModuleProps) {
  const [tasks, setTasks] = useState<EnrichedTask[]>([]);
  const [eligibleRecipients, setEligibleRecipients] = useState<
    Array<PublicMemberView & { active_task_count: number }>
  >([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [canCreateTasks, setCanCreateTasks] = useState(false);
  const [loading, setLoading] = useState(true);

  const [filterTab, setFilterTab] = useState<
    "all" | "mine" | "created" | "open_pool" | "cascading"
  >("all");
  const [selectedTask, setSelectedTask] = useState<EnrichedTask | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(Boolean(initialCreateOpen));
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Create Task Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [refLinks, setRefLinks] = useState("");
  const [deptId, setDeptId] = useState("");
  const [parentTaskId, setParentTaskId] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("high");
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().slice(0, 10)
  );
  const [assignmentMode, setAssignmentMode] =
    useState<TaskAssignmentMode>("individual");
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [targetLevel, setTargetLevel] = useState<string>("");
  const [randomMode, setRandomMode] =
    useState<RandomDistributionMode>("balanced");
  const [randomCount, setRandomCount] = useState<number>(2);
  const [randomPreview, setRandomPreview] = useState<
    Array<PublicMemberView & { active_task_count: number }> | null
  >(null);
  const [poolMaxSlots, setPoolMaxSlots] = useState<number>(3);
  const [poolLevels, setPoolLevels] = useState<number[]>(
    member.level === 3 ? [2] : [1, 2]
  );
  const [deptCollabMode, setDeptCollabMode] = useState<"single" | "multiple">("single");
  const [deptMaxSlots, setDeptMaxSlots] = useState<number>(3);

  // Detail Drawer State
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submissionLinks, setSubmissionLinks] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [newComment, setNewComment] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, deptsRes] = await Promise.all([
        fetch("/api/exclusive/tasks"),
        fetch("/api/exclusive/departments"),
      ]);
      const tasksJson = await tasksRes.json();
      const deptsJson = await deptsRes.json();

      if (tasksJson.tasks) {
        setTasks(tasksJson.tasks);
        setEligibleRecipients(tasksJson.eligibleRecipients || []);
        setCanCreateTasks(Boolean(tasksJson.canCreateTasks));

        if (selectedTask) {
          const updated = tasksJson.tasks.find(
            (t: EnrichedTask) => t.id === selectedTask.id
          );
          if (updated) setSelectedTask(updated);
        } else if (initialTaskId) {
          const found = tasksJson.tasks.find(
            (t: EnrichedTask) => t.id === initialTaskId
          );
          if (found) setSelectedTask(found);
        }
      }
      if (deptsJson.departments) {
        setDepartments(deptsJson.departments);
      }
    } finally {
      setLoading(false);
    }
  }, [initialTaskId, selectedTask]);

  useEffect(() => {
    loadTasks();
  }, []);

  const handlePreviewRandom = async () => {
    setFeedbackBanner(null);
    const res = await fetch("/api/exclusive/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        previewOnly: true,
        assignment_mode: "random",
        random_distribution_mode: randomMode,
        random_count: randomCount,
        department_id: deptId || undefined,
        target_level: targetLevel ? Number(targetLevel) : undefined,
      }),
    });
    const data = await res.json();
    if (res.ok && data.proposedAssignees) {
      setRandomPreview(data.proposedAssignees);
    } else {
      setFeedbackBanner(data.message || "Unable to preview random distribution.");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackBanner(null);

    const assigneeIdsToSend =
      assignmentMode === "random" && randomPreview
        ? randomPreview.map((p) => p.id)
        : selectedAssigneeIds;

    const finalMode =
      assignmentMode === "random" && randomPreview
        ? "multiple"
        : assignmentMode;

    const res = await fetch("/api/exclusive/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        instructions,
        expected_deliverables: deliverables,
        reference_links: refLinks
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        department_id: deptId || undefined,
        parent_task_id: parentTaskId || undefined,
        priority,
        deadline,
        assignment_mode: finalMode,
        assignee_ids: assigneeIdsToSend,
        target_level: targetLevel ? Number(targetLevel) : undefined,
        random_distribution_mode: randomMode,
        random_count: randomCount,
        max_slots:
          finalMode === "department"
            ? deptCollabMode === "multiple"
              ? deptMaxSlots
              : 1
            : poolMaxSlots,
        allow_multiple_collaborators:
          finalMode === "department" && deptCollabMode === "multiple",
        eligible_levels: poolLevels,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setFeedbackBanner(data.message || "Error creating task.");
      return;
    }

    setFeedbackBanner(data.message);
    setCreateModalOpen(false);
    setTitle("");
    setDescription("");
    setInstructions("");
    setDeliverables("");
    setRefLinks("");
    setParentTaskId("");
    setSelectedAssigneeIds([]);
    setRandomPreview(null);
    await loadTasks();
  };

  const handleTaskAction = async (
    taskId: string,
    action: string,
    extra: Record<string, unknown> = {}
  ) => {
    setFeedbackBanner(null);
    const res = await fetch(`/api/exclusive/tasks/${taskId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const data = await res.json();
    if (data.message) setFeedbackBanner(data.message);
    await loadTasks();
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterTab === "mine") {
      return t.assignments.some((a) => a.member_id === member.id);
    }
    if (filterTab === "created") {
      return (
        t.created_by === member.id ||
        t.parent_task?.created_by === member.id
      );
    }
    if (filterTab === "open_pool") {
      return t.assignment_mode === "open_pool";
    }
    if (filterTab === "cascading") {
      return Boolean(t.parent_task_id || t.subtasks.length > 0);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-[#131312] p-6">
        <div>
          <span className="font-mono text-[10px] tracking-[0.2em] text-[#f5ed00] uppercase">
            TVC TASK DELEGATION &amp; HIERARCHY ENGINE
          </span>
          <h1 className="mt-1 text-2xl font-semibold text-white">
            Task Management
          </h1>
          <p className="mt-1 text-xs text-[#9e9d99]">
            {member.level === 3
              ? "Level 3 Authority: Create tasks for Level 2, configure random distributions & open pools, and monitor cascading Level 1 subtasks."
              : member.level === 2
              ? "Level 2 Authority: Create tasks & subtasks for Level 1 and Level 2, review submissions, and complete Executive deliverables."
              : "Level 1 Member: Receive assigned tasks, claim eligible Open Task Pool slots, update progress, and submit work."}
          </p>
        </div>

        {canCreateTasks && (
          <button
            type="button"
            onClick={() => {
              setParentTaskId("");
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-[#f5ed00] px-5 py-3 font-mono text-xs font-bold tracking-wider text-black uppercase hover:bg-[#ded700]"
          >
            <Plus className="h-4 w-4" /> Create Official Task
          </button>
        )}
      </div>

      {feedbackBanner && (
        <div className="flex items-center justify-between border border-[#f5ed00]/40 bg-[#f5ed00]/10 px-4 py-3 text-xs text-[#f5ed00]">
          <span>{feedbackBanner}</span>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="font-mono uppercase hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {[
          { id: "all", label: "All Tasks" },
          { id: "mine", label: "Assigned to Me" },
          { id: "created", label: "Created / Supervised" },
          { id: "open_pool", label: "Open Task Pool" },
          { id: "cascading", label: "Cascading Hierarchy" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id as typeof filterTab)}
            className={`px-4 py-2 font-mono text-xs uppercase transition-colors ${
              filterTab === tab.id
                ? "bg-[#f5ed00] font-bold text-black"
                : "border border-white/10 bg-[#131312] text-[#9e9d99] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Layout: Task Cards & Selected Task Detail */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Task List */}
        <div className="space-y-3 lg:col-span-5">
          {loading ? (
            <div className="border border-white/10 bg-[#131312] p-8 text-center font-mono text-xs text-[#9e9d99]">
              LOADING TASKS...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="border border-dashed border-white/15 bg-[#131312] p-8 text-center text-xs text-[#9e9d99]">
              No tasks match the current filter.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`cursor-pointer border p-4 transition-all ${
                    isSelected
                      ? "border-[#f5ed00] bg-[#191916]"
                      : "border-white/10 bg-[#131312] hover:border-white/30"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="border border-[#f5ed00]/40 bg-[#f5ed00]/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#f5ed00] uppercase">
                        {task.priority}
                      </span>
                      <span className="border border-white/15 px-2 py-0.5 font-mono text-[10px] text-[#9e9d99] uppercase">
                        {task.assignment_mode.replace("_", " ")}
                      </span>
                      {task.parent_task_id && (
                        <span className="inline-flex items-center gap-1 border border-purple-400/40 bg-purple-400/10 px-2 py-0.5 font-mono text-[10px] text-purple-300 uppercase">
                          <GitBranch className="h-3 w-3" /> Subtask
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-[#9e9d99] uppercase">
                      {task.status.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-sm font-semibold text-white">
                    {task.title}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-xs text-[#9e9d99]">
                    {task.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-[#6b6a66]">
                    <span>
                      By {task.creator_name} (L{task.creator_level})
                    </span>
                    <span className="text-[#f5ed00]">{task.progress}%</span>
                  </div>

                  <div className="mt-1.5 h-1 w-full bg-white/10">
                    <div
                      className="h-full bg-[#f5ed00]"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Task Detail Panel */}
        <div className="lg:col-span-7">
          {!selectedTask ? (
            <div className="flex h-full min-h-[380px] flex-col items-center justify-center border border-dashed border-white/15 bg-[#131312] p-8 text-center">
              <Layers className="h-8 w-8 text-[#6b6a66]" />
              <p className="mt-3 text-sm font-medium text-white">
                Select a task to view its full hierarchy, submissions &amp;
                timeline
              </p>
              <p className="mt-1 max-w-sm text-xs text-[#9e9d99]">
                Inspect parent tasks, cascading subtasks, open pool slots, and
                review deliverables.
              </p>
            </div>
          ) : (
            <div className="space-y-6 border border-white/10 bg-[#131312] p-6">
              {/* Top Metadata */}
              <div className="border-b border-white/[0.08] pb-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#f5ed00] px-2.5 py-0.5 font-mono text-[10px] font-bold text-black uppercase">
                      {selectedTask.status.replace("_", " ")}
                    </span>
                    <span className="border border-white/20 px-2.5 py-0.5 font-mono text-[10px] text-white uppercase">
                      Priority: {selectedTask.priority}
                    </span>
                    {selectedTask.department_name && (
                      <span className="border border-white/15 px-2.5 py-0.5 font-mono text-[10px] text-[#9e9d99] uppercase">
                        Dept: {selectedTask.department_name}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-[#9e9d99]">
                    Due {new Date(selectedTask.deadline).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-semibold text-white">
                  {selectedTask.title}
                </h2>
                <p className="mt-1 font-mono text-xs text-[#9e9d99]">
                  Created by {selectedTask.creator_name} (Level{" "}
                  {selectedTask.creator_level}) • Mode:{" "}
                  {selectedTask.assignment_mode.replace("_", " ")}
                </p>

                {/* Parent Task Reference */}
                {selectedTask.parent_task && (
                  <div className="mt-3 flex items-center justify-between border border-purple-400/30 bg-purple-500/10 px-3.5 py-2 text-xs text-purple-200">
                    <span>
                      Parent Task:{" "}
                      <strong>{selectedTask.parent_task.title}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const pt = tasks.find(
                          (t) => t.id === selectedTask.parent_task?.id
                        );
                        if (pt) setSelectedTask(pt);
                      }}
                      className="font-mono text-[11px] text-[#f5ed00] underline"
                    >
                      Open Parent →
                    </button>
                  </div>
                )}
              </div>

              {/* Description & Instructions */}
              <div className="space-y-4 text-xs leading-relaxed text-[#e8e7e3]">
                <div>
                  <h4 className="font-mono text-[10px] tracking-widest text-[#9e9d99] uppercase">
                    Description
                  </h4>
                  <p className="mt-1">{selectedTask.description}</p>
                </div>

                {selectedTask.instructions && (
                  <div>
                    <h4 className="font-mono text-[10px] tracking-widest text-[#9e9d99] uppercase">
                      Execution Instructions
                    </h4>
                    <p className="mt-1 whitespace-pre-line text-[#c4c3be]">
                      {selectedTask.instructions}
                    </p>
                  </div>
                )}

                {selectedTask.expected_deliverables && (
                  <div>
                    <h4 className="font-mono text-[10px] tracking-widest text-[#9e9d99] uppercase">
                      Expected Deliverables
                    </h4>
                    <p className="mt-1 whitespace-pre-line text-[#c4c3be]">
                      {selectedTask.expected_deliverables}
                    </p>
                  </div>
                )}

                {selectedTask.reference_links.length > 0 && (
                  <div>
                    <h4 className="font-mono text-[10px] tracking-widest text-[#9e9d99] uppercase">
                      Reference Links
                    </h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedTask.reference_links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 border border-white/15 bg-[#0d0d0d] px-2.5 py-1 font-mono text-[11px] text-[#f5ed00] hover:underline"
                        >
                          {link} <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Open Task Pool & Department Task Slot Claim Box */}
              {(selectedTask.assignment_mode === "open_pool" ||
                selectedTask.assignment_mode === "department") &&
                selectedTask.open_pool_config && (
                  <div
                    className={`p-4 border ${
                      selectedTask.assignment_mode === "department"
                        ? "border-sky-400/50 bg-sky-500/[0.08]"
                        : "border-[#f5ed00]/40 bg-[#f5ed00]/[0.06]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4
                          className={`font-mono text-xs font-bold uppercase ${
                            selectedTask.assignment_mode === "department"
                              ? "text-sky-300"
                              : "text-[#f5ed00]"
                          }`}
                        >
                          {selectedTask.assignment_mode === "department"
                            ? `🏢 Department Task Pool (${selectedTask.department_name || "Department"})`
                            : "Open Task Pool"}
                          {" — "}
                          {selectedTask.open_pool_config.claimed_member_ids.length}{" "}
                          / {selectedTask.open_pool_config.max_slots} Slots Claimed
                        </h4>
                        <p className="mt-1 text-xs text-[#e8e7e3]">
                          {selectedTask.assignment_mode === "department"
                            ? `Assigned to ${selectedTask.department_name || "Department"}. Anyone belonging to this department (Core or Member) can accept and work on it.`
                            : `Eligible Levels: ${selectedTask.open_pool_config.eligible_levels
                                .map((l) => `Level ${l}`)
                                .join(", ")}`}
                          {" • Claim before "}
                          {new Date(
                            selectedTask.open_pool_config.claim_deadline
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      {!selectedTask.open_pool_config.claimed_member_ids.includes(
                        member.id
                      ) &&
                        selectedTask.open_pool_config.claimed_member_ids.length <
                          selectedTask.open_pool_config.max_slots && (
                          <button
                            type="button"
                            onClick={() =>
                              handleTaskAction(selectedTask.id, "claim")
                            }
                            className={`px-4 py-2 font-mono text-xs font-bold text-black uppercase transition ${
                              selectedTask.assignment_mode === "department"
                                ? "bg-sky-400 hover:bg-sky-300"
                                : "bg-[#f5ed00] hover:bg-[#ded700]"
                            }`}
                          >
                            {selectedTask.assignment_mode === "department"
                              ? "Accept & Work on Task"
                              : "Claim Available Slot"}
                          </button>
                        )}
                    </div>
                  </div>
                )}

              {/* Cascading Subtasks Section */}
              <div className="border border-white/10 bg-[#0d0d0d] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-[#f5ed00]" />
                    <h4 className="font-mono text-xs font-semibold text-white uppercase">
                      Cascading Subtasks ({selectedTask.subtasks.length})
                    </h4>
                  </div>
                  {canCreateTasks && (
                    <button
                      type="button"
                      onClick={() => {
                        setParentTaskId(selectedTask.id);
                        setDeptId(selectedTask.department_id || "");
                        setCreateModalOpen(true);
                      }}
                      className="border border-[#f5ed00]/50 px-3 py-1 font-mono text-[10px] text-[#f5ed00] uppercase hover:bg-[#f5ed00] hover:text-black"
                    >
                      + Delegate Subtask
                    </button>
                  )}
                </div>

                {selectedTask.subtasks.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedTask.subtasks.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => {
                          const found = tasks.find((t) => t.id === st.id);
                          if (found) setSelectedTask(found);
                        }}
                        className="flex cursor-pointer items-center justify-between border border-white/10 bg-[#131312] px-3 py-2 text-xs hover:border-[#f5ed00]"
                      >
                        <span className="font-medium text-white">
                          {st.title}
                        </span>
                        <span className="font-mono text-[10px] text-[#f5ed00] uppercase">
                          {st.status.replace("_", " ")} ({st.progress}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignees & Submissions List */}
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-semibold text-white uppercase">
                  Assignees &amp; Deliverable Submissions (
                  {selectedTask.assignments.length})
                </h4>

                {selectedTask.assignments.map((ass) => {
                  const isMe = ass.member_id === member.id;
                  const canSupervisorReview =
                    selectedTask.created_by === member.id ||
                    selectedTask.parent_task?.created_by === member.id ||
                    member.level === 3;

                  return (
                    <div
                      key={ass.id}
                      className="border border-white/10 bg-[#0d0d0d] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-sm font-semibold text-white">
                            {ass.member_name}
                          </span>{" "}
                          <span className="font-mono text-xs text-[#9e9d99]">
                            (L{ass.member_level} • {ass.member_roll})
                          </span>
                        </div>
                        <span className="border border-[#f5ed00]/40 bg-[#f5ed00]/10 px-2.5 py-0.5 font-mono text-[10px] text-[#f5ed00] uppercase">
                          {ass.status.replace("_", " ")} • {ass.progress}%
                        </span>
                      </div>

                      {ass.submission_notes && (
                        <div className="mt-3 border-l-2 border-[#f5ed00] bg-white/[0.03] p-3 text-xs text-[#e8e7e3]">
                          <p className="font-mono text-[10px] text-[#f5ed00] uppercase">
                            Submitted Work Notes:
                          </p>
                          <p className="mt-1">{ass.submission_notes}</p>
                          {ass.submission_links.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {ass.submission_links.map((l, i) => (
                                <a
                                  key={i}
                                  href={l}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-mono text-[11px] text-[#f5ed00] underline"
                                >
                                  {l}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {ass.review_feedback && (
                        <div className="mt-2 border border-amber-400/30 bg-amber-400/10 p-2.5 text-xs text-amber-200">
                          <strong>Reviewer Feedback:</strong>{" "}
                          {ass.review_feedback}
                        </div>
                      )}

                      {/* If this assignment belongs to current user: progress & submission controls */}
                      {isMe && (
                        <div className="mt-4 space-y-3 border-t border-white/10 pt-3">
                          <div className="flex flex-wrap gap-2">
                            {ass.status === "pending" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleTaskAction(selectedTask.id, "accept")
                                }
                                className="bg-[#f5ed00] px-3 py-1.5 font-mono text-xs font-bold text-black uppercase"
                              >
                                Accept Task
                              </button>
                            )}
                            {[25, 50, 75].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() =>
                                  handleTaskAction(
                                    selectedTask.id,
                                    "update_progress",
                                    { progress: pct }
                                  )
                                }
                                className="border border-white/15 bg-[#131312] px-3 py-1.5 font-mono text-xs text-white hover:border-[#f5ed00]"
                              >
                                Set {pct}%
                              </button>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <input
                              type="text"
                              value={submissionNotes}
                              onChange={(e) =>
                                setSubmissionNotes(e.target.value)
                              }
                              placeholder="Summary of completed deliverables..."
                              className="w-full border border-white/15 bg-[#131312] px-3 py-2 text-xs text-white focus:border-[#f5ed00] focus:outline-none"
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={submissionLinks}
                                onChange={(e) =>
                                  setSubmissionLinks(e.target.value)
                                }
                                placeholder="Deliverable link (Figma / GitHub / Drive)"
                                className="flex-1 border border-white/15 bg-[#131312] px-3 py-2 text-xs text-white focus:border-[#f5ed00] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleTaskAction(selectedTask.id, "submit", {
                                    submission_notes:
                                      submissionNotes ||
                                      "Deliverables completed and verified.",
                                    submission_links: submissionLinks
                                      ? [submissionLinks]
                                      : [],
                                  })
                                }
                                className="bg-[#f5ed00] px-4 py-2 font-mono text-xs font-bold text-black uppercase hover:bg-[#ded700]"
                              >
                                Submit Work
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Supervisor Review Controls */}
                      {canSupervisorReview && (
                        <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={reviewFeedback}
                              onChange={(e) =>
                                setReviewFeedback(e.target.value)
                              }
                              placeholder="Optional reviewer feedback or revision notes..."
                              className="flex-1 border border-white/15 bg-[#131312] px-3 py-1.5 text-xs text-white focus:border-[#f5ed00] focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleTaskAction(selectedTask.id, "approve", {
                                  member_id: ass.member_id,
                                  feedback: reviewFeedback,
                                })
                              }
                              className="inline-flex items-center gap-1 bg-emerald-500 px-3 py-1.5 font-mono text-[11px] font-bold text-black uppercase"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleTaskAction(
                                  selectedTask.id,
                                  "request_revision",
                                  {
                                    member_id: ass.member_id,
                                    feedback:
                                      reviewFeedback ||
                                      "Please address requested revisions.",
                                  }
                                )
                              }
                              className="inline-flex items-center gap-1 border border-amber-400 px-3 py-1.5 font-mono text-[11px] text-amber-300 uppercase"
                            >
                              <Clock className="h-3.5 w-3.5" /> Request Revision
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleTaskAction(selectedTask.id, "complete", {
                                  member_id: ass.member_id,
                                  feedback: reviewFeedback,
                                })
                              }
                              className="inline-flex items-center gap-1 border border-[#f5ed00] px-3 py-1.5 font-mono text-[11px] text-[#f5ed00] uppercase"
                            >
                              <Award className="h-3.5 w-3.5" /> Mark Completed
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Comments Thread */}
              <div className="border-t border-white/10 pt-4">
                <h4 className="mb-3 font-mono text-xs font-semibold text-white uppercase">
                  Task Comments ({selectedTask.comments.length})
                </h4>
                <div className="mb-3 max-h-44 space-y-2 overflow-y-auto">
                  {selectedTask.comments.map((c) => (
                    <div
                      key={c.id}
                      className="border border-white/10 bg-[#0d0d0d] p-3 text-xs"
                    >
                      <div className="flex justify-between font-mono text-[10px] text-[#f5ed00]">
                        <span>
                          {c.author_name} (Level {c.author_level})
                        </span>
                        <span className="text-[#6b6a66]">
                          {new Date(c.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1 text-[#e8e7e3]">{c.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment or question on this task..."
                    className="flex-1 border border-white/15 bg-[#0d0d0d] px-3 py-2 text-xs text-white focus:border-[#f5ed00] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newComment.trim()) return;
                      handleTaskAction(selectedTask.id, "comment", {
                        content: newComment,
                      });
                      setNewComment("");
                    }}
                    className="inline-flex items-center gap-1 bg-[#f5ed00] px-4 py-2 font-mono text-xs font-bold text-black uppercase"
                  >
                    <Send className="h-3.5 w-3.5" /> Post
                  </button>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="border-t border-white/10 pt-4">
                <h4 className="mb-2 font-mono text-xs font-semibold text-white uppercase">
                  Activity Audit Timeline
                </h4>
                <div className="space-y-1.5 font-mono text-[11px] text-[#9e9d99]">
                  {selectedTask.activity.map((act) => (
                    <div key={act.id} className="flex justify-between">
                      <span>
                        <strong className="text-white">{act.actor_name}</strong>{" "}
                        → {act.action}
                      </span>
                      <span className="text-[#6b6a66]">
                        {new Date(act.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-white/15 bg-[#131312] p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-[10px] tracking-widest text-[#f5ed00] uppercase">
                  LEVEL {member.level} TASK DELEGATION
                </span>
                <h2 className="text-xl font-semibold text-white">
                  {parentTaskId
                    ? "Create Cascading Subtask"
                    : "Create Official TVC Task"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-[#9e9d99] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-mono text-xs text-[#9e9d99] uppercase">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sponsor Pitch Deck Design"
                    className="w-full border border-white/15 bg-[#0a0a09] px-3 py-2 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs text-[#9e9d99] uppercase">
                    Department
                  </label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full border border-white/15 bg-[#0a0a09] px-3 py-2 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                  >
                    <option value="">General / Cross-Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs text-[#9e9d99] uppercase">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Clear objective and context of the task..."
                  className="w-full border border-white/15 bg-[#0a0a09] px-3 py-2 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-mono text-xs text-[#9e9d99] uppercase">
                    Detailed Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Step-by-step instructions..."
                    className="w-full border border-white/15 bg-[#0a0a09] px-3 py-2 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs text-[#9e9d99] uppercase">
                    Expected Deliverables
                  </label>
                  <textarea
                    rows={2}
                    value={deliverables}
                    onChange={(e) => setDeliverables(e.target.value)}
                    placeholder="What links/files must be submitted..."
                    className="w-full border border-white/15 bg-[#0a0a09] px-3 py-2 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-mono text-xs text-[#9e9d99] uppercase">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as TaskPriority)
                    }
                    className="w-full border border-white/15 bg-[#0a0a09] px-3 py-2 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs text-[#9e9d99] uppercase">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full border border-white/15 bg-[#0a0a09] px-3 py-2 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs text-[#9e9d99] uppercase">
                    Reference Links
                  </label>
                  <input
                    type="text"
                    value={refLinks}
                    onChange={(e) => setRefLinks(e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-white/15 bg-[#0a0a09] px-3 py-2 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                  />
                </div>
              </div>

              {/* Assignment Method Selector */}
              <div className="border-t border-white/10 pt-4">
                <div className="mb-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-200">
                  <span className="font-bold">🔒 Organisational Authority Rule: </span>
                  {member.level === 3 ? (
                    <span>
                      As a <strong>Level 3 Executive (3rd Year)</strong>, you can assign tasks across all levels: collaborate with fellow <strong>Level 3 peers</strong>, delegate to <strong>Level 2</strong> (Core &amp; General), and <strong>Level 1</strong>.
                    </span>
                  ) : (
                    <span>
                      As a <strong>Level 2 Member (2nd Year)</strong>, you can delegate tasks to any <strong>Level 2 member or Core</strong> across all departments, and assign tasks to <strong>Level 1</strong> members.
                    </span>
                  )}
                </div>

                <label className="mb-2 block font-mono text-xs text-[#f5ed00] uppercase">
                  Assignment Method:
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                  {[
                    { id: "individual", label: "A. Individual" },
                    { id: "multiple", label: "B. Multiple" },
                    { id: "department", label: "C. Dept Pool" },
                    { id: "everyone", label: "D. Everyone" },
                    { id: "random", label: "E. Random Dist." },
                    { id: "open_pool", label: "F. Open Pool" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setAssignmentMode(mode.id as TaskAssignmentMode);
                        setRandomPreview(null);
                      }}
                      className={`border px-3 py-2 font-mono text-xs uppercase transition ${
                        assignmentMode === mode.id
                          ? "border-[#f5ed00] bg-[#f5ed00] font-bold text-black shadow-md"
                          : "border-white/15 bg-[#0a0a09] text-[#9e9d99] hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode A: Individual Assignment — Prominent Member Dropdown */}
              {assignmentMode === "individual" && (
                <div className="rounded-2xl border-2 border-[#f5ed00]/40 bg-[#0c1017] p-5 shadow-lg">
                  <label className="mb-2 block font-mono text-xs font-bold text-[#f5ed00] uppercase">
                    Assign To Member (Eligible Recipient Dropdown):
                  </label>
                  <p className="mb-3 text-xs text-white/60">
                    {member.level === 3
                      ? "Select one eligible Level 2 member from the dropdown below (Level 3 members are strictly excluded):"
                      : "Select one eligible Level 1 or Level 2 member from the dropdown below:"}
                  </p>

                  <select
                    value={selectedAssigneeIds[0] || ""}
                    onChange={(e) =>
                      setSelectedAssigneeIds(
                        e.target.value ? [e.target.value] : []
                      )
                    }
                    className="w-full rounded-xl border-2 border-[#f5ed00] bg-[#161a22] px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#f5ed00]/50"
                  >
                    <option value="">
                      -- Choose an eligible member from dropdown ({eligibleRecipients.length} available) --
                    </option>
                    {eligibleRecipients.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.roll_number}) — Level {r.level} {r.position_name} • Active Tasks: {r.active_task_count}
                      </option>
                    ))}
                  </select>

                  {/* Selected Member Preview Card */}
                  {selectedAssigneeIds[0] && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs">
                      {(() => {
                        const sel = eligibleRecipients.find(
                          (r) => r.id === selectedAssigneeIds[0]
                        );
                        if (!sel) return null;
                        return (
                          <>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">
                                  {sel.name}
                                </span>
                                <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] text-sky-300">
                                  Level {sel.level}
                                </span>
                                <span className="text-white/60">
                                  ({sel.roll_number})
                                </span>
                              </div>
                              <p className="mt-0.5 text-white/50">
                                {sel.position_name} • {sel.email}
                              </p>
                            </div>
                            <span className="font-mono text-xs text-amber-300">
                              Current Load: {sel.active_task_count} tasks
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Mode B: Multiple Assignment — Member Dropdown Adder */}
              {assignmentMode === "multiple" && (
                <div className="rounded-2xl border-2 border-[#f5ed00]/40 bg-[#0c1017] p-5 shadow-lg">
                  <label className="mb-2 block font-mono text-xs font-bold text-[#f5ed00] uppercase">
                    Add Members to Task (Dropdown Picker):
                  </label>
                  <p className="mb-3 text-xs text-white/60">
                    Select eligible members from the dropdown to assign this task to multiple people:
                  </p>

                  <select
                    value=""
                    onChange={(e) => {
                      if (
                        e.target.value &&
                        !selectedAssigneeIds.includes(e.target.value)
                      ) {
                        setSelectedAssigneeIds((prev) => [
                          ...prev,
                          e.target.value,
                        ]);
                      }
                    }}
                    className="w-full rounded-xl border-2 border-[#f5ed00] bg-[#161a22] px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#f5ed00]/50"
                  >
                    <option value="">
                      -- Click to add an eligible member from dropdown --
                    </option>
                    {eligibleRecipients
                      .filter((r) => !selectedAssigneeIds.includes(r.id))
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          + Add {r.name} ({r.roll_number}) — Level {r.level} {r.position_name}
                        </option>
                      ))}
                  </select>

                  {/* Selected Assignees Tags */}
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold text-white/70">
                      Selected Assignees ({selectedAssigneeIds.length}):
                    </p>
                    {selectedAssigneeIds.length === 0 ? (
                      <p className="text-xs text-white/40 italic">
                        No members selected yet. Choose from the dropdown above.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedAssigneeIds.map((id) => {
                          const r = eligibleRecipients.find((m) => m.id === id);
                          if (!r) return null;
                          return (
                            <span
                              key={id}
                              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/15 px-3 py-1.5 text-xs font-medium text-white"
                            >
                              <span>
                                {r.name} (L{r.level})
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedAssigneeIds((prev) =>
                                    prev.filter((item) => item !== id)
                                  )
                                }
                                className="text-amber-300 hover:text-white"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mode C: Department Assignment Pool */}
              {assignmentMode === "department" && (
                <div className="rounded-2xl border-2 border-sky-400/40 bg-[#0c1322] p-5 shadow-lg space-y-4">
                  <div>
                    <label className="mb-1 block font-mono text-xs font-bold text-sky-300 uppercase">
                      Target Department (Task Pool Assigned to Department):
                    </label>
                    <p className="mb-2 text-xs text-white/60">
                      This task will be assigned to the selected Department. Anyone belonging to this department (Core or Member) can accept and work on it.
                    </p>
                    <select
                      value={deptId}
                      onChange={(e) => setDeptId(e.target.value)}
                      className="w-full rounded-xl border-2 border-sky-400 bg-[#161f30] px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                    >
                      <option value="">-- Choose Target Department --</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} Department
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block font-mono text-xs font-bold text-sky-300 uppercase">
                      Department Collaboration Mode:
                    </label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setDeptCollabMode("single")}
                        className={`rounded-xl border p-3 text-left transition ${
                          deptCollabMode === "single"
                            ? "border-sky-400 bg-sky-500/20 text-white"
                            : "border-white/10 bg-[#0a0f18] text-white/60 hover:text-white"
                        }`}
                      >
                        <div className="font-bold text-sm text-sky-200">
                          Single Member Claim
                        </div>
                        <p className="mt-1 text-xs text-white/60">
                          The first eligible member or core in this department to accept claims and works on it alone.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeptCollabMode("multiple")}
                        className={`rounded-xl border p-3 text-left transition ${
                          deptCollabMode === "multiple"
                            ? "border-sky-400 bg-sky-500/20 text-white"
                            : "border-white/10 bg-[#0a0f18] text-white/60 hover:text-white"
                        }`}
                      >
                        <div className="font-bold text-sm text-sky-200">
                          Multiple Collaborators (Team)
                        </div>
                        <p className="mt-1 text-xs text-white/60">
                          Allow multiple people in this department to accept and collaborate together.
                        </p>
                      </button>
                    </div>
                  </div>

                  {deptCollabMode === "multiple" && (
                    <div>
                      <label className="mb-1 block font-mono text-xs text-sky-300 uppercase">
                        Max Collaborator Slots in Department
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={15}
                        value={deptMaxSlots}
                        onChange={(e) => setDeptMaxSlots(Number(e.target.value))}
                        className="w-full rounded-xl border border-sky-400/40 bg-[#161f30] px-3 py-2 text-sm text-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Mode D: Everyone */}
              {assignmentMode === "everyone" && (
                <div className="border border-white/10 bg-[#0a0a09] p-4">
                  <label className="mb-1 block font-mono text-xs text-[#9e9d99] uppercase">
                    Target Level Filter
                  </label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value)}
                    className="w-full border border-white/15 bg-[#131312] px-3 py-2 text-xs text-white"
                  >
                    <option value="">All Eligible Levels</option>
                    <option value="2">Level 2 Members Only</option>
                    {member.level === 2 && (
                      <option value="1">Level 1 Members Only</option>
                    )}
                  </select>
                </div>
              )}

              {/* Mode D: Random Distribution with Preview */}
              {assignmentMode === "random" && (
                <div className="space-y-3 border border-[#f5ed00]/30 bg-[#0a0a09] p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block font-mono text-[10px] text-[#9e9d99] uppercase">
                        Random Strategy
                      </label>
                      <select
                        value={randomMode}
                        onChange={(e) =>
                          setRandomMode(
                            e.target.value as RandomDistributionMode
                          )
                        }
                        className="w-full border border-white/15 bg-[#131312] px-2.5 py-2 text-xs text-white"
                      >
                        <option value="balanced">
                          Balanced Workload Random
                        </option>
                        <option value="pure">Pure Random Distribution</option>
                        <option value="department">
                          Department-Based Random
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-[10px] text-[#9e9d99] uppercase">
                        Number of Assignees
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={randomCount}
                        onChange={(e) => setRandomCount(Number(e.target.value))}
                        className="w-full border border-white/15 bg-[#131312] px-2.5 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handlePreviewRandom}
                        className="inline-flex w-full items-center justify-center gap-1.5 border border-[#f5ed00] px-3 py-2 font-mono text-xs font-semibold text-[#f5ed00] uppercase hover:bg-[#f5ed00] hover:text-black"
                      >
                        <Eye className="h-3.5 w-3.5" /> Preview Distribution
                      </button>
                    </div>
                  </div>

                  {randomPreview && (
                    <div className="border border-white/10 bg-[#131312] p-3">
                      <p className="mb-2 font-mono text-[10px] text-[#f5ed00] uppercase">
                        Proposed Random Distribution Preview (
                        {randomPreview.length} Selected):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {randomPreview.map((p) => (
                          <span
                            key={p.id}
                            className="border border-[#f5ed00]/40 bg-[#0d0d0d] px-2.5 py-1 font-mono text-xs text-white"
                          >
                            {p.name} (L{p.level} • Active tasks:{" "}
                            {p.active_task_count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mode E: Open Task Pool */}
              {assignmentMode === "open_pool" && (
                <div className="grid gap-4 border border-white/10 bg-[#0a0a09] p-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-mono text-xs text-[#9e9d99] uppercase">
                      Max Available Claim Slots
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={poolMaxSlots}
                      onChange={(e) => setPoolMaxSlots(Number(e.target.value))}
                      className="w-full border border-white/15 bg-[#131312] px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-xs text-[#9e9d99] uppercase">
                      Eligible Levels
                    </label>
                    <div className="flex gap-3 pt-1">
                      <label className="flex items-center gap-1.5 text-xs text-white">
                        <input
                          type="checkbox"
                          checked={poolLevels.includes(2)}
                          onChange={(e) =>
                            setPoolLevels((prev) =>
                              e.target.checked
                                ? [...prev, 2]
                                : prev.filter((l) => l !== 2)
                            )
                          }
                        />
                        Level 2
                      </label>
                      {member.level === 2 && (
                        <label className="flex items-center gap-1.5 text-xs text-white">
                          <input
                            type="checkbox"
                            checked={poolLevels.includes(1)}
                            onChange={(e) =>
                              setPoolLevels((prev) =>
                                e.target.checked
                                  ? [...prev, 1]
                                  : prev.filter((l) => l !== 1)
                              )
                            }
                          />
                          Level 1
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="border border-white/15 px-5 py-2.5 font-mono text-xs text-[#9e9d99] uppercase hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#f5ed00] px-6 py-2.5 font-mono text-xs font-bold text-black uppercase hover:bg-[#ded700]"
                >
                  Publish &amp; Delegate Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

