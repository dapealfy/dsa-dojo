import { useEffect } from 'react'

export default function XpToast({ amount, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed top-20 right-8 z-50 pointer-events-none">
      <div className="xp-toast bg-accent text-bg font-bold text-lg px-4 py-2 rounded-lg shadow-lg shadow-accent/40">
        +{amount} XP
      </div>
    </div>
  )
}