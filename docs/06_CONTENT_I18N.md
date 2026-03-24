# 🌍 LUNARACYCLE — Content & i18n
**Datei für Phase 6 — Alle Texte + Spirituelle Impulse**

---

## i18n Setup

### Lovable Prompt — i18n System

```
Add internationalization (i18n) to Lunaracycle.

Create a translations object (no external library needed for v1):

File: src/i18n/translations.ts

The structure should be:
{
  de: { [key: string]: string },
  en: { [key: string]: string }
}

Create a useTranslation() hook that:
1. Reads language from user profile (profiles.language)
2. Falls back to 'de' if not set
3. Returns a t(key) function that returns the translated string
4. Updates reactively when language changes in settings

Replace all hardcoded strings in the existing screens with t() calls.
```

---

## Alle Übersetzungen

```typescript
// src/i18n/translations.ts

export const translations = {
  de: {
    // Navigation
    'nav.home': 'Heute',
    'nav.calendar': 'Kalender',
    'nav.log': 'Eintrag',
    'nav.settings': 'Einstellungen',

    // Home Screen
    'home.cycle_day': 'Zyklustag',
    'home.days_until': 'Tage bis zur Periode',
    'home.period_late': 'Periode überfällig',
    'home.days_late': 'Tage überfällig',
    'home.card.moon': 'Mond',
    'home.card.phase': 'Phase',
    'home.card.energy': 'Energie',
    'home.impulse.label': 'Heutiger Impuls',
    'home.checkin.label': 'Wie fühlst du dich?',
    'home.checkin.mood': 'Stimmung',
    'home.checkin.energy': 'Energie',
    'home.checkin.sensitivity': 'Sensibel',
    'home.checkin.intuition': 'Intuition',
    'home.no_data': 'Trag deine erste Periode ein, um loszulegen.',

    // Cycle Phases
    'phase.menstruation': 'Menstruation',
    'phase.follicular': 'Follikelphase',
    'phase.ovulation': 'Eisprung',
    'phase.luteal': 'Lutealphase',

    // Moon Phases
    'moon.new_moon': 'Neumond',
    'moon.waxing_crescent': 'Zunehmende Sichel',
    'moon.first_quarter': 'Erstes Viertel',
    'moon.waxing_gibbous': 'Zunehmender Mond',
    'moon.full_moon': 'Vollmond',
    'moon.waning_gibbous': 'Abnehmender Mond',
    'moon.last_quarter': 'Letztes Viertel',
    'moon.waning_crescent': 'Abnehmende Sichel',

    // Calendar
    'calendar.legend.period': 'Periode',
    'calendar.legend.fertile': 'Fruchtbar',
    'calendar.legend.ovulation': 'Eisprung',
    'calendar.legend.luteal': 'Luteal',
    'calendar.avg_cycle': 'Ø Zyklus',
    'calendar.days': 'Tage',
    'calendar.last_period': 'Letzte Periode',

    // Log Screen
    'log.title': 'Eintrag',
    'log.period.start_question': 'Beginnt heute deine Periode?',
    'log.period.start_button': 'Ja, Periode starten',
    'log.period.day': 'Tag deiner Periode',
    'log.period.end': 'Periode beendet markieren',
    'log.flow.light': 'Leicht',
    'log.flow.medium': 'Mittel',
    'log.flow.heavy': 'Stark',
    'log.flow.spotting': 'Spotting',
    'log.notes.placeholder': 'Wie war dein Tag? (optional)',
    'log.save': 'Speichern',
    'log.saved': 'Gespeichert ✓',

    // Settings
    'settings.title': 'Einstellungen',
    'settings.profile': 'Profil',
    'settings.cycle': 'Zyklus',
    'settings.cycle_length': 'Zykluslänge',
    'settings.period_length': 'Periodenlänge',
    'settings.days': 'Tage',
    'settings.language': 'Sprache',
    'settings.account': 'Account',
    'settings.logout': 'Ausloggen',
    'settings.delete_account': 'Account löschen',
    'settings.delete_confirm': 'Bist du sicher? Alle deine Daten werden gelöscht.',
    'settings.delete_yes': 'Ja, löschen',
    'settings.delete_no': 'Abbrechen',

    // Auth
    'auth.welcome': 'Willkommen',
    'auth.tagline': 'Dein kosmischer Rhythmus',
    'auth.google': 'Weiter mit Google',
    'auth.apple': 'Weiter mit Apple',
    'auth.email': 'Mit Email anmelden',
    'auth.have_account': 'Ich habe schon einen Account',
    'auth.login': 'Einloggen',
    'auth.register': 'Registrieren',
    'auth.email_label': 'Email',
    'auth.password_label': 'Passwort',
    'auth.password_confirm': 'Passwort bestätigen',
    'auth.forgot_password': 'Passwort vergessen?',
    'auth.no_account': 'Noch kein Account?',
    'auth.create_account': 'Account erstellen',

    // Onboarding
    'onboarding.step1.title': 'Wie lange ist dein Zyklus?',
    'onboarding.step1.desc': 'Die meisten Zyklen dauern 21–35 Tage.',
    'onboarding.step2.title': 'Wie lange dauert deine Periode?',
    'onboarding.step2.desc': 'Meistens 3–7 Tage.',
    'onboarding.step3.title': 'Wann begann deine letzte Periode?',
    'onboarding.step3.desc': 'So genau wie möglich.',
    'onboarding.step4.title': 'Welche Sprache bevorzugst du?',
    'onboarding.start': 'Loslegen',
    'onboarding.next': 'Weiter',
    'onboarding.back': 'Zurück',

    // Errors
    'error.generic': 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
    'error.network': 'Keine Verbindung. Bitte prüfe dein Internet.',
    'error.email_taken': 'Diese E-Mail ist bereits registriert.',
    'error.wrong_password': 'E-Mail oder Passwort falsch.',
    'error.weak_password': 'Passwort muss mindestens 8 Zeichen haben.',
    'error.passwords_mismatch': 'Passwörter stimmen nicht überein.',
  },

  en: {
    // Navigation
    'nav.home': 'Today',
    'nav.calendar': 'Calendar',
    'nav.log': 'Log',
    'nav.settings': 'Settings',

    // Home Screen
    'home.cycle_day': 'Cycle Day',
    'home.days_until': 'days until period',
    'home.period_late': 'Period overdue',
    'home.days_late': 'days late',
    'home.card.moon': 'Moon',
    'home.card.phase': 'Phase',
    'home.card.energy': 'Energy',
    'home.impulse.label': 'Today\'s Impulse',
    'home.checkin.label': 'How do you feel?',
    'home.checkin.mood': 'Mood',
    'home.checkin.energy': 'Energy',
    'home.checkin.sensitivity': 'Sensitive',
    'home.checkin.intuition': 'Intuition',
    'home.no_data': 'Log your first period to get started.',

    // Cycle Phases
    'phase.menstruation': 'Menstruation',
    'phase.follicular': 'Follicular Phase',
    'phase.ovulation': 'Ovulation',
    'phase.luteal': 'Luteal Phase',

    // Moon Phases
    'moon.new_moon': 'New Moon',
    'moon.waxing_crescent': 'Waxing Crescent',
    'moon.first_quarter': 'First Quarter',
    'moon.waxing_gibbous': 'Waxing Gibbous',
    'moon.full_moon': 'Full Moon',
    'moon.waning_gibbous': 'Waning Gibbous',
    'moon.last_quarter': 'Last Quarter',
    'moon.waning_crescent': 'Waning Crescent',

    // Calendar
    'calendar.legend.period': 'Period',
    'calendar.legend.fertile': 'Fertile',
    'calendar.legend.ovulation': 'Ovulation',
    'calendar.legend.luteal': 'Luteal',
    'calendar.avg_cycle': 'Avg cycle',
    'calendar.days': 'days',
    'calendar.last_period': 'Last period',

    // Log Screen
    'log.title': 'Log',
    'log.period.start_question': 'Is your period starting today?',
    'log.period.start_button': 'Yes, start period',
    'log.period.day': 'Day of your period',
    'log.period.end': 'Mark period as ended',
    'log.flow.light': 'Light',
    'log.flow.medium': 'Medium',
    'log.flow.heavy': 'Heavy',
    'log.flow.spotting': 'Spotting',
    'log.notes.placeholder': 'How was your day? (optional)',
    'log.save': 'Save',
    'log.saved': 'Saved ✓',

    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.cycle': 'Cycle',
    'settings.cycle_length': 'Cycle length',
    'settings.period_length': 'Period length',
    'settings.days': 'days',
    'settings.language': 'Language',
    'settings.account': 'Account',
    'settings.logout': 'Log out',
    'settings.delete_account': 'Delete account',
    'settings.delete_confirm': 'Are you sure? All your data will be deleted.',
    'settings.delete_yes': 'Yes, delete',
    'settings.delete_no': 'Cancel',

    // Auth
    'auth.welcome': 'Welcome',
    'auth.tagline': 'Your cosmic rhythm',
    'auth.google': 'Continue with Google',
    'auth.apple': 'Continue with Apple',
    'auth.email': 'Sign in with Email',
    'auth.have_account': 'I already have an account',
    'auth.login': 'Sign in',
    'auth.register': 'Sign up',
    'auth.email_label': 'Email',
    'auth.password_label': 'Password',
    'auth.password_confirm': 'Confirm password',
    'auth.forgot_password': 'Forgot password?',
    'auth.no_account': 'No account yet?',
    'auth.create_account': 'Create account',

    // Onboarding
    'onboarding.step1.title': 'How long is your cycle?',
    'onboarding.step1.desc': 'Most cycles are 21–35 days.',
    'onboarding.step2.title': 'How long does your period last?',
    'onboarding.step2.desc': 'Usually 3–7 days.',
    'onboarding.step3.title': 'When did your last period start?',
    'onboarding.step3.desc': 'As precise as possible.',
    'onboarding.step4.title': 'Which language do you prefer?',
    'onboarding.start': 'Get started',
    'onboarding.next': 'Next',
    'onboarding.back': 'Back',

    // Errors
    'error.generic': 'Something went wrong. Please try again.',
    'error.network': 'No connection. Please check your internet.',
    'error.email_taken': 'This email is already registered.',
    'error.wrong_password': 'Email or password incorrect.',
    'error.weak_password': 'Password must be at least 8 characters.',
    'error.passwords_mismatch': 'Passwords do not match.',
  }
}
```

