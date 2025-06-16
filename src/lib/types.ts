
export interface LocalStorageData {
  lastPeriodDate: string | null;
  lastPeriodEndDate: string | null;
  lastPeriodDuration: number | null;
  periodLogs?: Record<string, PeriodLogEntry>; // Date string 'YYYY-MM-DD' as key
  dailyWisdom_v1?: DailyWisdom; // For tarot and affirmations
}

export type MoonPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export interface TarotCard {
  id: string;
  title: string;
  image: string; // Path to the image, e.g., /cards/the-fool.png
  meaning: string;
}

export interface DailyCalendarInfo {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  cycleDay: number | null;
  moonPhase: MoonPhaseName;
  moonEmoji: string;
  periodLog?: PeriodLogEntry; 
  isBleedingDay?: boolean; // Derived from periodLog or main period dates
  isFertileDay?: boolean;
  isOvulationDay?: boolean;
}

export interface WisdomAffirmation {
  text: string;
  author?: string;
}

export interface DailyWisdom {
  tarot: {
    cardId: string | null;
    drawDate: string | null; // ISO date string YYYY-MM-DD
    recentIds: string[];    // Array of card IDs, max 7
  };
  affirmation: {
    text: string | null;
    author?: string | null;
    displayDate: string | null; // ISO date string YYYY-MM-DD
    previousText?: string | null;
  };
}

export type PeriodIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
export const SYMPTOMS_LIST = ['cramps', 'headache', 'fatigue', 'bloating', 'moodSwings', 'tenderBreasts', 'acne', 'nausea', 'backache', 'foodCravings'] as const;
export type Symptom = typeof SYMPTOMS_LIST[number];

export interface PeriodLogEntry {
  date: string; // YYYY-MM-DD
  intensity: PeriodIntensity;
  symptoms: Symptom[];
  notes?: string;
}
