# ⚡ LUNARACYCLE — Prompts Cheatsheet
**Immer offen halten während du in Lovable arbeitest**

---

## Die goldene Regel für jeden Prompt

```
1. Beschreibe WAS du willst (nicht wie)
2. Gib immer Farben als HEX an
3. Sage explizit was NICHT gebaut werden soll
4. Maximal EINE Aufgabe pro Prompt
```

---

## PHASE 1 — Projekt Setup

### Prompt 1.1 — Fundament
```
I'm building a web app called Lunaracycle — a menstrual cycle and moon cycle 
tracker with a spiritual, minimal aesthetic. Tech stack: React frontend, 
Supabase backend.

Please set up the project with:
1. Supabase integration (I'll connect my Supabase project)
2. React Router for navigation (4 tabs: Home, Calendar, Log, Settings)
3. The following CSS variables in a global stylesheet:
   --midnight: #0D0B1A
   --surface: #1C1836
   --ivory: #F4EFE6
   --gold: #C9A84C
   --rose: #C4858A
   --lavender: #9B8EC4
   --teal: #6BAAB0
4. Google Fonts: Cormorant Garamond (300,400,italic) + DM Sans (300,400,500)
5. Dark background (#0D0B1A) app shell with bottom navigation placeholder

Do NOT build any features yet. Only the project foundation.
```

### Prompt 1.2 — Supabase Client
```
Connect the Supabase client using VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.

Create:
1. src/lib/supabase.ts — Supabase client
2. src/hooks/useUser.ts — returns current auth user + profile from profiles table
3. TypeScript types for all database tables (profiles, cycle_entries, 
   daily_checkins, moon_phases, impulses)

No UI. Data layer only.
```

---

## PHASE 3 — Auth

### Prompt 3.1 — Welcome Screen
```
Build the WelcomeScreen for Lunaracycle.

Full dark screen (#0D0B1A). Centered layout:
- SVG moon (crescent, gold #C9A84C, 90px, subtle glow)
- "lunaracycle" in Cormorant Garamond Light 48px ivory, letter-spacing 0.15em
- "Your cosmic rhythm" in DM Sans 11px uppercase dimmed, letter-spacing 0.3em

Three auth buttons (stacked, full-width, max 320px):
1. Continue with Google — icon + text, #1C1836 bg, gold border
2. Continue with Apple — icon + text, same style
3. Sign in with Email — text link, dimmed

All using Supabase Auth.
Do NOT build other screens yet.
```

### Prompt 3.2 — Email Auth
```
Add email authentication screens to Lunaracycle.

LoginScreen and RegisterScreen, same visual style as WelcomeScreen.
Inputs: #1C1836 background, ivory text, gold focus border, rounded 16px.
Password field has show/hide toggle.
Primary button: gold background, dark text, rounded 28px.
Error messages in rose color (#C4858A) below fields.
```

### Prompt 3.3 — Onboarding
```
Build the OnboardingScreen for Lunaracycle (shows once after first registration).

4 steps, minimal progress dots at top:
Step 1: Cycle length slider (21-45, default 28) — "Wie lange ist dein Zyklus?"
Step 2: Period length slider (2-10, default 5) — "Wie lange dauert deine Periode?"  
Step 3: Date picker for last period start — "Wann begann deine letzte Periode?"
         Max date: today. Min date: 90 days ago.
Step 4: Language toggle DE / EN

Custom slider: dark track, gold fill, gold circle thumb.
On final step: save all to Supabase profiles table. 
Set onboarding_completed = true.
Then navigate to HomeScreen.
```

---

## PHASE 4 — Core Logic

### Prompt 4.1 — Cycle Calculations Hook
```
Create the useCycleCalculations(userId) hook for Lunaracycle.

Fetches from Supabase: cycle_entries where is_period_start = true, 
ordered by entry_date DESC, limit 5. Also fetches user profile.

Returns: currentCycleDay, currentPhase (menstruation/follicular/ovulation/luteal),
nextPeriodDate, ovulationDate, fertileWindowStart, fertileWindowEnd,
daysUntilNextPeriod, isLate, daysLate, isLoading, error.

Phase calculation:
- Menstruation: day 1 to period_length
- Follicular: period_length+1 to ovulationDay-2
- Ovulation: ovulationDay-1 to ovulationDay+1
- Luteal: ovulationDay+2 to cycle end
- Ovulation day = lastPeriodStart + (cycleLength - 14)

Typed TypeScript with JSDoc. No UI.
```

### Prompt 4.2 — Moon Phase Hook
```
Create the useMoonPhase(date?) hook for Lunaracycle.

Calculate moon phase mathematically. No API needed.
Reference new moon: January 6, 2000 18:14 UTC
Lunar cycle: 29.53059 days

8 phases: new_moon, waxing_crescent, first_quarter, waxing_gibbous,
full_moon, waning_gibbous, last_quarter, waning_crescent

Returns: phase (string), phaseName (in user language), 
phaseEmoji (🌑🌒🌓🌔🌕🌖🌗🌘), illuminationPercent.

Typed TypeScript. No UI.
```

