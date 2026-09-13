import React, { useState } from 'react';
import { RoundHistoryItem } from '../types';
import { History, Shield, X, ExternalLink } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface RoundHistoryBarProps {
  history: RoundHistoryItem[];
  lang: 'ka' | 'en';
}

export const RoundHistoryBar: React.FC<RoundHistoryBarProps> = ({ history, lang }) => {
  const [selectedRound, setSelectedRound] = useState<RoundHistoryItem | null>(null);

  const getChipStyle = (mult: number, color: string) => {
    let textClass = 'text-blue-400';
    let bgClass = 'bg-blue-950/40 border-blue-800/50 hover:border-blue-500';

    if (mult >= 10.0) {
      textClass = 'text-amber-300';
      bgClass = 'bg-amber-950/50 border-amber-500/60 hover:border-amber-400';
    } else if (mult >= 2.0) {
      textClass = 'text-purple-300';
      bgClass = 'bg-purple-950/40 border-purple-800/50 hover:border-purple-500';
    }

    return { textClass, bgClass };
  };

  return (
    <div id="round-history-bar" className="w-full relative">
      <div className="flex items-center gap-2 overflow-x-auto py-1.5 px-2 bg-[#0c101a] border border-slate-800 rounded-xl no-scrollbar">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase shrink-0 px-1">
          <History className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{lang === 'ka' ? 'ისტორია' : 'HISTORY'}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {history.slice(0, 18).map((round) => {
            const { textClass, bgClass } = getChipStyle(round.crashMultiplier, round.crashColor);
            return (
              <button
                key={round.id}
                type="button"
                onClick={() => {
                  playClickSound();
                  setSelectedRound(round);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all shrink-0 active:scale-95 ${bgClass} ${textClass}`}
              >
                {/* Zone Color Indicator */}
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    round.crashColor === 'RED'
                      ? 'bg-red-500'
                      : round.crashColor === 'BLACK'
                      ? 'bg-slate-400 border border-slate-600'
                      : 'bg-emerald-400'
                  }`}
                />
                <span>{round.crashMultiplier.toFixed(2)}x</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Round Detail Modal */}
      {selectedRound && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111724] border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-white text-base">
                  {lang === 'ka' ? 'რაუნდის დეტალები' : 'Round Details'} #{selectedRound.roundNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRound(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-slate-400">
                  {lang === 'ka' ? 'ფინალური კოეფიციენტი' : 'Crash Multiplier'}
                </span>
                <span className="font-mono text-2xl font-black text-white">
                  {selectedRound.crashMultiplier.toFixed(2)}x
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-slate-400">
                  {lang === 'ka' ? 'მომგებიანი რულეტკის ფერი' : 'Winning Roulette Color'}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      selectedRound.crashColor === 'RED'
                        ? 'bg-red-500'
                        : selectedRound.crashColor === 'BLACK'
                        ? 'bg-slate-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span className="font-mono font-bold text-sm text-white">
                    {selectedRound.crashColor === 'RED'
                      ? 'წითელი (RED 🔴)'
                      : selectedRound.crashColor === 'BLACK'
                      ? 'შავი (BLACK ⚫)'
                      : 'მწვანე (GREEN 🟢)'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-xs text-slate-400">
                  {lang === 'ka' ? 'გამჭვირვალობის ჰეში (Provably Fair)' : 'Server Seed Hash'}
                </span>
                <p className="font-mono text-[10px] text-slate-300 break-all bg-black/40 p-2 rounded border border-slate-800">
                  {selectedRound.serverSeedHash}
                </p>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                  ✓ 100% {lang === 'ka' ? 'დადასტურებული და შემთხვევითი' : 'Verified & Random'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedRound(null)}
              className="w-full py-2.5 rounded-xl font-bold text-xs uppercase bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {lang === 'ka' ? 'დახურვა' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
