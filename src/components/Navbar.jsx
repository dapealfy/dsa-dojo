import { Link, useLocation } from 'react-router-dom'
import { useHandle } from '../hooks/useHandle'
import { useXp } from '../hooks/useXp'
import { useStreak } from '../hooks/useStreak'
import { useProgress } from '../hooks/useProgress'
import XpBar from './XpBar'
import StreakBadge from './StreakBadge'

export default function Navbar() {
  const { handle } = useHandle()
  const { progress } = useProgress(handle)
  const { currentStreak } = useStreak(handle)
  const totalXp = useXp(progress)
  const location = useLocation()

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/problems', label: 'Problems' },
    { to: '/profile', label: 'Profile' },
    { to: '/about', label: 'About' },
  ]

  return (
    <nav className="sticky top-0 z-30 bg-bg/80 backdrop-blur border-b border-border-soft">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent to-purple flex items-center justify-center font-bold text-bg text-sm">
            ⚡
          </div>
          <span className="font-bold text-lg tracking-tight">Algodeck</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const active = location.pathname === item.to ||
              (item.to !== '/' && location.pathname.startsWith(item.to))
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'text-accent bg-accent/10'
                    : 'text-text-muted hover:text-text hover:bg-bg-soft'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-4">
          {handle && (
            <>
              <XpBar totalXp={totalXp} compact />
              <StreakBadge current={currentStreak} compact />
            </>
          )}
          {handle && (
            <span className="hidden sm:inline text-xs font-mono text-text-subtle bg-bg-soft px-2 py-1 rounded">
              @{handle}
            </span>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center justify-center gap-1 pb-2 px-2 border-t border-border-soft">
        {navItems.map(item => {
          const active = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                active ? 'text-accent' : 'text-text-muted'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}