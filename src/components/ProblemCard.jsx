import { Link } from 'react-router-dom'
import DifficultyBadge from './DifficultyBadge'
import StatusDot from './StatusDot'
import { TOPICS_BY_KEY } from '../data/topics'

export default function ProblemCard({ problem, status, solvedCount }) {
  const topic = TOPICS_BY_KEY[problem.topic]
  return (
    <Link
      to={`/problems/${problem.id}`}
      className="block bg-bg-card border border-border-soft rounded-lg p-4 card-lift hover:bg-bg-hover"
    >
      <div className="flex items-start gap-3">
        <StatusDot status={status} className="mt-1.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-text-subtle font-mono">#{problem.number}</span>
            <DifficultyBadge difficulty={problem.difficulty} size="sm" />
            {topic && (
              <span className="text-xs text-text-muted" style={{ color: topic.color }}>
                {topic.icon} {topic.name}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-text truncate">{problem.title}</h3>
          {solvedCount !== undefined && (
            <div className="text-xs text-text-subtle mt-1 font-mono">
              {solvedCount} / {problem.testCases?.length || '?'} tests
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}