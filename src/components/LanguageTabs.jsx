import { LANG_KEYS, LANG_MAP } from '../lib/piston'

export default function LanguageTabs({ active, onChange, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5'
  return (
    <div className="flex flex-wrap gap-1 bg-bg-soft border border-border-soft rounded-lg p-1">
      {LANG_KEYS.map(key => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`${sizeClass} rounded-md font-mono font-medium transition-all ${
            active === key
              ? 'bg-bg-hover text-accent shadow-sm'
              : 'text-text-muted hover:text-text'
          }`}
        >
          {LANG_MAP[key].label}
        </button>
      ))}
    </div>
  )
}