'use client'
import { useState, useRef } from 'react'
import { CycleState, StoredData, PeriodLog } from '../lib/cycle'
import { Translations } from '../lib/i18n'

type Tab = 'home' | 'calendar' | 'log' | 'feedback' | 'settings'

interface Props {
  cycle: CycleState
  data: StoredData
  t: Translations
  onDataChange: (d: Partial<StoredData>) => void
  onNavigate: (tab: Tab) => void
}

type Intensity = NonNullable<PeriodLog['intensity']>
const SYMPTOMS = ['cramps', 'bloating', 'headache', 'acne', 'tender'] as const
type SymptomKey = typeof SYMPTOMS[number]

const MOOD_EMOJIS = ['🌑', '🌒', '🌓', '🌔', '🌕'] as const

const SYMPTOM_ICONS: Record<SymptomKey, string> = {
  cramps: '🌀', bloating: '💨', headache: '🤕', acne: '✦', tender: '🌸',
}

const MOOD_LABELS: Record<'de' | 'en', string[]> = {
  de: ['Sehr schlecht', 'Schlecht', 'Okay', 'Gut', 'Sehr gut'],
  en: ['Very bad', 'Bad', 'Okay', 'Good', 'Very good'],
}

const CALM_QUOTES: Record<'de' | 'en', string[]> = {
  de: [
    'Diese Sorge ist nur ein Gedanke — nicht die Wahrheit.',
    'Du hast schon jeden schwierigen Tag überstanden.',
    'Dein Körper weiß, was er tut. Vertraue ihm.',
    'Morgen sieht alles schon ein bisschen anders aus.',
    'Du bist nicht allein mit diesem Gefühl.',
    'Atme. Dieser Moment geht vorbei.',
  ],
  en: [
    'This worry is just a thought — not the truth.',
    'You have survived every difficult day so far.',
    "Your body knows what it's doing. Trust it.",
    'Tomorrow everything will look a little different.',
    'You are not alone with this feeling.',
    'Breathe. This moment will pass.',
  ],
}

const TOTAL_STEPS = 5

// BatterySVG defined at module level — stable reference, no re-mount issues
function BatterySVG({ level }: { level: 0 | 1 | 2 | 3 }) {
  const fills = [0, 0.33, 0.66, 1]
  const fill = fills[level]
  const barH = Math.round(36 * fill)
  const barY = 44 - barH
  const colors: Record<number, string> = { 0: 'rgba(255,255,255,0.2)', 1: '#D4A5A5', 2: '#E6BE8A', 3: '#9CAF88' }
  const color = colors[level]
  return (
    <svg width="28" height="56" viewBox="0 0 28 56" fill="none">
      <rect x="9" y="0" width="10" height="6" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="1" y="6" width="26" height="48" rx="5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      {fill > 0 && (
        <rect x="4" y={barY + 3} width="20" height={barH} rx="3" fill={color} />
      )}
    </svg>
  )
}

// MicButton — module-level (stable reference, no re-mount issues)
function MicButton({ onAudioReady }: { onAudioReady: (base64: string) => void }) {
  const [recording, setRecording] = useState(false)
  const recRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  async function toggle() {
    if (recording) {
      recRef.current?.stop()
      setRecording(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunks.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        stream.getTracks().forEach(t => t.stop())
        const reader = new FileReader()
        reader.onload = (ev) => onAudioReady(ev.target?.result as string)
        reader.readAsDataURL(blob)
      }
      mr.start()
      recRef.current = mr
      setRecording(true)
    } catch { /* Mikrofon verweigert — kein Fehler anzeigen */ }
  }

  return (
    <button
      onClick={toggle}
      style={{
        minWidth: '44px', minHeight: '44px',
        color: recording ? '#D4A5A5' : 'rgba(237,229,204,0.4)',
        fontSize: '22px',
        animation: recording ? 'pulse 1s ease infinite' : 'none',
      }}
    >
      {recording ? '⏹' : '🎙'}
    </button>
  )
}

