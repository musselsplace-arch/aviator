import React, { useState, useRef, useEffect } from 'react';
import { GameStatus, LivePlayerBet, ChatMessage } from '../types';
import { Users, User, Trophy, Shield, MessageSquare, Send, Check } from 'lucide-react';
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
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  lang: 'ka' | 'en';
}

export const LiveBetsSidebar: React.FC<LiveBetsSidebarProps> = ({
  status,
  multiplier,
  livePlayers,
  myHistory,
  chatMessages,
  onSendMessage,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY' | 'TOP' | 'CHAT'>('ALL');
  const [inputMessage, setInputMessage] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const totalBetAmount = livePlayers.reduce((acc, p) => acc + p.amount + (p.hedgeAmount || 0), 0);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'CHAT' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;
    playClickSound();
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleQuickEmoji = (emoji: string) => {
    playClickSound();
    onSendMessage(emoji);
  };

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
          className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'ALL'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">{lang === 'ka' ? 'ფსონები' : 'Bets'}</span>
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
          className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'MY'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>{lang === 'ka' ? 'ჩემი' : 'My'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('TOP');
          }}
          className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'TOP'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'ka' ? 'ტოპ' : 'Top'}</span>
        </button>

        {/* Feature 2: LIVE CHAT TAB */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('CHAT');
          }}
          className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'CHAT'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          <span>{lang === 'ka' ? 'ჩათი' : 'Chat'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Stats sub-bar */}
      {activeTab === 'ALL' && (
        <div className="px-3 py-1.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>{lang === 'ka' ? 'მოთამაშეები:' : 'Players:'} <strong className="text-white font-mono">{livePlayers.length}</strong></span>
          <span>{lang === 'ka' ? 'ბანკი:' : 'Pool:'} <strong className="text-amber-400 font-mono">{totalBetAmount.toFixed(0)} ₾</strong></span>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar max-h-[340px] lg:max-h-[560px]">
        {/* ALL BETS TAB */}
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
                  <div className="flex items-center gap-2">
                    <span className="text-base">{player.avatar}</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-200">{player.username}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {player.amount} ₾
                        {player.hedgeColor && (
                          <span className="ml-1 text-amber-300 font-bold">
                            + {player.hedgeColor}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {isCashed ? (
                      <div>
                        <span className="font-mono font-bold text-emerald-400 block">
                          {player.cashoutMultiplier?.toFixed(2)}x
                        </span>
                        <span className="text-[10px] font-mono text-emerald-300 font-semibold">
                          +{winValue.toFixed(2)} ₾
                        </span>
                      </div>
                    ) : status === 'FLYING' ? (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px] animate-pulse">
                        {lang === 'ka' ? 'ფრენაშია...' : 'Flying...'}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono text-[10px]">
                        {lang === 'ka' ? 'მოლოდინი' : 'Waiting'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* MY BETS TAB */}
        {activeTab === 'MY' && (
          <>
            {myHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                {lang === 'ka' ? 'თქვენი ფსონების ისტორია ცარიელია' : 'No personal round history yet'}
              </div>
            ) : (
              myHistory.map((item, idx) => {
                const totalWin = (item.payout || 0) + (item.hedgePayout || 0);
                const isNetWin = totalWin > item.betAmount;

                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#121824] border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>#{item.roundNumber}</span>
                      <span>{item.betAmount.toFixed(2)} ₾</span>
                    </div>

                    <div className="flex items-center justify-between font-bold">
                      <span>{lang === 'ka' ? 'შედეგი:' : 'Result:'}</span>
                      <span className={`font-mono ${isNetWin ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isNetWin ? `+${totalWin.toFixed(2)} ₾` : 'წაგება'}
                      </span>
                    </div>

                    {item.hedgeColor && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                        <span className="flex items-center gap-1 text-amber-300">
                          <Shield className="w-3 h-3 text-amber-400" />
                          {item.hedgeColor}
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

        {/* TOP WINS TAB */}
        {activeTab === 'TOP' && (
          <div className="space-y-1.5">
            {[
              { mult: 84.50, user: 'GeoSniper', win: '4,225 ₾', date: 'დღეს' },
              { mult: 42.10, user: 'TbilisiPilot', win: '2,105 ₾', date: 'დღეს' },
              { mult: 29.80, user: 'KutaisiKing', win: '1,490 ₾', date: 'დღეს' },
              { mult: 18.20, user: 'BatumiLucky', win: '910 ₾', date: 'გუშინ' },
              { mult: 14.00, user: 'ZeroMaster (Green)', win: '1,400 ₾', date: 'გუშინ' },
            ].map((top, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl bg-gradient-to-r from-amber-950/20 to-slate-900 border border-amber-500/20 flex items-center justify-between text-xs"
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

        {/* CHAT TAB (Feature 2) */}
        {activeTab === 'CHAT' && (
          <div className="flex flex-col h-full space-y-2">
            <div className="space-y-2">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-xl text-xs flex items-start gap-2 ${
                    msg.isWin
                      ? 'bg-amber-950/30 border border-amber-500/40 text-amber-200'
                      : 'bg-slate-900/70 border border-slate-800/80 text-slate-200'
                  }`}
                >
                  <span className="text-sm shrink-0">{msg.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300 text-[11px]">{msg.username}</span>
                      <span className="text-[10px] text-slate-500">{msg.time}</span>
                    </div>
                    <p className="text-slate-200 text-xs mt-0.5 break-words">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* CHAT INPUT AREA (Only visible in CHAT tab) */}
      {activeTab === 'CHAT' && (
        <div className="p-2 border-t border-slate-800 bg-[#090d16] space-y-1.5">
          {/* Quick Reaction Emojis */}
          <div className="flex items-center justify-between px-1">
            {['🚀', '🔥', '😱', '💸', '🍀', '💔'].map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => handleQuickEmoji(em)}
                className="text-base hover:scale-125 active:scale-95 transition-transform cursor-pointer"
              >
                {em}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder={lang === 'ka' ? 'დაწერეთ შეტყობინება...' : 'Write message...'}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-[#121824] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
