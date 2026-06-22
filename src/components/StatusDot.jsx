export default function StatusDot({ status, className = '' }) {
  const config = {
    solved:    { color: '#3fb950', label: 'Solved' },
    attempted: { color: '#d29922', label: 'Attempted' },
    gave_up:   { color: '#f85149', label: 'Gave up' },
    unsolved:  { color: '#6e7681', label: 'Unsolved' },
  }[status] || { color: '#6e7681', label: 'Unsolved' }

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${className}`}
      style={{ backgroundColor: config.color, boxShadow: `0 0 6px ${config.color}80` }}
      title={config.label}
      aria-label={config.label}
    />
  )
}