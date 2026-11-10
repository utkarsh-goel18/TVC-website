"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Lock,
  ArrowUpRight,
  ShieldAlert,
  UserPlus,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Terminal,
} from "lucide-react";
import { PublicMemberView } from "@/lib/exclusive/types";

interface ExclusiveAuthGateProps {
  inactiveNotice?: {
    message: string;
    memberName?: string;
    rollNumber?: string;
  } | null;
  onAuthenticated: (member: PublicMemberView, token: string) => void;
}

const TEST_FIXTURES = [
  {
    label: "Level 3 — President",
    name: "Pranav Kapoor",
    roll: "102203000",
    badge: "L3 EXEC",
  },
  {
    label: "Level 3 — General Secretary",
    name: "Sanchit Sehgal",
    roll: "102203001",
    badge: "L3 EXEC",
  },
  {
    label: "Level 3 — Joint Secretary",
    name: "Aadish Jain",
    roll: "102203004",
    badge: "L3 EXEC",
  },
  {
    label: "Level 3 — Design Secretary",
    name: "Vansh Goyal",
    roll: "102203014",
    badge: "L3 EXEC",
  },
  {
    label: "Level 3 — Tech Secretary",
    name: "Vidhi Saxena",
    roll: "102203013",
    badge: "L3 EXEC",
  },
  {
    label: "Level 2 — Core Member",
    name: "Arjun Mehta",
    roll: "102303101",
    badge: "L2 CORE",
  },
  {
    label: "Level 2 — General Member",
    name: "Riya Sharma",
    roll: "102303102",
    badge: "L2 GEN",
  },
  {
    label: "Level 1 — General Member",
    name: "Aarav Gupta",
    roll: "102403201",
    badge: "L1 GEN",
  },
];

const DEPARTMENTS_LIST = [
  "Media",
  "Outreach",
  "Marketing",
  "Tech",
  "Design",
  "Logistics",
  "Creativity",
];

