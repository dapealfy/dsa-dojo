import { PROBLEMS_BY_ID } from '../data/problems-index'

const HISTORY_KEY = 'algodeck:v1:daily-history'

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}
function setHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-30))) } catch {}
}

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

export function pickDailyChallenge() {
  const today = dayKey()
  const history = getHistory()
  const cached = history.find(h => h.date === today)
  if (cached) return PROBLEMS_BY_ID[cached.problemId]

  // Pick weighted by user's unsolved + medium difficulty
  const solvedIds = new Set(history.flatMap(h => h.solvedIds || []))
  const candidates = Object.values(PROBLEMS_BY_ID).filter(p =>
    !solvedIds.has(p.id) && p.difficulty === 'Medium'
  )
  const fallback = candidates.length
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : Object.values(PROBLEMS_BY_ID)[Math.floor(Math.random() * Object.keys(PROBLEMS_BY_ID).length)]

  setHistory([...history, { date: today, problemId: fallback.id, solvedIds: [...solvedIds] }])
  return fallback
}

export function markDailySolved(problemId) {
  const today = dayKey()
  const history = getHistory()
  const idx = history.findIndex(h => h.date === today)
  if (idx >= 0) {
    history[idx].solvedIds = [...new Set([...(history[idx].solvedIds || []), problemId])]
  } else {
    history.push({ date: today, problemId, solvedIds: [problemId] })
  }
  setHistory(history)
}