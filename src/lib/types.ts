
export type AppMode = 'cycle' | 'pregnancy';
export type Language = 'en' | 'de';

export interface UserPreferences {
  language: Language;
  appMode: AppMode;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  mood: string; // emoji or string identifier
  text: string;
  createdAt: number; // timestamp
}

export interface Reminder {
  id: string;
  type: 'period_due' | 'ovulation_approaching' | 'pregnancy_milestone' | 'custom';
  date: string; // ISO Date string
  message: string;
  isEnabled: boolean;
}

// For the new Day Entry Dialog
export interface DailyEntryData {
  date: string; // YYYY-MM-DD
  mood: string; // emoji
  isBleeding: boolean;
  energyLevel: 'low' | 'medium' | 'high';
  notes: string;
}