export default function LogScreen({ cycle, data, t, onDataChange, onNavigate }: Props) {
  const [saved, setSaved] = useState(false)
  const [ended, setEnded] = useState(false)
  const [worry, setWorry] = useState('')
  const [calmQuote, setCalmQuote] = useState<string | null>(null)
  const [storyOpen, setStoryOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [slideDir, setSlideDir] = useState<'fwd' | 'back'>('fwd')
  const [planeFlying, setPlaneFlying] = useState(false)
  const [localNotes, setLocalNotes] = useState('')

  const _d = new Date()
  const today = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`
  const todayLog: PeriodLog = data.logs?.[today] ?? {}
  const intensity: Intensity = todayLog.intensity ?? 'medium'
  const lang = data.language as 'de' | 'en'

  function showSaved() {
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function patchLog(patch: Partial<PeriodLog>) {
    // Pass only the delta — handleDataChange deep-merges per-date, so no stale data.logs needed
    onDataChange({ logs: { [today]: patch } })
  }

  function startPeriod() { onDataChange({ lastPeriodStart: today }); showSaved() }

  function endPeriod() {
    patchLog({ endedToday: true })
    setEnded(true)
    setTimeout(() => setEnded(false), 3000)
  }

  function saveIntensity(i: Intensity) { patchLog({ intensity: i }); showSaved() }

  function toggleSymptom(sym: string) {
    const current = todayLog.symptoms ?? []
    const updated = current.includes(sym) ? current.filter(s => s !== sym) : [...current, sym]
    patchLog({ symptoms: updated })
  }

  function releaseWorry() {
    if (!worry.trim()) return
    const quotes = CALM_QUOTES[lang]
    const quote = quotes[Math.floor(Math.random() * quotes.length)]
    setWorry('')
    setCalmQuote(quote)
    setTimeout(() => setCalmQuote(null), 4000)
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 400
        const ratio = Math.min(MAX / img.width, MAX / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        patchLog({ photo: canvas.toDataURL('image/jpeg', 0.75) })
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  function goNext() {
    if (currentStep === 4) patchLog({ notes: localNotes })
    setSlideDir('fwd')
    setCurrentStep(s => Math.min(TOTAL_STEPS - 1, s + 1))
  }
  function goBack() { setSlideDir('back'); setCurrentStep(s => Math.max(0, s - 1)) }
  function openStory() {
    setCurrentStep(0)
    setSlideDir('fwd')
    setLocalNotes(todayLog.notes ?? '')
    setStoryOpen(true)
  }
  function closeStory() { setStoryOpen(false); setCurrentStep(0) }

  function submitStory() {
    patchLog({ notes: localNotes })
    setPlaneFlying(true)
    setTimeout(() => { setPlaneFlying(false); closeStory(); showSaved() }, 900)
  }

  const isPeriodActive = cycle.phase === 'menstruation'
  const progressPct = Math.min(100, Math.round((cycle.currentDay / data.periodLength) * 100))
  const hasCheckin = !!(todayLog.mood || todayLog.symptoms?.length || todayLog.energy || todayLog.notes)
  const moodLabels = MOOD_LABELS[lang]

  // ── Story step content rendered as function calls, NOT as <Component />
  // This avoids React treating each step as a "new component type" on re-render,
  // which would cause textarea focus loss and potential data loss.

  function renderStepContent() {
    switch (currentStep) {
      // ── Step 0: Mood ──────────────────────────────────────────────────
      case 0:
        return (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <p className="font-serif text-3xl italic mb-2" style={{ color: '#EDE5CC' }}>
              {lang === 'de' ? 'Wie fühlst du dich?' : 'How do you feel?'}
            </p>
            <p className="text-sm mb-10 text-center" style={{ color: 'rgba(237,229,204,0.45)' }}>
              {lang === 'de' ? 'Wähle deinen heutigen Mond' : 'Choose your moon for today'}
            </p>
            <div className="flex justify-center gap-4 w-full">
              {([1, 2, 3, 4, 5] as const).map((n, idx) => (
                <button
                  key={n}
                  onClick={() => { patchLog({ mood: n }); goNext() }}
                  className="flex flex-col items-center gap-2 transition-all"
                  style={{
                    transform: todayLog.mood === n ? 'scale(1.2)' : 'scale(1)',
                    opacity: todayLog.mood && todayLog.mood !== n ? 0.4 : 1,
                  }}
                >
                  <span style={{ fontSize: '44px' }}>{MOOD_EMOJIS[idx]}</span>
                  <span className="font-sans text-center leading-tight"
                    style={{ fontSize: '9px', color: 'rgba(237,229,204,0.5)', maxWidth: '44px' }}>
                    {moodLabels[idx]}
                  </span>
                </button>
              ))}
            </div>
            {todayLog.mood && (
              <button onClick={goNext} className="mt-10 px-8 py-3 rounded-2xl font-sans text-sm"
                style={{ background: 'rgba(200,144,42,0.2)', border: '1px solid rgba(200,144,42,0.4)', color: '#E6BE8A' }}>
                {lang === 'de' ? 'Weiter →' : 'Continue →'}
              </button>
            )}
          </div>
        )

      // ── Step 1: Symptoms ──────────────────────────────────────────────
      case 1:
        return (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <p className="font-serif text-3xl italic mb-2" style={{ color: '#EDE5CC' }}>
              {lang === 'de' ? 'Symptome heute?' : 'Any symptoms today?'}
            </p>
            <p className="text-sm mb-8 text-center" style={{ color: 'rgba(237,229,204,0.45)' }}>
              {lang === 'de' ? 'Mehrfachauswahl möglich' : 'Multiple selection'}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {SYMPTOMS.map((sym: SymptomKey) => {
                const isActive = (todayLog.symptoms ?? []).includes(sym)
                return (
                  <button
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className="flex flex-col items-center gap-2 px-5 py-4 rounded-2xl transition-all"
                    style={{
                      background: isActive ? 'rgba(169,155,200,0.25)' : 'rgba(255,255,255,0.07)',
                      border: `1.5px solid ${isActive ? 'rgba(169,155,200,0.6)' : 'rgba(255,255,255,0.1)'}`,
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      minWidth: '88px',
                    }}
                  >
                    <span style={{ fontSize: '30px' }}>{SYMPTOM_ICONS[sym]}</span>
                    <span className="font-sans text-xs" style={{ color: isActive ? '#D4CCE8' : 'rgba(237,229,204,0.5)' }}>
                      {t.log.symptomLabels[sym]}
                    </span>
                  </button>
                )
              })}
            </div>
            <button onClick={goNext} className="px-8 py-3 rounded-2xl font-sans text-sm"
              style={{ background: 'rgba(169,155,200,0.2)', border: '1px solid rgba(169,155,200,0.35)', color: '#D4CCE8' }}>
              {lang === 'de' ? 'Weiter →' : 'Continue →'}
            </button>
          </div>
        )

      // ── Step 2: Energy ────────────────────────────────────────────────
      case 2: {
        const levels: Array<{ n: 1 | 2 | 3; de: string; en: string; color: string }> = [
          { n: 1, de: 'Erschöpft',      en: 'Exhausted',      color: '#D4A5A5' },
          { n: 2, de: 'Okay',           en: 'Okay',           color: '#E6BE8A' },
          { n: 3, de: 'Voller Energie', en: 'Full of energy', color: '#9CAF88' },
        ]
        return (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <p className="font-serif text-3xl italic mb-2" style={{ color: '#EDE5CC' }}>
              {lang === 'de' ? 'Dein Energielevel?' : 'Your energy level?'}
            </p>
            <p className="text-sm mb-10 text-center" style={{ color: 'rgba(237,229,204,0.45)' }}>
              {lang === 'de' ? 'Wie voll ist dein Akku?' : 'How full is your battery?'}
            </p>
            <div className="flex justify-center gap-6">
              {levels.map(({ n, de, en, color }) => (
                <button
                  key={n}
                  onClick={() => { patchLog({ energy: n }); goNext() }}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all"
                  style={{
                    background: todayLog.energy === n ? `${color}22` : 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${todayLog.energy === n ? color : 'rgba(255,255,255,0.1)'}`,
                    transform: todayLog.energy === n ? 'scale(1.08)' : 'scale(1)',
                    minWidth: '80px',
                  }}
                >
                  <BatterySVG level={n} />
                  <span className="font-sans text-xs" style={{ color: todayLog.energy === n ? color : 'rgba(237,229,204,0.5)' }}>
                    {lang === 'de' ? de : en}
                  </span>
                </button>
              ))}
            </div>
            {todayLog.energy && (
              <button onClick={goNext} className="mt-10 px-8 py-3 rounded-2xl font-sans text-sm"
                style={{ background: 'rgba(156,175,136,0.15)', border: '1px solid rgba(156,175,136,0.3)', color: '#BDD4B4' }}>
                {lang === 'de' ? 'Weiter →' : 'Continue →'}
              </button>
            )}
          </div>
        )
      }

      // ── Step 3: Photo ─────────────────────────────────────────────────
      case 3:
        return (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <p className="font-serif text-3xl italic mb-2" style={{ color: '#EDE5CC' }}>
              {lang === 'de' ? 'Tages-Foto' : 'Day Photo'}
            </p>
            <p className="text-sm mb-8 text-center" style={{ color: 'rgba(237,229,204,0.45)' }}>
              {lang === 'de' ? 'Optional — für deinen persönlichen Rückblick' : 'Optional — for your personal review'}
            </p>
            <label className="block cursor-pointer w-full max-w-xs mb-8">
              {todayLog.photo ? (
                <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
                  <img src={todayLog.photo} alt="Tagesfoto" className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 rounded-full px-2 py-1 text-xs font-sans"
                    style={{ background: 'rgba(0,0,0,0.5)', color: '#EDE5CC' }}>✎</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl"
                  style={{ aspectRatio: '1/1', background: 'rgba(255,255,255,0.05)', border: '1.5px dashed rgba(255,255,255,0.2)' }}>
                  <span style={{ fontSize: '48px', opacity: 0.3 }}>📷</span>
                  <p className="text-sm font-sans mt-3" style={{ color: 'rgba(237,229,204,0.35)' }}>
                    {lang === 'de' ? 'Foto hinzufügen' : 'Add photo'}
                  </p>
                </div>
              )}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
            </label>
            <button onClick={goNext} className="px-8 py-3 rounded-2xl font-sans text-sm"
              style={{ background: 'rgba(200,144,42,0.15)', border: '1px solid rgba(200,144,42,0.3)', color: '#E6BE8A' }}>
              {lang === 'de' ? 'Weiter →' : 'Continue →'}
            </button>
          </div>
        )

      // ── Step 4: Notes + Sorgen-Fresser ───────────────────────────────
      case 4:
        return (
          <div className="flex flex-col h-full px-6 py-4 overflow-y-auto">
            {/* Header mit Mikrofon-Button */}
            <div className="flex items-center justify-between mb-1 mt-2">
              <p className="font-serif text-3xl italic" style={{ color: '#EDE5CC' }}>
                {lang === 'de' ? 'Deine Notizen' : 'Your Notes'}
              </p>
              <MicButton onAudioReady={(base64) => patchLog({ audio: base64 })} />
            </div>
            <p className="text-sm mb-4" style={{ color: 'rgba(237,229,204,0.45)' }}>
              {lang === 'de' ? 'Optional — nur für dich' : 'Optional — just for you'}
            </p>
            <textarea
              rows={4}
              maxLength={280}
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              placeholder={lang === 'de' ? 'Wie war dein Tag wirklich...' : 'How was your day really...'}
              className="w-full rounded-xl p-4 outline-none resize-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1.5px solid rgba(255,255,255,0.15)',
                color: '#EDE5CC',
                fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
                fontSize: '16px',
                lineHeight: 1.6,
                minHeight: 'unset',
              }}
            />
            {/* Audio-Playback wenn Sprachnotiz vorhanden */}
            {todayLog.audio && (
              <div className="mt-3 mb-2">
                <p className="text-xs uppercase tracking-widest mb-1"
                  style={{ color: 'rgba(237,229,204,0.35)', fontSize: '9px' }}>
                  {lang === 'de' ? 'Sprachnotiz' : 'Voice note'}
                </p>
                <audio controls src={todayLog.audio} className="w-full" style={{ opacity: 0.75 }} />
              </div>
            )}
            <div className="mb-3" />

            {/* Sorgen-Fresser */}
            <div className="rounded-2xl p-4 mb-5"
              style={{ background: 'rgba(169,155,200,0.08)', border: '1px solid rgba(169,155,200,0.2)' }}>
              <p className="text-xs uppercase tracking-widest mb-1"
                style={{ color: '#A99BC8', opacity: 0.7, fontSize: '9px', letterSpacing: '0.2em' }}>
                {lang === 'de' ? 'Sorgen-Fresser' : 'Worry Jar'}
              </p>
              <p className="text-xs mb-3" style={{ color: 'rgba(237,229,204,0.4)', lineHeight: 1.5 }}>
                {lang === 'de' ? 'Schreib sie auf — und lass sie los.' : 'Write it down — and let it go.'}
              </p>
              {calmQuote ? (
                <div className="text-center py-2">
                  <p className="font-serif text-base italic leading-relaxed" style={{ color: '#A99BC8' }}>
                    &ldquo;{calmQuote}&rdquo;
                  </p>
                </div>
              ) : (
                <>
                  <textarea
                    rows={2}
                    maxLength={200}
                    value={worry}
                    onChange={(e) => setWorry(e.target.value)}
                    placeholder={lang === 'de' ? 'Pian, pian... (Nur für mich)' : 'Little by little... (Only for me)'}
                    className="w-full rounded-xl p-3 outline-none resize-none mb-3"
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(169,155,200,0.2)',
                      color: 'rgba(237,229,204,0.85)',
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
                      fontSize: '15px',
                      lineHeight: 1.6,
                      minHeight: 'unset',
                    }}
                  />
                  <button
                    onClick={releaseWorry}
                    disabled={!worry.trim()}
                    className="w-full py-2.5 rounded-xl font-sans text-sm transition-all"
                    style={{
                      background: worry.trim() ? 'rgba(169,155,200,0.2)' : 'transparent',
                      color: worry.trim() ? '#A99BC8' : 'rgba(237,229,204,0.25)',
                      border: '1px solid rgba(169,155,200,0.25)',
                    }}
                  >
                    {lang === 'de' ? '🌬 An den Wind übergeben' : '🌬 Release to the wind'}
                  </button>
                </>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={submitStory}
              className="w-full py-4 rounded-2xl font-sans text-sm font-medium tracking-wide"
              style={{ background: 'linear-gradient(135deg, #D4A5A5, #A99BC8)', color: '#0D0B1A' }}
            >
              <span style={{ animation: planeFlying ? 'planeFly 0.9s ease forwards' : 'none', display: 'inline-block' }}>
                ✈
              </span>
              <span className="ml-2">
                {lang === 'de' ? 'Eintrag speichern' : 'Save entry'}
              </span>
            </button>
          </div>
        )

      default:
        return null
    }
  }

  // ──────────────────────────────────────────────────────────────────────

  // Shared card style — solid off-white, thin border, no heavy shadow
  const TICKET: React.CSSProperties = {
    background: '#FFFCF7',
    border: '1px solid rgba(0,0,0,0.05)',
    borderRadius: '20px',
    overflow: 'hidden',
  }

  const phaseIcon = cycle.phase === 'menstruation' ? '🌑'
    : cycle.phase === 'follicular' ? '🌒'
    : cycle.phase === 'ovulation' ? '🌕'
    : cycle.phase === 'luteal' ? '🌖' : '🌙'

  const phaseColor = cycle.phase === 'menstruation' ? '#D4A5A5'
    : cycle.phase === 'follicular' ? '#9CAF88'
    : cycle.phase === 'ovulation' ? '#C8902A'
    : cycle.phase === 'luteal' ? '#A99BC8' : '#B0BEC5'

  const today_date = new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <>
      {/* ===== Main Screen — Day-Ticket ===== */}
      <div className="min-h-screen pb-32 px-5 pt-6 max-w-md mx-auto">

        {/* Screen label */}
        <p className="font-sans uppercase tracking-widest mb-4"
          style={{ fontSize: '9px', color: '#A0AEC0', letterSpacing: '0.22em' }}>
          {lang === 'de' ? 'MEIN EINTRAG' : 'MY LOG'}
        </p>

        {!data.lastPeriodStart ? (
          <div style={TICKET}>
            <div className="p-6 text-center">
              <p className="text-4xl mb-4">🌹</p>
              <p className="font-sans text-base mb-6" style={{ color: '#4A5568', lineHeight: 1.5 }}>
                {lang === 'de'
                  ? 'Trag dein Periodendatum in den Einstellungen ein, um loszulegen.'
                  : 'Enter your period date in Settings to get started.'}
              </p>
              <button
                onClick={() => onNavigate('settings')}
                className="w-full py-4 rounded-2xl font-sans font-medium text-sm"
                style={{ background: 'linear-gradient(135deg, #D4A5A5, #A99BC8)', color: '#fff' }}
              >
                {lang === 'de' ? '→ Einstellungen öffnen' : '→ Open Settings'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">

            {/* ── DAY-TICKET CARD ── */}
            <div style={TICKET}>
              {/* Ticket Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-xl text-xl flex-shrink-0"
                    style={{ width: '44px', height: '44px', background: `${phaseColor}18`, border: `1.5px solid ${phaseColor}50` }}>
                    {phaseIcon}
                  </div>
                  <div>
                    {/* "TAG 2 — MENSTRUATION" — bold headline */}
                    <p className="font-sans font-bold"
                      style={{ fontSize: '15px', color: '#2D3748', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                      {lang === 'de' ? `TAG ${cycle.currentDay}` : `DAY ${cycle.currentDay}`}
                    </p>
                    <p className="font-sans font-bold uppercase tracking-wide"
                      style={{ fontSize: '11px', color: phaseColor, letterSpacing: '0.06em' }}>
                      {t.phase[cycle.phase]}
                    </p>
                  </div>
                </div>

                {/* Progress badge (period only) */}
                {isPeriodActive && (
                  <div className="text-right">
                    <p className="font-sans" style={{ fontSize: '9px', color: '#A0AEC0', marginBottom: '2px' }}>
                      {lang === 'de' ? 'VON CA.' : 'OF ~'}
                    </p>
                    <p className="font-sans font-bold text-lg" style={{ color: phaseColor }}>
                      {data.periodLength}
                    </p>
                  </div>
                )}
              </div>

              {/* ── Perforation ── */}
              <div className="relative flex items-center">
                <div className="rounded-full flex-shrink-0"
                  style={{ width: '16px', height: '16px', background: 'linear-gradient(165deg, #FDFBF7, #D1D9E0)', marginLeft: '-8px' }} />
                <div className="flex-1 mx-1" style={{ borderTop: '1.5px dashed rgba(0,0,0,0.08)' }} />
                <div className="rounded-full flex-shrink-0"
                  style={{ width: '16px', height: '16px', background: 'linear-gradient(165deg, #FDFBF7, #D1D9E0)', marginRight: '-8px' }} />
              </div>

              {/* Ticket Body — journey details */}
              <div className="px-5 pt-4 pb-5">

                {/* Two columns: Zyklus-Status → Nächste Phase */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span style={{ fontSize: '11px', color: phaseColor }}>📍</span>
                      <p className="font-sans uppercase tracking-widest" style={{ fontSize: '7px', color: '#A0AEC0', letterSpacing: '0.14em' }}>
                        {lang === 'de' ? 'ZYKLUS-STATUS' : 'CYCLE STATUS'}
                      </p>
                    </div>
                    <p className="font-sans font-semibold" style={{ fontSize: '16px', color: '#2D3748' }}>
                      {lang === 'de' ? 'Sanft' : 'Gentle'}
                    </p>
                  </div>
                  <div style={{ color: '#CBD5E0', fontSize: '14px', marginTop: '16px' }}>›</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span style={{ fontSize: '11px', color: phaseColor }}>🕐</span>
                      <p className="font-sans uppercase tracking-widest" style={{ fontSize: '7px', color: '#A0AEC0', letterSpacing: '0.14em' }}>
                        {lang === 'de' ? 'NÄCHSTE PHASE' : 'NEXT PHASE'}
                      </p>
                    </div>
                    <p className="font-sans font-semibold" style={{ fontSize: '16px', color: '#2D3748' }}>
                      {cycle.isLate
                        ? (lang === 'de' ? `${cycle.daysLate} Tage später` : `${cycle.daysLate} days late`)
                        : (lang === 'de' ? `in ${cycle.daysUntilNext} Tagen` : `in ${cycle.daysUntilNext} days`)}
                    </p>
                  </div>
                </div>

                {/* Calendar + privacy rows */}
                <div className="pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: '11px', color: '#A0AEC0' }}>📅</span>
                    <p className="font-sans" style={{ fontSize: '13px', color: '#4A5568', fontWeight: 400, lineHeight: 1.5 }}>
                      {today_date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '11px', color: '#A0AEC0' }}>🔒</span>
                    <p className="font-sans" style={{ fontSize: '11px', color: '#A0AEC0' }}>
                      {lang === 'de' ? 'Deine Daten sind nur für dich sichtbar.' : 'Your data is only visible to you.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Intensity (period only) ── */}
            {isPeriodActive && (
              <div style={TICKET}>
                <div className="px-5 pt-4 pb-1">
                  <p className="font-sans uppercase tracking-widest"
                    style={{ fontSize: '8px', color: '#A0AEC0', letterSpacing: '0.18em' }}>
                    {t.log.intensity}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 px-5 pb-4 pt-3">
                  {(['light', 'medium', 'heavy', 'spotting'] as Intensity[]).map((i) => (
                    <button
                      key={i}
                      onClick={() => saveIntensity(i)}
                      className="py-3 rounded-xl font-sans text-sm transition-all"
                      style={{
                        background: intensity === i ? `${phaseColor}18` : 'transparent',
                        border: `1px solid ${intensity === i ? phaseColor : 'rgba(0,0,0,0.07)'}`,
                        color: intensity === i ? phaseColor : '#718096',
                        fontSize: '14px',
                        lineHeight: 1.5,
                        fontWeight: intensity === i ? 600 : 400,
                      }}
                    >
                      {t.log[i]}
                    </button>
                  ))}
                </div>
                {ended ? (
                  <div className="mx-5 mb-4 py-3 rounded-xl text-center font-sans text-sm"
                    style={{ color: '#9CAF88', border: '1px solid rgba(156,175,136,0.3)', background: 'rgba(156,175,136,0.06)', fontSize: '14px' }}>
                    ✓ {lang === 'de' ? 'Periode beendet' : 'Period ended'}
                  </div>
                ) : (
                  <button
                    onClick={endPeriod}
                    className="mx-5 mb-4 w-[calc(100%-40px)] py-3 rounded-xl font-sans text-sm"
                    style={{ border: '1px solid rgba(0,0,0,0.07)', color: '#718096', fontSize: '14px', lineHeight: 1.5 }}
                  >
                    {t.log.periodEnd}
                  </button>
                )}
              </div>
            )}

            {/* ── Start period (non-active) ── */}
            {!isPeriodActive && (
              <div style={TICKET}>
                <div className="p-5">
                  <button
                    onClick={startPeriod}
                    className="w-full py-4 rounded-2xl font-sans font-semibold text-sm"
                    style={{ background: 'linear-gradient(135deg, #D4A5A5, #A99BC8)', color: '#fff', fontSize: '16px' }}
                  >
                    {t.log.periodStart}
                  </button>
                  <button
                    onClick={() => onNavigate('settings')}
                    className="mt-2 w-full py-3 rounded-xl font-sans text-xs"
                    style={{ border: '1px solid rgba(0,0,0,0.07)', color: '#A0AEC0', fontSize: '13px' }}
                  >
                    {lang === 'de' ? 'Datum korrigieren → Einstellungen' : 'Correct date → Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Symptoms — "Nearby Stops" list ── */}
            {(todayLog.symptoms?.length ?? 0) > 0 && (
              <div style={TICKET}>
                <div className="px-5 pt-4 pb-2">
                  <p className="font-sans uppercase tracking-widest"
                    style={{ fontSize: '8px', color: '#A0AEC0', letterSpacing: '0.18em' }}>
                    {lang === 'de' ? 'SYMPTOME HEUTE' : 'TODAY\'S SYMPTOMS'}
                  </p>
                </div>
                {todayLog.symptoms!.map((sym, idx) => (
                  <div key={sym}>
                    {idx > 0 && (
                      <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', marginLeft: '56px' }} />
                    )}
                    <div className="flex items-center gap-3 px-5 py-3.5">
                      <div className="flex items-center justify-center rounded-full flex-shrink-0 text-sm"
                        style={{ width: '32px', height: '32px', background: `${phaseColor}12`, border: `1px solid ${phaseColor}30` }}>
                        {SYMPTOM_ICONS[sym as SymptomKey] ?? '·'}
                      </div>
                      <p className="font-sans" style={{ fontSize: '16px', color: '#4A5568', lineHeight: 1.5, fontWeight: 400 }}>
                        {t.log.symptomLabels[sym as keyof typeof t.log.symptomLabels] ?? sym}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="pb-1" />
              </div>
            )}

            {/* ── Check-in entry ticket ── */}
            <button
              onClick={openStory}
              className="w-full text-left transition-all"
              style={{ ...TICKET, display: 'block' }}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-sans font-bold mb-1"
                    style={{ fontSize: '15px', color: '#2D3748', letterSpacing: '-0.02em' }}>
                    {hasCheckin
                      ? (lang === 'de' ? 'Eintrag bearbeiten' : 'Edit entry')
                      : (lang === 'de' ? 'Tages-Check-in' : 'Daily Check-in')}
                  </p>
                  {hasCheckin ? (
                    <div className="flex items-center gap-2">
                      {todayLog.mood && <span style={{ fontSize: '16px' }}>{MOOD_EMOJIS[todayLog.mood - 1]}</span>}
                      {todayLog.energy && (
                        <span style={{ fontSize: '13px', color: '#718096' }}>
                          {['🔋', '🔋🔋', '🔋🔋🔋'][todayLog.energy - 1]}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="font-sans" style={{ fontSize: '13px', color: '#A0AEC0', lineHeight: 1.5 }}>
                      {lang === 'de' ? 'Stimmung · Energie · Notizen' : 'Mood · Energy · Notes'}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: '20px', color: '#CBD5E0' }}>{hasCheckin ? '✎' : '›'}</span>
              </div>
            </button>
          </div>
        )}

        {saved && (
          <div className="fixed top-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <div className="px-6 py-3 rounded-2xl font-sans text-sm"
              style={{ background: 'rgba(156,175,136,0.9)', color: '#fff' }}>
              ✓ {t.log.saved}
            </div>
          </div>
        )}
      </div>

      {/* ===== Story Modal ===== */}
      {storyOpen && (
        <div
          className="fixed inset-0 z-[200] flex flex-col"
          style={{
            background: 'linear-gradient(135deg, #2e1a47, #1a1a2e, #0d1a2e, #2e1a47)',
            backgroundSize: '300% 300%',
            animation: 'meshShift 8s ease infinite',
          }}
        >
          {/* Progress bar */}
          <div className="flex gap-1.5 px-5 pt-5 pb-2 flex-shrink-0">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{ background: i <= currentStep ? 'rgba(200,144,42,0.85)' : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
            <button
              onClick={currentStep > 0 ? goBack : closeStory}
              style={{ color: 'rgba(237,229,204,0.5)', fontSize: '20px', minWidth: '44px', minHeight: '44px' }}
            >
              {currentStep > 0 ? '←' : '✕'}
            </button>
            <p className="font-sans text-xs uppercase tracking-widest" style={{ color: 'rgba(237,229,204,0.35)', fontSize: '9px' }}>
              {currentStep + 1} / {TOTAL_STEPS}
            </p>
            <button onClick={closeStory}
              style={{ color: 'rgba(237,229,204,0.35)', fontSize: '18px', minWidth: '44px', minHeight: '44px' }}>
              ✕
            </button>
          </div>

          {/* Step content — rendered as function call, NOT as <Component /> */}
          {/* key={currentStep} triggers the slide animation on step change */}
          <div
            key={currentStep}
            className="flex-1 overflow-hidden"
            style={{ animation: `${slideDir === 'fwd' ? 'slideInFromRight' : 'slideInFromLeft'} 0.28s ease` }}
          >
            {renderStepContent()}
          </div>
        </div>
      )}
    </>
  )
}
