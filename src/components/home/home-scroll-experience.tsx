"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface HomeScrollExperienceProps {
  children: ReactNode;
}

export function HomeScrollExperience({ children }: HomeScrollExperienceProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const beats = gsap.utils.toArray<HTMLElement>("[data-home-beat], #initiatives, #archive, #team-preview, #contact");

      beats.forEach((beat) => {
        gsap.fromTo(
          beat,
          {
            autoAlpha: 0.18,
            y: 64,
            scale: 0.99,
            clipPath: "inset(0 0 10% 0)",
            immediateRender: false,
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            clipPath: "inset(0 0 0% 0)",
            ease: "none",
            scrollTrigger: {
              trigger: beat,
              start: "top 88%",
              end: "top 48%",
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, root);

    return () => context.revert();
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
