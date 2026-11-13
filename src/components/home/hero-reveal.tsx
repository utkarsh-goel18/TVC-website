"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function HeroReveal() {
  const containerRef = useRef<HTMLElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const rocket3DRef = useRef<HTMLDivElement>(null);
  const rings3DRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (
      !containerRef.current ||
      !lockupRef.current ||
      !rocketRef.current ||
      !wordmarkRef.current ||
      !taglineRef.current ||
      !revealRef.current
    )
      return;

    gsap.registerPlugin(ScrollTrigger);

    let cleanupMouse = () => {};

    // 3D pointer parallax strictly enabled on fine pointer devices (desktop with mouse)
    const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isFinePointer && !reducedMotion && rocket3DRef.current && rings3DRef.current) {
      gsap.set([rocket3DRef.current, rings3DRef.current], {
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
      });

      const rxTo = gsap.quickTo(rocket3DRef.current, "rotationX", {
        duration: 0.7,
        ease: "power3.out",
      });
      const ryTo = gsap.quickTo(rocket3DRef.current, "rotationY", {
        duration: 0.7,
        ease: "power3.out",
      });
      const xTo = gsap.quickTo(rocket3DRef.current, "x", {
        duration: 0.8,
        ease: "power3.out",
      });
      const yTo = gsap.quickTo(rocket3DRef.current, "y", {
        duration: 0.8,
        ease: "power3.out",
      });

      const ringRxTo = gsap.quickTo(rings3DRef.current, "rotationX", {
        duration: 1.0,
        ease: "power3.out",
      });
      const ringRyTo = gsap.quickTo(rings3DRef.current, "rotationY", {
        duration: 1.0,
        ease: "power3.out",
      });

      const onMove = (e: MouseEvent) => {
        const nx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
        const ny = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
        rxTo(-ny * 16);
        ryTo(nx * 20);
        xTo(nx * 10);
        yTo(ny * 8);
        ringRxTo(-ny * 24);
        ringRyTo(nx * 26);
      };

      window.addEventListener("mousemove", onMove, { passive: true });
      cleanupMouse = () => window.removeEventListener("mousemove", onMove);
    }

    // Use GSAP matchMedia to strictly isolate Desktop vs Mobile animations
    const mm = gsap.matchMedia();

    // DESKTOP (>= 768px): Horizontal slide reveal
    mm.add("(min-width: 768px)", () => {
      const revealWidth = revealRef.current?.getBoundingClientRect().width ?? 0;
      const gap = window.innerWidth >= 1024 ? 40 : 32;

      gsap.set(lockupRef.current, { x: (revealWidth + gap) / 2, y: 0 });
      gsap.set(wordmarkRef.current, {
        clipPath: "inset(0% 100% 0% 0%)",
        opacity: 0,
        x: -20,
      });
      gsap.set(taglineRef.current, { opacity: 0, y: 16 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            const width = revealRef.current?.getBoundingClientRect().width ?? 0;
            const currentGap = window.innerWidth >= 1024 ? 40 : 32;
            gsap.set(lockupRef.current, { x: (width + currentGap) / 2 });
          },
        },
      });

      if (indicatorRef.current) {
        timeline.to(
          indicatorRef.current,
          { opacity: 0, y: 14, duration: 0.15, ease: "power1.out" },
          0
        );
      }

      timeline.to(
        lockupRef.current,
        { x: 0, duration: 0.65, ease: "power2.inOut" },
        0.05
      );

      timeline.to(
        wordmarkRef.current,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        0.18
      );

      timeline.to(
        taglineRef.current,
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
        0.48
      );

      timeline.to({}, { duration: 0.25 });
    });

    // MOBILE (< 768px): STRICT CENTERED LOCKUP, NO HORIZONTAL OFFSET, FAST SCROLL PIN
    mm.add("(max-width: 767px)", () => {
      // Ensure lockup is always centered without horizontal shift
      gsap.set(lockupRef.current, { x: 0, y: 0, clearProps: "x,transform" });
      gsap.set(rocketRef.current, { x: 0, y: 0 });
      gsap.set(wordmarkRef.current, {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 0,
        y: 10,
        x: 0,
      });
      gsap.set(taglineRef.current, { opacity: 0, y: 8 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=45%", // Compact scroll pin so user transitions quickly to content
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            gsap.set(lockupRef.current, { x: 0, y: 0 });
          },
        },
      });

      if (indicatorRef.current) {
        timeline.to(
          indicatorRef.current,
          { opacity: 0, y: 8, duration: 0.15, ease: "power1.out" },
          0
        );
      }

      timeline.to(
        rocketRef.current,
        { y: -10, duration: 0.35, ease: "power2.inOut" },
        0.04
      );

      timeline.to(
        wordmarkRef.current,
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
        0.12
      );

      timeline.to(
        taglineRef.current,
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
        0.26
      );

      timeline.to({}, { duration: 0.1 });
    });

    // Refresh after layout and image dimensions have settled.
    const refresh = () => ScrollTrigger.refresh();
    requestAnimationFrame(refresh);

    return () => {
      cleanupMouse();
      mm.revert();
    };
  }, []);

  const handleAssetLoaded = () => {
    ScrollTrigger.refresh();
  };

  return (
    <section
      ref={containerRef}
      aria-label="Thapar Venture Club Signature Brand Reveal"
      className="relative w-full h-[100dvh] min-h-[500px] max-h-[1080px] bg-[#000000] overflow-hidden flex flex-col items-center justify-center select-none"
    >
      {/* Floating Frosted Glass Telemetry Pills (Left & Right) - Hidden on Mobile */}
      <div className="absolute top-1/2 left-6 hidden -translate-y-1/2 -rotate-90 origin-left xl:flex items-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.035] backdrop-blur-xl px-4 py-1.5 font-mono text-[9px] tracking-[0.32em] text-white/65 uppercase shadow-[0_12px_36px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.22)] pointer-events-none z-10">
        <span className="h-1.5 w-1.5 rounded-full bg-[#f5ed00] shadow-[0_0_8px_#f5ed00] animate-ping" />
        <span>Venture beyond the ordinary</span>
      </div>
      <div className="absolute top-1/2 right-6 hidden -translate-y-1/2 rotate-90 origin-right xl:flex items-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.035] backdrop-blur-xl px-4 py-1.5 font-mono text-[9px] tracking-[0.32em] text-white/65 uppercase shadow-[0_12px_36px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.22)] pointer-events-none z-10">
        <span className="h-1.5 w-1.5 rounded-full bg-[#f5ed00] shadow-[0_0_8px_#f5ed00]" />
        <span>TIET · PATIALA · 30.3564° N</span>
      </div>

      {/* Main Lockup Container — Strictly Centered on all viewports */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-8 lg:px-12 flex items-center justify-center">
        <div
          ref={lockupRef}
          className="flex flex-col md:flex-row items-center justify-center gap-3.5 sm:gap-6 md:gap-8 lg:gap-10 transition-none w-full max-w-full text-center md:text-left mx-auto"
        >
          {/* Rocket Container */}
          <div
            ref={rocketRef}
            className="relative flex-shrink-0 w-28 h-28 xs:w-32 xs:h-32 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-60 xl:h-60"
          >
            {/* Lightweight static radial aura */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 rounded-full opacity-60"
              style={{ background: "radial-gradient(circle, rgba(245,237,0,0.16) 0%, rgba(245,237,0,0.06) 42%, transparent 72%)" }}
            />

            {/* 3D Gyroscopic Glass & Gold Rings with Orbiting Satellites */}
            <div
              ref={rings3DRef}
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 sm:-inset-6 flex items-center justify-center"
            >
              <div className="tvc-3d-ring absolute inset-0 rounded-full border border-[#f5ed00]/35 shadow-[inset_0_0_28px_rgba(245,237,0,0.12)]">
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#f5ed00] shadow-[0_0_14px_#f5ed00]" />
              </div>
              <div className="tvc-3d-ring absolute inset-2 rounded-full border border-white/20">
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
              </div>
              <div className="tvc-3d-ring absolute -inset-2 rounded-full border border-dashed border-[#f5ed00]/25" />
              {/* Frosted Glass Specular Halo */}
              <div className="tvc-glass-shimmer absolute inset-2.5 sm:inset-3 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_16px_48px_rgba(0,0,0,0.75)]" />
            </div>

            {/* 3D Tilting Rocket Emblem + Plasma Thruster Flare */}
            <div ref={rocket3DRef} className="relative h-full w-full will-change-transform">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 h-14 w-8 sm:h-16 sm:w-10 rounded-full bg-gradient-to-b from-[#f5ed00]/45 via-[#f5ed00]/15 to-transparent blur-md"
              />
              <Image
                src="/brand/tvc-rocket-emblem.png"
                alt="Thapar Venture Club Rocket"
                fill
                priority
                sizes="(max-width: 640px) 128px, (max-width: 768px) 176px, (max-width: 1200px) 224px, 240px"
                className="object-contain filter drop-shadow-[0_0_36px_rgba(245,237,0,0.28)]"
                onLoad={handleAssetLoaded}
              />
            </div>
          </div>

          {/* Reveal Content (Wordmark + Tagline) */}
          <div
            ref={revealRef}
            className="flex flex-col items-center md:items-start text-center md:text-left max-w-full"
          >
            <div
              ref={wordmarkRef}
              style={{ opacity: 0 }}
              className="relative w-[230px] xs:w-[270px] sm:w-[360px] md:w-[420px] lg:w-[500px] xl:w-[540px] aspect-[930/100] will-change-transform max-w-full"
            >
              <Image
                src="/brand/tvc-wordmark.png"
                alt="Thapar Venture Club"
                fill
                priority
                sizes="(max-width: 640px) 270px, (max-width: 1024px) 460px, 540px"
                className="object-contain drop-shadow-[0_10px_32px_rgba(0,0,0,0.85)]"
                onLoad={handleAssetLoaded}
              />
            </div>

            <div
              ref={taglineRef}
              style={{ opacity: 0 }}
              className="mt-2.5 sm:mt-3.5 md:mt-4 inline-flex items-center justify-center md:justify-start gap-2 sm:gap-3 rounded-full border border-white/[0.14] bg-white/[0.04] backdrop-blur-xl px-3.5 py-1 sm:px-4 sm:py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.22)] will-change-transform max-w-full"
            >
              <div className="h-[2px] w-3 sm:w-5 bg-[#f5ed00] rounded-full hidden md:block shadow-[0_0_10px_#f5ed00]" />
              <p className="font-mono text-[9px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base font-semibold tracking-[0.16em] xs:tracking-[0.2em] sm:tracking-[0.28em] text-[#f4f3ef] uppercase whitespace-nowrap">
                Ideate <span className="text-[#f5ed00] mx-0.5 sm:mx-1">•</span> Ascend{" "}
                <span className="text-[#f5ed00] mx-0.5 sm:mx-1">•</span> Lead
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={indicatorRef}
        aria-hidden="true"
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 sm:gap-2 pointer-events-none transition-opacity duration-300 z-10"
      >
        <span className="rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-[#a5a49f]">
          Scroll to explore
        </span>
        <div className="w-4 h-6 sm:w-5 sm:h-8 rounded-full border border-white/20 bg-white/[0.05] backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] flex items-start justify-center p-1 sm:p-1.5">
          <div className="w-1 h-1.5 sm:h-2 rounded-full bg-[#f5ed00] animate-bounce shadow-[0_0_8px_#f5ed00]" />
        </div>
      </div>
    </section>
  );
}
