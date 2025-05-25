
import type { Language } from '@/lib/types';

type Translations = {
  [key: string]: {
    [lang in Language]: string;
  };
};

const translations: Translations = {
  // General
  appName: { en: 'myLunaraCycle', de: 'myLunaraCycle' },
  login: { en: 'Login', de: 'Anmelden' },
  signUp: { en: 'Sign Up', de: 'Registrieren' },
  logout: { en: 'Logout', de: 'Abmelden' },
  email: { en: 'Email', de: 'Email' },
  password: { en: 'Password', de: 'Passwort' },
  dashboard: { en: 'Dashboard', de: 'Dashboard' },
  calendar: { en: 'Calendar', de: 'Kalender' },
  journal: { en: 'Journal', de: 'Tagebuch' },
  mood: { en: 'Mood', de: 'Stimmung' },
  reminders: { en: 'Reminders', de: 'Erinnerungen' },
  settings: { en: 'Settings', de: 'Einstellungen' },
  today: { en: 'Today', de: 'Heute' },
  view: { en: 'View', de: 'Ansicht' },
  dayView: { en: 'Day', de: 'Tag' },
  weekView: { en: 'Week', de: 'Woche' },
  monthView: { en: 'Month', de: 'Monat' },
  yearView: { en: 'Year', de: 'Jahr' },
  // Modes
  cycleMode: { en: 'Cycle Mode', de: 'Zyklusmodus' },
  pregnancyMode: { en: 'Pregnancy Mode', de: 'Schwangerschaftsmodus' },
  // Login Page
  loginTitle: { en: 'Welcome Back', de: 'Willkommen zurück' },
  loginSubtitle: { en: 'Log in to continue your journey with myLunaraCycle.', de: 'Melde dich an, um deine Reise mit myLunaraCycle fortzusetzen.' },
  loginWithGoogle: { en: 'Login with Google', de: 'Mit Google anmelden' },
  dontHaveAccount: { en: "Don't have an account?", de: 'Noch kein Konto?' },
  // Landing Page
  landingTitle: { en: 'Welcome to myLunaraCycle', de: 'Willkommen bei myLunaraCycle' },
  landingSubtitle: { en: 'Track your cycle, understand your body, and embrace your feminine power.', de: 'Verfolge deinen Zyklus, verstehe deinen Körper und umarme deine weibliche Kraft.' },
  getStarted: { en: 'Get Started', de: 'Loslegen' },
  // Journal Page
  howAreYouFeeling: { en: 'How are you feeling today?', de: 'Wie fühlst du dich heute?' },
  writeYourThoughts: { en: 'Write down your thoughts and feelings...', de: 'Schreibe deine Gedanken und Gefühle auf...' },
  generateAffirmation: { en: 'Generate Affirmation', de: 'Affirmation generieren' },
  affirmationForToday: { en: "Today's Affirmation", de: 'Heutige Affirmation' },
  saveEntry: { en: "Save Entry", de: "Eintrag speichern"},
  generating: { en: 'Generating...', de: 'Generiere...' },
  sampleAffirmation: { en: 'This is a placeholder for your daily affirmation. Go to Journal to generate one!', de: 'Dies ist ein Platzhalter für deine tägliche Affirmation. Gehe zum Tagebuch, um eine zu generieren!' },
  generateNewAffirmation: { en: 'Generate New Affirmation', de: 'Neue Affirmation generieren' },
  openJournal: { en: 'Open Journal', de: 'Tagebuch öffnen' },
  viewCalendar: { en: 'View Calendar', de: 'Kalender ansehen' },
  // Day Entry Dialog
  dayEntryTitle: { en: 'Log Entry for {date}', de: 'Eintrag für {date}' },
  dayEntryMood: { en: 'Mood', de: 'Stimmung' },
  dayEntryBleeding: { en: 'Bleeding', de: 'Blutung' },
  dayEntryBleedingStrength: { en: 'Bleeding Strength', de: 'Stärke der Blutung' },
  dayEntryBleedingStrengthLight: { en: 'Light', de: 'Leicht' },
  dayEntryBleedingStrengthMedium: { en: 'Medium', de: 'Mittel' },
  dayEntryBleedingStrengthHeavy: { en: 'Heavy', de: 'Stark' },
  dayEntryEnergyLevel: { en: 'Energy Level', de: 'Energielevel' },
  dayEntryNotes: { en: 'Notes', de: 'Notizen' },
  dayEntrySave: { en: 'Save Entry', de: 'Eintrag Speichern' },
  dayEntryClose: { en: 'Close', de: 'Schließen' },
  dayEntryEnergyLow: { en: 'Low', de: 'Niedrig' },
  dayEntryEnergyMedium: { en: 'Medium', de: 'Mittel' },
  dayEntryEnergyHigh: { en: 'High', de: 'Hoch' },
  loadingData: { en: 'Loading data...', de: 'Lade Daten...' },

  // Cycle Phases
  cyclePhaseMenstruation: { en: 'Menstruation', de: 'Menstruation' },
  cyclePhaseFollicular: { en: 'Follicular Phase', de: 'Follikelphase' },
  cyclePhaseOvulation: { en: 'Ovulation', de: 'Eisprung' },
  cyclePhaseLuteal: { en: 'Luteal Phase', de: 'Lutealphase' },
  cyclePhasePremenstrual: { en: 'Premenstrual Phase', de: 'Prämenstruelle Phase' },
  cyclePhaseUnknown: { en: 'Unknown Cycle Phase', de: 'Unbekannte Zyklusphase' },
  fertileWindowLabel: { en: 'Fertile Window', de: 'Fruchtbares Fenster' },
  ovulationDayLabel: { en: 'Ovulation Day', de: 'Eisprungtag' },
  currentCyclePhaseLabel: { en: 'Current Cycle Phase', de: 'Aktuelle Zyklusphase' },
  nextPeriodPredictionLabel: { en: 'Next Estimated Period', de: 'Nächste geschätzte Periode' },


  // Dashboard Impulse
  dailyImpulseTitle: { en: 'Your Daily Impulse', de: 'Dein täglicher Impuls' },
  dailyImpulseLoading: { en: 'Generating your impulse...', de: 'Dein Impuls wird generiert...' },
  dailyImpulseUnavailable: { en: 'No impulse available yet. Log an entry in your calendar!', de: 'Noch kein Impuls verfügbar. Mache einen Eintrag in deinem Kalender!' },
  newImpulseGenerated: { en: 'New impulse generated!', de: 'Neuer Impuls generiert!' },
  appMode: {en: 'App Mode', de: 'App-Modus'},
};

export const getTranslations = (lang: Language) => {
  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[key]?.[lang] || key;
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return translation;
  };
  return { t };
};
