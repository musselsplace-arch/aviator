import React from 'react';
import { X, Shield, Lock, CheckCircle2, RefreshCw } from 'lucide-react';

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ka' | 'en';
}

export const ProvablyFairModal: React.FC<ProvablyFairModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#101522] border border-slate-700 rounded-3xl max-w-lg w-full p-5 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {lang === 'ka' ? 'Provably Fair (სამართლიანობის გარანტია)' : 'Provably Fair System'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ka' ? 'კრიპტოგრაფიული გამჭვირვალობა' : 'Cryptographic Randomness'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 my-4 text-xs text-slate-300">
          <p>
            {lang === 'ka'
              ? 'თითოეული რაუნდის კოეფიციენტი და რულეტკის მომგებიანი ფერი გენერირდება სერვერის და კლიენტის კრიპტოგრაფიული ჰეშების კომბინაციით რაუნდის დაწყებამდე. შედეგის შეცვლა თამაშის მსვლელობისას შეუძლებელია.'
              : 'Every round multiplier and roulette crash color is generated cryptographically using combined server and client seeds before takeoff. The outcome cannot be manipulated during the flight.'}
          </p>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Server Seed (SHA-256):</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {lang === 'ka' ? 'აქტიური' : 'Active'}
              </span>
            </div>
            <p className="font-mono text-[10px] text-slate-300 bg-black/50 p-2 rounded break-all border border-slate-800">
              a7f92b498d249f032e5b8d27a1c3f848937e2a9b6c10398f5a28c39e14a87b1c
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Client Seed:</span>
              <span className="text-amber-400 font-bold font-mono">000000000000000000045f9a</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'ka'
                ? 'შემთხვევითი რიცხვების გენერატორი დაფუძნებულია საერთაშორისო კაზინოს სტანდარტებზე.'
                : 'RNG conforms with standard crash game provably fair specifications.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs uppercase transition-colors"
        >
          {lang === 'ka' ? 'დახურვა' : 'Close'}
        </button>
      </div>
    </div>
  );
};
