# Design System — lunaracycle

Ästhetik: **Kosmisches Dunkel** · Glassmorphism · Mystisch-Feminin · Mobile-First

---

## Farbpalette

### Basis-Farben (CSS Variables + Tailwind Tokens)

| Token | Hex | Verwendung |
|-------|-----|------------|
| `midnight` | `#0D0B1A` | Haupthintergrund |
| `midnight-mid` | `#13102A` | Sekundär-Hintergrund |
| `cosmos` | `#201B3B` | Karten-Hintergrund (`bg-cosmos`) |
| `ivory` | `#F4EFE6` | Primärer Text |
| `ivory-dim` | `#D9D2C5` | Sekundärer Text |

### Akzentfarben

| Token | Hex | Phase / Rolle |
|-------|-----|---------------|
| `gold` | `#C9A84C` | Mond, Akzente, Heute-Outline |
| `gold-soft` | `#E2C87A` | Goldener Glow, Supplements |
| `rose` | `#C4858A` | Menstruation |
| `rose-soft` | `#E8B4B8` | Menstruation Soft (Kalender-BG) |
| `lavender` | `#9B8EC4` | Lutealphase |
| `lavender-soft` | `#C4BBE0` | Luteal Soft (Kalender-BG) |
| `teal` | `#6BAAB0` | Follikelphase, Saved-Toast |
| `teal-soft` | `#A8D0D4` | Teal Soft (Kalender-BG) |

---

## Phasen-Farben (Kalender)

### Hintergründe (PHASE_BG) — Soft-Varianten
```
menstruation: rgba(232,180,184,0.62)  ← #E8B4B8 (rose-soft)
follicular:   rgba(168,208,212,0.48)  ← #A8D0D4 (teal-soft)
ovulation:    rgba(226,200,122,0.62)  ← #E2C87A (gold-soft)
luteal:       rgba(196,187,224,0.48)  ← #C4BBE0 (lavender-soft)
```

### Borders (PHASE_BORDER)
```
menstruation: rgba(196,133,138,0.85)
follicular:   rgba(107,170,176,0.65)
ovulation:    rgba(201,168,76,0.85)
luteal:       rgba(155,142,196,0.65)
```

### Datum-Text (PHASE_TEXT)
```
menstruation: #C4858A  (rose, fontWeight: 600)
follicular:   #6BAAB0  (teal, fontWeight: 600)
ovulation:    #C9A84C  (gold, fontWeight: 600)
luteal:       #9B8EC4  (lavender, fontWeight: 600)
kein Phase:   rgba(244,239,230,0.8)  (ivory/80)
```

### Legend Dots (PHASE_DOT)
```
menstruation: #C4858A
follicular:   #6BAAB0
ovulation:    #C9A84C
luteal:       #9B8EC4
```

---

## Typografie

| Rolle | Font | Varianten |
|-------|------|-----------|
| Überschriften / Display | Cormorant Garamond | Light 300, Regular 400, SemiBold 600, Italic |
| UI Text / Labels | DM Sans | Light 300, Regular 400, Medium 500 |

**Klassen:**
- `font-serif` → Cormorant Garamond
- `font-sans` → DM Sans
- `italic` → für mystische Überschriften (`font-serif text-3xl italic text-gold`)

---

## UI-Muster

### Glassmorphism Karten
```tsx
const GLASS_CARD = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(10px)',
}
```

### Cosmos Karten (Standard)
```tsx
className="bg-cosmos rounded-2xl p-5 border border-white/5"
```

### Noise Texture Overlay (globals.css)
```css
body::before {
  background-image: url("data:image/svg+xml,...feTurbulence...");
  opacity: 0.55;
  z-index: 0;
}
main, nav { position: relative; z-index: 1; }
```

### Ambient Gold Glow (hinter Mond-Emoji)
```tsx
<div style={{
  width: '200px', height: '200px',
  background: 'radial-gradient(circle, rgba(201,168,76,0.13) 0%, transparent 70%)',
  borderRadius: '50%',
}} />
```

### Gradient Buttons (CTA)
```tsx
style={{ background: 'linear-gradient(135deg, #C4858A, #9B8EC4)' }}
// Rose → Lavender (Periode-bezogen)

style={{ background: 'linear-gradient(135deg, #C9A84C, #9B8EC4)' }}
// Gold → Lavender (allgemein)
```

### Saved Toast
```tsx
className="bg-teal/20 border border-teal/40 text-teal px-6 py-3 rounded-2xl"
```

### Pulsierender Indikator (Periode aktiv)
```tsx
className="animate-pulse w-3 h-3 rounded-full"
style={{ background: '#C4858A', boxShadow: '0 0 8px rgba(196,133,138,0.7)' }}
```

---

## Emojis nach Phase

| Phase | Emoji | Kontext |
|-------|-------|---------|
| Menstruation | 🌹 🩸 | Cards + Kalender-Tage |
| Follikelphase | 🌱 | Phase-Card |
| Eisprung | ✨ ☀️ | Phase-Card + Kalender |
| Lutealphase | 🍂 | Phase-Card |
| Unbekannt / leer | 🌙 💫 | Default |

---

## Spacing & Layout

- Max-Width: `max-w-md mx-auto` (alle Screens)
- Padding Screen: `px-5 pt-8 pb-24` (Standard) oder `px-3 pt-4` (Kalender)
- Bottom Nav Höhe: `80px` (5rem)
- Border Radius: `rounded-2xl` (Karten), `rounded-xl` (Buttons/Inputs)
- Gap Kalender-Grid: `gap-0.5`
