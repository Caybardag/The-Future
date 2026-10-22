import React, { useEffect, useRef } from "react";

interface FuturisticAmbientBackgroundProps {
  scenarioMode?: "baseline" | "optimistic" | "dystopian";
}

export const FuturisticAmbientBackground: React.FC<FuturisticAmbientBackgroundProps> = ({
  scenarioMode = "baseline",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scenario-specific glowing palettes
  const theme = React.useMemo(() => {
    switch (scenarioMode) {
      case "optimistic":
        return {
          aurora1: "rgba(16, 185, 129, 0.18)", // Emerald
          aurora2: "rgba(6, 182, 212, 0.20)",  // Cyan
          aurora3: "rgba(59, 130, 246, 0.15)", // Blue
          palette: [
            { fill: "rgba(52, 211, 153, 0.85)", glow: "#10b981" }, // Mint/Emerald
            { fill: "rgba(34, 211, 238, 0.85)", glow: "#06b6d4" }, // Cyan
            { fill: "rgba(96, 165, 250, 0.80)", glow: "#3b82f6" }, // Blue
            { fill: "rgba(251, 191, 36, 0.80)", glow: "#f59e0b" }, // Gold
          ],
        };
      case "dystopian":
        return {
          aurora1: "rgba(225, 29, 72, 0.20)",  // Rose
          aurora2: "rgba(217, 119, 6, 0.18)",  // Amber
          aurora3: "rgba(168, 85, 247, 0.15)", // Purple
          palette: [
            { fill: "rgba(251, 113, 133, 0.85)", glow: "#f43f5e" }, // Rose
            { fill: "rgba(251, 146, 60, 0.85)",  glow: "#f97316" }, // Orange
            { fill: "rgba(192, 132, 252, 0.80)", glow: "#a855f7" }, // Purple
            { fill: "rgba(252, 211, 77, 0.80)",  glow: "#fbbf24" }, // Amber
          ],
        };
      case "baseline":
      default:
        return {
          aurora1: "rgba(6, 182, 212, 0.18)",  // Cyan
          aurora2: "rgba(129, 140, 248, 0.20)", // Indigo
          aurora3: "rgba(192, 132, 252, 0.16)", // Purple
          palette: [
            { fill: "rgba(34, 211, 238, 0.90)", glow: "#00f2fe" }, // Electric Cyan
            { fill: "rgba(192, 132, 252, 0.85)", glow: "#c084fc" }, // Neon Purple
            { fill: "rgba(96, 165, 250, 0.85)", glow: "#38bdf8" }, // Sky Blue
            { fill: "rgba(52, 211, 153, 0.80)", glow: "#34d399" }, // Emerald Glow
            { fill: "rgba(251, 191, 36, 0.80)", glow: "#fbbf24" }, // Star Gold
          ],
        };
    }
  }, [scenarioMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle nodes for floating quantum dust (reduced by 60% for a calm, non-intrusive aesthetic)
    const particleCount = Math.min(26, Math.max(12, Math.floor((width * height) / 45000)));
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      pulseSpeed: number;
      colorIdx: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22, // Calmer, slower drift
        vy: (Math.random() - 0.5) * 0.22,
        size: Math.random() * 1.5 + 0.8, // Discreet, smaller dots
        alpha: Math.random() * 0.4 + 0.25, // Softer opacity
        pulseSpeed: Math.random() * 0.015 + 0.006,
        colorIdx: Math.floor(Math.random() * theme.palette.length),
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    let tick = 0;
    const render = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      // Render floating micro-quantum nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around viewport edges smoothly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        const dynamicAlpha = Math.max(0.2, Math.min(1.0, p.alpha + Math.sin(tick * p.pulseSpeed) * 0.3));
        const colorItem = theme.palette[p.colorIdx % theme.palette.length];

        // Draw glowing particle core & halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = colorItem.fill.replace(/[\d.]+\)$/, `${dynamicAlpha})`);
        ctx.shadowBlur = 12;
        ctx.shadowColor = colorItem.glow;
        ctx.fill();

        // Connect nearby points with faint quantum neural lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const lineAlpha = (1 - dist / 100) * 0.15 * dynamicAlpha;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = colorItem.fill.replace(/[\d.]+\)$/, `${lineAlpha})`);
            ctx.lineWidth = 0.75;
            ctx.shadowBlur = 0;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <>
      {/* ── 1. DEEP SPACE AURORA GLOWS (Underneath everything, z-[-5]) ── */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Deep Space Base Canvas */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060810] via-[#080c18] to-[#04060b]" />

        {/* Cyber Isometric Grid Matrix */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-screen"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px",
          }}
        />

        {/* Orbiting Aurora Glow 1 (Top Left) */}
        <div
          className="absolute -top-[15%] -left-[10%] w-[60vw] h-[60vw] max-w-[750px] max-h-[750px] rounded-full blur-[120px] animate-pulse transition-all duration-1000"
          style={{
            backgroundColor: theme.aurora1,
            animationDuration: "9s",
          }}
        />

        {/* Orbiting Aurora Glow 2 (Center Right) */}
        <div
          className="absolute top-[30%] -right-[15%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full blur-[130px] transition-all duration-1000"
          style={{
            backgroundColor: theme.aurora2,
            animation: "floatSlow 14s ease-in-out infinite alternate",
          }}
        />

        {/* Orbiting Aurora Glow 3 (Bottom Center) */}
        <div
          className="absolute -bottom-[10%] left-[15%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full blur-[110px] transition-all duration-1000"
          style={{
            backgroundColor: theme.aurora3,
            animation: "floatSlow 11s ease-in-out infinite alternate-reverse",
          }}
        />
      </div>

      {/* ── 2. FOREGROUND FLOATING QUANTUM STARDUST CANVAS (z-20, pointer-events-none) ── */}
      {/* Placed seamlessly over the screen so particles gently float across and around all cards without blocking clicks */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-20 w-full h-full mix-blend-screen select-none"
        aria-hidden="true"
      />
    </>
  );
};

export default FuturisticAmbientBackground;
