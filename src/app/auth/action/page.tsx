import type { Metadata } from "next";
import { EmailActionHandler } from "@/components/auth/email-action-handler";

export const metadata: Metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
};

export default function EmailActionPage() {
  return <EmailActionHandler />;
}
