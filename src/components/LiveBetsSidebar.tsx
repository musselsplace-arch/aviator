import React, { useState } from 'react';
import { GameStatus, LivePlayerBet, RoundHistoryItem } from '../types';
import { Users, User, Trophy, Shield, Check, Flame } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface LiveBetsSidebarProps {
  status: GameStatus;
  multiplier: number;
  livePlayers: LivePlayerBet[];
  myHistory: {
    roundNumber: number;
    betAmount: number;
    cashoutMultiplier: number | null;
    payout: number;
    hedgeColor: string | null;
    hedgeWon: boolean | null;
    hedgePayout: number;
  }[];
  lang: 'ka' | 'en';
}

export const LiveBetsSidebar: React.FC<LiveBetsSidebarProps> = ({
  status,
  multiplier,
  livePlayers,
  myHistory,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY' | 'TOP'>('ALL');

  const totalBetAmount = livePlayers.reduce((acc, p) => acc + p.amount + (p.hedgeAmount || 0), 0);

  return (
    <div
      id="live-bets-sidebar"
      className="flex flex-col h-full bg-[#0e131d] border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
    >
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-slate-800 bg-[#090d16] p-1.5 gap-1">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('ALL');
          }}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ALL'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{lang === 'ka' ? 'ყველა ფსონი' : 'All Bets'}</span>
          <span className="text-[10px] bg-slate-900 px-1.5 py-0.2 rounded-full text-slate-400 font-mono">
            {livePlayers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('MY');
          }}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'MY'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>{lang === 'ka' ? 'ჩემი' : 'My Bets'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('TOP');
          }}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'TOP'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'ka' ? 'ტოპ' : 'Top'}</span>
        </button>
      </div>

      {/* Stats sub-bar */}
      {activeTab === 'ALL' && (
        <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>{lang === 'ka' ? 'სულ მოთამაშეები:' : 'Total Players:'} <strong className="text-white font-mono">{livePlayers.length}</strong></span>
          <span>{lang === 'ka' ? 'ჯამური ფსონი:' : 'Total Pool:'} <strong className="text-amber-400 font-mono">{totalBetAmount.toFixed(0)} ₾</strong></span>
        </div>
      )}

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar max-h-[350px] lg:max-h-[580px]">
        {activeTab === 'ALL' && (
          <>
            {livePlayers.map((player) => {
              const isCashed = player.cashedOut;
              const winValue = player.cashoutMultiplier ? player.amount * player.cashoutMultiplier : 0;

              return (
                <div
                  key={player.id}
                  className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    isCashed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-[#121824] border-slate-800/80 text-slate-300'
                  }`}
                >
                  {/* User info & avatar */}
                  <div className="flex items-center gap-2">
                    <span className="text-base">{player.avatar}</span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white truncate max-w-[90px]">
                        {player.username}
                      </span>
                      {/* Roulette Hedge Badge if placed */}
                      {player.hedgeColor && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-300 font-mono">
                          <Shield className="w-2.5 h-2.5 text-amber-400" />
                          {player.hedgeColor === 'RED' ? '🔴' : player.hedgeColor === 'BLACK' ? '⚫' : '🟢'} {player.hedgeAmount}₾
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bet Amount */}
                  <div className="text-right">
                    <span className="font-mono font-bold text-white block">
                      {player.amount.toFixed(0)} ₾
                    </span>
                  </div>

                  {/* Multiplier / Cashout status */}
                  <div className="text-right min-w-[70px]">
                    {isCashed ? (
                      <div className="flex flex-col items-end">
                        <span className="font-mono font-black text-emerald-400 text-xs px-1.5 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/40">
                          {player.cashoutMultiplier?.toFixed(2)}x
                        </span>
                        <span className="text-[10px] font-mono text-emerald-300 font-bold mt-0.5">
                          +{winValue.toFixed(1)} ₾
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-500">
                        {status === 'FLYING' ? (
                          <span className="text-amber-400 animate-pulse font-bold">
                            {lang === 'ka' ? 'ფრენაშია' : 'flying'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {activeTab === 'MY' && (
          <>
            {myHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                {lang === 'ka'
                  ? 'ჯერ არ გაქვთ განთავსებული ფსონები'
                  : 'No bets placed yet'}
              </div>
            ) : (
              myHistory.map((item, idx) => {
                const totalProfit = (item.payout + item.hedgePayout) - (item.betAmount);
                const isProfitable = totalProfit > 0;

                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#121824] border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>#{item.roundNumber}</span>
                      <span className={`font-mono font-bold ${isProfitable ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {isProfitable ? `+${totalProfit.toFixed(2)} ₾` : `-${item.betAmount.toFixed(2)} ₾`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>{lang === 'ka' ? 'ავიატორი:' : 'Aviator:'} {item.betAmount} ₾</span>
                      <span className="font-mono">
                        {item.cashoutMultiplier ? `${item.cashoutMultiplier.toFixed(2)}x (მოგება)` : 'ჩამოვარდა'}
                      </span>
                    </div>

                    {item.hedgeColor && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                        <span className="flex items-center gap-1 text-amber-300">
                          <Shield className="w-3 h-3 text-amber-400" />
                          {lang === 'ka' ? 'დაზღვევა:' : 'Hedge:'} {item.hedgeColor}
                        </span>
                        <span className={`font-mono font-bold ${item.hedgeWon ? 'text-emerald-400' : 'text-red-400'}`}>
                          {item.hedgeWon ? `+${item.hedgePayout.toFixed(2)} ₾` : 'არ დაჯდა'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {activeTab === 'TOP' && (
          <div className="space-y-2 p-1">
            {[
              { mult: 84.50, user: 'GeoSniper', win: '4,225 ₾', date: 'დღეს 10:14' },
              { mult: 42.10, user: 'TbilisiPilot', win: '2,105 ₾', date: 'დღეს 09:40' },
              { mult: 29.80, user: 'KutaisiKing', win: '1,490 ₾', date: 'დღეს 08:12' },
              { mult: 18.20, user: 'BatumiLucky', win: '910 ₾', date: 'გუშინ' },
              { mult: 14.00, user: 'ZeroMaster (Green)', win: '1,400 ₾', date: 'გუშინ' },
            ].map((top, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/30 to-slate-900 border border-amber-500/20 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-white block">{top.user}</span>
                    <span className="text-[10px] text-slate-500">{top.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-black text-amber-300 block">
                    {top.mult.toFixed(2)}x
                  </span>
                  <span className="font-mono text-emerald-400 text-[11px] font-bold">
                    +{top.win}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
