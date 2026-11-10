"use client";

import React, { useEffect, useState } from "react";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  MessageSquare,
  Bell,
  ArrowUpRight,
  Plus,
  Users,
  FileCheck2,
  Building2,
  Megaphone,
  Activity,
  AlertCircle,
} from "lucide-react";
import { PublicMemberView } from "@/lib/exclusive/types";

interface DashboardModuleProps {
  member: PublicMemberView;
  onNavigate: (module: string, extra?: Record<string, string>) => void;
}

interface DashboardData {
  metrics: {
    assignedTasks: number;
    pendingTasks: number;
    completedTasks: number;
    unreadMessages: number;
    unreadNotifications: number;
    pendingApplications: number;
    tasksRequiringReview: number;
  };
  myTasks: {
    active: Array<{
      id: string;
      title: string;
      priority: string;
      deadline: string;
      department_name?: string;
      creator_name: string;
      my_assignment: { status: string; progress: number };
    }>;
    completed: Array<{
      id: string;
      title: string;
      priority: string;
      deadline: string;
      my_assignment: { status: string; progress: number };
    }>;
    requiringReview: Array<{
      id: string;
      title: string;
      priority: string;
      department_name?: string;
      assignments: Array<{ member_name: string; status: string }>;
    }>;
  };
  announcements: Array<{
    id: string;
    content: string;
    sender_name: string;
    sender_position: string;
    is_pinned: boolean;
    created_at: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    actor_name: string;
    task_title: string;
    task_id: string;
    created_at: string;
  }>;
}

