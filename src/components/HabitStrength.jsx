import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { lastNDays } from '../utils/dates'

const WINDOW = 21 // days of history the strength meter considers

// Each habit maps to one or more schedule block ids; a day "counts" if all of
// its blocks were completed that day.
const HABITS = [
  { key: 'project', label: 'Personal Project', emoji: '🚀', blocks: ['project'], accent: 'from-project-500 to-project-400' },
  { key: 'company', label: 'Company Deep Work', emoji: '💼', blocks: ['company1', 'company2'], accent: 'from-sky-500 to-sky-400' },
  { key: 'gym', label: 'Gym', emoji: '🏋️', blocks: ['gym'], accent: 'from-emerald-500 to-emerald-400' },
  { key: 'reading', label: 'Reading', emoji: '📚', blocks: ['reading'], accent: 'from-rose-500 to-rose-400' },
  { key: 'morning', label: 'Morning Routine', emoji: '🧘', blocks: ['wake'], accent: 'from-violet-500 to-violet-400' },
]

function strengthLabel(pct) {
  if (pct >= 90) return { text: 'Locked in', color: 'text-emerald-600 dark:text-emerald-400' }
  if (pct >= 70) return { text: 'Strong', color: 'text-project-600 dark:text-project-300' }
  if (pct >= 45) return { text: 'Building', color: 'text-amber-600 dark:text-amber-400' }
  if (pct >= 20) return { text: 'Forming', color: 'text-orange-600 dark:text-orange-400' }
  return { text: 'Seedling', color: 'text-slate-400' }
}

export default function HabitStrength() {
  const { days } = useApp()

  const rows = useMemo(() => {
    const window = lastNDays(WINDOW)
    return HABITS.map((h) => {
      const hits = window.reduce((n, key) => {
        const rec = days[key]
        if (!rec) return n
        const all = h.blocks.every((b) => rec.blocks?.[b])
        return n + (all ? 1 : 0)
      }, 0)
      const pct = Math.round((hits / WINDOW) * 100)
      return { ...h, hits, pct, strength: strengthLabel(pct) }
    })
  }, [days])

  return (
    <section className="card p-4 sm:p-5">
      <h2 className="section-title mb-1">
        <span aria-hidden>💪</span> Habit Strength
      </h2>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Based on your last {WINDOW} days of consistency.
      </p>
      <div className="space-y-3.5">
        {rows.map((h) => (
          <div key={h.key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                <span aria-hidden>{h.emoji}</span> {h.label}
              </span>
              <span className={`text-xs font-bold ${h.strength.color}`}>
                {h.strength.text} · {h.pct}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${h.accent} transition-all duration-700`}
                style={{ width: `${Math.max(4, h.pct)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
