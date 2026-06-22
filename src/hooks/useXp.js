import { useMemo } from 'react'

export function useXp(progress) {
  return useMemo(() => {
    return Object.values(progress).reduce((sum, p) => sum + (p.xp_earned || 0), 0)
  }, [progress])
}