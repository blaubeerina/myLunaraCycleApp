// Tägliche Tipps + Supplemente — 28 Tage Zyklus (aus Zyklus_28_Tage_Maria.csv)
// Index 0 = Tag 1

interface DayTip {
  tipp: { de: string; en: string }
  supplement: string
}

const TIPS: DayTip[] = [
  // Tag 1–5: Menstruation
  { tipp: { de: 'Heute nichts entscheiden. Atmen reicht.', en: 'No decisions today. Breathing is enough.' }, supplement: 'Hibiskus' },
  { tipp: { de: 'Wärme für Bauch & Rücken.', en: 'Warmth for belly & back.' }, supplement: 'Magnesium' },
  { tipp: { de: 'Schlaf ist Medizin.', en: 'Sleep is medicine.' }, supplement: 'Frauenmantel / Ingwer' },
  { tipp: { de: 'Langsam & warm essen.', en: 'Eat slowly & warm.' }, supplement: 'Spirulina' },
  { tipp: { de: 'Spaziergang ohne Ziel.', en: 'A walk without destination.' }, supplement: 'Hibiskus' },
  // Tag 6–13: Follikelphase
  { tipp: { de: 'Frische Luft, neues Denken.', en: 'Fresh air, new thinking.' }, supplement: 'Camu Camu' },
  { tipp: { de: 'Ideen notieren, noch nicht umsetzen.', en: 'Write down ideas, not yet act.' }, supplement: 'Zink' },
  { tipp: { de: 'Leichte Bewegung.', en: 'Light movement.' }, supplement: 'Spirulina' },
  { tipp: { de: 'Etwas Neues lernen.', en: 'Learn something new.' }, supplement: 'Camu Camu' },
  { tipp: { de: 'Struktur gibt Freiheit.', en: 'Structure gives freedom.' }, supplement: 'Omega-3' },
  { tipp: { de: 'Klar kommunizieren.', en: 'Communicate clearly.' }, supplement: 'Spirulina' },
  { tipp: { de: 'Kreativität ausleben.', en: 'Live out your creativity.' }, supplement: 'Camu Camu' },
  { tipp: { de: 'Weniger planen.', en: 'Plan less.' }, supplement: 'Zink' },
  // Tag 14–16: Eisprung
  { tipp: { de: 'Zeig dich. Sag Ja.', en: 'Show yourself. Say yes.' }, supplement: 'Camu Camu' },
  { tipp: { de: 'Genuss ohne Schuld.', en: 'Pleasure without guilt.' }, supplement: 'Omega-3' },
  { tipp: { de: 'Sozial, nicht überziehen.', en: 'Be social, don\'t overdo it.' }, supplement: 'Hibiskus' },
  // Tag 17–28: Lutealphase
  { tipp: { de: 'To-dos realistisch kürzen.', en: 'Shorten your to-dos realistically.' }, supplement: 'Vitamin B6' },
  { tipp: { de: 'Nein sagen üben.', en: 'Practice saying no.' }, supplement: 'Hibiskus' },
  { tipp: { de: 'Erdend essen.', en: 'Eat grounding foods.' }, supplement: 'Magnesium' },
  { tipp: { de: 'Ordnung schafft Ruhe.', en: 'Order creates calm.' }, supplement: 'Ashwagandha' },
  { tipp: { de: 'Früher Feierabend.', en: 'Finish early today.' }, supplement: 'Vitamin B6' },
  { tipp: { de: 'Reizarm bleiben.', en: 'Stay low-stimulation.' }, supplement: 'Hibiskus' },
  { tipp: { de: 'Nicht alles persönlich nehmen.', en: 'Don\'t take everything personally.' }, supplement: 'Magnesium' },
  { tipp: { de: 'Sanfte Bewegung.', en: 'Gentle movement.' }, supplement: 'Ashwagandha' },
  { tipp: { de: 'Rückzug ist Selbstliebe.', en: 'Retreat is self-love.' }, supplement: 'Vitamin B6' },
  { tipp: { de: 'Mehr Schlaf einplanen.', en: 'Plan for more sleep.' }, supplement: 'Hibiskus' },
  { tipp: { de: 'Reflektieren, nicht bewerten.', en: 'Reflect, don\'t judge.' }, supplement: 'Magnesium' },
  { tipp: { de: 'Bereit fürs Loslassen.', en: 'Ready to let go.' }, supplement: 'Hibiskus' },
]

export function getDayTip(cycleDay: number, lang: 'de' | 'en'): { tipp: string; supplement: string } {
  // cycleDay ist 1-basiert; bei >28 Tagen wiederholen (modulo wrap)
  const idx = ((cycleDay - 1) % 28 + 28) % 28
  const entry = TIPS[idx] ?? TIPS[0]
  return { tipp: entry.tipp[lang], supplement: entry.supplement }
}
