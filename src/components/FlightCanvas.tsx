import React, { useEffect, useRef, useState } from 'react';
import { GameStatus, RouletteColor, FloatingReaction } from '../types';
import { getColorZone, getNextColorZone, getZoneProgress } from '../utils/gameZones';
import { Flame, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { playReactionSound } from '../utils/audio';

interface FlightCanvasProps {
  status: GameStatus;
  multiplier: number;
  countdown: number;
  crashMultiplier: number | null;
  crashColor: RouletteColor | null;
  selectedHedgeColor: RouletteColor | null;
  isHedgeActive: boolean;
  lang: 'ka' | 'en';
  onSendReaction?: (emoji: string) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  brightness: number;
}

export const FlightCanvas: React.FC<FlightCanvasProps> = ({
  status,
  multiplier,
  countdown,
  crashMultiplier,
  crashColor,
  selectedHedgeColor,
  isHedgeActive,
  lang,
  onSendReaction,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const planeAnimRef = useRef({
    angle: -0.4,
    thrusterPulse: 0,
    flyAwayProgress: 0,
  });

  const [activeFloatingReactions, setActiveFloatingReactions] = useState<FloatingReaction[]>([]);

  const currentZone = getColorZone(multiplier);
  const nextZone = getNextColorZone(multiplier);
  const zoneProgress = getZoneProgress(multiplier);

  // Initialize background starfield
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        speed: 0.2 + Math.random() * 0.8,
        size: 0.8 + Math.random() * 1.8,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }
    starsRef.current = stars;
  }, []);

  // Resize canvas according to container
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Handle reaction trigger
  const handleEmojiClick = (emoji: string) => {
    playReactionSound();
    const newReaction: FloatingReaction = {
      id: `r-${Date.now()}-${Math.random()}`,
      emoji,
      x: 15 + Math.random() * 70,
    };
    setActiveFloatingReactions((prev) => [...prev.slice(-12), newReaction]);
    if (onSendReaction) {
      onSendReaction(emoji);
    }
  };

  // Main canvas animation loop with High Altitude FX and Screen Shake
  useEffect(() => {
    let animFrame: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      if (width <= 10 || height <= 10) return;

      ctx.save();
      ctx.scale(dpr, dpr);

      // HIGH ALTITUDE SCREEN SHAKE (Feature 3)
      // When multiplier > 8.0x, subtle camera vibration intensifies
      if (status === 'FLYING' && multiplier > 8.0) {
        const shakeIntensity = Math.min(4.5, (multiplier - 8.0) * 0.25);
        const shakeX = (Math.random() - 0.5) * shakeIntensity;
        const shakeY = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(shakeX, shakeY);
      }

      ctx.clearRect(0, 0, width, height);

      // Background atmospheric gradient reflecting altitude & current zone
      const r1 = Math.max(width * 0.8, 60);
      const r0 = Math.min(50, r1 * 0.4);
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        r0,
        width * 0.5,
        height * 0.5,
        r1
      );

      if (status === 'FLYING') {
        if (multiplier > 10.0) {
          // Deep Cosmos Mode: dark purple space with cosmic aura
          bgGrad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
          bgGrad.addColorStop(0.6, 'rgba(15, 23, 42, 0.95)');
          bgGrad.addColorStop(1, '#05070e');
        } else if (multiplier > 4.0) {
          // Stratosphere Mode
          bgGrad.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
          bgGrad.addColorStop(1, '#080c16');
        } else if (currentZone.color === 'RED') {
          bgGrad.addColorStop(0, 'rgba(239, 68, 68, 0.14)');
          bgGrad.addColorStop(1, '#090d16');
        } else if (currentZone.color === 'BLACK') {
          bgGrad.addColorStop(0, 'rgba(30, 41, 59, 0.25)');
          bgGrad.addColorStop(1, '#070a10');
        } else {
          // Green Zero Jackpot Zone!
          bgGrad.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
          bgGrad.addColorStop(1, '#050e09');
        }
      } else if (status === 'CRASHED') {
        bgGrad.addColorStop(0, 'rgba(220, 38, 38, 0.18)');
        bgGrad.addColorStop(1, '#0b0c10');
      } else {
        bgGrad.addColorStop(0, 'rgba(20, 24, 33, 0.8)');
        bgGrad.addColorStop(1, '#090b10');
      }

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Starfield (Streaking faster at high altitudes)
      if (status === 'FLYING' && multiplier > 1.8) {
        const speedMultiplier = Math.min(6, 1 + (multiplier - 1.8) * 0.4);
        ctx.save();
        starsRef.current.forEach((star) => {
          star.x -= (star.speed * speedMultiplier * 0.003);
          star.y += (star.speed * speedMultiplier * 0.001);
          if (star.x < 0) star.x = 1;
          if (star.y > 1) star.y = 0;

          const sx = star.x * width;
          const sy = star.y * height;

          ctx.fillStyle = multiplier > 10 ? '#fef08a' : '#ffffff';
          ctx.globalAlpha = star.brightness * Math.min(1, (multiplier - 1.8) * 0.8);
          ctx.beginPath();
          if (speedMultiplier > 3) {
            // Warp streaks
            ctx.ellipse(sx, sy, star.size * speedMultiplier * 1.5, star.size, -0.4, 0, Math.PI * 2);
          } else {
            ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
          }
          ctx.fill();
        });
        ctx.restore();
      }

      // Draw subtle perspective flight grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      const gridSpacingX = 80;
      const gridSpacingY = 50;

      for (let x = 0; x < width; x += gridSpacingX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacingY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Origin and flight curve parameters
      const originX = 55;
      const originY = height - 45;

      // Axis lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(originX, 15);
      ctx.lineTo(originX, originY);
      ctx.lineTo(width - 15, originY);
      ctx.stroke();

      // Axis markings
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '10px Outfit, sans-serif';
      ctx.fillText('0s', originX, originY + 16);
      ctx.fillText('5s', originX + (width - originX) * 0.33, originY + 16);
      ctx.fillText('10s', originX + (width - originX) * 0.66, originY + 16);
      ctx.fillText('15s+', width - 35, originY + 16);

      // Trajectory calculation
      const maxFlightW = width - originX - 80;
      const maxFlightH = originY - 60;

      const safeMultiplier = Math.max(1.0, Number.isFinite(multiplier) ? multiplier : 1.0);
      const normProgress = Math.max(0, Math.min(Math.log(safeMultiplier) / Math.log(15), 1.0));
      const currentX = originX + normProgress * maxFlightW;
      const currentY = originY - Math.pow(Math.max(0, normProgress), 0.85) * maxFlightH;

      if (status === 'FLYING' || status === 'CRASHED') {
        // Draw the curved trajectory
        ctx.beginPath();
        ctx.moveTo(originX, originY);

        const steps = 40;
        for (let i = 1; i <= steps; i++) {
          const t = Math.max(0, (i / steps) * normProgress);
          const px = originX + t * maxFlightW;
          const py = originY - Math.pow(Math.max(0, t), 0.85) * maxFlightH;
          ctx.lineTo(px, py);
        }

        // Color based on active zone
        const strokeColor =
          currentZone.color === 'RED'
            ? '#ef4444'
            : currentZone.color === 'BLACK'
            ? '#94a3b8'
            : '#10b981';

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 4;
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = multiplier > 10 ? 25 : 14;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Fill area beneath trajectory
        const safeCurrentY = Number.isFinite(currentY) ? currentY : originY - 10;
        const fillGrad = ctx.createLinearGradient(0, safeCurrentY, 0, originY);
        if (currentZone.color === 'RED') {
          fillGrad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
          fillGrad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
        } else if (currentZone.color === 'BLACK') {
          fillGrad.addColorStop(0, 'rgba(71, 85, 105, 0.35)');
          fillGrad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
        } else {
          fillGrad.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
          fillGrad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
        }

        ctx.lineTo(currentX, originY);
        ctx.lineTo(originX, originY);
        ctx.closePath();
        ctx.fillStyle = fillGrad;
        ctx.fill();

        // Zone transition checkpoints along the curve
        const testCheckpoints = [1.45, 2.10, 3.10, 4.60, 6.80, 9.90, 12.00, 18.00];
        testCheckpoints.forEach((cp) => {
          if (cp <= safeMultiplier * 1.5 && cp >= 1.0) {
            const cpNorm = Math.max(0, Math.min(Math.log(Math.max(1, cp)) / Math.log(15), 1.0));
            const cpX = originX + cpNorm * maxFlightW;
            const cpY = originY - Math.pow(Math.max(0, cpNorm), 0.85) * maxFlightH;

            const cpZone = getColorZone(cp);
            const isPassed = multiplier >= cp;

            ctx.save();
            ctx.beginPath();
            ctx.arc(cpX, cpY, isPassed ? 4 : 5, 0, Math.PI * 2);
            ctx.fillStyle = cpZone.color === 'RED' ? '#ef4444' : cpZone.color === 'BLACK' ? '#475569' : '#10b981';
            ctx.fill();
            ctx.strokeStyle = isPassed ? 'rgba(255,255,255,0.4)' : '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Label
            ctx.font = '9px Chakra Petch, sans-serif';
            ctx.fillStyle = isPassed ? 'rgba(255,255,255,0.5)' : '#ffffff';
            ctx.fillText(`${cp.toFixed(2)}x ${cpZone.color === 'RED' ? '🔴' : cpZone.color === 'BLACK' ? '⚫' : '🟢'}`, cpX - 16, cpY - 8);
            ctx.restore();
          }
        });

        // Spawn Thruster Smoke/Fire Particles
        if (status === 'FLYING') {
          const particleCount = multiplier > 10 ? 5 : 3;
          for (let p = 0; p < particleCount; p++) {
            particlesRef.current.push({
              x: currentX - 14 + (Math.random() - 0.5) * 6,
              y: currentY + 4 + (Math.random() - 0.5) * 6,
              vx: -Math.random() * 4 - 2,
              vy: Math.random() * 2 - 1,
              size: Math.random() * 6 + 3,
              alpha: 0.9,
              color: multiplier > 10 ? '#facc15' : currentZone.color === 'GREEN' ? '#34d399' : '#f87171',
            });
          }
        }

        // Draw and age particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.size *= 0.96;
          p.alpha -= 0.035;

          if (p.alpha <= 0 || p.size < 0.5) {
            particlesRef.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Draw the sleek red Aviator Plane/Rocket
        let planeX = currentX;
        let planeY = currentY;

        if (status === 'CRASHED') {
          planeAnimRef.current.flyAwayProgress += 1;
          planeX += planeAnimRef.current.flyAwayProgress * 14;
          planeY -= planeAnimRef.current.flyAwayProgress * 8;
        }

        if (planeX < width + 100 && planeY > -100) {
          ctx.save();
          ctx.translate(planeX, planeY);
          const angle = -0.38 + Math.sin(Date.now() * 0.006) * 0.04;
          ctx.rotate(angle);

          // Animated jet thruster flame (Intensifies at high altitude)
          planeAnimRef.current.thrusterPulse += 0.25;
          const flameLength = (multiplier > 10 ? 32 : 22) + Math.sin(planeAnimRef.current.thrusterPulse) * 8;

          const flameGrad = ctx.createLinearGradient(-flameLength, 0, 0, 0);
          if (multiplier > 10) {
            flameGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
            flameGrad.addColorStop(0.5, '#38bdf8');
            flameGrad.addColorStop(1, '#fef08a');
          } else {
            flameGrad.addColorStop(0, 'rgba(255, 60, 0, 0)');
            flameGrad.addColorStop(0.5, '#f97316');
            flameGrad.addColorStop(1, '#fef08a');
          }

          ctx.beginPath();
          ctx.moveTo(0, -4);
          ctx.lineTo(-flameLength, 0);
          ctx.lineTo(0, 4);
          ctx.closePath();
          ctx.fillStyle = flameGrad;
          ctx.shadowColor = multiplier > 10 ? '#38bdf8' : '#f97316';
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Main Plane Fuselage (Sleek aerodynamic red jet)
          ctx.beginPath();
          ctx.moveTo(24, 0); // nose tip
          ctx.lineTo(6, -6);
          ctx.lineTo(-12, -7);
          ctx.lineTo(-16, -14); // vertical stabilizer
          ctx.lineTo(-20, -14);
          ctx.lineTo(-18, -4);
          ctx.lineTo(-20, 0); // tail end
          ctx.lineTo(-18, 4);
          ctx.lineTo(-12, 7);
          ctx.lineTo(6, 6);
          ctx.closePath();

          const bodyGrad = ctx.createLinearGradient(-20, -10, 24, 10);
          bodyGrad.addColorStop(0, '#991b1b');
          bodyGrad.addColorStop(0.4, '#dc2626');
          bodyGrad.addColorStop(1, '#ef4444');
          ctx.fillStyle = bodyGrad;
          ctx.fill();

          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Main Wing (Swept forward)
          ctx.beginPath();
          ctx.moveTo(2, -2);
          ctx.lineTo(-6, -16);
          ctx.lineTo(-11, -16);
          ctx.lineTo(-5, 0);
          ctx.closePath();
          ctx.fillStyle = '#b91c1c';
          ctx.fill();

          // Cockpit canopy (cyan reflective glass)
          ctx.beginPath();
          ctx.ellipse(8, -2, 6, 2.5, -0.15, 0, Math.PI * 2);
          ctx.fillStyle = '#67e8f9';
          ctx.shadowColor = '#67e8f9';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.restore();
        }
      }

      ctx.restore();
      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrame);
  }, [status, multiplier, currentZone, countdown]);

  return (
    <div
      ref={containerRef}
      id="flight-canvas-container"
      className="relative w-full h-[270px] sm:h-[350px] md:h-[430px] bg-[#070a10] rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* FLOATING EMOJI REACTIONS OVERLAY (Feature 2) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
        {activeFloatingReactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-12 text-2xl sm:text-3xl animate-floating-reaction select-none"
            style={{ left: `${r.x}%` }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* TOP OVERLAYS: ALTITUDE & ZONE STATUS BADGES */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none">
        {/* Current Roulette Zone Badge */}
        <div className="flex items-center gap-2">
          <div
            id="flight-zone-badge"
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-2xl font-['Chakra_Petch',sans-serif] font-extrabold text-xs sm:text-sm tracking-wide shadow-lg backdrop-blur-md border transition-all duration-300 ${
              currentZone.color === 'RED'
                ? 'bg-red-600/30 text-red-300 border-red-500/50 shadow-red-950/60'
                : currentZone.color === 'BLACK'
                ? 'bg-slate-900/60 text-slate-200 border-slate-700/60 shadow-black/80'
                : 'bg-emerald-600/30 text-emerald-300 border-emerald-500/60 shadow-emerald-950/60 animate-pulse'
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                currentZone.color === 'RED'
                  ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                  : currentZone.color === 'BLACK'
                  ? 'bg-slate-400'
                  : 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
              }`}
            />
            <span className="uppercase">
              {lang === 'ka' ? currentZone.labelKa : currentZone.labelEn}
            </span>

            {/* Feature 1: Green Zero Jackpot Highlight */}
            {currentZone.color === 'GREEN' && (
              <span className="ml-1 px-1.5 py-0.2 rounded bg-emerald-400 text-slate-950 font-black text-[10px] animate-bounce">
                x14 ZERO!
              </span>
            )}
          </div>

          {/* High Altitude Stratosphere Tag (Feature 3) */}
          {status === 'FLYING' && multiplier > 5.0 && (
            <div className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] sm:text-xs font-bold font-mono">
              <Zap className="w-3 h-3 text-cyan-300" />
              <span>{multiplier > 10 ? 'DEEP COSMOS' : 'STRATOSPHERE'}</span>
            </div>
          )}
        </div>

        {/* User Active Hedge Status Indicator */}
        {isHedgeActive && selectedHedgeColor && (
          <div
            id="user-active-hedge-pill"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
              selectedHedgeColor === currentZone.color
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 animate-pulse'
                : 'bg-slate-900/80 text-slate-300 border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {lang === 'ka' ? 'დაზღვევა:' : 'Hedge:'}
            </span>
            <span>
              {selectedHedgeColor === 'RED' ? '🔴 RED' : selectedHedgeColor === 'BLACK' ? '⚫ BLACK' : '🟢 ZERO'}
            </span>
            {selectedHedgeColor === currentZone.color && (
              <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-bold">
                WIN!
              </span>
            )}
          </div>
        )}
      </div>

      {/* CENTER OVERLAY: MULTIPLIER / COUNTDOWN / CRASH STATE */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-20">
        {status === 'FLYING' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200">
            <div
              id="live-flight-multiplier"
              className="font-extrabold tracking-tighter font-mono text-5xl sm:text-7xl md:text-8xl text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]"
            >
              {multiplier.toFixed(2)}
              <span className="text-2xl sm:text-4xl text-red-500 ml-1">x</span>
            </div>

            <div className="mt-1 sm:mt-2 flex items-center gap-1.5 text-[11px] sm:text-sm font-semibold text-slate-300 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
              <Flame className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
              <span>{lang === 'ka' ? 'ავიატორი სიმაღლეს იკრებს...' : 'Aviator climbing...'}</span>
            </div>
          </div>
        )}

        {status === 'CRASHED' && (
          <div className="flex flex-col items-center text-center px-4 animate-in zoom-in-95 duration-200">
            <div className="text-red-500 font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-wider font-['Chakra_Petch',sans-serif] uppercase drop-shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse">
              {lang === 'ka' ? 'გაფრინდა!' : 'FLEW AWAY!'}
            </div>
            <div className="mt-1.5 font-mono text-2xl sm:text-4xl font-bold text-slate-200">
              {crashMultiplier?.toFixed(2)}x
            </div>
            {crashColor && (
              <div className="mt-2.5 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-xl backdrop-blur-md">
                <span className="text-xs text-slate-400">
                  {lang === 'ka' ? 'ჩამოვარდა ზონაში:' : 'Crashed in zone:'}
                </span>
                <span
                  className={`font-bold font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-lg ${
                    crashColor === 'RED'
                      ? 'bg-red-600 text-white'
                      : crashColor === 'BLACK'
                      ? 'bg-slate-800 text-white border border-slate-600'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {crashColor === 'RED' ? '🔴 RED' : crashColor === 'BLACK' ? '⚫ BLACK' : '🟢 ZERO'}
                </span>
              </div>
            )}
          </div>
        )}

        {(status === 'COUNTDOWN' || status === 'WAITING') && (
          <div className="flex flex-col items-center text-center px-4 animate-in fade-in duration-300">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
              <div className="text-xl sm:text-2xl font-mono font-bold text-red-500">
                {countdown}s
              </div>
            </div>

            <div className="text-slate-300 font-bold text-base sm:text-lg tracking-wide uppercase">
              {lang === 'ka' ? 'მომდევნო რაუნდი იწყება' : 'WAITING FOR NEXT ROUND'}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 max-w-sm">
              {lang === 'ka'
                ? 'განათავსეთ ფსონი და დააზღვიეთ რულეტკაზე!'
                : 'Place your Aviator bet and hedge on roulette color!'}
            </p>

            <div className="w-48 sm:w-56 h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-red-600 transition-all duration-300 ease-linear"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* QUICK FLOATING REACTION BAR (Feature 2 & Mobile Friendly) */}
      <div className="absolute bottom-2.5 right-2.5 z-30 flex items-center gap-1 sm:gap-1.5 bg-[#0e131e]/85 backdrop-blur-md p-1 rounded-2xl border border-slate-700/70 shadow-lg">
        {[
          { emoji: '🚀', label: 'Rocket' },
          { emoji: '🔥', label: 'Fire' },
          { emoji: '😱', label: 'Shock' },
          { emoji: '💸', label: 'Cash' },
          { emoji: '🍀', label: 'Lucky' },
          { emoji: '💔', label: 'Crash' },
        ].map((item) => (
          <button
            key={item.emoji}
            type="button"
            onClick={() => handleEmojiClick(item.emoji)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl hover:bg-slate-800 active:scale-125 transition-all text-base sm:text-lg cursor-pointer select-none"
            title={item.label}
          >
            {item.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
