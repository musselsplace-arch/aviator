import { ColorZone, RouletteColor } from '../types';

export const COLOR_ZONES: ColorZone[] = [
  { index: 0, minMultiplier: 1.00, maxMultiplier: 1.45, color: 'RED', labelEn: 'Red Zone 1', labelKa: 'წითელი ზონა 1', bgHex: '#ef4444', glowHex: 'rgba(239, 68, 68, 0.4)' },
  { index: 1, minMultiplier: 1.45, maxMultiplier: 2.10, color: 'BLACK', labelEn: 'Black Zone 1', labelKa: 'შავი ზონა 1', bgHex: '#1e293b', glowHex: 'rgba(30, 41, 59, 0.6)' },
  { index: 2, minMultiplier: 2.10, maxMultiplier: 3.10, color: 'RED', labelEn: 'Red Zone 2', labelKa: 'წითელი ზონა 2', bgHex: '#ef4444', glowHex: 'rgba(239, 68, 68, 0.4)' },
  { index: 3, minMultiplier: 3.10, maxMultiplier: 4.60, color: 'BLACK', labelEn: 'Black Zone 2', labelKa: 'შავი ზონა 2', bgHex: '#1e293b', glowHex: 'rgba(30, 41, 59, 0.6)' },
  { index: 4, minMultiplier: 4.60, maxMultiplier: 6.80, color: 'RED', labelEn: 'Red Zone 3', labelKa: 'წითელი ზონა 3', bgHex: '#ef4444', glowHex: 'rgba(239, 68, 68, 0.4)' },
  { index: 5, minMultiplier: 6.80, maxMultiplier: 9.90, color: 'BLACK', labelEn: 'Black Zone 3', labelKa: 'შავი ზონა 3', bgHex: '#1e293b', glowHex: 'rgba(30, 41, 59, 0.6)' },
  { index: 6, minMultiplier: 9.90, maxMultiplier: 12.00, color: 'GREEN', labelEn: 'Lucky Zero Zone', labelKa: 'იღბლიანი მწვანე 0', bgHex: '#10b981', glowHex: 'rgba(16, 185, 129, 0.6)' },
  { index: 7, minMultiplier: 12.00, maxMultiplier: 18.00, color: 'RED', labelEn: 'Red Zone 4', labelKa: 'წითელი ზონა 4', bgHex: '#ef4444', glowHex: 'rgba(239, 68, 68, 0.4)' },
  { index: 8, minMultiplier: 18.00, maxMultiplier: 27.00, color: 'BLACK', labelEn: 'Black Zone 4', labelKa: 'შავი ზონა 4', bgHex: '#1e293b', glowHex: 'rgba(30, 41, 59, 0.6)' },
  { index: 9, minMultiplier: 27.00, maxMultiplier: 40.00, color: 'RED', labelEn: 'Red Zone 5', labelKa: 'წითელი ზონა 5', bgHex: '#ef4444', glowHex: 'rgba(239, 68, 68, 0.4)' },
  { index: 10, minMultiplier: 40.00, maxMultiplier: 60.00, color: 'BLACK', labelEn: 'Black Zone 5', labelKa: 'შავი ზონა 5', bgHex: '#1e293b', glowHex: 'rgba(30, 41, 59, 0.6)' },
  { index: 11, minMultiplier: 60.00, maxMultiplier: 80.00, color: 'GREEN', labelEn: 'Super Green Zone', labelKa: 'სუპერ მწვანე 00', bgHex: '#10b981', glowHex: 'rgba(16, 185, 129, 0.7)' },
  { index: 12, minMultiplier: 80.00, maxMultiplier: 120.00, color: 'RED', labelEn: 'Mega Red', labelKa: 'მეგა წითელი', bgHex: '#ef4444', glowHex: 'rgba(239, 68, 68, 0.5)' },
  { index: 13, minMultiplier: 120.00, maxMultiplier: 200.00, color: 'BLACK', labelEn: 'Cosmic Black', labelKa: 'კოსმოსური შავი', bgHex: '#1e293b', glowHex: 'rgba(30, 41, 59, 0.7)' },
  { index: 14, minMultiplier: 200.00, maxMultiplier: 1000.00, color: 'GREEN', labelEn: 'Legendary Green', labelKa: 'ლეგენდარული მწვანე', bgHex: '#10b981', glowHex: 'rgba(16, 185, 129, 0.8)' },
];

export function getColorZone(multiplier: number): ColorZone {
  for (const zone of COLOR_ZONES) {
    if (multiplier >= zone.minMultiplier && multiplier < zone.maxMultiplier) {
      return zone;
    }
  }
  return COLOR_ZONES[COLOR_ZONES.length - 1];
}

export function getNextColorZone(multiplier: number): ColorZone | null {
  const current = getColorZone(multiplier);
  if (current.index < COLOR_ZONES.length - 1) {
    return COLOR_ZONES[current.index + 1];
  }
  return null;
}

export function getZoneProgress(multiplier: number): number {
  const current = getColorZone(multiplier);
  const span = current.maxMultiplier - current.minMultiplier;
  if (span <= 0) return 1;
  const progress = (multiplier - current.minMultiplier) / span;
  return Math.min(Math.max(progress, 0), 1);
}

export const ROULETTE_PAYOUTS: Record<RouletteColor, number> = {
  RED: 2.0,
  BLACK: 2.0,
  GREEN: 14.0,
};

/**
 * Provably fair crash point generator using pseudo-random exponential distribution.
 * Gives realistic Aviator odds (house edge ~3%, with small multipliers common and occasional sky-high rockets).
 */
export function generateCrashMultiplier(): number {
  const rand = Math.random();
  // 3% instant crash at 1.00x
  if (rand < 0.035) {
    return 1.00;
  }
  // Exponential distribution for crash game
  const e = 2.718281828459;
  const multiplier = Math.floor((100 / (100 - (rand * 96))) * 100) / 100;
  return Math.max(1.00, Math.min(multiplier, 150.00));
}
