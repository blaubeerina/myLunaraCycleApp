'use client'
import { getMoonPhase } from '../lib/moon'
import { CycleState, StoredData } from '../lib/cycle'
import { getTodayImpulse } from '../lib/impulses'
import { getDayTip } from '../lib/dailytips'
import { Translations } from '../lib/i18n'
import { GCalEvent, eventsForDate } from '../lib/googleCalendar'

type Tab = 'home' | 'calendar' | 'log' | 'feedback' | 'settings'

interface Props {
  cycle: CycleState
  data: StoredData
  t: Translations
  onDataChange: (d: Partial<StoredData>) => void
  onNavigate: (tab: Tab) => void
  googleEvents?: GCalEvent[]
}

const PHASE_COLORS: Record<string, string> = {
  menstruation: '#D4A5A5',   // Dusty Rose
  follicular:   '#9CAF88',   // Sage Green
  ovulation:    '#C8902A',   // Deep Amber
  luteal:       '#A99BC8',   // Muted Lavender
  unknown:      '#D1D9E0',   // Misty Blue-Grey
}

const CHECKIN_EMOJIS = ['🙂', '😌', '🌧', '🌊', '🔥', '🌙', '💫', '🌸']

const STICKY_COLORS = [
  { bg: '#FFF4B8', text: '#3A2E00' },
  { bg: '#FFD6D6', text: '#4A1818' },
  { bg: '#C8E6FF', text: '#002040' },
  { bg: '#C8F0D8', text: '#003020' },
  { bg: '#E8D0FF', text: '#300050' },
  { bg: '#FFE0C8', text: '#3A1000' },
]

function formatEventTime(start: string, locale: string): string | null {
  if (!start.includes('T')) return null
  return new Date(start).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
}

const GLASS_CARD = {
  background: 'rgba(255,255,255,0.45)',
  border: '1.5px solid rgba(255,255,255,0.5)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 10px 30px rgba(156,175,136,0.15)',
  color: '#4A5568',
}

