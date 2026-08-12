import { useEffect, useState, useCallback } from 'react'

// Renders motivational messages dispatched via utils/toast. Stacks up to a few
// at once and auto-dismisses each.
export default function Toaster() {
  const [items, setItems] = useState([])

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    let counter = 0
    const onToast = (e) => {
      const id = `${Date.now()}_${counter++}`
      const item = { id, ...e.detail }
      setItems((prev) => [...prev.slice(-3), item])
      window.setTimeout(() => remove(id), item.duration)
    }
    window.addEventListener('dt-toast', onToast)
    return () => window.removeEventListener('dt-toast', onToast)
  }, [remove])

  const toneClass = (tone) => {
    switch (tone) {
      case 'project':
        return 'border-project-400/50 bg-project-600 text-white'
      case 'success':
        return 'border-emerald-400/50 bg-emerald-600 text-white'
      default:
        return 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-3 sm:top-5">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          onClick={() => remove(t.id)}
          className={`pointer-events-auto flex max-w-md animate-slide-up cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${toneClass(
            t.tone
          )}`}
        >
          {t.emoji && <span className="text-xl">{t.emoji}</span>}
          <span className="text-sm font-semibold leading-snug">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
