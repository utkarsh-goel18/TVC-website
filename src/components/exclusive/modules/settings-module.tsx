"use client";

import { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  Lock,
  LogOut,
  AlertCircle,
  CheckCircle2,
  User,
  Info,
} from "lucide-react";
import type { SafeMemberProfile } from "@/lib/exclusive/types";

interface SettingsModuleProps {
  member: SafeMemberProfile;
  onLogout: () => void;
}

export function SettingsModule({ member, onLogout }: SettingsModuleProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/exclusive/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setSuccessMsg("Password successfully updated!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(json.error || "Failed to change password.");
      }
    } catch {
      setErrorMsg("Network error updating password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-transparent p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <h2 className="font-display text-xl font-bold text-white">
            Account & Security Settings
          </h2>
        </div>
        <p className="mt-1 text-sm text-white/60">
          Manage your credentials, authentication session, and TVC member privileges.
        </p>
      </div>

      {member.mustChangePassword && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-xs text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <div>
            <span className="font-bold">First Login Security Notice:</span> You
            are using an initial provisioned password. Please set a secure
            personal password below to secure your TVC Exclusive workspace.
          </div>
        </div>
      )}

      {/* Grid: Change Password & Security Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Change Password Card */}
        <form
          onSubmit={handleChangePassword}
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 lg:p-7"
        >
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber-300" />
            <h3 className="font-display text-base font-bold text-white">
              Change Password
            </h3>
          </div>
          <p className="mt-1 text-xs text-white/50">
            Update your account password. Must contain at least 8 characters.
          </p>

          {successMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-white/70">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-white/70">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters..."
                className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-white/70">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password..."
                className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="mt-2 w-full rounded-2xl bg-amber-400 py-3 text-xs font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-40"
            >
              {updatingPassword ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        </form>

        {/* Account Details & Session Info */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 lg:p-7">
            <h3 className="font-display text-base font-bold text-white">
              Session Profile
            </h3>
            <p className="mt-1 text-xs text-white/50">
              Verified identity details associated with this TVC session.
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-white/[0.02] p-3">
                <span className="text-white/50">Full Name:</span>
                <span className="font-semibold text-white">
                  {member.fullName}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/[0.02] p-3">
                <span className="text-white/50">University Roll No:</span>
                <span className="font-mono font-semibold text-amber-300">
                  {member.rollNumber}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/[0.02] p-3">
                <span className="text-white/50">Registered Email:</span>
                <span className="text-white/80">{member.email}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/[0.02] p-3">
                <span className="text-white/50">Organisational Level:</span>
                <span className="font-semibold text-amber-300">
                  Level {member.level}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/[0.02] p-3">
                <span className="text-white/50">Official Position:</span>
                <span className="font-semibold text-white">
                  {member.positionTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Session Termination Card */}
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/[0.03] p-6">
            <h4 className="font-semibold text-rose-300">End Active Session</h4>
            <p className="mt-1 text-xs text-white/60">
              Sign out from TVC Exclusive on this browser. You can sign back in anytime with your roll number and password.
            </p>
            <button
              onClick={onLogout}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-500/20 px-4 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/30"
            >
              <LogOut className="h-4 w-4" />
              Sign Out of TVC Exclusive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

