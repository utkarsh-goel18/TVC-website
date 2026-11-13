"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function PlayVideoOnView({
  src,
  className = "",
  poster,
}: {
  src: string;
  className?: string;
  poster?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = isMuted;
  }, [isMuted]);

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        className={className}
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-label="Thapar Venture Club E-Summit speaker film"
      >
        {hasEntered && <source src={src} type="video/mp4" />}
      </video>
      <button
        type="button"
        onClick={() => {
          const nextMuted = !isMuted;
          setIsMuted(nextMuted);
          if (videoRef.current?.paused) {
            void videoRef.current.play().catch(() => undefined);
          }
        }}
        aria-label={isMuted ? "Turn speaker-film sound on" : "Mute speaker-film"}
        aria-pressed={!isMuted}
        className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 border border-white/25 bg-black/75 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur-sm transition-colors hover:border-[#f5ed00] hover:text-[#f5ed00]"
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        {isMuted ? "Sound off · Tap for sound" : "Sound on · Tap to mute"}
      </button>
    </div>
  );
}
