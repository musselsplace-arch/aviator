import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameStatus,
  RouletteColor,
  AviatorBet,
  RouletteHedgeBet,
  RoundHistoryItem,
  LivePlayerBet,
  ChatMessage,
  BigWinNotification,
  FreeBetRainEvent,
} from './types';
import { getColorZone, generateCrashMultiplier, ROULETTE_PAYOUTS } from './utils/gameZones';
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
  playBigWinFanfare,
  playRainClaimSound,
  playZeroJackpotSound,
  playReactionSound,
} from './utils/audio';

import { Header } from './components/Header';
import { FlightCanvas } from './components/FlightCanvas';
import { AviatorBetPanel } from './components/AviatorBetPanel';
import { RouletteHedgePanel } from './components/RouletteHedgePanel';
import { RoundHistoryBar } from './components/RoundHistoryBar';
import { LiveBetsSidebar } from './components/LiveBetsSidebar';
import { BigWinBanner } from './components/BigWinBanner';
import { FreeBetRainModal } from './components/FreeBetRainModal';
import { RulesModal } from './components/RulesModal';
import { ProvablyFairModal } from './components/ProvablyFairModal';
import { ShareModal } from './components/ShareModal';
import { INITIAL_CHAT_MESSAGES, BOT_REACTIONS_HIGH, BOT_REACTIONS_CRASH } from './data/initialChat';
import { Shield, Plane, MessageSquare, Sparkles } from 'lucide-react';

