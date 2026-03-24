# 🎨 LUNARACYCLE — UI Screens
**Datei für Phase 5 — Alle Screens im Detail**

---

## Baue einen Screen nach dem anderen
## Niemals alle auf einmal in einem Prompt

Reihenfolge:
```
5A → HomeScreen (Startseite)
5B → CalendarScreen (Kalender)
5C → LogScreen (Eintrag machen)
5D → SettingsScreen (Einstellungen)
5E → Globale Komponenten (MoonIcon, PhaseCard, etc.)
```

---

## 5A — HomeScreen

### Layout (von oben nach unten)

```
[STATUS BAR AREA]

[HEADER]
  Links: "lunaracycle" (Cormorant Garamond, 18px, gold)
  Rechts: Avatar-Icon (rund, 32px)

[MOND]
  Zentriert
  SVG Mond, grafisch-minimal, gold (#C9A84C)
  Größe: 120px
  Goldener Glow dahinter (box-shadow / filter)
  Zeigt aktuelle Mondphase visuell
  Darunter: Mondphasen-Name (DM Sans, 11px, uppercase, gedimmt)

[ZYKLUS INFO]
  Zentriert
  "Zyklustag 12" (Cormorant Garamond, 36px, ivory)
  "Follikelphase · 16 Tage bis zur Periode" (DM Sans, 11px, gedimmt)

[KARTEN ROW — 3 Karten nebeneinander]
  Karte 1: 🌒  |  Mond  |  "Zunehmend"
  Karte 2: 🌸  |  Phase  |  "Follikel"
  Karte 3: ✨  |  Energie  |  "Aufblühend"
  
  Karten: background #1C1836, border 1px solid rgba(255,255,255,0.07)
  border-radius: 16px, padding: 12px 8px, text-align: center

[TAGESIMPULS]
  background: rgba(107,170,176,0.06)
  border: 1px solid rgba(107,170,176,0.15)
  border-radius: 20px
  Label: "HEUTIGER IMPULS" (8px, uppercase, teal, letter-spacing)
  Text: (Cormorant Garamond Italic, 16px, ivory)
  Aus useTodayImpulse Hook

[CHECK-IN]
  Label: "WIE FÜHLST DU DICH?" (8px, uppercase, gedimmt)
  4 Emoji-Buttons in einer Reihe:
    🙂 Stimmung  |  🔥 Energie  |  🌧 Sensibel  |  🌊 Intuition
  Button: background rgba(255,255,255,0.04), border radius 14px
  Tap → öffnet Modal für Detail-Auswahl
  Bereits heute eingecheckt → Buttons grün-markiert

[BOTTOM NAVIGATION — fixiert]
  4 Icons: 🌙 Home | 📅 Kalender | ➕ Log | ⚙️ Settings
  Aktiver Tab: gold dot darunter
  Inaktive: opacity 0.3
```

### Lovable Prompt 5A

```
Build the HomeScreen for Lunaracycle using the hooks from Phase 4.

Layout (top to bottom, dark background #0D0B1A):
1. Small header: "lunaracycle" in Cormorant Garamond gold left, avatar right
2. Moon SVG (crescent shape, gold #C9A84C, 120px, with subtle glow) — 
   shape changes based on useMoonPhase() result. Show phase name below in 
   DM Sans 11px uppercase, dimmed.
3. Cycle day display: "Zyklustag {n}" in Cormorant Garamond 36px ivory, 
   phase name + days until period below in DM Sans 11px
4. Three cards row: Moon phase / Cycle phase / Energy label
   Cards: #1C1836 background, subtle border, rounded 16px
5. Daily impulse card: teal-tinted, italic Cormorant Garamond text 
   from useTodayImpulse()
6. Emoji check-in row: 4 buttons (mood, energy, sensitivity, intuition).
   Tapping opens a small bottom sheet for selecting the specific value.
   Save to daily_checkins in Supabase.

Use the CSS variables defined in Phase 1.
All text in user's language (de/en from profile).
Show skeleton loaders while data loads.
Do NOT build other screens yet.
```

---

## 5B — CalendarScreen

### Layout

```
[HEADER]
  "< März 2025 >" (Monatsnavigation)
  Legende: 🔴 Periode | 🟣 Luteal | 🟢 Fruchtbar | 🟡 Eisprung

[KALENDER GRID — 7 Spalten]
  Mo Di Mi Do Fr Sa So
  
  Jede Zelle (Tag):
  - Datum-Zahl (oben)
  - Mondphasen-Emoji (klein, unten links) — nur an Major-Phasen
  - Hintergrundfarbe je nach Zyklusphase (sehr sanft, entsättigt)
  - Heute: Gold-Ring um die Zahl
  - Hat Eintrag: kleiner Punkt unten

[MONATS-ZUSAMMENFASSUNG]
  "Durchschnittlicher Zyklus: 27 Tage"
  "Letzte Periode: 12. März"
```

