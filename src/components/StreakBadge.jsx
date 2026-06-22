export default function StreakBadge({ current = 0, longest = 0, compact = false }) {
  if (compact) {
    return (
      <span className={`text-sm font-mono ${current > 0 ? 'text-medium' : 'text-text-subtle'}`}>
        🔥 {current}
      </span>
    )
  }
  return (
    <div className="flex items-center gap-3">
      <div className="text-center">
        <div className={`text-2xl font-bold font-mono ${current > 0 ? 'text-medium' : 'text-text-subtle'}`}>
          🔥 {current}
        </div>
        <div className="text-xs text-text-muted">current</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold font-mono text-text-muted">⚡ {longest}</div>
        <div className="text-xs text-text-muted">longest</div>
      </div>
    </div>
  )
}