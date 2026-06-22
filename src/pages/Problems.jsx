import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useHandle } from '../hooks/useHandle'
import { useProgress } from '../hooks/useProgress'
import { PROBLEMS } from '../data/problems-index'
import { TOPICS, TOPICS_BY_KEY, DIFFICULTIES } from '../data/topics'
import ProblemCard from '../components/ProblemCard'
import EmptyState from '../components/EmptyState'

export default function Problems() {
  const { handle } = useHandle()
  const { getStatus, progress } = useProgress(handle)
  const [search, setSearch] = useSearchParams()

  const [topicFilter, setTopicFilter] = useState(search.get('topic') || '')
  const [diffFilter, setDiffFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return PROBLEMS.filter(p => {
      if (topicFilter && p.topic !== topicFilter) return false
      if (diffFilter && p.difficulty !== diffFilter) return false
      if (statusFilter && getStatus(p.id) !== statusFilter) return false
      if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false
      return true
    }).sort((a, b) => a.number - b.number)
  }, [topicFilter, diffFilter, statusFilter, query, getStatus])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Problems</h1>

      {/* Filters */}
      <div className="bg-bg-card border border-border-soft rounded-xl p-4 mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search problems..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-bg border border-border-soft rounded-lg px-3 py-2 text-sm focus:border-accent outline-none"
        />

        <div className="space-y-3">
          <FilterRow label="Topic">
            <button
              onClick={() => setTopicFilter('')}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                !topicFilter ? 'bg-accent text-bg' : 'bg-bg-soft text-text-muted hover:text-text'
              }`}
            >
              All
            </button>
            {TOPICS.map(t => (
              <button
                key={t.key}
                onClick={() => setTopicFilter(t.key)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  topicFilter === t.key ? 'bg-accent text-bg' : 'bg-bg-soft text-text-muted hover:text-text'
                }`}
                style={topicFilter === t.key ? {} : { color: t.color }}
              >
                {t.icon} {t.name}
              </button>
            ))}
          </FilterRow>

          <FilterRow label="Difficulty">
            <button
              onClick={() => setDiffFilter('')}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                !diffFilter ? 'bg-accent text-bg' : 'bg-bg-soft text-text-muted hover:text-text'
              }`}
            >
              All
            </button>
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  diffFilter === d ? 'bg-accent text-bg' : 'bg-bg-soft text-text-muted hover:text-text'
                }`}
              >
                {d}
              </button>
            ))}
          </FilterRow>

          <FilterRow label="Status">
            {[
              { v: '', label: 'All' },
              { v: 'solved', label: '✓ Solved' },
              { v: 'attempted', label: '⋯ Attempted' },
              { v: 'unsolved', label: '○ Unsolved' },
            ].map(s => (
              <button
                key={s.v}
                onClick={() => setStatusFilter(s.v)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  statusFilter === s.v ? 'bg-accent text-bg' : 'bg-bg-soft text-text-muted hover:text-text'
                }`}
              >
                {s.label}
              </button>
            ))}
          </FilterRow>
        </div>
      </div>

      <div className="text-sm text-text-muted mb-3 font-mono">
        {filtered.length} {filtered.length === 1 ? 'problem' : 'problems'}
        {(topicFilter || diffFilter || statusFilter || query) && (
          <button
            onClick={() => { setTopicFilter(''); setDiffFilter(''); setStatusFilter(''); setQuery('') }}
            className="ml-3 text-accent hover:underline"
          >
            clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No problems match your filters"
          description="Try widening your search or clearing filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(p => (
            <ProblemCard key={p.id} problem={p} status={getStatus(p.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterRow({ label, children }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-text-subtle uppercase tracking-wider mr-1 min-w-[70px]">{label}</span>
      {children}
    </div>
  )
}