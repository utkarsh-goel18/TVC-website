"use client";

import { useEffect, useState } from "react";
import { applyActionCode, checkActionCode } from "firebase/auth";
import { CheckCircle2, CircleAlert, LoaderCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { firebaseAuth } from "@/lib/primus/firebase-client";

type Status = "checking" | "success" | "invalid" | "unsupported";

export function EmailActionHandler() {
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("Verifying your email address…");

  useEffect(() => {
    let active = true;
    async function verify() {
      const mode = params.get("mode");
      const code = params.get("oobCode");
      if (mode !== "verifyEmail" || !code) {
        if (active) {
          setStatus("unsupported");
          setMessage("This verification link is incomplete or is not supported.");
        }
        return;
      }

      try {
        await checkActionCode(firebaseAuth, code);
        await applyActionCode(firebaseAuth, code);
        if (active) {
          setStatus("success");
          setMessage("Your Thapar email address has been verified successfully.");
        }
      } catch {
        if (active) {
          setStatus("invalid");
          setMessage("This link may have expired or already been used. Return to registration and request a fresh verification email.");
        }
      }
    }
    void verify();
    return () => { active = false; };
  }, [params]);

  const success = status === "success";
  const failed = status === "invalid" || status === "unsupported";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020503] px-5 py-20 text-[#efffed]">
      <section className="w-full max-w-xl border border-white/10 bg-[#071009] p-7 sm:p-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#a3ff12]">PRIMUS’26 / Account security</p>
        <div className="mt-10 flex h-14 w-14 items-center justify-center border border-white/10">
          {status === "checking" && <LoaderCircle className="h-7 w-7 animate-spin text-[#a3ff12]" />}
          {success && <CheckCircle2 className="h-7 w-7 text-[#a3ff12]" />}
          {failed && <CircleAlert className="h-7 w-7 text-red-300" />}
        </div>
        <h1 className="mt-7 text-3xl font-semibold tracking-tight sm:text-4xl">
          {status === "checking" ? "One moment." : success ? "You're verified." : "Verification failed."}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/55">{message}</p>
        {success && <div className="mt-7 flex items-start gap-3 border border-[#a3ff12]/20 bg-[#a3ff12]/5 p-4 text-sm text-[#dfffbe]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Your account is ready. Sign in to continue your team registration.</div>}
        {status !== "checking" && <Link href="/events/tvc-x-sat/register" className="mt-8 inline-flex items-center bg-[#a3ff12] px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-[#c2ff70]">{success ? "Continue to registration" : "Return to registration"}</Link>}
      </section>
    </main>
  );
}
