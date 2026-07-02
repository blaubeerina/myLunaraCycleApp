# Open Issues & Backlog — lunaracycle

---

## Bekannte Bugs 🐛

Aktuell keine kritischen bekannten Bugs.

---

## Feature-Requests von Maria 📋

### Priorität: Hoch

| # | Feature | Beschreibung | Status |
|---|---------|--------------|--------|
| 1 | Journal-Tab | Tägliche Notizen pro Zyklustag — freier Text + Stimmung | 📋 Offen |
| 2 | Kalender: History | Mehrere vergangene Zyklen im Kalender sichtbar | ✅ Fertig (Mai 2026) |

### Priorität: Mittel

| # | Feature | Beschreibung | Status |
|---|---------|--------------|--------|
| 3 | Google Calendar | Read-only Termine im Kalender — Code fertig, braucht Google Cloud Setup | 🔧 Warte auf Maria |
| 4 | Reminders | Push Notifications für Perioden-Beginn, Eisprung | 📋 Offen |
| 5 | Cycle Statistics | Durschnittliche Zykluslänge über mehrere Monate | 📋 Offen |

### Priorität: Niedrig / v2

| # | Feature | Beschreibung | Status |
|---|---------|--------------|--------|
| 6 | Pregnancy Mode | Alternativer Modus für Schwangerschaft | 📋 v2 |
| 7 | Oracle / AI Texte | Personalisierte Impulse via Claude API | 📋 v2 |
| 8 | Theme Selector | Farbschema wählen (wie im alten Mockup) | 📋 v2 |

---

## Google Calendar Setup (wartet auf Maria) 🔧

**Code ist fertig.** Maria muss einmalig folgendes tun:

**Schritt 1 — Google Cloud Console:**
1. Gehe zu https://console.cloud.google.com
2. Neues Projekt erstellen (z.B. "lunaracycle")
3. Suche "Google Calendar API" → Aktivieren
4. "APIs & Dienste" → "Anmeldedaten" → "+ Anmeldedaten erstellen" → "OAuth 2.0-Client-ID"
5. Anwendungstyp: **Webanwendung**
6. Name: "lunaracycle"
7. Autorisierte JavaScript-Quellen: `https://lunaracycle.vercel.app`
8. Client-ID kopieren

**Schritt 2 — Vercel:**
1. https://vercel.com → lunaracycle Projekt
2. Settings → Environment Variables
3. Neue Variable: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = deine Client-ID
4. Save → Neu deployen: `npx vercel --prod --yes`

**Danach:** In der App → Einstellungen → "Google Kalender" → "Verbinden"

---

## Technische Schulden 🔩

| Item | Beschreibung | Aufwand |
|------|--------------|---------|
| `docs/` Ordner | Alte Docs (Supabase, Auth) nicht mehr relevant — aufräumen | Klein |
| Keine Tests | Keine Unit/Integration Tests | Mittel |
| FeedbackScreen | Nur Formspree, kein echtes Feedback-Management | Mittel |
| `effectivePeriodLength` im Kalender | getDayPhase() nutzt nur aktuellen Zyklus-endedToday, nicht historische | Klein |

---

## Anstehend für nächste Session

- [ ] Google Calendar aktivieren (wenn Maria den API Key hat)
- [ ] Journal-Tab beginnen
- [ ] Feedback von Maria zum neuen Kalender-Design

---

*Zuletzt aktualisiert: März 2026*
