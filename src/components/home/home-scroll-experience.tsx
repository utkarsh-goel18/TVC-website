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

    const cleanups: Array<() => void> = [];

    const context = gsap.context(() => {
      const beats = gsap.utils.toArray<HTMLElement>(
        "[data-home-beat], #initiatives, #archive, #team-preview, #contact"
      );

      beats.forEach((beat) => {
        gsap.fromTo(
          beat,
          {
            autoAlpha: 0.35,
            y: 28,
            
            
            immediateRender: false,
          },
          {
            autoAlpha: 1,
            y: 0,
            ease: "power1.out",
            scrollTrigger: {
              trigger: beat,
              start: "top 88%",
              end: "top 48%",
              toggleActions: "play none none reverse",
              once: true,
            },
          }
        );
      });

      // Interactive 3D Card Tilt & Specular Glass Glare on Desktop
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const cards = root.querySelectorAll<HTMLElement>(
          ".tvc-feature-card, .tvc-archive-tile, .tvc-member-card, [data-tvc-glass-card], #about .group"
        );

        cards.forEach((card) => {
          card.classList.add("tvc-glass-interactive");
          gsap.set(card, { transformPerspective: 1000 });

          const rxTo = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
          const ryTo = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });

          const onMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;
            const nx = (relX / Math.max(1, rect.width) - 0.5) * 2;
            const ny = (relY / Math.max(1, rect.height) - 0.5) * 2;

            card.style.setProperty("--mx", `${relX.toFixed(1)}px`);
            card.style.setProperty("--my", `${relY.toFixed(1)}px`);

            rxTo(-ny * 4.5);
            ryTo(nx * 5.5);
          };

          const onLeave = () => {
            rxTo(0);
            ryTo(0);
          };

          card.addEventListener("mousemove", onMove, { passive: true });
          card.addEventListener("mouseleave", onLeave, { passive: true });

          cleanups.push(() => {
            card.removeEventListener("mousemove", onMove);
            card.removeEventListener("mouseleave", onLeave);
          });
        });
      }

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      context.revert();
    };
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
