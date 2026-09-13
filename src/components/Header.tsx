import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, Shield, PlusCircle, Globe, Share2 } from 'lucide-react';
import { playClickSound, isSoundEnabled, setSoundEnabled } from '../utils/audio';

interface HeaderProps {
  balance: number;
  onAddBalance: (amount: number) => void;
  lang: 'ka' | 'en';
  onToggleLang: () => void;
  onOpenRules: () => void;
  onOpenProvablyFair: () => void;
  onOpenShare: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  balance,
  onAddBalance,
  lang,
  onToggleLang,
  onOpenRules,
  onOpenProvablyFair,
  onOpenShare,
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    playClickSound();
  };

  return (
    <header className="w-full bg-[#0d121c] border-b border-slate-800/80 px-2.5 sm:px-4 py-2.5 flex items-center justify-between gap-1.5 sm:gap-2 shadow-lg">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg shadow-red-900/50">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 -rotate-45" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-900" />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base sm:text-xl text-white font-['Chakra_Petch',sans-serif] tracking-wider uppercase">
              AVIATOR <span className="text-red-500">ROULETTE</span>
            </span>
            <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
              {lang === 'ka' ? 'რულეტკის ზონები' : 'ROULETTE ZONES'}
            </span>
          </div>
          <p className="hidden sm:block text-[11px] text-slate-400 font-medium">
            {lang === 'ka' ? 'ქრაშ თამაში რულეტკის დაზღვევით' : 'Crash game with roulette hedging'}
          </p>
        </div>
      </div>

      {/* Right controls: Balance, Rules, Audio, Lang */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Balance Display & Deposit Button */}
        <div className="flex items-center bg-[#141a27] border border-slate-700/80 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 shadow-inner">
          <div className="flex flex-col text-right mr-1.5 sm:mr-2">
            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">
              {lang === 'ka' ? 'ბალანსი' : 'BALANCE'}
            </span>
            <span
              id="user-balance-display"
              className="font-mono font-extrabold text-xs sm:text-base text-emerald-400 tracking-tight"
            >
              {balance.toFixed(2)} ₾
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setShowDepositModal(true);
            }}
            title={lang === 'ka' ? 'ბალანსის შევსება' : 'Add Balance'}
            className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            onOpenShare();
          }}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white transition-all shadow-md shadow-red-950/50 border border-red-400/40 text-xs font-bold active:scale-95 cursor-pointer"
          title={lang === 'ka' ? 'ლინკის გაზიარება მეგობართან' : 'Share Link'}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">{lang === 'ka' ? 'გაზიარება' : 'Share'}</span>
        </button>

        {/* How To Play Button */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            onOpenRules();
          }}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
          title={lang === 'ka' ? 'წესები და ინსტრუქცია' : 'Game Rules'}
        >
          <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
          title={soundOn ? 'Mute' : 'Unmute'}
        >
          {soundOn ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />}
        </button>

        {/* Language Switch */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            onToggleLang();
          }}
          className="px-2 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 text-[11px] sm:text-xs font-bold"
        >
          {lang === 'ka' ? 'EN' : 'GE'}
        </button>
      </div>

      {/* Deposit / Reload Credits Modal */}

      {showDepositModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111724] border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-extrabold text-base text-white mb-1">
              {lang === 'ka' ? 'დემო ბალანსის შევსება' : 'Add Demo Balance'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {lang === 'ka'
                ? 'აირჩიეთ თანხა თქვენი ბალანსის გასაზრდელად:'
                : 'Select amount to add to your balance:'}
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[50, 100, 250, 500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onAddBalance(amt);
                    setShowDepositModal(false);
                  }}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 font-mono font-bold text-sm text-white transition-colors border border-slate-700 hover:border-emerald-400"
                >
                  +{amt} ₾
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowDepositModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-xs uppercase transition-colors"
            >
              {lang === 'ka' ? 'დახურვა' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
