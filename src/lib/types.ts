
export type Language = 'en' | 'de';
export type AppMode = 'cycle' | 'pregnancy';

export interface UserPreferences {
  language: Language;
  appMode: AppMode;
  theme: string; // Theme ID
}

export type MoodEmoji = string; // Allow any emoji string

// As per new prompt for calendar entry
export type BleedingIntensity = 'light' | 'medium' | 'heavy' | 'spotting';

// Symptoms will be free-form strings in the new bleeding object,
// but we can keep SYMPTOMS_LIST for providing suggestions in UI.
export const SYMPTOMS_LIST = ['cramps', 'headache', 'fatigue', 'bloating', 'moodSwings', 'tenderBreasts', 'acne', 'nausea', 'backache', 'foodCravings', 'irritability', 'skinChanges', 'sleepIssues', 'jointPain', 'other'] as const;
export type SymptomKey = typeof SYMPTOMS_LIST[number]; // For UI suggestions

// Combined Daily Entry for simpler storage, matching prompt's CalendarEntry
export interface DailyEntryData {
  date: string; // YYYY-MM-DD, primary key for daily data
  mood?: MoodEmoji; // Emoji string
  notes?: string;   // Free text for reflections, replaces journalText/customNotes

  bleeding?: {
    intensity: BleedingIntensity; // 'light', 'medium', 'heavy', 'spotting'
    symptoms?: string[];          // Array of symptom strings, e.g., ["cramps", "headache"]
  };
  // moonPhaseName is part of CycleDayInfo for display, might not be stored directly in entry if fetched live
  // For now, we can add it if we decide to store it with the entry after fetching.
  moonPhaseName?: MoonPhaseName; // Store the calculated/fetched moon phase name

  affirmationGenerated?: string; // Store the AI affirmation for this day
  
  isPeriodStart?: boolean; // Flag for marking the start of a period
  isPeriodEnd?: boolean;   // Flag for marking the end of a period
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

export interface Reminder {
  id: string;
  isEnabled: boolean;
  type: 'period_due' | 'ovulation_approaching' | 'fertility_window_opens' | 'fertility_window_closes' | 'pregnancy_support' | 'custom';
  message: string;
  daysBefore?: number;
  time?: string;
  pregnancyWeekTarget?: number;
}

export interface Affirmation {
  text: string;
  source?: string;
}

// For Dynamic Calendar View (derived data, not stored directly like this)
export interface CycleDayInfo {
  date: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfMonth: number;
  cycleDay?: number;
  // isOvulation?: boolean; // Predictions are for future
  // isPeriodDay?: boolean; // Derived from DailyEntryData.bleeding
  // bleedingStrength?: BleedingStrength; // Derived
  // pregnancyWeek?: number;
  // trimester?: 1 | 2 | 3;
  moonPhase?: MoonPhaseName;
  dailyEntry?: DailyEntryData; // The actual logged data for this day
}

// Types from existing Lunar Rhythms app that might be adapted or removed
// Kept for reference during transition, can be cleaned up later
export interface LocalStorageData {
  lastPeriodDate: string | null;
  lastPeriodEndDate: string | null;
  lastPeriodDuration: number | null;
  periodLogs?: Record<string, PeriodLogEntryOld>;
  dailyWisdom_v1?: DailyWisdom;
}

export interface TarotCard {
  id: string;
  title: string;
  image: string;
  meaning: string;
}

// This one is used by the old CycleCalendar, may need to be updated or removed
export interface DailyCalendarInfo {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  cycleDay: number | null;
  moonPhase: MoonPhaseName;
  moonEmoji: string;
  periodLog?: PeriodLogEntryOld; // Old type
  isBleedingDay?: boolean;
  tarotCard: TarotCard;
  affirmation?: WisdomAffirmation;
}

export interface WisdomAffirmation {
  text: string;
  author?: string;
}

export interface DailyWisdom {
  tarot: {
    cardId: string | null;
    drawDate: string | null;
    recentIds: string[];
  };
  affirmation: {
    text: string | null;
    author?: string | null;
    displayDate: string | null;
    previousText?: string | null;
  };
}

// Old PeriodLogEntry - will be replaced by new structure in DailyEntryData
export type OldBleedingStrength = 'none' | 'light' | 'medium' | 'heavy' | 'spotting';
export interface PeriodLogEntryOld {
  date: string; // YYYY-MM-DD
  intensity: OldBleedingStrength;
  symptoms: SymptomKey[]; // Old type with enum keys
  notes?: string;
  moonPhase?: MoonPhaseName;
  moonEmoji?: string;
}

export type FirebaseTimestamp = Date;

export interface CycleInfo {
  phase: 'Menstruation' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Premenstrual' | 'Unknown';
  cycleDay: number;
  isFertile: boolean;
  isOvulationDay: boolean;
  nextPeriodStartDate: string | null;
}

export interface GeneratedImpulse {
  date: string;
  text: string;
  cyclePhase: CycleInfo['phase'];
  moonPhase: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
  previewColors: string[];
}

