import { Link } from 'react-router-dom'
import { useHandle } from '../hooks/useHandle'
import { useProgress } from '../hooks/useProgress'
import { useXp } from '../hooks/useXp'
import { useStreak } from '../hooks/useStreak'
import { useDailyChallenge } from '../hooks/useDailyChallenge'
import { useAchievements } from '../hooks/useAchievements'
import { TOPICS } from '../data/topics'
import { PROBLEMS_BY_TOPIC, TOTAL_PROBLEMS } from '../data/problems-index'
import TopicTile from '../components/TopicTile'
import DifficultyBadge from '../components/DifficultyBadge'
import XpBar from '../components/XpBar'
import StreakBadge from '../components/StreakBadge'
import StatusDot from '../components/StatusDot'

export default function Home() {
  const { handle } = useHandle()
  const { progress, getStatus } = useProgress(handle)
  const totalXp = useXp(progress)
  const { currentStreak, longestStreak, solvedToday } = useStreak(handle)
  const { problem: daily } = useDailyChallenge()
  const { unlocked, check } = useAchievements(handle, {})

  const solvedCount = Object.values(progress).filter(p => p.status === 'solved').length
  const overallPct = TOTAL_PROBLEMS ? (solvedCount / TOTAL_PROBLEMS) * 100 : 0

  // Derive stats for achievement checking
  const stats = {
    totalSolved: solvedCount,
    easySolved: Object.values(progress).filter(p => p.status === 'solved' && p.difficulty === 'Easy').length,
    mediumSolved: Object.values(progress).filter(p => p.status === 'solved' && p.difficulty === 'Medium').length,
    hardSolved: Object.values(progress).filter(p => p.status === 'solved' && p.difficulty === 'Hard').length,
    currentStreak, longestStreak,
    maxTopicSolved: Math.max(0, ...Object.values(PROBLEMS_BY_TOPIC).map(arr =>
      arr.filter(p => progress[p.id]?.status === 'solved').length)),
    minTopicTotal: Math.min(...Object.values(PROBLEMS_BY_TOPIC).map(arr => arr.length)),
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-bg-card via-bg-soft to-bg-card border border-border-soft p-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,#7ee787,transparent_50%)]" />
        <div className="relative space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Level up your <span className="text-accent">DSA</span>.
          </h1>
          <p className="text-text-muted text-lg max-w-2xl">
            150+ curated problems. Multi-language code execution. Real progress, real streaks, no login walls.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-bg/60 border border-border-soft rounded-lg p-3">
              <div className="text-xs text-text-subtle uppercase tracking-wider mb-1">Total XP</div>
              <div className="text-2xl font-bold font-mono text-accent">{totalXp}</div>
            </div>
            <div className="bg-bg/60 border border-border-soft rounded-lg p-3">
              <div className="text-xs text-text-subtle uppercase tracking-wider mb-1">Solved</div>
              <div className="text-2xl font-bold font-mono">{solvedCount}<span className="text-text-subtle text-base">/{TOTAL_PROBLEMS}</span></div>
            </div>
            <div className="bg-bg/60 border border-border-soft rounded-lg p-3">
              <div className="text-xs text-text-subtle uppercase tracking-wider mb-1">Streak</div>
              <div className="text-2xl font-bold font-mono text-medium">🔥 {currentStreak}</div>
            </div>
            <div className="bg-bg/60 border border-border-soft rounded-lg p-3">
              <div className="text-xs text-text-subtle uppercase tracking-wider mb-1">Achievements</div>
              <div className="text-2xl font-bold font-mono text-purple">{unlocked.length}<span className="text-text-subtle text-base">/8</span></div>
            </div>
          </div>
          <div className="max-w-md pt-2">
            <XpBar totalXp={totalXp} />
          </div>
        </div>
      </section>

      {/* Daily challenge */}
      {daily && (
        <section>
          <Link
            to={`/problems/${daily.id}`}
            className="block bg-gradient-to-r from-accent/10 to-purple/10 border border-accent/30 rounded-2xl p-6 card-lift"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-accent mb-1 font-semibold">
                  ⚡ Daily Challenge
                </div>
                <h2 className="text-2xl font-bold mb-2">{daily.title}</h2>
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={daily.difficulty} size="sm" />
                  <span className="text-text-muted text-sm">{daily.topic}</span>
                  {solvedToday && <span className="text-easy text-sm font-mono">✓ completed today</span>}
                </div>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </Link>
        </section>
      )}

      {/* Topic grid */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Topics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {TOPICS.map(topic => {
            const list = PROBLEMS_BY_TOPIC[topic.key] || []
            const solved = list.filter(p => progress[p.id]?.status === 'solved').length
            const pct = list.length ? (solved / list.length) * 100 : 0
            return (
              <TopicTile
                key={topic.key}
                topic={topic}
                solved={solved}
                total={list.length}
                pct={pct}
              />
            )
          })}
        </div>
      </section>

      {/* Overall progress hint */}
      <section className="bg-bg-card border border-border-soft rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold">Overall progress</h3>
          <span className="text-sm text-text-muted font-mono">
            {solvedCount} / {TOTAL_PROBLEMS} · {Math.round(overallPct)}%
          </span>
        </div>
        <div className="h-3 bg-bg rounded-full overflow-hidden border border-border-soft">
          <div
            className="h-full bg-gradient-to-r from-accent via-purple to-medium transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <p className="text-xs text-text-subtle mt-3">
          Solve consistently, hit streaks, unlock all 8 achievements. Every solution click costs XP — try first!
        </p>
      </section>
    </div>
  )
}