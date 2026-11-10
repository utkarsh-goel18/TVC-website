"use client";

import { useState, useEffect } from "react";
import {
  Building,
  Users,
  ShieldCheck,
  Edit3,
  UserPlus,
  UserMinus,
  Sparkles,
  CheckCircle2,
  X,
  Palette,
  Megaphone,
  Radio,
  Code2,
  PackageCheck,
  Smile,
  Compass,
} from "lucide-react";
import type { SafeMemberProfile, DepartmentRecord } from "@/lib/exclusive/types";

interface DepartmentsModuleProps {
  member: SafeMemberProfile;
  onNavigateToConnectDept?: (deptId: string) => void;
}

export function DepartmentsModule({
  member,
  onNavigateToConnectDept,
}: DepartmentsModuleProps) {
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [allMembers, setAllMembers] = useState<SafeMemberProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Description Modal
  const [editingDept, setEditingDept] = useState<DepartmentRecord | null>(null);
  const [editDesc, setEditDesc] = useState("");

  // Manage Roster Modal
  const [rosterDept, setRosterDept] = useState<DepartmentRecord | null>(null);
  const [selectedAddMemberId, setSelectedAddMemberId] = useState("");
  const [savingAction, setSavingAction] = useState(false);

  const canManage =
    member.level === 3 || member.permissions.includes("manage_departments");

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exclusive/departments");
      const json = await res.json();
      if (res.ok && json.departments) {
        setDepartments(json.departments);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMembers = async () => {
    try {
      const res = await fetch("/api/exclusive/members");
      const json = await res.json();
      if (res.ok && json.members) {
        setAllMembers(json.members);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchDepartments();
    if (canManage) {
      fetchAllMembers();
    }
  }, [canManage]);

  const handleUpdateDescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    setSavingAction(true);
    try {
      const res = await fetch("/api/exclusive/departments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: editingDept.id,
          description: editDesc,
        }),
      });
      if (res.ok) {
        setEditingDept(null);
        fetchDepartments();
      }
    } finally {
      setSavingAction(false);
    }
  };

  const handleAddMember = async () => {
    if (!rosterDept || !selectedAddMemberId) return;
    setSavingAction(true);
    try {
      const res = await fetch("/api/exclusive/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_member",
          departmentId: rosterDept.id,
          memberId: selectedAddMemberId,
        }),
      });
      if (res.ok) {
        setSelectedAddMemberId("");
        await fetchDepartments();
        // Update local roster modal
        const updated = await (await fetch("/api/exclusive/departments")).json();
        const matched = updated.departments.find(
          (d: DepartmentRecord) => d.id === rosterDept.id
        );
        if (matched) setRosterDept(matched);
      }
    } finally {
      setSavingAction(false);
    }
  };

  const handleRemoveMember = async (targetMemberId: string) => {
    if (!rosterDept) return;
    setSavingAction(true);
    try {
      const res = await fetch("/api/exclusive/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove_member",
          departmentId: rosterDept.id,
          memberId: targetMemberId,
        }),
      });
      if (res.ok) {
        await fetchDepartments();
        const updated = await (await fetch("/api/exclusive/departments")).json();
        const matched = updated.departments.find(
          (d: DepartmentRecord) => d.id === rosterDept.id
        );
        if (matched) setRosterDept(matched);
      }
    } finally {
      setSavingAction(false);
    }
  };

  const getDeptIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("tech")) return <Code2 className="h-5 w-5" />;
    if (n.includes("design")) return <Palette className="h-5 w-5" />;
    if (n.includes("media")) return <Radio className="h-5 w-5" />;
    if (n.includes("outreach")) return <Compass className="h-5 w-5" />;
    if (n.includes("marketing")) return <Megaphone className="h-5 w-5" />;
    if (n.includes("logistics")) return <PackageCheck className="h-5 w-5" />;
    return <Smile className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                <Building className="h-4 w-4" />
              </span>
              <h2 className="font-display text-xl font-bold text-white">
                TVC Departments
              </h2>
            </div>
            <p className="mt-1 text-sm text-white/60">
              The 7 pillars driving the Thapar Venture Club ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white">
              7 Active Departments
            </span>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] py-20 text-center text-sm text-white/40">
          Loading departments...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((dept) => {
            const isMember = member.departments.some(
              (d) =>
                (typeof d === "string" ? d : d.id) === dept.id ||
                (typeof d === "string" ? d : d.name).toLowerCase() ===
                  dept.name.toLowerCase()
            );

            return (
              <div
                key={dept.id}
                className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-amber-400/40 hover:bg-white/[0.05]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-amber-400/15 text-amber-300">
                        {getDeptIcon(dept.name)}
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-white">
                          {dept.name}
                        </h3>
                        <span className="text-xs text-white/50">
                          {dept.memberCount || dept.members?.length || 0} Members
                        </span>
                      </div>
                    </div>

                    {isMember && (
                      <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                        Your Dept
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-white/70">
                    {dept.description || "Leading TVC initiatives and innovation."}
                  </p>

                  {/* Sample member avatars or count */}
                  {dept.members && dept.members.length > 0 && (
                    <div className="mt-5 border-t border-white/5 pt-4">
                      <p className="text-[11px] font-medium text-white/45">
                        Assigned Roster:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {dept.members.slice(0, 5).map((m) => (
                          <span
                            key={m.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/80"
                          >
                            <span>{m.fullName}</span>
                            <span className="text-amber-300">
                              (L{m.level})
                            </span>
                          </span>
                        ))}
                        {dept.members.length > 5 && (
                          <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                            +{dept.members.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
                  <button
                    onClick={() => setRosterDept(dept)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200"
                  >
                    <Users className="h-3.5 w-3.5" />
                    View Roster
                  </button>

                  {canManage && (
                    <button
                      onClick={() => {
                        setEditingDept(dept);
                        setEditDesc(dept.description || "");
                      }}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Roster & Management Modal */}
      {rosterDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-[#090d16] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  {rosterDept.name} Department Roster
                </h3>
                <p className="text-xs text-white/55">
                  Total members: {rosterDept.members?.length || 0}
                </p>
              </div>
              <button
                onClick={() => setRosterDept(null)}
                className="rounded-xl border border-white/10 p-1.5 text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* If Level 3, Add Member */}
            {canManage && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                <label className="text-xs font-medium text-white/70">
                  Assign Member to {rosterDept.name}:
                </label>
                <div className="mt-2 flex gap-2">
                  <select
                    value={selectedAddMemberId}
                    onChange={(e) => setSelectedAddMemberId(e.target.value)}
                    aria-label={`Select member to assign to ${rosterDept.name}`}
                    className="flex-1 rounded-xl border border-white/10 bg-[#0c121e] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="">Select a member...</option>
                    {allMembers
                      .filter(
                        (m) =>
                          !rosterDept.members?.some((dm) => dm.id === m.id)
                      )
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullName} ({m.rollNumber}) — L{m.level} {m.positionTitle}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleAddMember}
                    disabled={!selectedAddMemberId || savingAction}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-40"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Assign
                  </button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
              {!rosterDept.members || rosterDept.members.length === 0 ? (
                <div className="py-6 text-center text-xs text-white/40">
                  No members assigned yet to this department.
                </div>
              ) : (
                rosterDept.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {m.fullName}
                        </span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-amber-300">
                          Level {m.level}
                        </span>
                      </div>
                      <p className="text-xs text-white/50">
                        {m.rollNumber} · {m.positionTitle}
                      </p>
                    </div>

                    {canManage && (
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        disabled={savingAction}
                        title="Remove from department"
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Description Modal */}
      {editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <form
            onSubmit={handleUpdateDescription}
            className="w-full max-w-md rounded-3xl border border-white/15 bg-[#090d16] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white">
                Edit {editingDept.name} Description
              </h3>
              <button
                type="button"
                onClick={() => setEditingDept(null)}
                className="rounded-xl border border-white/10 p-1.5 text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-white/70">
                Department Overview
              </label>
              <textarea
                rows={4}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-white/15 bg-white/[0.04] p-3 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingDept(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingAction}
                className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-40"
              >
                {savingAction ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

