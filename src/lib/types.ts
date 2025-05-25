
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

// New types for Cycle Calculation and AI Impulse
export type CyclePhase = 'Menstruation' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Unknown';

export interface CycleInfo {
  phase: CyclePhase;
  cycleDay: number; // Day in cycle, e.g., 1, 15, 28. 0 if unknown.
  lastPeriodStartDate?: string; // YYYY-MM-DD
  estimatedCycleLength: number; // e.g. 28
}

export interface GeneratedImpulse {
  date: string; // YYYY-MM-DD of the entry it's for
  text: string;
  cyclePhase: CyclePhase;
  moonPhase: string;
}