export function ExclusiveAuthGate({
  inactiveNotice,
  onAuthenticated,
}: ExclusiveAuthGateProps) {
  const [activeTab, setActiveTab] = useState<"login" | "apply" | "reset">("login");

  // Login state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset password state
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [issuedTokenPreview, setIssuedTokenPreview] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Application state
  const [appFullName, setAppFullName] = useState("");
  const [appRoll, setAppRoll] = useState("");
  const [appEmail, setAppEmail] = useState("");
  const [appPhone, setAppPhone] = useState("");
  const [appLevel, setAppLevel] = useState<1 | 2>(1);
  const [appYear, setAppYear] = useState("1st Year");
  const [appDepts, setAppDepts] = useState<string[]>(["Tech"]);
  const [appSkills, setAppSkills] = useState("");
  const [appExperience, setAppExperience] = useState("");
  const [appMotivation, setAppMotivation] = useState("");
  const [appAdditional, setAppAdditional] = useState("");
  const [appSuccess, setAppSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/exclusive/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Sign-in failed.");
      } else if (data.member && data.token) {
        onAuthenticated(data.member, data.token);
      }
    } catch {
      setError("Network error while connecting to TVC Exclusive.");
    } finally {
      setLoading(false);
    }
  };

  const quickFixtureLogin = async (roll: string) => {
    setIdentifier(roll);
    setPassword("TVC@2026#Exec");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/exclusive/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: roll, password: "TVC@2026#Exec" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Quick sign-in failed.");
      } else if (data.member && data.token) {
        onAuthenticated(data.member, data.token);
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/exclusive/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", identifier: resetIdentifier }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Unable to request reset.");
      } else {
        setResetMessage(data.message);
        if (data.resetToken) {
          setIssuedTokenPreview(data.resetToken);
          setResetToken(data.resetToken);
        }
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/exclusive/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          token: resetToken,
          newPassword: resetNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Password reset failed.");
      } else {
        setResetMessage(data.message);
        setIssuedTokenPreview(null);
        setTimeout(() => setActiveTab("login"), 1200);
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAppSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/exclusive/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: appFullName,
          roll_number: appRoll,
          email: appEmail,
          phone: appPhone,
          requested_level: appLevel,
          academic_year: appYear,
          department_interests: appDepts,
          skills: appSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          previous_experience: appExperience,
          motivation: appMotivation,
          additional_info: appAdditional,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Application submission failed.");
      } else {
        setAppSuccess(data.message);
        setAppFullName("");
        setAppRoll("");
        setAppEmail("");
        setAppPhone("");
        setAppSkills("");
        setAppExperience("");
        setAppMotivation("");
        setAppAdditional("");
      }
    } catch {
      setError("Network error submitting application.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDept = (dept: string) => {
    setAppDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] pt-20 pb-20 text-[#e8e7e3]">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        {/* Top Eyebrow Header */}
        <div className="mb-10 border-b border-white/[0.08] pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 border border-[#f5ed00]/30 bg-[#f5ed00]/[0.06] px-3 py-1 font-mono text-[11px] tracking-[0.18em] text-[#f5ed00] uppercase">
                <Lock className="h-3 w-3" />
                TVC EXCLUSIVE // PRIVATE MEMBER OPERATING SYSTEM
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Thapar Venture Club{" "}
                <span className="text-[#f5ed00]">Exclusive.</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#9e9d99] sm:text-base">
                Internal executive &amp; member workspace for task delegation,
                department communities, application onboarding, and real-time
                collaboration.
              </p>
            </div>

            <div className="flex items-center gap-2 border border-white/10 bg-[#131312] p-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setError(null);
                }}
                className={`px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                  activeTab === "login"
                    ? "bg-[#f5ed00] font-semibold text-black"
                    : "text-[#9e9d99] hover:text-white"
                }`}
              >
                Member Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("apply");
                  setError(null);
                }}
                className={`px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                  activeTab === "apply"
                    ? "bg-[#f5ed00] font-semibold text-black"
                    : "text-[#9e9d99] hover:text-white"
                }`}
              >
                Apply for Membership
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("reset");
                  setError(null);
                }}
                className={`px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                  activeTab === "reset"
                    ? "bg-[#f5ed00] font-semibold text-black"
                    : "text-[#9e9d99] hover:text-white"
                }`}
              >
                Password Reset
              </button>
            </div>
          </div>
        </div>

        {inactiveNotice && (
          <div className="mb-8 flex items-start gap-4 border border-red-500/40 bg-red-500/10 p-5 text-red-200">
            <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
            <div>
              <h3 className="font-mono text-xs font-semibold tracking-wider text-red-300 uppercase">
                Access Denied — Account Inactive or Suspended
              </h3>
              <p className="mt-1 text-sm">{inactiveNotice.message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <ShieldAlert className="h-4 w-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === "login" && (
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Left Column: Member Login Card */}
            <div className="lg:col-span-5">
              <div className="border border-white/10 bg-[#131312] p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-white/[0.07] pb-5">
                  <div className="relative h-9 w-9 flex-shrink-0 border border-[#f5ed00]/30 bg-black p-1.5">
                    <Image
                      src="/brand/tvc-rocket-emblem.png"
                      alt="TVC"
                      fill
                      sizes="36px"
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Member Authentication
                    </h2>
                    <p className="font-mono text-[11px] tracking-wider text-[#6b6a66] uppercase">
                      TIET Roll Number or Username
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="mb-2 block font-mono text-xs tracking-wider text-[#9e9d99] uppercase">
                      Roll Number / Username
                    </label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. 102203001 or sanchit-sehgal"
                      className="w-full border border-white/15 bg-[#0a0a09] px-4 py-3 text-sm text-white placeholder-[#6b6a66] focus:border-[#f5ed00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-mono text-xs tracking-wider text-[#9e9d99] uppercase">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your TVC Exclusive password"
                      className="w-full border border-white/15 bg-[#0a0a09] px-4 py-3 text-sm text-white placeholder-[#6b6a66] focus:border-[#f5ed00] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 bg-[#f5ed00] px-6 py-3.5 font-mono text-xs font-bold tracking-[0.16em] text-black uppercase transition-colors hover:bg-[#ded700] disabled:opacity-50"
                  >
                    {loading ? "VERIFYING CREDENTIALS..." : "ENTER TVC EXCLUSIVE"}
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </form>

                <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-4 text-xs text-[#9e9d99]">
                  <button
                    type="button"
                    onClick={() => setActiveTab("reset")}
                    className="hover:text-[#f5ed00]"
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("apply")}
                    className="font-mono text-[#f5ed00] hover:underline"
                  >
                    New Candidate? Apply →
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Role & Permission Test Fixtures */}
            <div className="lg:col-span-7">
              <div className="border border-white/10 bg-[#131312] p-6 sm:p-8">
                <div className="mb-5 flex items-center justify-between border-b border-white/[0.07] pb-4">
                  <div className="flex items-center gap-2.5">
                    <Terminal className="h-4 w-4 text-[#f5ed00]" />
                    <h3 className="font-mono text-xs font-semibold tracking-[0.16em] text-white uppercase">
                      Verified Organisational Test Fixtures (One-Click Sign-In)
                    </h3>
                  </div>
                  <span className="border border-[#f5ed00]/30 bg-[#f5ed00]/10 px-2.5 py-0.5 font-mono text-[10px] text-[#f5ed00]">
                    Access Code: TVC@2026#Exec
                  </span>
                </div>

                <p className="mb-5 text-xs leading-relaxed text-[#9e9d99]">
                  Select any of the 8 pre-provisioned TVC accounts below to
                  inspect Level 3 Executive Leadership, Level 2 Core &amp;
                  General Members, or Level 1 General Member permissions:
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {TEST_FIXTURES.map((fix) => (
                    <button
                      key={fix.roll}
                      type="button"
                      disabled={loading}
                      onClick={() => quickFixtureLogin(fix.roll)}
                      className="group flex flex-col justify-between border border-white/10 bg-[#0d0d0d] p-4 text-left transition-all hover:border-[#f5ed00]/60 hover:bg-[#181816]"
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="font-mono text-[10px] tracking-widest text-[#f5ed00] uppercase">
                          {fix.badge}
                        </span>
                        <span className="font-mono text-[11px] text-[#6b6a66] group-hover:text-white">
                          Roll: {fix.roll}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-white group-hover:text-[#f5ed00]">
                          {fix.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#9e9d99]">
                          {fix.label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 border-t border-white/[0.07] pt-4">
                  <p className="font-mono text-[11px] text-[#9e9d99]">
                    All 17 existing Executive Board members from{" "}
                    <code className="text-[#f5ed00]">src/data/team.ts</code>{" "}
                    (Roll numbers <code className="text-white">102203001</code>{" "}
                    – <code className="text-white">102203017</code>) are also
                    provisioned as Level 3 accounts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "apply" && (
          <div className="mx-auto max-w-3xl border border-white/10 bg-[#131312] p-6 sm:p-10">
            <div className="mb-6 flex items-center gap-3 border-b border-white/[0.08] pb-5">
              <UserPlus className="h-6 w-6 text-[#f5ed00]" />
              <div>
                <h2 className="text-xl font-semibold text-white">
                  TVC Membership Application
                </h2>
                <p className="text-xs text-[#9e9d99]">
                  Apply for Level 1 (First-Year) or Level 2 (Second-Year)
                  membership at Thapar Venture Club.
                </p>
              </div>
            </div>

            {appSuccess && (
              <div className="mb-6 flex items-start gap-3 border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                <div>
                  <p className="font-semibold">{appSuccess}</p>
                  <p className="mt-1 text-xs text-emerald-300/80">
                    Once approved by TVC reviewers, your account will be
                    activated with access to TVC Exclusive.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-mono text-xs text-[#9e9d99] uppercase">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={appFullName}
                    onChange={(e) => setAppFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full border border-white/15 bg-[#0a0a09] px-3.5 py-2.5 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-xs text-[#9e9d99] uppercase">
                    TIET Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={appRoll}
                    onChange={(e) => setAppRoll(e.target.value)}
                    placeholder="e.g. 102403310"
                    className="w-full border border-white/15 bg-[#0a0a09] px-3.5 py-2.5 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-mono text-xs text-[#9e9d99] uppercase">
                    University Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={appEmail}
                    onChange={(e) => setAppEmail(e.target.value)}
                    placeholder="name_be24@thapar.edu"
                    className="w-full border border-white/15 bg-[#0a0a09] px-3.5 py-2.5 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-xs text-[#9e9d99] uppercase">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={appPhone}
                    onChange={(e) => setAppPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full border border-white/15 bg-[#0a0a09] px-3.5 py-2.5 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-mono text-xs text-[#9e9d99] uppercase">
                    Membership Level Applying For *
                  </label>
                  <select
                    value={appLevel}
                    onChange={(e) => {
                      const lvl = Number(e.target.value) === 2 ? 2 : 1;
                      setAppLevel(lvl);
                      setAppYear(lvl === 2 ? "2nd Year" : "1st Year");
                    }}
                    className="w-full border border-white/15 bg-[#0a0a09] px-3.5 py-2.5 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                  >
                    <option value={1}>
                      Level 1 — First-Year Associate Member (Reviewed by Level 2)
                    </option>
                    <option value={2}>
                      Level 2 — Second-Year Member (Reviewed by Level 3 Executive)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-xs text-[#9e9d99] uppercase">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={appYear}
                    onChange={(e) => setAppYear(e.target.value)}
                    className="w-full border border-white/15 bg-[#0a0a09] px-3.5 py-2.5 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-mono text-xs text-[#9e9d99] uppercase">
                  Department Interests (Select one or more)
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEPARTMENTS_LIST.map((dept) => {
                    const selected = appDepts.includes(dept);
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => toggleDept(dept)}
                        className={`border px-3.5 py-1.5 font-mono text-xs transition-colors ${
                          selected
                            ? "border-[#f5ed00] bg-[#f5ed00] font-semibold text-black"
                            : "border-white/15 bg-[#0a0a09] text-[#9e9d99] hover:text-white"
                        }`}
                      >
                        {dept}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-xs text-[#9e9d99] uppercase">
                  Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={appSkills}
                  onChange={(e) => setAppSkills(e.target.value)}
                  placeholder="e.g. TypeScript, Figma, Sponsorships, Video Editing"
                  className="w-full border border-white/15 bg-[#0a0a09] px-3.5 py-2.5 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-xs text-[#9e9d99] uppercase">
                  Previous Experience
                </label>
                <textarea
                  rows={2}
                  value={appExperience}
                  onChange={(e) => setAppExperience(e.target.value)}
                  placeholder="Projects, societies, competitions, or creative portfolios..."
                  className="w-full border border-white/15 bg-[#0a0a09] px-3.5 py-2.5 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-xs text-[#9e9d99] uppercase">
                  Motivation for Joining TVC *
                </label>
                <textarea
                  rows={3}
                  required
                  value={appMotivation}
                  onChange={(e) => setAppMotivation(e.target.value)}
                  placeholder="How do you want to contribute to Thapar Venture Club?"
                  className="w-full border border-white/15 bg-[#0a0a09] px-3.5 py-2.5 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-xs text-[#9e9d99] uppercase">
                  Additional Information / Portfolio Links
                </label>
                <input
                  type="text"
                  value={appAdditional}
                  onChange={(e) => setAppAdditional(e.target.value)}
                  placeholder="GitHub, Behance, LinkedIn, or Drive links..."
                  className="w-full border border-white/15 bg-[#0a0a09] px-3.5 py-2.5 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 bg-[#f5ed00] px-6 py-3.5 font-mono text-xs font-bold tracking-[0.16em] text-black uppercase hover:bg-[#ded700] disabled:opacity-50"
              >
                {loading ? "SUBMITTING APPLICATION..." : "SUBMIT MEMBERSHIP APPLICATION"}
                <Sparkles className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {activeTab === "reset" && (
          <div className="mx-auto max-w-xl border border-white/10 bg-[#131312] p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <KeyRound className="h-5 w-5 text-[#f5ed00]" />
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Reset TVC Exclusive Password
                </h2>
                <p className="text-xs text-[#9e9d99]">
                  Request a one-time cryptographic reset token and set a new
                  password.
                </p>
              </div>
            </div>

            {resetMessage && (
              <div className="mb-5 border border-[#f5ed00]/40 bg-[#f5ed00]/10 p-3.5 text-xs text-[#f5ed00]">
                {resetMessage}
                {issuedTokenPreview && (
                  <div className="mt-2 font-mono font-bold">
                    Verification Token: {issuedTokenPreview}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleRequestReset} className="mb-6 space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-xs text-[#9e9d99] uppercase">
                  Step 1: Roll Number or University Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    placeholder="e.g. 102203001"
                    className="flex-1 border border-white/15 bg-[#0a0a09] px-3.5 py-2.5 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="border border-[#f5ed00] px-4 py-2.5 font-mono text-xs font-semibold text-[#f5ed00] hover:bg-[#f5ed00] hover:text-black"
                  >
                    ISSUE TOKEN
                  </button>
                </div>
              </div>
            </form>

            <form onSubmit={handleConfirmReset} className="space-y-4 border-t border-white/[0.08] pt-5">
              <div>
                <label className="mb-1.5 block font-mono text-xs text-[#9e9d99] uppercase">
                  Step 2: Verification Token
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste reset token"
                  className="w-full border border-white/15 bg-[#0a0a09] px-3.5 py-2.5 font-mono text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-xs text-[#9e9d99] uppercase">
                  New Password (8+ characters)
                </label>
                <input
                  type="password"
                  required
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full border border-white/15 bg-[#0a0a09] px-3.5 py-2.5 text-sm text-white focus:border-[#f5ed00] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f5ed00] py-3 font-mono text-xs font-bold tracking-wider text-black uppercase hover:bg-[#ded700]"
              >
                CONFIRM PASSWORD RESET
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