export default function HomeScreen({ cycle, data, t, onDataChange, onNavigate, googleEvents }: Props) {
  const moon = getMoonPhase()
  const impulse = getTodayImpulse(cycle.phase, data.language)
  const dayTip = cycle.currentDay > 0 ? getDayTip(cycle.currentDay, data.language) : null
  const phaseColor = PHASE_COLORS[cycle.phase]
  const today = new Date().toISOString().split('T')[0]
  const todayCheckin = data.checkIns[today]
  const todayEvents = eventsForDate(googleEvents ?? [], new Date())

  function handleCheckin(emoji: string) {
    onDataChange({ checkIns: { ...data.checkIns, [today]: emoji } })
  }

  return (
    <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-2xl italic text-gold tracking-wide">lunaracycle</h1>
        <span className="text-xs font-sans" style={{ color: 'var(--ivory-dim)', opacity: 0.6 }}>
          {new Date().toLocaleDateString(data.language === 'de' ? 'de-DE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      {/* Mond mit Ambient Glow */}
      <div className="flex flex-col items-center mb-8 relative">
        {/* Ambient gold glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(201,168,76,0.13) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          className="text-8xl mb-3 relative z-10"
          style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.3))' }}
        >
          {moon.emoji}
        </div>
        <p className="font-serif text-xl text-gold italic relative z-10">{moon.name[data.language]}</p>
        <p className="text-xs mt-1 relative z-10" style={{ color: 'var(--ivory-dim)', opacity: 0.55 }}>
          {moon.illumination}% {t.home.illuminated}
        </p>
      </div>

      {/* Zyklus-Karte */}
      {cycle.phase === 'unknown' ? (
        <div className="rounded-2xl p-6 mb-4 text-center" style={GLASS_CARD}>
          <p className="text-3xl mb-3">🌹</p>
          <p className="font-serif text-lg italic mb-4" style={{ color: 'var(--ivory-dim)' }}>{t.home.noData}</p>
          <button
            onClick={() => onNavigate('log')}
            className="w-full py-3 rounded-xl font-sans text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #C4858A, #9B8EC4)', color: '#0D0B1A' }}
          >
            {data.language === 'de' ? 'Ersten Eintrag machen →' : 'Make your first entry →'}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-5 mb-4 border" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 10px 30px rgba(156,175,136,0.15)', borderColor: `${phaseColor}70` }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#5A4A7A', opacity: 0.8 }}>{t.home.cycleDay}</p>
              <p className="font-serif text-5xl font-light" style={{ color: phaseColor }}>{cycle.currentDay}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#5A4A7A', opacity: 0.8 }}>Phase</p>
              <p className="font-serif text-lg italic" style={{ color: phaseColor }}>
                {t.phase[cycle.phase]}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            {cycle.isLate ? (
              <p className="text-xs" style={{ color: 'var(--rose)' }}>{cycle.daysLate} {t.home.late}</p>
            ) : (
              <p className="text-xs" style={{ color: 'var(--ivory-dim)', opacity: 0.65 }}>{cycle.daysUntilNext} {t.home.daysUntil}</p>
            )}
          </div>
        </div>
      )}

      {/* Drei Info-Karten — Glassmorphism aus Moodboard */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl p-3 text-center" style={{ ...GLASS_CARD, borderColor: 'rgba(201,168,76,0.2)' }}>
          <p className="text-xl mb-1">{moon.emoji}</p>
          <p className="text-xs font-sans mb-0.5" style={{ color: 'var(--ivory-dim)', opacity: 0.55, fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{t.home.cards.moon}</p>
          <p className="font-serif text-xs" style={{ color: 'var(--ivory)', fontSize: '0.75rem', lineHeight: 1.2 }}>{moon.name[data.language]}</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ ...GLASS_CARD, borderColor: 'rgba(155,142,196,0.2)' }}>
          <p className="text-xl mb-1">
            {cycle.phase === 'menstruation' ? '🌹' : cycle.phase === 'follicular' ? '🌱' : cycle.phase === 'ovulation' ? '✨' : cycle.phase === 'luteal' ? '🍂' : '🌙'}
          </p>
          <p className="text-xs font-sans mb-0.5" style={{ color: 'var(--ivory-dim)', opacity: 0.55, fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{t.home.cards.phase}</p>
          <p className="font-serif text-xs" style={{ color: 'var(--ivory)', fontSize: '0.75rem', lineHeight: 1.2 }}>{t.home.energy[cycle.phase]}</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ ...GLASS_CARD, borderColor: 'rgba(107,170,176,0.2)' }}>
          <p className="text-xl mb-1">{todayCheckin || '💫'}</p>
          <p className="text-xs font-sans mb-0.5" style={{ color: 'var(--ivory-dim)', opacity: 0.55, fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{t.home.cards.energy}</p>
          <p className="font-serif text-xs" style={{ color: 'var(--ivory)', fontSize: '0.75rem', lineHeight: 1.2 }}>{todayCheckin ? t.home.howAreYou.split(' ')[0] : '—'}</p>
        </div>
      </div>

      {/* Impuls */}
      <div className="rounded-2xl p-5 mb-3" style={{
        background: 'rgba(107,170,176,0.07)',
        border: '1px solid rgba(107,170,176,0.18)',
      }}>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--teal)', fontSize: '8px', letterSpacing: '0.2em' }}>{t.home.todayImpulse}</p>
        <p className="font-serif text-base italic leading-relaxed" style={{ color: 'var(--ivory)' }}>"{impulse}"</p>
      </div>

      {/* Tipp + Supplement des Tages */}
      {dayTip && (
        <div className="rounded-2xl p-4 mb-3 flex items-center gap-3" style={{
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.15)',
        }}>
          <span className="text-lg flex-shrink-0">🌿</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-sans" style={{ color: 'var(--ivory)', opacity: 0.85 }}>{dayTip.tipp}</p>
            <p className="text-xs mt-0.5 font-sans" style={{ color: 'var(--gold-soft)', fontSize: '10px' }}>
              Supplement: {dayTip.supplement}
            </p>
          </div>
        </div>
      )}

      {/* Google-Kalender-Spiegel — Sticky Notes */}
      {todayEvents.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs uppercase tracking-widest font-sans"
              style={{ color: 'var(--ivory-dim)', opacity: 0.45, fontSize: '9px', letterSpacing: '0.18em' }}>
              {t.home.todayEvents}
            </p>
            <span className="text-xs" style={{ opacity: 0.3 }}>🔒</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {todayEvents.map((ev, idx) => {
              const color = STICKY_COLORS[idx % STICKY_COLORS.length]
              const time = formatEventTime(ev.start, data.language === 'de' ? 'de-DE' : 'en-US')
              return (
                <div
                  key={ev.id}
                  className="flex-shrink-0 rounded-xl p-3 flex flex-col justify-between"
                  style={{
                    background: color.bg,
                    minWidth: '110px',
                    maxWidth: '150px',
                    minHeight: '80px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    transform: `rotate(${idx % 2 === 0 ? '-1.2' : '1.0'}deg)`,
                  }}
                >
                  {time && (
                    <p className="font-sans font-medium" style={{ fontSize: '9px', color: color.text, opacity: 0.6 }}>
                      {time}
                    </p>
                  )}
                  <p className="font-sans font-medium leading-tight"
                    style={{ fontSize: '12px', color: color.text, marginTop: time ? '4px' : '0' }}>
                    {ev.summary}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Check-in */}
      <div className="rounded-2xl p-5" style={GLASS_CARD}>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--ivory-dim)', opacity: 0.5 }}>{t.home.howAreYou}</p>
        <div className="flex justify-between">
          {CHECKIN_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleCheckin(emoji)}
              className={`text-2xl rounded-xl transition-all flex items-center justify-center ${
                todayCheckin === emoji ? 'scale-110' : ''
              }`}
              style={{
                minWidth: '44px',
                minHeight: '44px',
                ...(todayCheckin === emoji ? { background: 'rgba(200,144,42,0.15)' } : {}),
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
