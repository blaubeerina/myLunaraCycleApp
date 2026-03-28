'use client'
import { useState, useRef, useEffect } from 'react'
import { CycleState, StoredData } from '../lib/cycle'
import { getMoonPhase, MoonPhaseName } from '../lib/moon'
import { Translations } from '../lib/i18n'
import { GCalEvent, eventsForDate } from '../lib/googleCalendar'

interface Props {
  cycle: CycleState
  data: StoredData
  t: Translations
  googleEvents?: GCalEvent[]
  onDataChange: (d: Partial<StoredData>) => void
}

type DayPhase = 'menstruation' | 'follicular' | 'ovulation' | 'luteal' | null

function getDayPhase(date: Date, cycle: CycleState): DayPhase {
  if (!cycle.lastPeriodStart) return null
  const start = cycle.lastPeriodStart
  const { cycleLength, periodLength } = cycle
  const ovDay = cycleLength - 14

  const daysSince = Math.floor((date.getTime() - start.getTime()) / 86400000)
  const dayInCycle = ((daysSince % cycleLength) + cycleLength) % cycleLength + 1

  if (dayInCycle <= (cycle.effectivePeriodLength ?? periodLength)) return 'menstruation'
  if (dayInCycle < ovDay - 1) return 'follicular'
  if (dayInCycle <= ovDay + 1) return 'ovulation'
  if (dayInCycle <= cycleLength) return 'luteal'
  return null
}

// Ombre Moon Phase — linearer Gradient (für Day-Detail Modal)
const MOON_DARK = '#0F0D24'
const MOON_LIGHT = '#EDE5CC'

const WAXING_PHASES: MoonPhaseName[] = ['new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous']

function getMoonGradient(phase: MoonPhaseName, illumination: number): string {
  if (illumination < 5) return MOON_DARK
  if (illumination > 95) return MOON_LIGHT
  const stopPct = 100 - illumination
  return WAXING_PHASES.includes(phase)
    ? `linear-gradient(to right, ${MOON_DARK} ${stopPct}%, ${MOON_LIGHT})`
    : `linear-gradient(to left, ${MOON_DARK} ${stopPct}%, ${MOON_LIGHT})`
}

// Misty Dawn — radialer Glow für Kalender-Zellen
function getMoonRadial(illumination: number): string {
  const t = illumination / 100
  if (t < 0.05) {
    return `radial-gradient(circle at center, rgba(40,30,80,0.40) 0%, transparent 72%)`
  }
  if (t > 0.95) {
    return `radial-gradient(circle at center, rgba(237,229,204,0.90) 5%, rgba(237,229,204,0.48) 42%, transparent 78%)`
  }
  const r = Math.round(40 + (237 - 40) * t)
  const g = Math.round(30 + (229 - 30) * t)
  const b = Math.round(80 + (204 - 80) * t)
  const alpha = 0.15 + t * 0.75
  return `radial-gradient(circle at center, rgba(${r},${g},${b},${alpha}) 5%, rgba(${r},${g},${b},${alpha * 0.38}) 45%, transparent 78%)`
}

// Zyklus-Overlays — Misty Morning Gold Palette
const CYCLE_OVERLAY: Record<string, string> = {
  menstruation: 'rgba(212,165,165,0.42)',  // Dusty Rose
  ovulation:    'rgba(230,190,138,0.32)',   // Soft Amber
  follicular:   'rgba(156,175,136,0.16)',   // Sage Green
  luteal:       'rgba(169,155,200,0.16)',   // Muted Lavender
}

// Prognose-Overlays (Zukunft) — ~35% der normalen Opazität
const CYCLE_OVERLAY_FUTURE: Record<string, string> = {
  follicular: 'rgba(156,175,136,0.05)',
  luteal:     'rgba(169,155,200,0.05)',
}

