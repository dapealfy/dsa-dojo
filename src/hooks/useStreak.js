import { useEffect, useState, useCallback } from 'react'
import { fetchActivity, recordActivity, computeCurrentStreak, computeLongestStreak, hasSolvedToday } from '../lib/streak'

export function useStreak(handle) {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!handle) { setLoading(false); return }
    setLoading(true)
    fetchActivity(handle).then(rows => {
      setActivity(rows)
      setLoading(false)
    })
  }, [handle])

  const addSolve = useCallback(async (xpEarned = 0) => {
    if (!handle) return null
    const updated = await recordActivity(handle, xpEarned)
    setActivity(prev => {
      const idx = prev.findIndex(a => a.activity_date === updated.activity_date)
      if (idx >= 0) {
        const next = [...prev]; next[idx] = updated; return next
      }
      return [updated, ...prev]
    })
    return updated
  }, [handle])

  return {
    activity,
    loading,
    currentStreak: computeCurrentStreak(activity),
    longestStreak: computeLongestStreak(activity),
    solvedToday: hasSolvedToday(activity),
    addSolve,
  }
}