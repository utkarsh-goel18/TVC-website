"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight interactive hero particle field.
 * Particles drift gently, respond to the pointer, and form a restrained gold network.
 * Rendering pauses when the hero is off-screen or the tab is hidden.
 */
export function HeroLiquidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let lastFrame = 0;
    let visible = true;
    let disposed = false;
    let pointer = { x: -1000, y: -1000, active: false };
    const dpr = Math.min(window.devicePixelRatio || 1, 1);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const count = window.innerWidth < 768 ? 22 : 38;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * Math.max(1, window.innerWidth),
      y: Math.random() * Math.max(1, window.innerHeight),
      vx: (Math.random() - 0.5) * 9,
      vy: (Math.random() - 0.5) * 9,
      radius: Math.random() * 1.25 + 0.65,
      gold: Math.random() > 0.3,
    }));

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    const draw = (now: number) => {
      if (disposed || !visible || document.hidden) return;
      if (now - lastFrame < 40) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0.04;
      lastFrame = now;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        // A soft pointer field gently bends nearby particles towards the cursor.
        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 1 && distance < 230) {
            const force = (1 - distance / 230) * 15;
            p.vx += (dx / distance) * force * delta;
            p.vy += (dy / distance) * force * delta;
          }
        }

        // Keep motion fluid and bounded without letting particles accelerate indefinitely.
        p.vx *= 0.995;
        p.vy *= 0.995;
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 15) {
          p.vx = (p.vx / speed) * 15;
          p.vy = (p.vy / speed) * 15;
        }
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        if (p.x < -12) p.x = width + 12;
        if (p.x > width + 12) p.x = -12;
        if (p.y < -12) p.y = height + 12;
        if (p.y > height + 12) p.y = -12;
      }

      // Fine golden connections between nearby particles.
      const maxDistance = window.innerWidth < 768 ? 112 : 158;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > maxDistance) continue;
          const alpha = (1 - distance / maxDistance) * 0.3;
          ctx.strokeStyle = `rgba(214, 170, 65, ${alpha})`;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Cursor-to-particle filaments make the network visibly follow the pointer.
      if (pointer.active) {
        const nearby = particles
          .map((particle) => ({ particle, distance: Math.hypot(particle.x - pointer.x, particle.y - pointer.y) }))
          .filter(({ distance }) => distance < 210)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 7);

        for (const { particle, distance } of nearby) {
          const alpha = (1 - distance / 210) * 0.58;
          ctx.strokeStyle = `rgba(245, 199, 92, ${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(particle.x, particle.y);
          ctx.stroke();
        }

        const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 82);
        glow.addColorStop(0, "rgba(214,170,65,0.10)");
        glow.addColorStop(1, "rgba(214,170,65,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 82, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? "rgba(245,199,92,0.78)" : "rgba(255,255,255,0.52)";
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !document.hidden) {
        lastFrame = 0;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(raf);
      }
    }, { threshold: 0 });
    observer.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (visible) {
        lastFrame = 0;
        raf = requestAnimationFrame(draw);
      }
    };
    const onResize = () => {
      resize();
      particles.forEach((p) => {
        p.x = Math.min(p.x, width);
        p.y = Math.min(p.y, height);
      });
    };

    resize();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(draw);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
    />
  );
}
