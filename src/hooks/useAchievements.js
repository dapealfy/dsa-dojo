import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseEnabled } from '../lib/supabase'
import { ACHIEVEMENTS, evaluateAchievements } from '../lib/achievements'

const LS_KEY = 'algodeck:v1:achievements'

function readLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function writeLS(arr) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(arr)) } catch {}
}

export function useAchievements(handle, stats) {
  const [unlocked, setUnlocked] = useState(() => readLS())
  const [newlyUnlocked, setNewlyUnlocked] = useState(null)

  useEffect(() => {
    if (!handle) return
    if (!isSupabaseEnabled()) return
    supabase.from('achievements').select('achievement_id').eq('handle', handle)
      .then(({ data, error }) => {
        if (error) { console.error('useAchievements load', error); return }
        const ids = (data || []).map(r => r.achievement_id)
        setUnlocked(ids)
        writeLS(ids)
      })
  }, [handle])

  const check = useCallback(async (currentStats) => {
    const previous = new Set(unlocked)
    const next = evaluateAchievements({ ...currentStats, alreadyUnlocked: unlocked })
    const fresh = next.filter(id => !previous.has(id))
    if (fresh.length === 0) return []

    setUnlocked(next)
    writeLS(next)

    if (isSupabaseEnabled() && handle) {
      const rows = fresh.map(achievement_id => ({ handle, achievement_id }))
      const { error } = await supabase.from('achievements').upsert(rows, { onConflict: 'handle,achievement_id' })
      if (error) console.error('useAchievements upsert', error)
    }

    if (fresh.length > 0) {
      setNewlyUnlocked(fresh[0])
      setTimeout(() => setNewlyUnlocked(null), 5000)
    }
    return fresh
  }, [handle, unlocked])

  return { unlocked, newlyUnlocked, check, ACHIEVEMENTS }
}