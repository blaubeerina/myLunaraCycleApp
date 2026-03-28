export interface GCalEvent {
  id: string
  summary: string
  start: string  // ISO date string
  end: string
  colorId?: string
}

const TOKEN_KEY = 'gcal_token'
const TOKEN_EXPIRY_KEY = 'gcal_token_expiry'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem(TOKEN_KEY)
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!token || !expiry) return null
  if (Date.now() > Number(expiry)) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    return null
  }
  return token
}

function storeToken(token: string, expiresInSec: number) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresInSec * 1000))
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}

export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject('SSR')
    if ((window as any).google?.accounts) return resolve()
    const existing = document.getElementById('gsi-script')
    if (existing) { existing.addEventListener('load', () => resolve()); return }
    const script = document.createElement('script')
    script.id = 'gsi-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject('Failed to load Google Identity Services')
    document.head.appendChild(script)
  })
}

export function connectGoogle(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const goog = (window as any).google
    if (!goog?.accounts?.oauth2) return reject('GIS not loaded')

    const client = goog.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
      callback: (response: any) => {
        if (response.error) return reject(response.error)
        storeToken(response.access_token, response.expires_in ?? 3600)
        resolve(response.access_token)
      },
    })
    client.requestAccessToken()
  })
}

export async function fetchEvents(token: string, from: Date, to: Date): Promise<GCalEvent[]> {
  const params = new URLSearchParams({
    timeMin: from.toISOString(),
    timeMax: to.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error(`GCal API error: ${res.status}`)
  const data = await res.json()
  return (data.items ?? []).map((item: any) => ({
    id: item.id,
    summary: item.summary ?? '(kein Titel)',
    start: item.start?.date ?? item.start?.dateTime ?? '',
    end: item.end?.date ?? item.end?.dateTime ?? '',
    colorId: item.colorId,
  }))
}

export function eventsForDate(events: GCalEvent[], date: Date): GCalEvent[] {
  const iso = date.toISOString().split('T')[0]
  return events.filter(e => e.start.startsWith(iso))
}
