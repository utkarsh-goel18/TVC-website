"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, X, Sparkles } from "lucide-react";

const archive = [
  { src: "/images/about/TVC-01.png", label: "The community" },
  { src: "/images/archive/tvc-people-02.jpeg", label: "The people" },
  { src: "/images/about/TVC-03.jpeg", label: "The conversations" },
  { src: "/images/esummit/team/team-03.jpeg", label: "The summit" },
  { src: "/images/about/TVC-05.JPG", label: "The moments" },
  { src: "/images/about/TVC-06.jpeg", label: "The energy" },
  { src: "/images/about/TVC-07.jpeg", label: "The journey" },
];

export function HomeArchive() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : archive[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight")
        setActiveIndex((current) => (current === null ? 0 : (current + 1) % archive.length));
      if (event.key === "ArrowLeft")
        setActiveIndex((current) =>
          current === null ? 0 : (current - 1 + archive.length) % archive.length
        );
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex]);

  return (
    <section
      id="archive"
      className="relative overflow-hidden border-y border-white/10 bg-[#060605] py-12 sm:py-20 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 h-[32rem] w-[32rem] rounded-full bg-[#f5ed00]/[0.04] blur-[130px]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:gap-8 md:mb-14 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.04] backdrop-blur-xl px-3.5 py-1 sm:px-4 sm:py-1.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.28em] sm:tracking-[0.32em] text-[#f5ed00] mb-3 sm:mb-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Sparkles className="h-3 w-3 text-[#f5ed00]" />
              <span>TVC / The Archive</span>
            </div>
            <h2 className="text-2xl xs:text-3xl font-medium leading-[0.98] tracking-[-0.055em] text-[#f4f3ef] sm:text-6xl lg:text-7xl">
              More than a club.
              <span className="block text-white/35">A culture in motion.</span>
            </h2>
          </div>
          <p className="max-w-xs text-xs sm:text-sm leading-6 sm:leading-7 text-white/50">
            The people, conversations and moments that turn ambition into action at Thapar.
          </p>
        </div>

        <div className="grid auto-rows-[140px] xs:auto-rows-[160px] sm:auto-rows-[190px] grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 md:auto-rows-[220px] md:grid-cols-12">
          {archive.map((item, index) => {
            const spans = [
              "md:col-span-5 md:row-span-2",
              "md:col-span-3",
              "md:col-span-4",
              "md:col-span-3",
              "md:col-span-4",
              "md:col-span-6",
              "md:col-span-6",
            ];
            return (
              <button
                key={item.src}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Open photo: ${item.label}`}
                className={`tvc-archive-tile group relative isolate overflow-hidden rounded-2xl border border-white/[0.12] bg-[#141412] text-left transition-all duration-300 hover:border-[#f5ed00]/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00] ${spans[index]}`}
              >
                <Image
                  src={item.src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="z-0 object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/15 transition-opacity duration-500 group-hover:from-black/90" />
                <span className="absolute right-4 top-4 z-20 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full border border-white/30 bg-black/50 backdrop-blur-md text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-hover:border-[#f5ed00] group-hover:text-[#f5ed00]">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
                <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 inline-flex items-center gap-2 sm:gap-2.5 rounded-full border border-white/15 bg-black/60 backdrop-blur-xl px-2.5 py-1 sm:px-3.5 sm:py-1.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-white/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  <span className="text-[#f5ed00] font-bold">0{index + 1}</span>
                  <span>{item.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 sm:mt-10 flex flex-col gap-3 sm:gap-4 border-t border-white/10 pt-4 sm:pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            A living archive of TVC · Select a frame to explore
          </span>
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-[#f5ed00] transition-colors hover:text-white"
          >
            Explore our experiences{" "}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>
      </div>

      {active && activeIndex !== null && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/95 p-3 backdrop-blur-2xl sm:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveIndex(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Photo archive: ${active.label}`}
            className="tvc-modal-enter relative flex h-full max-h-[88vh] w-full max-w-6xl flex-col rounded-2xl border border-white/15 bg-[#0e0e0c]/90 backdrop-blur-3xl p-4 sm:p-6 shadow-[0_32px_96px_rgba(0,0,0,0.9)]"
          >
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl">
              <Image
                key={active.src}
                src={active.src}
                alt={active.label}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10 mt-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f5ed00]">
                  TVC / Archive
                </p>
                <p className="mt-1 text-sm text-white font-medium">
                  {active.label}{" "}
                  <span className="ml-2 font-mono text-xs text-white/40">
                    {String(activeIndex + 1).padStart(2, "0")} / 07
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((activeIndex - 1 + archive.length) % archive.length)
                  }
                  aria-label="Previous photo"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-white backdrop-blur-md hover:border-[#f5ed00] hover:text-[#f5ed00] transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((activeIndex + 1) % archive.length)}
                  aria-label="Next photo"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-white backdrop-blur-md hover:border-[#f5ed00] hover:text-[#f5ed00] transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  aria-label="Close photo"
                  className="ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-white backdrop-blur-md hover:border-[#f5ed00] hover:text-[#f5ed00] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
