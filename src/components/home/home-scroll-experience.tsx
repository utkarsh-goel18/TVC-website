import type { ReactNode } from "react";

interface HomeScrollExperienceProps {
  children: ReactNode;
}

/**
 * Kept as a lightweight layout wrapper for the homepage.
 * Scroll-linked reveal and per-card pointer tilt effects were removed
 * to avoid running a large number of ScrollTriggers and mouse handlers.
 */
export function HomeScrollExperience({ children }: HomeScrollExperienceProps) {
  return <div>{children}</div>;
}
