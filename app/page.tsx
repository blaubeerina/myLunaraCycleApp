'use client'
import { useState, useEffect, useCallback } from 'react'
import { loadData, saveData, calcCycle, StoredData } from './lib/cycle'
import { checkAndNotify, registerServiceWorker } from './lib/notifications'
import { T, Lang } from './lib/i18n'
import { GCalEvent, fetchEvents, getStoredToken } from './lib/googleCalendar'
import { fetchMoonData } from './lib/moon'
import BottomNav from './components/BottomNav'
import HomeScreen from './components/HomeScreen'
import CalendarScreen from './components/CalendarScreen'
import LogScreen from './components/LogScreen'
import FeedbackScreen from './components/FeedbackScreen'
import SettingsScreen from './components/SettingsScreen'
import OnboardingScreen from './components/OnboardingScreen'

type Tab = 'home' | 'calendar' | 'log' | 'feedback' | 'settings'

export default function App() {
  const [data, setData] = useState<StoredData | null>(null)
  const [tab, setTab] = useState<Tab>('home')
  const [googleToken, setGoogleToken] = useState<string | null>(null)
  const [, setMoonReady] = useState(0)
  const [googleEvents, setGoogleEvents] = useState<GCalEvent[]>([])

  useEffect(() => {
    setData(loadData())
    const stored = getStoredToken()
    if (stored) setGoogleToken(stored)
    registerServiceWorker()
    fetchMoonData().then(() => setMoonReady(n => n + 1))
  }, [])

  useEffect(() => {
    if (data) checkAndNotify(data, calcCycle(data))
  }, [data])

  useEffect(() => {
    if (!googleToken) { setGoogleEvents([]); return }
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const to = new Date(now.getFullYear(), now.getMonth() + 2, 0)
    fetchEvents(googleToken, from, to)
      .then(setGoogleEvents)
      .catch(() => { setGoogleToken(null); setGoogleEvents([]) })
  }, [googleToken])

  const handleDataChange = useCallback((partial: Partial<StoredData>) => {
    setData((prev) => {
      if (!prev) return prev
      const updated: StoredData = { ...prev, ...partial }
      // Deep merge logs per-date to prevent stale-closure data loss
      if (partial.logs !== undefined) {
        const merged: Record<string, import('./lib/cycle').PeriodLog> = { ...prev.logs }
        for (const date of Object.keys(partial.logs)) {
          merged[date] = { ...(prev.logs?.[date] ?? {}), ...(partial.logs[date] ?? {}) }
        }
        updated.logs = merged
      }
      // Deep merge checkIns (date → emoji map)
      if (partial.checkIns !== undefined) {
        updated.checkIns = { ...prev.checkIns, ...partial.checkIns }
      }
      return updated
    })
  }, [])

  // Persist to localStorage whenever data changes (outside functional updater = no StrictMode double-invoke issues)
  useEffect(() => {
    if (data) saveData(data)
  }, [data])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight">
        <div className="text-4xl animate-pulse">🌙</div>
      </div>
    )
  }

  // Onboarding: kein Periodendatum gesetzt → geführte Einrichtung zeigen
  if (!data.lastPeriodStart) {
    return (
      <main className="bg-midnight min-h-screen">
        <OnboardingScreen onComplete={handleDataChange} />
      </main>
    )
  }

  const cycle = calcCycle(data)
  const t = T[data.language as Lang]

  return (
    <main className="bg-midnight min-h-screen">
      {tab === 'home' && (
        <HomeScreen cycle={cycle} data={data} t={t} onDataChange={handleDataChange} onNavigate={setTab} googleEvents={googleEvents} />
      )}
      {tab === 'calendar' && (
        <CalendarScreen cycle={cycle} data={data} t={t} googleEvents={googleEvents} onDataChange={handleDataChange} />
      )}
      {tab === 'log' && (
        <LogScreen cycle={cycle} data={data} t={t} onDataChange={handleDataChange} onNavigate={setTab} />
      )}
      {tab === 'feedback' && (
        <FeedbackScreen data={data} t={t} />
      )}
      {tab === 'settings' && (
        <SettingsScreen data={data} t={t} onDataChange={handleDataChange} onGoogleToken={setGoogleToken} />
      )}
      <BottomNav active={tab} onNavigate={setTab} />
    </main>
  )
}
