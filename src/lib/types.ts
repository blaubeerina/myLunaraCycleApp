
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
  // isFertileDay?: boolean; // Removed as per minimalist design
  // isOvulationDay?: boolean; // Removed as per minimalist design
  tarotCard: TarotCard; 
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

export type PeriodIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
export const SYMPTOMS_LIST = ['cramps', 'headache', 'fatigue', 'bloating', 'moodSwings', 'tenderBreasts', 'acne', 'nausea', 'backache', 'foodCravings'] as const;
export type Symptom = typeof SYMPTOMS_LIST[number];

export interface PeriodLogEntry {
  date: string; // YYYY-MM-DD
  intensity: PeriodIntensity;
  symptoms: Symptom[];
  notes?: string;
  moonPhase?: MoonPhaseName;
  moonEmoji?: string;
}

// Types for myLunaraCycle specific features
export type Language = 'en' | 'de';
export type AppMode = 'cycle' | 'pregnancy';

export interface UserPreferences {
  language: Language;
  appMode: AppMode;
  theme: string; // Theme ID
}

export interface DailyEntryData {
  date: string; // YYYY-MM-DD
  mood: string; // Emoji or label
  isBleeding?: boolean;
  bleedingStrength?: BleedingStrength; // 'none', 'light', 'medium', 'heavy'
  energyLevel?: 'low' | 'medium' | 'high';
  notes?: string;
  // Pregnancy specific
  pregnancyWeek?: number;
  symptoms?: string[]; // Could be more specific if needed
}

export type BleedingStrength = 'none' | 'light' | 'medium' | 'heavy';


export interface JournalEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood: JournalEntryMood;
  notes: string;
  symptoms?: string[]; // e.g., ["cramps", "joyful"]
  lastUpdated: FirebaseTimestamp; // Or Date for client-side mock
  // Optional fields for future expansion
  affirmationUsed?: string;
  tarotCardDrawn?: string; // ID of the card
}

export type JournalEntryMood = 'happy' | 'sad' | 'energetic' | 'tired';
export const journalEntryMoods: JournalEntryMood[] = ['happy', 'sad', 'energetic', 'tired'];

// This could be Firestore's Timestamp or a simple Date for local mock
export type FirebaseTimestamp = Date; // | firebase.firestore.Timestamp;


export interface Reminder {
  id: string;
  type: 'period_due' | 'ovulation_approaching' | 'pregnancy_milestone' | 'custom';
  date: string; // YYYY-MM-DD or specific timestamp for reminders
  message: string;
  isEnabled: boolean;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string; // HSL string
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    card: string;
    // Add other necessary theme colors here
  };
  previewColors: string[]; // Array of hex/hsl colors for theme preview
}


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
  // Add other relevant context used for generation if needed
}


// Pinterest Style Journal
export type PinterestJournalMoodType = 'happy' | 'sad' | 'calm' | 'energetic' | 'neutral';

export interface PinterestJournalEntry {
  id: string;
  userId: string;
  date: string; // ISO string
  content: string;
  mood: PinterestJournalMoodType;
  tags?: string[];
  pinned?: boolean;
  rotation?: number; // For the tilted card effect, e.g., -2 to 2 degrees
}
