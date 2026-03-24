# 🗄️ LUNARACYCLE — Supabase Schema
**Datei für Phase 1 — Direkt in Supabase SQL Editor ausführen**

---

## Reihenfolge der Ausführung

Führe die SQL-Blöcke **in dieser Reihenfolge** aus.
Nicht alles auf einmal. Block für Block. Zwischen jedem Block prüfen ob es Fehler gab.

```
Block 1 → Extensions
Block 2 → profiles Tabelle
Block 3 → cycle_entries Tabelle
Block 4 → daily_checkins Tabelle
Block 5 → moon_phases Tabelle
Block 6 → impulses Tabelle
Block 7 → Row Level Security (RLS)
Block 8 → Trigger für automatisches Profil
```

---

## Block 1 — Extensions aktivieren

```sql
-- UUID support (meist schon aktiv in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## Block 2 — profiles Tabelle

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'de' CHECK (language IN ('de', 'en')),
  cycle_length INTEGER DEFAULT 28 CHECK (cycle_length BETWEEN 21 AND 45),
  period_length INTEGER DEFAULT 5 CHECK (period_length BETWEEN 2 AND 10),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  has_paid BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Abfragen
CREATE INDEX idx_profiles_id ON public.profiles(id);
```

---

## Block 3 — cycle_entries Tabelle

```sql
-- Speichert Blutungseinträge (manuell von Nutzerin)
CREATE TABLE public.cycle_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL,
  flow_intensity TEXT CHECK (flow_intensity IN ('light', 'medium', 'heavy', 'spotting')),
  is_period_start BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Verhindert doppelte Einträge pro Tag
  UNIQUE(user_id, entry_date)
);

-- Indizes für Kalenderabfragen
CREATE INDEX idx_cycle_entries_user_date ON public.cycle_entries(user_id, entry_date DESC);
CREATE INDEX idx_cycle_entries_period_start ON public.cycle_entries(user_id, is_period_start) 
  WHERE is_period_start = TRUE;
```

---

## Block 4 — daily_checkins Tabelle

```sql
-- Speichert tägliche Emoji Check-ins
CREATE TABLE public.daily_checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  checkin_date DATE NOT NULL,
  mood TEXT,       -- Emoji-Kategorie: 'happy', 'neutral', 'low', 'anxious'
  energy TEXT,     -- 'high', 'medium', 'low', 'exhausted'
  sensitivity TEXT, -- 'calm', 'sensitive', 'irritable', 'emotional'
  intuition TEXT,   -- 'clear', 'foggy', 'strong', 'quiet'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, checkin_date)
);

CREATE INDEX idx_daily_checkins_user_date ON public.daily_checkins(user_id, checkin_date DESC);
```

---

## Block 5 — moon_phases Tabelle

```sql
-- Pre-calculated Mondphasen (wird einmalig befüllt)
-- Quelle: astronomische Berechnungen oder Moon API
CREATE TABLE public.moon_phases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phase_date DATE UNIQUE NOT NULL,
  phase_name TEXT NOT NULL,  -- 'new_moon', 'waxing_crescent', 'first_quarter', 
                              --  'waxing_gibbous', 'full_moon', 'waning_gibbous', 
                              --  'last_quarter', 'waning_crescent'
  phase_name_de TEXT NOT NULL, -- 'Neumond', 'Zunehmende Sichel', etc.
  phase_name_en TEXT NOT NULL,
  illumination_percent DECIMAL(5,2), -- 0.00 bis 100.00
  is_major_phase BOOLEAN DEFAULT FALSE, -- Vollmond, Neumond, Viertel
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moon_phases_date ON public.moon_phases(phase_date);

-- Beispieldaten für Entwicklung (Januar 2025)
INSERT INTO public.moon_phases (phase_date, phase_name, phase_name_de, phase_name_en, illumination_percent, is_major_phase) VALUES
('2025-01-01', 'waxing_crescent', 'Zunehmende Sichel', 'Waxing Crescent', 15.0, false),
('2025-01-07', 'first_quarter', 'Erstes Viertel', 'First Quarter', 50.0, true),
('2025-01-13', 'full_moon', 'Vollmond', 'Full Moon', 100.0, true),
('2025-01-21', 'last_quarter', 'Letztes Viertel', 'Last Quarter', 50.0, true),
('2025-01-29', 'new_moon', 'Neumond', 'New Moon', 0.0, true);
```

---

## Block 6 — impulses Tabelle

