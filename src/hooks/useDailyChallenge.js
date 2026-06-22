import { useEffect, useState, useCallback } from 'react'
import { pickDailyChallenge, markDailySolved } from '../lib/daily'

export function useDailyChallenge() {
  const [problem, setProblem] = useState(() => pickDailyChallenge())
  useEffect(() => { setProblem(pickDailyChallenge()) }, [])
  const markSolved = useCallback((id) => markDailySolved(id), [])
  return { problem, markSolved }
}