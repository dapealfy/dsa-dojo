import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseEnabled } from '../lib/supabase'

const LS_KEY = 'algodeck:v1:progress'

function readLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function writeLS(map) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(map)) } catch {}
}

export function useProgress(handle) {
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)
  const [online, setOnline] = useState(isSupabaseEnabled() && !!handle)

  useEffect(() => {
    if (!handle) { setLoading(false); return }
    setLoading(true)

    // Always seed from localStorage first for instant render
    setProgress(readLS())

    if (!isSupabaseEnabled()) { setLoading(false); return }

    supabase.from('progress')
      .select('*')
      .eq('handle', handle)
      .then(({ data, error }) => {
        if (error) { console.error('useProgress load', error); setLoading(false); return }
        const map = {}
        for (const row of data || []) map[row.problem_id] = row
        setProgress(map)
        writeLS(map)
        setLoading(false)
      })
  }, [handle])

  const upsert = useCallback(async (problemId, patch) => {
    if (!handle) return null
    setProgress(prev => {
      const next = {
        ...prev,
        [problemId]: {
          ...prev[problemId],
          problem_id: problemId,
          handle,
          updated_at: new Date().toISOString(),
          ...patch,
        },
      }
      writeLS(next)
      return next
    })

    if (!isSupabaseEnabled()) return null
    const { data, error } = await supabase.from('progress').upsert(
      { handle, problem_id: problemId, updated_at: new Date().toISOString(), ...patch },
      { onConflict: 'handle,problem_id' }
    ).select().maybeSingle()
    if (error) console.error('useProgress upsert', error)
    return data
  }, [handle])

  const getStatus = useCallback((problemId) => {
    return progress[problemId]?.status || 'unsolved'
  }, [progress])

  return { progress, loading, online, upsert, getStatus }
}