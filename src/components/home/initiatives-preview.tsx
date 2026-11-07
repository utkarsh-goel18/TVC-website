"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { ArrowUpRight, Calendar, X } from "lucide-react";

const initiativeImages: Record<string, string> = {
  "tvc-x-sat": "/images/about/what-we-do-03.jpeg",
  "e-summit": "/images/about/what-we-do-01.JPG",
};

export function InitiativesPreview() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = siteConfig.initiatives.find((item) => item.id === activeId);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveId(null);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);

  return (
    <section id="initiatives" aria-labelledby="initiatives-title" className="relative overflow-hidden border-t border-white/10 bg-[#0b0b0a] py-24 text-[#f4f3ef] sm:py-32 lg:py-40">
      <div aria-hidden="true" className="pointer-events-none absolute -left-48 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[#f5ed00]/[0.035] blur-[130px]" />
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.32em] text-[#f5ed00]">TVC / Signature experiences</p>
            <h2 id="initiatives-title" className="max-w-3xl text-4xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              We don't just talk
              <span className="block text-white/35">about ideas. We build around them.</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-7 text-white/50">Platforms that bring ambitious students, founders and industry together.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {siteConfig.initiatives.map((item, index) => (
            <article key={item.id} className="tvc-feature-card group relative isolate flex min-h-[460px] flex-col justify-between overflow-hidden border border-white/10 bg-[#141413] p-7 sm:min-h-[560px] sm:p-10">
              <Image src={initiativeImages[item.id]} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="absolute inset-0 z-0 object-cover opacity-55 transition-transform duration-[1400ms] ease-out group-hover:scale-110" />
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/65 via-black/20 to-black/90 transition-opacity duration-500 group-hover:via-black/10" />
              <div className="relative z-20 flex items-start justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#f5ed00]">0{index + 1} / {item.badge}</span>
                <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white/65"><Calendar className="h-3.5 w-3.5" />{item.dateStatus}</span>
              </div>
              <div className="relative z-20 max-w-xl">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">{item.edition}</p>
                <h3 className="mb-4 text-3xl font-medium leading-[1.02] tracking-tight text-white sm:text-5xl">{item.title}</h3>
                <p className="max-w-lg text-sm leading-7 text-white/70 sm:text-base">{item.descriptor}</p>
                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <Link href={item.href} className="inline-flex items-center gap-3 border-b border-[#f5ed00]/60 pb-2 text-xs font-mono uppercase tracking-[0.16em] text-[#f5ed00] transition-colors hover:border-white hover:text-white">
                    Explore experience <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                  <button type="button" onClick={() => setActiveId(item.id)} className="pb-2 font-mono text-xs uppercase tracking-[0.16em] text-white/65 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00]">
                    Quick view <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {active && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md sm:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveId(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="initiative-dialog-title" className="tvc-modal-enter relative grid h-[88vh] max-h-[760px] min-h-0 w-full max-w-5xl grid-rows-[minmax(180px,30vh)_minmax(0,1fr)] overflow-hidden border border-white/15 bg-[#10100e] shadow-2xl md:h-[min(78vh,700px)] md:grid-cols-[0.92fr_1.08fr] md:grid-rows-1">
            <div className="relative min-h-0 overflow-hidden">
              <Image src={initiativeImages[active.id]} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:bg-gradient-to-r" />
              <span className="absolute bottom-5 left-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#f5ed00]">TVC / {active.badge}</span>
            </div>
            <div className="relative flex min-h-0 flex-col justify-center overflow-y-auto p-6 sm:p-8 lg:p-12">
              <button type="button" onClick={() => setActiveId(null)} aria-label="Close quick view" className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center border border-white/15 text-white/70 transition-colors hover:border-[#f5ed00] hover:text-[#f5ed00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00]"><X className="h-5 w-5" /></button>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-[#f5ed00]">{active.edition}</p>
              <h3 id="initiative-dialog-title" className="max-w-md pr-10 text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-white">{active.title}</h3>
              <p className="mt-6 max-w-md text-sm leading-7 text-white/60 sm:text-base">{active.descriptor}</p>
              <p className="mt-8 border-t border-white/10 pt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">{active.dateStatus}</p>
              <Link href={active.href} onClick={() => setActiveId(null)} className="mt-8 inline-flex w-fit items-center gap-3 bg-[#f5ed00] px-5 py-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-black transition-colors hover:bg-white">
                Enter experience <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </section>
  );
}
