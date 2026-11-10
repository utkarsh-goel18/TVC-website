"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Award,
  Users,
  Settings,
  History,
  Check,
  X,
  AlertTriangle,
  Plus,
  RefreshCw,
  Lock,
  UserCheck,
  UserX,
  ChevronRight,
  KeyRound,
} from "lucide-react";
import type { SafeMemberProfile, PositionRecord, AuditLogRecord } from "@/lib/exclusive/types";

interface AdminModuleProps {
  currentMember: SafeMemberProfile;
}

export function AdminModule({ currentMember }: AdminModuleProps) {
  const [activeTab, setActiveTab] = useState<
    "core" | "positions" | "members" | "audit"
  >("core");

  const [level2Members, setLevel2Members] = useState<SafeMemberProfile[]>([]);
  const [allMembers, setAllMembers] = useState<SafeMemberProfile[]>([]);
  const [positions, setPositions] = useState<PositionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // New Position Modal
  const [showNewPositionModal, setShowNewPositionModal] = useState(false);
  const [newPosKey, setNewPosKey] = useState("");
  const [newPosTitle, setNewPosTitle] = useState("");
  const [newPosLevel, setNewPosLevel] = useState<1 | 2 | 3>(3);
  const [newPosDesc, setNewPosDesc] = useState("");
  const [savingPos, setSavingPos] = useState(false);

  // Success / error message
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exclusive/admin?type=all");
      const json = await res.json();
      if (res.ok) {
        if (json.level2Members) setLevel2Members(json.level2Members);
        if (json.allMembers) setAllMembers(json.allMembers);
        if (json.positions) setPositions(json.positions);
        if (json.auditLogs) setAuditLogs(json.auditLogs);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handlePromoteToCore = async (memberId: string, makeCore: boolean) => {
    try {
      const res = await fetch("/api/exclusive/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "promote_core",
          memberId,
          isCore: makeCore,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setStatusMessage({
          text: makeCore
            ? "Member successfully promoted to Core (Designation updated, Level remains 2)."
            : "Core designation revoked for member (Level remains 2).",
          type: "success",
        });
        fetchAdminData();
      } else {
        setStatusMessage({
          text: json.error || "Action failed.",
          type: "error",
        });
      }
    } catch {
      setStatusMessage({
        text: "Network error processing action.",
        type: "error",
      });
    }
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleToggleMemberStatus = async (
    memberId: string,
    newStatus: "active" | "inactive"
  ) => {
    try {
      const res = await fetch("/api/exclusive/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_member_status",
          memberId,
          status: newStatus,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setStatusMessage({
          text: `Account status updated to ${newStatus}.`,
          type: "success",
        });
        fetchAdminData();
      } else {
        setStatusMessage({
          text: json.error || "Action failed.",
          type: "error",
        });
      }
    } catch {
      setStatusMessage({
        text: "Network error updating member status.",
        type: "error",
      });
    }
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleCreatePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosKey.trim() || !newPosTitle.trim()) return;
    setSavingPos(true);
    try {
      const res = await fetch("/api/exclusive/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_position",
          positionKey: newPosKey.trim().toLowerCase().replace(/\s+/g, "_"),
          title: newPosTitle.trim(),
          level: newPosLevel,
          description: newPosDesc.trim(),
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setShowNewPositionModal(false);
        setNewPosKey("");
        setNewPosTitle("");
        setNewPosDesc("");
        setStatusMessage({
          text: "New position registered successfully.",
          type: "success",
        });
        fetchAdminData();
      } else {
        alert(json.error || "Failed to create position.");
      }
    } finally {
      setSavingPos(false);
    }
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-transparent p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <h2 className="font-display text-xl font-bold text-white">
                TVC Administration & Governance
              </h2>
            </div>
            <p className="mt-1 text-sm text-white/60">
              Executive controls: Core member designations, position lifecycle, account authorizations, and audit telemetry.
            </p>
          </div>

          <button
            onClick={fetchAdminData}
            title="Refresh data"
            className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              { id: "core", label: "Core Promotions (Level 2)", icon: Award },
              { id: "positions", label: "Positions & Designations", icon: Settings },
              { id: "members", label: "Member Access & Accounts", icon: Users },
              { id: "audit", label: "Security & Audit Logs", icon: History },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-amber-400 text-slate-950 shadow-md"
                    : "bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {statusMessage && (
        <div
          className={`rounded-2xl border p-3.5 text-xs ${
            statusMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Tab 1: Core Promotions */}
      {activeTab === "core" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-4 text-xs text-amber-200">
            <strong>Organisational Rule:</strong> &quot;Core&quot; is an earned designation within Level 2 (Second-Year Members), NOT an independent organizational level. Level 2 General and Core members both remain strictly at <code>level: 2</code> and share the same task and application review capabilities.
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-display text-base font-bold text-white">
              Level 2 Members ({level2Members.length})
            </h3>

            <div className="mt-4 space-y-3">
              {level2Members.length === 0 ? (
                <p className="py-6 text-center text-xs text-white/40">
                  No Level 2 members currently found.
                </p>
              ) : (
                level2Members.map((m) => {
                  const isCore =
                    m.positionKey === "core" ||
                    m.positionTitle.toLowerCase().includes("core");

                  return (
                    <div
                      key={m.id}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {m.fullName}
                          </span>
                          <span className="text-xs text-white/50">
                            ({m.rollNumber})
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              isCore
                                ? "border border-amber-400/40 bg-amber-400/15 text-amber-300"
                                : "border border-white/10 bg-white/5 text-white/60"
                            }`}
                          >
                            {isCore ? "★ Core Member" : "General Member"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-white/45">
                          Position: {m.positionTitle} · Level: {m.level} · Email: {m.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCore ? (
                          <button
                            onClick={() => handlePromoteToCore(m.id, false)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
                          >
                            <X className="h-3.5 w-3.5" />
                            Revoke Core
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePromoteToCore(m.id, true)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-amber-300"
                          >
                            <Award className="h-3.5 w-3.5" />
                            Promote to Core
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Position Management */}
      {activeTab === "positions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/60">
              Configure official roles, secretaries, and designations across Level 1, 2, and 3.
            </p>
            <button
              onClick={() => setShowNewPositionModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Position
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {positions.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-white">{p.title}</h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      p.level === 3
                        ? "bg-amber-400/15 text-amber-300"
                        : p.level === 2
                        ? "bg-sky-400/15 text-sky-300"
                        : "bg-emerald-400/15 text-emerald-300"
                    }`}
                  >
                    Level {p.level}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/45">Key: {p.key}</p>
                {p.description && (
                  <p className="mt-2 text-xs text-white/65">{p.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Member Management */}
      {activeTab === "members" && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="font-display text-base font-bold text-white">
            All Registered Members ({allMembers.length})
          </h3>
          <p className="mt-1 text-xs text-white/50">
            Activate, suspend, or reset security credentials for TVC members.
          </p>

          <div className="mt-4 space-y-3">
            {allMembers.map((m) => {
              const isSelf = m.id === currentMember.id;
              const isActive = m.accountStatus === "active";

              return (
                <div
                  key={m.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {m.fullName}
                      </span>
                      <span className="text-xs text-white/50">
                        ({m.rollNumber})
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isActive
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-rose-500/15 text-rose-300"
                        }`}
                      >
                        {m.accountStatus}
                      </span>
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
                        Level {m.level}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/45">
                      {m.positionTitle} · {m.email}
                    </p>
                  </div>

                  {!isSelf && (
                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <button
                          onClick={() =>
                            handleToggleMemberStatus(m.id, "inactive")
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleToggleMemberStatus(m.id, "active")
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Activate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Security & Audit Logs */}
      {activeTab === "audit" && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="font-display text-base font-bold text-white">
            System Audit & Governance Stream
          </h3>
          <p className="mt-1 text-xs text-white/50">
            Immutable log of promotions, role modifications, task creations, and administrative interventions.
          </p>

          <div className="mt-4 space-y-2">
            {auditLogs.length === 0 ? (
              <p className="py-8 text-center text-xs text-white/40">
                No audit entries recorded yet.
              </p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
                >
                  <div className="flex items-center justify-between text-white/45">
                    <span className="font-mono text-[10px] text-amber-300/80">
                      {log.action}
                    </span>
                    <span>
                      {new Date(log.createdAt || log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-white/80">
                    <strong>Actor:</strong> {log.actorName || log.actorId} (L
                    {log.actorLevel}) · <strong>Target:</strong> {log.targetType}{" "}
                    {log.targetId ? `(${log.targetId})` : ""}
                  </p>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <pre className="mt-1.5 overflow-x-auto rounded bg-black/40 p-2 text-[10px] text-white/60">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* New Position Modal */}
      {showNewPositionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <form
            onSubmit={handleCreatePosition}
            className="w-full max-w-md rounded-3xl border border-white/15 bg-[#090d16] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white">
                Add New Position
              </h3>
              <button
                type="button"
                onClick={() => setShowNewPositionModal(false)}
                className="rounded-xl border border-white/10 p-1.5 text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-white/70">
                  Position Title
                </label>
                <input
                  type="text"
                  required
                  value={newPosTitle}
                  onChange={(e) => {
                    setNewPosTitle(e.target.value);
                    if (!newPosKey) {
                      setNewPosKey(
                        e.target.value.toLowerCase().replace(/\s+/g, "_")
                      );
                    }
                  }}
                  placeholder="e.g. AI Research Secretary"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70">
                  Position Key (Unique identifier)
                </label>
                <input
                  type="text"
                  required
                  value={newPosKey}
                  onChange={(e) => setNewPosKey(e.target.value)}
                  placeholder="ai_research_secretary"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70">
                  Organisational Level
                </label>
                <select
                  value={newPosLevel}
                  onChange={(e) =>
                    setNewPosLevel(Number(e.target.value) as 1 | 2 | 3)
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0c121e] px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value={3}>Level 3 — Executive Leadership</option>
                  <option value={2}>Level 2 — Second Year</option>
                  <option value={1}>Level 1 — First Year</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70">
                  Description & Scope
                </label>
                <textarea
                  rows={3}
                  value={newPosDesc}
                  onChange={(e) => setNewPosDesc(e.target.value)}
                  placeholder="Key responsibilities and mandate..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowNewPositionModal(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingPos}
                className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-40"
              >
                {savingPos ? "Creating..." : "Create Position"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
