'use client'
import { getMoonPhase } from '../lib/moon'
import { CycleState, StoredData } from '../lib/cycle'
import { getDayTip } from '../lib/dailytips'
import { Translations } from '../lib/i18n'
import { GCalEvent } from '../lib/googleCalendar'

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
  menstruation: '#C47A7A',
  follicular:   '#7A9B6A',
  ovulation:    '#C9A830',
  luteal:       '#8B80B8',
  unknown:      '#B8B0A0',
}

const PHASE_ICONS: Record<string, string> = {
  menstruation: '🌑',
  follicular:   '🌒',
  ovulation:    '🌕',
  luteal:       '🌖',
  unknown:      '🌙',
}

const CHECKIN_EMOJIS = ['🙂', '😌', '🌧', '🌊', '🔥', '🌙', '💫', '🌸']

// Dark glass card — shared style
const CARD: React.CSSProperties = {
  background: 'rgba(46,42,30,0.75)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 4px 15px rgba(0,0,0,0.35)',
  borderRadius: '20px',
}

export default function HomeScreen({ cycle, data, t, onDataChange, onNavigate }: Props) {
  const moon = getMoonPhase()
  const dayTip = cycle.currentDay > 0 ? getDayTip(cycle.currentDay, data.language) : null
  const phaseColor = PHASE_COLORS[cycle.phase]
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const todayCheckin = data.checkIns[todayStr]
  const lang = data.language
  const locale = lang === 'de' ? 'de-DE' : 'en-US'

  const dateLabel = today.toLocaleDateString(locale, {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })

  function handleCheckin(emoji: string) {
    onDataChange({ checkIns: { ...data.checkIns, [todayStr]: emoji } })
  }

  // Tips list items — DB "Nearby Transit" style
  const tipRows: { icon: string; text: string }[] = [
    ...(dayTip ? [
      { icon: '🫖', text: dayTip.tipp },
      { icon: '✦', text: `Supplement: ${dayTip.supplement}` },
    ] : []),
    { icon: '🌙', text: `${moon.name[lang]} · ${moon.illumination}% ${t.home.illuminated}` },
  ]

  return (
    <div className="min-h-screen">
      {/* Fixed Header — "MEIN ZYKLUS" */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(24,22,15,0.88)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(201,168,48,0.10)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 max-w-md mx-auto">
          <button
            onClick={() => onNavigate('settings')}
            aria-label="Einstellungen"
            style={{ fontSize: '19px', color: '#B8B0A0', lineHeight: 1 }}
          >
            ⚙
          </button>
          <h1
            className="font-serif-display font-semibold tracking-widest uppercase"
            style={{ fontSize: '12px', color: '#C9A830', letterSpacing: '0.28em' }}
          >
            MEIN ZYKLUS
          </h1>
          <button
            onClick={() => onNavigate('log')}
            aria-label="Neuer Eintrag"
            style={{ fontSize: '24px', color: '#B8B0A0', lineHeight: 1, fontWeight: 300 }}
          >
            +
          </button>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="pt-16 pb-32 px-5 max-w-md mx-auto">

        {/* ── TICKET CARD — Phase Event (DB Navigator style) ── */}
        {cycle.phase === 'unknown' ? (
          /* Empty state */
          <div className="mt-5 p-6 text-center" style={CARD}>
            <p className="text-3xl mb-3">🌹</p>
            <p className="font-sans text-base mb-4" style={{ color: '#EDE5CC' }}>{t.home.noData}</p>
            <button
              onClick={() => onNavigate('log')}
              className="w-full py-3 rounded-xl font-sans text-sm font-medium"
              style={{ background: 'linear-gradient(135deg, #D4A5A5, #A99BC8)', color: '#fff' }}
            >
              {lang === 'de' ? 'Ersten Eintrag machen →' : 'Make your first entry →'}
            </button>
          </div>
        ) : (
          <div
            className="mt-5 overflow-hidden"
            style={{ ...CARD, border: `1.5px solid ${phaseColor}45` }}
          >
            {/* ── Ticket Header ── */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <div className="flex items-center gap-3">
                {/* Terracotta moon cycle icon — replaces DB red square */}
                <div
                  className="flex items-center justify-center rounded-xl text-xl flex-shrink-0"
                  style={{
                    width: '44px',
                    height: '44px',
                    background: `${phaseColor}22`,
                    border: `1.5px solid ${phaseColor}55`,
                  }}
                >
                  {PHASE_ICONS[cycle.phase]}
                </div>
                <div>
                  <p
                    className="font-serif-display uppercase tracking-widest mb-0.5"
                    style={{ fontSize: '8px', color: '#A0AEC0', letterSpacing: '0.18em' }}
                  >
                    {lang === 'de' ? 'AKTUELLE PHASE' : 'CURRENT PHASE'}
                  </p>
                  {/* Phase name — script font for a feminine, editorial feel */}
                  <p className="font-script" style={{ fontSize: '22px', color: phaseColor, lineHeight: 1.2 }}>
                    {t.phase[cycle.phase]}
                  </p>
                </div>
              </div>

              {/* Day badge */}
              {cycle.currentDay > 0 && (
                <div className="text-right">
                  <p
                    className="font-serif-display uppercase tracking-widest mb-0.5"
                    style={{ fontSize: '8px', color: '#A0AEC0' }}
                  >
                    TAG
                  </p>
                  <p className="font-sans font-bold text-2xl" style={{ color: phaseColor }}>
                    {cycle.currentDay}
                  </p>
                </div>
              )}
            </div>

            {/* ── Perforation — tear-off dashed line ── */}
            <div className="relative flex items-center">
              <div
                className="rounded-full flex-shrink-0"
                style={{
                  width: '18px', height: '18px',
                  background: 'linear-gradient(165deg, #FDFBF7, #D1D9E0)',
                  marginLeft: '-9px',
                }}
              />
              <div
                className="flex-1 mx-1"
                style={{ borderTop: '1.5px dashed rgba(0,0,0,0.10)' }}
              />
              <div
                className="rounded-full flex-shrink-0"
                style={{
                  width: '18px', height: '18px',
                  background: 'linear-gradient(165deg, #FDFBF7, #D1D9E0)',
                  marginRight: '-9px',
                }}
              />
            </div>

            {/* ── Ticket Body ── */}
            <div className="px-5 pt-4 pb-5">

              {/* Journey row: Zyklustag → Nächste Periode (Berlin Hbf → Minden) */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span style={{ fontSize: '12px', color: phaseColor }}>📍</span>
                    <p
                      className="font-serif-display uppercase tracking-widest"
                      style={{ fontSize: '7px', color: '#A0AEC0', letterSpacing: '0.16em' }}
                    >
                      {lang === 'de' ? 'ZYKLUSTAG' : 'CYCLE DAY'}
                    </p>
                  </div>
                  <p className="font-sans font-semibold text-sm" style={{ color: '#EDE5CC' }}>
                    {lang === 'de' ? `Tag ${cycle.currentDay}` : `Day ${cycle.currentDay}`}
                  </p>
                </div>

                <div style={{ color: '#B8B0A0', fontSize: '14px', marginTop: '18px' }}>›</div>

                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span style={{ fontSize: '12px', color: phaseColor }}>📍</span>
                    <p
                      className="font-serif-display uppercase tracking-widest"
                      style={{ fontSize: '7px', color: '#A0AEC0', letterSpacing: '0.16em' }}
                    >
                      {lang === 'de' ? 'NÄCHSTE PERIODE' : 'NEXT PERIOD'}
                    </p>
                  </div>
                  <p className="font-sans font-semibold text-sm" style={{ color: '#EDE5CC' }}>
                    {cycle.isLate
                      ? (lang === 'de' ? `${cycle.daysLate} Tage später` : `${cycle.daysLate} days late`)
                      : (lang === 'de' ? `in ${cycle.daysUntilNext} Tagen` : `in ${cycle.daysUntilNext} days`)}
                  </p>
                </div>
              </div>

              {/* Calendar row */}
              <div
                className="flex items-center gap-2 pt-3 mb-2"
                style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}
              >
                <span style={{ fontSize: '12px', color: '#A0AEC0' }}>📅</span>
                <p className="font-sans text-xs" style={{ color: '#EDE5CC', fontWeight: 400 }}>
                  {dateLabel}
                </p>
              </div>

              {/* Privacy row — replaces DB disclaimer */}
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '12px', color: '#A0AEC0' }}>🔒</span>
                <p className="font-sans" style={{ fontSize: '10px', color: '#A0AEC0' }}>
                  {lang === 'de'
                    ? 'Deine Daten sind nur für dich sichtbar.'
                    : 'Your data is only visible to you.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TIPS LIST — "Nearby Public Transit" style ── */}
        {tipRows.length > 0 && (
          <div className="mt-4 overflow-hidden" style={CARD}>
            <div className="px-5 pt-4 pb-2">
              <p
                className="font-serif-display uppercase tracking-widest"
                style={{ fontSize: '8px', color: '#A0AEC0', letterSpacing: '0.18em' }}
              >
                {lang === 'de' ? 'HEUTE FÜR DICH' : 'TODAY FOR YOU'}
              </p>
            </div>

            {tipRows.map((tip, idx) => (
              <div key={idx}>
                {idx > 0 && (
                  // Thin horizontal separator between list items (image_7 pattern)
                  <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', marginLeft: '56px' }} />
                )}
                <div className="flex items-center gap-3 px-5 py-3.5">
                  {/* Minimal icon — like bus icon in image_7 */}
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0 text-sm"
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'rgba(212,165,165,0.12)',
                      border: '1px solid rgba(212,165,165,0.25)',
                    }}
                  >
                    {tip.icon}
                  </div>
                  <p
                    className="font-sans text-sm"
                    style={{ color: '#EDE5CC', lineHeight: 1.45, fontWeight: 400 }}
                  >
                    {tip.text}
                  </p>
                </div>
              </div>
            ))}
            <div className="pb-1" />
          </div>
        )}

        {/* ── CHECK-IN ── */}
        <div className="mt-4 p-5" style={CARD}>
          <p
            className="font-serif-display uppercase tracking-widest mb-4"
            style={{ fontSize: '8px', color: '#A0AEC0', letterSpacing: '0.18em' }}
          >
            {t.home.howAreYou}
          </p>
          <div className="flex justify-between">
            {CHECKIN_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleCheckin(emoji)}
                className="text-2xl rounded-xl transition-all flex items-center justify-center"
                style={{
                  minWidth: '40px',
                  minHeight: '40px',
                  ...(todayCheckin === emoji
                    ? { background: `${phaseColor}22`, transform: 'scale(1.12)' }
                    : {}),
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