### Lovable Prompt 5B

```
Build the CalendarScreen for Lunaracycle.

Use the useCalendarData(userId, month) hook from Phase 4.

Calendar grid (7 columns, Mo-So):
- Each day cell shows the date number
- Background tint based on cycle phase (very subtle, desaturated):
  Period: rgba(196,133,138, 0.25)
  Follicular: rgba(201,168,76, 0.1)
  Ovulation: rgba(107,170,176, 0.25)
  Luteal: rgba(155,142,196, 0.15)
- Today: border 1px solid #C9A84C, slightly brighter
- Days with moon phase: show moon emoji (🌑🌒🌓🌔🌕🌖🌗🌘) small bottom-left
  Only show on major phases (new, quarter, full)
- Tapping a day opens a small bottom sheet showing:
  - Cycle day number
  - Phase name
  - Moon phase
  - If period entry exists: show flow intensity

Month navigation: arrows to go back/forward.
Legend below calendar: colored dots with labels.
Show a monthly summary below: avg cycle length, last period date.

All text bilingual based on profile language.
```

---

## 5C — LogScreen (Eintrag machen)

### Layout

```
[HEADER] "Eintrag" / "Log"

[HEUTE DATUM] "Donnerstag, 13. März 2025"

[PERIODE SECTION]
  "Beginnt heute deine Periode?" 
  [Ja, Periode starten] → setzt is_period_start = true
  
  Falls bereits aktive Periode:
  "Tag 3 deiner Periode"
  Intensität: [Leicht] [Mittel] [Stark] [Spotting]
  [Periode beendet markieren]

[NOTIZ SECTION]
  Kleines Textfeld (optional)
  "Wie war dein Tag?" Placeholder

[SPEICHERN BUTTON]
  Gold, abgerundet, full-width
```

### Lovable Prompt 5C

```
Build the LogScreen for Lunaracycle.

This screen has two states:

State A — No period active:
- Show today's date in Cormorant Garamond
- Large button "Periode beginnt heute" (ivory text, gold border, rounded)
- Tapping creates a cycle_entry with is_period_start = true, 
  entry_date = today, flow_intensity = 'medium'
- Optional notes textarea (minimal styling, dark)

State B — Period is active (there's a cycle_entry today or in last 7 days 
with is_period_start = true and no end marker):
- Show "Tag {n} deiner Periode" in Cormorant Garamond
- Flow intensity selector: 4 options as pill buttons
  (Leicht/Light, Mittel/Medium, Stark/Heavy, Spotting)
  Selected pill: gold background
- "Periode beendet" button (dimmed, secondary style)
- Optional notes textarea

Save button: gold background #C9A84C, dark text, full width, rounded 28px.
On save: upsert into cycle_entries table.

Handle the case where today already has an entry (show existing data pre-filled).
```

---

## 5D — SettingsScreen

### Layout

```
[PROFIL]
  Avatar (Initialen-Fallback)
  Display Name
  Email

[ZYKLUS EINSTELLUNGEN]
  Zykluslänge: [Slider 21-45] — aktuell: 28 Tage
  Periodenlänge: [Slider 2-10] — aktuell: 5 Tage

[APP EINSTELLUNGEN]
  Sprache: 🇩🇪 Deutsch / 🇬🇧 English (Toggle)

[ACCOUNT]
  [Ausloggen]
  [Account löschen] (rot, klein, unten)
```

### Lovable Prompt 5D

```
Build the SettingsScreen for Lunaracycle.

Sections (styled as cards with #1C1836 background, rounded 20px):

1. Profile section: avatar circle with user initials (Cormorant Garamond, 
   gold on dark), display name, email — all from useUser hook

2. Cycle settings (saves to profiles table):
   - Cycle length: range slider 21-45, current value shown in gold
   - Period length: range slider 2-10, current value shown in gold
   Custom slider styling: track dark, filled portion gold, thumb gold circle

3. Language toggle: "DE" and "EN" pill buttons. 
   Active: gold background. Inactive: transparent with border.
   Saves to profiles.language in Supabase.

4. Account actions:
   - Logout button: secondary style (border only)
   - Delete account: small, red text (#C4858A), requires confirmation modal

Changes save automatically on change (debounced 500ms).
Show a subtle "Gespeichert ✓" / "Saved ✓" toast on successful save.
```

---

*Weiter mit: 06_CONTENT_I18N.md*
