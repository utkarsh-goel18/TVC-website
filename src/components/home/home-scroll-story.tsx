"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
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
      const media = gsap.utils.toArray<HTMLElement>(".tvc-story-media", track);
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
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progressRef.current) gsap.set(progressRef.current, { scaleX: self.progress });
            },
          },
        });

        // Keep the horizontal travel and every chapter animation on the same
        // three-beat timeline. Previously the final image animation extended
        // the timeline beyond the track movement, leaving the last panel parked
        // on screen for too long.
        const storyDuration = panels.length;
        timeline.to(track, { x: () => -distance(), duration: storyDuration, ease: "none" }, 0);
        media.forEach((item, index) => {
          const image = item.querySelector("img");
          if (image) timeline.fromTo(image, { scale: 1.12 }, { scale: 1, duration: 1, ease: "none" }, index);
        });
        copy.forEach((item) => {
          gsap.set(item, { y: 0, autoAlpha: 1 });
        });
        return () => timeline.scrollTrigger?.kill();
      });

      mm.add("(max-width: 899px)", () => {
        panels.forEach((panel) => {
          const text = panel.querySelector(".tvc-story-copy");
          const image = panel.querySelector(".tvc-story-media");
          if (text) gsap.fromTo(text, { y: 36, autoAlpha: 0.35 }, {
            y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: panel, start: "top 78%", once: true },
          });
          if (image) gsap.fromTo(image, { scale: 0.94, clipPath: "inset(8% 5% 8% 5%)" }, {
            scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power2.out",
            scrollTrigger: { trigger: panel, start: "top 75%", once: true },
          });
        });
      });
    }, section);

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} id="story" className="relative overflow-hidden bg-[#050505] text-[#f4f3ef]">
      <div className="relative z-20 flex min-h-[190px] flex-col items-start justify-center gap-5 border-y border-white/10 bg-[#080808] px-6 py-9 sm:min-h-[210px] sm:px-10 lg:min-h-[230px] lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:px-16 lg:py-11">
        <div className="max-w-5xl">
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f5ed00] sm:text-xs">TVC / A philosophy in motion</p>
          <h2 className="max-w-5xl text-[clamp(2.35rem,5vw,5.25rem)] font-semibold leading-[0.94] tracking-[-0.065em] text-[#f4f3ef]">
            The journey from idea to impact<span className="text-[#f5ed00]">.</span>
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-3 pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65 sm:text-[11px] lg:mb-1">
          <ArrowDown className="h-4 w-4 text-[#f5ed00]" /> Scroll to move through
        </div>
      </div>

      <div ref={trackRef} className="tvc-story-track">
        {chapters.map((chapter, index) => (
          <article key={chapter.number} className="tvc-story-panel relative isolate flex min-h-[690px] flex-col items-center justify-center overflow-hidden border-b border-white/10 px-5 py-8 sm:px-10 lg:h-[calc(100vh-270px)] lg:min-h-[500px] lg:max-h-[760px] lg:w-screen lg:flex-none lg:flex-row lg:gap-12 lg:px-[7vw] lg:py-8">
            <div className="tvc-story-copy relative z-20 order-2 mx-auto mt-5 w-full max-w-4xl shrink-0 text-center lg:order-2 lg:mt-0 lg:w-[40%] lg:max-w-[560px] lg:text-left">
              <p className="mb-3 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.26em] text-[#f5ed00] lg:justify-start">
                <span className="h-px w-8 bg-[#f5ed00]" /> {chapter.eyebrow} <span className="h-px w-8 bg-[#f5ed00]" />
              </p>
              <span className="block font-mono text-[11px] tracking-[0.2em] text-white/30">{chapter.number} / 03</span>
              <h3 className="mt-2 text-[clamp(2rem,3.5vw,3.8rem)] font-medium leading-[0.96] tracking-[-0.065em]">{chapter.title}</h3>
              <p className="mx-auto mt-3 max-w-2xl text-xs font-medium leading-5 text-white/80 sm:text-sm sm:leading-6 lg:mx-0 lg:mt-5">{chapter.copy}</p>
              <div className="mt-4 flex items-center justify-center gap-4 lg:mt-8 lg:justify-start">
                <span className="font-mono text-[10px] tracking-[0.24em] text-[#f5ed00]">{chapter.note}</span>
                <span className="h-px w-16 bg-white/20" />
                <span className="font-mono text-[9px] tracking-[0.18em] text-white/30">THAPAR VENTURE CLUB</span>
              </div>
              {index === 2 && (
                <Link href="/team" className="mt-5 inline-flex items-center gap-3 border-b border-[#f5ed00]/60 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#f5ed00] transition-colors hover:text-white lg:mt-8">
                  Meet the people behind it <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            <div className="tvc-story-media relative order-1 h-[34vh] min-h-[230px] max-h-[360px] w-full max-w-5xl shrink-0 overflow-hidden bg-[#141413] shadow-[0_30px_100px_rgba(0,0,0,0.45)] lg:order-1 lg:h-[min(58vh,520px)] lg:min-h-[300px] lg:max-h-[520px] lg:w-[56%] lg:max-w-none">
              <Image src={chapter.image} alt={chapter.imageAlt} fill priority={index === 0} sizes="(max-width: 900px) 100vw, 55vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
              <span className="absolute bottom-5 left-5 font-mono text-[9px] uppercase tracking-[0.22em] text-white/75">TVC / {chapter.note}</span>
              <span className="absolute right-5 top-5 font-mono text-[10px] text-white/65">{chapter.number}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="relative z-20 flex items-center justify-between border-t border-white/10 px-6 py-4 sm:px-10 lg:px-16">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">Ideate · Ascend · Lead</span>
        <div className="h-px w-28 overflow-hidden bg-white/15 sm:w-48"><div ref={progressRef} className="h-full origin-left scale-x-0 bg-[#f5ed00]" /></div>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">Keep exploring</span>
      </div>
    </section>
  );
}
