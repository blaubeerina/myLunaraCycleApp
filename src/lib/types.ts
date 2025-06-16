
export interface LocalStorageData {
  lastPeriodDate: string | null;
  lastPeriodEndDate: string | null; 
  lastPeriodDuration: number | null; 
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
  meaning?: string; // Optional: Short meaning or keywords
}

export interface DailyCalendarInfo {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  cycleDay: number | null;
  moonPhase: MoonPhaseName;
  moonEmoji: string;
  affirmation: string; // This will be the moon-based affirmation
  isPeriodDay?: boolean;
  // Tarot card is now fetched on demand for detail view, not stored per cell in initial grid render
}

