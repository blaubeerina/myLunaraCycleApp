# Datenmodell — lunaracycle

Alles lebt in `app/lib/cycle.ts`. Kein Backend, kein DB — nur localStorage.

---

## localStorage

**Key:** `'lunaracycle'`
**Format:** JSON string
**Geladen mit:** `loadData()` → merged mit `DEFAULT_DATA` (Fallback für fehlende Felder)
**Gespeichert mit:** `saveData(partial)` → merged mit vorhandenen Daten

---

## StoredData (gespeichert)

```typescript
interface StoredData {
  lastPeriodStart: string | null   // ISO-Datum "2026-03-15" oder null
  cycleLength: number              // Default: 28, Range: 21–45
  periodLength: number             // Default: 5, Range: 2–10
  language: 'de' | 'en'           // Default: 'de'
  checkIns: Record<string, string> // { "2026-03-26": "🙂" }
  logs: Record<string, PeriodLog>  // { "2026-03-26": { intensity: "medium" } }
}

const DEFAULT_DATA: StoredData = {
  lastPeriodStart: null,
  cycleLength: 28,
  periodLength: 5,
  language: 'de',
  checkIns: {},
  logs: {},
}
```

---

## PeriodLog (innerhalb `StoredData.logs`)

```typescript
interface PeriodLog {
  intensity: 'light' | 'medium' | 'heavy' | 'spotting'
  endedToday?: boolean   // true wenn User "Periode beendet" geklickt hat
}
```

**Wichtig:** `endedToday: true` wird von `calcCycle()` ausgewertet.
Wenn innerhalb des aktuellen Zyklus-Fensters ein `endedToday`-Eintrag gefunden wird,
endet die Menstruationsphase an diesem Tag (statt nach `periodLength` Tagen).

---

## CycleState (berechnet, nicht gespeichert)

```typescript
interface CycleState {
  lastPeriodStart: Date | null
  cycleLength: number
  periodLength: number
  effectivePeriodLength: number   // respektiert endedToday-Flag
  currentDay: number              // Tag im Zyklus (1-basiert)
  phase: CyclePhase
  nextPeriod: Date | null
  ovulationDate: Date | null
  fertileStart: Date | null       // ovulationDay - 5
  fertileEnd: Date | null         // ovulationDay + 1
  daysUntilNext: number
  isLate: boolean
  daysLate: number
}

type CyclePhase = 'menstruation' | 'follicular' | 'ovulation' | 'luteal' | 'unknown'
```

---

## calcCycle() — Logik

```
Input:  StoredData
Output: CycleState

1. Kein lastPeriodStart → phase = 'unknown', alles null/0

2. currentDay = floor((today - lastPeriodStart) / 86400000) + 1

3. effectivePeriodLength:
   - Suche logs[date].endedToday === true innerhalb (start bis start+periodLength)
   - Gefunden → effectivePeriodLength = daysSinceStart + 1
   - Nicht gefunden → effectivePeriodLength = periodLength

4. ovulationDay = cycleLength - 14  (Standard-Lutealphase)

5. Phase:
   currentDay 1..effectivePeriodLength → menstruation
   currentDay < ovulationDay - 1     → follicular
   currentDay ≤ ovulationDay + 1     → ovulation
   sonst                              → luteal
```

---

## getDayPhase() — Kalender (CalendarScreen.tsx)

```typescript
// Normalisiert beliebiges Datum in die Zyklusposition
const dayInCycle = ((daysSince % cycleLength) + cycleLength) % cycleLength + 1

// Prüft gegen effectivePeriodLength statt periodLength
if (dayInCycle <= (cycle.effectivePeriodLength ?? periodLength)) return 'menstruation'
```

**Wichtig:** `% cycleLength` ermöglicht Darstellung aller Monate (Vergangenheit + Zukunft).

---

## Datenfluss beim Speichern

```
User Aktion (z.B. Intensität wählen)
    ↓
onDataChange({ logs: { ...data.logs, [today]: { intensity: 'medium' } } })
    ↓
page.tsx: setData(prev => { updated = {...prev, ...partial}; saveData(updated); return updated })
    ↓
saveData(): loadData() + merge + localStorage.setItem('lunaracycle', JSON.stringify(...))
    ↓
React re-render → calcCycle(data) → neue CycleState → Screens aktualisiert
```

---

## Google Calendar Token (separat)

```
localStorage('gcal_token')       — OAuth Access Token
localStorage('gcal_token_expiry') — Expiry Timestamp (ms)
```

Verwaltet durch `app/lib/googleCalendar.ts`: `getStoredToken()`, `storeToken()`, `clearToken()`
