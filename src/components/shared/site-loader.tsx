"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { gsap } from "gsap";

export function SiteLoader({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      {children}
      {isMounted && isLoading && (
        <PageLoader onComplete={handleComplete} />
      )}
    </>
  );
}

function PageLoader({ onComplete }: { onComplete: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      onComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete,
          });
        },
      });

      const isDesktop = window.matchMedia("(min-width: 768px)").matches;

      gsap.set(rocketRef.current, { scale: 0.7, opacity: 0, y: 20 });
      gsap.set(wordmarkRef.current, {
        clipPath: "inset(0% 100% 0% 0%)",
        opacity: 0,
        x: isDesktop ? -24 : 0,
        y: isDesktop ? 0 : 12,
      });
      gsap.set(taglineRef.current, { opacity: 0, y: 14 });

      tl.to(rocketRef.current, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "back.out(1.4)",
      });

      tl.to(
        wordmarkRef.current,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.65,
          ease: "power3.out",
        },
        "-=0.1",
      );

      tl.to(
        taglineRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        "-=0.2",
      );

      tl.to({}, { duration: 0.7 });
    });

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,rgba(245,237,0,0.05),transparent_70%)]" />

      <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-8 md:flex-row md:gap-10">
        <div
          ref={rocketRef}
          className="relative h-24 w-24 flex-shrink-0 sm:h-32 sm:w-32 md:h-36 md:w-36"
        >
          <Image
            src="/brand/tvc-rocket-emblem.png"
            alt="Thapar Venture Club"
            fill
            priority
            sizes="144px"
            className="object-contain drop-shadow-[0_0_28px_rgba(245,237,0,0.18)]"
          />
        </div>

        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div
            ref={wordmarkRef}
            style={{ clipPath: "inset(0% 100% 0% 0%)", opacity: 0 }}
            className="relative aspect-[930/100] w-[220px] will-change-transform sm:w-[300px] md:w-[380px] lg:w-[440px]"
          >
            <Image
              src="/brand/tvc-wordmark.png"
              alt="Thapar Venture Club"
              fill
              priority
              sizes="440px"
              className="object-contain"
            />
          </div>

          <div
            ref={taglineRef}
            style={{ opacity: 0 }}
            className="mt-3 flex items-center justify-center gap-3 md:justify-start"
          >
            <div className="hidden h-[2px] w-5 rounded-full bg-[#f5ed00] md:block" />
            <p className="font-mono text-[10px] tracking-[0.3em] text-[#f4f3ef] uppercase sm:text-xs">
              Ideate <span className="mx-1 text-[#f5ed00]">•</span>
              Ascend <span className="mx-1 text-[#f5ed00]">•</span>
              Lead
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
