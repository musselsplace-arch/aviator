import React from 'react';
import { X, ShieldCheck, Flame, Compass, CheckCircle2 } from 'lucide-react';
import { COLOR_ZONES } from '../utils/gameZones';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ka' | 'en';
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#101522] border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0c101a]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white font-['Chakra_Petch',sans-serif]">
                {lang === 'ka' ? 'თამაშის წესები და რულეტკის დაზღვევა' : 'Game Rules & Roulette Hedging'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ka' ? 'ინოვაციური ჰიბრიდული ქრაშ გეიმი' : 'Innovative Hybrid Aviator Crash Game'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm text-slate-300 leading-relaxed no-scrollbar">
          {/* 1. Classic Aviator Core */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Flame className="w-5 h-5 text-red-500" />
              <span>{lang === 'ka' ? '1. როგორ მუშაობს ავიატორი (Crash Game)?' : '1. How Aviator Crash Works'}</span>
            </div>
            <p className="text-xs text-slate-300">
              {lang === 'ka'
                ? 'თვითმფრინავი იწყებს აფრენას 1.00x კოეფიციენტიდან და თანდათან ადის მაღლა. თქვენი ამოცანაა დააჭიროთ "განაღდებას" (CASH OUT) მანამ, სანამ ავიატორი გაფრინდება (ჩამოვარდება). თუ მოასწარით, იგებთ თქვენს ფსონს გამრავლებულს მიმდინარე კოეფიციენტზე.'
                : 'The aircraft takes off starting at 1.00x multiplier and climbs higher. Your goal is to click CASH OUT before the plane flies away. If you cash out in time, you win your bet multiplied by the current flight multiplier.'}
            </p>
          </div>

          {/* 2. Roulette Hedging Innovation */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-900/80 border-2 border-amber-500/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-base">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <span>{lang === 'ka' ? '2. რულეტკის ფერების ზონები და დაზღვევა' : '2. Roulette Color Zones & Hedging'}</span>
            </div>
            <p className="text-xs text-amber-100/90 leading-normal">
              {lang === 'ka'
                ? 'ეს არის უნიკალური ფუნქცია! თვითმფრინავის ფრენის გზა დაყოფილია რულეტკის ფერებად: წითელ 🔴 და შავ ⚫ ზონებად (ასევე იშვიათ მწვანე 🟢 ნულოვან ზონად). მომხმარებელს შეუძლია პარალელურად დადოს ფსონი ფერზე და დააზღვიოს თავისი ავიატორის ფსონი!'
                : 'This is the signature innovation! The flight altitude path is divided into Roulette color zones: RED 🔴 and BLACK ⚫ (with occasional GREEN 🟢 Zero bonus sectors). You can simultaneously place a hedge bet on a color to protect your crash risk!'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-center">
                <span className="text-xl">🔴</span>
                <span className="block font-bold text-white text-xs mt-1">
                  {lang === 'ka' ? 'წითელი ზონა' : 'RED ZONE'}
                </span>
                <span className="text-amber-400 font-mono font-bold text-xs">2.0x Payout</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-center">
                <span className="text-xl">⚫</span>
                <span className="block font-bold text-white text-xs mt-1">
                  {lang === 'ka' ? 'შავი ზონა' : 'BLACK ZONE'}
                </span>
                <span className="text-amber-400 font-mono font-bold text-xs">2.0x Payout</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center">
                <span className="text-xl">🟢</span>
                <span className="block font-bold text-white text-xs mt-1">
                  {lang === 'ka' ? 'მწვანე (Zero 0)' : 'GREEN ZERO 0'}
                </span>
                <span className="text-emerald-300 font-mono font-bold text-xs">14.0x Payout</span>
              </div>
            </div>
          </div>

          {/* 3. Practical Example of Strategy */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-200">
              {lang === 'ka' ? '💡 სტრატეგიული დაზღვევის მაგალითი:' : '💡 Strategic Hedging Example:'}
            </h4>
            <ul className="text-xs space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {lang === 'ka'
                    ? 'თქვენ დებთ 20 ₾-ს ავიატორზე და მიზნად გაქვთ მაღალი 5.00x კოეფიციენტი.'
                    : 'You bet 20 GEL on Aviator aiming for a high 5.00x cashout target.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {lang === 'ka'
                    ? 'პარალელურად დებთ 10 ₾-ს რულეტკის დაზღვევაზე 🔴 წითელ ფერზე (რომელიც მოიცავს პირველ 1.00x - 1.45x ზონას).'
                    : 'Simultaneously, you place 10 GEL on Roulette Hedge 🔴 RED (which covers the initial 1.00x - 1.45x zone).'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {lang === 'ka'
                    ? 'თუ ავიატორი ადრეულად ჩამოვარდა (მაგ. 1.25x-ზე), თქვენი ავიატორის ფსონი იკარგება, მაგრამ რულეტკის დაზღვევა იგებს 2x-ს (10 ₾ × 2 = 20 ₾) და თქვენი ბალანსი დაცულია!'
                    : 'If the Aviator crashes early at 1.25x, your flight bet is lost, but your RED hedge wins 2.0x (10 GEL × 2 = 20 GEL), protecting your funds!'}
                </span>
              </li>
            </ul>
          </div>

          {/* 4. Altitude Zone Spectrum Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              {lang === 'ka' ? 'ფრენის სიმაღლის ზონების ცხრილი' : 'Altitude Zone Range Spectrum'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {COLOR_ZONES.slice(0, 8).map((zone) => (
                <div
                  key={zone.index}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center font-mono ${
                    zone.color === 'RED'
                      ? 'bg-red-950/40 border-red-500/40 text-red-200'
                      : zone.color === 'BLACK'
                      ? 'bg-slate-900 border-slate-700 text-slate-300'
                      : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                  }`}
                >
                  <span className="text-base">{zone.color === 'RED' ? '🔴' : zone.color === 'BLACK' ? '⚫' : '🟢'}</span>
                  <span className="font-bold text-[11px] mt-1 text-white">
                    {zone.minMultiplier.toFixed(2)}x - {zone.maxMultiplier.toFixed(2)}x
                  </span>
                  <span className="text-[10px] opacity-75">
                    {lang === 'ka' ? zone.labelKa : zone.labelEn}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0c101a]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wider uppercase transition-colors"
          >
            {lang === 'ka' ? 'გასაგებია, თამაშის გაგრძელება' : 'Got it, Let\'s Play'}
          </button>
        </div>
      </div>
    </div>
  );
};
