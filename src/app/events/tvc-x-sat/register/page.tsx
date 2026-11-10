import type { Metadata } from "next";
import { PrimusRegistration } from "@/components/events/primus-registration";

export const metadata: Metadata = {
  title: "PRIMUS’26 Registration",
  description: "Register your team for PRIMUS’26 by Thapar Venture Club.",
};

export default function Page() {
  return <PrimusRegistration />;
}
