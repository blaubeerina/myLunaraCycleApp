'use client'
import { useState } from 'react'
import { StoredData } from '../lib/cycle'
import { Lang } from '../lib/i18n'

interface Props {
  onComplete: (data: Partial<StoredData>) => void
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [date, setDate] = useState('')
  const [cycleLength, setCycleLength] = useState(28)
  const [lang, setLang] = useState<Lang>('de')

  const today = new Date().toISOString().split('T')[0]

  function handleStart() {
    if (!date) return
    onComplete({ lastPeriodStart: date, cycleLength, language: lang })
  }

  const labels = {
    de: {
      welcome: 'Willkommen',
      tagline: 'Dein kosmischer Rhythmus beginnt hier.',
      dateLabel: 'Wann hat deine letzte Periode begonnen?',
      cycleLengthLabel: 'Wie lange dauert dein Zyklus?',
      days: 'Tage',
      langLabel: 'Sprache',
      cta: 'Loslegen →',
      ctaDisabled: 'Bitte Datum wählen',
    },
    en: {
      welcome: 'Welcome',
      tagline: 'Your cosmic rhythm starts here.',
      dateLabel: 'When did your last period start?',
      cycleLengthLabel: 'How long is your cycle?',
      days: 'days',
      langLabel: 'Language',
      cta: 'Get started →',
      ctaDisabled: 'Please select a date',
    },
  }
  const l = labels[lang]

  return (
    <div className="min-h-screen pb-10 px-5 pt-12 max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <div
          className="text-7xl mb-4"
          style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.35))' }}
        >🌙</div>
        <h1 className="font-serif text-3xl italic text-gold">{l.welcome}</h1>
        <p className="text-xs mt-2 font-sans text-center" style={{ color: 'var(--ivory-dim)', opacity: 0.6 }}>
          {l.tagline}
        </p>
      </div>

      <div className="space-y-5 flex-1">
        {/* Datum */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(196,133,138,0.08)', border: '1px solid rgba(196,133,138,0.25)' }}>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--rose)', fontSize: '9px', letterSpacing: '0.2em' }}>
            🌹 {l.dateLabel}
          </p>
          <input
            type="date"
            max={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl p-4 font-sans text-base border"
            style={{
              background: 'rgba(0,0,0,0.3)',
              color: date ? 'var(--ivory)' : 'var(--ivory-dim)',
              borderColor: date ? 'rgba(196,133,138,0.5)' : 'rgba(255,255,255,0.1)',
            }}
          />
        </div>

        {/* Zykluslänge */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.2em' }}>
              🌙 {l.cycleLengthLabel}
            </p>
            <span className="font-serif text-2xl text-gold">{cycleLength} <span className="text-sm" style={{ color: 'var(--ivory-dim)', opacity: 0.5 }}>{l.days}</span></span>
          </div>
          <input
            type="range" min={21} max={45} value={cycleLength}
            onChange={(e) => setCycleLength(Number(e.target.value))}
            className="w-full accent-gold"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--ivory-dim)', opacity: 0.35 }}>
            <span>21</span><span>45</span>
          </div>
        </div>

        {/* Sprache */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(107,170,176,0.06)', border: '1px solid rgba(107,170,176,0.15)' }}>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--teal)', fontSize: '9px', letterSpacing: '0.2em' }}>
            🌍 {l.langLabel}
          </p>
          <div className="flex gap-3">
            {(['de', 'en'] as Lang[]).map((l2) => (
              <button
                key={l2}
                onClick={() => setLang(l2)}
                className="flex-1 py-3 rounded-xl font-sans text-sm transition-all border"
                style={lang === l2
                  ? { borderColor: 'var(--teal)', color: 'var(--teal)', background: 'rgba(107,170,176,0.15)' }
                  : { borderColor: 'rgba(255,255,255,0.1)', color: 'var(--ivory-dim)', opacity: 0.5 }
                }
              >
                {l2 === 'de' ? '🇩🇪 Deutsch' : '🇬🇧 English'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleStart}
        disabled={!date}
        className="mt-8 w-full py-4 rounded-2xl font-sans text-sm tracking-wide transition-all"
        style={date
          ? { background: 'linear-gradient(135deg, #C9A84C, #9B8EC4)', color: '#0D0B1A', fontWeight: 500 }
          : { background: 'rgba(255,255,255,0.05)', color: 'rgba(244,239,230,0.25)', cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.05)' }
        }
      >
        {date ? l.cta : l.ctaDisabled}
      </button>
    </div>
  )
}
