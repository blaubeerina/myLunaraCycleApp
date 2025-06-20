
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
    previousMonth: 'Previous Month, {month}',
    nextMonth: 'Next Month, {month}',
    // Journal & Calendar Entry
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
    // Calendar specific
    viewCalendar: 'View Calendar',
    bleedingLogged: 'Bleeding logged',
    moonPhaseLabel: 'Moon phase',
    // Settings
    appMode: 'Application Mode',
    language: 'Language', // Added for settings page
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
    // Day Entry Dialog (for calendar/journal)
    dayEntryTitle: 'Entry for {date}', // Changed "Log for" to "Entry for"
    dayEntryMood: "Today's Mood",
    dayEntryLogBleeding: 'Log Bleeding',
    dayEntryBleedingIntensity: 'Bleeding Intensity',
    dayEntrySelectIntensity: 'Select intensity...',
    dayEntryBleedingStrengthNone: 'None', // Though 'none' is handled by switch, good to have translation
    dayEntryBleedingStrengthSpotting: 'Spotting',
    dayEntryBleedingStrengthLight: 'Light',
    dayEntryBleedingStrengthMedium: 'Medium',
    dayEntryBleedingStrengthHeavy: 'Heavy',
    dayEntrySymptoms: 'Symptoms',
    dayEntryEnergyLevel: 'Energy Level', // Kept if re-added, not in current DayEntryDialog from prompt
    dayEntryEnergyLow: 'Low',
    dayEntryEnergyMedium: 'Medium',
    dayEntryEnergyHigh: 'High',
    dayEntryNotes: 'Notes', // Changed from Journal Entry to just Notes
    writeYourThoughts: 'Write your thoughts, feelings, or observations...',
    dayEntryClose: 'Close',
    dayEntrySave: 'Save Entry',
    // Moon Phases (for tooltips/display)
    moonPhaseNewMoon: "New Moon",
    moonPhaseWaxingCrescent: "Waxing Crescent",
    moonPhaseFirstQuarter: "First Quarter",
    moonPhaseWaxingGibbous: "Waxing Gibbous",
    moonPhaseFullMoon: "Full Moon",
    moonPhaseWaningGibbous: "Waning Gibbous",
    moonPhaseLastQuarter: "Last Quarter",
    moonPhaseWaningCrescent: "Waning Crescent",
    // Symptoms for checkboxes
    symptomCramps: "Cramps",
    symptomHeadache: "Headache",
    symptomFatigue: "Fatigue",
    symptomBloating: "Bloating",
    symptomMoodSwings: "Mood Swings",
    symptomTenderBreasts: "Tender Breasts",
    symptomAcne: "Acne",
    symptomNausea: "Nausea",
    symptomBackache: "Backache",
    symptomFoodCravings: "Food Cravings",
    symptomIrritability: "Irritability",
    symptomSkinChanges: "Skin Changes",
    symptomSleepIssues: "Sleep Issues",
    symptomJointPain: "Joint Pain",
    symptomOther: "Other",
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
    previousMonth: 'Vorheriger Monat, {month}',
    nextMonth: 'Nächster Monat, {month}',
    // Journal & Calendar Entry
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
    // Calendar specific
    viewCalendar: 'Kalender ansehen',
    bleedingLogged: 'Blutung protokolliert',
    moonPhaseLabel: 'Mondphase',
    // Settings
    appMode: 'Anwendungsmodus',
    language: 'Sprache', // Added for settings page
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
    moodSelectorHappy: 'Glücklich',
    moodSelectorSad: 'Traurig',
    moodSelectorAngry: 'Wütend',
    moodSelectorCalm: 'Ruhig',
    moodSelectorTired: 'Müde',
    moodSelectorExcited: 'Aufgeregt',
    moodSelectorConfused: 'Verwirrt',
    moodSelectorWorried: 'Besorgt',
    // Day Entry Dialog (for calendar/journal)
    dayEntryTitle: 'Eintrag für {date}',
    dayEntryMood: 'Heutige Stimmung',
    dayEntryLogBleeding: 'Blutung eintragen',
    dayEntryBleedingIntensity: 'Blutungsstärke',
    dayEntrySelectIntensity: 'Stärke auswählen...',
    dayEntryBleedingStrengthNone: 'Keine',
    dayEntryBleedingStrengthSpotting: 'Schmierblutung',
    dayEntryBleedingStrengthLight: 'Leicht',
    dayEntryBleedingStrengthMedium: 'Mittel',
    dayEntryBleedingStrengthHeavy: 'Stark',
    dayEntrySymptoms: 'Symptome',
    dayEntryEnergyLevel: 'Energielevel',
    dayEntryEnergyLow: 'Niedrig',
    dayEntryEnergyMedium: 'Mittel',
    dayEntryEnergyHigh: 'Hoch',
    dayEntryNotes: 'Notizen',
    writeYourThoughts: 'Schreibe deine Gedanken, Gefühle oder Beobachtungen...',
    dayEntryClose: 'Schließen',
    dayEntrySave: 'Eintrag speichern',
    // Moon Phases
    moonPhaseNewMoon: "Neumond",
    moonPhaseWaxingCrescent: "Zunehmende Mondsichel",
    moonPhaseFirstQuarter: "Erstes Viertel",
    moonPhaseWaxingGibbous: "Zunehmender Halbmond",
    moonPhaseFullMoon: "Vollmond",
    moonPhaseWaningGibbous: "Abnehmender Halbmond",
    moonPhaseLastQuarter: "Letztes Viertel",
    moonPhaseWaningCrescent: "Abnehmende Mondsichel",
    // Symptoms for checkboxes
    symptomCramps: "Krämpfe",
    symptomHeadache: "Kopfschmerzen",
    symptomFatigue: "Müdigkeit",
    symptomBloating: "Blähungen",
    symptomMoodSwings: "Stimmungsschwankungen",
    symptomTenderBreasts: "Empfindliche Brüste",
    symptomAcne: "Akne",
    symptomNausea: "Übelkeit",
    symptomBackache: "Rückenschmerzen",
    symptomFoodCravings: "Heißhunger",
    symptomIrritability: "Reizbarkeit",
    symptomSkinChanges: "Hautveränderungen",
    symptomSleepIssues: "Schlafstörungen",
    symptomJointPain: "Gelenkschmerzen",
    symptomOther: "Andere",
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
