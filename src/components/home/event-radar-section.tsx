"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, Download, MapPin, Radio, Sparkles } from "lucide-react";

interface CountdownEvent {
  id: string;
  label: string;
  edition: string;
  title: string;
  dateLabel: string;
  targetIso: string;
  venue: string;
  href: string;
  description: string;
}

const COUNTDOWN_EVENTS: CountdownEvent[] = [
  {
    id: "primus-26",
    label: "PRIMUS'26",
    edition: "Annual Flagship Competition",
    title: "PRIMUS'26 — The Flagship Venture Arena",
    dateLabel: "20 November 2026 · 10:00 PM IST",
    targetIso: "2026-11-20T22:00:00+05:30",
    venue: "Thapar Institute of Engineering & Technology, Patiala",
    href: "/events/tvc-x-sat",
    description:
      "High-stakes case battles, business planning challenges and venture creation sprints bringing together ambitious founders and industry leaders.",
  },

];

export function EventRadarSection() {
  const [selectedId, setSelectedId] = useState<string>("primus-26");
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const active = COUNTDOWN_EVENTS.find((e) => e.id === selectedId) ?? COUNTDOWN_EVENTS[0];

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const diff = Math.max(0, new Date(active.targetIso).getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [active.targetIso]);

  const downloadCalendarInvite = () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Thapar Venture Club//TVC//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${active.title}`,
      `DESCRIPTION:${active.description}`,
      `LOCATION:${active.venue}`,
      "DTSTART:20261120T163000Z",
      "DTEND:20261121T023000Z",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="countdown"
      data-home-beat
      aria-label="Upcoming Flagship Countdown"
      className="relative overflow-hidden border-t border-white/[0.08] bg-[#050505] py-10 sm:py-16 lg:py-24 text-[#f4f3ef]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/5 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#f5ed00]/[0.055] blur-[72px]" />
        <div className="absolute right-1/5 top-1/3 h-80 w-80 rounded-full bg-white/[0.035] blur-[64px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div
          data-tvc-glass-card
          className="tvc-glass-panel relative overflow-hidden rounded-2xl border border-white/[0.18] bg-[#10100d]/90 p-5 sm:p-8 lg:p-12 shadow-[0_32px_96px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.24)]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f5ed00]/70 to-transparent"
          />
          <div
            aria-hidden="true"
            className="tvc-panel-sheen pointer-events-none absolute -inset-y-24 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/[0.045] to-transparent"
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 lg:gap-12">
            <div className="lg:max-w-xl">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-xl px-3 py-0.5 sm:px-3.5 sm:py-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-[#f5ed00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                  <Radio className="h-3 w-3 animate-pulse text-[#f5ed00]" />
                  Live Countdown
                </span>

                <div className="inline-flex rounded-full border border-white/15 bg-black/45 backdrop-blur-xl p-0.5 sm:p-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
                  {COUNTDOWN_EVENTS.map((ev) => {
                    const isSelected = ev.id === selectedId;
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setSelectedId(ev.id)}
                        className={`rounded-full px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-all duration-300 ${isSelected
                            ? "bg-[#f5ed00] text-black font-semibold shadow-[0_0_20px_rgba(245,237,0,0.45)]"
                            : "text-white/60 hover:text-white"
                          }`}
                      >
                        {ev.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45 mb-1.5 sm:mb-2 flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-[#f5ed00]" />
                {active.edition}
              </p>
              <h2 className="text-xl xs:text-2xl sm:text-4xl font-medium tracking-tight text-white leading-[1.12]">
                {active.title}
              </h2>
              <p className="mt-3 sm:mt-3 text-sm sm:text-base text-white/75 leading-relaxed">
                {active.description}
              </p>

              <div className="mt-5 sm:mt-6 flex flex-col items-stretch gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 text-sm font-mono text-white/90">
                <span className="inline-flex min-h-11 items-center gap-3 rounded-xl border border-white/20 bg-black/55 px-3.5 py-2.5 text-xs sm:min-h-0 sm:rounded-full sm:py-1.5 sm:text-xs">
                  <Calendar className="h-3.5 w-3.5 text-[#f5ed00]" />
                  {active.dateLabel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs">
                  <MapPin className="h-3.5 w-3.5 text-[#f5ed00]" />
                  {active.venue}
                </span>
              </div>

              <div className="mt-6 sm:mt-7 flex w-full max-w-sm flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href={active.href}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-[#f5ed00] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.12em] text-black shadow-[0_0_28px_rgba(245,237,0,0.24)] transition-colors hover:bg-[#fff957] sm:w-auto sm:min-h-11 sm:px-5 sm:py-2.5 sm:text-xs sm:tracking-widest"
                >
                  <span>Explore Initiative</span>
                  <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
                <button
                  type="button"
                  onClick={downloadCalendarInvite}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm border border-white/30 bg-white/[0.09] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:border-[#f5ed00]/70 hover:bg-white/[0.14] sm:w-auto sm:min-h-11 sm:px-4 sm:py-2.5 sm:text-xs sm:tracking-widest"
                >
                  <Download className="h-3.5 w-3.5 text-[#f5ed00]" />
                  <span>Add to Calendar</span>
                </button>
              </div>
            </div>

            <div className="w-full lg:w-auto flex-shrink-0 flex flex-col gap-2.5 sm:gap-4">
              <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-white/50">
                <span className="inline-flex items-center gap-1.5 sm:gap-2 text-[#f5ed00]">
                  <span className="relative flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full border border-[#f5ed00]/40">
                    <span className="tvc-radar-sweep absolute inset-0 rounded-full" />
                    <Clock className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-[#f5ed00]" />
                  </span>
                  T-Minus Launch Window
                </span>
                <span>IST (UTC+5:30)</span>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3.5">
                {[
                  { label: "Days", value: timeLeft.days },
                  { label: "Hours", value: timeLeft.hours },
                  { label: "Minutes", value: timeLeft.minutes },
                  { label: "Seconds", value: timeLeft.seconds },
                ].map((unit, idx) => (
                  <div
                    key={unit.label}
                    className="tvc-glass-tile group relative overflow-hidden rounded-xl border border-white/[0.16] bg-white/[0.05] backdrop-blur-2xl px-2 py-2.5 xs:px-2.5 xs:py-3 sm:px-5 sm:py-6 text-center shadow-[0_16px_40px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.26)]"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f5ed00]/55 to-transparent"
                    />
                    <div
                      className={`font-mono text-xl xs:text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#f5ed00] drop-shadow-[0_0_20px_rgba(245,237,0,0.35)] ${idx === 3 ? "animate-pulse" : ""
                        }`}
                    >
                      {mounted ? String(unit.value).padStart(2, "0") : "--"}
                    </div>
                    <div className="mt-1 font-mono text-[9px] xs:text-[10px] sm:text-[10px] uppercase tracking-[0.18em] text-white/75">
                      {unit.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
