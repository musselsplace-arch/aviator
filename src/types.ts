export type GameStatus = 'WAITING' | 'COUNTDOWN' | 'FLYING' | 'CRASHED';

export type RouletteColor = 'RED' | 'BLACK' | 'GREEN';

export interface ColorZone {
  index: number;
  minMultiplier: number;
  maxMultiplier: number;
  color: RouletteColor;
  labelEn: string;
  labelKa: string;
  bgHex: string;
  glowHex: string;
}

export interface AviatorBet {
  id: string;
  amount: number;
  active: boolean;
  autoCashout: boolean;
  autoCashoutMultiplier: number;
  cashedOut: boolean;
  cashoutMultiplier: number | null;
  winAmount: number | null;
}

export interface RouletteHedgeBet {
  active: boolean;
  amount: number;
  color: RouletteColor;
  won: boolean | null;
  winAmount: number | null;
  payoutMultiplier: number;
}

export interface RoundHistoryItem {
  id: string;
  roundNumber: number;
  crashMultiplier: number;
  crashColor: RouletteColor;
  crashZoneLabel: string;
  timestamp: number;
  serverSeedHash: string;
}

export interface LivePlayerBet {
  id: string;
  username: string;
  avatar: string;
  amount: number;
  cashoutMultiplier: number | null;
  cashedOut: boolean;
  hedgeColor: RouletteColor | null;
  hedgeAmount: number | null;
  hedgeWon: boolean | null;
}

export interface ChatMessage {
  id: string;
  username: string;
  avatar: string;
  text: string;
  time: string;
  isSystem?: boolean;
  isWin?: boolean;
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  x: number; // percentage 10% - 90%
}

export interface BigWinNotification {
  id: string;
  username: string;
  avatar: string;
  amount: number;
  multiplier: number;
  isUser?: boolean;
}

export interface FreeBetRainEvent {
  id: string;
  amount: number;
  expiresAt: number;
}
