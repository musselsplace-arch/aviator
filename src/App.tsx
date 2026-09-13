import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStatus, RouletteColor, AviatorBet, RouletteHedgeBet, RoundHistoryItem, LivePlayerBet } from './types';
import { COLOR_ZONES, getColorZone, generateCrashMultiplier, ROULETTE_PAYOUTS } from './utils/gameZones';
import {
  initSoundPreference,
  startEngineSound,
  updateEnginePitch,
  stopEngineSound,
  playCrashSound,
  playCashoutSound,
  playRouletteWin,
  playZoneShift,
  playCountdownTick,
} from './utils/audio';

import { Header } from './components/Header';
import { FlightCanvas } from './components/FlightCanvas';
import { AviatorBetPanel } from './components/AviatorBetPanel';
import { RouletteHedgePanel } from './components/RouletteHedgePanel';
import { RoundHistoryBar } from './components/RoundHistoryBar';
import { LiveBetsSidebar } from './components/LiveBetsSidebar';
import { RulesModal } from './components/RulesModal';
import { ProvablyFairModal } from './components/ProvablyFairModal';

// Initial realistic simulated history
const INITIAL_HISTORY: RoundHistoryItem[] = [
  { id: 'r1', roundNumber: 1402, crashMultiplier: 2.34, crashColor: 'RED', crashZoneLabel: 'Red Zone 2', timestamp: Date.now() - 60000, serverSeedHash: '7a9c8b6e2d1f438901acde' },
  { id: 'r2', roundNumber: 1403, crashMultiplier: 1.22, crashColor: 'RED', crashZoneLabel: 'Red Zone 1', timestamp: Date.now() - 48000, serverSeedHash: 'f489b02a6c8e31048e91ac' },
  { id: 'r3', roundNumber: 1404, crashMultiplier: 4.85, crashColor: 'RED', crashZoneLabel: 'Red Zone 3', timestamp: Date.now() - 36000, serverSeedHash: '8b10ca4e723901bce471d2' },
  { id: 'r4', roundNumber: 1405, crashMultiplier: 1.82, crashColor: 'BLACK', crashZoneLabel: 'Black Zone 1', timestamp: Date.now() - 24000, serverSeedHash: '20cba48719283e10fa789b' },
  { id: 'r5', roundNumber: 1406, crashMultiplier: 14.50, crashColor: 'RED', crashZoneLabel: 'Red Zone 4', timestamp: Date.now() - 12000, serverSeedHash: 'de4710bc892a01f487ac29' },
  { id: 'r6', roundNumber: 1407, crashMultiplier: 3.40, crashColor: 'BLACK', crashZoneLabel: 'Black Zone 2', timestamp: Date.now() - 6000, serverSeedHash: '6b409ea172cf91082c5a01' },
];

const INITIAL_BOT_NAMES = [
  { name: 'Nika_Geo', avatar: '🦁' },
  { name: 'Gigi_Pilot', avatar: '🚀' },
  { name: 'Keti_99', avatar: '🦊' },
  { name: 'Luka_Tbilisi', avatar: '🦅' },
  { name: 'David_G', avatar: '🐯' },
  { name: 'Mariam_M', avatar: '🐱' },
  { name: 'Sandro_Ace', avatar: '🎯' },
  { name: 'Bacho_VIP', avatar: '👑' },
  { name: 'Goga_Rocket', avatar: '⚡' },
  { name: 'Tornike_K', avatar: '🐺' },
  { name: 'Ana_Lucky', avatar: '🍀' },
  { name: 'Irakli_X', avatar: '🔥' },
];

