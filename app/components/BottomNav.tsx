'use client'

type Tab = 'home' | 'calendar' | 'log' | 'feedback' | 'settings'

interface Props {
  active: Tab
  onNavigate: (tab: Tab) => void
}

const NAV_ITEMS: { tab: Tab; icon: string; label: string }[] = [
  { tab: 'home',     icon: '◐',  label: 'MONDSCHATZ' },
  { tab: 'calendar', icon: '⊟',  label: 'KALENDER' },
  { tab: 'feedback', icon: '◇',  label: 'FEEDBACK' },
  { tab: 'settings', icon: '○',  label: 'PROFIL' },
]

export default function BottomNav({ active, onNavigate }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-4 pb-safe pb-4">
        <div
          className="flex overflow-hidden"
          style={{
            background: 'rgba(46,42,30,0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(201,168,48,0.15)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.40)',
            borderRadius: '20px',
          }}
        >
          {NAV_ITEMS.map(({ tab, icon, label }) => {
            const isActive = active === tab
            return (
              <button
                key={tab}
                onClick={() => onNavigate(tab)}
                className="flex-1 flex flex-col items-center pt-2 pb-3 gap-1.5 relative transition-all"
                style={isActive ? { background: 'rgba(201,168,48,0.12)' } : {}}
              >
                {/* Terracotta active indicator bar — DB red bar pattern */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full transition-all"
                  style={{
                    width: isActive ? '28px' : '0px',
                    height: '2px',
                    background: '#C9A830',
                    opacity: isActive ? 1 : 0,
                  }}
                />

                {/* Line-art icon */}
                <span
                  className="font-sans"
                  style={{
                    fontSize: '18px',
                    lineHeight: 1,
                    color: isActive ? '#EDE5CC' : '#B8B0A0',
                    fontWeight: 300,
                    transition: 'color 150ms',
                  }}
                >
                  {icon}
                </span>

                {/* Label */}
                <span
                  className="font-sans font-medium"
                  style={{
                    fontSize: '8px',
                    letterSpacing: '0.10em',
                    color: isActive ? '#EDE5CC' : '#B8B0A0',
                    transition: 'color 150ms',
                  }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
