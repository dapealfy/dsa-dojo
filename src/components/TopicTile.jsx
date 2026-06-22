import { Link } from 'react-router-dom'
import TopicProgressRing from './TopicProgressRing'

export default function TopicTile({ topic, solved, total, pct }) {
  return (
    <Link
      to={`/problems?topic=${topic.key}`}
      className="topic-tile card-lift block rounded-xl p-5 group"
      style={{ '--tile-color': topic.color }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl" style={{ filter: `drop-shadow(0 0 8px ${topic.color}80)` }}>
          {topic.icon}
        </span>
        <TopicProgressRing pct={pct} color={topic.color} size={48} strokeWidth={4} />
      </div>
      <h3 className="font-bold text-text text-lg mb-1">{topic.name}</h3>
      <div className="text-xs text-text-muted font-mono">
        {solved} / {total} solved
      </div>
    </Link>
  )
}