export default function App() {
  // Localization: Georgian by default as requested
  const [lang, setLang] = useState<'ka' | 'en'>('ka');

  // Modals
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showProvablyFair, setShowProvablyFair] = useState<boolean>(false);

  // Balance (stored locally)
  const [balance, setBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aviator_user_balance');
      return saved ? Number(saved) : 1000.0;
    } catch {
      return 1000.0;
    }
  });

  // Game Engine State
  const [status, setStatus] = useState<GameStatus>('COUNTDOWN');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [countdown, setCountdown] = useState<number>(5);
  const [targetCrashMultiplier, setTargetCrashMultiplier] = useState<number>(2.4);
  const [lastCrashMultiplier, setLastCrashMultiplier] = useState<number | null>(null);
  const [lastCrashColor, setLastCrashColor] = useState<RouletteColor | null>(null);
  const [roundNumber, setRoundNumber] = useState<number>(1408);

  // History
  const [history, setHistory] = useState<RoundHistoryItem[]>(INITIAL_HISTORY);
  const [myRoundHistory, setMyRoundHistory] = useState<{
    roundNumber: number;
    betAmount: number;
    cashoutMultiplier: number | null;
    payout: number;
    hedgeColor: string | null;
    hedgeWon: boolean | null;
    hedgePayout: number;
  }[]>([]);

  // Betting States
  const [bet1, setBet1] = useState<AviatorBet>({
    id: 'bet-1',
    amount: 10,
    active: false,
    autoCashout: false,
    autoCashoutMultiplier: 2.0,
    cashedOut: false,
    cashoutMultiplier: null,
    winAmount: null,
  });

  const [bet2, setBet2] = useState<AviatorBet>({
    id: 'bet-2',
    amount: 10,
    active: false,
    autoCashout: false,
    autoCashoutMultiplier: 3.0,
    cashedOut: false,
    cashoutMultiplier: null,
    winAmount: null,
  });

  // Roulette Hedging Bet
  const [hedgeBet, setHedgeBet] = useState<RouletteHedgeBet | null>(null);

  // Simulated Live Multiplayer Bets
  const [livePlayers, setLivePlayers] = useState<LivePlayerBet[]>([]);

  // Sound init
  useEffect(() => {
    initSoundPreference();
  }, []);

  // Save balance
  useEffect(() => {
    try {
      localStorage.setItem('aviator_user_balance', balance.toString());
    } catch {
      // ignore
    }
  }, [balance]);

  // Generate simulated live players for a round
  const generateLivePlayers = useCallback((): LivePlayerBet[] => {
    return INITIAL_BOT_NAMES.map((bot, index) => {
      const betAmt = [5, 10, 20, 50, 100, 250][Math.floor(Math.random() * 6)];
      // Random target cashout between 1.20 and 8.00
      const targetCash = Math.floor((1.15 + Math.random() * 5.0) * 100) / 100;
      // 50% also place a roulette color hedge
      const hasHedge = Math.random() > 0.4;
      const hedgeColor: RouletteColor | null = hasHedge
        ? Math.random() > 0.5
          ? 'RED'
          : Math.random() > 0.1
          ? 'BLACK'
          : 'GREEN'
        : null;
      const hedgeAmount = hasHedge ? Math.max(5, Math.floor(betAmt * 0.5)) : null;

      return {
        id: `bot-${index}`,
        username: bot.name,
        avatar: bot.avatar,
        amount: betAmt,
        cashoutMultiplier: targetCash,
        cashedOut: false,
        hedgeColor,
        hedgeAmount,
        hedgeWon: null,
      };
    });
  }, []);

  // Tracking current color zone for zone transition sounds
  const lastColorZoneRef = useRef<RouletteColor>('RED');

  // Start new round countdown
  const startNewRoundCountdown = useCallback(() => {
    setStatus('COUNTDOWN');
    setCountdown(5);
    setMultiplier(1.0);

    // Reset bets for new round (keep amounts intact)
    setBet1((prev) => ({
      ...prev,
      active: false,
      cashedOut: false,
      cashoutMultiplier: null,
      winAmount: null,
    }));

    setBet2((prev) => ({
      ...prev,
      active: false,
      cashedOut: false,
      cashoutMultiplier: null,
      winAmount: null,
    }));

    setHedgeBet(null);
    setLivePlayers(generateLivePlayers());
  }, [generateLivePlayers]);

  // Countdown timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'COUNTDOWN') {
      if (countdown > 0) {
        timer = setTimeout(() => {
          playCountdownTick();
          setCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        // Takeoff!
        const nextCrash = generateCrashMultiplier();
        setTargetCrashMultiplier(nextCrash);
        setStatus('FLYING');
        setMultiplier(1.0);
        lastColorZoneRef.current = 'RED';
        startEngineSound();
      }
    }
    return () => clearTimeout(timer);
  }, [status, countdown]);

  // Flight multiplier physics loop
  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();

    if (status === 'FLYING') {
      const flightLoop = (now: number) => {
        const delta = (now - lastTime) / 1000;
        lastTime = now;

        setMultiplier((prev) => {
          // Multiplier climbs at an accelerating rate matching standard crash curves
          // Speed formula: grows proportional to current altitude
          const speedFactor = 0.08 + Math.log(prev + 0.1) * 0.18;
          const nextVal = prev + speedFactor * delta * (1 + prev * 0.15);

          // Update engine audio pitch
          updateEnginePitch(nextVal);

          // Check if crossed into a new color zone!
          const currentZone = getColorZone(nextVal);
          if (currentZone.color !== lastColorZoneRef.current) {
            playZoneShift(currentZone.color);
            lastColorZoneRef.current = currentZone.color;
          }

          // Check Auto-Cashout for Bet 1
          setBet1((b1) => {
            if (b1.active && !b1.cashedOut && b1.autoCashout && nextVal >= b1.autoCashoutMultiplier) {
              const win = b1.amount * b1.autoCashoutMultiplier;
              setBalance((bal) => bal + win);
              playCashoutSound();
              return {
                ...b1,
                cashedOut: true,
                cashoutMultiplier: b1.autoCashoutMultiplier,
                winAmount: win,
              };
            }
            return b1;
          });

          // Check Auto-Cashout for Bet 2
          setBet2((b2) => {
            if (b2.active && !b2.cashedOut && b2.autoCashout && nextVal >= b2.autoCashoutMultiplier) {
              const win = b2.amount * b2.autoCashoutMultiplier;
              setBalance((bal) => bal + win);
              playCashoutSound();
              return {
                ...b2,
                cashedOut: true,
                cashoutMultiplier: b2.autoCashoutMultiplier,
                winAmount: win,
              };
            }
            return b2;
          });

          // Check simulated live players cashouts
          setLivePlayers((bots) =>
            bots.map((bot) => {
              if (!bot.cashedOut && bot.cashoutMultiplier && nextVal >= bot.cashoutMultiplier) {
                return { ...bot, cashedOut: true };
              }
              return bot;
            })
          );

          // Check Crash Condition
          if (nextVal >= targetCrashMultiplier) {
            // CRASH OCCURRED!
            stopEngineSound();
            playCrashSound();

            const finalCrash = targetCrashMultiplier;
            const finalZone = getColorZone(finalCrash);
            const crashColor = finalZone.color;

            setLastCrashMultiplier(finalCrash);
            setLastCrashColor(crashColor);
            setStatus('CRASHED');

            // Evaluate Roulette Hedge Bet (The Key Feature!)
            setHedgeBet((currHedge) => {
              if (currHedge && currHedge.active) {
                const won = currHedge.color === crashColor;
                const winAmount = won ? currHedge.amount * currHedge.payoutMultiplier : 0;
                if (won) {
                  setBalance((bal) => bal + winAmount);
                  playRouletteWin();
                }
                return {
                  ...currHedge,
                  won,
                  winAmount,
                };
              }
              return currHedge;
            });

            // Update live players hedge results
            setLivePlayers((bots) =>
              bots.map((bot) => {
                if (bot.hedgeColor) {
                  return { ...bot, hedgeWon: bot.hedgeColor === crashColor };
                }
                return bot;
              })
            );

            // Record History
            const newHistoryItem: RoundHistoryItem = {
              id: `r-${Date.now()}`,
              roundNumber: roundNumber,
              crashMultiplier: finalCrash,
              crashColor: crashColor,
              crashZoneLabel: lang === 'ka' ? finalZone.labelKa : finalZone.labelEn,
              timestamp: Date.now(),
              serverSeedHash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
            };

            setHistory((prevH) => [newHistoryItem, ...prevH]);
            setRoundNumber((r) => r + 1);

            // Record player personal round history if any bet was active
            setBet1((b1) => {
              setBet2((b2) => {
                setHedgeBet((hb) => {
                  if (b1.active || b2.active || (hb && hb.active)) {
                    const totalBet = (b1.active ? b1.amount : 0) + (b2.active ? b2.amount : 0) + (hb?.active ? hb.amount : 0);
                    const totalAviatorPayout = (b1.cashedOut ? (b1.winAmount || 0) : 0) + (b2.cashedOut ? (b2.winAmount || 0) : 0);
                    const isHedgeWon = hb?.active && hb.color === crashColor;
                    const hedgePayout = isHedgeWon ? (hb.amount * hb.payoutMultiplier) : 0;

                    setMyRoundHistory((prevMy) => [
                      {
                        roundNumber: roundNumber,
                        betAmount: totalBet,
                        cashoutMultiplier: b1.cashedOut ? b1.cashoutMultiplier : b2.cashedOut ? b2.cashoutMultiplier : null,
                        payout: totalAviatorPayout,
                        hedgeColor: hb?.active ? hb.color : null,
                        hedgeWon: isHedgeWon,
                        hedgePayout: hedgePayout,
                      },
                      ...prevMy,
                    ]);
                  }
                  return hb;
                });
                return b2;
              });
              return b1;
            });

            // Schedule transition to next round after 3.5 seconds
            setTimeout(() => {
              startNewRoundCountdown();
            }, 3500);

            return finalCrash;
          }

          return nextVal;
        });

        animationFrame = requestAnimationFrame(flightLoop);
      };

      animationFrame = requestAnimationFrame(flightLoop);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [status, targetCrashMultiplier, roundNumber, lang, startNewRoundCountdown]);

  // Bet 1 Placed
  const handlePlaceBet1 = (amount: number, autoCashout: boolean, autoMultiplier: number) => {
    if (amount > balance) return;
    setBalance((prev) => prev - amount);
    setBet1({
      id: 'bet-1',
      amount,
      active: true,
      autoCashout,
      autoCashoutMultiplier: autoMultiplier,
      cashedOut: false,
      cashoutMultiplier: null,
      winAmount: null,
    });
  };

  // Bet 1 Cancelled
  const handleCancelBet1 = () => {
    if (bet1.active && status !== 'FLYING') {
      setBalance((prev) => prev + bet1.amount);
      setBet1((prev) => ({ ...prev, active: false }));
    }
  };

  // Bet 1 Cashout
  const handleCashoutBet1 = () => {
    if (bet1.active && !bet1.cashedOut && status === 'FLYING') {
      const win = bet1.amount * multiplier;
      setBalance((prev) => prev + win);
      playCashoutSound();
      setBet1((prev) => ({
        ...prev,
        cashedOut: true,
        cashoutMultiplier: multiplier,
        winAmount: win,
      }));
    }
  };

  // Bet 2 Placed
  const handlePlaceBet2 = (amount: number, autoCashout: boolean, autoMultiplier: number) => {
    if (amount > balance) return;
    setBalance((prev) => prev - amount);
    setBet2({
      id: 'bet-2',
      amount,
      active: true,
      autoCashout,
      autoCashoutMultiplier: autoMultiplier,
      cashedOut: false,
      cashoutMultiplier: null,
      winAmount: null,
    });
  };

  // Bet 2 Cancelled
  const handleCancelBet2 = () => {
    if (bet2.active && status !== 'FLYING') {
      setBalance((prev) => prev + bet2.amount);
      setBet2((prev) => ({ ...prev, active: false }));
    }
  };

  // Bet 2 Cashout
  const handleCashoutBet2 = () => {
    if (bet2.active && !bet2.cashedOut && status === 'FLYING') {
      const win = bet2.amount * multiplier;
      setBalance((prev) => prev + win);
      playCashoutSound();
      setBet2((prev) => ({
        ...prev,
        cashedOut: true,
        cashoutMultiplier: multiplier,
        winAmount: win,
      }));
    }
  };

  // Roulette Hedge Bet Placed
  const handlePlaceHedgeBet = (color: RouletteColor, amount: number) => {
    if (amount > balance) return;
    setBalance((prev) => prev - amount);
    setHedgeBet({
      active: true,
      amount,
      color,
      won: null,
      winAmount: null,
      payoutMultiplier: ROULETTE_PAYOUTS[color],
    });
  };

  // Roulette Hedge Bet Cancelled
  const handleCancelHedgeBet = () => {
    if (hedgeBet && hedgeBet.active && status !== 'FLYING') {
      setBalance((prev) => prev + hedgeBet.amount);
      setHedgeBet(null);
    }
  };

  // Deposit funds
  const handleAddBalance = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-['Outfit',sans-serif]">
      {/* App Header */}
      <Header
        balance={balance}
        onAddBalance={handleAddBalance}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'ka' ? 'en' : 'ka'))}
        onOpenRules={() => setShowRules(true)}
        onOpenProvablyFair={() => setShowProvablyFair(true)}
      />

      {/* Main Game Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 flex flex-col gap-3">
        {/* Past Rounds Multiplier History Bar */}
        <RoundHistoryBar history={history} lang={lang} />

        {/* Layout Grid: Flight Screen + Betting Controls + Live Bets Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left / Center Area: Flight Canvas & All Betting Panels */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-3">
            {/* The Flight Visualizer Canvas */}
            <FlightCanvas
              status={status}
              multiplier={multiplier}
              countdown={countdown}
              crashMultiplier={lastCrashMultiplier}
              crashColor={lastCrashColor}
              selectedHedgeColor={hedgeBet?.color || null}
              isHedgeActive={Boolean(hedgeBet?.active)}
              lang={lang}
            />

            {/* THE INNOVATIVE ROULETTE HEDGING PANEL (CENTER STAGE) */}
            <RouletteHedgePanel
              status={status}
              balance={balance}
              currentHedgeBet={hedgeBet}
              onPlaceHedgeBet={handlePlaceHedgeBet}
              onCancelHedgeBet={handleCancelHedgeBet}
              lang={lang}
            />

            {/* CLASSIC AVIATOR DUAL BET PANELS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AviatorBetPanel
                panelId="1"
                panelNumber={1}
                status={status}
                multiplier={multiplier}
                balance={balance}
                bet={bet1}
                onPlaceBet={handlePlaceBet1}
                onCancelBet={handleCancelBet1}
                onCashout={handleCashoutBet1}
                lang={lang}
              />

              <AviatorBetPanel
                panelId="2"
                panelNumber={2}
                status={status}
                multiplier={multiplier}
                balance={balance}
                bet={bet2}
                onPlaceBet={handlePlaceBet2}
                onCancelBet={handleCancelBet2}
                onCashout={handleCashoutBet2}
                lang={lang}
              />
            </div>
          </div>

          {/* Right Area: Social Live Bets & User History */}
          <div className="lg:col-span-4 xl:col-span-3">
            <LiveBetsSidebar
              status={status}
              multiplier={multiplier}
              livePlayers={livePlayers}
              myHistory={myRoundHistory}
              lang={lang}
            />
          </div>
        </div>
      </main>

      {/* Rules & Strategy Modal */}
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        lang={lang}
      />

      {/* Provably Fair Modal */}
      <ProvablyFairModal
        isOpen={showProvablyFair}
        onClose={() => setShowProvablyFair(false)}
        lang={lang}
      />
    </div>
  );
}
