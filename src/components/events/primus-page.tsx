"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Binary, BriefcaseBusiness, CalendarDays, ChartNoAxesCombined, Cpu, Layers3, MapPin, Users } from "lucide-react";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { PrimusHero } from "@/components/events/primus-hero";

const tracks = [
  {
    number: "01",
    code: "BUILD. INNOVATE. PITCH.",
    title: "Product",
    descriptor: "Turn an idea into a business proposition.",
    description: "Step into the shoes of entrepreneurs and product innovators. Conceptualise a startup, develop an innovative product or solution, understand user needs and pitch its potential.",
    icon: Layers3,
    accent: "from-[#b7ff6a]/20",
    tags: ["Entrepreneurship", "Product innovation", "Pitching"],
  },
  {
    number: "02",
    code: "ANALYSE. INVEST. STRATEGISE.",
    title: "Consulting",
    descriptor: "Make informed strategic decisions.",
    description: "Analyse startups, evaluate opportunities, and buy or sell virtual company shares to maximise portfolio value. Interpret business information, assess potential, manage risks and make informed investment decisions.",
    icon: BriefcaseBusiness,
    accent: "from-[#55f7a5]/20",
    tags: ["Startup analysis", "Virtual shares", "Risk assessment"],
  },
  {
    number: "03",
    code: "ADVISE. NEGOTIATE. GROW.",
    title: "Finance",
    descriptor: "Help startups move forward.",
    description: "Pitch your expertise to startups, secure consulting deals, and help improve products and business strategies. Understand business challenges, communicate value, negotiate effectively and develop practical recommendations.",
    icon: ChartNoAxesCombined,
    accent: "from-[#a4ffcf]/20",
    tags: ["Consulting deals", "Negotiation", "Business growth"],
  },
];

