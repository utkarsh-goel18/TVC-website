"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowDownRight, ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { previousSpeakers } from "@/data/speakers";

export function SpeakersPage() {
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = pageRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-speaker-card]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -35px 0px" }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[#050504] text-[#f4f3ef] selection:bg-[#f5ed00] selection:text-black">
      <SiteHeader />

      <main id="main-content" ref={pageRef}>
        <section className="tvc-speakers-hero relative flex min-h-[88svh] flex-col justify-end overflow-hidden border-b border-white/10 px-6 pb-12 pt-32 sm:px-10 sm:pb-16 lg:min-h-[92svh] lg:px-16 lg:pb-20">
          <div aria-hidden="true" className="tvc-speakers-grid pointer-events-none absolute inset-0 opacity-40" />
          <div aria-hidden="true" className="tvc-speakers-orbit pointer-events-none absolute right-[-18%] top-[4%] aspect-square w-[75vw] max-w-[1050px] rounded-full border border-[#f5ed00]/10" />
          <div aria-hidden="true" className="tvc-speakers-orbit tvc-speakers-orbit-two pointer-events-none absolute right-[-7%] top-[15%] aspect-square w-[55vw] max-w-[760px] rounded-full border border-white/[0.07]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_36%,rgba(245,237,0,0.09),transparent_38%),linear-gradient(90deg,#050504_5%,rgba(5,5,4,.88)_42%,rgba(5,5,4,.15)_100%)]" />

          <div className="relative z-10 mx-auto w-full max-w-[1500px]">
            <Link href="/" className="mb-16 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45 transition-colors hover:text-[#f5ed00]">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to TVC
            </Link>

            <div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
              <div className="max-w-5xl">
                <p className="mb-7 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.32em] text-[#f5ed00]">
                  <span className="h-px w-9 bg-[#f5ed00]" /> The people behind the perspectives
                </p>
                <h1 className="tvc-speakers-title text-[clamp(4.4rem,13.8vw,13rem)] font-semibold leading-[0.76] tracking-[-0.095em]">
                  <span className="block">VOICES</span>
                  <span className="mt-3 block text-white/20">THAT</span>
                  <span className="mt-3 block">MOVE<span className="text-[#f5ed00]">.</span></span>
                </h1>
                <p className="mt-10 max-w-lg text-sm leading-7 text-white/55 sm:text-base">
                  Big ideas rarely come from one place. They come from people who
                  challenge the obvious, build the unexpected and leave you seeing
                  the world a little differently.
                </p>
              </div>

              <div className="flex shrink-0 items-end justify-between gap-10 border-t border-white/15 pt-5 lg:min-w-[230px] lg:border-l lg:border-t-0 lg:pb-2 lg:pl-8">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">The archive</p>
                  <p className="mt-2 text-6xl font-light leading-none tracking-[-0.08em]">{String(previousSpeakers.length).padStart(2, "0")}</p>
                  <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#f5ed00]">Voices & perspectives</p>
                </div>
                <ArrowDownRight className="mb-1 h-8 w-8 text-[#f5ed00]/70" />
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f5ed00]/50 to-transparent" />
        </section>

        <div aria-hidden="true" className="tvc-speakers-marquee overflow-hidden border-b border-white/10 py-4">
          <div className="tvc-speakers-marquee-track flex w-max items-center gap-8 whitespace-nowrap">
            {Array.from({ length: 4 }).map((_, index) => (
              <span key={index} className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">
                Ideas change everything <span className="text-[#f5ed00]">✳</span> Think beyond the obvious <span className="text-[#f5ed00]">✳</span> Learn from every voice <span className="text-[#f5ed00]">✳</span>
              </span>
            ))}
          </div>
        </div>

        <section aria-labelledby="speaker-archive-heading" className="mx-auto max-w-[1500px] px-6 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-32">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:mb-16 sm:flex-row sm:items-end">
            <div>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5ed00]">A collection of perspectives</p>
              <h2 id="speaker-archive-heading" className="text-4xl font-medium tracking-[-0.06em] sm:text-6xl">Meet the voices<span className="text-white/25">.</span></h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/40 sm:text-right">
              Different worlds. Different journeys. One shared belief in the power of ideas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-16 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-20">
            {previousSpeakers.map((speaker, index) => {
              const initials = speaker.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
              return (
                <article key={speaker.id} data-speaker-card className="tvc-speaker-card group relative">
                  <div className="tvc-speaker-image relative aspect-[4/4.8] overflow-hidden bg-[#151513]">
                    <div aria-hidden="true" className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_35%,rgba(245,237,0,.1),transparent_58%)]" />
                    {speaker.image ? (
                      <Image
                        src={speaker.image}
                        alt={speaker.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="tvc-speaker-portrait object-cover object-top"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-8xl font-semibold tracking-[-0.1em] text-white/15">{initials}</span>
                      </div>
                    )}
                    <div aria-hidden="true" className="absolute inset-0 z-[2] bg-gradient-to-t from-black/90 via-black/5 to-black/15 opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                    <span className="absolute left-5 top-5 z-[3] font-mono text-[10px] tracking-[0.2em] text-white/70">
                      NO. {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="absolute right-5 top-5 z-[3] flex h-9 w-9 items-center justify-center rounded-full border border-white/35 text-white/75 transition-all duration-500 group-hover:rotate-45 group-hover:border-[#f5ed00] group-hover:bg-[#f5ed00] group-hover:text-black">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 z-[3] p-5 sm:p-7">
                      <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-[#f5ed00]">{speaker.field}</p>
                      <h3 className="text-2xl font-medium leading-[1.05] tracking-[-0.045em] text-white sm:text-3xl">{speaker.name}</h3>
                    </div>
                    <div aria-hidden="true" className="absolute bottom-0 left-0 z-[4] h-[3px] w-0 bg-[#f5ed00] transition-all duration-700 group-hover:w-full" />
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/30 transition-colors duration-300 group-hover:border-[#f5ed00]/35 group-hover:text-white/55">
                    <span>Thapar Venture Club</span>
                    <span>Perspective {String(index + 1).padStart(2, "0")}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-white/10 bg-[#0b0b0a] px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-40 h-[500px] w-[500px] rounded-full border border-[#f5ed00]/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-24 h-[350px] w-[350px] rounded-full border border-white/[0.06]" />
          <div className="relative mx-auto flex max-w-[1500px] flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-4xl">
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5ed00]">The conversation continues</p>
              <h2 className="text-5xl font-medium leading-[0.95] tracking-[-0.07em] sm:text-7xl">
                Stay curious.
                <br />
                <span className="text-white/25">Keep questioning.</span>
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