```sql
-- Spirituelle Tagesimpulse
CREATE TABLE public.impulses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cycle_phase TEXT NOT NULL CHECK (cycle_phase IN (
    'menstruation', 'follicular', 'ovulation', 'luteal', 'any'
  )),
  moon_phase TEXT NOT NULL CHECK (moon_phase IN (
    'new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
    'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent', 'any'
  )),
  text_de TEXT NOT NULL,
  text_en TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_impulses_phases ON public.impulses(cycle_phase, moon_phase) 
  WHERE is_active = TRUE;

-- Starter-Impulse einfügen
INSERT INTO public.impulses (cycle_phase, moon_phase, text_de, text_en) VALUES
('menstruation', 'any', 'Zeit für Rückzug und innere Stille. Dein Körper reinigt sich.', 'Time for retreat and inner stillness. Your body is cleansing itself.'),
('menstruation', 'new_moon', 'Neumond und Menstruation — ein kraftvoller Neuanfang entsteht.', 'New moon and menstruation — a powerful new beginning is forming.'),
('follicular', 'any', 'Neue Energie entfaltet sich in dir. Lass sie wachsen.', 'New energy is unfolding within you. Let it grow.'),
('follicular', 'waxing_crescent', 'Wie der zunehmende Mond wächst auch deine Kraft.', 'Like the waxing moon, your strength is growing.'),
('ovulation', 'any', 'Dein Leuchten ist heute am hellsten. Die Welt sieht dich.', 'Your light shines brightest today. The world sees you.'),
('ovulation', 'full_moon', 'Vollmond und Eisprung — du bist in deiner vollen Kraft.', 'Full moon and ovulation — you are in your full power.'),
('luteal', 'any', 'Deine Intuition führt dich nach innen. Vertraue ihr.', 'Your intuition leads you inward. Trust it.'),
('luteal', 'waning_gibbous', 'Zeit des Loslassens. Was brauchst du nicht mehr?', 'Time of release. What do you no longer need?'),
('any', 'new_moon', 'Der Neumond lädt dich ein: Was möchtest du neu beginnen?', 'The new moon invites you: What do you want to begin anew?'),
('any', 'full_moon', 'Vollmond — eine Zeit der Fülle und des Danks.', 'Full moon — a time of fullness and gratitude.');
```

---

## Block 7 — Row Level Security (RLS)

```sql
-- RLS aktivieren (KRITISCH für Datenschutz)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moon_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impulses ENABLE ROW LEVEL SECURITY;

-- Profiles: Nutzerin sieht nur ihr eigenes Profil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Cycle Entries: Nutzerin sieht nur eigene Einträge
CREATE POLICY "Users can view own cycle entries" ON public.cycle_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycle entries" ON public.cycle_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycle entries" ON public.cycle_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycle entries" ON public.cycle_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Daily Checkins: Nutzerin sieht nur eigene Check-ins
CREATE POLICY "Users can view own checkins" ON public.daily_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins" ON public.daily_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins" ON public.daily_checkins
  FOR UPDATE USING (auth.uid() = user_id);

-- Moon Phases: Alle können lesen (öffentliche Daten)
CREATE POLICY "Anyone can view moon phases" ON public.moon_phases
  FOR SELECT USING (true);

-- Impulses: Alle können lesen (öffentliche Inhalte)
CREATE POLICY "Anyone can view impulses" ON public.impulses
  FOR SELECT USING (is_active = true);
```

---

## Block 8 — Automatisches Profil bei Registrierung

```sql
-- Funktion: Erstellt automatisch ein Profil wenn sich jemand registriert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger aktivieren
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Funktion: updated_at automatisch aktualisieren
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

---

## Prompt für Lovable (nach Schema-Setup)

```
My Supabase database is now set up with these tables:
- profiles (user settings, cycle_length, period_length, language, has_paid)
- cycle_entries (period tracking, flow_intensity, is_period_start)
- daily_checkins (mood, energy, sensitivity, intuition - emoji-based)
- moon_phases (pre-calculated, public)
- impulses (spiritual texts in DE + EN, indexed by cycle_phase and moon_phase)

Please connect the Supabase client to the project using environment variables 
VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.

Create a supabase.ts client file and a basic useUser hook that returns the 
current authenticated user and their profile from the profiles table.

Do NOT build any UI yet. Only the data layer.
```

---

*Weiter mit: 03_AUTH.md*
