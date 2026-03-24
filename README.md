# 🌙 lunaracycle

**Zyklus & Mond — dein spiritueller Begleiter**

Eine mobile-first Web-App die Menstruationszyklus und Mondphasen kombiniert, mit spirituellen Tagesimpulsen, Kalender und Zyklus-Tracking.

---

## Status

| Phase | Beschreibung | Status |
|-------|-------------|--------|
| 1 | Projekt Setup & Stack | ✅ Dokumentiert |
| 2 | Supabase Schema | ✅ Dokumentiert |
| 3 | Auth (Email, Google, Apple) | ✅ Dokumentiert |
| 4 | Core Logic (Zyklus + Mond) | ✅ Dokumentiert |
| 5 | UI Screens | ✅ Dokumentiert |
| 6 | Content & i18n (DE/EN) | ✅ Dokumentiert |
| 7 | Launch & Stripe Payment | ✅ Dokumentiert |
| **Code** | **Implementierung** | **⏳ Startet jetzt** |

---

## Tech Stack

- **Frontend**: React (via Lovable) / Next.js
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Hosting**: Vercel
- **Payment**: Stripe (€9.99 einmalig, 7-Tage Free Trial)
- **AI/Oracle**: Claude API / GROQ (via Supabase Edge Functions)
- **Mondberechnungen**: Jean Meeus Algorithmus (client-seitig, kein API-Call)
- **Sprachen**: Deutsch + Englisch

---

## Design

- **Stil**: Dark Mode, mystisch, minimalistisch
- **Farben**:
  - `#0D0B1A` Midnight Indigo (Background)
  - `#C9A84C` Pale Gold (Akzent, CTA, Mond)
  - `#C4858A` Dusty Rose (Menstruation)
  - `#9B8EC4` Muted Lavender (Lutealphase)
  - `#6BAAB0` Soft Teal (Fruchtbar/Eisprung)
- **Schriften**: Cormorant Garamond (Überschriften) + DM Sans (Text)

---

## Projektstruktur

```
myLunaraCycleApp/
├── docs/              # Vollständige Spezifikation (7 Phasen)
├── design/            # Moodboard + Screenshots
├── data/              # Beispiel-Zyklus-Daten
└── src/               # Code (kommt hier rein)
```

---

## Setup

```bash
# 1. Repo klonen
git clone https://github.com/blaubeerina/myLunaraCycleApp.git

# 2. .env anlegen
cp .env.example .env
# → Keys in .env eintragen

# 3. Dependencies installieren (sobald src/ gebaut wird)
npm install
```

---

## Roadmap

- [ ] **Phase 1**: Lovable Setup + Supabase Projekt anlegen
- [ ] **Phase 2**: Datenbankschema deployen
- [ ] **Phase 3**: Auth implementieren
- [ ] **Phase 4**: Zyklus- und Mondlogik bauen
- [ ] **Phase 5**: Alle UI Screens
- [ ] **Phase 6**: DE/EN Content eintragen
- [ ] **Beta**: 5–10 Testnutzerinnen einladen
- [ ] **Phase 7**: Stripe Payment aktivieren
- [ ] **Launch** 🚀

---

*Von Maria Paula Sommer — gebaut mit Herz, Mond und Code.*
