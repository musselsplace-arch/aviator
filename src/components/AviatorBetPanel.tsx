import React, { useState } from 'react';
import { GameStatus, AviatorBet } from '../types';
import { playClickSound } from '../utils/audio';
import { Check, Flame, Minus, Plus, Zap } from 'lucide-react';

interface AviatorBetPanelProps {
  panelId: string;
  panelNumber: number;
  status: GameStatus;
  multiplier: number;
  balance: number;
  bet: AviatorBet;
  onPlaceBet: (amount: number, autoCashout: boolean, autoCashoutMultiplier: number) => void;
  onCancelBet: () => void;
  onCashout: () => void;
  lang: 'ka' | 'en';
}

export const AviatorBetPanel: React.FC<AviatorBetPanelProps> = ({
  panelId,
  panelNumber,
  status,
  multiplier,
  balance,
  bet,
  onPlaceBet,
  onCancelBet,
  onCashout,
  lang,
}) => {
  const [amount, setAmount] = useState<number>(10);
  const [autoCashout, setAutoCashout] = useState<boolean>(false);
  const [autoMultiplier, setAutoMultiplier] = useState<number>(2.0);

  const quickChips = [1, 2, 5, 10, 25, 50];

  const handlePlace = () => {
    if (amount <= 0 || amount > balance) return;
    playClickSound();
    onPlaceBet(amount, autoCashout, autoMultiplier);
  };

  const handleCashout = () => {
    onCashout();
  };

  const handleCancel = () => {
    playClickSound();
    onCancelBet();
  };

  // Real-time cashout amount if bet is currently active in air
  const currentCashoutValue = bet.active && !bet.cashedOut ? amount * multiplier : 0;

  return (
    <div
      id={`aviator-bet-panel-${panelId}`}
      className="rounded-2xl bg-[#121722] border border-slate-800 p-3.5 shadow-xl flex flex-col justify-between"
    >
      {/* Panel Top Header: Label & Auto Cashout Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
        <span className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          {lang === 'ka' ? `ავიატორის ფსონი #${panelNumber}` : `Aviator Bet #${panelNumber}`}
        </span>

        {/* Auto Cashout toggle */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-slate-400 font-medium cursor-pointer flex items-center gap-1.5 select-none">
            <input
              type="checkbox"
              checked={autoCashout}
              disabled={bet.active}
              onChange={(e) => setAutoCashout(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>{lang === 'ka' ? 'ავტო განაღდება' : 'Auto Cashout'}</span>
          </label>

          {autoCashout && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg">
              <input
                type="number"
                min="1.01"
                step="0.1"
                value={autoMultiplier}
                disabled={bet.active}
                onChange={(e) => setAutoMultiplier(Math.max(1.01, Number(e.target.value)))}
                className="w-12 bg-transparent font-mono text-xs font-bold text-amber-400 text-right focus:outline-none"
              />
              <span className="text-[11px] font-bold text-slate-500">x</span>
            </div>
          )}
        </div>
      </div>

      {/* Inputs & Main Button Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Left Side: Amount Adjuster */}
        <div className="sm:col-span-6 space-y-2">
          <div className="flex items-center gap-1.5 bg-[#0a0d14] border border-slate-700/80 rounded-xl p-1">
            <button
              type="button"
              disabled={bet.active}
              onClick={() => {
                playClickSound();
                setAmount(Math.max(1, amount - 1));
              }}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors disabled:opacity-40"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <input
              type="number"
              min="1"
              max={balance}
              value={amount}
              disabled={bet.active}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
              className="flex-1 bg-transparent text-center font-mono font-extrabold text-white text-base focus:outline-none"
            />

            <button
              type="button"
              disabled={bet.active}
              onClick={() => {
                playClickSound();
                setAmount(amount + 1);
              }}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Chip presets */}
          <div className="flex items-center gap-1 flex-wrap">
            {quickChips.map((q) => (
              <button
                key={q}
                type="button"
                disabled={bet.active}
                onClick={() => {
                  playClickSound();
                  setAmount(q);
                }}
                className={`flex-1 py-1 px-1.5 text-center rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                  amount === q
                    ? 'bg-red-500/20 text-red-300 border-red-500/60'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                } disabled:opacity-40`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Big Action Button (BET / CASHOUT / WAITING) */}
        <div className="sm:col-span-6 h-full flex flex-col justify-center">
          {!bet.active ? (
            <button
              id={`place-aviator-bet-${panelId}`}
              type="button"
              disabled={amount > balance || amount <= 0 || status === 'FLYING'}
              onClick={handlePlace}
              className={`w-full h-16 rounded-xl font-extrabold text-base tracking-wider uppercase flex flex-col items-center justify-center shadow-lg transition-all duration-150 ${
                amount > balance || amount <= 0 || status === 'FLYING'
                  ? 'bg-slate-800/80 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 border border-emerald-400 shadow-emerald-950/60 active:scale-[0.98] cursor-pointer'
              }`}
            >
              <span className="text-lg font-['Chakra_Petch',sans-serif]">
                {lang === 'ka' ? 'დადება (BET)' : 'BET'}
              </span>
              <span className="text-xs font-mono font-black opacity-90">
                {amount.toFixed(2)} ₾ GEL
              </span>
            </button>
          ) : status !== 'FLYING' ? (
            /* Bet placed, waiting for takeoff: Cancel option */
            <button
              type="button"
              onClick={handleCancel}
              className="w-full h-16 rounded-xl font-extrabold text-sm tracking-wider uppercase flex flex-col items-center justify-center bg-red-950/80 border border-red-700/80 text-red-300 hover:bg-red-900 active:scale-[0.98] shadow-lg shadow-red-950/50 transition-all cursor-pointer"
            >
              <span className="font-['Chakra_Petch',sans-serif] text-base">
                {lang === 'ka' ? 'გაუქმება' : 'CANCEL'}
              </span>
              <span className="text-xs font-mono text-red-200">
                {bet.amount.toFixed(2)} ₾
              </span>
            </button>
          ) : bet.cashedOut ? (
            /* Already Cashed Out */
            <div className="w-full h-16 rounded-xl bg-emerald-950/90 border border-emerald-500/80 p-2 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
              <span className="text-[10px] text-emerald-300 uppercase font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {lang === 'ka' ? 'განაღდებულია!' : 'CASHED OUT!'}
              </span>
              <span className="font-mono text-lg font-black text-emerald-300">
                +{bet.winAmount?.toFixed(2)} ₾
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">
                @{bet.cashoutMultiplier?.toFixed(2)}x
              </span>
            </div>
          ) : (
            /* In Flight: LIVE CASHOUT BUTTON */
            <button
              id={`cashout-aviator-bet-${panelId}`}
              type="button"
              onClick={handleCashout}
              className="w-full h-16 rounded-xl font-extrabold tracking-wider uppercase flex flex-col items-center justify-center bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 active:scale-[0.97] text-slate-950 border-2 border-amber-300 shadow-xl shadow-orange-950/80 transition-all cursor-pointer animate-pulse"
            >
              <span className="text-xs font-black tracking-widest text-slate-900 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current" />
                {lang === 'ka' ? 'განაღდება' : 'CASH OUT'}
              </span>
              <span className="text-lg font-black font-mono">
                {currentCashoutValue.toFixed(2)} ₾
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