### Prompt 4.3 — Impulse Hook
```
Create the useTodayImpulse(userId) hook for Lunaracycle.

Combines useCycleCalculations + useMoonPhase to query best matching impulse.

Query: SELECT from impulses WHERE 
(cycle_phase = currentPhase OR cycle_phase = 'any')
AND (moon_phase = currentMoonPhase OR moon_phase = 'any')
AND is_active = true
ORDER BY specificity (exact match first, then partial, then 'any')
LIMIT 1

Returns text in user's language (text_de or text_en based on profile.language).
Returns: { text: string, isLoading: boolean }
```

---

## PHASE 5 — UI Screens

### Prompt 5.1 — HomeScreen
```
Build the HomeScreen using useCycleCalculations, useMoonPhase, useTodayImpulse hooks.

Layout top to bottom (background #0D0B1A):
1. Header: "lunaracycle" gold Cormorant left, avatar circle right
2. Moon SVG (120px, gold #C9A84C, crescent shape matching current phase, 
   soft glow: filter drop-shadow 0 0 20px rgba(201,168,76,0.3))
   Moon phase name below: 11px DM Sans uppercase dimmed
3. "Zyklustag {n}" — Cormorant Garamond 36px ivory
   Phase + days until period — DM Sans 11px dimmed below
4. Three cards in a row (#1C1836, border rgba(255,255,255,0.07), radius 16px):
   Moon card / Phase card / Energy card
5. Impulse card (teal tint, italic Cormorant 16px, from useTodayImpulse)
6. Emoji check-in (4 buttons, saves to daily_checkins)

Skeleton loaders while loading. Handle "no data" state gracefully.
```

### Prompt 5.2 — CalendarScreen
```
Build the CalendarScreen using useCalendarData hook.

Month grid (7 columns Mon-Sun):
- Phase background tints (very subtle, 15-25% opacity):
  Period: #C4858A | Follicular: #C9A84C | Ovulation: #6BAAB0 | Luteal: #9B8EC4
- Today: gold ring border
- Major moon phases: small emoji bottom-left of cell (🌑🌓🌕🌗)
- Tap a day: bottom sheet with cycle day, phase, moon phase info

Month navigation arrows. Legend. Monthly summary below grid.
```

### Prompt 5.3 — LogScreen
```
Build the LogScreen for period tracking.

Two states based on whether an active period exists:

No period: "Beginnt heute deine Periode?" + large start button (gold border)
Active period: "Tag {n}" + 4 flow intensity pill buttons + end button

Save to cycle_entries. Handle today's existing entry (pre-fill).
Notes textarea (optional). Save button (gold, full-width, rounded).
```

### Prompt 5.4 — SettingsScreen
```
Build the SettingsScreen.

Cards (#1C1836, rounded 20px):
1. Profile (avatar initials, name, email)
2. Cycle settings (cycle_length + period_length sliders, custom gold styling)
3. Language toggle (DE/EN pills, gold active state)
4. Account (logout + delete account with confirmation modal)

Auto-save with 500ms debounce. "Gespeichert ✓" toast on save.
```

---

## PHASE 6 — i18n

### Prompt 6.1
```
Add bilingual support (German/English) to all screens in Lunaracycle.

Create src/i18n/translations.ts with a translations object 
(keys in 00_ANLEITUNG format, values in DE and EN).

Create useTranslation() hook: reads language from user profile, 
returns t(key) function. Falls back to 'de'.

Replace ALL hardcoded German/English strings in all screens with t() calls.
Language should change immediately when updated in Settings without page reload.
```

---

## PHASE 7 — Launch Prep

### Prompt 7.1 — Error Handling
```
Add proper error handling throughout Lunaracycle:

1. ErrorBoundary component: wraps the whole app, shows friendly 
   "Etwas ist schiefgelaufen / Something went wrong" screen with retry button
2. All Supabase calls wrapped in try/catch with user-facing error messages
3. All form submit buttons: disabled + loading spinner while submitting
4. Network error detection: if Supabase unreachable, show offline banner
5. Remove any console.log with user data

Do a thorough review of all existing code and add these improvements.
```

### Prompt 7.2 — Final Polish
```
Final polish pass for Lunaracycle before beta launch:

1. Verify all pages have proper loading skeletons (no content flash)
2. Add "Version 1.0 Beta" text to Settings screen footer (tiny, dimmed)
3. Ensure bottom navigation doesn't overlap content on iPhone with home indicator
   (add safe-area-inset-bottom padding)
4. Check all tap targets are minimum 44x44px (accessibility)
5. Verify the app title in browser tab is "Lunaracycle"

Show me each change made.
```

---

## Bug-Fix Prompt Template

Wenn etwas nicht funktioniert, kopiere dieses Template:

```
There's a bug in Lunaracycle.

Screen: [Name des Screens]
What I did: [Genau beschreiben was du getan hast]
What I expected: [Was hätte passieren sollen]
What happened instead: [Was tatsächlich passiert ist]
Error message (if any): [Exakte Fehlermeldung kopieren]

Please fix only this specific bug. Do not change anything else.
```

---

## Design Fix Prompt Template

```
The [element name] on the [screen name] doesn't look right.

Current: [beschreibe was du siehst]
Should be: [beschreibe was du willst]
Reference: Use color #[hex] and font [fontname]

Change only this element. Do not touch other parts of the screen.
```

---

*Lunaracycle — built with structure, not vibes. 🌙*
