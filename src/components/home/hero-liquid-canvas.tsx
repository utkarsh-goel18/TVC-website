"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive 3D Warp Vortex, Liquid Gold Wave Mesh & Comet Trail Canvas
 * Pure 60-120fps canvas animation with zero React state re-renders.
 */
export function HeroLiquidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let rafId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      normX: 0,
      normY: 0,
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const gradientRadius = Math.max(width, height);
      auroraGradient = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, gradientRadius * 0.42);
      auroraGradient.addColorStop(0, "rgba(245, 237, 0, 0.11)");
      auroraGradient.addColorStop(0.45, "rgba(245, 237, 0, 0.032)");
      auroraGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      secondaryGradient = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, gradientRadius * 0.32);
      secondaryGradient.addColorStop(0, "rgba(255, 255, 255, 0.06)");
      secondaryGradient.addColorStop(0.5, "rgba(245, 237, 0, 0.024)");
      secondaryGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      if (pointer.x === 0 && pointer.y === 0) {
        pointer.x = pointer.targetX = width / 2;
        pointer.y = pointer.targetY = height / 2;
      }
    };

    resize();

    // Comet trail points
    const trail: Array<{ x: number; y: number; alpha: number; r: number }> = [];
    // Expanding 3D shockwave rings
    const ripples: Array<{ x: number; y: number; r: number; maxR: number; alpha: number }> = [];
    let lastRippleTime = 0;
    let auroraGradient: CanvasGradient | null = null;
    let secondaryGradient: CanvasGradient | null = null;

    const onMouseMove = (e: MouseEvent) => {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
      if (trail.length < 28) {
        trail.push({ x: e.clientX, y: e.clientY, alpha: 0.55, r: 4.5 });
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        pointer.targetX = e.touches[0].clientX;
        pointer.targetY = e.touches[0].clientY;
        if (trail.length < 20) {
          trail.push({
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            alpha: 0.5,
            r: 4,
          });
        }
      }
    };

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // 3D Depth Particles
    const count = width < 768 ? 20 : 36;
    const nodes = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * width * 1.7,
      y: (Math.random() - 0.5) * height * 1.7,
      z: Math.random() * 1000 + 80,
      baseSize: Math.random() * 2.4 + 0.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.65 + Math.random() * 1.25,
      isGold: Math.random() > 0.28,
    }));

    // 3D Tunnel Vortex Rings
    const ringCount = width < 768 ? 3 : 5;
    const vortexRings = Array.from({ length: ringCount }, (_, idx) => ({
      z: (idx / ringCount) * 1100 + 80,
      rot: idx * 0.4,
    }));

    let time = 0;
    let lastFrameTime = 0;
    let isInView = true;

    const scheduleFrame = () => {
      if (isInView && !document.hidden) rafId = requestAnimationFrame(render);
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting;
      if (isInView) scheduleFrame();
      else cancelAnimationFrame(rafId);
    }, { threshold: 0 });
    visibilityObserver.observe(canvas);

    const onVisibilityChange = () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else scheduleFrame();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const project3D = (x3d: number, y3d: number, z3d: number, camX: number, camY: number) => {
      const fov = 540;
      const depth = Math.max(70, z3d + 400);
      const scale = fov / depth;
      return {
        x: width / 2 + (x3d - camX) * scale,
        y: height / 2 + (y3d - camY) * scale,
        scale,
      };
    };

    const render = (now: number) => {
      if (!isInView || document.hidden) return;
      if (now - lastFrameTime < 33) {
        rafId = requestAnimationFrame(render);
        return;
      }
      const delta = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, 0.06) : 1 / 30;
      lastFrameTime = now;
      time += delta;

      pointer.x += (pointer.targetX - pointer.x) * 0.065;
      pointer.y += (pointer.targetY - pointer.y) * 0.065;
      pointer.normX = (pointer.x / Math.max(1, width) - 0.5) * 2;
      pointer.normY = (pointer.y / Math.max(1, height) - 0.5) * 2;

      const speed = Math.hypot(pointer.targetX - pointer.x, pointer.targetY - pointer.y);
      if (speed > 14 && now - lastRippleTime > 130 && ripples.length < 5) {
        ripples.push({
          x: pointer.x,
          y: pointer.y,
          r: 10,
          maxR: 180 + Math.min(speed * 1.4, 160),
          alpha: 0.3,
        });
        lastRippleTime = now;
      }

      ctx.clearRect(0, 0, width, height);

      const camX = pointer.normX * 85;
      const camY = pointer.normY * 55;

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // 1. Multi-Orb Liquid Plasma Aurora
      const blob1X = width * 0.5 + Math.sin(time * 0.75) * (width * 0.2) + pointer.normX * 55;
      const blob1Y = height * 0.5 + Math.cos(time * 0.6) * (height * 0.16) + pointer.normY * 45;
      if (auroraGradient) {
        ctx.save();
        ctx.translate(blob1X - width * 0.5, blob1Y - height * 0.5);
        ctx.fillStyle = auroraGradient;
        ctx.fillRect(-width, -height, width * 3, height * 3);
        ctx.restore();
      }

      const blob2X = width * 0.5 + Math.cos(time * 0.52) * (width * 0.24) - pointer.normX * 45;
      const blob2Y = height * 0.5 + Math.sin(time * 0.68) * (height * 0.2) - pointer.normY * 35;
      if (secondaryGradient) {
        ctx.save();
        ctx.translate(blob2X - width * 0.5, blob2Y - height * 0.5);
        ctx.fillStyle = secondaryGradient;
        ctx.fillRect(-width, -height, width * 3, height * 3);
        ctx.restore();
      }

      // 2. 3D Perspective Warp Vortex Rings
      for (let i = 0; i < vortexRings.length; i++) {
        const vr = vortexRings[i];
        vr.z -= 1.8;
        vr.rot += 0.004 * (i % 2 === 0 ? 1 : -1);
        if (vr.z < 60) {
          vr.z = 1160;
        }

        const curveX = Math.sin(vr.z * 0.003 + time) * 35 + pointer.normX * (1200 - vr.z) * 0.08;
        const curveY = Math.cos(vr.z * 0.003 + time) * 24 + pointer.normY * (1200 - vr.z) * 0.06;
        const pt = project3D(curveX, curveY, vr.z, camX * 0.6, camY * 0.6);

        const rx = Math.max(20, Math.min(width, height) * 0.48 * pt.scale);
        const ry = rx * 0.42;
        const ringAlpha =
          Math.min(1, (1160 - vr.z) / 500) * (vr.z < 220 ? vr.z / 220 : 1) * 0.14;

        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y, rx, ry, vr.rot, 0, Math.PI * 2);
        ctx.strokeStyle =
          i % 2 === 0
            ? `rgba(245, 237, 0, ${ringAlpha.toFixed(3)})`
            : `rgba(255, 255, 255, ${(ringAlpha * 0.7).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 3. 3D Perspective Flowing Liquid Silk Wave Ribbons
      const ribbonCount = width < 768 ? 3 : 4;
      const cols = width < 768 ? 16 : 24;
      const spanX = width * 1.5;

      for (let r = 0; r < ribbonCount; r++) {
        const zDepth = (r - ribbonCount / 2) * 72;
        const ribbonAlpha = (1 - Math.abs(r - ribbonCount / 2) / (ribbonCount / 2 + 1)) * 0.22;

        ctx.beginPath();
        for (let c = 0; c <= cols; c++) {
          const u = c / cols;
          const x3d = (u - 0.5) * spanX;

          const wave1 = Math.sin(u * 5.8 + time * 1.3 + r * 0.55) * 46;
          const wave2 = Math.cos(u * 3.5 - time * 0.95 + r * 0.8) * 32;
          const cursorInfluence =
            Math.exp(-Math.pow(u - pointer.x / Math.max(1, width), 2) * 14) *
            (pointer.normY * 68);

          const y3d = wave1 + wave2 + cursorInfluence + (r - ribbonCount / 2) * 22;
          const z3d = zDepth + Math.sin(u * 4.2 + time + r) * 50;

          const pt = project3D(x3d, y3d, z3d, camX, camY);
          if (c === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }

        ctx.strokeStyle =
          r % 2 === 0
            ? `rgba(245, 237, 0, ${ribbonAlpha.toFixed(3)})`
            : `rgba(255, 255, 255, ${(ribbonAlpha * 0.65).toFixed(3)})`;
        ctx.lineWidth = r === Math.floor(ribbonCount / 2) ? 1.5 : 0.9;
        ctx.stroke();
      }

      // 4. Interactive Cursor Shockwave Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += (rp.maxR - rp.r) * 0.07;
        rp.alpha *= 0.95;

        if (rp.alpha < 0.008) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, rp.r, rp.r * 0.56, -0.2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245, 237, 0, ${rp.alpha.toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 5. Golden Liquid Comet Trail following Pointer
      for (let i = trail.length - 1; i >= 0; i--) {
        const t = trail[i];
        t.alpha *= 0.91;
        t.r *= 0.96;
        if (t.alpha < 0.015) {
          trail.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 237, 0, ${t.alpha.toFixed(3)})`;
        ctx.fill();
      }

      // 6. 3D Depth Particles & Constellation Filaments
      const projectedNodes: Array<{
        x: number;
        y: number;
        r: number;
        alpha: number;
        isGold: boolean;
      }> = [];

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.z -= n.speed;
        n.phase += 0.022;

        if (n.z < 40) {
          n.z = 1040;
          n.x = (Math.random() - 0.5) * width * 1.6;
          n.y = (Math.random() - 0.5) * height * 1.6;
        }

        const floatX = n.x + Math.sin(n.phase) * 20;
        const floatY = n.y + Math.cos(n.phase * 0.8) * 20;
        const pt = project3D(floatX, floatY, n.z, camX * 1.35, camY * 1.35);

        const depthAlpha = Math.min(1, (1040 - n.z) / 650) * (n.z < 140 ? n.z / 140 : 1);
        const radius = Math.max(0.6, n.baseSize * pt.scale * 1.3);

        projectedNodes.push({
          x: pt.x,
          y: pt.y,
          r: radius,
          alpha: depthAlpha * 0.6,
          isGold: n.isGold,
        });

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = n.isGold
          ? `rgba(245, 237, 0, ${(depthAlpha * 0.72).toFixed(3)})`
          : `rgba(244, 243, 239, ${(depthAlpha * 0.5).toFixed(3)})`;
        ctx.fill();
      }

      for (let i = 0; i < projectedNodes.length; i++) {
        const a = projectedNodes[i];
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const b = projectedNodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 7200) {
            const linkAlpha =
              (1 - Math.sqrt(distSq) / 84.9) * Math.min(a.alpha, b.alpha) * 0.42;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(245, 237, 0, ${linkAlpha.toFixed(3)})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }
      }

      ctx.restore();
      scheduleFrame();
    };

    scheduleFrame();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      cancelAnimationFrame(rafId);
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full z-0"
    />
  );
}
