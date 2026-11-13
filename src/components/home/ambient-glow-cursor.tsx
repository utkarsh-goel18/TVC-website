"use client";

import { useEffect, useRef } from "react";

export function AmbientGlowCursor() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const glow = glowRef.current;
    if (!glow) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isVisible = false;
    let rafId = 0;

    const animate = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

      if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
        rafId = requestAnimationFrame(animate);
      } else {
        currentX = targetX;
        currentY = targetY;
        glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
        rafId = 0;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        glow.style.opacity = "1";
        currentX = targetX;
        currentY = targetY;
      }
      if (!rafId) rafId = requestAnimationFrame(animate);
    };

    const onMouseLeave = () => {
      isVisible = false;
      glow.style.opacity = "0";
      cancelAnimationFrame(rafId);
      rafId = 0;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

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
