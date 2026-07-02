# Architektur — lunaracycle

---

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Framework | Next.js (App Router) | 16.2.1 |
| UI | React | 18 |
| Sprache | TypeScript | 5 (strict) |
| Styling | Tailwind CSS | 3.3 |
| Deployment | Vercel (static export) | — |
| Datenpersistenz | localStorage | — |
| Kein Backend | — | kein Server, kein DB |

---

## Komponentenbaum

```
app/page.tsx (Haupt-Orchestrator)
│
├── State: data (StoredData), tab, googleToken, googleEvents
├── useEffect: loadData() + getStoredToken()
│
├── [kein lastPeriodStart] → OnboardingScreen
│     └── onComplete → handleDataChange
│
└── [hat lastPeriodStart] → Tabs
      │
      ├── HomeScreen        (tab='home')
      │     Props: cycle, data, t, onDataChange, onNavigate
      │
      ├── CalendarScreen    (tab='calendar')
      │     Props: cycle, data, t, googleEvents
      │
      ├── LogScreen         (tab='log')
      │     Props: cycle, data, t, onDataChange, onNavigate
      │
      ├── FeedbackScreen    (tab='feedback')
      │     Props: data, t
      │
      └── SettingsScreen    (tab='settings')
            Props: data, t, onDataChange, onGoogleToken

      + BottomNav (immer sichtbar)
            Props: active, onNavigate, t
```

---

## Datenfluss

```
localStorage ('lunaracycle')
        ↓
    loadData()              → StoredData (mit DEFAULT_DATA Fallback)
        ↓
    calcCycle(data)         → CycleState (berechnet, nicht gespeichert)
        ↓
    T[data.language]        → Translations
        ↓
    Screens (Props)         → UI
        ↓
    onDataChange(partial)   → setData + saveData(updated)
        ↓
    localStorage            → persistiert
```

---

## Lib-Dateien

| Datei | Zweck | Key Exports |
|-------|-------|-------------|
| `cycle.ts` | Zyklus-Berechnungen + Datenmodell | `calcCycle()`, `loadData()`, `saveData()`, `StoredData`, `CycleState`, `PeriodLog` |
| `i18n.ts` | Übersetzungen DE + EN | `T`, `Lang`, `Translations` |
| `moon.ts` | Mondphasen (Jean Meeus) | `getMoonPhase(date?)` → `{ emoji, name, illumination }` |
| `impulses.ts` | Tages-Impulse pro Phase | `getTodayImpulse(phase, lang)` |
| `dailytips.ts` | Tips + Supplements pro Zyklustag | `getDayTip(cycleDay, lang)` → `{ tipp, supplement }` |
| `googleCalendar.ts` | Google Calendar OAuth + Events | `connectGoogle()`, `fetchEvents()`, `getStoredToken()`, `clearToken()` |

---

## Screens — Verantwortlichkeiten

### HomeScreen
- Mondphase (emoji, name, illumination %)
- Aktueller Zyklustag + Phase (farbige Karte)
- 3 Info-Karten: Mond / Phase / Check-in
- Tages-Impuls (aus `impulses.ts`)
- Tages-Tipp + Supplement (aus `dailytips.ts`)
- Stimmungs-Check-in (8 Emojis, in `checkIns` gespeichert)
- "Ersten Eintrag machen" wenn noch kein Datum → navigiert zu Log

### CalendarScreen
- Full-screen Monatskalender (`calc(100dvh - 80px)`)
- 4 Phasen farbkodiert (Soft-Varianten)
- 🩸 für Menstruationstage, ☀️ für Eisprung, Mondphasen-Emoji für alle anderen
- Google Events als weiße Punkte + Detail-Panel
- Legende + Zusammenfassung scrollbar darunter

### LogScreen
- **Zustand 1 (kein Datum):** → Settings-Verweis
- **Zustand 2 (Periode aktiv):** Now-Playing Indicator (pulsierender Punkt, Tag-Zahl 72px, Fortschrittsbalken), Intensität-Buttons (gespeichert), "Periode beendet" Button
- **Zustand 3 (andere Phase):** Phase-Info + "Periode beginnt heute" + "→ Einstellungen" Link

### SettingsScreen
- Letzter Periodenbeginn (Datumspicker)
- Zykluslänge (Slider 21–45)
- Periodendauer (Slider 2–10)
- Sprache (DE/EN Toggle)
- Google Kalender (Connect/Trennen)
- Reset-Button

---

## Deployment

```bash
# Lokal bauen + prüfen
npm run build

# Auf Vercel deployen
npx vercel --prod --yes
```

- Static Export → Vercel CDN
- Kein Server-Side Rendering nötig
- Environment Variable für Google Calendar: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
