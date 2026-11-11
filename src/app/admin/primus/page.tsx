"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/primus/firebase-client";

type Member = {
  uid?: string;
  name: string;
  email: string;
  phone: string;
  hostel: string;
  role: "leader" | "member" | string;
};

type Team = {
  code: string;
  teamName: string;
  track: "Product" | "Consulting" | "Finance";
  leaderUid: string;
  leaderEmail: string;
  members: Member[];
  status: "OPEN" | "SUBMITTED";
  createdAt: string;
  submittedAt: string | null;
};

type Summary = {
  totalTeams: number;
  submittedTeams: number;
  openTeams: number;
  totalParticipants: number;
  byTrack: Record<"Product" | "Consulting" | "Finance", number>;
};

type DashboardResponse = {
  teams: Team[];
  summary: Summary;
  pagination: {
    pageSize: number;
    totalFiltered: number | null;
    hasMore: boolean;
    nextCursor: string | null;
  };
};

const emptySummary: Summary = {
  totalTeams: 0,
  submittedTeams: 0,
  openTeams: 0,
  totalParticipants: 0,
  byTrack: { Product: 0, Consulting: 0, Finance: 0 },
};

const inputClass =
  "w-full border border-white/15 bg-[#080d09] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#a3ff12]/70";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="flex items-center justify-between text-white/45">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em]">{label}</span>
        {icon}
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{value.toLocaleString("en-IN")}</p>
      <p className="mt-2 text-xs text-white/40">{detail}</p>
    </div>
  );
}

