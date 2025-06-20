
import type { Language } from './types';

type Translations = {
  [key: string]: string;
};

type AllTranslations = {
  [lang in Language]: Translations;
};

export const translations: AllTranslations = {
  en: {
    appName: 'myLunaraCycle',
    tagline: 'Sync with your inner rhythm and the moon.',
    // Auth
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Log in to continue your journey',
    login: 'Login',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    loginWithGoogle: 'Login with Google',
    dontHaveAccount: "Don't have an account?",
    signUp: 'Sign Up',
    // Modes
    cycleMode: 'Cycle Mode',
    pregnancyMode: 'Pregnancy Mode',
    // Navigation
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    journal: 'Journal',
    reminders: 'Reminders',
    settings: 'Settings',
    // Journal
    journalEntriesTitle: 'My Journal',
    journalEntriesDescription: 'Reflect and record your journey.',
    addNewEntry: 'New Entry',
    editEntry: 'Edit Entry',
    deleteEntry: 'Delete Entry',
    confirmDeleteEntryTitle: 'Delete Entry?',
    confirmDeleteEntryDescription: 'Are you sure you want to delete this journal entry? This action cannot be undone.',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    entrySavedSuccess: 'Entry saved successfully!',
    entrySavedError: 'Error saving entry.',
    entryDeletedSuccess: 'Entry deleted.',
    entryDeletedError: 'Error deleting entry.',
    mood: 'Mood',
    notes: 'Notes',
    symptoms: 'Symptoms',
    symptomsPlaceholder: 'e.g., cramps, joyful (comma-separated)',
    notesPlaceholder: 'Your thoughts and reflections...',
    date: 'Date',
    moodHappy: 'Happy',
    moodSad: 'Sad',
    moodEnergetic: 'Energetic',
    moodTired: 'Tired',
    howAreYouFeeling: 'How are you feeling today?',
    loadingEntries: 'Loading entries...',
    noEntriesFound: 'No journal entries yet. Start by adding one!',
    // Calendar
    viewCalendar: 'View Calendar',
    // Settings
    appMode: 'Application Mode',
    // Affirmations
    generateAffirmation: 'Generate Affirmation',
    generating: 'Generating...',
    affirmationForToday: "Today's Affirmation",
    sampleAffirmation: "I am resilient, strong, and capable of handling anything that comes my way.",
    generateNewAffirmation: 'Generate New Affirmation',
    // Dashboard
    landingSubtitle: 'Welcome to your sacred space',
    currentCyclePhaseLabel: 'Current Cycle Phase',
    cyclePhaseMenstruation: 'Menstruation',
    cyclePhaseFollicular: 'Follicular Phase',
    cyclePhaseOvulation: 'Ovulation',
    cyclePhaseLuteal: 'Luteal Phase',
    cyclePhasePremenstrual: 'Premenstrual',
    cyclePhaseUnknown: 'Unknown Phase',
    ovulationDayLabel: 'Ovulation Day!',
    fertileWindowLabel: 'Fertile Window',
    nextPeriodPredictionLabel: 'Next Period expected around',
    dailyImpulseTitle: 'Daily Impulse',
    dailyImpulseLoading: 'Loading daily impulse...',
    dailyImpulseUnavailable: 'Daily impulse will be available once you start logging your entries.',
    // Reminders
    remindersDescription: 'Configure personalized reminders.',
    // Mood Selector (for journal entries)
    moodSelectorHappy: 'Happy',
    moodSelectorSad: 'Sad',
    moodSelectorAngry: 'Angry',
    moodSelectorCalm: 'Calm',
    moodSelectorTired: 'Tired',
    moodSelectorExcited: 'Excited',
    moodSelectorConfused: 'Confused',
    moodSelectorWorried: 'Worried',
    // Day Entry Dialog (for journal)
    dayEntryTitle: 'Log for {date}',
    dayEntryMood: 'Today\'s Mood',
    dayEntryBleeding: 'Log Bleeding',
    dayEntryBleedingStrength: 'Bleeding Strength',
    dayEntryBleedingStrengthNone: 'None',
    dayEntryBleedingStrengthSpotting: 'Spotting',
    dayEntryBleedingStrengthLight: 'Light',
    dayEntryBleedingStrengthMedium: 'Medium',
    dayEntryBleedingStrengthHeavy: 'Heavy',
    dayEntryEnergyLevel: 'Energy Level',
    dayEntryEnergyLow: 'Low',
    dayEntryEnergyMedium: 'Medium',
    dayEntryEnergyHigh: 'High',
    dayEntryNotes: 'Journal Entry',
    writeYourThoughts: 'Write your thoughts, feelings, or observations...',
    dayEntryClose: 'Close',
    dayEntrySave: 'Save Entry',
    
  },
  de: {
    appName: 'myLunaraCycle',
    tagline: 'Synchronisiere dich mit deinem inneren Rhythmus und dem Mond.',
    // Auth
    loginTitle: 'Willkommen zurück',
    loginSubtitle: 'Melde dich an, um deine Reise fortzusetzen',
    login: 'Anmelden',
    logout: 'Abmelden',
    email: 'E-Mail',
    password: 'Passwort',
    loginWithGoogle: 'Mit Google anmelden',
    dontHaveAccount: 'Noch kein Konto?',
    signUp: 'Registrieren',
    // Modes
    cycleMode: 'Zyklusmodus',
    pregnancyMode: 'Schwangerschaftsmodus',
    // Navigation
    dashboard: 'Dashboard',
    calendar: 'Kalender',
    journal: 'Tagebuch',
    reminders: 'Erinnerungen',
    settings: 'Einstellungen',
    // Journal
    journalEntriesTitle: 'Mein Tagebuch',
    journalEntriesDescription: 'Reflektiere und halte deine Reise fest.',
    addNewEntry: 'Neuer Eintrag',
    editEntry: 'Eintrag bearbeiten',
    deleteEntry: 'Eintrag löschen',
    confirmDeleteEntryTitle: 'Eintrag löschen?',
    confirmDeleteEntryDescription: 'Möchtest du diesen Tagebucheintrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    cancel: 'Abbrechen',
    saveChanges: 'Änderungen speichern',
    saving: 'Speichern...',
    entrySavedSuccess: 'Eintrag erfolgreich gespeichert!',
    entrySavedError: 'Fehler beim Speichern des Eintrags.',
    entryDeletedSuccess: 'Eintrag gelöscht.',
    entryDeletedError: 'Fehler beim Löschen des Eintrags.',
    mood: 'Stimmung',
    notes: 'Notizen',
    symptoms: 'Symptome',
    symptomsPlaceholder: 'z.B. Krämpfe, fröhlich (kommagetrennt)',
    notesPlaceholder: 'Deine Gedanken und Reflexionen...',
    date: 'Datum',
    moodHappy: 'Fröhlich',
    moodSad: 'Traurig',
    moodEnergetic: 'Energiegeladen',
    moodTired: 'Müde',
    howAreYouFeeling: 'Wie fühlst du dich heute?',
    loadingEntries: 'Lade Einträge...',
    noEntriesFound: 'Noch keine Tagebucheinträge. Starte mit einem neuen Eintrag!',
    // Calendar
    viewCalendar: 'Kalender ansehen',
    // Settings
    appMode: 'Anwendungsmodus',
    // Affirmations
    generateAffirmation: 'Affirmation generieren',
    generating: 'Generiere...',
    affirmationForToday: 'Heutige Affirmation',
    sampleAffirmation: "Ich bin widerstandsfähig, stark und fähig, alles zu meistern, was auf mich zukommt.",
    generateNewAffirmation: 'Neue Affirmation generieren',
    // Dashboard
    landingSubtitle: 'Willkommen in deinem heiligen Raum',
    currentCyclePhaseLabel: 'Aktuelle Zyklusphase',
    cyclePhaseMenstruation: 'Menstruation',
    cyclePhaseFollicular: 'Follikelphase',
    cyclePhaseOvulation: 'Eisprung',
    cyclePhaseLuteal: 'Lutealphase',
    cyclePhasePremenstrual: 'Prämenstruell',
    cyclePhaseUnknown: 'Unbekannte Phase',
    ovulationDayLabel: 'Eisprungtag!',
    fertileWindowLabel: 'Fruchtbares Fenster',
    nextPeriodPredictionLabel: 'Nächste Periode erwartet um',
    dailyImpulseTitle: 'Täglicher Impuls',
    dailyImpulseLoading: 'Lade täglichen Impuls...',
    dailyImpulseUnavailable: 'Der tägliche Impuls ist verfügbar, sobald du mit dem Loggen deiner Einträge beginnst.',
    // Reminders
    remindersDescription: 'Konfiguriere personalisierte Erinnerungen.',
    // Mood Selector (for journal entries)
    moodSelectorHappy: 'Fröhlich',
    moodSelectorSad: 'Traurig',
    moodSelectorAngry: 'Wütend',
    moodSelectorCalm: 'Ruhig',
    moodSelectorTired: 'Müde',
    moodSelectorExcited: 'Aufgeregt',
    moodSelectorConfused: 'Verwirrt',
    moodSelectorWorried: 'Besorgt',
    // Day Entry Dialog (for journal)
    dayEntryTitle: 'Eintrag für {date}',
    dayEntryMood: 'Heutige Stimmung',
    dayEntryBleeding: 'Blutung eintragen',
    dayEntryBleedingStrength: 'Blutungsstärke',
    dayEntryBleedingStrengthNone: 'Keine',
    dayEntryBleedingStrengthSpotting: 'Schmierblutung',
    dayEntryBleedingStrengthLight: 'Leicht',
    dayEntryBleedingStrengthMedium: 'Mittel',
    dayEntryBleedingStrengthHeavy: 'Stark',
    dayEntryEnergyLevel: 'Energielevel',
    dayEntryEnergyLow: 'Niedrig',
    dayEntryEnergyMedium: 'Mittel',
    dayEntryEnergyHigh: 'Hoch',
    dayEntryNotes: 'Tagebucheintrag',
    writeYourThoughts: 'Schreibe deine Gedanken, Gefühle oder Beobachtungen...',
    dayEntryClose: 'Schließen',
    dayEntrySave: 'Eintrag speichern',
  },
};

export function getTranslator(language: Language): (key: string, params?: Record<string, string | number>) => string {
  return (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language]?.[key] || translations.en[key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{${paramKey}}`, String(value));
      });
    }
    return translation;
  };
}
