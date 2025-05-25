
export type AppMode = 'cycle' | 'pregnancy';
export type Language = 'en' | 'de';

export interface UserPreferences {
  language: Language;
  appMode: AppMode;
}

// export interface JournalEntry { // Old journal entry, can be removed or renamed if not used elsewhere
//   id: string;
//   date: string; // ISO Date string YYYY-MM-DD
//   mood: string; // emoji or string identifier
//   text: string;
//   createdAt: number; // timestamp
// }

export interface Reminder {
  id: string;
  type: 'period_due' | 'ovulation_approaching' | 'pregnancy_milestone' | 'custom';
  date: string; // ISO Date string
  message: string;
  isEnabled: boolean;
}

export type BleedingStrength = 'light' | 'medium' | 'heavy' | 'none';

export interface DailyEntryData {
  date: string; // YYYY-MM-DD
  mood: string; // emoji
  isBleeding: boolean;
  bleedingStrength: BleedingStrength;
  energyLevel: 'low' | 'medium' | 'high';
  notes: string;
}

export interface MoonPhaseData {
  phaseName: string; // e.g., "New Moon", "Waxing Crescent"
  emoji: string;
}

export type CyclePhase = 'Menstruation' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Premenstrual' | 'Unknown';

export interface CycleInfo {
  phase: CyclePhase;
  cycleDay: number;
  lastPeriodStartDate?: string;
  estimatedCycleLength: number;
  isFertile?: boolean;
  isOvulationDay?: boolean;
  nextPeriodStartDate?: string;
  menstrualPhaseEndDay?: number;
  follicularPhaseEndDay?: number;
  ovulationDayEstimated?: number;
  fertileWindowStartDay?: number;
  fertileWindowEndDay?: number;
  lutealPhaseStartDay?: number;
  premenstrualPhaseStartDay?: number;
}

export interface GeneratedImpulse {
  date: string; // YYYY-MM-DD of the entry it's for
  text: string;
  cyclePhase: CyclePhase;
  moonPhase: string;
}

// New types for Editable Journal
export type FirebaseTimestamp = Date; // Mocking Firestore Timestamp with JS Date

export const journalEntryMoods = ['happy', 'sad', 'energetic', 'tired'] as const;
export type JournalEntryMood = typeof journalEntryMoods[number];

export interface JournalEntry {
  id: string;
  date: string; // ISO-Format YYYY-MM-DD
  mood: JournalEntryMood;
  notes: string;
  symptoms: string[]; // Array of symptom strings
  lastUpdated: FirebaseTimestamp;
  userId?: string; // Optional: for mock ownership
}
