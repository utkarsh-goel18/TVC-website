"use client";

import { useState, useEffect } from "react";
import { ExclusiveAuthGate } from "@/components/exclusive/exclusive-auth-gate";
import { TvcExclusivePortal } from "@/components/exclusive/tvc-exclusive-portal";
import type { SafeMemberProfile, PublicMemberView } from "@/lib/exclusive/types";
import { RefreshCw } from "lucide-react";

export default function MembersPage() {
  const [member, setMember] = useState<SafeMemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [inactiveNotice, setInactiveNotice] = useState<{
    message: string;
    memberName?: string;
    rollNumber?: string;
  } | null>(null);

  const checkAuth = async () => {
    setLoading(true);
    setInactiveNotice(null);
    try {
      const res = await fetch("/api/exclusive/auth/me");
      const json = await res.json();
      if (res.ok && json.member) {
        if (json.member.accountStatus === "inactive" || json.member.accountStatus === "suspended") {
          setInactiveNotice({
            message:
              json.member.accountStatus === "suspended"
                ? "This account has been suspended by Executive Leadership. Access to TVC Exclusive is prohibited."
                : "Your TVC Exclusive account is currently inactive. Please reach out to the General Secretary or Tech Team to activate your access.",
            memberName: json.member.fullName,
            rollNumber: json.member.rollNumber,
          });
          setMember(null);
        } else {
          setMember(json.member);
        }
      } else {
        setMember(null);
      }
    } catch {
      setMember(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleAuthenticated = (
    authedMember: PublicMemberView
  ) => {
    if (authedMember.accountStatus === "inactive" || authedMember.accountStatus === "suspended") {
      setInactiveNotice({
        message:
          authedMember.accountStatus === "suspended"
            ? "This account has been suspended by Executive Leadership. Access to TVC Exclusive is prohibited."
            : "Your TVC Exclusive account is currently inactive. Please reach out to the General Secretary or Tech Team to activate your access.",
        memberName: authedMember.fullName,
        rollNumber: authedMember.rollNumber,
      });
      setMember(null);
    } else {
      setInactiveNotice(null);
      setMember(authedMember);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/exclusive/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setMember(null);
      setInactiveNotice(null);
    }
  };

  const handleSwitchFixture = async (rollNumber: string) => {
    try {
      const res = await fetch("/api/exclusive/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber,
          password: "TVC@2026#Exec",
        }),
      });
      const json = await res.json();
      if (res.ok && json.member) {
        setMember(json.member);
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#05070d] px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
        <p className="mt-4 text-sm font-medium text-white/70">
          Connecting to TVC Exclusive Secure Session...
        </p>
      </div>
    );
  }

  if (member) {
    return (
      <TvcExclusivePortal
        member={member}
        onLogout={handleLogout}
        onSwitchFixture={handleSwitchFixture}
      />
    );
  }

  return (
    <ExclusiveAuthGate
      inactiveNotice={inactiveNotice}
      onAuthenticated={handleAuthenticated}
    />
  );
}
