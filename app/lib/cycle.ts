export type CyclePhase = 'menstruation' | 'follicular' | 'ovulation' | 'luteal' | 'unknown'

export interface CycleState {
  lastPeriodStart: Date | null
  cycleLength: number
  periodLength: number
  effectivePeriodLength: number  // respects manual endedToday flag
  currentDay: number
  phase: CyclePhase
  nextPeriod: Date | null
  ovulationDate: Date | null
  fertileStart: Date | null
  fertileEnd: Date | null
  daysUntilNext: number
  isLate: boolean
  daysLate: number
}

export interface PeriodLog {
  intensity?: 'light' | 'medium' | 'heavy' | 'spotting'
  endedToday?: boolean
  mood?: 1 | 2 | 3 | 4 | 5
  pain?: 0 | 1 | 2 | 3
  energy?: 1 | 2 | 3
  symptoms?: string[]
  notes?: string
  photo?: string
  audio?: string  // base64 DataURL (audio/webm) — V1 voice note
}

export interface StoredData {
  lastPeriodStart: string | null
  cycleLength: number
  periodLength: number
  language: 'de' | 'en'
  checkIns: Record<string, string> // date → emoji
  logs: Record<string, PeriodLog>  // date → period log entry
  notificationsEnabled?: boolean
  periodHistory?: string[]          // past period start dates, oldest first
}

export const DEFAULT_DATA: StoredData = {
  lastPeriodStart: null,
  cycleLength: 28,
  periodLength: 5,
  language: 'de',
  checkIns: {},
  logs: {},
  periodHistory: [],
}

export function loadData(): StoredData {
  if (typeof window === 'undefined') return DEFAULT_DATA
  try {
    const raw = localStorage.getItem('lunaracycle')
    return raw ? { ...DEFAULT_DATA, ...JSON.parse(raw) } : DEFAULT_DATA
  } catch { return DEFAULT_DATA }
}

export function saveData(data: Partial<StoredData>): void {
  if (typeof window === 'undefined') return
  const current = loadData()
  localStorage.setItem('lunaracycle', JSON.stringify({ ...current, ...data }))
}

export function calcCycle(data: StoredData): CycleState {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (!data.lastPeriodStart) {
    return {
      lastPeriodStart: null, cycleLength: data.cycleLength,
      periodLength: data.periodLength, effectivePeriodLength: data.periodLength,
      currentDay: 0, phase: 'unknown', nextPeriod: null, ovulationDate: null,
      fertileStart: null, fertileEnd: null,
      daysUntilNext: 0, isLate: false, daysLate: 0,
    }
  }

  const start = new Date(data.lastPeriodStart)
  start.setHours(0, 0, 0, 0)
  const { cycleLength, periodLength } = data

  const currentDay = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1

  // Check if user manually ended the period early
  const endedEntry = Object.entries(data.logs ?? {})
    .filter(([, log]) => log.endedToday)
    .map(([date]) => { const d = new Date(date); d.setHours(0, 0, 0, 0); return d })
    .filter(d => d >= start && d < new Date(start.getTime() + periodLength * 86400000))
    .sort((a, b) => a.getTime() - b.getTime())
    .at(0)

  const effectivePeriodLength = endedEntry
    ? Math.floor((endedEntry.getTime() - start.getTime()) / 86400000) + 1
    : periodLength

  const ovulationDay = cycleLength - 14
  const ovulationDate = new Date(start); ovulationDate.setDate(start.getDate() + ovulationDay)
  const fertileStart = new Date(start); fertileStart.setDate(start.getDate() + ovulationDay - 5)
  const fertileEnd = new Date(start); fertileEnd.setDate(start.getDate() + ovulationDay + 1)
  const nextPeriod = new Date(start); nextPeriod.setDate(start.getDate() + cycleLength)

  const daysUntilNext = Math.ceil((nextPeriod.getTime() - today.getTime()) / 86400000)
  const isLate = currentDay > cycleLength
  const daysLate = isLate ? currentDay - cycleLength : 0

  let phase: CyclePhase
  if (currentDay >= 1 && currentDay <= effectivePeriodLength) phase = 'menstruation'
  else if (currentDay < ovulationDay - 1) phase = 'follicular'
  else if (currentDay <= ovulationDay + 1) phase = 'ovulation'
  else phase = 'luteal'

  return {
    lastPeriodStart: start, cycleLength, periodLength, effectivePeriodLength, currentDay,
    phase, nextPeriod, ovulationDate, fertileStart, fertileEnd,
    daysUntilNext, isLate, daysLate,
  }
}

export function addToDate(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

export function getDayPhaseFromHistory(date: Date, data: StoredData): CyclePhase {
  if (!data.lastPeriodStart) return 'unknown'

  // All known cycle starts sorted oldest → newest
  const allStarts: Date[] = [
    ...(data.periodHistory ?? []).map(s => { const d = new Date(s); d.setHours(0,0,0,0); return d }),
    (() => { const d = new Date(data.lastPeriodStart!); d.setHours(0,0,0,0); return d })(),
  ].sort((a, b) => a.getTime() - b.getTime())

  const target = new Date(date); target.setHours(0,0,0,0)
  const { cycleLength, periodLength } = data

  // Find which cycle the date belongs to
  let cycleStart: Date | null = null
  let nextStart: Date | null = null

  for (let i = 0; i < allStarts.length; i++) {
    const s = allStarts[i]
    const n = allStarts[i + 1] ?? null
    if (target >= s && (n === null || target < n)) {
      cycleStart = s
      nextStart = n
      break
    }
  }

  // Date is before all known history — use first known cycle
  if (!cycleStart && allStarts.length > 0 && target < allStarts[0]) {
    cycleStart = allStarts[0]
  }

  if (!cycleStart) return 'unknown'

  const actualCycleLength = nextStart
    ? Math.round((nextStart.getTime() - cycleStart.getTime()) / 86400000)
    : cycleLength

  const dayInCycle = Math.floor((target.getTime() - cycleStart.getTime()) / 86400000) + 1
  const ovDay = actualCycleLength - 14

  // Check manual period end for this cycle
  const endedEntry = Object.entries(data.logs ?? {})
    .filter(([, log]) => log.endedToday)
    .map(([d]) => { const dt = new Date(d); dt.setHours(0,0,0,0); return dt })
    .filter(d => d >= cycleStart! && d < new Date(cycleStart!.getTime() + periodLength * 86400000))
    .sort((a, b) => a.getTime() - b.getTime())
    .at(0)

  const effectivePeriodLength = endedEntry
    ? Math.floor((endedEntry.getTime() - cycleStart.getTime()) / 86400000) + 1
    : periodLength

  if (dayInCycle >= 1 && dayInCycle <= effectivePeriodLength) return 'menstruation'
  if (dayInCycle < ovDay - 1) return 'follicular'
  if (dayInCycle <= ovDay + 1) return 'ovulation'
  if (dayInCycle <= actualCycleLength) return 'luteal'
  return 'unknown'
}
