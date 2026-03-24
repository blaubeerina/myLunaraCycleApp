# ⚙️ LUNARACYCLE — Core Logic
**Datei für Phase 4 — Das Gehirn der App**

---

## Wichtig: Diese Phase ZUERST — vor UI Screens

Die Berechnungen müssen stabil sein, bevor du UI baust.
Sonst baust du UI auf wackeligem Fundament.

---

## Modul 1 — Zyklusberechnung

### Was berechnet wird

Aus den `cycle_entries` (Blutungseinträge) berechnet die App:

| Ausgabe | Beschreibung |
|---------|--------------|
| `currentCycleDay` | Welcher Tag im Zyklus ist heute? (1-45) |
| `currentPhase` | Welche Zyklusphase gerade aktiv ist |
| `nextPeriodDate` | Wann kommt die nächste Periode |
| `fertileWindowStart` | Beginn der fruchtbaren Phase |
| `fertileWindowEnd` | Ende der fruchtbaren Phase |
| `ovulationDate` | Voraussichtlicher Eisprung |
| `daysUntilNextPeriod` | Countdown |
| `isLate` | Ist die Periode überfällig? (boolean) |
| `daysLate` | Wie viele Tage überfällig |

### Algorithmus

```
1. Hole letzte 3 is_period_start = true Einträge aus cycle_entries
2. Berechne durchschnittliche Zykluslänge aus diesen Einträgen
   (Fallback: profiles.cycle_length wenn weniger als 2 Einträge)
3. Letztes Startdatum = Beginn des aktuellen Zyklus
4. currentCycleDay = heute - letztesPeriodeStartdatum + 1
5. Eisprung = letztesPeriodeStart + (zyklusLänge - 14) Tage
6. Fruchtbar = Eisprung - 5 bis Eisprung + 1
7. Nächste Periode = letztesPeriodeStart + zyklusLänge
```

### Phasenzuordnung

```
Menstruation:   cycleDay 1 bis profiles.period_length
Follikelphase:  cycleDay (period_length+1) bis (ovulationDay-1)
Eisprung:       cycleDay (ovulationDay-1) bis (ovulationDay+1)
Lutealphase:    cycleDay (ovulationDay+2) bis zyklusEnde
```

---

## Modul 2 — Mondphasen

### Berechnung

Die Mondphasen werden astronomisch berechnet (kein API-Call nötig).

Lunar cycle = 29.53059 Tage
Referenzdatum (bekannter Neumond): 6. Januar 2000, 18:14 UTC

```javascript
function getMoonPhase(date) {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const lunarCycle = 29.53059;
  const daysSince = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
  const cyclePosition = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle;
  const illumination = (1 - Math.cos((cyclePosition / lunarCycle) * 2 * Math.PI)) / 2;
  
  // Phase bestimmen
  if (cyclePosition < 1.85) return 'new_moon';
  if (cyclePosition < 7.38) return 'waxing_crescent';
  if (cyclePosition < 9.22) return 'first_quarter';
  if (cyclePosition < 14.77) return 'waxing_gibbous';
  if (cyclePosition < 16.61) return 'full_moon';
  if (cyclePosition < 22.15) return 'waning_gibbous';
  if (cyclePosition < 23.99) return 'last_quarter';
  return 'waning_crescent';
}
```

### Mondphasen Mapping

```javascript
const moonPhaseNames = {
  de: {
    new_moon: 'Neumond',
    waxing_crescent: 'Zunehmende Sichel',
    first_quarter: 'Erstes Viertel',
    waxing_gibbous: 'Zunehmender Mond',
    full_moon: 'Vollmond',
    waning_gibbous: 'Abnehmender Mond',
    last_quarter: 'Letztes Viertel',
    waning_crescent: 'Abnehmende Sichel'
  },
  en: {
    new_moon: 'New Moon',
    waxing_crescent: 'Waxing Crescent',
    first_quarter: 'First Quarter',
    waxing_gibbous: 'Waxing Gibbous',
    full_moon: 'Full Moon',
    waning_gibbous: 'Waning Gibbous',
    last_quarter: 'Last Quarter',
    waning_crescent: 'Waning Crescent'
  }
}

const moonPhaseEmojis = {
  new_moon: '🌑',
  waxing_crescent: '🌒',
  first_quarter: '🌓',
  waxing_gibbous: '🌔',
  full_moon: '🌕',
  waning_gibbous: '🌖',
  last_quarter: '🌗',
  waning_crescent: '🌘'
}
```

---

## Modul 3 — Impuls-Auswahl

```
1. Bestimme currentCyclePhase (menstruation / follicular / ovulation / luteal)
2. Bestimme heutige moonPhase
3. Query: SELECT * FROM impulses 
   WHERE (cycle_phase = currentPhase OR cycle_phase = 'any')
   AND (moon_phase = currentMoonPhase OR moon_phase = 'any')
   AND is_active = true
   ORDER BY 
     CASE WHEN cycle_phase = currentPhase AND moon_phase = currentMoonPhase THEN 1
          WHEN cycle_phase = currentPhase THEN 2
          WHEN moon_phase = currentMoonPhase THEN 3
          ELSE 4 END
   LIMIT 1
4. Gib text_de oder text_en zurück basierend auf profiles.language
```

---

## Lovable Prompt — Core Logic

```
Build the core calculation logic for Lunaracycle as custom React hooks.
Do NOT build UI for these yet — only the logic layer.

Hook 1: useCycleCalculations(userId)
Fetches cycle_entries from Supabase where is_period_start = true,
ordered by entry_date DESC, limit 5.
Also fetches user profile (cycle_length, period_length).
Returns: {
  currentCycleDay: number,
  currentPhase: 'menstruation' | 'follicular' | 'ovulation' | 'luteal',
  nextPeriodDate: Date,
  ovulationDate: Date,
  fertileWindowStart: Date,
  fertileWindowEnd: Date,
  daysUntilNextPeriod: number,
  isLate: boolean,
  daysLate: number,
  isLoading: boolean,
  error: string | null
}

Hook 2: useMoonPhase(date?: Date)
Calculates moon phase mathematically (no API needed).
Use known new moon reference: January 6, 2000 18:14 UTC
Lunar cycle: 29.53059 days
Returns: {
  phase: string (one of 8 phases),
  phaseName: string (in user's language),
  phaseEmoji: string,
  illuminationPercent: number
}

Hook 3: useTodayImpulse(userId)
Combines cycle phase + moon phase to fetch best matching impulse from Supabase.
Returns impulse text in user's language (de or en).
Returns: { text: string, isLoading: boolean }

Hook 4: useCalendarData(userId, month: Date)
Fetches all cycle_entries for a given month.
Calculates which days are: period / fertile / ovulation / luteal.
Also calculates moon phase for each day in month.
Returns: array of DayData objects for calendar rendering.

Write clean, typed TypeScript. Add JSDoc comments to each hook.
Handle loading and error states properly.
```

---

## Test Cases (manuell prüfen nach Implementierung)

```
Test 1: Keine Einträge vorhanden
→ App soll nicht crashen
→ Soll Onboarding-Daten als Fallback nutzen

Test 2: Letzte Periode vor 30 Tagen (Zyklus 28 Tage)
→ isLate = true, daysLate = 2

Test 3: Letzte Periode vor 14 Tagen (Zyklus 28 Tage)
→ Phase = ovulation, fertileWindow aktiv

Test 4: Mondphase heute
→ Manuell mit Kalender-App vergleichen
```

---

*Weiter mit: 05_UI_SCREENS.md*
