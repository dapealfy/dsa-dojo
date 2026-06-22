import { useState, useEffect } from 'react'

export default function HandleModal({ onSave }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
  }, [input])

  const submit = (e) => {
    e?.preventDefault()
    const clean = input.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24)
    if (!clean) { setError('Pick a handle — letters, numbers, _ or -'); return }
    onSave(clean)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/90 backdrop-blur-sm">
      <div className="bg-bg-card border border-border rounded-2xl max-w-md w-full p-8 shadow-2xl animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">⚡</div>
          <h1 className="text-2xl font-bold mb-2">Welcome to Algodeck</h1>
          <p className="text-text-muted text-sm">
            Pick a handle. Your progress syncs to the cloud under this name — no password, just remember it.
          </p>
        </div>
        <form onSubmit={submit}>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Your handle
          </label>
          <div className="flex items-center bg-bg border border-border rounded-lg focus-within:border-accent transition-colors">
            <span className="text-text-muted px-3 font-mono">@</span>
            <input
              autoFocus
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ranger42"
              maxLength={24}
              className="flex-1 bg-transparent outline-none py-2.5 font-mono"
            />
          </div>
          {error && <div className="text-hard text-xs mt-2">{error}</div>}
          <button
            type="submit"
            className="w-full mt-4 bg-accent hover:bg-accent-soft text-bg font-bold py-2.5 rounded-lg transition-colors"
          >
            Start grinding →
          </button>
          <p className="text-xs text-text-subtle text-center mt-3">
            You can change this anytime from the profile page.
          </p>
        </form>
      </div>
    </div>
  )
}