import { CycleState, StoredData } from './cycle'

const NOTIF_MESSAGES: Record<string, Record<'de' | 'en', { title: string; body: string }>> = {
  periodIn2: {
    de: { title: 'lunaracycle 🌙', body: 'In 2 Tagen beginnt ein neuer Zyklus. Sei sanft zu dir.' },
    en: { title: 'lunaracycle 🌙', body: 'Your cycle begins in 2 days. Be gentle with yourself.' },
  },
  periodToday: {
    de: { title: 'lunaracycle 🌹', body: 'Heute ist ein sanfter Tag. Gönn dir Ruhe.' },
    en: { title: 'lunaracycle 🌹', body: 'Today is a gentle day. Give yourself rest.' },
  },
  ovulationToday: {
    de: { title: 'lunaracycle ✨', body: 'Heute strahlst du — ein energiereicher Tag.' },
    en: { title: 'lunaracycle ✨', body: 'You shine today — a high-energy day.' },
  },
}

export async function checkAndNotify(data: StoredData, cycle: CycleState): Promise<void> {
  if (!data.notificationsEnabled) return
  if (typeof window === 'undefined') return
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  if (!('serviceWorker' in navigator)) return

  const today = new Date().toISOString().split('T')[0]
  if (localStorage.getItem('luna_last_notified') === today) return

  const lang = (data.language ?? 'de') as 'de' | 'en'
  let key: string | null = null

  if (cycle.daysUntilNext === 2) key = 'periodIn2'
  else if (cycle.phase === 'menstruation' && cycle.currentDay === 1) key = 'periodToday'
  else if (cycle.phase === 'ovulation') key = 'ovulationToday'

  if (!key) return

  const msg = NOTIF_MESSAGES[key][lang]
  try {
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification(msg.title, {
      body: msg.body,
      icon: '/icons/icon-192.png',
      silent: false,
      tag: 'lunaracycle-daily',
    })
    localStorage.setItem('luna_last_notified', today)
  } catch { /* silent fail */ }
}

export async function registerServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
  try {
    await navigator.serviceWorker.register('/sw.js')
  } catch { /* silent fail */ }
}
