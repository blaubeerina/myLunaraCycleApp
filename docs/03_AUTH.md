# 🔐 LUNARACYCLE — Authentication
**Datei für Phase 3 — Login System**

---

## Was gebaut werden soll

Drei Login-Methoden:
1. Email + Passwort (mit Bestätigungs-Email)
2. Google OAuth
3. Apple OAuth

Plus: Onboarding-Flow nach erster Registrierung.

---

## Screens

### Screen 1 — Welcome / Landing
```
Großer Mond (grafisch, gold)
"lunaracycle" (Cormorant Garamond, groß)
"Your cosmic rhythm" (DM Sans, klein, gedimmt)

[Weiter mit Google]     ← primärer Button
[Weiter mit Apple]
[Mit Email anmelden]    ← sekundärer Link
[Ich habe schon einen Account]
```

### Screen 2 — Email Login
```
Zurück-Pfeil
"Willkommen zurück" / "Welcome back"
Email-Feld
Passwort-Feld (mit Sichtbarkeits-Toggle)
[Einloggen]
"Passwort vergessen?"
"Noch kein Account? Registrieren"
```

### Screen 3 — Registrierung
```
Email-Feld
Passwort-Feld
Passwort bestätigen
[Account erstellen]
→ Danach: Email-Bestätigung hinweisen
```

### Screen 4 — Onboarding (einmalig nach Registrierung)
```
Schritt 1: "Wie lange ist dein Zyklus normalerweise?"
  Slider: 21 — 45 Tage (Default: 28)

Schritt 2: "Wie lange dauert deine Periode?"
  Slider: 2 — 10 Tage (Default: 5)

Schritt 3: "Wann hat deine letzte Periode begonnen?"
  Datepicker (maximal 90 Tage zurück)

Schritt 4: Sprache wählen
  🇩🇪 Deutsch  |  🇬🇧 English

[Loslegen] → speichert in profiles Tabelle
```

---

## Lovable Prompt — Auth Screens

```
Build the authentication flow for Lunaracycle with Supabase Auth.

Required screens:
1. WelcomeScreen — Full dark screen with centered moon SVG (crescent shape, 
   gold #C9A84C), app name "lunaracycle" in Cormorant Garamond Light 48px, 
   tagline in DM Sans. Three auth buttons: Google, Apple, Email.
   
2. EmailLoginScreen — Email + password fields, styled with surface color 
   (#1C1836) cards, ivory text. Rounded inputs (border-radius: 16px). 
   No sharp edges anywhere.

3. RegisterScreen — Same style as login, with password confirmation field.

4. OnboardingScreen — 4-step flow (cycle length, period length, last period date, 
   language). Save to Supabase profiles table on completion. 
   Set onboarding_completed = true.

Auth logic:
- After login: check if onboarding_completed is false → redirect to Onboarding
- After onboarding: redirect to Home
- Protected routes: all main screens require auth
- If not logged in: redirect to WelcomeScreen

Use Supabase Auth for Google and Apple OAuth.
Buttons should use background #1C1836, border 1px solid rgba(201,168,76,0.2), 
text color #F4EFE6. Primary CTA uses gold background #C9A84C with dark text.

Do NOT build the home screen yet.
```

---

## Wichtige Hinweise für Supabase OAuth

### Google OAuth aktivieren:
1. Supabase Dashboard → Authentication → Providers → Google
2. Google Cloud Console → OAuth Client ID erstellen
3. Redirect URL von Supabase kopieren → in Google Console eintragen
4. Client ID + Secret in Supabase eintragen

### Apple OAuth aktivieren:
1. Supabase Dashboard → Authentication → Providers → Apple
2. Apple Developer Account → Sign in with Apple konfigurieren
3. Service ID, Team ID, Key ID, Private Key in Supabase eintragen

### Email Confirmation:
- In Supabase: Authentication → Email Templates anpassen
- Confirm Email Template: Lunaracycle Branding einfügen

---

## Error States (bitte implementieren)

```
Email bereits vergeben → "Diese E-Mail ist bereits registriert."
Falsches Passwort → "E-Mail oder Passwort falsch."
Netzwerkfehler → "Verbindung unterbrochen. Bitte versuche es erneut."
Zu kurzes Passwort → "Passwort muss mindestens 8 Zeichen haben."
```

---

*Weiter mit: 04_CORE_LOGIC.md*
