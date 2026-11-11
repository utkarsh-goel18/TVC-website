import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "PRIMUS’26 Admin",
  description: "Restricted PRIMUS’26 registration administration.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrimusAdminLayout({ children }: { children: ReactNode }) {
  return children;
}
