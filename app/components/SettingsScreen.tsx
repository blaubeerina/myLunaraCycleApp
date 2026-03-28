'use client'
import { useState, useEffect } from 'react'
import { StoredData } from '../lib/cycle'
import { Translations, Lang } from '../lib/i18n'
import { loadGoogleScript, connectGoogle, clearToken, getStoredToken } from '../lib/googleCalendar'

interface Props {
  data: StoredData
  t: Translations
  onDataChange: (d: Partial<StoredData>) => void
  onGoogleToken?: (token: string | null) => void
}

export default function SettingsScreen({ data, t, onDataChange, onGoogleToken }: Props) {
  const [saved, setSaved] = useState(false)
  const [gcalConnected, setGcalConnected] = useState(false)
  const [gcalLoading, setGcalLoading] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [notifActive, setNotifActive] = useState(false)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''

  useEffect(() => {
    setGcalConnected(!!getStoredToken())
    if ('Notification' in window) {
      setNotifActive(!!data.notificationsEnabled && Notification.permission === 'granted')
    }
  }, [data.notificationsEnabled])

  async function handleGoogleConnect() {
    setGcalLoading(true)
    try {
      await loadGoogleScript()
      const token = await connectGoogle(clientId)
      setGcalConnected(true)
      onGoogleToken?.(token)
    } catch (e) {
      console.error('Google connect failed:', e)
    } finally {
      setGcalLoading(false)
    }
  }

  function handleGoogleDisconnect() {
    clearToken()
    setGcalConnected(false)
    onGoogleToken?.(null)
  }

  async function handleNotificationToggle() {
    if (notifActive) {
      onDataChange({ notificationsEnabled: false })
      setNotifActive(false)
      return
    }
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      onDataChange({ notificationsEnabled: true })
      setNotifActive(true)
    }
  }

  function handleReset() {
    if (confirm(t.settings.resetConfirm)) {
      localStorage.removeItem('lunaracycle')
      window.location.reload()
    }
  }

  function handleDateChange(value: string) {
    if (value) {
      onDataChange({ lastPeriodStart: value })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto">
      <h1 className="font-serif text-3xl italic text-gold mb-8">{t.settings.title}</h1>

      {/* Letzter Periodenbeginn */}
      <div className="bg-cosmos rounded-2xl p-5 border border-white/5 mb-4">
        <p className="text-xs text-ivory/40 uppercase tracking-widest mb-3">
          {data.language === 'de' ? 'Letzter Periodenbeginn' : 'Last Period Start'}
        </p>
        <input
          type="date"
          max={new Date().toISOString().split('T')[0]}
          defaultValue={data.lastPeriodStart ?? ''}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full bg-midnight rounded-xl p-3 text-ivory border border-white/10 font-sans text-sm"
        />
      </div>

      {saved && (
        <div className="fixed top-6 left-0 right-0 flex justify-center z-50">
          <div className="bg-teal/20 border border-teal/40 text-teal px-6 py-3 rounded-2xl font-sans text-sm">
            ✓ {t.log.saved}
          </div>
        </div>
      )}

      {/* Sprache */}
      <div className="bg-cosmos rounded-2xl p-5 border border-white/5 mb-4">
        <p className="text-xs text-ivory/40 uppercase tracking-widest mb-4">{t.settings.language}</p>
        <div className="flex gap-3">
          {(['de', 'en'] as Lang[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onDataChange({ language: lang })}
              className={`flex-1 py-3 rounded-xl font-sans text-sm transition-all border ${
                data.language === lang
                  ? 'border-gold text-gold bg-gold/10'
                  : 'border-white/10 text-ivory/40 hover:border-white/20'
              }`}
            >
              {lang === 'de' ? '🇩🇪 Deutsch' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      </div>

      {/* Zykluslänge */}
      <div className="bg-cosmos rounded-2xl p-5 border border-white/5 mb-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs text-ivory/40 uppercase tracking-widest">{t.settings.cycleLength}</p>
          <span className="font-serif text-2xl text-gold">{data.cycleLength} <span className="text-sm text-ivory/40">{t.settings.days}</span></span>
        </div>
        <input
          type="range" min={21} max={45} value={data.cycleLength}
          onChange={(e) => onDataChange({ cycleLength: Number(e.target.value) })}
          className="w-full accent-gold"
        />
        <div className="flex justify-between text-xs text-ivory/20 mt-1">
          <span>21</span><span>45</span>
        </div>
      </div>

      {/* Periodendauer */}
      <div className="bg-cosmos rounded-2xl p-5 border border-white/5 mb-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs text-ivory/40 uppercase tracking-widest">{t.settings.periodLength}</p>
          <span className="font-serif text-2xl text-rose">{data.periodLength} <span className="text-sm text-ivory/40">{t.settings.days}</span></span>
        </div>
        <input
          type="range" min={2} max={10} value={data.periodLength}
          onChange={(e) => onDataChange({ periodLength: Number(e.target.value) })}
          className="w-full accent-rose"
        />
        <div className="flex justify-between text-xs text-ivory/20 mt-1">
          <span>2</span><span>10</span>
        </div>
      </div>

      {/* Version */}
      <div className="bg-cosmos rounded-2xl p-4 border border-white/5 mb-4 text-center">
        <p className="font-serif text-lg italic text-gold mb-1">lunaracycle</p>
        <p className="text-xs text-ivory/30">v0.1 Beta · {new Date().getFullYear()}</p>
      </div>

      {/* Google Kalender */}
      <div className="bg-cosmos rounded-2xl p-5 border border-white/5 mb-4">
        <p className="text-xs text-ivory/40 uppercase tracking-widest mb-4">{t.settings.googleCal}</p>
        {!clientId ? (
          <p className="text-xs text-ivory/30 text-center py-2">{t.settings.googleNoKey}</p>
        ) : gcalConnected ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-teal font-sans">{t.settings.googleConnected}</span>
            <button
              onClick={handleGoogleDisconnect}
              className="text-xs text-ivory/40 font-sans border border-white/10 px-4 py-2 rounded-xl hover:border-white/20 transition-colors"
            >
              {t.settings.googleDisconnect}
            </button>
          </div>
        ) : (
          <button
            onClick={handleGoogleConnect}
            disabled={gcalLoading}
            className="w-full py-3 rounded-xl font-sans text-sm border border-teal/30 text-teal/80 hover:border-teal/50 transition-colors disabled:opacity-40"
          >
            {gcalLoading ? '...' : t.settings.googleConnect}
          </button>
        )}
      </div>

      {/* Benachrichtigungen */}
      <div className="bg-cosmos rounded-2xl p-5 border border-white/5 mb-4">
        <p className="text-xs text-ivory/40 uppercase tracking-widest mb-4">
          {data.language === 'de' ? 'Benachrichtigungen' : 'Notifications'}
        </p>
        {'Notification' in (typeof window !== 'undefined' ? window : {}) ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ivory/70 font-sans">
                {data.language === 'de' ? 'Tägliche Erinnerungen' : 'Daily reminders'}
              </p>
              <p className="text-xs text-ivory/35 font-sans mt-0.5">
                {data.language === 'de' ? 'Diskrete Zyklus-Impulse' : 'Subtle cycle impulses'}
              </p>
            </div>
            <button
              onClick={handleNotificationToggle}
              className="px-4 py-2 rounded-xl text-sm font-sans transition-all border"
              style={{
                background: notifActive ? 'rgba(107,170,176,0.15)' : 'transparent',
                borderColor: notifActive ? 'rgba(107,170,176,0.4)' : 'rgba(255,255,255,0.1)',
                color: notifActive ? 'var(--teal)' : 'rgba(244,239,230,0.4)',
              }}
            >
              {notifActive
                ? (data.language === 'de' ? 'An ✓' : 'On ✓')
                : (data.language === 'de' ? 'Aus' : 'Off')}
            </button>
          </div>
        ) : (
          <p className="text-xs text-ivory/30 font-sans">
            {data.language === 'de' ? 'In diesem Browser nicht verfügbar' : 'Not available in this browser'}
          </p>
        )}
      </div>

      {/* Datenschutz */}
      <div className="bg-cosmos rounded-2xl border border-white/5 overflow-hidden mb-4">
        <button
          className="w-full flex items-center justify-between p-5"
          onClick={() => setPrivacyOpen(o => !o)}
        >
          <span className="text-sm font-sans text-ivory/80">
            {data.language === 'de' ? '🔒 Datenschutz' : '🔒 Privacy'}
          </span>
          <span className="text-ivory/40 text-xs">{privacyOpen ? '▲' : '▼'}</span>
        </button>
        {privacyOpen && (
          <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
            {(data.language === 'de' ? [
              ['📱', 'Alle Daten bleiben auf deinem Gerät', 'Nichts wird an Server gesendet'],
              ['🚫', 'Keine Werbung, keine Tracker', 'Wir verkaufen keine Daten'],
              ['🗑️', 'Daten löschen', 'Nutze "Daten zurücksetzen" unten'],
            ] : [
              ['📱', 'All data stays on your device', 'Nothing is sent to any server'],
              ['🚫', 'No ads, no trackers', 'We never sell data'],
              ['🗑️', 'Delete your data', 'Use "Reset Data" below'],
            ]).map(([icon, title, sub], idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <span className="text-lg flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-sm text-ivory/80 font-sans">{title}</p>
                  <p className="text-xs text-ivory/40 font-sans mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="w-full py-3 rounded-2xl text-rose/60 text-sm font-sans border border-rose/20 hover:border-rose/40 transition-colors"
      >
        {t.settings.resetData}
      </button>
    </div>
  )
}
