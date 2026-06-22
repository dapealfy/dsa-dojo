import { useEffect, useState, useCallback } from 'react'

const KEY = 'algodeck:v1:solution-clicks'

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
function writeAll(obj) {
  try { localStorage.setItem(KEY, JSON.stringify(obj)) } catch {}
}

export function useSolutionClicks(problemId) {
  const [all, setAll] = useState(() => readAll())

  useEffect(() => {
    const handler = (e) => { if (e.key === KEY) setAll(readAll()) }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const clicks = all[problemId] || 0

  const bump = useCallback(() => {
    setAll(prev => {
      const next = { ...prev, [problemId]: (prev[problemId] || 0) + 1 }
      writeAll(next)
      return next
    })
  }, [problemId])

  const reset = useCallback(() => {
    setAll(prev => {
      const next = { ...prev, [problemId]: 0 }
      writeAll(next)
      return next
    })
  }, [problemId])

  return { clicks, bump, reset }
}