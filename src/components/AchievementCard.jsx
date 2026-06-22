export default function AchievementCard({ achievement, unlocked }) {
  return (
    <div
      className={`rounded-lg p-4 border transition-all ${
        unlocked
          ? 'bg-bg-card border-accent/40 shadow-lg shadow-accent/5'
          : 'bg-bg-soft border-border-soft opacity-50 grayscale'
      }`}
    >
      <div className="text-3xl mb-2">{achievement.icon}</div>
      <div className={`font-semibold text-sm ${unlocked ? 'text-accent' : 'text-text-muted'}`}>
        {achievement.label}
      </div>
      <div className="text-xs text-text-subtle mt-1">{achievement.desc}</div>
    </div>
  )
}