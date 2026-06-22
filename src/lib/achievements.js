export const ACHIEVEMENTS = {
  'first-solve':    { label: 'First Steps',      icon: '👣', desc: 'Solve your first problem' },
  'ten-easy':       { label: 'Easy Street',      icon: '🛣️', desc: 'Solve 10 easy problems' },
  'first-medium':   { label: 'Medium Rare',      icon: '🥩', desc: 'Solve your first medium problem' },
  'first-hard':     { label: 'Hard Boiled',      icon: '🍳', desc: 'Solve your first hard problem' },
  'streak-3':       { label: 'Three in a Row',   icon: '🔥', desc: 'Hit a 3-day streak' },
  'streak-7':       { label: 'Week Warrior',     icon: '⚔️', desc: 'Hit a 7-day streak' },
  'topic-master':   { label: 'Topic Tactician',  icon: '🎯', desc: 'Solve all problems in one topic' },
  'completionist':  { label: 'Completionist',    icon: '🏆', desc: 'Solve 150 problems' },
}

export function evaluateAchievements(stats) {
  const unlocked = new Set(stats.alreadyUnlocked || [])
  for (const [id] of Object.entries(ACHIEVEMENTS)) {
    if (unlocked.has(id)) continue
    if (matchesCondition(id, stats)) unlocked.add(id)
  }
  return [...unlocked]
}

function matchesCondition(id, s) {
  switch (id) {
    case 'first-solve':   return s.totalSolved >= 1
    case 'ten-easy':      return s.easySolved >= 10
    case 'first-medium':  return s.mediumSolved >= 1
    case 'first-hard':    return s.hardSolved >= 1
    case 'streak-3':      return s.longestStreak >= 3
    case 'streak-7':      return s.longestStreak >= 7
    case 'topic-master':  return s.maxTopicSolved >= s.minTopicTotal && s.maxTopicSolved > 0
    case 'completionist': return s.totalSolved >= 150
    default: return false
  }
}