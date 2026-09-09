import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useStore } from "../../store/useStore";

const THEME_AURORAS = {
  space: {
    ribbons: [
      { colorStart: "rgba(56, 189, 248, 0.45)", colorMid: "rgba(30, 58, 138, 0.25)", colorEnd: "rgba(56, 189, 248, 0)" },
      { colorStart: "rgba(129, 140, 248, 0.40)", colorMid: "rgba(79, 70, 229, 0.28)", colorEnd: "rgba(129, 140, 248, 0)" },
      { colorStart: "rgba(14, 165, 233, 0.35)", colorMid: "rgba(56, 189, 248, 0.20)", colorEnd: "rgba(14, 165, 233, 0)" },
      { colorStart: "rgba(99, 102, 241, 0.32)", colorMid: "rgba(67, 56, 202, 0.18)", colorEnd: "rgba(99, 102, 241, 0)" },
    ],
    spotlight: { start: "rgba(56, 189, 248, 0.12)", mid: "rgba(99, 102, 241, 0.06)" },
    hues: [205, 225, 240],
  },
  holodeck: {
    ribbons: [
      { colorStart: "rgba(0, 242, 254, 0.45)", colorMid: "rgba(13, 148, 136, 0.25)", colorEnd: "rgba(0, 242, 254, 0)" },
      { colorStart: "rgba(0, 255, 163, 0.40)", colorMid: "rgba(20, 184, 166, 0.28)", colorEnd: "rgba(0, 255, 163, 0)" },
      { colorStart: "rgba(6, 182, 212, 0.35)", colorMid: "rgba(0, 242, 254, 0.20)", colorEnd: "rgba(6, 182, 212, 0)" },
      { colorStart: "rgba(52, 211, 153, 0.32)", colorMid: "rgba(5, 150, 105, 0.18)", colorEnd: "rgba(52, 211, 153, 0)" },
    ],
    spotlight: { start: "rgba(0, 242, 254, 0.14)", mid: "rgba(0, 255, 163, 0.07)" },
    hues: [180, 155, 195],
  },
  synthwave: {
    ribbons: [
      { colorStart: "rgba(255, 42, 133, 0.48)", colorMid: "rgba(168, 85, 247, 0.28)", colorEnd: "rgba(255, 42, 133, 0)" },
      { colorStart: "rgba(244, 63, 94, 0.42)", colorMid: "rgba(217, 70, 239, 0.28)", colorEnd: "rgba(244, 63, 94, 0)" },
      { colorStart: "rgba(236, 72, 153, 0.38)", colorMid: "rgba(251, 146, 60, 0.22)", colorEnd: "rgba(236, 72, 153, 0)" },
      { colorStart: "rgba(192, 132, 252, 0.32)", colorMid: "rgba(217, 70, 239, 0.20)", colorEnd: "rgba(192, 132, 252, 0)" },
    ],
    spotlight: { start: "rgba(255, 42, 133, 0.14)", mid: "rgba(168, 85, 247, 0.07)" },
    hues: [330, 310, 280],
  },
  atmosphera: {
    ribbons: [
      { colorStart: "rgba(165, 243, 252, 0.45)", colorMid: "rgba(56, 189, 248, 0.25)", colorEnd: "rgba(165, 243, 252, 0)" },
      { colorStart: "rgba(56, 189, 248, 0.40)", colorMid: "rgba(14, 165, 233, 0.28)", colorEnd: "rgba(56, 189, 248, 0)" },
      { colorStart: "rgba(186, 230, 253, 0.35)", colorMid: "rgba(125, 211, 252, 0.20)", colorEnd: "rgba(186, 230, 253, 0)" },
      { colorStart: "rgba(99, 102, 241, 0.28)", colorMid: "rgba(59, 130, 246, 0.18)", colorEnd: "rgba(99, 102, 241, 0)" },
    ],
    spotlight: { start: "rgba(165, 243, 252, 0.14)", mid: "rgba(56, 189, 248, 0.07)" },
    hues: [195, 205, 215],
  },
  cyberpunk: {
    ribbons: [
      { colorStart: "rgba(192, 132, 252, 0.48)", colorMid: "rgba(126, 34, 206, 0.28)", colorEnd: "rgba(192, 132, 252, 0)" },
      { colorStart: "rgba(217, 70, 239, 0.42)", colorMid: "rgba(147, 51, 234, 0.28)", colorEnd: "rgba(217, 70, 239, 0)" },
      { colorStart: "rgba(168, 85, 247, 0.38)", colorMid: "rgba(0, 242, 254, 0.20)", colorEnd: "rgba(168, 85, 247, 0)" },
      { colorStart: "rgba(232, 121, 249, 0.32)", colorMid: "rgba(107, 33, 168, 0.20)", colorEnd: "rgba(232, 121, 249, 0)" },
    ],
    spotlight: { start: "rgba(192, 132, 252, 0.15)", mid: "rgba(0, 242, 254, 0.07)" },
    hues: [275, 290, 310],
  },
  sunset: {
    ribbons: [
      { colorStart: "rgba(251, 146, 60, 0.48)", colorMid: "rgba(194, 65, 12, 0.28)", colorEnd: "rgba(251, 146, 60, 0)" },
      { colorStart: "rgba(245, 158, 11, 0.42)", colorMid: "rgba(180, 83, 9, 0.28)", colorEnd: "rgba(245, 158, 11, 0)" },
      { colorStart: "rgba(239, 68, 68, 0.36)", colorMid: "rgba(249, 115, 22, 0.22)", colorEnd: "rgba(239, 68, 68, 0)" },
      { colorStart: "rgba(253, 186, 116, 0.30)", colorMid: "rgba(217, 119, 6, 0.18)", colorEnd: "rgba(253, 186, 116, 0)" },
    ],
    spotlight: { start: "rgba(251, 146, 60, 0.15)", mid: "rgba(245, 158, 11, 0.07)" },
    hues: [25, 38, 15],
  },
  daylight: {
    ribbons: [
      { colorStart: "rgba(37, 99, 235, 0.18)", colorMid: "rgba(96, 165, 250, 0.12)", colorEnd: "rgba(37, 99, 235, 0)" },
      { colorStart: "rgba(14, 165, 233, 0.15)", colorMid: "rgba(186, 230, 253, 0.10)", colorEnd: "rgba(14, 165, 233, 0)" },
      { colorStart: "rgba(99, 102, 241, 0.14)", colorMid: "rgba(199, 210, 254, 0.08)", colorEnd: "rgba(99, 102, 241, 0)" },
      { colorStart: "rgba(56, 189, 248, 0.12)", colorMid: "rgba(224, 242, 254, 0.06)", colorEnd: "rgba(56, 189, 248, 0)" },
    ],
    spotlight: { start: "rgba(37, 99, 235, 0.08)", mid: "rgba(56, 189, 248, 0.04)" },
    hues: [210, 220, 200],
  },
};