// Erste-Hilfe-Koffer — Sofort-Tipps pro Symptom
const SYMPTOM_TIPS: Record<string, { de: string[], en: string[] }> = {
  cramps:   { de: ['Wärmflasche auf den Bauch legen', 'Ingwer- oder Himbeerblatttee trinken', '4-7-8 Atemübung: 4 sek ein · 7 halten · 8 aus'], en: ['Apply heat pad to abdomen', 'Drink ginger or raspberry leaf tea', '4-7-8 breathing: inhale 4s · hold 7s · exhale 8s'] },
  bloating: { de: ['Auf Zucker & Milchprodukte verzichten', 'Fenchel- oder Pfefferminztee trinken', 'Sanfte Bauchmassage im Uhrzeigersinn'], en: ['Avoid sugar & dairy', 'Drink fennel or peppermint tea', 'Gentle clockwise belly massage'] },
  headache: { de: ['2 große Gläser Wasser trinken', 'Schläfen mit Pfefferminzöl massieren', 'Dunklen Raum aufsuchen & Augen schließen'], en: ['Drink 2 large glasses of water', 'Massage temples with peppermint oil', 'Rest in a dark room, close eyes'] },
  acne:     { de: ['Gesicht nur 2× täglich sanft reinigen', 'Hände nicht ins Gesicht', 'Zinkreich essen: Kürbiskerne, Linsen'], en: ['Cleanse face gently only twice a day', 'Keep hands away from face', 'Eat zinc-rich foods: pumpkin seeds, lentils'] },
  tender:   { de: ['Sportlicher BH — auch nachts', 'Koffein & Salz reduzieren', 'Magnesium am Abend nehmen'], en: ['Wear supportive bra even at night', 'Reduce caffeine & salt', 'Take magnesium in the evening'] },
}

const PHASE_DOT: Record<string, string> = {
  menstruation: '#D4A5A5',   // Dusty Rose
  follicular:   '#9CAF88',   // Sage Green
  ovulation:    '#C8902A',   // Deep Amber
  luteal:       '#A99BC8',   // Muted Lavender
}

const SYMPTOM_ICONS: Record<string, string> = {
  cramps:   '🌀',
  bloating: '💨',
  headache: '🤕',
  acne:     '✦',
  tender:   '🌸',
}

