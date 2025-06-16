
export interface LocalStorageData {
  lastPeriodDate: string | null;
  lastPeriodEndDate: string | null; // New field
  lastPeriodDuration: number | null; // New field
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
  image: string;
  // Optional: Add meaning or keywords later
  // meaning?: string; 
}

export interface DailyCalendarInfo {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  cycleDay: number | null;
  moonPhase: MoonPhaseName;
  moonEmoji: string;
  affirmation: string;
  isPeriodDay?: boolean;
  tarotCard?: TarotCard; // Added for daily tarot card
}
