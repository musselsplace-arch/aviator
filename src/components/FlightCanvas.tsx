import React, { useEffect, useRef } from 'react';
import { GameStatus, RouletteColor, ColorZone } from '../types';
import { getColorZone, getNextColorZone, getZoneProgress } from '../utils/gameZones';
import { Flame, ShieldAlert, Sparkles } from 'lucide-react';

interface FlightCanvasProps {
  status: GameStatus;
  multiplier: number;
  countdown: number;
  crashMultiplier: number | null;
  crashColor: RouletteColor | null;
  selectedHedgeColor: RouletteColor | null;
  isHedgeActive: boolean;
  lang: 'ka' | 'en';
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

export const FlightCanvas: React.FC<FlightCanvasProps> = ({
  status,
  multiplier,
  countdown,
  crashMultiplier,
  crashColor,
  selectedHedgeColor,
  isHedgeActive,
  lang,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const planeAnimRef = useRef({
    angle: -0.4,
    thrusterPulse: 0,
    flyAwayProgress: 0,
  });

  const currentZone = getColorZone(multiplier);
  const nextZone = getNextColorZone(multiplier);
  const zoneProgress = getZoneProgress(multiplier);

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

  // Main canvas animation loop
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

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Background atmospheric gradient reflecting current zone
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        50,
        width * 0.5,
        height * 0.5,
        width * 0.8
      );
      
      if (status === 'FLYING') {
        if (currentZone.color === 'RED') {
          bgGrad.addColorStop(0, 'rgba(239, 68, 68, 0.12)');
          bgGrad.addColorStop(1, '#090d16');
        } else if (currentZone.color === 'BLACK') {
          bgGrad.addColorStop(0, 'rgba(30, 41, 59, 0.25)');
          bgGrad.addColorStop(1, '#070a10');
        } else {
          bgGrad.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
          bgGrad.addColorStop(1, '#060d0a');
        }
      } else if (status === 'CRASHED') {
        bgGrad.addColorStop(0, 'rgba(220, 38, 38, 0.15)');
        bgGrad.addColorStop(1, '#0b0c10');
      } else {
        bgGrad.addColorStop(0, 'rgba(20, 24, 33, 0.8)');
        bgGrad.addColorStop(1, '#090b10');
      }

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

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
      const originX = 60;
      const originY = height - 50;

      // Axis lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(originX, 20);
      ctx.lineTo(originX, originY);
      ctx.lineTo(width - 20, originY);
      ctx.stroke();

      // Axis labels / markings
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '11px Outfit, sans-serif';
      ctx.fillText('0s', originX, originY + 20);
      ctx.fillText('5s', originX + (width - originX) * 0.33, originY + 20);
      ctx.fillText('10s', originX + (width - originX) * 0.66, originY + 20);
      ctx.fillText('15s+', width - 40, originY + 20);

      // Trajectory calculation
      // Multiplier starts at 1.00. Map to curve
      const maxFlightW = width - originX - 90;
      const maxFlightH = originY - 70;

      // Scale multiplier logarithmically/exponentially to screen space
      const normProgress = Math.min(Math.log(multiplier) / Math.log(15), 1.0);
      const currentX = originX + normProgress * maxFlightW;
      const currentY = originY - Math.pow(normProgress, 0.85) * maxFlightH;

      if (status === 'FLYING' || status === 'CRASHED') {
        // Draw the curved trajectory
        ctx.beginPath();
        ctx.moveTo(originX, originY);

        const steps = 40;
        for (let i = 1; i <= steps; i++) {
          const t = (i / steps) * normProgress;
          const px = originX + t * maxFlightW;
          const py = originY - Math.pow(t, 0.85) * maxFlightH;
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
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Fill area beneath trajectory
        const fillGrad = ctx.createLinearGradient(0, currentY, 0, originY);
        if (currentZone.color === 'RED') {
          fillGrad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
          fillGrad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
        } else if (currentZone.color === 'BLACK') {
          fillGrad.addColorStop(0, 'rgba(71, 85, 105, 0.35)');
          fillGrad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
        } else {
          fillGrad.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
          fillGrad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
        }

        ctx.lineTo(currentX, originY);
        ctx.lineTo(originX, originY);
        ctx.closePath();
        ctx.fillStyle = fillGrad;
        ctx.fill();

        // Draw dynamic zone transition checkpoints along the curve
        const testCheckpoints = [1.45, 2.10, 3.10, 4.60, 6.80, 9.90, 12.00, 18.00, 27.00];
        testCheckpoints.forEach((cp) => {
          if (cp <= multiplier * 1.6 && cp >= 1.0) {
            const cpNorm = Math.min(Math.log(cp) / Math.log(15), 1.0);
            const cpX = originX + cpNorm * maxFlightW;
            const cpY = originY - Math.pow(cpNorm, 0.85) * maxFlightH;

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
            ctx.font = '10px Chakra Petch, sans-serif';
            ctx.fillStyle = isPassed ? 'rgba(255,255,255,0.5)' : '#ffffff';
            ctx.fillText(`${cp.toFixed(2)}x ${cpZone.color === 'RED' ? '🔴' : cpZone.color === 'BLACK' ? '⚫' : '🟢'}`, cpX - 18, cpY - 10);
            ctx.restore();
          }
        });

        // Update & Spawn Thruster Smoke/Fire Particles
        if (status === 'FLYING') {
          for (let p = 0; p < 3; p++) {
            particlesRef.current.push({
              x: currentX - 15 + (Math.random() - 0.5) * 6,
              y: currentY + 5 + (Math.random() - 0.5) * 6,
              vx: -Math.random() * 3 - 2,
              vy: Math.random() * 2 - 1,
              size: Math.random() * 6 + 3,
              alpha: 0.9,
              color: currentZone.color === 'RED' ? '#f87171' : currentZone.color === 'GREEN' ? '#34d399' : '#38bdf8',
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

        // Only draw plane if still reasonably in bounds
        if (planeX < width + 100 && planeY > -100) {
          ctx.save();
          ctx.translate(planeX, planeY);
          // Calculate flight angle tangent
          const angle = -0.38 + Math.sin(Date.now() * 0.006) * 0.04;
          ctx.rotate(angle);

          // Animated jet thruster flame
          planeAnimRef.current.thrusterPulse += 0.25;
          const flameLength = 22 + Math.sin(planeAnimRef.current.thrusterPulse) * 8;

          const flameGrad = ctx.createLinearGradient(-flameLength, 0, 0, 0);
          flameGrad.addColorStop(0, 'rgba(255, 60, 0, 0)');
          flameGrad.addColorStop(0.5, '#f97316');
          flameGrad.addColorStop(1, '#fef08a');

          ctx.beginPath();
          ctx.moveTo(0, -4);
          ctx.lineTo(-flameLength, 0);
          ctx.lineTo(0, 4);
          ctx.closePath();
          ctx.fillStyle = flameGrad;
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Plane Body (Sleek aerodynamic red aircraft)
          ctx.fillStyle = '#dc2626'; // Deep Aviator Crimson
          ctx.beginPath();
          ctx.moveTo(28, 0); // Nose tip
          ctx.lineTo(5, -6);
          ctx.lineTo(-12, -4);
          ctx.lineTo(-20, -10); // Tail fin top
          ctx.lineTo(-24, -10);
          ctx.lineTo(-18, 0);
          ctx.lineTo(-24, 8); // Tail fin bottom
          ctx.lineTo(-20, 8);
          ctx.lineTo(-12, 3);
          ctx.lineTo(5, 5);
          ctx.closePath();
          ctx.fill();

          // Wings
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(8, -2);
          ctx.lineTo(-8, -18);
          ctx.lineTo(-14, -18);
          ctx.lineTo(-4, -1);
          ctx.closePath();
          ctx.fill();

          // Cockpit glass
          ctx.fillStyle = '#e0f2fe';
          ctx.beginPath();
          ctx.moveTo(18, -1);
          ctx.lineTo(8, -4);
          ctx.lineTo(10, 0);
          ctx.closePath();
          ctx.fill();

          // Underbelly wing
          ctx.fillStyle = '#991b1b';
          ctx.beginPath();
          ctx.moveTo(6, 2);
          ctx.lineTo(-6, 14);
          ctx.lineTo(-12, 14);
          ctx.lineTo(-3, 2);
          ctx.closePath();
          ctx.fill();

          // Wingtip light
          ctx.fillStyle = currentZone.color === 'RED' ? '#ff4d4d' : currentZone.color === 'GREEN' ? '#10b981' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(-11, -17, 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      ctx.restore();

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrame);
  }, [status, multiplier, currentZone]);

  // Reset flyAwayProgress when entering new round
  useEffect(() => {
    if (status === 'COUNTDOWN' || status === 'WAITING') {
      planeAnimRef.current.flyAwayProgress = 0;
      particlesRef.current = [];
    }
  }, [status]);

  const zoneTitleKa =
    currentZone.color === 'RED'
      ? 'წითელი ზონა 🔴'
      : currentZone.color === 'BLACK'
      ? 'შავი ზონა ⚫'
      : 'მწვანე ზონა 🟢';

  const zoneTitleEn =
    currentZone.color === 'RED'
      ? 'RED ZONE 🔴'
      : currentZone.color === 'BLACK'
      ? 'BLACK ZONE ⚫'
      : 'GREEN ZONE 🟢';

  return (
    <div
      ref={containerRef}
      id="aviator-flight-canvas-container"
      className="relative w-full h-[360px] md:h-[440px] lg:h-[490px] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl bg-[#090d16]"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* TOP ZONE BAR (The special Roulette zone tracker) */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        {/* Active Zone Pill */}
        <div
          id="active-zone-tracker"
          className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 shadow-lg ${
            currentZone.color === 'RED'
              ? 'bg-red-950/80 border-red-500/60 text-red-100 shadow-red-900/30'
              : currentZone.color === 'BLACK'
              ? 'bg-slate-900/90 border-slate-700/80 text-slate-200 shadow-black/50'
              : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-100 shadow-emerald-900/30'
          }`}
        >
          <span
            className={`w-3 h-3 rounded-full animate-ping inline-block ${
              currentZone.color === 'RED'
                ? 'bg-red-500'
                : currentZone.color === 'BLACK'
                ? 'bg-slate-400'
                : 'bg-emerald-400'
            }`}
          />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
              {lang === 'ka' ? 'მიმდინარე რულეტკის ზონა' : 'CURRENT ROULETTE ZONE'}
            </span>
            <div className="flex items-center gap-1.5 font-bold font-mono text-xs md:text-sm">
              <span>{lang === 'ka' ? zoneTitleKa : zoneTitleEn}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({currentZone.minMultiplier.toFixed(2)}x - {currentZone.maxMultiplier.toFixed(2)}x)
              </span>
            </div>
          </div>
        </div>

        {/* Next Zone Countdown / Gauge */}
        {nextZone && status === 'FLYING' && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-slate-800 text-xs backdrop-blur-md">
            <span className="text-slate-400 font-medium">
              {lang === 'ka' ? 'შემდეგი:' : 'Next:'}
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[11px] font-mono ${
                nextZone.color === 'RED'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : nextZone.color === 'BLACK'
                  ? 'bg-slate-700/40 text-slate-200 border border-slate-600/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {nextZone.color === 'RED' ? '🔴 RED' : nextZone.color === 'BLACK' ? '⚫ BLACK' : '🟢 ZERO'} @ {nextZone.minMultiplier.toFixed(2)}x
            </span>
            <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-100"
                style={{ width: `${zoneProgress * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* User Active Hedge Status Indicator */}
        {isHedgeActive && selectedHedgeColor && (
          <div
            id="user-active-hedge-pill"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
              selectedHedgeColor === currentZone.color
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 animate-pulse'
                : 'bg-slate-900/80 text-slate-300 border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>
              {lang === 'ka' ? 'დაზღვევა:' : 'Hedge:'}{' '}
              {selectedHedgeColor === 'RED' ? '🔴 RED' : selectedHedgeColor === 'BLACK' ? '⚫ BLACK' : '🟢 GREEN'}
            </span>
            {selectedHedgeColor === currentZone.color && (
              <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-bold">
                {lang === 'ka' ? 'აქტიური მოგება!' : 'IN ZONE!'}
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
              className="font-extrabold tracking-tighter font-mono text-6xl sm:text-7xl md:text-8xl text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]"
            >
              {multiplier.toFixed(2)}
              <span className="text-3xl sm:text-4xl text-red-500 ml-1">x</span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-300 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
              <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
              <span>{lang === 'ka' ? 'ავიატორი სიმაღლეს იკრებს...' : 'Aviator climbing...'}</span>
            </div>
          </div>
        )}

        {status === 'CRASHED' && (
          <div className="flex flex-col items-center text-center px-4 animate-in zoom-in-95 duration-200">
            <div className="text-red-500 font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-wider font-['Chakra_Petch',sans-serif] uppercase drop-shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse">
              {lang === 'ka' ? 'გაფრინდა!' : 'FLEW AWAY!'}
            </div>
            <div className="mt-2 font-mono text-2xl sm:text-4xl font-bold text-slate-200">
              {crashMultiplier?.toFixed(2)}x
            </div>
            {crashColor && (
              <div className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-xl backdrop-blur-md">
                <span className="text-xs text-slate-400">
                  {lang === 'ka' ? 'ჩამოვარდა ზონაში:' : 'Crashed in zone:'}
                </span>
                <span
                  className={`font-bold font-mono text-sm px-2.5 py-1 rounded-lg ${
                    crashColor === 'RED'
                      ? 'bg-red-600 text-white'
                      : crashColor === 'BLACK'
                      ? 'bg-slate-800 text-white border border-slate-600'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {crashColor === 'RED' ? '🔴 RED' : crashColor === 'BLACK' ? '⚫ BLACK' : '🟢 GREEN'}
                </span>
              </div>
            )}
          </div>
        )}

        {(status === 'COUNTDOWN' || status === 'WAITING') && (
          <div className="flex flex-col items-center text-center px-4 animate-in fade-in duration-300">
            {/* Spinning propeller loader */}
            <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
              <div className="text-2xl font-mono font-bold text-red-500">
                {countdown}s
              </div>
            </div>

            <div className="text-slate-300 font-bold text-lg md:text-xl tracking-wide uppercase">
              {lang === 'ka' ? 'მომდევნო რაუნდი იწყება' : 'WAITING FOR NEXT ROUND'}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {lang === 'ka'
                ? 'განათავსეთ ფსონი ავიატორზე და დააზღვიეთ რულეტკის ფერზე!'
                : 'Place your Aviator bet and hedge on Red or Black roulette color!'}
            </p>

            {/* Countdown progress bar */}
            <div className="w-56 h-2 bg-slate-800 rounded-full mt-4 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-red-600 transition-all duration-300 ease-linear"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
