import { Suspense } from "react";
import type { Metadata } from "next";
import { EmailActionHandler } from "@/components/auth/email-action-handler";

export const metadata: Metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
};

export default function EmailActionPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#020503] text-sm text-white/60">Loading verification…</main>}>
      <EmailActionHandler />
    </Suspense>
  );
}