export function DashboardModule({ member, onNavigate }: DashboardModuleProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/exclusive/dashboard")
      .then((r) => r.json())
      .then((json) => {
        if (mounted && json.metrics) setData(json);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const canCreateTasks =
    member.level >= 2 &&
    (member.permissions.includes("create_level_2_tasks") ||
      member.permissions.includes("create_level_1_tasks"));

  const canReviewApps =
    member.permissions.includes("approve_level_2_applications") ||
    member.permissions.includes("approve_level_1_applications");

  const canManageDepts = member.permissions.includes("manage_departments");

  return (
    <div className="space-y-8">
      {/* Personalised Welcome Header */}
      <div className="border border-white/10 bg-[#131312] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center border border-[#f5ed00]/50 bg-[#0d0d0d] font-mono text-xl font-bold text-[#f5ed00]">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-[#f5ed00] bg-[#f5ed00] px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-black uppercase">
                  LEVEL {member.level}
                </span>
                <span className="border border-white/20 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-white uppercase">
                  {member.position_name}
                </span>
                <span className="font-mono text-xs text-[#6b6a66]">
                  Roll #{member.roll_number}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Welcome back, {member.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {member.departments.length > 0 ? (
                  member.departments.map((d) => (
                    <span
                      key={d.id}
                      className="border border-white/10 bg-[#0d0d0d] px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-[#9e9d99] uppercase"
                    >
                      {d.name} Dept
                    </span>
                  ))
                ) : (
                  <span className="font-mono text-xs text-[#6b6a66]">
                    No department assigned yet
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2.5">
            {canCreateTasks && (
              <button
                type="button"
                onClick={() => onNavigate("tasks", { create: "1" })}
                className="inline-flex items-center gap-2 bg-[#f5ed00] px-4 py-2.5 font-mono text-xs font-bold tracking-wider text-black uppercase transition-colors hover:bg-[#ded700]"
              >
                <Plus className="h-4 w-4" /> Create Task
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate("tasks")}
              className="inline-flex items-center gap-2 border border-white/15 bg-[#0d0d0d] px-4 py-2.5 font-mono text-xs text-white uppercase hover:border-[#f5ed00]"
            >
              <CheckSquare className="h-3.5 w-3.5 text-[#f5ed00]" /> View Tasks
            </button>
            <button
              type="button"
              onClick={() => onNavigate("connect")}
              className="inline-flex items-center gap-2 border border-white/15 bg-[#0d0d0d] px-4 py-2.5 font-mono text-xs text-white uppercase hover:border-[#f5ed00]"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[#f5ed00]" /> Open Connect
            </button>
            <button
              type="button"
              onClick={() => onNavigate("directory")}
              className="inline-flex items-center gap-2 border border-white/15 bg-[#0d0d0d] px-4 py-2.5 font-mono text-xs text-white uppercase hover:border-[#f5ed00]"
            >
              <Users className="h-3.5 w-3.5 text-[#f5ed00]" /> View Members
            </button>
            {canReviewApps && (
              <button
                type="button"
                onClick={() => onNavigate("applications")}
                className="inline-flex items-center gap-2 border border-[#f5ed00]/40 bg-[#f5ed00]/10 px-4 py-2.5 font-mono text-xs text-[#f5ed00] uppercase hover:bg-[#f5ed00] hover:text-black"
              >
                <FileCheck2 className="h-3.5 w-3.5" /> Review Applications
                {data && data.metrics.pendingApplications > 0 && (
                  <span className="ml-1 rounded-full bg-[#f5ed00] px-1.5 py-0.2 text-[10px] font-bold text-black">
                    {data.metrics.pendingApplications}
                  </span>
                )}
              </button>
            )}
            {canManageDepts && (
              <button
                type="button"
                onClick={() => onNavigate("departments")}
                className="inline-flex items-center gap-2 border border-white/15 bg-[#0d0d0d] px-4 py-2.5 font-mono text-xs text-white uppercase hover:border-[#f5ed00]"
              >
                <Building2 className="h-3.5 w-3.5 text-[#f5ed00]" /> Manage Departments
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <button
          type="button"
          onClick={() => onNavigate("tasks")}
          className="border border-white/10 bg-[#131312] p-5 text-left transition-colors hover:border-[#f5ed00]/50"
        >
          <div className="flex items-center justify-between text-[#9e9d99]">
            <span className="font-mono text-[10px] tracking-widest uppercase">
              Assigned Tasks
            </span>
            <CheckSquare className="h-4 w-4 text-[#f5ed00]" />
          </div>
          <p className="mt-3 font-mono text-3xl font-bold text-white">
            {loading ? "—" : data?.metrics.assignedTasks ?? 0}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("tasks")}
          className="border border-white/10 bg-[#131312] p-5 text-left transition-colors hover:border-[#f5ed00]/50"
        >
          <div className="flex items-center justify-between text-[#9e9d99]">
            <span className="font-mono text-[10px] tracking-widest uppercase">
              Pending / Active
            </span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-3 font-mono text-3xl font-bold text-white">
            {loading ? "—" : data?.metrics.pendingTasks ?? 0}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("tasks")}
          className="border border-white/10 bg-[#131312] p-5 text-left transition-colors hover:border-[#f5ed00]/50"
        >
          <div className="flex items-center justify-between text-[#9e9d99]">
            <span className="font-mono text-[10px] tracking-widest uppercase">
              Completed
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 font-mono text-3xl font-bold text-white">
            {loading ? "—" : data?.metrics.completedTasks ?? 0}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("connect")}
          className="border border-white/10 bg-[#131312] p-5 text-left transition-colors hover:border-[#f5ed00]/50"
        >
          <div className="flex items-center justify-between text-[#9e9d99]">
            <span className="font-mono text-[10px] tracking-widest uppercase">
              Unread Messages
            </span>
            <MessageSquare className="h-4 w-4 text-sky-400" />
          </div>
          <p className="mt-3 font-mono text-3xl font-bold text-white">
            {loading ? "—" : data?.metrics.unreadMessages ?? 0}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("notifications")}
          className="border border-white/10 bg-[#131312] p-5 text-left transition-colors hover:border-[#f5ed00]/50"
        >
          <div className="flex items-center justify-between text-[#9e9d99]">
            <span className="font-mono text-[10px] tracking-widest uppercase">
              Notifications
            </span>
            <Bell className="h-4 w-4 text-[#f5ed00]" />
          </div>
          <p className="mt-3 font-mono text-3xl font-bold text-white">
            {loading ? "—" : data?.metrics.unreadNotifications ?? 0}
          </p>
        </button>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left 7 Cols: My Tasks & Tasks Requiring Review */}
        <div className="space-y-6 lg:col-span-7">
          {/* Active Tasks */}
          <div className="border border-white/10 bg-[#131312] p-6">
            <div className="mb-4 flex items-center justify-between border-b border-white/[0.07] pb-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  My Active Tasks &amp; Upcoming Deadlines
                </h2>
                <p className="font-mono text-[11px] text-[#6b6a66]">
                  ASSIGNED WORKITEMS &amp; PROGRESS
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("tasks")}
                className="inline-flex items-center gap-1 font-mono text-xs text-[#f5ed00] hover:underline"
              >
                ALL TASKS <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {!data || data.myTasks.active.length === 0 ? (
              <div className="border border-dashed border-white/10 p-6 text-center text-xs text-[#9e9d99]">
                No active tasks assigned right now. Check the Open Task Pool in
                the Tasks module to claim new work!
              </div>
            ) : (
              <div className="space-y-3">
                {data.myTasks.active.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onNavigate("tasks", { task: task.id })}
                    className="cursor-pointer border border-white/10 bg-[#0d0d0d] p-4 transition-colors hover:border-[#f5ed00]/60"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="border border-[#f5ed00]/40 bg-[#f5ed00]/10 px-2 py-0.5 font-mono text-[10px] text-[#f5ed00] uppercase">
                          {task.priority}
                        </span>
                        {task.department_name && (
                          <span className="font-mono text-[10px] text-[#9e9d99] uppercase">
                            {"//"} {task.department_name}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-[#9e9d99]">
                        Due {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-white">
                      {task.title}
                    </h3>
                    <div className="mt-3 flex items-center justify-between text-xs text-[#9e9d99]">
                      <span>
                        Status:{" "}
                        <strong className="font-mono text-white uppercase">
                          {task.my_assignment.status.replace("_", " ")}
                        </strong>
                      </span>
                      <span className="font-mono text-[#f5ed00]">
                        {task.my_assignment.progress}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full bg-white/10">
                      <div
                        className="h-full bg-[#f5ed00]"
                        style={{ width: `${task.my_assignment.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks Requiring Review (for Level 2 & Level 3) */}
          {member.level >= 2 && (
            <div className="border border-white/10 bg-[#131312] p-6">
              <div className="mb-4 flex items-center justify-between border-b border-white/[0.07] pb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-[#f5ed00]" />
                  <h2 className="text-base font-semibold text-white">
                    Submissions Requiring Your Review
                  </h2>
                </div>
                <span className="font-mono text-xs text-[#f5ed00]">
                  {data?.myTasks.requiringReview.length ?? 0} Pending
                </span>
              </div>

              {!data || data.myTasks.requiringReview.length === 0 ? (
                <p className="text-xs text-[#9e9d99]">
                  No submitted tasks or subtasks are currently awaiting review.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.myTasks.requiringReview.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onNavigate("tasks", { task: t.id })}
                      className="cursor-pointer border border-[#f5ed00]/30 bg-[#0d0d0d] p-4 hover:border-[#f5ed00]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#f5ed00] uppercase">
                          AWAITING REVIEW
                        </span>
                        <span className="font-mono text-[11px] text-[#9e9d99]">
                          {t.department_name || "General"}
                        </span>
                      </div>
                      <h4 className="mt-1 text-sm font-semibold text-white">
                        {t.title}
                      </h4>
                      <p className="mt-1 text-xs text-[#9e9d99]">
                        Submitted by:{" "}
                        {t.assignments.map((a) => a.member_name).join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 5 Cols: General Announcements & Recent Activity */}
        <div className="space-y-6 lg:col-span-5">
          {/* General Announcements */}
          <div className="border border-white/10 bg-[#131312] p-6">
            <div className="mb-4 flex items-center justify-between border-b border-white/[0.07] pb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-[#f5ed00]" />
                <h2 className="text-base font-semibold text-white">
                  General Announcements
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  onNavigate("connect", { conversation: "conv-announcements" })
                }
                className="font-mono text-xs text-[#f5ed00] hover:underline"
              >
                OPEN CHANNEL →
              </button>
            </div>

            <div className="space-y-3">
              {data?.announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="border border-white/10 bg-[#0d0d0d] p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[#f5ed00]">
                      {ann.sender_name} • {ann.sender_position}
                    </span>
                    {ann.is_pinned && (
                      <span className="border border-[#f5ed00]/40 px-1.5 py-0.5 font-mono text-[9px] text-[#f5ed00] uppercase">
                        PINNED
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#e8e7e3]">
                    {ann.content}
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-[#6b6a66]">
                    {new Date(ann.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="border border-white/10 bg-[#131312] p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-white/[0.07] pb-4">
              <Activity className="h-4 w-4 text-[#f5ed00]" />
              <h2 className="text-base font-semibold text-white">
                Recent Organisational Activity
              </h2>
            </div>

            <div className="space-y-3">
              {data?.recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start justify-between gap-3 border-b border-white/[0.05] pb-3 last:border-none last:pb-0"
                >
                  <div>
                    <p className="text-xs text-[#e8e7e3]">
                      <strong className="text-white">{act.actor_name}</strong>{" "}
                      <span className="font-mono text-[10px] text-[#f5ed00]">
                        [{act.action}]
                      </span>{" "}
                      on <span className="text-white">{act.task_title}</span>
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-[#6b6a66]">
                      {new Date(act.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

