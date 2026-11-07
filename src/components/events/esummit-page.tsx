"use client";

import { useEffect, useRef } from "react";\nimport Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, Play, VolumeX } from "lucide-react";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { PlayVideoOnView } from "@/components/events/play-video-on-view";
import { ESummitTeamGallery } from "@/components/events/esummit-team-gallery";

const summitEvents = [
  { name: "Uni2Unicorn", date: "February 6", time: "6:00 PM", venue: "LT202", description: "Bid. Build. Pivot. Pitch. A fast-paced entrepreneurial battlefield where campus locations turn into powerful startup ideas.", image: "/images/esummit/events/uni2unicorn.jpeg" },
  { name: "Boardroom", date: "February 13", time: "9:00 PM", venue: "Activity Space", description: "Innovate, market, survive crises, and scale your startup in this high-stakes business simulation.", image: "/images/esummit/events/boardroom.jpg" },
  { name: "Opening Ceremony", date: "February 18", time: "6:00 PM", venue: "Main Auditorium", description: "An inspiring inauguration marking the beginning of E-Summit with a distinguished keynote address.", image: "/images/esummit/events/opening-ceremony.jpg" },
  { name: "Internship Fair", date: "February 19", time: "3:00 PM", venue: "K Lawns", description: "Connecting students with recruiters and startups to unlock internships and real-world opportunities.", image: "/images/esummit/events/internship-fair.jpeg" },
  { name: "Biz Conclave", date: "February 21", time: "5:00 PM", venue: "LT102", description: "A formal conclave bringing together industry leaders to share insights across business, entrepreneurship, finance, and technology.", image: "/images/esummit/events/biz-conclave.jpeg" },
  { name: "Unwind", date: "February 22", time: "5:30 PM", venue: "OAT", description: "An unforgettable evening where ideas, creativity, and connections come alive.", image: "/images/esummit/events/unwind.jpg" },
];

