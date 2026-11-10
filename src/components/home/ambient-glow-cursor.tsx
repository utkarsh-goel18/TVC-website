"use client";

import { useEffect, useRef } from "react";

export function AmbientGlowCursor() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only activate on pointer devices with fine hover capability
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const glow = glowRef.current;
    if (!glow) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let isVisible = false;
    let rafId = 0;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        glow.style.opacity = "1";
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
      glow.style.opacity = "0";
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      style={{ opacity: 0, willChange: "transform, opacity", transition: "opacity 0.4s ease" }}
      className="pointer-events-none fixed top-0 left-0 z-30 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(245,237,0,0.065)_0%,rgba(245,237,0,0.015)_40%,transparent_70%)] blur-2xl"
    />
  );
}

