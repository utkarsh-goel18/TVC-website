"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { MatrixRain } from "@/components/events/matrix-rain";

export function PrimusHero() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section aria-label="PRIMUS 2026 introduction" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 opacity-100">
        <MatrixRain />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,75,20,0.42),transparent_58%),linear-gradient(to_bottom,rgba(0,0,0,0.05),rgba(0,0,0,0.62))]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(105,255,125,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(105,255,125,0.06)_1px,transparent_1px)] bg-[size:54px_54px]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[min(65vw,620px)] w-[min(65vw,620px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#45ff58]/10 blur-[100px]" />

      <div className="relative z-10 flex w-full flex-col items-center px-4 py-28 text-center">
        <p
          className="mb-8 font-mono text-[9px] uppercase tracking-[0.42em] text-[#a3ff12] transition-all duration-1000 sm:text-[10px]"
          style={{ opacity: revealed ? 1 : 0, transform: `translateY(${revealed ? 0 : 16}px)` }}
        >
          TVC × SAT <span className="mx-2 text-white/25">//</span> THE MATRIX CHALLENGE
        </p>

        <h1
          className="whitespace-nowrap text-[clamp(3.1rem,13.5vw,12rem)] font-black leading-[0.8] tracking-[-0.095em] text-[#edffe8] transition-all duration-[1400ms] ease-out"
          style={{
            opacity: revealed ? 1 : 0,
            transform: `translateY(${revealed ? 0 : 34}px) scale(${revealed ? 1 : 0.88})`,
            filter: `blur(${revealed ? 0 : 12}px)`,
            textShadow: "0 0 18px rgba(163,255,18,0.22), 0 0 70px rgba(63,255,87,0.2)",
          }}
        >
          PRIMUS<span className="text-[#a3ff12]">’26</span>
        </h1>

        <div className="mt-7 h-px w-24 bg-gradient-to-r from-transparent via-[#a3ff12] to-transparent transition-opacity delay-500 duration-700" style={{ opacity: revealed ? 1 : 0 }} />
        <p
          className="mt-6 font-mono text-[clamp(0.62rem,1.5vw,0.95rem)] uppercase tracking-[0.19em] text-[#d1ffcb] transition-all delay-500 duration-700 sm:tracking-[0.28em]"
          style={{ opacity: revealed ? 1 : 0, transform: `translateY(${revealed ? 0 : 12}px)` }}
        >
          Where every decision connects.
        </p>

        <div className="mt-7 inline-flex items-center gap-3 border-y border-[#a3ff12]/20 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#d1ffcb] transition-all delay-600 duration-700 sm:text-xs" style={{ opacity: revealed ? 1 : 0, transform: `translateY(${revealed ? 0 : 12}px)` }}>
          <CalendarDays className="h-4 w-4 text-[#a3ff12]" />
          <span>20 November · 10 PM</span>
          <span className="text-[#a3ff12]/50">—</span>
          <span>21 November · 8 AM</span>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/60 transition-all delay-600 duration-700 sm:text-[10px]" style={{ opacity: revealed ? 1 : 0, transform: `translateY(${revealed ? 0 : 12}px)` }}>
          <MapPin className="h-3.5 w-3.5 text-[#a3ff12]" />
          <span>Computer Science and Engineering Department · TIET Patiala</span>
        </div>

        <div
          className="mt-9 flex flex-wrap justify-center gap-3 transition-all delay-700 duration-700"
          style={{ opacity: revealed ? 1 : 0, transform: `translateY(${revealed ? 0 : 12}px)` }}
        >
          <a href="/events/tvc-x-sat/register" className="group inline-flex items-center gap-3 bg-[#a3ff12] px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-black transition-all hover:-translate-y-1 hover:bg-[#c2ff70]">
            TIET student registration <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
          <a href="https://www.saturnalia.in/events/business" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 border border-[#a3ff12]/55 bg-black/60 px-6 py-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/85 transition-colors hover:border-[#a3ff12] hover:text-[#a3ff12]">
            External participant registration <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <a href="#signal" className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white/55 transition-colors hover:text-[#a3ff12]">
        <span>Scroll to explore</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}
