import { useEffect, useState } from 'react'
import Markdown from './Markdown'

const STAGES = ['reframe', 'approach', 'revealed']

const STAGE_COPY = {
  reframe: {
    title: 'Need a reframe?',
    body: (p) => p.hints?.[0] || 'Take a breath. Read the problem again slowly. What is it actually asking for?',
    button: 'I need more help',
    icon: '💭',
  },
  approach: {
    title: 'Approach',
    body: (p) => p.approaches?.[0]?.summary || 'Think about the data structure that gives you the lookup you need.',
    button: 'Just show me the solution',
    icon: '🧭',
  },
  revealed: {
    title: 'Full solution',
    body: (p) => `${p.complexity?.time || ''} time · ${p.complexity?.space || ''} space`,
    button: null,
    icon: '✨',
  },
}

function deriveStage(clicks) {
  if (clicks >= 2) return 'revealed'
  if (clicks >= 1) return 'approach'
  return 'reframe'
}

export default function SolutionModal({ problem, clicks, onAdvance, onClose }) {
  // Initial stage from clicks AT MOUNT — fixes the "clicks=0 → early return" bug
  const [stage, setStage] = useState(() => deriveStage(clicks))

  // Esc closes the modal
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const idx = STAGES.indexOf(stage)
  const copy = STAGE_COPY[stage]
  const nextStage = STAGES[idx + 1]

  const advance = () => {
    if (stage === 'revealed') return
    onAdvance()
    setStage(nextStage)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{copy.icon}</span>
            <div>
              <h2 className="text-lg font-bold">{copy.title}</h2>
              <div className="text-xs text-text-muted font-mono">
                Click {idx + 1} / 3 · {problem.title}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text text-2xl leading-none w-8 h-8 rounded hover:bg-bg-soft"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Progress dots */}
        <div className="px-6 pt-3 flex gap-2">
          {STAGES.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${
                i < idx ? 'bg-accent' : i === idx ? 'bg-accent animate-pulse-glow' : 'bg-bg-soft'
              }`}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {stage !== 'revealed' && (
            <div className="bg-bg-soft border border-border-soft rounded-lg p-4">
              <Markdown>{copy.body(problem)}</Markdown>
            </div>
          )}

          {stage === 'revealed' && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm font-mono text-text-muted">
                  {problem.complexity?.time} · {problem.complexity?.space}
                </div>
              </div>
              <pre className="bg-bg border border-border-soft rounded-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                <code className="text-text">{problem.solutions?.javascript || '// solution coming'}</code>
              </pre>
              <details className="bg-bg-soft border border-border-soft rounded-lg">
                <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-text-muted hover:text-text">
                  Show in other languages
                </summary>
                <div className="px-4 pb-3 space-y-2">
                  {Object.entries(problem.solutions || {}).filter(([k]) => k !== 'javascript').map(([lang, code]) => (
                    <details key={lang}>
                      <summary className="cursor-pointer text-xs font-mono text-text-muted hover:text-accent py-1">
                        {lang}
                      </summary>
                      <pre className="bg-bg border border-border-soft rounded p-3 overflow-x-auto text-xs font-mono">
                        <code>{code}</code>
                      </pre>
                    </details>
                  ))}
                </div>
              </details>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border-soft flex justify-between items-center bg-bg-soft">
          <div className="text-xs text-text-subtle">
            {stage === 'revealed'
              ? 'Reading the solution costs you XP. Reset by closing.'
              : 'No judgment — but each click costs XP.'}
          </div>
          {copy.button && (
            <button
              onClick={advance}
              className="bg-medium hover:bg-medium/90 text-bg font-bold px-5 py-2 rounded-lg transition-colors"
            >
              {copy.button} →
            </button>
          )}
          {stage === 'revealed' && (
            <button
              onClick={onClose}
              className="bg-accent hover:bg-accent-soft text-bg font-bold px-5 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}