export default function AuroraBackground() {
  const canvasRef = useRef(null);
  const location = useLocation();
  const theme = useStore((s) => s.theme || "space");
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Dim slightly on 3D globe / radar so telemetry is crisp
  const is3DPage = ["/explore", "/radar"].includes(location.pathname);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with smooth lerp
    let mouse = { x: width * 0.5, y: height * 0.3, targetX: width * 0.5, targetY: height * 0.3 };

    function onMouseMove(e) {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    }
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    function onResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", onResize, { passive: true });

    // Floating celestial starlight particles
    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.6 + 0.2,
      speedY: -(Math.random() * 0.35 + 0.1),
      speedX: (Math.random() - 0.5) * 0.2,
      hue: Math.random() > 0.5 ? 185 : Math.random() > 0.5 ? 150 : 280, // Cyan, Emerald, or Violet
    }));

    // Aurora Ribbon Definitions
    const ribbons = [
      {
        baseY: 0.15,
        amplitude: 65,
        freq: 0.0018,
        speed: 0.0006,
        colorStart: "rgba(0, 242, 254, 0.45)", // Hyper Cyan
        colorMid: "rgba(79, 70, 229, 0.25)",   // Indigo
        colorEnd: "rgba(0, 242, 254, 0)",
        thickness: 180,
      },
      {
        baseY: 0.22,
        amplitude: 85,
        freq: 0.0013,
        speed: 0.00045,
        colorStart: "rgba(184, 0, 255, 0.40)", // Cosmic Magenta
        colorMid: "rgba(121, 40, 202, 0.28)",  // Deep Violet
        colorEnd: "rgba(184, 0, 255, 0)",
        thickness: 220,
      },
      {
        baseY: 0.32,
        amplitude: 75,
        freq: 0.0022,
        speed: 0.00075,
        colorStart: "rgba(0, 255, 163, 0.35)", // Solar Emerald
        colorMid: "rgba(0, 242, 254, 0.20)",   // Cyan bleed
        colorEnd: "rgba(0, 255, 163, 0)",
        thickness: 200,
      },
      {
        baseY: 0.08,
        amplitude: 55,
        freq: 0.0015,
        speed: 0.0004,
        colorStart: "rgba(99, 102, 241, 0.32)", // Electric Blue
        colorMid: "rgba(217, 70, 239, 0.18)",  // Fuchsia
        colorEnd: "rgba(99, 102, 241, 0)",
        thickness: 160,
      },
    ];

    let t = 0;

    function render() {
      t += 1;
      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";

      const activeAurora = THEME_AURORAS[themeRef.current] || THEME_AURORAS.space;

      // ─── 1. Render Aurora Ribbons ─────────────────────────────────────────
      ribbons.forEach((ribbon, rIdx) => {
        const ribbonY = height * ribbon.baseY + (mouse.y - height * 0.5) * 0.06 * (rIdx + 1);
        const mouseShiftX = (mouse.x - width * 0.5) * 0.0004;
        const colorConfig = activeAurora.ribbons[rIdx % activeAurora.ribbons.length];

        ctx.beginPath();
        ctx.moveTo(0, height);

        // Draw upper wave boundary
        for (let x = 0; x <= width; x += 12) {
          const wave1 = Math.sin(x * ribbon.freq + t * ribbon.speed + mouseShiftX) * ribbon.amplitude;
          const wave2 = Math.cos(x * ribbon.freq * 1.7 - t * ribbon.speed * 1.3) * (ribbon.amplitude * 0.4);
          const wave3 = Math.sin(x * 0.0006 + t * 0.0003) * 25;
          const y = ribbonY + wave1 + wave2 + wave3;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Create fluid vertical gradient
        const grad = ctx.createLinearGradient(0, ribbonY - ribbon.amplitude, 0, ribbonY + ribbon.thickness);
        grad.addColorStop(0, colorConfig.colorStart);
        grad.addColorStop(0.45, colorConfig.colorMid);
        grad.addColorStop(1, colorConfig.colorEnd);

        ctx.fillStyle = grad;
        ctx.fill();
      });

      // ─── 2. Interactive Cursor Aurora Spotlight ──────────────────────────
      const spotlightGrad = ctx.createRadialGradient(
        mouse.x, mouse.y, 10,
        mouse.x, mouse.y, 380
      );
      spotlightGrad.addColorStop(0, activeAurora.spotlight.start);
      spotlightGrad.addColorStop(0.4, activeAurora.spotlight.mid);
      spotlightGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = spotlightGrad;
      ctx.fillRect(0, 0, width, height);

      // ─── 3. Floating Celestial Stardust ────────────────────────────────────
      ctx.globalCompositeOperation = "source-over";
      particles.forEach((p, pIdx) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const themeHue = activeAurora.hues[pIdx % activeAurora.hues.length];
        const pulse = Math.sin(t * 0.03 + p.x) * 0.2 + 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${themeHue}, 90%, 75%, ${p.alpha * pulse})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-700 ease-out"
      style={{
        opacity: is3DPage ? 0.35 : 0.60,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
}

