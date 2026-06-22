import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useHandle } from '../hooks/useHandle'
import { useProgress } from '../hooks/useProgress'
import { useStreak } from '../hooks/useStreak'
import { useAchievements } from '../hooks/useAchievements'
import { useSolutionClicks } from '../hooks/useSolutionClicks'
import { useDailyChallenge } from '../hooks/useDailyChallenge'
import { PROBLEMS_BY_ID, statsByDifficulty, TOTAL_PROBLEMS } from '../data/problems-index'
import { TOPICS_BY_KEY } from '../data/topics'
import { calculateXp } from '../lib/xp'
import CodeEditor from '../components/CodeEditor'
import LanguageTabs from '../components/LanguageTabs'
import TestRunner from '../components/TestRunner'
import SolutionModal from '../components/SolutionModal'
import DifficultyBadge from '../components/DifficultyBadge'
import StatusDot from '../components/StatusDot'
import XpToast from '../components/XpToast'
import ConfettiBurst from '../components/ConfettiBurst'
import Markdown from '../components/Markdown'

export default function ProblemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { handle } = useHandle()
  const { progress, upsert, getStatus } = useProgress(handle)
  const { addSolve, solvedToday } = useStreak(handle)
  const { unlocked, check } = useAchievements(handle)
  const { clicks, bump: bumpClicks, reset: resetClicks } = useSolutionClicks(id)
  const { markSolved } = useDailyChallenge()

  const problem = PROBLEMS_BY_ID[id]
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(problem?.starterCode?.javascript || '')
  const [showSolution, setShowSolution] = useState(false)
  const [xpToast, setXpToast] = useState(null)
  const [confettiFire, setConfettiFire] = useState(false)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode[language] || '')
      setAttempts(progress[problem.id]?.attempts || 0)
    }
  }, [problem?.id, language])

  if (!problem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Problem not found</h1>
        <Link to="/problems" className="text-accent hover:underline">← Back to all problems</Link>
      </div>
    )
  }

  const topic = TOPICS_BY_KEY[problem.topic]
  const status = getStatus(problem.id)

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setCode(problem.starterCode[lang] || '')
  }

  const onSolve = async () => {
    setAttempts(a => a + 1)
    const xp = calculateXp(problem, attempts + 1, clicks)
    await upsert(problem.id, {
      status: 'solved',
      attempts: attempts + 1,
      solution_clicks: clicks,
      xp_earned: xp,
      language,
      solved_at: new Date().toISOString(),
    })
    await addSolve(xp)
    markSolved(problem.id)
    setXpToast(xp)
    if (!solvedToday) setConfettiFire(true)
    // Achievement check
    const newSolved = Object.values(progress).filter(p => p.status === 'solved' || p.id === problem.id).length
    check({
      totalSolved: newSolved,
      easySolved: Object.values(progress).filter(p => p.status === 'solved' && p.difficulty === 'Easy').length + (problem.difficulty === 'Easy' ? 1 : 0),
      mediumSolved: Object.values(progress).filter(p => p.status === 'solved' && p.difficulty === 'Medium').length + (problem.difficulty === 'Medium' ? 1 : 0),
      hardSolved: Object.values(progress).filter(p => p.status === 'solved' && p.difficulty === 'Hard').length + (problem.difficulty === 'Hard' ? 1 : 0),
      currentStreak: 0, longestStreak: 0,
      maxTopicSolved: 1, minTopicTotal: 1,
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 text-sm">
        <Link to="/problems" className="text-text-muted hover:text-accent">← All problems</Link>
        <span className="text-text-subtle">·</span>
        <span className="text-text-subtle font-mono">#{problem.number}</span>
        <StatusDot status={status} />
        <span className="text-text-subtle capitalize">{status}</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold">{problem.title}</h1>
        <DifficultyBadge difficulty={problem.difficulty} />
        {topic && (
          <span className="text-sm" style={{ color: topic.color }}>
            {topic.icon} {topic.name}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Description */}
        <div className="space-y-4">
          <div className="bg-bg-card border border-border-soft rounded-xl p-5">
            <Markdown>{problem.description}</Markdown>
          </div>

          {problem.examples?.length > 0 && (
            <div className="bg-bg-card border border-border-soft rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-text-muted">Examples</h3>
              {problem.examples.map((ex, i) => (
                <div key={i} className="border-l-2 border-accent/40 pl-3">
                  <div className="text-xs font-mono text-text-subtle mb-1">Example {i + 1}</div>
                  <div className="text-sm font-mono space-y-1">
                    <div><span className="text-purple">Input:</span> {ex.input}</div>
                    <div><span className="text-accent">Output:</span> {ex.output}</div>
                    {ex.explanation && (
                      <div className="text-text-muted text-xs mt-1">💡 {ex.explanation}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {problem.constraints?.length > 0 && (
            <div className="bg-bg-card border border-border-soft rounded-xl p-5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-text-muted mb-2">Constraints</h3>
              <ul className="text-sm font-mono text-text-muted space-y-1 list-disc list-inside">
                {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Right: Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <LanguageTabs active={language} onChange={handleLanguageChange} />
            <a
              href={problem.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-subtle hover:text-accent"
            >
              ↗ LeetCode
            </a>
          </div>

          <CodeEditor
            language={language}
            value={code}
            onChange={setCode}
          />

          <TestRunner problem={problem} language={language} code={code} />

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setShowSolution(true)}
              className="text-text-subtle hover:text-medium text-sm transition-colors"
            >
              I'm stuck →
            </button>
            {clicks > 0 && (
              <span className="text-xs text-text-subtle font-mono">
                Solution clicks used: {clicks}/3
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modal — only mount when the user opts in via "I'm stuck" */}
      {showSolution && (
        <SolutionModal
          problem={problem}
          clicks={clicks}
          onAdvance={bumpClicks}
          onClose={() => setShowSolution(false)}
        />
      )}

      <XpToast amount={xpToast} onDone={() => setXpToast(null)} />
      <ConfettiBurst fire={confettiFire} />
    </div>
  )
}