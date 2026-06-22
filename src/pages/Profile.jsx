import { useHandle } from '../hooks/useHandle'
import { useProgress } from '../hooks/useProgress'
import { useXp } from '../hooks/useXp'
import { useStreak } from '../hooks/useStreak'
import { useAchievements } from '../hooks/useAchievements'
import { PROBLEMS, PROBLEMS_BY_TOPIC, TOTAL_PROBLEMS } from '../data/problems-index'
import { TOPICS } from '../data/topics'
import { ACHIEVEMENTS } from '../lib/achievements'
import { xpProgressInLevel } from '../lib/xp'
import XpBar from '../components/XpBar'
import StreakBadge from '../components/StreakBadge'
import AchievementCard from '../components/AchievementCard'
import TopicProgressRing from '../components/TopicProgressRing'
import DifficultyBadge from '../components/DifficultyBadge'
import EmptyState from '../components/EmptyState'

export default function Profile() {
  const { handle, reset: resetHandle } = useHandle()
  const { progress, getStatus } = useProgress(handle)
  const totalXp = useXp(progress)
  const { activity, currentStreak, longestStreak } = useStreak(handle)
  const { unlocked, ACHIEVEMENTS: ACHMAP } = useAchievements(handle, {})

  if (!handle) {
    return (
      <EmptyState
        icon="👤"
        title="No handle yet"
        description="Pick a handle on the home page to start tracking your stats."
        action={<a href="/" className="inline-block bg-accent text-bg font-bold px-4 py-2 rounded-lg">Go home</a>}
      />
    )
  }

  const solvedEntries = Object.values(progress).filter(p => p.status === 'solved')
  const totalSolved = solvedEntries.length
  const easy = solvedEntries.filter(p => p.difficulty === 'Easy').length
  const medium = solvedEntries.filter(p => p.difficulty === 'Medium').length
  const hard = solvedEntries.filter(p => p.difficulty === 'Hard').length
  const { level } = xpProgressInLevel(totalXp)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">@{handle}</h1>
          <p className="text-text-muted text-sm mt-1">Level {level} · {totalXp} XP</p>
        </div>
        <button
          onClick={() => {
            if (confirm(`Reset handle "${handle}"? This keeps your cloud data — you can still log back in with this name. To wipe data, do it from the Supabase dashboard.`)) {
            }
          }}
          className="text-xs text-text-subtle hover:text-hard"
        >
          manage handle
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total XP" value={totalXp} accent="text-accent" />
        <StatCard label="Problems Solved" value={totalSolved} sub={`of ${TOTAL_PROBLEMS}`} />
        <div className="bg-bg-card border border-border-soft rounded-xl p-5 flex items-center justify-center">
          <StreakBadge current={currentStreak} longest={longestStreak} />
        </div>
      </div>

      <section className="bg-bg-card border border-border-soft rounded-xl p-5">
        <h2 className="font-bold mb-3">Progress</h2>
        <XpBar totalXp={totalXp} />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Difficulty Breakdown</h2>
        <div className="grid grid-cols-3 gap-3">
          <DiffBar label="Easy" solved={easy} total={PROBLEMS.filter(p => p.difficulty === 'Easy').length} color="easy" />
          <DiffBar label="Medium" solved={medium} total={PROBLEMS.filter(p => p.difficulty === 'Medium').length} color="medium" />
          <DiffBar label="Hard" solved={hard} total={PROBLEMS.filter(p => p.difficulty === 'Hard').length} color="hard" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Topic Mastery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TOPICS.map(topic => {
            const list = PROBLEMS_BY_TOPIC[topic.key] || []
            const solved = list.filter(p => progress[p.id]?.status === 'solved').length
            const pct = list.length ? (solved / list.length) * 100 : 0
            return (
              <div key={topic.key} className="bg-bg-card border border-border-soft rounded-lg p-3 flex items-center gap-3">
                <TopicProgressRing pct={pct} color={topic.color} size={40} strokeWidth={4} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: topic.color }}>
                    {topic.icon} {topic.name}
                  </div>
                  <div className="text-xs text-text-muted font-mono">{solved} / {list.length}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(ACHMAP).map(([id, a]) => (
            <AchievementCard key={id} achievement={a} unlocked={unlocked.includes(id)} />
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, sub, accent = 'text-text' }) {
  return (
    <div className="bg-bg-card border border-border-soft rounded-xl p-5">
      <div className="text-xs text-text-subtle uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-3xl font-bold font-mono ${accent}`}>{value}</div>
      {sub && <div className="text-xs text-text-muted mt-1">{sub}</div>}
    </div>
  )
}

function DiffBar({ label, solved, total, color }) {
  const pct = total ? (solved / total) * 100 : 0
  const palette = {
    easy:   { text: 'text-easy',   bg: 'bg-easy'   },
    medium: { text: 'text-medium', bg: 'bg-medium' },
    hard:   { text: 'text-hard',   bg: 'bg-hard'   },
  }[color]
  return (
    <div className="bg-bg-card border border-border-soft rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold uppercase tracking-wider ${palette.text}`}>{label}</span>
        <span className="text-xs font-mono text-text-muted">{solved} / {total}</span>
      </div>
      <div className="h-2 bg-bg rounded-full overflow-hidden">
        <div className={`h-full ${palette.bg} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}