---

## Spirituelle Impulse — Komplette Bibliothek

Diese Impulse direkt in Supabase `impulses` Tabelle einfügen:

```sql
INSERT INTO public.impulses (cycle_phase, moon_phase, text_de, text_en) VALUES

-- MENSTRUATION × alle Mondphasen
('menstruation', 'any', 
 'Zeit für Rückzug und innere Stille. Dein Körper reinigt sich.', 
 'Time for retreat and inner stillness. Your body is cleansing itself.'),
('menstruation', 'new_moon', 
 'Neumond und Menstruation vereinen sich — ein kraftvoller Neuanfang entsteht in dir.', 
 'New moon and menstruation unite — a powerful new beginning is forming within you.'),
('menstruation', 'full_moon', 
 'Vollmond in deiner Rückzugsphase. Lass los, was nicht mehr dient.', 
 'Full moon in your retreat phase. Release what no longer serves you.'),
('menstruation', 'waning_crescent', 
 'Wie der Mond sich zurückzieht, darfst auch du es. Ruhe ist heilig.', 
 'As the moon withdraws, so may you. Rest is sacred.'),

-- FOLLIKELPHASE × alle Mondphasen
('follicular', 'any', 
 'Neue Energie entfaltet sich in dir. Lass sie wachsen.', 
 'New energy is unfolding within you. Let it grow.'),
('follicular', 'waxing_crescent', 
 'Wie die Sichel zunimmt, wächst auch deine Kraft. Pflanze neue Absichten.', 
 'As the crescent grows, so does your strength. Plant new intentions.'),
('follicular', 'new_moon', 
 'Neumond und Follikelphase — ideale Zeit für neue Beginne.', 
 'New moon and follicular phase — ideal time for new beginnings.'),
('follicular', 'first_quarter', 
 'Das erste Viertel trifft auf deine aufblühende Energie. Handle jetzt.', 
 'The first quarter meets your blossoming energy. Act now.'),
('follicular', 'waxing_gibbous', 
 'Du bist fast auf dem Höhepunkt. Deine Ideen suchen Form.', 
 'You are almost at your peak. Your ideas are seeking form.'),

-- EISPRUNG × alle Mondphasen
('ovulation', 'any', 
 'Dein Leuchten ist heute am hellsten. Die Welt sieht dich.', 
 'Your light shines brightest today. The world sees you.'),
('ovulation', 'full_moon', 
 'Vollmond und Eisprung — du bist in deiner absoluten Kraft. Strahle.', 
 'Full moon and ovulation — you are in your absolute power. Radiate.'),
('ovulation', 'waxing_gibbous', 
 'Fast Vollmond, fast Eisprung — deine Energie ist magnetisch.', 
 'Nearly full moon, nearly ovulation — your energy is magnetic.'),
('ovulation', 'first_quarter', 
 'Du triffst Entscheidungen mit Klarheit. Vertraue deiner Stimme.', 
 'You make decisions with clarity. Trust your voice.'),

-- LUTEALPHASE × alle Mondphasen
('luteal', 'any', 
 'Deine Intuition führt dich nach innen. Vertraue ihr.', 
 'Your intuition leads you inward. Trust it.'),
('luteal', 'waning_gibbous', 
 'Zeit des Loslassens beginnt. Was brauchst du nicht mehr?', 
 'The time of release begins. What do you no longer need?'),
('luteal', 'last_quarter', 
 'Letztes Viertel — Zeit für Reflexion und ehrliche Selbstbetrachtung.', 
 'Last quarter — time for reflection and honest self-examination.'),
('luteal', 'waning_crescent', 
 'Dein Körper bereitet sich vor. Schenk dir Sanftheit und Geduld.', 
 'Your body is preparing. Gift yourself gentleness and patience.'),
('luteal', 'new_moon', 
 'Neumond trifft deine tiefste Innenphase. Tiefe Weisheit wartet.', 
 'New moon meets your deepest inner phase. Deep wisdom awaits.'),
('luteal', 'full_moon', 
 'Vollmond in der Lutealphase — Gefühle dürfen sein. Lass sie fließen.', 
 'Full moon in the luteal phase — feelings are allowed. Let them flow.'),

-- ALLGEMEIN × besondere Mondmomente
('any', 'new_moon', 
 'Der Neumond lädt dich ein: Was möchtest du neu beginnen?', 
 'The new moon invites you: What do you want to begin anew?'),
('any', 'full_moon', 
 'Vollmond — eine Zeit der Fülle. Wofür bist du heute dankbar?', 
 'Full moon — a time of fullness. What are you grateful for today?'),
('any', 'first_quarter', 
 'Das erste Viertel fordert Entscheidungen. Welchen Schritt wagst du?', 
 'The first quarter calls for decisions. What step will you take?'),
('any', 'last_quarter', 
 'Letztes Viertel — was kannst du loslassen, das dich beschwert?', 
 'Last quarter — what can you release that weighs on you?');
```

---

*Weiter mit: 07_LAUNCH_CHECKLIST.md*
