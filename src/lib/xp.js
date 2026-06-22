const BASE_XP = { Easy: 10, Medium: 25, Hard: 50 }

export function calculateXp(problem, attempts = 1, solutionClicks = 0) {
  const base = BASE_XP[problem.difficulty] ?? 10
  let xp = base
  if (attempts === 1) xp = Math.floor(xp * 1.2)   // 20% first-try bonus
  xp -= solutionClicks * 5                         // −5 per solution click used
  return Math.max(xp, 1)
}

export function levelFromXp(totalXp) {
  return Math.floor(totalXp / 100) + 1
}

export function xpProgressInLevel(totalXp) {
  const level = levelFromXp(totalXp)
  const xpIntoLevel = totalXp - (level - 1) * 100
  return { level, xpIntoLevel, xpForNextLevel: 100, pct: xpIntoLevel }
}