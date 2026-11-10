"use client";

import { useState, useEffect } from "react";
import {
  FileCheck,
  Check,
  X,
  Clock,
  Filter,
  User,
  Mail,
  Phone,
  BookOpen,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type {
  SafeMemberProfile,
  MembershipApplicationItem,
} from "@/lib/exclusive/types";

interface ApplicationsModuleProps {
  member: SafeMemberProfile;
}

export function ApplicationsModule({ member }: ApplicationsModuleProps) {
  const [applications, setApplications] = useState<MembershipApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<"all" | "1" | "2">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "accepted" | "rejected"
  >("pending");

  // Review modal
  const [reviewApp, setReviewApp] = useState<MembershipApplicationItem | null>(null);
  const [actionType, setActionType] = useState<"accepted" | "rejected">("accepted");
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const canApproveL2 =
    member.level === 3 ||
    member.permissions.includes("approve_level_2_applications");
  const canApproveL1 =
    member.level === 3 ||
    member.level === 2 ||
    member.permissions.includes("approve_level_1_applications");

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exclusive/applications");
      const json = await res.json();
      if (res.ok && json.applications) {
        setApplications(json.applications);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewApp) return;
    setSubmittingReview(true);

    try {
      const res = await fetch("/api/exclusive/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review",
          applicationId: reviewApp.id,
          decision: actionType,
          reviewNotes: reviewNotes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setActionSuccessMsg(
          `Application from ${reviewApp.fullName} has been ${actionType}.`
        );
        setReviewApp(null);
        setReviewNotes("");
        fetchApplications();
        setTimeout(() => setActionSuccessMsg(null), 4000);
      } else {
        alert(json.error || "Failed to process application review.");
      }
    } catch {
      alert("Network error processing application review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filtered = applications.filter((app) => {
    if (levelFilter !== "all" && String(app.targetLevel) !== levelFilter) {
      return false;
    }
    if (statusFilter !== "all" && app.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                <FileCheck className="h-4 w-4" />
              </span>
              <h2 className="font-display text-xl font-bold text-white">
                Membership Applications
              </h2>
            </div>
            <p className="mt-1 text-sm text-white/60">
              Review and onboard new talent into the TVC community. Level 3 reviews 2nd-year (Level 2) candidates; Level 2 & 3 review 1st-year (Level 1) candidates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white">
              Pending: {applications.filter((a) => a.status === "pending").length}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 flex flex-wrap gap-3">
          <div className="flex rounded-2xl bg-white/[0.04] p-1">
            {(
              [
                { id: "all", label: "All Levels" },
                { id: "2", label: "Level 2 (2nd Year)" },
                { id: "1", label: "Level 1 (1st Year)" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setLevelFilter(t.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  levelFilter === t.id
                    ? "bg-amber-400 text-slate-950"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex rounded-2xl bg-white/[0.04] p-1">
            {(
              [
                { id: "pending", label: "Pending" },
                { id: "accepted", label: "Accepted" },
                { id: "rejected", label: "Rejected" },
                { id: "all", label: "All Statuses" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === s.id
                    ? "bg-amber-400 text-slate-950"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          {actionSuccessMsg}
        </div>
      )}

      {/* Applications List */}
      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] py-20 text-center text-sm text-white/40">
          Loading membership applications...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] py-20 text-center text-sm text-white/40">
          No applications match the selected filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const isEligibleToReview =
              (app.targetLevel === 2 && canApproveL2) ||
              (app.targetLevel === 1 && canApproveL1);

            return (
              <div
                key={app.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-amber-400/40 hover:bg-white/[0.04]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-lg font-bold text-white">
                        {app.fullName}
                      </h3>
                      <span className="text-xs text-white/50">
                        ({app.rollNumber})
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          app.targetLevel === 2
                            ? "border border-sky-400/40 bg-sky-400/15 text-sky-300"
                            : "border border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                        }`}
                      >
                        Target: Level {app.targetLevel}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          app.status === "accepted"
                            ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                            : app.status === "rejected"
                            ? "border border-rose-500/40 bg-rose-500/15 text-rose-300"
                            : "border border-amber-400/40 bg-amber-400/15 text-amber-300"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-white/60">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {app.universityEmail}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {app.phone}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        Year {app.academic_year}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Applied:{" "}
                        {new Date(
                          app.submitted_at ||
                            app.createdAt ||
                            new Date().toISOString()
                        ).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Department Interests & Skills */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(app.department_interests || app.departmentInterests || []).map((dept, i) => (
                        <span
                          key={i}
                          className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300"
                        >
                          Dept: {dept}
                        </span>
                      ))}
                      {(app.skills || []).map((skill, i) => (
                        <span
                          key={i}
                          className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Motivation / Experience */}
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs leading-relaxed text-white/80">
                      <p className="font-semibold text-white/90">
                        Motivation for joining TVC:
                      </p>
                      <p className="mt-1">{app.motivation}</p>

                      {app.previous_experience && (
                        <div className="mt-2.5 border-t border-white/5 pt-2">
                          <p className="font-semibold text-white/90">
                            Previous Experience:
                          </p>
                          <p className="mt-1">
                            {app.previous_experience}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Review Notes if processed */}
                    {app.reviewNotes && (
                      <div className="text-xs text-white/50">
                        <strong>Review Note:</strong> {app.reviewNotes} (Reviewed
                        by {app.reviewedByName || "TVC Board"})
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {app.status === "pending" && (
                    <div className="flex shrink-0 gap-2">
                      {isEligibleToReview ? (
                        <>
                          <button
                            onClick={() => {
                              setReviewApp(app);
                              setActionType("accepted");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              setReviewApp(app);
                              setActionType("rejected");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/30"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/40">
                          {app.targetLevel === 2
                            ? "Level 3 Executive Authority Required"
                            : "Level 2/3 Authority Required"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <form
            onSubmit={handleReviewSubmit}
            className="w-full max-w-md rounded-3xl border border-white/15 bg-[#090d16] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Confirm {actionType === "accepted" ? "Acceptance" : "Rejection"}
                </h3>
                <p className="text-xs text-white/55">
                  Candidate: {reviewApp.fullName} ({reviewApp.rollNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewApp(null)}
                className="rounded-xl border border-white/10 p-1.5 text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-white/70">
              {actionType === "accepted"
                ? `Approving this application will automatically activate their member profile at Level ${reviewApp.targetLevel} and provision their TVC Exclusive access.`
                : "Rejecting this application will record the decision and archive the submission."}
            </p>

            <div className="mt-4">
              <label className="text-xs font-medium text-white/70">
                {actionType === "accepted"
                  ? "Welcome / Onboarding Note (Optional)"
                  : "Rejection Feedback / Internal Reason (Optional)"}
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter feedback or internal remarks..."
                className="mt-1.5 w-full rounded-2xl border border-white/15 bg-white/[0.04] p-3 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewApp(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className={`rounded-xl px-4 py-2 text-xs font-bold text-slate-950 transition ${
                  actionType === "accepted"
                    ? "bg-emerald-400 hover:bg-emerald-300"
                    : "bg-rose-400 hover:bg-rose-300"
                } disabled:opacity-40`}
              >
                {submittingReview
                  ? "Processing..."
                  : `Confirm ${actionType === "accepted" ? "Accept" : "Reject"}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
