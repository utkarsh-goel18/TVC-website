"use client";

import { useState } from "react";
import {
  User,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  FileText,
  Linkedin,
  Github,
  CheckCircle2,
  Save,
  Award,
  Sparkles,
  Layers,
} from "lucide-react";
import type { SafeMemberProfile } from "@/lib/exclusive/types";

interface ProfileModuleProps {
  member: SafeMemberProfile;
  onProfileUpdated?: (updated: SafeMemberProfile) => void;
}

export function ProfileModule({
  member,
  onProfileUpdated,
}: ProfileModuleProps) {
  const [phone, setPhone] = useState(member.phone || "");
  const [bio, setBio] = useState(member.bio || "");
  const [skills, setSkills] = useState(member.skills?.join(", ") || "");
  const [interests, setInterests] = useState(member.interests?.join(", ") || "");
  const [linkedin, setLinkedin] = useState(member.socialLinks?.linkedin || "");
  const [github, setGithub] = useState(member.socialLinks?.github || "");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    const parsedSkills = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedInterests = interests
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/exclusive/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim() || null,
          bio: bio.trim() || null,
          skills: parsedSkills,
          interests: parsedInterests,
          socialLinks: {
            linkedin: linkedin.trim() || undefined,
            github: github.trim() || undefined,
          },
        }),
      });

      const json = await res.json();
      if (res.ok && json.profile) {
        setSaveSuccess(true);
        if (onProfileUpdated) {
          onProfileUpdated(json.profile);
        }
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMessage(json.error || "Failed to update profile.");
      }
    } catch {
      setErrorMessage("Network error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const isCore =
    member.level === 2 && member.positionTitle.toLowerCase().includes("core");

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-transparent p-6 lg:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/25 to-purple-500/25 font-display text-2xl font-black text-amber-300 shadow-xl">
              {member.fullName
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl font-black text-white">
                  {member.fullName}
                </h2>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    member.level === 3
                      ? "border border-amber-400/40 bg-amber-400/20 text-amber-300"
                      : member.level === 2
                      ? "border border-sky-400/40 bg-sky-400/20 text-sky-300"
                      : "border border-emerald-400/40 bg-emerald-400/20 text-emerald-300"
                  }`}
                >
                  Level {member.level} Member
                </span>
                {isCore && (
                  <span className="rounded-full border border-amber-400/40 bg-amber-400/20 px-3 py-0.5 text-xs font-bold text-amber-200">
                    Core Designation
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-white/60">
                <span className="font-medium text-white/90">
                  {member.positionTitle}
                </span>
                <span>•</span>
                <span>Roll No: {member.rollNumber}</span>
                <span>•</span>
                <span>{member.email}</span>
              </div>

              {/* Department Badges */}
              {member.departments.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-white/45">Departments:</span>
                  {member.departments.map((d, i) => {
                    const name = typeof d === "string" ? d : d.name;
                    return (
                      <span
                        key={i}
                        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/80"
                      >
                        {name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/60">
            <div className="flex items-center justify-between gap-4">
              <span>Account Status:</span>
              <span className="font-semibold text-emerald-400">
                ● {member.accountStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Permissions:</span>
              <span className="font-semibold text-white/80">
                {member.permissions.length} Granted
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 lg:p-8"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Edit Personal Profile
            </h3>
            <p className="text-xs text-white/50">
              Update your contact details, bio, and portfolio references visible to TVC peers.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {saveSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            Your profile details have been successfully updated!
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <Phone className="h-3.5 w-3.5 text-amber-300" />
              Contact Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <Linkedin className="h-3.5 w-3.5 text-sky-400" />
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* GitHub */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <Github className="h-3.5 w-3.5 text-white/70" />
              GitHub Profile URL
            </label>
            <input
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/username"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Skills (Comma Separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, TypeScript, Event Operations, Pitch Decks..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Interests */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <Layers className="h-3.5 w-3.5 text-amber-300" />
              Department Interests & Aspirations (Comma Separated)
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Tech, Outreach, Startup Incubation, Media Design..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <FileText className="h-3.5 w-3.5 text-amber-300" />
              Bio & Personal Summary
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other TVC members about your background, current focus areas, and what you're working on..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>
      </form>
    </div>
  );
}

