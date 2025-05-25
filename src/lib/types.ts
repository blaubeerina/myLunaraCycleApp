
export type AppMode = 'cycle' | 'pregnancy';
export type Language = 'en' | 'de';

export interface UserPreferences {
  language: Language;
  appMode: AppMode;
  activeTheme: string; // Theme ID
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

// Theme switcher types
export interface ThemeColorPalette {
  background: string;        // Hex
  primary: string;           // Hex
  accentPrimary: string;     // Hex
  accentSecondary: string;   // Hex
  textPrimary: string;       // Hex
  textSecondary?: string;      // Hex (Optional for simpler palettes)
  inputField?: string;         // Hex (Optional)
  highlight?: string;          // Hex (Optional)
  softHighlight?: string;      // Hex (Optional)
  // For direct mapping to CSS vars
  cssBackground: string; // HSL string
  cssForeground: string; // HSL string
  cssCard: string; // HSL string
  cssCardForeground: string; // HSL string
  cssPopover: string; // HSL string
  cssPopoverForeground: string; // HSL string
  cssPrimary: string; // HSL string
  cssPrimaryForeground: string; // HSL string
  cssSecondary: string; // HSL string
  cssSecondaryForeground: string; // HSL string
  cssMuted: string; // HSL string
  cssMutedForeground: string; // HSL string
  cssAccent: string; // HSL string
  cssAccentForeground: string; // HSL string
  cssDestructive: string; // HSL string
  cssDestructiveForeground: string; // HSL string
  cssBorder: string; // HSL string
  cssInput: string; // HSL string
  cssRing: string; // HSL string
  cssChart1: string; // HSL string
  cssChart2: string; // HSL string
  cssChart3: string; // HSL string
  cssChart4: string; // HSL string
  cssChart5: string; // HSL string
  cssSidebarBackground: string; // HSL string
  cssSidebarForeground: string; // HSL string
  cssSidebarPrimary: string; // HSL string
  cssSidebarPrimaryForeground: string; // HSL string
  cssSidebarAccent: string; // HSL string
  cssSidebarAccentForeground: string; // HSL string
  cssSidebarBorder: string; // HSL string
  cssSidebarRing: string; // HSL string
  cssLunaraOvulationGlow?: string; // HSL string
  cssLunaraPregnancyGrowth?: string; // HSL string
}

export interface ThemeOption {
  id: string;
  name: string;
  colors: ThemeColorPalette;
  previewColors: string[]; // Array of hex codes for display
}
