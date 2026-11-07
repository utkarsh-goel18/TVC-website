"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Sparkles, Layers3, BriefcaseBusiness, ChartNoAxesCombined } from "lucide-react";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";

const events = [
  {
    id: "tvc-x-sat",
    title: "PRIMUS",
    edition: "’26",
    subtitle: "Where every decision connects.",
    type: "TVC × SATURNALIA’26",
    description:
      "An overnight, inter-college business and case competition. Build products, make strategic calls and navigate the world of finance across three specialised tracks.",
    href: "/events/tvc-x-sat",
    theme: "matrix",
    number: "01",
    date: "20 NOV 2026 · 10 PM — 21 NOV · 8 AM",
    location: "CSED · TIET PATIALA",
    details: [
      { label: "PRODUCT", icon: Layers3 },
      { label: "CONSULTING", icon: BriefcaseBusiness },
      { label: "FINANCE", icon: ChartNoAxesCombined },
    ],
    action: "Enter the Matrix",
    descriptor: "THE NEXT MOVE IS YOURS",
  },
  {
    id: "e-summit",
    title: "E-SUMMIT",
    edition: "’26",
    subtitle: "The flagship entrepreneurship summit.",
    type: "THAPAR VENTURE CLUB · 12TH EDITION",
    description:
      "Five days of innovation, entrepreneurship and future technologies. A meeting ground for ambitious ideas, industry perspectives and the next generation of builders.",
    href: "/events/e-summit",
    theme: "summit",
    number: "02",
    date: "18 — 22 FEBRUARY 2026",
    location: "TIET · PATIALA",
    details: [
      { label: "IDEAS", icon: Sparkles },
      { label: "PEOPLE", icon: BriefcaseBusiness },
      { label: "POSSIBILITIES", icon: ArrowUpRight },
    ],
    action: "Explore the summit",
    descriptor: "FIVE DAYS. COUNTLESS POSSIBILITIES.",
  },
];

