# 🚀 LUNARACYCLE — Launch Checklist
**Datei für Phase 7 — Vor dem Beta-Release**

---

## Diese Liste komplett durchgehen BEVOR du auch nur einen Beta-Nutzer einlädst.

---

## 1. Supabase Security Check

```
☐ RLS aktiviert auf ALLEN Tabellen (nicht nur einzelnen)
  → Supabase Dashboard → Table Editor → jede Tabelle → RLS = enabled
  
☐ Kein direkter Zugriff auf fremde Daten möglich
  → Test: Mit zwei verschiedenen Test-Accounts einloggen
  → Account A darf NIEMALS Daten von Account B sehen
  
☐ Supabase API Keys: NIEMALS den service_role Key im Frontend
  → Nur anon Key im Frontend (VITE_SUPABASE_ANON_KEY)
  → service_role Key = nur serverseitig (nie in Lovable)
  
☐ Auth Emails konfiguriert (Lunaracycle Branding)
  → Supabase → Authentication → Email Templates
  
☐ OAuth Redirect URLs korrekt
  → Nur deine eigene Domain als erlaubte Redirect URL
```

---

## 2. Functional Testing

Gehe diese Flows komplett durch — als echter Nutzer, nicht als Entwicklerin:

```
☐ REGISTRIERUNG
  → Neue Email-Registrierung → Bestätigungs-Email kommt an
  → Bestätigung klicken → landet auf Onboarding
  → Onboarding komplett ausfüllen → landet auf Home
  
☐ GOOGLE LOGIN
  → Weiter mit Google → kommt auf Onboarding/Home
  → Zweites Mal einloggen → direkt auf Home (kein erneutes Onboarding)
  
☐ APPLE LOGIN
  → Gleicher Flow wie Google
  
☐ ERSTE PERIODE EINTRAGEN
  → Log Tab → "Periode starten" → Eintrag erscheint
  → Home zeigt jetzt Zyklustag 1
  → Kalender zeigt roten Tag
  
☐ ZYKLUSBERECHNUNG
  → Mehrere Perioden eintragen (mindestens 2 vergangene)
  → Nächste Periode wird korrekt vorhergesagt
  
☐ MONDPHASE
  → Heutige Mondphase mit externer Quelle vergleichen
  → z.B. timeanddate.com/moon
  
☐ TAGESIMPULS
  → Impuls wird angezeigt
  → Nach Sprachenwechsel: Impuls in neuer Sprache
  
☐ SPRACHENWECHSEL
  → Settings → Sprache auf EN → App wechselt sofort
  → Alle Texte auf Englisch
  → Spracheinstellung bleibt nach App-Neustart
  
☐ AUSLOGGEN
  → Ausloggen → landet auf Welcome Screen
  → Erneut einloggen → alle Daten noch da
  
☐ KALENDER NAVIGATION
  → Monate vor/zurück navigieren
  → Daten korrekt dargestellt
```

---

## 3. Edge Cases — diese MÜSSEN funktionieren

```
☐ NEUER ACCOUNT (keine Einträge)
  → Home zeigt sinnvolle "Loslegen"-Meldung, kein Crash
  
☐ ÜBERFÄLLIGE PERIODE
  → Test: Letzte Periode vor 35 Tagen eingetragen (Zyklus 28)
  → Zeigt "7 Tage überfällig" oder ähnlich — KEIN negativer Zähler
  
☐ SCHALTJAHR / MONATSWECHSEL
  → Februar-Einträge korrekt
  → 31. März → April korrekt
  
☐ DOPPELTER EINTRAG
  → Zwei Mal Periode starten für denselben Tag → kein Fehler (upsert)
  
☐ OFFLINE / SCHLECHTES NETZ
  → App zeigt sinnvolle Fehlermeldung, kein weißer Screen
  
☐ LANGER NAME / LANGE EMAIL
  → UI bricht nicht
  
☐ ZURÜCK-BUTTON
  → Browser zurück funktioniert überall sinnvoll
```

---

## 4. Design Checks

```
☐ Auf echtem iPhone getestet (nicht nur Browser-Simulation)
☐ Auf echtem Android getestet
☐ Kein Text abgeschnitten auf kleinen Screens (iPhone SE = 375px)
☐ Bottom Navigation überlappt keinen Inhalt
☐ Keyboard schiebt wichtige Elemente nicht weg
☐ Dark Mode sieht auf OLED Bildschirmen gut aus
☐ Alle Schriften laden korrekt (Google Fonts)
☐ Kein Layout-Shift beim Laden
```

---

## 5. Performance

```
☐ Erster Load < 3 Sekunden (auf normalem Mobilnetz)
☐ Skeleton Loader während Daten laden (kein leerer Screen)
☐ Keine doppelten API-Calls (nur einmal laden)
☐ Supabase Queries haben LIMIT gesetzt (kein unbegrenztes Laden)
```

---

## 6. Datenschutz & Legal (für Beta Minimum)

```
☐ Datenschutzerklärung vorhanden (mindestens einfache Version)
  → Pflicht nach DSGVO (du sammelst Gesundheitsdaten!)
  → Muss erklären: was gespeichert wird, wo, wie lange
  
☐ Impressum vorhanden (du bist in DE/EU)
  
☐ Cookie / Tracking Hinweis (falls Analytics)
  
☐ AGB oder Nutzungsbedingungen (für bezahlte App)

→ Empfehlung für Beta: Datenschutzerklärung mit datenschutz-generator.de erstellen
```

---

## 7. Beta-Launch Prompt für Lovable

```
Before I launch Lunaracycle to beta users, please do a final review:

1. Check all Supabase queries have proper error handling (try/catch)
2. Verify no console.log statements with sensitive data remain
3. Add a simple error boundary component that catches React errors 
   and shows a friendly "Etwas ist schiefgelaufen" screen instead of 
   a white crash screen
4. Verify all forms have proper loading states (buttons disabled while 
   submitting to prevent double-submit)
5. Add a simple "Version 1.0 Beta" label to the settings screen footer

Do these fixes and show me what changed.
```

---

## 8. Stripe Payment Setup (nach Beta, vor Public Launch)

```
LOVABLE PROMPT — Payment:

Add a paywall to Lunaracycle using Stripe.

Business logic:
- New users get a 7-day free trial (no payment required for onboarding)
- After trial: show paywall screen, block access to all main screens
- Price: one-time payment (amount TBD — use placeholder €9.99)
- After successful payment: set profiles.has_paid = true in Supabase
- Paid users never see paywall again

Paywall Screen:
- Title: "Lunaracycle" (large, Cormorant Garamond)
- Subtext: "Einmalig. Für immer." / "One time. Forever."
- Price display: €9.99 (large, gold)
- Feature list: 3-4 bullet points of main features
- [Jetzt kaufen] button → Stripe Checkout
- Small "Restore Purchase" link below

Use Stripe Checkout (redirect method) — NOT Stripe Elements embedded.
On successful payment: Stripe webhook updates has_paid in Supabase via 
a Supabase Edge Function.

Note: Set up Stripe webhook endpoint in Supabase Edge Functions.
```

---

## Du bist bereit für Beta wenn...

```
☐ Alle Functional Tests bestanden
☐ Auf 2 verschiedenen echten Geräten getestet
☐ Datenschutzerklärung vorhanden
☐ Kein bekannter Crash
☐ Deine ersten 5-10 Test-Nutzerinnen eingeladen (nicht öffentlich)
☐ Feedback-Kanal eingerichtet (z.B. einfaches Google Form)
```

---

*Du bist fertig. Jetzt launchen. 🌙*
