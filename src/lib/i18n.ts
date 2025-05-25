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
  // Add more translations here
};

export const getTranslations = (lang: Language) => {
  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };
  return { t };
};
