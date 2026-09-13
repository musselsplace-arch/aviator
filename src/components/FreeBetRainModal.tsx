import React, { useEffect, useState } from 'react';
import { FreeBetRainEvent } from '../types';
import { CloudRain, Coins, Sparkles, X } from 'lucide-react';
import { playClickSound, playRainClaimSound } from '../utils/audio';

interface FreeBetRainModalProps {
  event: FreeBetRainEvent | null;
  onClaim: (amount: number) => void;
  onDismiss: () => void;
  lang: 'ka' | 'en';
}

export const FreeBetRainModal: React.FC<FreeBetRainModalProps> = ({
  event,
  onClaim,
  onDismiss,
  lang,
}) => {
  const [claimed, setClaimed] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(10);

  useEffect(() => {
    if (!event) return;
    setClaimed(false);
    setTimeLeft(10);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [event, onDismiss]);

  if (!event) return null;

  const handleClaim = () => {
    playClickSound();
    playRainClaimSound();
    setClaimed(true);
    onClaim(event.amount);
    setTimeout(() => {
      onDismiss();
    }, 1200);
  };

  return (
    <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm animate-in slide-in-from-top-4 duration-300">
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 p-[2px] shadow-[0_0_30px_rgba(59,130,246,0.6)]">
        <div className="rounded-[14px] bg-[#0c1322] p-3.5 flex items-center justify-between gap-3">
          {/* Cloud Rain Icon */}
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/40 shrink-0">
            <CloudRain className="w-6 h-6 animate-pulse text-cyan-300" />
            <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-yellow-300 animate-spin" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wide text-cyan-300 font-['Chakra_Petch',sans-serif]">
                {lang === 'ka' ? '🌧️ უფასო ფსონების წვიმა!' : '🌧️ FREE BET RAIN!'}
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                {timeLeft}s
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium">
              {lang === 'ka'
                ? `საჩუქრად გადმოგეცა +${event.amount.toFixed(2)} ₾!`
                : `Claim +${event.amount.toFixed(2)} GEL Free!`}
            </p>
          </div>

          {/* Claim Button */}
          {!claimed ? (
            <button
              type="button"
              onClick={handleClaim}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{lang === 'ka' ? 'აღება' : 'Claim'}</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40 animate-in zoom-in">
              {lang === 'ka' ? 'ჩაირიცხა!' : 'Added!'}
            </span>
          )}

          {/* Dismiss */}
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
