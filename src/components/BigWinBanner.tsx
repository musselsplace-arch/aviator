import React, { useEffect } from 'react';
import { BigWinNotification } from '../types';
import { Trophy, Sparkles, X } from 'lucide-react';

interface BigWinBannerProps {
  notification: BigWinNotification | null;
  onDismiss: () => void;
  lang: 'ka' | 'en';
}

export const BigWinBanner: React.FC<BigWinBannerProps> = ({
  notification,
  onDismiss,
  lang,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-3 w-full max-w-md animate-in slide-in-from-top-6 duration-300">
      <div className="relative rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 p-[2px] shadow-[0_0_35px_rgba(245,158,11,0.6)]">
        <div className="rounded-[14px] bg-[#0c101a] px-4 py-3 flex items-center justify-between gap-3">
          {/* Trophy & Glow */}
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 font-black shadow-lg shadow-amber-500/40 shrink-0 animate-bounce">
            <Trophy className="w-6 h-6" />
            <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-white animate-spin" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 font-['Chakra_Petch',sans-serif]">
                {notification.isUser
                  ? (lang === 'ka' ? '🎉 თქვენი დიდი მოგება!' : '🎉 YOUR BIG WIN!')
                  : (lang === 'ka' ? '🔥 დიდი მოგება!' : '🔥 BIG WIN!')}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono font-bold text-[10px]">
                {notification.multiplier.toFixed(2)}x
              </span>
            </div>

            <div className="flex items-center justify-between mt-0.5">
              <span className="text-xs font-bold text-slate-200 truncate">
                {notification.username}
              </span>
              <span className="font-mono font-extrabold text-sm sm:text-base text-amber-400">
                +{notification.amount.toFixed(2)} ₾
              </span>
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
