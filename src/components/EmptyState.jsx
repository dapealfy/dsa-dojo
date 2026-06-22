export default function EmptyState({ icon = '🗿', title, description, action }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-xl font-semibold text-text mb-2">{title}</h3>
      {description && <p className="text-text-muted max-w-md mx-auto mb-6">{description}</p>}
      {action}
    </div>
  )
}