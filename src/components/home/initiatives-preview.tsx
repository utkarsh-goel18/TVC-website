"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { ArrowUpRight, Calendar, X, Sparkles } from "lucide-react";

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
    <section
      id="initiatives"
      aria-labelledby="initiatives-title"
      className="relative overflow-hidden border-t border-white/10 bg-[#060605] py-12 text-[#f4f3ef] sm:py-20 lg:py-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 top-1/3 h-[32rem] w-[32rem] rounded-full bg-[#f5ed00]/[0.05] blur-[140px]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:gap-8 md:mb-14 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.04] backdrop-blur-xl px-3.5 py-1 sm:px-4 sm:py-1.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.28em] sm:tracking-[0.32em] text-[#f5ed00] mb-3 sm:mb-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Sparkles className="h-3 w-3 text-[#f5ed00]" />
              <span>TVC / Signature Experiences</span>
            </div>
            <h2
              id="initiatives-title"
              className="max-w-3xl text-2xl xs:text-3xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl"
            >
              We don&apos;t just talk
              <span className="block text-white/35">about ideas. We build around them.</span>
            </h2>
          </div>
          <p className="max-w-xs text-xs sm:text-sm leading-6 sm:leading-7 text-white/50">
            Platforms that bring ambitious students, founders and industry together.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          {siteConfig.initiatives.map((item, index) => (
            <article
              key={item.id}
              data-tvc-glass-card
              className="tvc-feature-card tvc-glass-interactive group relative isolate flex min-h-[360px] xs:min-h-[400px] sm:min-h-[540px] flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.035] backdrop-blur-2xl p-4 xs:p-5 sm:p-8 lg:p-10 shadow-[0_28px_80px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.22)] hover:border-white/30 transition-all duration-300"
            >
              <Image
                src={initiativeImages[item.id]}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="absolute inset-0 z-0 object-cover opacity-50 transition-transform duration-[1400ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/75 via-black/25 to-black/92 transition-opacity duration-500 group-hover:via-black/15" />

              <div className="relative z-20 flex items-start justify-between gap-3 sm:gap-4">
                <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/15 bg-black/50 backdrop-blur-xl px-2.5 py-0.5 sm:px-3.5 sm:py-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-[#f5ed00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f5ed00] shadow-[0_0_8px_#f5ed00]" />
                  0{index + 1} / {item.badge}
                </span>
                <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/12 bg-black/45 backdrop-blur-xl px-2.5 py-0.5 sm:px-3 sm:py-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-white/70">
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#f5ed00]" />
                  {item.dateStatus}
                </span>
              </div>

              <div className="relative z-20 max-w-xl">
                <p className="mb-2 sm:mb-3 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/55">
                  {item.edition}
                </p>
                <h3 className="mb-2.5 sm:mb-4 text-2xl sm:text-5xl font-medium leading-[1.02] tracking-tight text-white group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="max-w-lg text-xs leading-5 sm:text-base sm:leading-7 text-white/75">
                  {item.descriptor}
                </p>
                <div className="mt-5 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-6">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 sm:gap-3 rounded-full border border-[#f5ed00]/50 bg-[#f5ed00]/10 hover:bg-[#f5ed00] hover:text-black backdrop-blur-md px-4 py-2 sm:px-5 sm:py-2.5 text-[11px] sm:text-xs font-mono uppercase tracking-[0.16em] text-[#f5ed00] transition-all shadow-[0_0_16px_rgba(245,237,0,0.15)]"
                  >
                    <span>Explore experience</span>
                    <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className="rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-white/75 transition-all hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00]"
                  >
                    Quick view <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {active &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-2xl sm:p-8"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setActiveId(null);
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="initiative-dialog-title"
              className="tvc-modal-enter relative grid h-[88vh] max-h-[760px] min-h-0 w-full max-w-5xl grid-rows-[minmax(180px,30vh)_minmax(0,1fr)] overflow-hidden rounded-2xl border border-white/20 bg-[#0c0c0a]/95 backdrop-blur-3xl shadow-[0_32px_96px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.25)] md:h-[min(78vh,700px)] md:grid-cols-[0.92fr_1.08fr] md:grid-rows-1"
            >
              <div className="relative min-h-0 overflow-hidden">
                <Image
                  src={initiativeImages[active.id]}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" />
                <span className="absolute bottom-5 left-5 rounded-full border border-white/15 bg-black/50 backdrop-blur-xl px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#f5ed00]">
                  TVC / {active.badge}
                </span>
              </div>
              <div className="relative flex min-h-0 flex-col justify-center overflow-y-auto p-6 sm:p-8 lg:p-12">
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  aria-label="Close quick view"
                  className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-md text-white/70 transition-colors hover:border-[#f5ed00] hover:text-[#f5ed00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00]"
                >
                  <X className="h-5 w-5" />
                </button>
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-[#f5ed00]">
                  {active.edition}
                </p>
                <h3
                  id="initiative-dialog-title"
                  className="max-w-md pr-10 text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-white"
                >
                  {active.title}
                </h3>
                <p className="mt-6 max-w-md text-sm leading-7 text-white/70 sm:text-base">
                  {active.descriptor}
                </p>
                <p className="mt-8 border-t border-white/10 pt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                  {active.dateStatus}
                </p>
                <Link
                  href={active.href}
                  onClick={() => setActiveId(null)}
                  className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-[#f5ed00] px-6 py-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-black transition-all hover:bg-white shadow-[0_0_24px_rgba(245,237,0,0.3)]"
                >
                  Enter experience <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </div>,
          document.body
        )}
    </section>
  );
}
