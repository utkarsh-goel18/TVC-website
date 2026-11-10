"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Camera } from "lucide-react";

const slides = [
  "/images/about/TVC-01.png",
  "/images/about/TVC-02.jpeg",
  "/images/about/TVC-03.jpeg",
  "/images/about/TVC-04.jpeg",
  "/images/about/TVC-05.JPG",
  "/images/about/TVC-06.jpeg",
  "/images/about/TVC-07.jpeg",
].map((src, index) => ({
  src,
  number: String(index + 1).padStart(2, "0"),
}));

const AUTOPLAY_INTERVAL = 2400;

export function AboutPhotoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const activeSlide = slides[activeIndex];
  const imageAvailable = !failedImages.includes(activeSlide.src);

  useEffect(() => {
    if (isPaused) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_INTERVAL);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  const showPrevious = () =>
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  const showNext = () =>
    setActiveIndex((current) => (current + 1) % slides.length);

  return (
    <div
      data-tvc-glass-card
      className="group relative overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.03] backdrop-blur-2xl shadow-[0_28px_80px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.22)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
      aria-roledescription="carousel"
      aria-label="Thapar Venture Club photo archive"
    >
      {/* Specular Top Edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#f5ed00]/60 to-transparent"
      />

      {/* Full-bleed photo stage */}
      <div className="relative flex aspect-[16/9] sm:aspect-[21/9] min-h-[170px] xs:min-h-[190px] sm:min-h-[320px] w-full items-center justify-center overflow-hidden bg-[#090909]">
        {slides.map((slide, index) =>
          !failedImages.includes(slide.src) ? (
            <img
              key={slide.src}
              src={slide.src}
              alt={
                index === activeIndex
                  ? `Thapar Venture Club campus and community moment ${slide.number}`
                  : ""
              }
              aria-hidden={index !== activeIndex}
              loading="eager"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform,filter] duration-700 ease-out motion-reduce:transition-none ${
                index === activeIndex
                  ? "z-[1] scale-100 opacity-100 filter-none"
                  : "z-0 scale-110 opacity-0 blur-[2px]"
              }`}
              onError={() =>
                setFailedImages((current) =>
                  current.includes(slide.src) ? current : [...current, slide.src]
                )
              }
            />
          ) : null
        )}

        {/* Subtle vignette + Floating Glass Badge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/65 via-transparent to-black/25"
        />
        <div className="pointer-events-none absolute left-3 top-3 sm:left-4 sm:top-4 z-[3] inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-black/45 backdrop-blur-xl px-2.5 py-0.5 sm:px-3.5 sm:py-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f5ed00] shadow-[0_0_8px_#f5ed00]" />
          <span>Frame {activeSlide.number} / 07</span>
        </div>

        {!imageAvailable ? (
          <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_45%,rgba(245,237,0,0.08),transparent_65%)] px-6 text-center">
            <Camera className="mb-4 h-8 w-8 text-[#f5ed00]/70" />
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#f4f3ef]/70">
              TVC Photo Archive
            </p>
            <p className="mt-2 font-mono text-[10px] text-white/35">
              Image {activeSlide.number} · Upload photo to activate
            </p>
          </div>
        ) : null}
      </div>

      {/* Frosted Glass Control Strip */}
      <div className="flex items-center justify-between gap-3 border-t border-white/[0.12] bg-white/[0.03] backdrop-blur-2xl px-3.5 py-2 sm:px-6 sm:py-3">
        <div className="flex items-center gap-1.5" aria-label="Choose photo">
          {slides.map((slide, index) => (
            <button
              key={slide.number}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00] ${
                activeIndex === index
                  ? "w-8 bg-[#f5ed00] shadow-[0_0_12px_rgba(245,237,0,0.6)]"
                  : "w-1.5 bg-white/25 hover:bg-white/55"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-1 hidden font-mono text-[9px] uppercase tracking-[0.15em] text-white/45 sm:inline">
            Auto · 2.4 sec
          </span>
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Previous photo"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] backdrop-blur-md text-white/80 transition-all hover:border-[#f5ed00]/60 hover:bg-[#f5ed00]/10 hover:text-[#f5ed00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label="Next photo"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] backdrop-blur-md text-white/80 transition-all hover:border-[#f5ed00]/60 hover:bg-[#f5ed00]/10 hover:text-[#f5ed00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00]"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
