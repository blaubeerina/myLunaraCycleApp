
import { differenceInDays, parseISO } from 'date-fns';
import type { MoonPhaseName } from './types';

// Known New Moon: January 11, 2024, 11:57 UTC (approximate)
// For simplicity, we'll use the start of this day.
const REFERENCE_NEW_MOON_DATE = parseISO('2024-01-11');
const SYNODIC_MONTH_DAYS = 29.530588853;

const MOON_PHASES_ORDER: MoonPhaseName[] = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
];

const MOON_EMOJIS: Record<MoonPhaseName, string> = {
  'New Moon': '🌑',
  'Waxing Crescent': '🌒',
  'First Quarter': '🌓',
  'Waxing Gibbous': '🌔',
  'Full Moon': '🌕',
  'Waning Gibbous': '🌖',
  'Last Quarter': '🌗',
  'Waning Crescent': '🌘',
};

// Moon-phase based affirmations are removed as per new requirement for wisdom affirmations.
// const MOON_AFFIRMATIONS: Record<MoonPhaseName, string> = { ... };

export function getMoonPhase(date: Date): MoonPhaseName {
  const daysSinceReference = differenceInDays(date, REFERENCE_NEW_MOON_DATE);
  const currentPhaseValue = (daysSinceReference / SYNODIC_MONTH_DAYS) % 1;
  const phaseIndex = Math.floor(currentPhaseValue * 8);
  return MOON_PHASES_ORDER[phaseIndex] || 'New Moon';
}

export function getMoonEmoji(phaseName: MoonPhaseName): string {
  return MOON_EMOJIS[phaseName] || '🌑';
}

// getAffirmationForMoonPhase is removed.
