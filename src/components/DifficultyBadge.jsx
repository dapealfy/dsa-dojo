import { DIFFICULTY_COLORS } from '../data/topics'

export default function DifficultyBadge({ difficulty, size = 'md' }) {
  const color = DIFFICULTY_COLORS[difficulty] || '#8b949e'
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-2.5 py-1' }
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-wide ${sizes[size]}`}
      style={{ color, background: `${color}1a`, border: `1px solid ${color}40` }}
    >
      {difficulty}
    </span>
  )
}