// Initial realistic simulated history
const INITIAL_HISTORY: RoundHistoryItem[] = [
  { id: 'r1', roundNumber: 1402, crashMultiplier: 2.34, crashColor: 'RED', crashZoneLabel: 'Red Zone 2', timestamp: Date.now() - 60000, serverSeedHash: '7a9c8b6e2d1f438901acde' },
  { id: 'r2', roundNumber: 1403, crashMultiplier: 1.22, crashColor: 'RED', crashZoneLabel: 'Red Zone 1', timestamp: Date.now() - 48000, serverSeedHash: 'f489b02a6c8e31048e91ac' },
  { id: 'r3', roundNumber: 1404, crashMultiplier: 4.85, crashColor: 'RED', crashZoneLabel: 'Red Zone 3', timestamp: Date.now() - 36000, serverSeedHash: '8b10ca4e723901bce471d2' },
  { id: 'r4', roundNumber: 1405, crashMultiplier: 1.82, crashColor: 'BLACK', crashZoneLabel: 'Black Zone 1', timestamp: Date.now() - 24000, serverSeedHash: '20cba48719283e10fa789b' },
  { id: 'r5', roundNumber: 1406, crashMultiplier: 14.50, crashColor: 'GREEN', crashZoneLabel: 'Green Zero Jackpot', timestamp: Date.now() - 12000, serverSeedHash: 'de4710bc892a01f487ac29' },
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

  // Mobile layout switcher tab: 'HEDGE' | 'AVIATOR' | 'LIVE'
  const [mobileTab, setMobileTab] = useState<'HEDGE' | 'AVIATOR' | 'LIVE'>('HEDGE');
  const [mobileAviatorBetTab, setMobileAviatorBetTab] = useState<1 | 2>(1);

  // Modals
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showProvablyFair, setShowProvablyFair] = useState<boolean>(false);
  const [showShare, setShowShare] = useState<boolean>(false);

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

  // Feature 4: Big Win Banner
  const [bigWinNotification, setBigWinNotification] = useState<BigWinNotification | null>(null);

  // Feature 5: Free Bet Rain
  const [freeBetRain, setFreeBetRain] = useState<FreeBetRainEvent | null>(null);

  // Feature 2: Live Chat & Reactions
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

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
      const targetCash = Math.floor((1.15 + Math.random() * 5.0) * 100) / 100;
      const hasHedge = Math.random() > 0.4;
      const hedgeColor: RouletteColor | null = hasHedge
        ? Math.random() > 0.5
          ? 'RED'
          : Math.random() > 0.15
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

  // Synchronized refs for stable flight physics & cashouts without nested setState
  const bet1Ref = useRef(bet1);
  const bet2Ref = useRef(bet2);
  const hedgeBetRef = useRef(hedgeBet);
  const balanceRef = useRef(balance);
  const roundNumberRef = useRef(roundNumber);
  const hasCrashedRef = useRef(false);
  const multiplierRef = useRef(1.0);
  const hasTriggeredHighChatRef = useRef(false);

  useEffect(() => { bet1Ref.current = bet1; }, [bet1]);
  useEffect(() => { bet2Ref.current = bet2; }, [bet2]);
  useEffect(() => { hedgeBetRef.current = hedgeBet; }, [hedgeBet]);
  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { roundNumberRef.current = roundNumber; }, [roundNumber]);

  // Tracking current color zone for zone transition sounds
  const lastColorZoneRef = useRef<RouletteColor>('RED');

  // Send message to chat
  const handleSendMessage = useCallback((text: string) => {
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}-${Math.random()}`,
      username: lang === 'ka' ? 'თქვენ (მე)' : 'You',
      avatar: '😎',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev.slice(-35), newMsg]);
  }, [lang]);

  // Handle reaction from canvas or button
  const handleSendReaction = useCallback((emoji: string) => {
    handleSendMessage(emoji);
  }, [handleSendMessage]);

  // Start new round countdown
  const startNewRoundCountdown = useCallback(() => {
    hasCrashedRef.current = false;
    multiplierRef.current = 1.0;
    hasTriggeredHighChatRef.current = false;
    setStatus('COUNTDOWN');
    setCountdown(5);
    setMultiplier(1.0);

    // Feature 5: Free Bet Rain check (1 in 4 chance during countdown)
    if (Math.random() < 0.28) {
      setTimeout(() => {
        setFreeBetRain({
          id: `rain-${Date.now()}`,
          amount: [5, 10, 15][Math.floor(Math.random() * 3)],
          expiresAt: Date.now() + 10000,
        });
      }, 1000);
    }

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
        hasCrashedRef.current = false;
        multiplierRef.current = 1.0;
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
      hasCrashedRef.current = false;
      multiplierRef.current = 1.0;

      const flightLoop = (now: number) => {
        if (hasCrashedRef.current) return;

        const delta = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        const prev = multiplierRef.current;
        const speedFactor = 0.08 + Math.log(prev + 0.1) * 0.18;
        const nextVal = prev + speedFactor * delta * (1 + prev * 0.15);
        multiplierRef.current = nextVal;

        // Update engine audio pitch safely
        updateEnginePitch(nextVal);

        // Check if crossed into a new color zone!
        const currentZone = getColorZone(nextVal);
        if (currentZone.color !== lastColorZoneRef.current) {
          playZoneShift(currentZone.color);
          lastColorZoneRef.current = currentZone.color;

          // If crossed into Green Zero Jackpot Zone, fanfare sound!
          if (currentZone.color === 'GREEN') {
            playZeroJackpotSound();
          }
        }

        // Live Chat Bot reactions when flight goes high
        if (nextVal > 6.0 && !hasTriggeredHighChatRef.current) {
          hasTriggeredHighChatRef.current = true;
          const randomBot = INITIAL_BOT_NAMES[Math.floor(Math.random() * INITIAL_BOT_NAMES.length)];
          const randomReaction = BOT_REACTIONS_HIGH[Math.floor(Math.random() * BOT_REACTIONS_HIGH.length)];
          setChatMessages((msgs) => [
            ...msgs.slice(-35),
            {
              id: `bot-high-${Date.now()}`,
              username: randomBot.name,
              avatar: randomBot.avatar,
              text: randomReaction,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }

        // Check Auto-Cashout for Bet 1
        const b1 = bet1Ref.current;
        if (b1.active && !b1.cashedOut && b1.autoCashout && nextVal >= b1.autoCashoutMultiplier) {
          const win = b1.amount * b1.autoCashoutMultiplier;
          setBalance((bal) => bal + win);
          playCashoutSound();

          // Big Win check
          if (win >= 150 || b1.autoCashoutMultiplier >= 6.0) {
            playBigWinFanfare();
            setBigWinNotification({
              id: `bw-${Date.now()}`,
              username: lang === 'ka' ? 'თქვენ (Player)' : 'You',
              avatar: '🏆',
              amount: win,
              multiplier: b1.autoCashoutMultiplier,
              isUser: true,
            });
          }

          setBet1((prevB1) => ({
            ...prevB1,
            cashedOut: true,
            cashoutMultiplier: b1.autoCashoutMultiplier,
            winAmount: win,
          }));
        }

        // Check Auto-Cashout for Bet 2
        const b2 = bet2Ref.current;
        if (b2.active && !b2.cashedOut && b2.autoCashout && nextVal >= b2.autoCashoutMultiplier) {
          const win = b2.amount * b2.autoCashoutMultiplier;
          setBalance((bal) => bal + win);
          playCashoutSound();

          // Big Win check
          if (win >= 150 || b2.autoCashoutMultiplier >= 6.0) {
            playBigWinFanfare();
            setBigWinNotification({
              id: `bw-${Date.now()}`,
              username: lang === 'ka' ? 'თქვენ (Player)' : 'You',
              avatar: '🏆',
              amount: win,
              multiplier: b2.autoCashoutMultiplier,
              isUser: true,
            });
          }

          setBet2((prevB2) => ({
            ...prevB2,
            cashedOut: true,
            cashoutMultiplier: b2.autoCashoutMultiplier,
            winAmount: win,
          }));
        }

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
          hasCrashedRef.current = true;
          stopEngineSound();
          playCrashSound();

          const finalCrash = targetCrashMultiplier;
          const finalZone = getColorZone(finalCrash);
          const crashColor = finalZone.color;

          setMultiplier(finalCrash);
          setLastCrashMultiplier(finalCrash);
          setLastCrashColor(crashColor);
          setStatus('CRASHED');

          // Evaluate Roulette Hedge Bet cleanly
          const currHedge = hedgeBetRef.current;
          let isHedgeWon = false;
          let hedgePayout = 0;
          if (currHedge && currHedge.active) {
            isHedgeWon = currHedge.color === crashColor;
            hedgePayout = isHedgeWon ? currHedge.amount * currHedge.payoutMultiplier : 0;
            if (isHedgeWon) {
              setBalance((bal) => bal + hedgePayout);
              playRouletteWin();

              // Big Win Banner on Green Zero or high hedge
              if (crashColor === 'GREEN' || hedgePayout >= 150) {
                playBigWinFanfare();
                setBigWinNotification({
                  id: `bw-hedge-${Date.now()}`,
                  username: lang === 'ka' ? 'თქვენი რულეტკის დაზღვევა' : 'Your Roulette Hedge',
                  avatar: crashColor === 'GREEN' ? '🟢' : '🛡️',
                  amount: hedgePayout,
                  multiplier: currHedge.payoutMultiplier,
                  isUser: true,
                });
              }
            }
            setHedgeBet({
              ...currHedge,
              won: isHedgeWon,
              winAmount: hedgePayout,
            });
          }

          // Random bot crash comment in chat
          if (Math.random() < 0.6) {
            const randomBot = INITIAL_BOT_NAMES[Math.floor(Math.random() * INITIAL_BOT_NAMES.length)];
            const crashComment = BOT_REACTIONS_CRASH[Math.floor(Math.random() * BOT_REACTIONS_CRASH.length)];
            setChatMessages((msgs) => [
              ...msgs.slice(-35),
              {
                id: `bot-crash-${Date.now()}`,
                username: randomBot.name,
                avatar: randomBot.avatar,
                text: crashComment,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }

          // Random simulated player big win announcement if high crash
          if (finalCrash > 8.0 && Math.random() < 0.5) {
            const luckyBot = INITIAL_BOT_NAMES[Math.floor(Math.random() * 4)];
            const botWin = Math.floor(luckyBot.name.length * 35 * finalCrash);
            setBigWinNotification({
              id: `bw-bot-${Date.now()}`,
              username: luckyBot.name,
              avatar: luckyBot.avatar,
              amount: botWin,
              multiplier: finalCrash,
              isUser: false,
            });
          }

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
          const curRound = roundNumberRef.current;
          const newHistoryItem: RoundHistoryItem = {
            id: `r-${Date.now()}`,
            roundNumber: curRound,
            crashMultiplier: finalCrash,
            crashColor: crashColor,
            crashZoneLabel: lang === 'ka' ? finalZone.labelKa : finalZone.labelEn,
            timestamp: Date.now(),
            serverSeedHash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
          };

          setHistory((prevH) => [newHistoryItem, ...prevH]);
          setRoundNumber((r) => r + 1);

          // Record player personal round history if any bet was active
          const curB1 = bet1Ref.current;
          const curB2 = bet2Ref.current;
          if (curB1.active || curB2.active || (currHedge && currHedge.active)) {
            const totalBet = (curB1.active ? curB1.amount : 0) + (curB2.active ? curB2.amount : 0) + (currHedge?.active ? currHedge.amount : 0);
            const totalAviatorPayout = (curB1.cashedOut ? (curB1.winAmount || 0) : 0) + (curB2.cashedOut ? (curB2.winAmount || 0) : 0);

            setMyRoundHistory((prevMy) => [
              {
                roundNumber: curRound,
                betAmount: totalBet,
                cashoutMultiplier: curB1.cashedOut ? curB1.cashoutMultiplier : curB2.cashedOut ? curB2.cashoutMultiplier : null,
                payout: totalAviatorPayout,
                hedgeColor: currHedge?.active ? currHedge.color : null,
                hedgeWon: isHedgeWon,
                hedgePayout: hedgePayout,
              },
              ...prevMy,
            ]);
          }

          // Schedule transition to next round after 3.5 seconds
          setTimeout(() => {
            startNewRoundCountdown();
          }, 3500);

          return; // STOP LOOP IMMEDIATELY
        }

        setMultiplier(nextVal);
        animationFrame = requestAnimationFrame(flightLoop);
      };

      animationFrame = requestAnimationFrame(flightLoop);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [status, targetCrashMultiplier, lang, startNewRoundCountdown]);

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

      if (win >= 150 || multiplier >= 6.0) {
        playBigWinFanfare();
        setBigWinNotification({
          id: `bw-user1-${Date.now()}`,
          username: lang === 'ka' ? 'თქვენ (Player)' : 'You',
          avatar: '🚀',
          amount: win,
          multiplier: multiplier,
          isUser: true,
        });
      }

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

      if (win >= 150 || multiplier >= 6.0) {
        playBigWinFanfare();
        setBigWinNotification({
          id: `bw-user2-${Date.now()}`,
          username: lang === 'ka' ? 'თქვენ (Player)' : 'You',
          avatar: '🚀',
          amount: win,
          multiplier: multiplier,
          isUser: true,
        });
      }

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

  // Claim Free Bet Rain
  const handleClaimFreeBetRain = (amount: number) => {
    setBalance((prev) => prev + amount);
    setChatMessages((msgs) => [
      ...msgs.slice(-35),
      {
        id: `rain-claim-${Date.now()}`,
        username: lang === 'ka' ? 'თქვენ' : 'You',
        avatar: '🌧️',
        text: lang === 'ka' ? `მიიღო უფასო +${amount.toFixed(2)} ₾ წვიმის ბონუსი!` : `Claimed +${amount.toFixed(2)} GEL Free Bet!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isWin: true,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-['Outfit',sans-serif]">
      {/* Feature 4: BIG WIN BANNER POPUP */}
      <BigWinBanner
        notification={bigWinNotification}
        onDismiss={() => setBigWinNotification(null)}
        lang={lang}
      />

      {/* Feature 5: FREE BET RAIN POPUP */}
      <FreeBetRainModal
        event={freeBetRain}
        onClaim={handleClaimFreeBetRain}
        onDismiss={() => setFreeBetRain(null)}
        lang={lang}
      />

      {/* App Header */}
      <Header
        balance={balance}
        onAddBalance={handleAddBalance}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'ka' ? 'en' : 'ka'))}
        onOpenRules={() => setShowRules(true)}
        onOpenProvablyFair={() => setShowProvablyFair(true)}
        onOpenShare={() => setShowShare(true)}
      />

      {/* Main Game Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 flex flex-col gap-2.5 sm:gap-3">
        {/* Past Rounds Multiplier History Bar */}
        <RoundHistoryBar history={history} lang={lang} />

        {/* MOBILE NAVIGATION SWITCHER (< lg screens) */}
        <div className="lg:hidden flex items-center bg-[#0d121c] p-1 rounded-2xl border border-slate-800 shadow-md">
          <button
            type="button"
            onClick={() => setMobileTab('HEDGE')}
            className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'HEDGE'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{lang === 'ka' ? '🛡️ რულეტკა' : '🛡️ Hedge'}</span>
            {hedgeBet?.active && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('AVIATOR')}
            className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'AVIATOR'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>{lang === 'ka' ? '🎯 ავიატორი' : '🎯 Aviator'}</span>
            {(bet1.active || bet2.active) && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('LIVE')}
            className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'LIVE'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'ka' ? 'ჩათი' : 'Chat'}</span>
            <span className="text-[10px] bg-slate-900 px-1.5 py-0.2 rounded-full text-slate-400 font-mono">
              {livePlayers.length}
            </span>
          </button>
        </div>

        {/* Layout Grid: Flight Screen + Betting Controls + Live Bets Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left / Center Area: Flight Canvas & Betting Panels */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-3">
            {/* The Flight Visualizer Canvas with Cosmic FX & Screen Shake */}
            <FlightCanvas
              status={status}
              multiplier={multiplier}
              countdown={countdown}
              crashMultiplier={lastCrashMultiplier}
              crashColor={lastCrashColor}
              selectedHedgeColor={hedgeBet?.color || null}
              isHedgeActive={Boolean(hedgeBet?.active)}
              lang={lang}
              onSendReaction={handleSendReaction}
            />

            {/* DESKTOP VIEW: ROULETTE HEDGE + DUAL AVIATOR BETS BOTH VISIBLE */}
            <div className="hidden lg:flex flex-col gap-3">
              <RouletteHedgePanel
                status={status}
                balance={balance}
                currentHedgeBet={hedgeBet}
                onPlaceHedgeBet={handlePlaceHedgeBet}
                onCancelHedgeBet={handleCancelHedgeBet}
                lang={lang}
              />

              <div className="grid grid-cols-2 gap-3">
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

            {/* MOBILE VIEW: TAB-SWITCHED PANELS (NO OVERFLOW OR ENDLESS SCROLLING) */}
            <div className="lg:hidden flex flex-col gap-2">
              {mobileTab === 'HEDGE' && (
                <div className="animate-in fade-in duration-200">
                  <RouletteHedgePanel
                    status={status}
                    balance={balance}
                    currentHedgeBet={hedgeBet}
                    onPlaceHedgeBet={handlePlaceHedgeBet}
                    onCancelHedgeBet={handleCancelHedgeBet}
                    lang={lang}
                  />
                </div>
              )}

              {mobileTab === 'AVIATOR' && (
                <div className="flex flex-col gap-2 animate-in fade-in duration-200">
                  {/* Sub-tabs for Bet 1 and Bet 2 on mobile */}
                  <div className="flex items-center bg-[#0d121c] p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setMobileAviatorBetTab(1)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        mobileAviatorBetTab === 1
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400'
                      }`}
                    >
                      <span>{lang === 'ka' ? 'ფსონი 1' : 'Bet 1'}</span>
                      {bet1.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileAviatorBetTab(2)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        mobileAviatorBetTab === 2
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400'
                      }`}
                    >
                      <span>{lang === 'ka' ? 'ფსონი 2' : 'Bet 2'}</span>
                      {bet2.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </button>
                  </div>

                  {mobileAviatorBetTab === 1 ? (
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
                  ) : (
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
                  )}
                </div>
              )}

              {mobileTab === 'LIVE' && (
                <div className="animate-in fade-in duration-200">
                  <LiveBetsSidebar
                    status={status}
                    multiplier={multiplier}
                    livePlayers={livePlayers}
                    myHistory={myRoundHistory}
                    chatMessages={chatMessages}
                    onSendMessage={handleSendMessage}
                    lang={lang}
                  />
                </div>
              )}
            </div>
          </div>

          {/* DESKTOP SIDEBAR: SOCIAL LIVE BETS & LIVE CHAT */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <LiveBetsSidebar
              status={status}
              multiplier={multiplier}
              livePlayers={livePlayers}
              myHistory={myRoundHistory}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
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

      {/* Share With Friends Modal */}
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        lang={lang}
      />
    </div>
  );
}
