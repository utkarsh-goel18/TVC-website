"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MessageSquare,
  Mail,
  Phone,
  ShieldCheck,
  Building,
  ExternalLink,
  Award,
} from "lucide-react";
import type { SafeMemberProfile } from "@/lib/exclusive/types";

interface DirectoryModuleProps {
  currentMember: SafeMemberProfile;
  onStartDirectMessage: (peerId: string) => void;
}

export function DirectoryModule({
  currentMember,
  onStartDirectMessage,
}: DirectoryModuleProps) {
  const [members, setMembers] = useState<SafeMemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exclusive/members");
      const json = await res.json();
      if (res.ok && json.members) {
        setMembers(json.members);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const allDepartments = Array.from(
    new Set(
      members.flatMap((m) =>
        m.departments.map((d) => (typeof d === "string" ? d : d.name))
      )
    )
  ).filter(Boolean);

  const filteredMembers = members.filter((m) => {
    if (levelFilter !== "all" && String(m.level) !== levelFilter) {
      return false;
    }
    if (deptFilter !== "all") {
      const hasDept = m.departments.some((d) =>
        (typeof d === "string" ? d : d.name)
          .toLowerCase()
          .includes(deptFilter.toLowerCase())
      );
      if (!hasDept) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.fullName.toLowerCase().includes(q);
      const matchRoll = m.rollNumber.toLowerCase().includes(q);
      const matchPosition = m.positionTitle.toLowerCase().includes(q);
      const matchEmail = m.email.toLowerCase().includes(q);
      return matchName || matchRoll || matchPosition || matchEmail;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <h2 className="font-display text-xl font-bold text-white">
                Member Directory
              </h2>
            </div>
            <p className="mt-1 text-sm text-white/60">
              Browse and connect with all verified TVC active members across Level 1, 2, and 3.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white">
              Total Active: {members.length}
            </span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
          <div className="relative lg:col-span-6">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, roll number, title, or email..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/35 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="relative lg:col-span-3">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              aria-label="Filter by organizational level"
              className="w-full appearance-none rounded-2xl border border-white/10 bg-[#0c121e] py-2.5 pl-9 pr-8 text-xs text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="all">All Organisational Levels</option>
              <option value="3">Level 3 — Executive Board</option>
              <option value="2">Level 2 — Second Year (Core/General)</option>
              <option value="1">Level 1 — First Year</option>
            </select>
          </div>

          <div className="relative lg:col-span-3">
            <Building className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              aria-label="Filter by department"
              className="w-full appearance-none rounded-2xl border border-white/10 bg-[#0c121e] py-2.5 pl-9 pr-8 text-xs text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="all">All Departments</option>
              {allDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] py-20 text-center text-sm text-white/40">
          Loading member directory...
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] py-20 text-center text-sm text-white/40">
          No members matched your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredMembers.map((m) => {
            const isSelf = m.id === currentMember.id;
            const isCore =
              m.level === 2 && m.positionTitle.toLowerCase().includes("core");

            return (
              <div
                key={m.id}
                className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-amber-400/40 hover:bg-white/[0.05]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-amber-400/20 to-purple-500/20 font-display text-sm font-bold text-amber-300">
                        {m.fullName
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-white">
                            {m.fullName}
                          </h3>
                          {isSelf && (
                            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-white/70">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50">{m.rollNumber}</p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        m.level === 3
                          ? "border border-amber-400/40 bg-amber-400/15 text-amber-300"
                          : m.level === 2
                          ? "border border-sky-400/40 bg-sky-400/15 text-sky-300"
                          : "border border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                      }`}
                    >
                      Level {m.level}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Award className="h-3.5 w-3.5 text-amber-300" />
                      <span className="font-medium text-white/90">
                        {m.positionTitle}
                      </span>
                      {isCore && (
                        <span className="rounded-md bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-semibold text-amber-200">
                          Core Member
                        </span>
                      )}
                    </div>

                    {m.departments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {m.departments.map((dept, i) => {
                          const name =
                            typeof dept === "string" ? dept : dept.name;
                          return (
                            <span
                              key={i}
                              className="rounded-lg border border-white/5 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/70"
                            >
                              {name}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {m.bio && (
                      <p className="line-clamp-2 text-xs text-white/60">
                        {m.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-white/45">
                      {m.phone && (
                        <a
                          href={`tel:${m.phone}`}
                          title={`Call ${m.phone}`}
                          className="hover:text-white"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <a
                        href={`mailto:${m.email}`}
                        title={m.email}
                        className="hover:text-white"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    {!isSelf && (
                      <button
                        onClick={() => onStartDirectMessage(m.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-400 hover:text-slate-950"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

