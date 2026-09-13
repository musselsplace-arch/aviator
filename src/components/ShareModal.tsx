import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink, MessageCircle, Send } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ka' | 'en';
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, lang }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // The permanent public share link for this app
  const shareUrl = 'https://ais-pre-v2lxsfueeynia63shmdeye-73840619239.europe-west1.run.app';

  const handleCopy = async () => {
    playClickSound();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers / iframe restrictions
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: select the text in the input
      const input = document.getElementById('share-link-input') as HTMLInputElement;
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const shareText = lang === 'ka'
    ? 'შემოდი და ითამაშე Aviator Roulette Crash: ' + shareUrl
    : 'Play Aviator Roulette Crash with me: ' + shareUrl;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#111724] border border-slate-700 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white font-['Chakra_Petch',sans-serif]">
                {lang === 'ka' ? 'თამაშის გაზიარება მეგობართან' : 'Share Game With Friends'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ka' ? 'გაუგზავნეთ პირდაპირი ლინკი' : 'Send direct playable link'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 my-5">
          {/* Important Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
            <p className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {lang === 'ka' ? 'მნიშვნელოვანი: ლინკის გააქტიურება' : 'Important: Link Activation'}
            </p>
            <p>
              {lang === 'ka'
                ? 'ეს ლინკი გააქტიურდება და მეგობრებთან გაიხსნება მას შემდეგ, რაც Google AI Studio-ს ზედა მარჯვენა კუთხეში დააჭერთ ღილაკს „Share“ და დაადასტურებთ გამოქვეყნებას.'
                : 'This public link becomes active once you click the "Share" button at the top right of Google AI Studio and confirm publishing.'}
            </p>
          </div>

          {/* Instructions */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {lang === 'ka' ? (
              <>
                <p className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  ნაბიჯ-ნაბიჯ ინსტრუქცია:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>დააჭირეთ ეკრანის ზედა მარჯვენა კუთხეში <strong>Share</strong> ღილაკს.</li>
                  <li>დააკოპირეთ ქვემოთ მოცემული საჯარო ლინკი.</li>
                  <li>გაუგზავნეთ მეგობარს — ის მაშინვე შეძლებს თამაშს!</li>
                </ol>
              </>
            ) : (
              <>
                <p className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Step-by-step instructions:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Click the <strong>Share</strong> button at the top right of Google AI Studio.</li>
                  <li>Copy the public URL below.</li>
                  <li>Send it to your friend — they can play immediately!</li>
                </ol>
              </>
            )}
          </div>

          {/* Copyable Link Field */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>{lang === 'ka' ? 'საჯარო ლინკი (Shared URL):' : 'Public Link (Shared URL):'}</span>
              {copied && (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  {lang === 'ka' ? 'დაკოპირდა!' : 'Copied!'}
                </span>
              )}
            </label>

            <div className="flex items-center gap-2">
              <input
                id="share-link-input"
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 bg-[#090d16] border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-mono text-amber-300 select-all outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white border border-emerald-400'
                    : 'bg-red-600 hover:bg-red-500 text-white border border-red-500 shadow-lg shadow-red-900/40 active:scale-95'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (lang === 'ka' ? 'კოპირებულია' : 'Copied') : (lang === 'ka' ? 'კოპირება' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Quick Messenger Share Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#229ED9]/20 hover:bg-[#229ED9]/30 border border-[#229ED9]/40 text-[#229ED9] text-xs font-bold transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Telegram</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-bold transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* AI Studio Share Tip */}
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              {lang === 'ka'
                ? 'ასევე Google AI Studio-ს ზედა მარჯვენა კუთხეში შეგიძლიათ დააჭიროთ ღილაკს "Share" აპლიკაციის ოფიციალური გაზიარებისთვის.'
                : 'You can also click the "Share" button at the top right of Google AI Studio to share or publish the app.'}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-xs uppercase transition-colors"
        >
          {lang === 'ka' ? 'დახურვა' : 'Close'}
        </button>
      </div>
    </div>
  );
};