export function PrimusPage() {
  const pageRef = useRef<HTMLElement>(null);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const activeTrack = tracks.find((track) => track.number === selectedTrack);

  useEffect(() => {
    const root = pageRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-event-reveal]"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting));
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#020503] text-[#efffed] selection:bg-[#a3ff12] selection:text-black">
      <SiteHeader />
      <main id="main-content" ref={pageRef} className="flex-grow">
        <PrimusHero />

        <section id="signal" data-event-reveal className="relative border-b border-[#a3ff12]/10 bg-[#050a06]">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24 lg:px-16 lg:py-28">
            <div>
              <p className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#a3ff12]"><Binary className="h-4 w-4" /> 01 / About the event</p>
              <h2 className="max-w-lg text-4xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-5xl">Beyond theory.<br /><span className="text-white/35">Into the business world.</span></h2>
            </div>
            <div className="flex flex-col justify-between gap-8">
              <p className="max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
                PRIMUS is an overnight, inter-college business and case competition organised by Thapar Venture Club (TVC) in collaboration with Saturnalia’26. It brings together aspiring entrepreneurs, strategists, innovators and finance enthusiasts to tackle challenges inspired by the real business world.
              </p>
              <div className="grid grid-cols-2 gap-5 border-t border-white/10 pt-6 sm:grid-cols-3">
                <div><p className="font-mono text-2xl text-[#a3ff12]">600–700</p><p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">Expected participants</p></div>
                <div><p className="font-mono text-2xl text-[#a3ff12]">150</p><p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">Expected teams</p></div>
                <div className="col-span-2 sm:col-span-1"><p className="font-mono text-2xl text-[#a3ff12]">03</p><p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">Specialised tracks</p></div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="primus-details-title" data-event-reveal className="border-y border-[#a3ff12]/10 bg-[#030704]">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#a3ff12]"><CalendarDays className="h-4 w-4" /> 02 / The PRIMUS experience</p>
                <h2 id="primus-details-title" className="text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">One overnight challenge.<br /><span className="text-white/35">Every decision connects.</span></h2>
              </div>
              <div className="flex items-center gap-3 border-l border-[#a3ff12]/30 pl-5">
                <MapPin className="h-7 w-7 shrink-0 text-[#a3ff12]" />
                <div><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">Venue</p><p className="mt-1 text-lg font-semibold text-white">CSED, TIET Patiala</p></div>
              </div>
            </div>
            <div className="mt-12 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-[#030704] p-5 sm:p-6"><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">Date</p><p className="mt-3 text-xl font-semibold text-white">20 November 2026</p><p className="mt-1 font-mono text-xs text-[#a3ff12]">Friday</p></div>
              <div className="bg-[#030704] p-5 sm:p-6"><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">Duration</p><p className="mt-3 text-xl font-semibold text-white">10:00 PM – 8:00 AM</p><p className="mt-1 font-mono text-xs text-[#a3ff12]">Overnight</p></div>
              <div className="bg-[#030704] p-5 sm:p-6"><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">Expected teams</p><p className="mt-3 text-xl font-semibold text-white">150</p><p className="mt-1 text-xs text-white/45">Across three tracks</p></div>
              <div className="bg-[#030704] p-5 sm:p-6"><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">Rounds per track</p><p className="mt-3 text-xl font-semibold text-white">3–4</p><p className="mt-1 text-xs text-white/45">Interconnected rounds</p></div>
            </div>
            <div className="mt-5 flex items-start gap-3 text-xs leading-relaxed text-white/45">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#a3ff12]/70" />
              <p>With around 50 teams expected in each track, participants will progress through challenges where every stage builds on the decisions made before it.</p>
            </div>
          </div>
        </section>

        <section id="tracks" data-event-reveal className="relative bg-[#030604] py-20 sm:py-28">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(163,255,18,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(163,255,18,0.13)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
          <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
            <div className="mb-12 flex flex-col gap-6 border-b border-white/10 pb-8 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#a3ff12]"><Cpu className="h-4 w-4" /> 03 / The three tracks</p>
                <h2 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">Three tracks.<br /><span className="text-white/35">Three perspectives.</span></h2>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-white/45">Each track offers a distinct perspective on the business ecosystem, with 3–4 interconnected rounds.</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {tracks.map((track) => {
                const Icon = track.icon;
                const isSelected = selectedTrack === track.number;
                return (
                  <button
                    key={track.number}
                    type="button"
                    aria-expanded={isSelected}
                    aria-controls="primus-track-details"
                    onClick={() => setSelectedTrack(isSelected ? null : track.number)}
                    className={`tvc-event-track group relative flex min-h-[300px] w-full flex-col overflow-hidden border p-7 text-left transition-all duration-300 sm:p-8 ${isSelected ? "border-[#a3ff12]/70 bg-[#0a160c]" : "border-[#a3ff12]/15 bg-[#071009]/85 hover:-translate-y-1 hover:border-[#a3ff12]/50 hover:bg-[#0a160c]"}`}
                  >
                    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${track.accent} to-transparent transition-opacity duration-300 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                    <div className="relative flex w-full items-start justify-between">
                      <span className="font-mono text-[10px] tracking-[0.2em] text-[#a3ff12]/65">TRACK / {track.number}</span>
                      <span className={`flex h-11 w-11 items-center justify-center border transition-all duration-300 ${isSelected ? "border-[#a3ff12] bg-[#a3ff12] text-black" : "border-[#a3ff12]/25 text-[#a3ff12] group-hover:bg-[#a3ff12] group-hover:text-black"}`}><Icon className="h-5 w-5" /></span>
                    </div>
                    <div className="relative mt-auto w-full pt-12">
                      <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.24em] text-[#a3ff12]/65">{track.code}</p>
                      <h3 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-4xl">{track.title}</h3>
                      <p className="mt-3 text-sm text-white/65">{track.descriptor}</p>
                      <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
                        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#a3ff12]">{isSelected ? "Close details" : "Explore track"}</span>
                        <ArrowDown className={`h-4 w-4 text-[#a3ff12] transition-transform duration-300 ${isSelected ? "rotate-180" : ""}`} />
                      </div>
                    </div>
                    <div aria-hidden="true" className="absolute -bottom-12 -right-4 font-mono text-[140px] font-bold leading-none text-[#a3ff12]/[0.035] transition-transform duration-700 group-hover:-translate-y-3">{track.number}</div>
                  </button>
                );
              })}
            </div>

            {activeTrack && (
              <div id="primus-track-details" className="mt-6 border border-[#a3ff12]/25 bg-[#071009] p-7 sm:p-10" aria-live="polite">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-3xl">
                    <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-[#a3ff12]">TRACK / {activeTrack.number} · {activeTrack.code}</p>
                    <h3 className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">{activeTrack.title}</h3>
                    <p className="mt-3 text-base text-white/65">{activeTrack.descriptor}</p>
                    <p className="mt-6 text-sm leading-relaxed text-white/60 sm:text-base">{activeTrack.description}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedTrack(null)} className="w-fit border border-white/15 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/60 transition-colors hover:border-[#a3ff12]/60 hover:text-[#a3ff12]">Close ×</button>
                </div>
                <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                  {activeTrack.tags.map((tag) => <span key={tag} className="border border-[#a3ff12]/20 bg-[#a3ff12]/5 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#d9ffd1]/70">{tag}</span>)}
                </div>
              </div>
            )}
          </div>
        </section>

        <section data-event-reveal className="border-y border-[#a3ff12]/15 bg-[#071009]">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-[#a3ff12]">04 / More than a competition</p>
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.055em] sm:text-5xl">Every move matters.<br /><span className="text-white/35">Every decision connects.</span></h2>
              <div>
                <p className="text-base leading-relaxed text-white/60">PRIMUS is an opportunity to experience the different dimensions of the business world — from creating products and shaping strategies to evaluating investments and helping startups grow. It brings together people curious about entrepreneurship, business, innovation and decision-making, giving them a platform to challenge themselves, learn through experience and engage with like-minded minds.</p>
                <p className="mt-6 border-l border-[#a3ff12]/60 pl-5 text-lg leading-relaxed text-white">PRIMUS — Where Every Decision Connects.</p>
                <a href="https://www.saturnalia.in/events/business" target="_blank" rel="noopener noreferrer" className="group mt-8 inline-flex items-center gap-3 bg-[#a3ff12] px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-black transition-all hover:-translate-y-1 hover:bg-[#c2ff70]">
                  Explore PRIMUS’26 <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
