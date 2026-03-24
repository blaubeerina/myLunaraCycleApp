# Agent-Architektur — Luna App (Matriarchal System)

## Überblick
Die Luna App verwendet eine Matriarchal Agent Architecture mit Feedback-Loops zwischen allen Agenten.

## Agenten

### MoonAgent
- **Aufgabe**: Mondphasenberechnung (Jean Meeus Algorithmus)
- **Input**: Datum
- **Output**: Phase, Illumination %, Emoji, lokalisierter Name (DE/EN)
- **Referenz**: Neumond 6. Jan 2000, 18:14 UTC | Lunar Cycle: 29.53059 Tage
- **Gibt an**: OracleAgent (Mondkontext für Impulse)

### CycleAgent
- **Aufgabe**: Menstruationszyklus-Berechnungen
- **Input**: userId, letzte Periodeneinträge aus Supabase
- **Output**: currentCycleDay, currentPhase, nextPeriodDate, ovulationDate, fertileWindow
- **Gibt an**: CalendarAgent (Zyklustage hervorheben)

### CalendarAgent
- **Aufgabe**: Kalenderdarstellung mit Farb-Kategorien
- **Input**: CycleAgent-Daten + MoonAgent-Daten + Monat
- **Output**: DayData[] mit Phase-Farben für jeden Kalendertag
- **Farben**:
  - Menstruation: Dusty Rose (#C4858A)
  - Follikelphase: Soft Teal (#6BAAB0)
  - Eisprung: Pale Gold (#C9A84C)
  - Lutealphase: Muted Lavender (#9B8EC4)

### OracleAgent
- **Aufgabe**: Spirituelle Tagesimpulse generieren
- **Input**: currentCyclePhase + currentMoonPhase + Sprache
- **Output**: Text (poetisch, nicht kitschig)
- **Quellen**: Supabase impulses-Tabelle ODER Claude API / GROQ als Fallback
- **Qualitätsprüfung**: Mutter-Agentin prüft Output vor Anzeige

## Feedback-Loop Struktur

```
MoonAgent → Mondkontext → OracleAgent → Tagesimpuls → [Qualitätsprüfung]
                                                              ↑
CycleAgent → Zyklusphase → OracleAgent
CycleAgent → Zyklustage → CalendarAgent → Kalender mit Farben
```

## Implementierung in Supabase
- MoonAgent → client-seitiger Hook `useMoonPhase()` (kein API-Call)
- CycleAgent → client-seitiger Hook `useCycleCalculations()`
- CalendarAgent → client-seitiger Hook `useCalendarData()`
- OracleAgent → Supabase Edge Function (Claude/GROQ API server-seitig)

## Stack-Alternativen (Referenz)
Ursprünglich als FastAPI/MongoDB Backend geplant:
- Python FastAPI mit Motor (async MongoDB)
- Claude API direkt für Oracle Texte
- Jean Meeus Mondberechnungen in Python

→ Für v1 wird Supabase bevorzugt (einfacher, schneller zu deployen)
→ FastAPI Backend kann in v2 als eigenständiger Microservice gebaut werden
