# Projektstatus — lunaracycle

**Stand: Mai 2026 · v0.2 Beta**

---

## Live

- **URL:** https://lunaracycle.vercel.app
- **Deploy:** Vercel (static export, kein Server)
- **Letzte Deployment:** März 2026

---

## Features — Fertig ✅

### Screens
| Screen | Status | Notizen |
|--------|--------|---------|
| OnboardingScreen | ✅ | Datum, Zykluslänge, Sprache |
| HomeScreen | ✅ | Mondphase, Zyklustag, Phase-Karte, Impuls, Tipp, Check-in |
| CalendarScreen | ✅ | Full-screen, 4 Phasen farbkodiert, 🩸/☀️ Emojis, Legende |
| LogScreen | ✅ | Now-Playing Indicator, Intensität (gespeichert), Start/Ende Periode |
| SettingsScreen | ✅ | Periodendatum, Zykluslänge, Periodendauer, Sprache, Reset |
| FeedbackScreen | ✅ | Formspree ID: xreozebq |
| BottomNav | ✅ | 5 Tabs: Mond / Kalender / Eintrag / Feedback / Einstellungen |

### Kern-Logik
| Feature | Status | Notizen |
|---------|--------|---------|
| Zyklus-Berechnung | ✅ | Jean Meeus Algorithmus |
| 4 Phasen-Berechnung | ✅ | menstruation / follicular / ovulation / luteal |
| Auto-Ende Periode | ✅ | nach periodLength Tagen automatisch |
| Manuelles Periode-Ende | ✅ | endedToday Flag, wirkt im Kalender |
| Mondberechnungen | ✅ | Jean Meeus, korrekte Mondphasen |
| Daily Impulse | ✅ | phasenbasiert, DE+EN |
| Daily Tips + Supplements | ✅ | 28-Tage Zyklus, aus CSV-Daten |
| i18n DE + EN | ✅ | vollständig bilingual |
| localStorage Persistenz | ✅ | Key: 'lunaracycle' |
| Onboarding Flow | ✅ | zeigt sich wenn kein lastPeriodStart |

---

## Session 5 (Mai 2026)
- Dark Editorial Redesign: Warmes Charcoal (#18160f) + Gold, ersetzt "Misty Morning Gold"
- Neue Fonts: Cinzel (serif-display) + Great Vibes (script) in Tailwind + Google Fonts
- Cycle History: `periodHistory: string[]` in StoredData, `getDayPhaseFromHistory()`, `startPeriod()` speichert History automatisch
- CalendarScreen nutzt echte historische Zyklusdaten statt Modulo-Schätzung

## In Arbeit / Bereit aber nicht aktiv 🔧

| Feature | Status | Was fehlt |
|---------|--------|-----------|
| Google Calendar (read-only) | 🔧 Code fertig | User braucht: Google Cloud Projekt + OAuth Client ID → Vercel Env Var `NEXT_PUBLIC_GOOGLE_CLIENT_ID` setzen |

---

## Backlog / Geplant 📋

| Feature | Priorität | Notizen |
|---------|-----------|---------|
| Journal-Tab | hoch | Tagesnotizen zur Periode/Phase |
| Reminders / Push Notifications | mittel | PWA Service Worker nötig |
| Pregnancy Mode | niedrig | v2 Feature |
| Cycle History / Statistiken | mittel | mehrere vergangene Zyklen tracken |
| Oracle / AI Texte | niedrig | Claude API für personalisierte Impulse |

---

## Letzte Änderungen (März 2026)

### Session 4 (aktuell)
- CLAUDE_WORKSPACE Ordner angelegt

### Session 3
- Settings-Only Regel: Datumspicker aus LogScreen entfernt, → Settings Links eingebaut
- Kalender Full-Screen: `calc(100dvh - 80px)`, `gridTemplateRows: repeat(N, 1fr)`
- Kalender Farben: Soft-Varianten aus Moodboard (#E8B4B8, #A8D0D4, #E2C87A, #C4BBE0)
- Phasen-Border für alle Zellen, Datumszahlen in Phasenfarbe

### Session 2
- Now-Playing Indicator im LogScreen (pulsierender Punkt, große Tag-Zahl, Fortschrittsbalken)
- StoredData um `logs: Record<string, PeriodLog>` erweitert
- Intensität wird jetzt persistiert (localStorage)
- endPeriod() korrigiert: setzt logs[today].endedToday = true statt Datum zu manipulieren
- effectivePeriodLength in CycleState + calcCycle()
- Google Calendar lib + SettingsScreen Connect-Button

### Session 1
- Design Refresh (Glassmorphism, Noise Texture, Ambient Glow)
- Kalender komplett neu gebaut (alle Phasen, Mondphasen, Ovulationstag)
- Onboarding Screen
- Daily Tips + Supplements (dailytips.ts)
- BottomNav Navigation

---

## Technische Schulden

- `docs/` Ordner hat ältere Docs (02_SUPABASE_SCHEMA.md etc.) — nicht mehr aktuell, können bereinigt werden
- FeedbackScreen nutzt Formspree — kein echtes Feedback-Management
- Keine Tests
