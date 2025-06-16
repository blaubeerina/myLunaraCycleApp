
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
  // Affirmation is no longer per-day in calendar, but global daily
  isPeriodDay?: boolean;
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
    // Optional: to help avoid direct repeats if needed, though random selection from a large list is often sufficient
    previousText?: string | null; 
  };
}
