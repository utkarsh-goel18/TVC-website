"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";

const archive = [
  { src: "/images/about/TVC-01.png", label: "The community" },
  { src: "/images/about/TVC-02.jpeg", label: "The people" },
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
      if (event.key === "ArrowRight") setActiveIndex((current) => current === null ? 0 : (current + 1) % archive.length);
      if (event.key === "ArrowLeft") setActiveIndex((current) => current === null ? 0 : (current - 1 + archive.length) % archive.length);
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
    <section id="archive" className="relative overflow-hidden border-y border-white/10 bg-[#050505] py-24 sm:py-32 lg:py-40">
      <div className="pointer-events-none absolute -right-40 top-0 h-[32rem] w-[32rem] rounded-full bg-[#f5ed00]/[0.035] blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.32em] text-[#f5ed00]">TVC / The archive</p>
            <h2 className="text-4xl font-medium leading-[0.98] tracking-[-0.055em] text-[#f4f3ef] sm:text-6xl lg:text-7xl">More than a club.<span className="block text-white/35">A culture in motion.</span></h2>
          </div>
          <p className="max-w-xs text-sm leading-7 text-white/50">The people, conversations and moments that turn ambition into action at Thapar.</p>
        </div>

        <div className="grid auto-rows-[190px] grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[220px] md:grid-cols-12">
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
              <button key={item.src} type="button" onClick={() => setActiveIndex(index)} aria-label={`Open photo: ${item.label}`} className={`tvc-archive-tile group relative isolate overflow-hidden bg-[#151513] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00] ${spans[index]}`}>
                <Image src={item.src} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="z-0 object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-transparent to-black/10 transition-opacity duration-500 group-hover:from-black/85" />
                <span className="absolute right-5 top-5 z-20 flex h-9 w-9 translate-y-2 items-center justify-center border border-white/35 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" /></span>
                <span className="absolute bottom-4 left-4 z-20 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/85 sm:bottom-5 sm:left-5"><span className="text-[#f5ed00]">0{index + 1}</span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">A living archive of TVC · Select a frame to explore</span>
          <Link href="/events" className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-[#f5ed00] transition-colors hover:text-white">Explore our experiences <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
        </div>
      </div>

      {active && activeIndex !== null && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/95 p-3 backdrop-blur-xl sm:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }}>
          <div role="dialog" aria-modal="true" aria-label={`Photo archive: ${active.label}`} className="tvc-modal-enter relative flex h-full max-h-[88vh] w-full max-w-6xl flex-col">
            <div className="relative min-h-0 flex-1">
              <Image key={active.src} src={active.src} alt={active.label} fill sizes="100vw" className="object-contain" />
            </div>
            <div className="flex items-center justify-between gap-4 pt-4">
              <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f5ed00]">TVC / Archive</p><p className="mt-1 text-sm text-white">{active.label} <span className="ml-2 font-mono text-xs text-white/35">{String(activeIndex + 1).padStart(2, "0")} / 07</span></p></div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setActiveIndex((activeIndex - 1 + archive.length) % archive.length)} aria-label="Previous photo" className="flex h-10 w-10 items-center justify-center border border-white/20 text-white hover:border-[#f5ed00] hover:text-[#f5ed00]"><ArrowLeft className="h-4 w-4" /></button>
                <button type="button" onClick={() => setActiveIndex((activeIndex + 1) % archive.length)} aria-label="Next photo" className="flex h-10 w-10 items-center justify-center border border-white/20 text-white hover:border-[#f5ed00] hover:text-[#f5ed00]"><ArrowRight className="h-4 w-4" /></button>
                <button type="button" onClick={() => setActiveIndex(null)} aria-label="Close photo" className="ml-2 flex h-10 w-10 items-center justify-center border border-white/20 text-white hover:border-[#f5ed00] hover:text-[#f5ed00]"><X className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
