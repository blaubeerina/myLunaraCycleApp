export type MoonPhaseName =
  | 'new_moon' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous'
  | 'full_moon' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent'

export interface MoonPhaseResult {
  phase: MoonPhaseName
  emoji: string
  name: { de: string; en: string }
  illumination: number
}

const EMOJIS: Record<MoonPhaseName, string> = {
  new_moon: '🌑', waxing_crescent: '🌒', first_quarter: '🌓',
  waxing_gibbous: '🌔', full_moon: '🌕', waning_gibbous: '🌖',
  last_quarter: '🌗', waning_crescent: '🌘',
}

const NAMES: Record<MoonPhaseName, { de: string; en: string }> = {
  new_moon:        { de: 'Neumond',            en: 'New Moon' },
  waxing_crescent: { de: 'Zunehmende Sichel',  en: 'Waxing Crescent' },
  first_quarter:   { de: 'Erstes Viertel',     en: 'First Quarter' },
  waxing_gibbous:  { de: 'Zunehmender Mond',   en: 'Waxing Gibbous' },
  full_moon:       { de: 'Vollmond',            en: 'Full Moon' },
  waning_gibbous:  { de: 'Abnehmender Mond',   en: 'Waning Gibbous' },
  last_quarter:    { de: 'Letztes Viertel',    en: 'Last Quarter' },
  waning_crescent: { de: 'Abnehmende Sichel',  en: 'Waning Crescent' },
}

// Jean Meeus Algorithmus — kein API-Call nötig
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z')
const LUNAR_CYCLE = 29.53059

export function getMoonPhase(date: Date = new Date()): MoonPhaseResult {
  const daysSince = (date.getTime() - KNOWN_NEW_MOON.getTime()) / 86400000
  const pos = ((daysSince % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE
  const illumination = Math.round((1 - Math.cos((pos / LUNAR_CYCLE) * 2 * Math.PI)) / 2 * 100)

  let phase: MoonPhaseName
  if (pos < 1.85)       phase = 'new_moon'
  else if (pos < 7.38)  phase = 'waxing_crescent'
  else if (pos < 9.22)  phase = 'first_quarter'
  else if (pos < 14.77) phase = 'waxing_gibbous'
  else if (pos < 16.61) phase = 'full_moon'
  else if (pos < 22.15) phase = 'waning_gibbous'
  else if (pos < 23.99) phase = 'last_quarter'
  else                  phase = 'waning_crescent'

  return { phase, emoji: EMOJIS[phase], name: NAMES[phase], illumination }
}
