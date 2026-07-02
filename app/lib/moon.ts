// Moon phase data sourced from the US Naval Observatory (aa.usno.navy.mil)
// Major phase dates fetched once per year, cached in localStorage.
// Today's precise illumination fetched once per day.
// getMoonPhase() is synchronous — call fetchMoonData() once on app mount.

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

// Maps USNO phase strings to our MoonPhaseName
const USNO_MAJOR: Record<string, MoonPhaseName> = {
  'New Moon':      'new_moon',
  'First Quarter': 'first_quarter',
  'Full Moon':     'full_moon',
  'Last Quarter':  'last_quarter',
}

const USNO_CURPHASE: Record<string, MoonPhaseName> = {
  'New Moon':       'new_moon',
  'Waxing Crescent':'waxing_crescent',
  'First Quarter':  'first_quarter',
  'Waxing Gibbous': 'waxing_gibbous',
  'Full Moon':      'full_moon',
  'Waning Gibbous': 'waning_gibbous',
  'Last Quarter':   'last_quarter',
  'Waning Crescent':'waning_crescent',
}

// Cache keys
const YEAR_KEY = (y: number) => `luna_moon_y_${y}`
const TODAY_KEY = 'luna_moon_today'

interface MajorPhase { ts: number; name: MoonPhaseName }
interface YearCache  { year: number; phases: MajorPhase[] }
interface TodayCache { date: string; illumination: number; phase: MoonPhaseName }

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isSSR(): boolean { return typeof window === 'undefined' }

// ── Cache I/O ──────────────────────────────────────────────────────────────

function readYearCache(year: number): MajorPhase[] | null {
  if (isSSR()) return null
  try {
    const raw = localStorage.getItem(YEAR_KEY(year))
    if (!raw) return null
    const c: YearCache = JSON.parse(raw)
    return c.year === year ? c.phases : null
  } catch { return null }
}

function writeYearCache(year: number, phases: MajorPhase[]): void {
  if (isSSR()) return
  try { localStorage.setItem(YEAR_KEY(year), JSON.stringify({ year, phases })) } catch {}
}

function readTodayCache(): TodayCache | null {
  if (isSSR()) return null
  try {
    const raw = localStorage.getItem(TODAY_KEY)
    if (!raw) return null
    const c: TodayCache = JSON.parse(raw)
    return c.date === toLocalDateStr(new Date()) ? c : null
  } catch { return null }
}

function writeTodayCache(illumination: number, phase: MoonPhaseName): void {
  if (isSSR()) return
  try {
    localStorage.setItem(TODAY_KEY, JSON.stringify({
      date: toLocalDateStr(new Date()), illumination, phase,
    }))
  } catch {}
}

// ── Fallback calculation (offline / empty cache) ───────────────────────────

const KNOWN_NEW_MOON_TS = new Date('2000-01-06T18:14:00Z').getTime()
const LUNAR_CYCLE_MS    = 29.53059 * 86400000

function calcFallback(date: Date): MoonPhaseResult {
  const pos = ((date.getTime() - KNOWN_NEW_MOON_TS) % LUNAR_CYCLE_MS + LUNAR_CYCLE_MS) % LUNAR_CYCLE_MS
  const frac = pos / LUNAR_CYCLE_MS
  const illumination = Math.round((1 - Math.cos(frac * 2 * Math.PI)) / 2 * 100)

  let phase: MoonPhaseName
  if (frac < 0.0625)      phase = 'new_moon'
  else if (frac < 0.25)   phase = 'waxing_crescent'
  else if (frac < 0.3125) phase = 'first_quarter'
  else if (frac < 0.5)    phase = 'waxing_gibbous'
  else if (frac < 0.5625) phase = 'full_moon'
  else if (frac < 0.75)   phase = 'waning_gibbous'
  else if (frac < 0.8125) phase = 'last_quarter'
  else                     phase = 'waning_crescent'

  return { phase, emoji: EMOJIS[phase], name: NAMES[phase], illumination }
}

// ── Interpolation from major phase anchor points ───────────────────────────

