"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const chapters = [
  {
    number: "01",
    eyebrow: "THE SPARK",
    title: "Every big idea starts somewhere.",
    copy: "A question. A challenge. A possibility that refuses to stay just an idea.",
    image: "/images/about/what-we-do-01.JPG",
    imageAlt: "Thapar Venture Club flagship E-Summit",
    note: "IDEATE",
  },
  {
    number: "02",
    eyebrow: "THE CLIMB",
    title: "Then we give it room to grow.",
    copy: "Through experiences, mentorship, competition and the people who make progress possible.",
    image: "/images/about/what-we-do-03.jpeg",
    imageAlt: "Thapar Venture Club student competition",
    note: "ASCEND",
  },
  {
    number: "03",
    eyebrow: "THE IMPACT",
    title: "Until possibility becomes momentum.",
    copy: "A community built to connect ambitious minds and move ideas towards meaningful action.",
    image: "/images/about/TVC-04.jpeg",
    imageAlt: "Thapar Venture Club team",
    note: "LEAD",
  },
];

export function HomeScrollStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".tvc-story-panel", track);
      const copy = gsap.utils.toArray<HTMLElement>(".tvc-story-copy", track);

      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => "+=" + distance(),
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progressRef.current) gsap.set(progressRef.current, { scaleX: self.progress });
            },
          },
        });

        const storyDuration = panels.length;
        timeline.to(track, { x: () => -distance(), duration: storyDuration, ease: "none" }, 0);
        // Keep image scale fixed while the horizontal track moves.
        copy.forEach((item) => {
          gsap.set(item, { y: 0, autoAlpha: 1 });
        });
        return () => timeline.scrollTrigger?.kill();
      });

      mm.add("(max-width: 899px)", () => {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            if (progressRef.current) gsap.set(progressRef.current, { scaleX: self.progress });
          },
        });

        panels.forEach((panel) => {
          const text = panel.querySelector(".tvc-story-copy");
          const image = panel.querySelector(".tvc-story-media");
          if (text)
            gsap.fromTo(
              text,
              { y: 36, autoAlpha: 0.35 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: { trigger: panel, start: "top 78%", once: true },
              }
            );
          if (image)
            gsap.fromTo(
              image,
              { scale: 0.94, clipPath: "inset(8% 5% 8% 5%)" },
              {
                scale: 1,
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.1,
                ease: "power2.out",
                scrollTrigger: { trigger: panel, start: "top 75%", once: true },
              }
            );
        });
      });
    }, section);

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} id="story" className="relative overflow-hidden bg-[#060605] text-[#f4f3ef]">
      {/* Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[36rem] w-[36rem] rounded-full bg-[#f5ed00]/[0.035] blur-[150px]"
      />

      <div className="relative z-20 flex min-h-[120px] flex-col items-start justify-center gap-3 sm:gap-5 border-y border-white/10 bg-[#080808]/90 backdrop-blur-xl px-4 py-5 sm:min-h-[180px] sm:px-10 sm:py-8 lg:min-h-[230px] lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:px-16 lg:py-11">
        <div className="max-w-5xl">
          <p className="mb-2 sm:mb-4 inline-flex items-center gap-2 font-mono text-[9px] sm:text-xs font-semibold uppercase tracking-[0.24em] sm:tracking-[0.28em] text-[#f5ed00]">
            <Sparkles className="w-3 h-3 text-[#f5ed00]" />
            <span>TVC / A Philosophy In Motion</span>
          </p>
          <h2 className="max-w-5xl text-[clamp(1.75rem,4.5vw,5.25rem)] font-semibold leading-[0.96] tracking-[-0.06em] text-[#f4f3ef]">
            The journey from idea to impact<span className="text-[#f5ed00]">.</span>
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3 rounded-full border border-white/14 bg-white/[0.04] backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 font-mono text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] sm:tracking-[0.18em] text-white/75 lg:mb-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
          <ArrowDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#f5ed00] animate-bounce" /> Scroll to move through
        </div>
      </div>

      <div ref={trackRef} className="tvc-story-track">
        {chapters.map((chapter, index) => (
          <article
            key={chapter.number}
            className="tvc-story-panel relative isolate flex min-h-[380px] xs:min-h-[430px] sm:min-h-[520px] flex-col items-center justify-center overflow-hidden border-b border-white/10 px-4 py-5 sm:px-10 sm:py-8 lg:h-[calc(100vh-270px)] lg:min-h-[500px] lg:max-h-[760px] lg:w-screen lg:flex-none lg:flex-row lg:gap-12 lg:px-[7vw] lg:py-8"
          >
            <div className="tvc-story-copy relative z-20 order-2 mx-auto mt-3 sm:mt-5 w-full max-w-4xl shrink-0 text-center lg:order-2 lg:mt-0 lg:w-[40%] lg:max-w-[560px] lg:text-left">
              <p className="mb-2 sm:mb-3 flex items-center justify-center gap-2 sm:gap-3 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.24em] sm:tracking-[0.26em] text-[#f5ed00] lg:justify-start">
                <span className="h-px w-6 sm:w-8 bg-[#f5ed00]" /> {chapter.eyebrow}{" "}
                <span className="h-px w-6 sm:w-8 bg-[#f5ed00]" />
              </p>
              <span className="inline-block rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-0.5 font-mono text-[10px] sm:text-[11px] tracking-[0.2em] text-white/40">
                {chapter.number} / 03
              </span>
              <h3 className="mt-2 sm:mt-3 text-[clamp(1.4rem,3vw,3.8rem)] font-medium leading-[0.98] tracking-[-0.055em]">
                {chapter.title}
              </h3>
              <p className="mx-auto mt-2 sm:mt-3 max-w-2xl text-xs sm:text-sm font-medium leading-5 sm:leading-6 text-white/80 lg:mx-0 lg:mt-5">
                {chapter.copy}
              </p>
              <div className="mt-3 sm:mt-4 flex items-center justify-center gap-3 sm:gap-4 lg:mt-8 lg:justify-start">
                <span className="rounded-full border border-[#f5ed00]/30 bg-[#f5ed00]/10 px-2.5 py-0.5 sm:px-3 sm:py-1 font-mono text-[9px] sm:text-[10px] tracking-[0.22em] text-[#f5ed00] font-semibold shadow-[0_0_12px_rgba(245,237,0,0.2)]">
                  {chapter.note}
                </span>
                <span className="h-px w-10 sm:w-16 bg-white/20" />
                <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.16em] sm:tracking-[0.18em] text-white/40">
                  THAPAR VENTURE CLUB
                </span>
              </div>
              {index === 2 && (
                <Link
                  href="/team"
                  className="mt-4 sm:mt-5 inline-flex items-center gap-2 sm:gap-3 rounded-full border border-[#f5ed00]/50 bg-[#f5ed00]/10 hover:bg-[#f5ed00] hover:text-black backdrop-blur-md px-4 py-2 sm:px-5 sm:py-2.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.16em] text-[#f5ed00] transition-all shadow-[0_0_16px_rgba(245,237,0,0.15)] lg:mt-8"
                >
                  Meet the people behind it <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              )}
            </div>

            <div className="tvc-story-media relative order-1 h-[20vh] xs:h-[24vh] min-h-[150px] xs:min-h-[180px] max-h-[360px] w-full max-w-5xl shrink-0 overflow-hidden rounded-2xl border border-white/[0.14] bg-[#141413] shadow-[0_30px_100px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] lg:order-1 lg:h-[min(58vh,520px)] lg:min-h-[300px] lg:max-h-[520px] lg:w-[56%] lg:max-w-none">
              <Image
                src={chapter.image}
                alt={chapter.imageAlt}
                fill
                priority={index === 0}
                sizes="(max-width: 900px) 100vw, 55vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15" />
              <span className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-2.5 py-0.5 sm:px-3.5 sm:py-1 font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                TVC / {chapter.note}
              </span>
              <span className="absolute right-3 top-3 sm:right-5 sm:top-5 rounded-full border border-white/15 bg-black/50 backdrop-blur-md px-2 py-0.5 font-mono text-[9px] sm:text-[10px] text-white/70">
                {chapter.number}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="relative z-20 flex items-center justify-between border-t border-white/10 bg-[#080808]/80 backdrop-blur-xl px-4 py-3 sm:px-10 sm:py-4 lg:px-16">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
          Ideate · Ascend · Lead
        </span>
        <div className="h-1 w-28 overflow-hidden rounded-full bg-white/15 sm:w-48 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]">
          <div ref={progressRef} className="h-full origin-left scale-x-0 bg-[#f5ed00] shadow-[0_0_10px_#f5ed00]" />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
          Keep exploring
        </span>
      </div>
    </section>
  );
}
