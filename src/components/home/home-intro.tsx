"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function HomeIntro() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const storageKey = "tvc-home-intro-seen";
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.sessionStorage.setItem(storageKey, "1");
        return;
      }
      setVisible(true);
      const timeout = window.setTimeout(() => {
        setVisible(false);
        window.sessionStorage.setItem(storageKey, "1");
      }, 1900);
      return () => window.clearTimeout(timeout);
    } catch {
      // If storage is unavailable, keep the experience non-blocking.
      return;
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      window.sessionStorage.setItem("tvc-home-intro-seen", "1");
    } catch {
      // The intro can still be dismissed when storage is unavailable.
    }
  };

  if (!visible) return null;

  return (
    <div
      className="tvc-intro fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Thapar Venture Club"
    >
      <div aria-hidden="true" className="tvc-intro-grid absolute inset-0 opacity-40" />
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div className="tvc-intro-mark relative h-20 w-20 sm:h-24 sm:w-24">
          <Image
            src="/brand/tvc-rocket-emblem.png"
            alt=""
            fill
            priority
            sizes="96px"
            className="object-contain"
          />
        </div>
        <p className="tvc-intro-kicker mt-8 font-mono text-[10px] tracking-[0.38em] text-[#f5ed00] uppercase">
          Thapar Venture Club
        </p>
        <p className="tvc-intro-title mt-3 text-3xl font-semibold tracking-[-0.06em] text-[#f4f3ef] sm:text-5xl">
          Ideas into impact<span className="text-[#f5ed00]">.</span>
        </p>
        <div className="mt-8 h-px w-40 overflow-hidden bg-white/15">
          <div className="tvc-intro-progress h-full origin-left bg-[#f5ed00]" />
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-6 bottom-6 z-20 font-mono text-[10px] tracking-[0.2em] text-white/55 uppercase transition-colors hover:text-[#f5ed00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00]"
      >
        Skip intro ↗
      </button>
    </div>
  );
}
