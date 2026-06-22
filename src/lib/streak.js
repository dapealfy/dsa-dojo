import { supabase, isSupabaseEnabled } from './supabase'

export async function fetchActivity(handle, sinceDays = 365) {
  if (!isSupabaseEnabled() || !handle) return []
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('activity')
    .select('*')
    .eq('handle', handle)
    .gte('activity_date', since)
    .order('activity_date', { ascending: false })
  if (error) { console.error('fetchActivity', error); return [] }
  return data || []
}

export async function recordActivity(handle, xpEarned = 0) {
  if (!isSupabaseEnabled() || !handle) return null
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('activity')
    .select('*')
    .eq('handle', handle)
    .eq('activity_date', today)
    .maybeSingle()
  if (error) { console.error('recordActivity select', error); return null }

  if (data) {
    const { error: upErr } = await supabase
      .from('activity')
      .update({
        problems_solved: data.problems_solved + 1,
        xp_earned: data.xp_earned + xpEarned,
      })
      .eq('id', data.id)
    if (upErr) console.error('recordActivity update', upErr)
    return { ...data, problems_solved: data.problems_solved + 1 }
  } else {
    const { error: insErr } = await supabase
      .from('activity')
      .insert({ handle, activity_date: today, problems_solved: 1, xp_earned: xpEarned })
    if (insErr) console.error('recordActivity insert', insErr)
    return { handle, activity_date: today, problems_solved: 1, xp_earned: xpEarned }
  }
}

export function computeCurrentStreak(activity) {
  if (!activity?.length) return 0
  const sorted = [...activity].sort((a, b) =>
    b.activity_date.localeCompare(a.activity_date)
  )
  let streak = 0
  let cursor = new Date()
  cursor.setUTCHours(0, 0, 0, 0)

  for (let i = 0; i < sorted.length; i++) {
    const dateStr = cursor.toISOString().slice(0, 10)
    if (sorted[i].activity_date === dateStr && sorted[i].problems_solved > 0) {
      streak++
      cursor.setUTCDate(cursor.getUTCDate() - 1)
    } else if (i === 0 && sorted[0].activity_date < dateStr) {
      // No activity today — streak is still alive if yesterday was active
      cursor.setUTCDate(cursor.getUTCDate() - 1)
      i--
      if (i > 30) break
    } else {
      break
    }
  }
  return streak
}

export function computeLongestStreak(activity) {
  if (!activity?.length) return 0
  const dates = [...new Set(activity.filter(a => a.problems_solved > 0).map(a => a.activity_date))].sort()
  let longest = 1, current = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const cur = new Date(dates[i])
    const diff = Math.round((cur - prev) / 86400000)
    if (diff === 1) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }
  return longest
}

export function hasSolvedToday(activity) {
  const today = new Date().toISOString().slice(0, 10)
  return activity?.some(a => a.activity_date === today && a.problems_solved > 0) ?? false
}