export function EventsPage() {
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = pageRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reveals = Array.from(root.querySelectorAll<HTMLElement>("[data-event-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[#050504] text-[#f4f3ef] selection:bg-[#f5ed00] selection:text-black">
      <SiteHeader />
      <main id="main-content" ref={pageRef}>
        <section className="tvc-events-hero relative flex min-h-[88svh] flex-col justify-end overflow-hidden border-b border-white/10 px-6 pb-12 pt-32 sm:px-10 sm:pb-16 lg:min-h-[92svh] lg:px-16 lg:pb-20">
          <div aria-hidden="true" className="tvc-events-grid pointer-events-none absolute inset-0" />
          <div aria-hidden="true" className="tvc-events-orbit pointer-events-none absolute -right-[18%] top-[3%] aspect-square w-[76vw] max-w-[1100px] rounded-full border border-[#f5ed00]/10" />
          <div aria-hidden="true" className="tvc-events-orbit tvc-events-orbit-two pointer-events-none absolute -right-[7%] top-[14%] aspect-square w-[56vw] max-w-[800px] rounded-full border border-white/[0.07]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_35%,rgba(245,237,0,.085),transparent_38%),linear-gradient(90deg,#050504_5%,rgba(5,5,4,.88)_44%,rgba(5,5,4,.16)_100%)]" />

          <div className="relative z-10 mx-auto w-full max-w-[1500px]">
            <p className="mb-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.32em] text-[#f5ed00]">
              <span className="h-px w-9 bg-[#f5ed00]" /> Thapar Venture Club / Experiences
            </p>
            <div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
              <div className="max-w-5xl">
                <h1 className="tvc-events-title text-[clamp(4.2rem,13.5vw,12.5rem)] font-semibold leading-[0.77] tracking-[-0.095em]">
                  <span className="block">WHERE</span>
                  <span className="mt-3 block text-white/20">IDEAS</span>
                  <span className="mt-3 block">HAPPEN<span className="text-[#f5ed00]">.</span></span>
                </h1>
                <p className="mt-10 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
                  We create spaces where ambition meets opportunity — from high-stakes
                  challenges to the conversations that shape what comes next.
                </p>
              </div>
              <a href="#event-lineup" className="group flex w-fit items-center gap-4 border-b border-white/20 pb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:border-[#f5ed00] hover:text-[#f5ed00]">
                Explore the experiences
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-all duration-300 group-hover:translate-y-1 group-hover:border-[#f5ed00] group-hover:bg-[#f5ed00] group-hover:text-black">
                  <ArrowDown className="h-4 w-4" />
                </span>
              </a>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f5ed00]/50 to-transparent" />
        </section>

        <div aria-hidden="true" className="tvc-events-marquee overflow-hidden border-b border-white/10 py-4">
          <div className="tvc-events-marquee-track flex w-max items-center gap-8 whitespace-nowrap">
            {Array.from({ length: 4 }).map((_, index) => (
              <span key={index} className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">
                Think bigger <span className="text-[#f5ed00]">✳</span> Build what matters <span className="text-[#f5ed00]">✳</span> Make your move <span className="text-[#f5ed00]">✳</span>
              </span>
            ))}
          </div>
        </div>

        <section id="event-lineup" aria-labelledby="events-heading" className="mx-auto max-w-[1500px] px-6 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-32">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:mb-16 sm:flex-row sm:items-end">
            <div>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5ed00]">The TVC calendar</p>
              <h2 id="events-heading" className="text-4xl font-medium tracking-[-0.06em] sm:text-6xl">Made to make an impact<span className="text-white/25">.</span></h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/40 sm:text-right">
              Two flagship experiences. Different arenas. One community that refuses to think small.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            {events.map((event, index) => {
              const isMatrix = event.theme === "matrix";
              const accent = isMatrix ? "#a3ff12" : "#f5ed00";
              return (
                <Link
                  key={event.id}
                  href={event.href}
                  data-event-reveal
                  className={`tvc-event-card group relative isolate flex min-h-[680px] flex-col overflow-hidden border px-6 pb-7 pt-6 transition-colors duration-500 sm:min-h-[760px] sm:px-9 sm:pb-9 sm:pt-8 ${isMatrix ? "border-[#a3ff12]/25 bg-[#050b06] hover:border-[#a3ff12]/65" : "border-white/[0.13] bg-[#10100e] hover:border-[#f5ed00]/55"}`}
                  style={{ "--event-accent": accent } as React.CSSProperties}
                >
                  {isMatrix ? (
                    <>
                      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_45%,rgba(163,255,18,.1),transparent_58%)]" />
                      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-50 [background-image:linear-gradient(rgba(163,255,18,.075)_1px,transparent_1px),linear-gradient(90deg,rgba(163,255,18,.075)_1px,transparent_1px)] [background-size:38px_38px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
                      <div aria-hidden="true" className="tvc-event-symbol tvc-matrix-symbol absolute -right-10 top-[17%] -z-10 select-none font-mono text-[clamp(15rem,28vw,25rem)] font-black leading-none tracking-[-.14em] text-[#a3ff12]/[.07]">01</div>
                      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-[#a3ff12]/70 to-transparent" />
                    </>
                  ) : (
                    <>
                      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_18%,rgba(245,237,0,.13),transparent_52%)]" />
                      <div aria-hidden="true" className="tvc-event-symbol absolute -right-10 top-[17%] -z-10 select-none font-mono text-[clamp(15rem,28vw,25rem)] font-black leading-none tracking-[-.14em] text-[#f5ed00]/[.055]">02</div>
                      <div aria-hidden="true" className="absolute bottom-[27%] left-[-12%] -z-10 h-[360px] w-[360px] rounded-full border border-[#f5ed00]/[.08]" />
                    </>
                  )}

                  <div className="flex items-start justify-between gap-4">
                    <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${isMatrix ? "text-[#a3ff12]" : "text-[#f5ed00]"}`}>{event.type}</span>
                    <span className="font-mono text-[10px] text-white/35">{event.number} / 02</span>
                  </div>

                  <div className="relative mt-auto">
                    <p className={`mb-5 font-mono text-[9px] uppercase tracking-[0.22em] ${isMatrix ? "text-[#a3ff12]/70" : "text-white/40"}`}>{event.descriptor}</p>
                    <h3 className={`text-[clamp(3.4rem,7.2vw,6.5rem)] font-semibold leading-[0.84] tracking-[-0.09em] transition-transform duration-500 group-hover:-translate-y-1 ${isMatrix ? "text-[#e9ffe0]" : "text-[#f4f3ef]"}`}>
                      {event.title}<span style={{ color: accent }}>{event.edition}</span>
                    </h3>
                    <p className={`mt-5 font-mono text-[10px] uppercase tracking-[0.18em] ${isMatrix ? "text-[#a3ff12]/70" : "text-white/45"}`}>{event.subtitle}</p>
                    <p className="mt-6 max-w-lg text-sm leading-7 text-white/55 sm:text-base">{event.description}</p>

                    <div className="mt-7 flex flex-wrap gap-2">
                      {event.details.map((detail) => {
                        const DetailIcon = detail.icon;
                        return (
                          <span key={detail.label} className={`inline-flex items-center gap-2 border px-3 py-2 font-mono text-[8px] uppercase tracking-[0.13em] ${isMatrix ? "border-[#a3ff12]/20 bg-[#a3ff12]/[0.04] text-[#d9ffd1]/65" : "border-white/10 bg-white/[0.02] text-white/50"}`}>
                            <DetailIcon className="h-3 w-3" /> {detail.label}
                          </span>
                        );
                      })}
                    </div>

                    <div className="mt-8 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div>
                        <p className={`flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.13em] ${isMatrix ? "text-[#a3ff12]" : "text-[#f5ed00]"}`}>
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" /> {event.date}
                        </p>
                        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.15em] text-white/35">{event.location}</p>
                      </div>
                      <span className={`inline-flex items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.16em] ${isMatrix ? "text-[#a3ff12]" : "text-[#f5ed00]"}`}>
                        {event.action}
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 group-hover:translate-x-1 ${isMatrix ? "border-[#a3ff12]/40 group-hover:bg-[#a3ff12] group-hover:text-black" : "border-white/20 group-hover:border-[#f5ed00] group-hover:bg-[#f5ed00] group-hover:text-black"}`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-white/10 bg-[#0b0b0a] px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-40 h-[500px] w-[500px] rounded-full border border-[#f5ed00]/10" />
          <div className="relative mx-auto flex max-w-[1500px] flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-4xl">
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5ed00]">The next chapter starts here</p>
              <h2 className="text-5xl font-medium leading-[0.95] tracking-[-0.07em] sm:text-7xl">
                Don’t just watch.
                <br />
                <span className="text-white/25">Be part of it.</span>
              </h2>
            </div>
            <Link href="/" className="group inline-flex w-fit items-center gap-4 border-b border-white/25 pb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/75 transition-colors hover:border-[#f5ed00] hover:text-[#f5ed00]">
              Discover Thapar Venture Club
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
