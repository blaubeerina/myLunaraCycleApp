
export type Language = 'en' | 'de';
export type AppMode = 'cycle' | 'pregnancy';

export interface UserPreferences {
  language: Language;
  appMode: AppMode;
  theme: string; // Theme ID
}

export type MoodEmoji = string; // Allow any emoji string

export type BleedingIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export const SYMPTOMS_LIST = ['cramps', 'headache', 'fatigue', 'bloating', 'moodSwings', 'tenderBreasts', 'acne', 'nausea', 'backache', 'foodCravings', 'irritability', 'skinChanges', 'sleepIssues', 'jointPain', 'other'] as const;
export type SymptomKey = typeof SYMPTOMS_LIST[number];

export type CyclePhaseName =
  | 'Menstruation'
  | 'Follicular'
  | 'Ovulation'
  | 'Luteal'
  | 'Unknown'; // Added Unknown for days before first period or if data is insufficient

export interface DailyEntryData {
  date: string; // YYYY-MM-DD, primary key for daily data
  mood?: MoodEmoji;
  notes?: string;

  bleeding?: {
    intensity: BleedingIntensity;
    symptoms?: string[];
  };
  moonPhaseName?: MoonPhaseName; // Actual moon phase for the day
  affirmationGenerated?: string;
  
  isPeriodStart?: boolean;
  isPeriodEnd?: boolean;
}

// For the calendar cells, including calculated/predicted info
export interface CalendarCellData extends DailyEntryData {
  // Inherits all from DailyEntryData for logged info
  isToday: boolean;
  isCurrentMonth: boolean;
  dayOfMonth: number;
  
  // Calculated cycle info
  cycleDayNumber?: number; // Day of the cycle (1, 2, ...)
  currentCyclePhase?: CyclePhaseName; // Calculated phase for this day
  isFertilePredicted?: boolean; // Predicted fertile window
  isOvulationPredicted?: boolean; // Predicted ovulation day
  isNextPeriodPredicted?: boolean; // Predicted start of next period
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

export interface CycleDayInfo { // This might be replaced by CalendarCellData or merged
  date: string; 
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfMonth: number;
  cycleDay?: number;
  moonPhase?: MoonPhaseName;
  dailyEntry?: DailyEntryData; 
}

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

export interface DailyCalendarInfo {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  cycleDay: number | null;
  moonPhase: MoonPhaseName;
  moonEmoji: string;
  periodLog?: PeriodLogEntryOld; 
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

export type OldBleedingStrength = 'none' | 'light' | 'medium' | 'heavy' | 'spotting';
export interface PeriodLogEntryOld {
  date: string; 
  intensity: OldBleedingStrength;
  symptoms: SymptomKey[]; 
  notes?: string;
  moonPhase?: MoonPhaseName;
  moonEmoji?: string;
}

export type FirebaseTimestamp = Date;

export interface CycleInfo { // This is a good model for calculated cycle state for a specific day
  phase: CyclePhaseName;
  cycleDay: number;
  isFertile: boolean; // Covers both logged and predicted fertility
  isOvulationDay: boolean; // Covers both logged and predicted ovulation
  nextPeriodStartDate: string | null; // Predicted
  // Potentially add:
  // estimatedOvulationDate: string | null;
  // estimatedFertileWindow: { start: string; end: string } | null;
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