function interpolate(date: Date, majors: MajorPhase[]): MoonPhaseResult {
  const t = date.getTime()
  // normalize to UTC noon of that day so we compare full days, not instants
  const tDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0)

  let prev: MajorPhase | null = null
  let next: MajorPhase | null = null

  for (const m of majors) {
    if (m.ts <= tDay && (!prev || m.ts > prev.ts)) prev = m
    if (m.ts > tDay  && (!next || m.ts < next.ts)) next = m
  }

  if (!prev || !next) return calcFallback(date)

  const span     = next.ts - prev.ts
  const elapsed  = tDay - prev.ts
  const progress = elapsed / span // 0..1 through this quarter

  // Within 1 day of a major phase → show that major phase
  const ONE_DAY = 86400000
  if (elapsed < ONE_DAY)       return build(prev.name, majorIllum(prev.name, 0))
  if (span - elapsed < ONE_DAY) return build(next.name, majorIllum(next.name, 1))

  // Intermediate phase + interpolated illumination
  const seq: MoonPhaseName[] = ['new_moon', 'first_quarter', 'full_moon', 'last_quarter']
  const prevIdx = seq.indexOf(prev.name)
  const nextIdx = seq.indexOf(next.name)

  // Guard: only handle adjacent known quarter transitions
  if (prevIdx === -1 || nextIdx === -1) return calcFallback(date)

  let phase: MoonPhaseName
  let illumination: number

  if (prev.name === 'new_moon'     && next.name === 'first_quarter') {
    phase = 'waxing_crescent'; illumination = Math.round(progress * 50)
  } else if (prev.name === 'first_quarter' && next.name === 'full_moon') {
    phase = 'waxing_gibbous';  illumination = Math.round(50 + progress * 50)
  } else if (prev.name === 'full_moon'     && next.name === 'last_quarter') {
    phase = 'waning_gibbous';  illumination = Math.round(100 - progress * 50)
  } else if (prev.name === 'last_quarter'  && next.name === 'new_moon') {
    phase = 'waning_crescent'; illumination = Math.round(50 - progress * 50)
  } else {
    return calcFallback(date)
  }

  return build(phase, illumination)
}

function build(phase: MoonPhaseName, illumination: number): MoonPhaseResult {
  return { phase, emoji: EMOJIS[phase], name: NAMES[phase], illumination }
}

function majorIllum(phase: MoonPhaseName, _progress: number): number {
  return phase === 'full_moon' ? 100
       : phase === 'new_moon'  ? 0
       : 50
}

// ── USNO fetch ─────────────────────────────────────────────────────────────

interface UsnoPhaseEntry { day: number; month: number; year: number; phase: string; time: string }

function parseUsnoDate(p: UsnoPhaseEntry): number {
  const [h, min] = p.time.split(':').map(Number)
  return Date.UTC(p.year, p.month - 1, p.day, h, min)
}

async function fetchYearPhases(year: number): Promise<void> {
  if (readYearCache(year)) return // already cached

  const url = `https://aa.usno.navy.mil/api/moon/phases/year?year=${year}&nump=99`
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`USNO year fetch failed: ${resp.status}`)

  const json = await resp.json()
  const phases: MajorPhase[] = (json.phasedata as UsnoPhaseEntry[])
    .filter(p => USNO_MAJOR[p.phase])
    .map(p => ({ ts: parseUsnoDate(p), name: USNO_MAJOR[p.phase] }))

  writeYearCache(year, phases)
}

async function fetchTodayPrecise(): Promise<void> {
  if (readTodayCache()) return // already have today

  const date = toLocalDateStr(new Date())
  const url   = `https://aa.usno.navy.mil/api/rstt/oneday?date=${date}&coords=0.0,0.0&tz=0`
  const resp  = await fetch(url)
  if (!resp.ok) throw new Error(`USNO oneday fetch failed: ${resp.status}`)

  const json  = await resp.json()
  const data  = json?.properties?.data
  if (!data?.fracillum || !data?.curphase) return

  const illumination = parseInt((data.fracillum as string).replace('%', ''), 10)
  const phase        = USNO_CURPHASE[data.curphase as string]
  if (!phase || isNaN(illumination)) return

  writeTodayCache(illumination, phase)
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Call once on app mount. Fetches major phase dates for the current year
 * (and next year in Nov/Dec) plus today's precise illumination from USNO.
 * Falls back silently — getMoonPhase() will use the local fallback if offline.
 */
export async function fetchMoonData(): Promise<void> {
  const year = new Date().getFullYear()
  const years = [year]
  if (new Date().getMonth() >= 10) years.push(year + 1) // pre-fetch next year in Nov+

  await Promise.allSettled([
    ...years.map(fetchYearPhases),
    fetchTodayPrecise(),
  ])
}

/**
 * Synchronous moon phase lookup. Returns USNO-sourced data if cache is
 * populated, otherwise falls back to a local synodic approximation.
 * The public interface is identical to the previous implementation.
 */
export function getMoonPhase(date: Date = new Date()): MoonPhaseResult {
  if (isSSR()) return calcFallback(date)

  // For today: prefer the precise USNO oneday data
  if (toLocalDateStr(date) === toLocalDateStr(new Date())) {
    const today = readTodayCache()
    if (today) return build(today.phase, today.illumination)
  }

  // For any date: interpolate from cached major phases
  const year   = date.getFullYear()
  const majors: MajorPhase[] = []
  for (const y of [year - 1, year, year + 1]) {
    const c = readYearCache(y)
    if (c) majors.push(...c)
  }

  if (majors.length === 0) return calcFallback(date)

  majors.sort((a, b) => a.ts - b.ts)
  return interpolate(date, majors)
}
