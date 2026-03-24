# 📋 LUNARACYCLE — Project Brief
**Datei für Phase 1 — Erster Prompt in Lovable**

---

## App Name
Lunaracycle

## Tagline
"Your cosmic rhythm" / "Dein kosmischer Rhythmus"

## Was ist Lunaracycle?

Eine Web App, die den Menstruationszyklus einer Nutzerin mit dem Mondzyklus verbindet.
Keine medizinische App. Kein klinischer Tracker.
Eine spirituelle, intuitive Begleiterin für innere Rhythmen.

**Gefühl beim Öffnen:** "Ich verbinde mich mit meinem Körper."

---

## Tech Stack — nicht verhandelbar

| Komponente | Technologie |
|------------|-------------|
| Frontend | React (Lovable default) |
| Backend | Supabase |
| Auth | Supabase Auth |
| Datenbank | Supabase PostgreSQL |
| Hosting | Lovable / Vercel |
| Payment | Stripe (später, Phase 7) |
| Sprachen | Deutsch + Englisch (i18n) |

---

## Zielgruppe

Frauen / menstruierende Personen, die:
- ihren Zyklus verstehen wollen
- spirituell interessiert sind
- minimalistische, schöne Apps bevorzugen
- keine komplizierte Bedienung wollen

---

## Core Features — v1

### MUSS drin sein (Non-Negotiable)
- [ ] Zykluserfassung (nur Blutungsbeginn manuell)
- [ ] Automatische Berechnung: Zyklusphase, nächste Periode, Eisprung
- [ ] Mondphasen-Integration (tägliche Mondphase anzeigen)
- [ ] Kombinierter Kalender (Mondphase + Zyklus)
- [ ] Spirituelle Tagesimpulse (basierend auf Phase + Mondphase)
- [ ] Daily Check-in via Emojis
- [ ] Login (Email + Google + Apple)
- [ ] Zweisprachig (DE / EN)
- [ ] Einmalige Zahlung (Stripe)

### NICHT in v1 (für später)
- Community Features
- Push Notifications
- Partner-Ansicht
- Detaillierte Symptom-Logs

---

## Design System

### Farben
```
Background:    #0D0B1A  (Midnight Indigo)
Surface:       #1C1836  (Deep Cosmos)
Text:          #F4EFE6  (Moon Ivory)
Accent Gold:   #C9A84C  (Pale Gold) — Mond, CTA
Rose:          #C4858A  (Dusty Rose) — Menstruation
Lavender:      #9B8EC4  (Muted Lavender) — Lutealphase
Teal:          #6BAAB0  (Soft Teal) — Fruchtbare Phase
```

### Typografie
```
Überschriften:  Cormorant Garamond (Light / Italic)
Fließtext:      DM Sans (Light / Regular)
Labels:         DM Sans (Uppercase, Letter-Spacing)
```

### Design-Prinzipien
- Dark Mode only
- Alles rund (border-radius großzügig)
- Viel Whitespace — die App soll atmen
- Keine scharfen Kanten
- Keine Animationen in v1 (statisch, meditativ)
- Mondgrafiken als zentrales visuelles Element

---

## User Flow (Hauptnavigation)

```
Startscreen (Home)
├── Großer Mond oben
├── Zyklustag + Phase
├── 3 Karten: Mondphase / Zyklusphase / Energie
├── Tagesimpuls
└── Emoji Check-in

Kalender
├── Monatsansicht
├── Zyklusdaten eingetragen
└── Mondphasen-Icons pro Tag

Eintrag machen
└── Blutung starten/stoppen
    └── Intensität (leicht / mittel / stark)

Profil / Settings
├── Zykluslänge anpassen
├── Sprache wechseln
└── Account-Einstellungen
```

---

## Datenmodell (Übersicht — Details in 02_SUPABASE_SCHEMA.md)

```
users           → Auth + Profil
cycle_entries   → Blutungseinträge
daily_checkins  → Emoji Check-ins
moon_phases     → Mondphasen-Daten (pre-calculated)
impulses        → Spirituelle Textimpulse (DE + EN)
```

---

## Erster Prompt für Lovable

Kopiere diesen Text als allerersten Prompt:

```
I'm building a web app called Lunaracycle — a menstrual cycle and moon cycle tracker 
with a spiritual, minimal aesthetic. Tech stack: React frontend, Supabase backend.

Please set up the project with:
1. Supabase integration (I'll connect my Supabase project)
2. React Router for navigation (4 tabs: Home, Calendar, Log, Settings)
3. The following color variables in a global CSS file:
   --midnight: #0D0B1A
   --surface: #1C1836
   --ivory: #F4EFE6
   --gold: #C9A84C
   --rose: #C4858A
   --lavender: #9B8EC4
   --teal: #6BAAB0
4. Google Fonts: Cormorant Garamond (300, 400, 600, italic) + DM Sans (300, 400, 500)
5. A basic app shell with dark background (#0D0B1A) and bottom navigation

Do NOT build any features yet. Only the project foundation.
```

---

*Weiter mit: 02_SUPABASE_SCHEMA.md*
