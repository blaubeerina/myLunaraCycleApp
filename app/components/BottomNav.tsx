'use client'
import { Translations } from '../lib/i18n'

type Tab = 'home' | 'calendar' | 'log' | 'feedback' | 'settings'

interface Props {
  active: Tab
  onNavigate: (tab: Tab) => void
  t: Translations
}

const ICONS: Record<Tab, string> = {
  home: '🌙',
  calendar: '📅',
  log: '➕',
  feedback: '💌',
  settings: '⚙️',
}

export default function BottomNav({ active, onNavigate, t }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-cosmos border-t border-white/5">
      <div className="flex max-w-md mx-auto">
        {(['home', 'calendar', 'log', 'feedback', 'settings'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => onNavigate(tab)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
              active === tab ? 'text-gold' : 'text-ivory/40'
            }`}
          >
            <span className="text-xl">{ICONS[tab]}</span>
            <span className="text-xs font-sans tracking-wide uppercase" style={{ fontSize: '10px' }}>
              {t.nav[tab]}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
