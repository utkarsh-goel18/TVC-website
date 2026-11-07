"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Camera } from "lucide-react";

const slides = Array.from({ length: 7 }, (_, index) => ({
  src: `/images/about/tvc-${String(index + 1).padStart(2, "0")}.${index === 0 ? "png" : index === 4 ? "jpg" : "jpeg"}`,
  number: String(index + 1).padStart(2, "0"),
}));

const AUTOPLAY_INTERVAL = 5000;

export function AboutPhotoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const activeSlide = slides[activeIndex];
  const imageAvailable = !failedImages.includes(activeSlide.src);

  useEffect(() => {
    if (isPaused) return;

    // Respect visitors who have requested reduced motion at OS/browser level.
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
      className="group relative overflow-hidden border border-white/[0.09] bg-[#141413]"
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
      {/* A consistent stage keeps the layout steady; object-contain preserves each photo's full aspect ratio. */}
      <div className="relative flex aspect-[21/9] min-h-[220px] w-full items-center justify-center overflow-hidden bg-[#090909] sm:min-h-[300px]">
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
              className={`absolute inset-0 h-full w-full object-contain transition-[opacity,transform] duration-1000 ease-in-out motion-reduce:transition-none ${
                index === activeIndex
                  ? "z-[1] scale-100 opacity-100"
                  : "z-0 scale-[1.015] opacity-0"
              }`}
              onError={() =>
                setFailedImages((current) =>
                  current.includes(slide.src) ? current : [...current, slide.src],
                )
              }
            />
          ) : null,
        )}
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

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />
        <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/75 sm:left-6 sm:top-6">
          TVC / Campus & Community
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between sm:bottom-6 sm:left-6 sm:right-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f5ed00]">
              Moments that move us
            </p>
            <p className="mt-1 text-sm text-white/80">Thapar Venture Club · TIET Patiala</p>
          </div>
          <p className="font-mono text-xs tabular-nums text-white/80" aria-live="polite">
            {activeSlide.number}<span className="text-white/35"> / 07</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-white/[0.08] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-1.5" aria-label="Choose photo">
          {slides.map((slide, index) => (
            <button
              key={slide.number}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141413] ${activeIndex === index ? "w-7 bg-[#f5ed00]" : "w-1.5 bg-white/25 hover:bg-white/55"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-1 hidden font-mono text-[9px] uppercase tracking-[0.15em] text-white/35 sm:inline">
            Auto · 5 sec
          </span>
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Previous photo"
            className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/75 transition-colors hover:border-[#f5ed00]/50 hover:text-[#f5ed00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label="Next photo"
            className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/75 transition-colors hover:border-[#f5ed00]/50 hover:text-[#f5ed00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00]"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
