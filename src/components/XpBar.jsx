import { xpProgressInLevel } from '../lib/xp'

export default function XpBar({ totalXp, compact = false }) {
  const { level, xpIntoLevel, pct } = xpProgressInLevel(totalXp)
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="font-mono text-accent font-semibold">Lv {level}</span>
        <div className="w-20 h-1.5 bg-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono text-text-muted text-xs">{totalXp} XP</span>
      </div>
    )
  }
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-semibold text-accent">Level {level}</span>
        <span className="text-xs text-text-muted font-mono">{xpIntoLevel} / 100 XP</span>
      </div>
      <div className="h-2 bg-bg rounded-full overflow-hidden border border-border-soft">
        <div
          className="h-full bg-gradient-to-r from-accent to-purple transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}