export function ESummitPage() {
  return (
    <div className="min-h-screen bg-[#080807] text-[#f4f3ef] selection:bg-[#f5ed00] selection:text-black">
      <SiteHeader />
      <main id="main-content" ref={pageRef}>
        {/* Upload the official aftermovie to public/videos/esummit-aftermovie.mp4.
            Optional still fallback: public/events/esummit-2025-poster.jpg */}
        <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#080807]">
          <video
            className="absolute inset-0 -z-20 h-full w-full object-cover"
            autoPlay muted loop playsInline preload="metadata"
            poster="/events/esummit-2025-poster.jpg"
          >
            <source src="/videos/esummit-aftermovie.mp4" type="video/mp4" />
          </video>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-black/65 via-black/35 to-[#080807]" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_35%,rgba(245,237,0,0.13),transparent_50%)]" />

          <div className="mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-between px-6 pb-9 pt-36 sm:px-8 sm:pb-12 sm:pt-40 lg:px-12">
            <Link href="/events" className="inline-flex w-fit items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/65 transition-colors hover:text-[#f5ed00]">
              <ArrowLeft className="h-3.5 w-3.5" /> All events
            </Link>

            <div className="max-w-5xl py-16">
              <p className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5ed00]">
                <span className="h-px w-8 bg-[#f5ed00]" /> Thapar Venture Club presents
              </p>
              <h1 className="text-[clamp(4.5rem,13vw,11rem)] font-semibold leading-[0.78] tracking-[-0.09em]">
                E-SUMMIT<span className="text-[#f5ed00]">'26</span>
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-2xl">
                Five days of innovation, entrepreneurship and future technologies.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 border border-[#f5ed00]/50 bg-black/35 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white">
                  <CalendarDays className="h-4 w-4 text-[#f5ed00]" /> 18—22 February 2026
                </span>
                <span className="border border-white/20 bg-black/30 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">
                  12th edition · TIET Patiala
                </span>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a href="#experience" className="inline-flex items-center gap-3 bg-[#f5ed00] px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black transition-transform hover:-translate-y-1">
                  Explore the summit <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="flex items-end justify-between border-t border-white/20 pt-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">A flagship experience by TVC · TIET Patiala</p>
              <span className="hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/50 sm:inline-flex"><VolumeX className="h-3.5 w-3.5" /> Aftermovie · Sound off</span>
            </div>
          </div>
        </section>

        <section id="experience" data-event-reveal className="border-b border-white/10 bg-[#0b0b09]">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24 lg:px-12">
            <div>
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.25em] text-[#f5ed00]">01 / The summit</p>
              <h2 className="max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl">A meeting ground for ideas and ambition.</h2>
            </div>
            <div className="flex flex-col justify-between gap-8">
              <p className="text-lg leading-relaxed text-white/65">
                E-Summit'26 marked the 12th edition of Thapar Venture Club's flagship summit: a five-day celebration of innovation, entrepreneurship and future technologies, held from 18 to 22 February 2026.
              </p>
              <p className="border-l border-[#f5ed00]/60 pl-5 text-base leading-relaxed text-white/80">
                A campus-wide platform to discover ideas, exchange perspectives and connect with the people shaping what comes next.
              </p>
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <div><p className="text-3xl font-semibold text-[#f5ed00]">12th</p><p className="mt-2 font-mono text-[8px] uppercase tracking-[0.14em] text-white/40 sm:text-[9px]">Edition</p></div>
                <div><p className="text-3xl font-semibold text-[#f5ed00]">05</p><p className="mt-2 font-mono text-[8px] uppercase tracking-[0.14em] text-white/40 sm:text-[9px]">Days</p></div>
                <div><p className="text-3xl font-semibold text-[#f5ed00]">2026</p><p className="mt-2 font-mono text-[8px] uppercase tracking-[0.14em] text-white/40 sm:text-[9px]">February</p></div>
              </div>
            </div>
          </div>
        </section>

        <section id="event-lineup" data-event-reveal className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mb-12 flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#f5ed00]">02 / The programme</p>
              <h2 className="text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Six moments.<br /><span className="text-white/35">One summit.</span></h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/45">From startup simulations and conversations to opportunities and the closing celebration.</p>
          </div>
          <div className="-mx-6 overflow-x-auto px-6 pb-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 [scrollbar-width:thin] [scrollbar-color:rgba(245,237,0,0.45)_transparent]">
            <div className="flex w-max snap-x snap-mandatory gap-5">
              {summitEvents.map((event, index) => (
                <article key={event.name} data-event-reveal className="tvc-esummit-event-card "w-[82vw] max-w-[430px] shrink-0 snap-start border border-white/10 bg-[#10100e] sm:w-[430px]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#171717]">
                    <img src={event.image} alt={`${event.name} at E-Summit 2026`} loading="lazy" className="absolute inset-0 z-10 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                    <div className="absolute inset-0 -z-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_45%,rgba(100,130,255,0.12),transparent_65%)]">
                      <span className="font-mono text-3xl text-white/20">0{index + 1}</span>
                      <span className="mt-2 font-mono text-[8px] uppercase tracking-[0.16em] text-white/30">Event photograph</span>
                    </div>
                    <span className="absolute left-4 top-4 bg-black/70 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#f5ed00]">0{index + 1} / 06</span>
                  </div>
                  <div className="flex min-h-[245px] flex-col p-6 sm:p-7">
                    <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#8dbbff]">E-Summit event</p>
                    <h3 className="text-3xl font-semibold tracking-[-0.045em]">{event.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/55">{event.description}</p>
                    <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-6 font-mono text-[9px] uppercase tracking-[0.12em] text-white/45">
                      <span>{event.date} · {event.time}</span><span>{event.venue}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">Scroll horizontally to explore all six events <span className="text-[#f5ed00]">→</span></p>
        </section>

        <section data-event-reveal className="border-y border-white/10 bg-[#050505] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="mb-10 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#f5ed00]">03 / The people behind it</p>
                <h2 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">The team that made it happen.</h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-white/45">The people, teamwork and shared effort behind E-Summit 2026.</p>
            </div>
            <ESummitTeamGallery />
          </div>
        </section>

        <section data-event-reveal className="border-y border-white/10 bg-[#0b0b09] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#f5ed00]">04 / The conversations</p>
                <h2 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Perspectives that stay with you.</h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-white/45">A speaker-film edit from E-Summit'26.</p>
            </div>
            {/* Upload speaker edit to public/videos/esummit-2026-speaker-collage.mp4.
                Optional poster: public/events/esummit-2026-speakers-poster.jpg */}
            <div className="relative aspect-video overflow-hidden border border-white/10 bg-black">
              <PlayVideoOnView
                src="/videos/esummit-2026-speaker-collage.mp4"
                poster="/events/esummit-2026-speakers-poster.jpg"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/65"><Play className="h-3.5 w-3.5" /> E-Summit 2026 · Speaker edit</div>
            </div>
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">Video plays muted when it enters the viewport.</p>
          </div>
        </section>

        <section data-event-reveal className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="flex flex-col gap-6 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#f5ed00]">TVC · Ideate, Ascend, Lead</p>
              <h2 className="text-2xl font-semibold sm:text-3xl">The next chapter starts with an idea.</h2>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