export default function CalendarScreen({ cycle, data, t, googleEvents = [], onDataChange }: Props) {
  const [viewDate, setViewDate] = useState(new Date())
  const [expandedDay, setExpandedDay] = useState<Date | null>(null)
  const [animIn, setAnimIn] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [activeSymptom, setActiveSymptom] = useState<string | null>(null)
  const touchStartY = useRef<number>(0)
  const today = new Date(); today.setHours(0, 0, 0, 0)

  // Sync noteText whenever the selected day changes (covers re-opens and data updates)
  useEffect(() => {
    if (!expandedDay) return
    const dateStr = `${expandedDay.getFullYear()}-${String(expandedDay.getMonth() + 1).padStart(2, '0')}-${String(expandedDay.getDate()).padStart(2, '0')}`
    setNoteText(data.logs?.[dateStr]?.notes ?? '')
  }, [expandedDay, data.logs])

  function openDay(day: Date) {
    setExpandedDay(day)
    requestAnimationFrame(() => setAnimIn(true))
  }
  function closeDay() {
    setAnimIn(false)
    setActiveSymptom(null)
    setTimeout(() => setExpandedDay(null), 250)
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>, dateStr: string) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 400
        const ratio = Math.min(MAX / img.width, MAX / img.height)
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        const base64 = canvas.toDataURL('image/jpeg', 0.75)
        const existing = data.logs?.[dateStr] ?? {}
        onDataChange({ logs: { ...data.logs, [dateStr]: { ...existing, photo: base64 } } })
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6

  const days: (Date | null)[] = Array(startOffset).fill(null)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  while (days.length % 7 !== 0) days.push(null)

  const numRows = days.length / 7

  const monthLabel = viewDate.toLocaleDateString(
    data.language === 'de' ? 'de-DE' : 'en-US',
    { month: 'long', year: 'numeric' }
  )

  const lastPeriodLabel = cycle.lastPeriodStart
    ? cycle.lastPeriodStart.toLocaleDateString(
        data.language === 'de' ? 'de-DE' : 'en-US',
        { day: 'numeric', month: 'short' }
      )
    : '—'

  return (
    <div
      className="flex flex-col px-3 pt-4 max-w-md mx-auto"
      style={{ minHeight: 'calc(100dvh - 80px)' }}
    >
      {/* Header — kompakt */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="text-ivory/60 hover:text-ivory text-2xl w-10 h-10 flex items-center justify-center"
        >‹</button>
        <h1 className="font-serif text-lg italic text-gold capitalize">{monthLabel}</h1>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="text-ivory/60 hover:text-ivory text-2xl w-10 h-10 flex items-center justify-center"
        >›</button>
      </div>

      {/* Wochentage — kompakt */}
      <div className="grid grid-cols-7 mb-1 flex-shrink-0">
        {t.calendar.weekdays.map((d) => (
          <div key={d} className="text-center font-sans uppercase tracking-wide text-ivory/40" style={{ fontSize: '10px', paddingBlock: '4px' }}>{d}</div>
        ))}
      </div>

      {/* Kalender-Grid */}
      <div
        className="grid grid-cols-7 mb-2"
        style={{ gap: '20px', gridTemplateRows: `repeat(${numRows}, minmax(75px, 1fr))` }}
      >
        {days.map((day, i) => {
          if (!day) return <div key={i} />
          const phase = getDayPhase(day, cycle)
          const moon = getMoonPhase(day)
          const isToday = day.getTime() === today.getTime()

          const daysSince = cycle.lastPeriodStart
            ? Math.floor((day.getTime() - cycle.lastPeriodStart.getTime()) / 86400000)
            : -1
          const cycleDay = daysSince >= 0
            ? (daysSince % cycle.cycleLength) + 1
            : null
          const isOvulation = cycleDay !== null && cycleDay === (cycle.cycleLength - 14)
          const isMenstruation = phase === 'menstruation'
          const isFuture = day > today

          const dayEvents = eventsForDate(googleEvents, day)
          const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
          const dayLog = data.logs?.[dateStr]
          const hasLog = !!(dayLog?.mood || dayLog?.symptoms?.length || dayLog?.pain != null || dayLog?.energy)

          // Misty Dawn: Vollmond (>85%) braucht dunklen Text, sonst hell
          const dateColor = moon.illumination > 85
            ? (isToday ? '#C9A84C' : '#2A1F3D')
            : (isToday ? '#E2C87A' : '#EDE5CC')

          return (
            <div
              key={i}
              className="relative rounded-xl cursor-pointer overflow-hidden"
              style={{
                outline: isToday ? '2px solid #C9A84C' : 'none',
                outlineOffset: '-2px',
                boxShadow: moon.illumination > 70
                  ? `0 0 ${Math.round(moon.illumination / 10)}px rgba(237,229,204,${((moon.illumination - 70) / 200).toFixed(2)})`
                  : 'none',
              }}
              onClick={() => openDay(day)}
            >
              {/* Layer 1 — Mondglow (radial) */}
              <div className="absolute inset-0 rounded-xl"
                style={{ background: getMoonRadial(moon.illumination) }} />

              {/* Layer 2 — Zyklus-Wasserfarbe (Zukunft = blasser) */}
              {isMenstruation && (
                <div className="absolute inset-0 rounded-xl"
                  style={{
                    background: isFuture
                      ? 'radial-gradient(circle, rgba(217,139,139,0.08) 0%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(217,139,139,0.2) 0%, transparent 70%)',
                    boxShadow: isFuture ? 'none' : 'inset 0 0 12px rgba(217,139,139,0.15)',
                  }} />
              )}
              {phase === 'ovulation' && (
                <div className="absolute inset-0 rounded-xl"
                  style={{ background: isFuture
                    ? 'linear-gradient(to top, rgba(201,168,76,0.10) 0%, transparent 50%)'
                    : 'linear-gradient(to top, rgba(201,168,76,0.28) 0%, transparent 50%)' }} />
              )}
              {(phase === 'follicular' || phase === 'luteal') && (
                <div className="absolute inset-0 rounded-xl"
                  style={{ background: isFuture ? CYCLE_OVERLAY_FUTURE[phase] : CYCLE_OVERLAY[phase] }} />
              )}

              {/* Layer 3 — Inhalt */}
              <div className="absolute inset-0 flex z-10" style={{ padding: '5px 4px' }}>
                {/* Links: Datum + Phasen-Symbol */}
                <div className="flex flex-col justify-between flex-1">
                  <span
                    className="font-sans leading-none"
                    style={{ fontSize: '14px', fontWeight: isToday || phase ? 600 : 400, color: dateColor }}
                  >
                    {day.getDate()}
                  </span>
                  <span style={{ fontSize: '13px', lineHeight: 1, opacity: isFuture ? 0.45 : 1 }}>
                    {isMenstruation ? (isFuture ? '○' : '🩸') : isOvulation ? (isFuture ? '◦' : '☀️') : ''}
                  </span>
                </div>
                {/* Rechts: Moon-Icon + Event-Text oder ♡ */}
                <div className="flex flex-col justify-between items-end" style={{ width: '44%' }}>
                  <span style={{ fontSize: '10px', opacity: 0.32, lineHeight: 1, filter: 'grayscale(0.6)' }}>
                    {moon.emoji}
                  </span>
                  {dayEvents.length > 0 ? (
                    <span
                      className="font-sans text-right leading-tight"
                      style={{
                        fontSize: '7px',
                        color: 'rgba(160,185,150,0.78)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        maxWidth: '100%',
                      } as React.CSSProperties}
                    >
                      {dayEvents[0].summary}
                    </span>
                  ) : hasLog ? (
                    <span style={{ fontSize: '9px', opacity: 0.55, color: dateColor, lineHeight: 1 }}>♡</span>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legende + Zusammenfassung */}
      <div className="pb-4 space-y-2">
        {/* Legende */}
        <div className="bg-cosmos rounded-2xl p-3 border border-white/5">
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(t.calendar.legend).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PHASE_DOT[key] }} />
                <span className="text-ivory/60 font-sans" style={{ fontSize: '11px' }}>{label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
            <span className="text-ivory/35 font-sans" style={{ fontSize: '11px' }}>○ ◦</span>
            <span className="text-ivory/35 font-sans" style={{ fontSize: '11px' }}>
              {data.language === 'de' ? 'Prognose' : 'Forecast'}
            </span>
          </div>
        </div>

        {/* Zusammenfassung */}
        {cycle.lastPeriodStart && (
          <div className="bg-cosmos rounded-2xl p-3 border border-white/5">
            <div className="flex justify-between">
              <div>
                <p className="text-ivory/40 uppercase tracking-widest mb-0.5" style={{ fontSize: '9px' }}>{t.calendar.lastPeriod}</p>
                <p className="font-serif text-sm text-ivory/80">{lastPeriodLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-ivory/40 uppercase tracking-widest mb-0.5" style={{ fontSize: '9px' }}>{t.calendar.avgCycle}</p>
                <p className="font-serif text-sm text-ivory/80">{cycle.cycleLength} {t.calendar.days}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Day Detail Modal — Structured Split-Screen */}
      {expandedDay && (() => {
        const exMoon = getMoonPhase(expandedDay)
        const exPhase = getDayPhase(expandedDay, cycle)
        const exDateStr = `${expandedDay.getFullYear()}-${String(expandedDay.getMonth() + 1).padStart(2, '0')}-${String(expandedDay.getDate()).padStart(2, '0')}`
        const exLog = data.logs?.[exDateStr]
        const exEvents = eventsForDate(googleEvents, expandedDay)
        const exDaysSince = cycle.lastPeriodStart
          ? Math.floor((expandedDay.getTime() - cycle.lastPeriodStart.getTime()) / 86400000)
          : -1
        const exCycleDay = exDaysSince >= 0
          ? (exDaysSince % cycle.cycleLength) + 1
          : null
        const exDateColor = exMoon.illumination > 55 ? '#2A1F3D' : '#EDE5CC'
        const locale = data.language === 'de' ? 'de-DE' : 'en-US'

        return (
          <div
            className="fixed inset-0 z-[100]"
            style={{
              background: getMoonGradient(exMoon.phase, exMoon.illumination),
              opacity: animIn ? 1 : 0,
              transform: animIn ? 'scale(1)' : 'scale(0.95)',
              transition: 'opacity 250ms ease, transform 250ms ease',
            }}
            onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY }}
            onTouchEnd={(e) => {
              if (e.changedTouches[0].clientY - touchStartY.current > 80) closeDay()
            }}
          >
            {/* Zyklus-Farboverlay */}
            {exPhase && (
              <div className="fixed inset-0" style={{ background: CYCLE_OVERLAY[exPhase] }} />
            )}

            {/* Fester Header */}
            <div
              className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4"
              style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(12px)' }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={closeDay}
                  style={{ color: exDateColor, fontSize: '20px', opacity: 0.6, lineHeight: 1 }}
                >✕</button>
                <p className="font-serif text-lg italic" style={{ color: exDateColor }}>
                  {expandedDay.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '20px' }}>{exMoon.emoji}</span>
                <span className="font-sans text-xs" style={{ color: exDateColor, opacity: 0.6 }}>
                  {exMoon.name[data.language]}
                </span>
              </div>
            </div>

            {/* Horizontal Scroll — 2 Pages */}
            <div
              className="flex h-full overflow-x-auto"
              style={{
                scrollSnapType: 'x mandatory',
                scrollbarWidth: 'none',
                paddingTop: '64px',
                paddingBottom: '40px',
              }}
            >
              {/* PAGE 1 — Biologie */}
              <div
                className="flex-shrink-0 w-full overflow-y-auto px-5 py-6 relative z-10"
                style={{ scrollSnapAlign: 'start' }}
              >
                <p className="text-xs uppercase tracking-widest mb-4" style={{ color: exDateColor, opacity: 0.4, fontSize: '9px' }}>
                  {t.dayDetail.yourCycle}
                </p>

                {/* Phase + Zyklustag */}
                {exPhase ? (
                  <div
                    className="rounded-2xl p-4 mb-5"
                    style={{ background: CYCLE_OVERLAY[exPhase], border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <p className="font-serif text-xl italic" style={{ color: exDateColor, fontWeight: 600 }}>
                      {exCycleDay ? (data.language === 'de' ? `Tag ${exCycleDay} — ` : `Day ${exCycleDay} — `) : ''}
                      {t.phase[exPhase]}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm mb-4" style={{ color: exDateColor, opacity: 0.4 }}>{t.dayDetail.noPhase}</p>
                )}

                {/* Mood */}
                {exLog?.mood && (
                  <div className="flex items-center gap-2 mb-4">
                    <span style={{ fontSize: '24px' }}>
                      {(['🌑', '🌒', '🌓', '🌔', '🌕'] as const)[exLog.mood - 1]}
                    </span>
                    <span className="font-sans text-sm" style={{ color: exDateColor, opacity: 0.6, fontWeight: 600 }}>
                      {t.log.moodLabels[exLog.mood - 1]}
                    </span>
                  </div>
                )}

                {/* Symptom-Icons + Erste-Hilfe-Koffer */}
                {exLog?.symptoms && exLog.symptoms.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: exDateColor, opacity: 0.4, fontSize: '9px' }}>
                      {t.dayDetail.symptoms}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exLog.symptoms.map(s => (
                        <div
                          key={s}
                          className="flex items-center gap-1.5 rounded-xl px-3 py-2 cursor-pointer transition-all"
                          style={{
                            background: activeSymptom === s ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.2)',
                            border: activeSymptom === s ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.08)',
                          }}
                          onClick={() => setActiveSymptom(activeSymptom === s ? null : s)}
                        >
                          <span style={{ fontSize: '16px' }}>{SYMPTOM_ICONS[s] ?? '·'}</span>
                          <span className="text-xs font-sans" style={{ color: exDateColor, opacity: 0.7 }}>
                            {t.log.symptomLabels[s as keyof typeof t.log.symptomLabels] ?? s}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Erste-Hilfe-Karte */}
                    {activeSymptom && SYMPTOM_TIPS[activeSymptom] && (
                      <div className="mt-3 rounded-2xl p-4"
                        style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p className="text-xs uppercase tracking-widest mb-3"
                          style={{ color: exDateColor, opacity: 0.4, fontSize: '8px', letterSpacing: '0.18em' }}>
                          {data.language === 'de' ? 'Erste Hilfe' : 'First Aid'}
                        </p>
                        {SYMPTOM_TIPS[activeSymptom][data.language as 'de' | 'en'].map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-2 mb-2">
                            <span style={{ color: exDateColor, opacity: 0.35, fontSize: '11px', flexShrink: 0, paddingTop: '2px' }}>
                              {idx + 1}.
                            </span>
                            <p className="text-sm font-sans" style={{ color: exDateColor, opacity: 0.75, lineHeight: 1.45 }}>{tip}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Notizen-Preview — immer sichtbar auf Page 1 */}
                <div className="mt-4" style={{ marginLeft: '15%', marginRight: '15%' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.85)',
                    borderRadius: '20px',
                    padding: '30px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    borderLeft: '2px solid #D4A5A5',
                  }}>
                    <p className="uppercase tracking-widest mb-3"
                      style={{ color: '#D4A5A5', fontSize: '9px', letterSpacing: '0.2em', fontWeight: 600 }}>
                      {data.language === 'de' ? 'Notiz' : 'Note'}
                    </p>
                    <p style={{
                      color: '#333333',
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
                      fontSize: '1.1rem',
                      lineHeight: 1.7,
                      fontWeight: 400,
                      fontStyle: 'italic',
                    }}>
                      {exLog?.notes
                        ? (exLog.notes.length > 120 ? exLog.notes.slice(0, 120) + '…' : exLog.notes)
                        : (data.language === 'de' ? 'Noch keine Notizen für diesen Tag' : 'No notes for this day yet')}
                    </p>
                  </div>
                </div>

                {/* Sprachnotiz-Preview auf Page 1 */}
                {exLog?.audio && (
                  <div className="mt-3">
                    <p className="text-xs uppercase tracking-widest mb-1"
                      style={{ color: exDateColor, opacity: 0.35, fontSize: '9px' }}>
                      {data.language === 'de' ? 'Sprachnotiz' : 'Voice note'}
                    </p>
                    <audio controls src={exLog.audio} className="w-full" style={{ opacity: 0.65 }} />
                  </div>
                )}

                {/* Google Events */}
                {exEvents.length > 0 && (
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: exDateColor, opacity: 0.4, fontSize: '9px' }}>
                      {t.settings.googleEvents}
                    </p>
                    {exEvents.map(ev => (
                      <div key={ev.id} className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: exDateColor, opacity: 0.4 }} />
                        <span className="text-sm font-sans" style={{ color: exDateColor, opacity: 0.7 }}>{ev.summary}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PAGE 2 — Notiz & Foto */}
              <div
                className="flex-shrink-0 w-full overflow-y-auto px-5 py-6 relative z-10"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Tages-Foto */}
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: exDateColor, opacity: 0.4, fontSize: '9px' }}>
                  {t.dayDetail.photo}
                </p>
                <label className="block cursor-pointer mb-5">
                  {exLog?.photo ? (
                    <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
                      <img src={exLog.photo} alt="Tagesfoto" className="w-full h-full object-cover" />
                      <div
                        className="absolute top-2 right-2 rounded-full px-2 py-1 text-xs font-sans"
                        style={{ background: 'rgba(0,0,0,0.5)', color: '#EDE5CC' }}
                      >✎</div>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center rounded-2xl"
                      style={{ aspectRatio: '1/1', background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.15)' }}
                    >
                      <span style={{ fontSize: '36px', opacity: 0.3 }}>📷</span>
                      <p className="text-xs font-sans mt-2" style={{ color: exDateColor, opacity: 0.4 }}>
                        {t.dayDetail.photoAdd}
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, exDateStr)}
                  />
                </label>

                {/* Notizen — slim centered column, magazine style */}
                <div style={{ marginLeft: '15%', marginRight: '15%' }}>
                  <p className="uppercase tracking-widest mb-3"
                    style={{ color: exDateColor, opacity: 0.4, fontSize: '9px' }}>
                    {t.dayDetail.notes}
                  </p>
                  <div style={{
                    background: 'rgba(255,255,255,0.85)',
                    borderRadius: '20px',
                    padding: '30px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    borderLeft: '2px solid #D4A5A5',
                  }}>
                    <textarea
                      rows={5}
                      maxLength={280}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder={t.log.notesPlaceholder}
                      className="w-full outline-none resize-none"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#333333',
                        fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
                        fontSize: '1.1rem',
                        lineHeight: 1.7,
                        fontWeight: 400,
                      }}
                    />
                  </div>
                  <button
                    onClick={() => onDataChange({ logs: { [exDateStr]: { notes: noteText } } })}
                    className="mt-3 w-full py-3 rounded-xl font-sans text-sm font-medium"
                    style={{
                      background: exPhase ? CYCLE_OVERLAY[exPhase] : 'rgba(255,255,255,0.1)',
                      color: exDateColor,
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {t.dayDetail.saveNote}
                  </button>
                </div>

                {/* Sprachnotiz auf Page 2 */}
                {exLog?.audio && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-widest mb-2"
                      style={{ color: exDateColor, opacity: 0.35, fontSize: '9px' }}>
                      {data.language === 'de' ? 'Sprachnotiz' : 'Voice note'}
                    </p>
                    <audio controls src={exLog.audio} className="w-full" style={{ opacity: 0.7 }} />
                  </div>
                )}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-1.5 z-20">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: exDateColor, opacity: 0.7 }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: exDateColor, opacity: 0.25 }} />
            </div>
          </div>
        )
      })()}
    </div>
  )
}
