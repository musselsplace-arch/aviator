import React, { useState } from 'react';
import { GameStatus, RouletteColor, RouletteHedgeBet } from '../types';
import { ROULETTE_PAYOUTS } from '../utils/gameZones';
import { ShieldCheck, Info, HelpCircle, Flame, CheckCircle2, XCircle } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface RouletteHedgePanelProps {
  status: GameStatus;
  balance: number;
  currentHedgeBet: RouletteHedgeBet | null;
  onPlaceHedgeBet: (color: RouletteColor, amount: number) => void;
  onCancelHedgeBet: () => void;
  lang: 'ka' | 'en';
}

export const RouletteHedgePanel: React.FC<RouletteHedgePanelProps> = ({
  status,
  balance,
  currentHedgeBet,
  onPlaceHedgeBet,
  onCancelHedgeBet,
  lang,
}) => {
  const [selectedColor, setSelectedColor] = useState<RouletteColor>('RED');
  const [amount, setAmount] = useState<number>(10);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const quickAmounts = [2, 5, 10, 20, 50, 100];

  const handlePlace = () => {
    if (amount <= 0 || amount > balance) return;
    playClickSound();
    onPlaceHedgeBet(selectedColor, amount);
  };

  const handleCancel = () => {
    playClickSound();
    onCancelHedgeBet();
  };

  const isBettingDisabled = status === 'FLYING' || currentHedgeBet?.active;

  return (
    <div
      id="roulette-hedge-panel"
      className="relative rounded-2xl bg-gradient-to-b from-[#161c28] to-[#0f1420] border-2 border-amber-500/40 p-4 shadow-2xl overflow-hidden"
    >
      {/* Decorative top hedge ribbon */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm md:text-base text-white tracking-wide">
                {lang === 'ka' ? 'რულეტკის დაზღვევა' : 'ROULETTE HEDGE'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-slate-950">
                {lang === 'ka' ? 'ექსკლუზივი' : 'EXCLUSIVE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'ka'
                ? 'დააზღვიე ფსონი: მოიგე თუ ავიატორი ამ ფერის ზონაში ჩამოვარდება!'
                : 'Hedge your flight: win if the Aviator crashes in your chosen color zone!'}
            </p>
          </div>
        </div>

        {/* Info button */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setShowExplanation(!showExplanation);
          }}
          className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 rounded-lg transition-colors"
          title="როგორ მუშაობს დაზღვევა?"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Explanation drawer if clicked */}
      {showExplanation && (
        <div className="my-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed animate-in fade-in">
          <div className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{lang === 'ka' ? 'როგორ მუშაობს რულეტკის დაზღვევა?' : 'How does Roulette Hedging work?'}</span>
          </div>
          {lang === 'ka' ? (
            <p>
              ავიატორის აფრენისას რაკეტა გადის <strong>წითელ 🔴</strong> და <strong>შავ ⚫</strong> ზონებს.
              თუ თქვენ ავიატორზე დიდ კოეფიციენტს ელოდებით, მაგრამ გეშინიათ რომ 1.00x - 1.45x-ში (წითელ ზონაში) ჩამოვარდება — დადეთ დაზღვევა 🔴 წითელზე!
              თვითმფრინავი თუ წითელში ჩამოვარდა, თქვენი რულეტკის ფსონი <strong>2X</strong>-ით გადაიხდება და თქვენს ბალანსს გადაარჩენს!
            </p>
          ) : (
            <p>
              As the Aviator climbs, it passes through <strong>RED 🔴</strong> and <strong>BLACK ⚫</strong> altitude zones.
              If you aim for a high flight multiplier but want protection against an early crash, place a hedge on 🔴 RED or ⚫ BLACK!
              If it crashes in that color zone, your hedge pays <strong>2.0x</strong> immediately, covering your flight loss!
            </p>
          )}
        </div>
      )}

      {/* COLOR SELECTION BUTTONS (RED / BLACK / GREEN) */}
      <div className="grid grid-cols-3 gap-2.5 my-3.5">
        {/* RED (წითელი) */}
        <button
          type="button"
          disabled={Boolean(isBettingDisabled)}
          onClick={() => {
            playClickSound();
            setSelectedColor('RED');
          }}
          className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
            selectedColor === 'RED'
              ? 'bg-gradient-to-b from-red-600 to-red-800 border-red-400 text-white shadow-lg shadow-red-900/50 scale-[1.02]'
              : 'bg-red-950/40 border-red-900/50 text-red-200 hover:bg-red-900/40 hover:border-red-600'
          } ${isBettingDisabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="w-5 h-5 rounded-full bg-red-500 shadow-inner mb-1 flex items-center justify-center">
            {selectedColor === 'RED' && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="font-extrabold text-sm tracking-wide uppercase">
            {lang === 'ka' ? 'წითელი' : 'RED'}
          </span>
          <span className="text-[11px] font-mono font-bold text-amber-300">
            {ROULETTE_PAYOUTS.RED}x
          </span>
          <span className="text-[9px] text-slate-300 mt-0.5">
            {lang === 'ka' ? 'მოგება' : 'Payout'}
          </span>
        </button>

        {/* BLACK (შავი) */}
        <button
          type="button"
          disabled={Boolean(isBettingDisabled)}
          onClick={() => {
            playClickSound();
            setSelectedColor('BLACK');
          }}
          className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
            selectedColor === 'BLACK'
              ? 'bg-gradient-to-b from-slate-700 to-slate-900 border-slate-400 text-white shadow-lg shadow-black/70 scale-[1.02]'
              : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-500'
          } ${isBettingDisabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-600 shadow-inner mb-1 flex items-center justify-center">
            {selectedColor === 'BLACK' && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="font-extrabold text-sm tracking-wide uppercase">
            {lang === 'ka' ? 'შავი' : 'BLACK'}
          </span>
          <span className="text-[11px] font-mono font-bold text-amber-300">
            {ROULETTE_PAYOUTS.BLACK}x
          </span>
          <span className="text-[9px] text-slate-300 mt-0.5">
            {lang === 'ka' ? 'მოგება' : 'Payout'}
          </span>
        </button>

        {/* GREEN ZERO (მწვანე) */}
        <button
          type="button"
          disabled={Boolean(isBettingDisabled)}
          onClick={() => {
            playClickSound();
            setSelectedColor('GREEN');
          }}
          className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
            selectedColor === 'GREEN'
              ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 border-emerald-400 text-white shadow-lg shadow-emerald-900/50 scale-[1.02]'
              : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-200 hover:bg-emerald-900/40 hover:border-emerald-600'
          } ${isBettingDisabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500 shadow-inner mb-1 flex items-center justify-center">
            {selectedColor === 'GREEN' && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="font-extrabold text-sm tracking-wide uppercase">
            {lang === 'ka' ? 'მწვანე 0' : 'ZERO 0'}
          </span>
          <span className="text-[11px] font-mono font-bold text-emerald-300">
            {ROULETTE_PAYOUTS.GREEN}x
          </span>
          <span className="text-[9px] text-slate-300 mt-0.5">
            {lang === 'ka' ? 'სუპერ ჯეკპოტი' : 'Jackpot'}
          </span>
        </button>
      </div>

      {/* BET AMOUNT INPUT & CHIPS */}
      {!currentHedgeBet?.active ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 relative">
              <input
                id="roulette-hedge-amount-input"
                type="number"
                min="1"
                max={balance}
                step="1"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                disabled={status === 'FLYING'}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono font-bold text-base focus:outline-none focus:border-amber-500 pr-12"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                ₾ GEL
              </span>
            </div>

            {/* Potential Win Preview */}
            <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-right min-w-[110px]">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                {lang === 'ka' ? 'სავარაუდო მოგება' : 'Potential Win'}
              </span>
              <span className="font-mono font-extrabold text-amber-400 text-sm">
                {(amount * ROULETTE_PAYOUTS[selectedColor]).toFixed(2)} ₾
              </span>
            </div>
          </div>

          {/* Quick chip buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                disabled={status === 'FLYING'}
                onClick={() => {
                  playClickSound();
                  setAmount(q);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                  amount === q
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                +{q}
              </button>
            ))}
            <button
              type="button"
              disabled={status === 'FLYING'}
              onClick={() => {
                playClickSound();
                setAmount(Math.min(amount * 2, balance));
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700"
            >
              2X
            </button>
            <button
              type="button"
              disabled={status === 'FLYING'}
              onClick={() => {
                playClickSound();
                setAmount(Math.max(1, Math.floor(amount / 2)));
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700"
            >
              1/2
            </button>
          </div>

          {/* Action Button: PLACE HEDGE BET */}
          <button
            id="place-roulette-hedge-button"
            type="button"
            disabled={status === 'FLYING' || amount > balance || amount <= 0}
            onClick={handlePlace}
            className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all duration-200 ${
              status === 'FLYING' || amount > balance || amount <= 0
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:brightness-110 active:scale-[0.99] border border-amber-300 cursor-pointer shadow-amber-900/30'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>
              {lang === 'ka'
                ? `დაზღვევის დადება • ${amount} ₾`
                : `PLACE HEDGE BET • ${amount} GEL`}
            </span>
          </button>
        </div>
      ) : (
        /* ACTIVE HEDGE STATE */
        <div className="space-y-3 animate-in fade-in">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full animate-ping ${
                  currentHedgeBet.color === 'RED'
                    ? 'bg-red-500'
                    : currentHedgeBet.color === 'BLACK'
                    ? 'bg-slate-400'
                    : 'bg-emerald-400'
                }`}
              />
              <div>
                <span className="text-xs text-slate-400 font-medium block">
                  {lang === 'ka' ? 'აქტიური დაზღვევა' : 'Active Hedge'}
                </span>
                <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  {currentHedgeBet.color === 'RED' ? '🔴 RED' : currentHedgeBet.color === 'BLACK' ? '⚫ BLACK' : '🟢 GREEN'}
                  <span className="text-amber-400 font-mono">({currentHedgeBet.amount} ₾)</span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                {lang === 'ka' ? 'მოგების შანსი' : 'Win Payout'}
              </span>
              <span className="font-mono font-extrabold text-emerald-400 text-base">
                +{(currentHedgeBet.amount * currentHedgeBet.payoutMultiplier).toFixed(2)} ₾
              </span>
            </div>
          </div>

          {status !== 'FLYING' ? (
            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-2.5 rounded-xl text-xs font-bold uppercase bg-red-950/70 border border-red-700/60 text-red-300 hover:bg-red-900/80 transition-colors"
            >
              {lang === 'ka' ? 'დაზღვევის გაუქმება' : 'CANCEL HEDGE'}
            </button>
          ) : (
            <div className="text-center py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center justify-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>
                {lang === 'ka'
                  ? 'დაზღვევა აქტიურია! დაცული ხართ ამ ფერის ზონაში.'
                  : 'Hedge is active! Protected in your selected color zone.'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* RESULT BANNER (After crash) */}
      {status === 'CRASHED' && currentHedgeBet?.won !== null && currentHedgeBet?.won !== undefined && (
        <div
          className={`mt-3 p-3 rounded-xl border flex items-center gap-2.5 animate-in slide-in-from-bottom-2 ${
            currentHedgeBet.won
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-100'
              : 'bg-red-950/60 border-red-800/60 text-red-200'
          }`}
        >
          {currentHedgeBet.won ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold block text-emerald-300">
                  {lang === 'ka' ? '🎉 დაზღვევამ მოგიტანათ მოგება!' : '🎉 Hedge Bet Won!'}
                </span>
                <span>
                  {lang === 'ka'
                    ? `თვითმფრინავი ჩამოვარდა ${currentHedgeBet.color}-ში. თქვენ მიიღეთ +${currentHedgeBet.winAmount?.toFixed(2)} ₾!`
                    : `Crashed in ${currentHedgeBet.color}. You received +${currentHedgeBet.winAmount?.toFixed(2)} GEL!`}
                </span>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold block text-red-300">
                  {lang === 'ka' ? 'დაზღვევა არ დაჯდა' : 'Hedge did not hit'}
                </span>
                <span>
                  {lang === 'ka'
                    ? 'თვითმფრინავი სხვა ფერის ზონაში ჩამოვარდა.'
                    : 'The plane crashed in a different color zone.'}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