export default function PrimusAdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [track, setTrack] = useState("");
  const [status, setStatus] = useState("");
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalFiltered, setTotalFiltered] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [exporting, setExporting] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const currentCursor = cursorStack[cursorStack.length - 1] ?? null;
  const pageNumber = cursorStack.length;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      setError("");
      setAccessDenied(false);
      if (!nextUser) {
        setTeams([]);
        setSelectedTeam(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");
      setAccessDenied(false);
      try {
        const token = await user!.getIdToken(true);
        const params = new URLSearchParams({ limit: "25" });
        if (currentCursor) params.set("cursor", currentCursor);
        if (appliedSearch) params.set("q", appliedSearch);
        if (track) params.set("track", track);
        if (status) params.set("status", status);
        const response = await fetch(`/api/primus/admin/registrations?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = await response.json();
        if (!response.ok) {
          if (response.status === 403) setAccessDenied(true);
          throw new Error(payload.message || "Unable to load registrations.");
        }
        if (!active) return;
        const data = payload as DashboardResponse;
        setTeams(data.teams);
        setSummary(data.summary);
        setNextCursor(data.pagination.nextCursor);
        setTotalFiltered(data.pagination.totalFiltered);
        setSelectedTeam((current) =>
          current ? data.teams.find((team) => team.code === current.code) || null : null
        );
      } catch (err) {
        if (!active || (err instanceof Error && err.name === "AbortError")) return;
        setError(err instanceof Error ? err.message : "Unable to load registrations.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [user, currentCursor, appliedSearch, track, status]);

  function resetPagination() {
    setCursorStack([null]);
    setSelectedTeam(null);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(searchInput.trim());
    resetPagination();
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true);
    setError("");
    try {
      await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      setPassword("");
      setNotice("Signed in. Checking administrator access…");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleExport() {
    if (!user) return;
    setExporting(true);
    setError("");
    try {
      const token = await user.getIdToken(true);
      const params = new URLSearchParams({ format: "csv" });
      if (appliedSearch) params.set("q", appliedSearch);
      if (track) params.set("track", track);
      if (status) params.set("status", status);
      const response = await fetch(`/api/primus/admin/registrations?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || "Unable to export registrations.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "primus-registrations.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setNotice("Filtered registrations exported.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to export registrations.");
    } finally {
      setExporting(false);
    }
  }

  const trackBreakdown = useMemo(
    () => [
      { name: "Product", count: summary.byTrack.Product },
      { name: "Consulting", count: summary.byTrack.Consulting },
      { name: "Finance", count: summary.byTrack.Finance },
    ],
    [summary]
  );

  if (!authReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020503] px-5 text-sm text-white/50">
        Checking administrator session…
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020503] px-5 py-16 text-[#efffed]">
        <section className="w-full max-w-lg border border-white/10 bg-[#071009] p-7 sm:p-10">
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/45 hover:text-[#a3ff12]">
            <ArrowLeft className="h-3.5 w-3.5" /> TVC website
          </Link>
          <div className="mt-10 flex h-12 w-12 items-center justify-center border border-[#a3ff12]/30 text-[#a3ff12]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.22em] text-[#a3ff12]">PRIMUS’26 / Admin</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em]">Registration control.</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            Sign in with an approved administrator account. Access is checked by the server against the PRIMUS admin allowlist.
          </p>
          <form onSubmit={handleSignIn} className="mt-8 space-y-5">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50">
              Admin email
              <input className={`${inputClass} mt-2`} type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50">
              Password
              <input className={`${inputClass} mt-2`} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            {error && <p role="alert" className="border border-red-400/25 bg-red-400/5 p-3 text-sm text-red-200">{error}</p>}
            <button disabled={authBusy} className="w-full bg-[#a3ff12] px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-[#c2ff70] disabled:opacity-50">
              {authBusy ? "Signing in…" : "Sign in securely"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020503] px-4 pb-20 pt-8 text-[#efffed] sm:px-7 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/40 transition hover:text-[#a3ff12]">
              <ArrowLeft className="h-3 w-3" /> Back to TVC
            </Link>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#a3ff12]">Thapar Venture Club / PRIMUS’26</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.065em] sm:text-5xl">Registration overview.</h1>
            <p className="mt-3 text-xs text-white/40">Signed in as {user.email || "administrator"}</p>
          </div>
          <button onClick={() => void signOut(firebaseAuth)} className="border border-white/15 px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-white/55 transition hover:border-white/40 hover:text-white">
            Sign out
          </button>
        </header>

        {accessDenied ? (
          <section className="mt-10 max-w-2xl border border-red-400/25 bg-red-400/[0.04] p-7">
            <AlertCircle className="h-7 w-7 text-red-300" />
            <h2 className="mt-5 text-2xl font-semibold">Administrator access not granted.</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              This Firebase account is signed in, but its UID is not included in the server-side PRIMUS_ADMIN_UIDS allowlist. Ask the project administrator to add the correct UID in the hosting environment, then sign in again.
            </p>
            <button onClick={() => void signOut(firebaseAuth)} className="mt-6 border border-white/20 px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-white/65">Sign out</button>
          </section>
        ) : (
          <>
            <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Teams registered" value={summary.totalTeams} detail="Across all three tracks" icon={<Users className="h-4 w-4" />} />
              <StatCard label="Participants" value={summary.totalParticipants} detail="Unique registered accounts" icon={<Users className="h-4 w-4" />} />
              <StatCard label="Submitted" value={summary.submittedTeams} detail="Locked team registrations" icon={<CheckCircle2 className="h-4 w-4" />} />
              <StatCard label="In progress" value={summary.openTeams} detail="Teams not yet submitted" icon={<Clock3 className="h-4 w-4" />} />
            </section>

            <section className="mt-4 grid gap-3 md:grid-cols-3">
              {trackBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between border border-white/10 px-5 py-4">
                  <span className="text-sm text-white/55">{item.name}</span>
                  <span className="font-mono text-lg text-white">{item.count.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </section>

            <section className="mt-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a3ff12]">Live records</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Team registrations</h2>
                </div>
                <button onClick={() => void handleExport()} disabled={exporting || loading} className="inline-flex items-center gap-2 border border-[#a3ff12]/35 px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-[#caff8c] transition hover:bg-[#a3ff12]/10 disabled:opacity-40">
                  <ArrowDownToLine className="h-3.5 w-3.5" /> {exporting ? "Preparing…" : "Export filtered CSV"}
                </button>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_190px_190px]">
                <form onSubmit={handleSearch} className="flex min-w-0">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input className={`${inputClass} h-full pl-11`} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search team, code, participant, email or phone" />
                  </div>
                  <button className="border border-l-0 border-white/15 px-5 font-mono text-[9px] uppercase tracking-widest text-white/70 hover:text-[#a3ff12]">Search</button>
                </form>
                <select aria-label="Filter by track" className={inputClass} value={track} onChange={(event) => { setTrack(event.target.value); resetPagination(); }}>
                  <option value="">All tracks</option>
                  <option value="Product">Product</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Finance">Finance</option>
                </select>
                <select aria-label="Filter by status" className={inputClass} value={status} onChange={(event) => { setStatus(event.target.value); resetPagination(); }}>
                  <option value="">All statuses</option>
                  <option value="OPEN">In progress</option>
                  <option value="SUBMITTED">Submitted</option>
                </select>
              </div>

              {(appliedSearch || track || status) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/45">
                  <span>Active filters:</span>
                  {appliedSearch && <span className="border border-white/10 px-2 py-1">Search: {appliedSearch}</span>}
                  {track && <span className="border border-white/10 px-2 py-1">{track}</span>}
                  {status && <span className="border border-white/10 px-2 py-1">{status}</span>}
                  <button onClick={() => { setSearchInput(""); setAppliedSearch(""); setTrack(""); setStatus(""); resetPagination(); }} className="inline-flex items-center gap-1 text-[#a3ff12] hover:text-white"><X className="h-3 w-3" /> Clear</button>
                </div>
              )}

              {notice && <p role="status" className="mt-4 border border-[#a3ff12]/20 bg-[#a3ff12]/5 px-4 py-3 text-xs text-[#dfffbe]">{notice}</p>}
              {error && <p role="alert" className="mt-4 border border-red-400/25 bg-red-400/5 px-4 py-3 text-xs text-red-200">{error}</p>}

              <div className="mt-5 overflow-hidden border border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.025] px-4 py-3 sm:px-5">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/45">
                    {loading ? "Loading records…" : totalFiltered === null ? `Page ${pageNumber} · ${teams.length} shown` : `${totalFiltered.toLocaleString("en-IN")} matching teams`}
                  </p>
                  <p className="text-[10px] text-white/35">Refresh the page to retrieve the latest registrations.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] border-collapse text-left">
                    <thead className="bg-white/[0.02] font-mono text-[9px] uppercase tracking-widest text-white/35">
                      <tr>
                        <th className="px-5 py-4 font-normal">Team</th>
                        <th className="px-5 py-4 font-normal">Track</th>
                        <th className="px-5 py-4 font-normal">Members</th>
                        <th className="px-5 py-4 font-normal">Created</th>
                        <th className="px-5 py-4 font-normal">Status</th>
                        <th className="px-5 py-4 font-normal">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.07]">
                      {teams.map((team) => (
                        <tr key={team.code} className={selectedTeam?.code === team.code ? "bg-[#a3ff12]/[0.045]" : "transition hover:bg-white/[0.025]"}>
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-white">{team.teamName || "Untitled team"}</p>
                            <p className="mt-1 font-mono text-[10px] tracking-wider text-white/35">{team.code}</p>
                          </td>
                          <td className="px-5 py-4 text-xs text-white/65">{team.track}</td>
                          <td className="px-5 py-4 text-xs tabular-nums text-white/65">{Array.isArray(team.members) ? team.members.length : 0}/4</td>
                          <td className="px-5 py-4 text-xs text-white/45">{formatDate(team.createdAt)}</td>
                          <td className="px-5 py-4">
                            <span className={team.status === "SUBMITTED" ? "inline-flex items-center gap-1.5 border border-[#a3ff12]/25 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-[#caff8c]" : "inline-flex items-center gap-1.5 border border-amber-300/20 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-amber-200"}>
                              <span className={team.status === "SUBMITTED" ? "h-1.5 w-1.5 rounded-full bg-[#a3ff12]" : "h-1.5 w-1.5 rounded-full bg-amber-300"} />
                              {team.status === "SUBMITTED" ? "Submitted" : "In progress"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button onClick={() => setSelectedTeam((current) => current?.code === team.code ? null : team)} className="font-mono text-[9px] uppercase tracking-widest text-[#a3ff12] hover:text-white">
                              {selectedTeam?.code === team.code ? "Close" : "View team"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!loading && teams.length === 0 && (
                        <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-white/40">No registrations match these filters.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 sm:px-5">
                  <button disabled={pageNumber <= 1 || loading} onClick={() => { setCursorStack((stack) => stack.slice(0, -1)); setSelectedTeam(null); }} className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-white/55 hover:text-white disabled:opacity-25">
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                  </button>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/35">Page {pageNumber}</span>
                  <button disabled={!nextCursor || loading} onClick={() => { if (nextCursor) setCursorStack((stack) => [...stack, nextCursor]); setSelectedTeam(null); }} className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-white/55 hover:text-white disabled:opacity-25">
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {selectedTeam && (
              <section className="mt-6 border border-[#a3ff12]/20 bg-[#071009] p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-[#a3ff12]">Team detail / {selectedTeam.code}</p>
                    <h3 className="mt-2 text-2xl font-semibold">{selectedTeam.teamName}</h3>
                    <p className="mt-2 text-xs text-white/45">{selectedTeam.track} · Created {formatDate(selectedTeam.createdAt)} · Submitted {formatDate(selectedTeam.submittedAt)}</p>
                  </div>
                  <button aria-label="Close team details" onClick={() => setSelectedTeam(null)} className="border border-white/15 p-2 text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left">
                    <thead className="font-mono text-[9px] uppercase tracking-widest text-white/35">
                      <tr><th className="pb-3 font-normal">Participant</th><th className="pb-3 font-normal">Email</th><th className="pb-3 font-normal">Phone</th><th className="pb-3 font-normal">Hall</th><th className="pb-3 font-normal">Role</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.07] text-xs text-white/65">
                      {selectedTeam.members.map((member) => (
                        <tr key={member.uid || member.email}>
                          <td className="py-3 pr-4 text-white">{member.name}</td>
                          <td className="py-3 pr-4">{member.email}</td>
                          <td className="py-3 pr-4">{member.phone}</td>
                          <td className="py-3 pr-4">{member.hostel}</td>
                          <td className="py-3 pr-4 capitalize">{member.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
