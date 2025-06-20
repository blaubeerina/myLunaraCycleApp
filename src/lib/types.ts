
export type Language = 'en' | 'de';
export type AppMode = 'cycle' | 'pregnancy'; // Zyklusmodus vs Schwangerschaftsmodus

export interface UserPreferences {
  language: Language;
  appMode: AppMode;
  // username?: string; // Optional, if needed later
  // reminderSettings?: ReminderSetting[]; // For detailed reminder config
}

// For Mood & Journal Feature
export type MoodEmoji = '😊' | '😢' | '😠' | '😌' | '😴' | '🤩' | '😕' | '😟' | string; // Allow custom emojis if needed

export interface JournalEntry {
  id: string; // Unique ID, can be date string or UUID
  date: string; // YYYY-MM-DD
  mood: MoodEmoji;
  text: string; // Password-protected journal entry text
  // lastUpdated: string; // ISO date string
}

// For Dynamic Calendar View
export interface CycleDayInfo {
  date: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfMonth: number;
  cycleDay?: number; // Day in cycle (e.g., Day 5)
  isOvulation?: boolean;
  isPeriodDay?: boolean;
  bleedingStrength?: BleedingStrength;
  pregnancyWeek?: number; // Week of pregnancy
  trimester?: 1 | 2 | 3;
  moonPhase?: MoonPhaseName; // From NASA data or calculation
  // symptomsLogged?: Symptom[];
}

export type BleedingStrength = 'none' | 'light' | 'medium' | 'heavy' | 'spotting';

export const SYMPTOMS_LIST = ['cramps', 'headache', 'fatigue', 'bloating', 'moodSwings', 'tenderBreasts', 'acne', 'nausea', 'backache', 'foodCravings'] as const;
export type Symptom = typeof SYMPTOMS_LIST[number];


export type MoonPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

// For Reminder System
export interface Reminder {
  id: string;
  isEnabled: boolean;
  type: 'period_due' | 'ovulation_approaching' | 'fertility_window_opens' | 'fertility_window_closes' | 'pregnancy_support' | 'custom';
  message: string; // Custom message or template key
  daysBefore?: number; // For reminders like "period due in X days"
  time?: string; // HH:MM for specific time
  // for pregnancy support, could be tied to week
  pregnancyWeekTarget?: number; 
}


// AI Affirmation
export interface Affirmation {
  text: string;
  source?: string; // e.g., 'AI-generated', 'User-defined'
}

// Combined Daily Entry for simpler storage, can be used by Calendar & Journal
export interface DailyEntryData {
  date: string; // YYYY-MM-DD, primary key for daily data
  mood?: MoodEmoji;
  journalText?: string; // Main journal entry
  
  // Cycle Specific
  isPeriodStart?: boolean;
  isPeriodEnd?: boolean;
  bleedingStrength?: BleedingStrength;
  symptoms?: Symptom[]; // Array of symptom keys
  energyLevel?: 'low' | 'medium' | 'high'; // Example, can be more granular

  // Pregnancy Specific
  pregnancyWeek?: number;
  // Could add fields like baby_size_fruit, pregnancy_symptoms, etc.

  // Shared
  customNotes?: string; // General notes for the day
  affirmationGenerated?: string; // Store the AI affirmation for this day
}


// Types from existing Lunar Rhythms app that might be adapted or removed
export interface LocalStorageData {
  lastPeriodDate: string | null;
  lastPeriodEndDate: string | null;
  lastPeriodDuration: number | null;
  periodLogs?: Record<string, PeriodLogEntry>; // Date string 'YYYY-MM-DD' as key
  dailyWisdom_v1?: DailyWisdom; 
}

export interface TarotCard {
  id: string;
  title: string;
  image: string; 
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
  isBleedingDay?: boolean;
  // isFertileDay?: boolean; 
  // isOvulationDay?: boolean;
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

export interface PeriodLogEntry {
  date: string; // YYYY-MM-DD
  intensity: BleedingStrength; // Updated to use BleedingStrength
  symptoms: Symptom[]; // Updated to use Symptom[]
  notes?: string;
  moonPhase?: MoonPhaseName;
  moonEmoji?: string;
}


// Firebase specific types, useful for planning
export type FirebaseTimestamp = Date; // | firebase.firestore.Timestamp;


// For generate-cycle-impulse AI flow
export interface CycleInfo {
  phase: 'Menstruation' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Premenstrual' | 'Unknown';
  cycleDay: number;
  isFertile: boolean;
  isOvulationDay: boolean;
  nextPeriodStartDate: string | null; // YYYY-MM-DD
}

export interface GeneratedImpulse {
  date: string; // YYYY-MM-DD of the entry this impulse is for
  text: string;
  cyclePhase: CycleInfo['phase'];
  moonPhase: string; // e.g., "Full Moon"
}

// For the settings page theme selection
export interface Theme {
  id: string;
  name: string;
  colors: { // HSL string format for CSS variables
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
  previewColors: string[]; // Array of hex/hsl colors for theme preview in settings
}
