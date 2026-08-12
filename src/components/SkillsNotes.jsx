import { useApp } from '../context/AppContext'
import { toast } from '../utils/toast'
import { Star, Book } from './Icons'

export default function SkillsNotes({ dateKey }) {
  const { getDay, updateDay, skillStreak } = useApp()
  const record = getDay(dateKey)

  const focusScore = record.focusScore || 0
  const hadSkill = Boolean(record.skill?.trim())

  const setFocus = (n) => updateDay(dateKey, { focusScore: n === focusScore ? 0 : n })

  const setSkill = (val) => {
    const wasEmpty = !record.skill?.trim()
    updateDay(dateKey, { skill: val })
    if (wasEmpty && val.trim().length > 2) {
      toast('New skill logged — compounding knowledge! 🧠', {
        emoji: '📚',
        tone: 'success',
      })
    }
  }

  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="section-title">
          <span aria-hidden>🧠</span> Skills, Focus & Notes
        </h2>
        {skillStreak > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-500/20 dark:text-rose-300">
            <Book className="h-3.5 w-3.5" /> {skillStreak}-day skill streak
          </span>
        )}
      </div>

      {/* New skill */}
      <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
        New skill learned today
      </label>
      <input
        value={record.skill || ''}
        onChange={(e) => setSkill(e.target.value)}
        placeholder="e.g. React portals, useReducer, CSS grid…"
        className="input mb-4"
      />

      {/* Focus score */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Focus score
        </span>
        <span className="text-xs text-slate-400">{focusScore ? `${focusScore}/5` : 'not set'}</span>
      </div>
      <div className="mb-4 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setFocus(n)}
            aria-label={`Focus score ${n}`}
            className={`text-2xl transition-transform hover:scale-110 active:scale-90 ${
              n <= focusScore ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'
            }`}
          >
            <Star className="h-7 w-7" fill={n <= focusScore ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>

      {/* Notes */}
      <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
        Daily notes / reflection
      </label>
      <textarea
        value={record.notes || ''}
        onChange={(e) => updateDay(dateKey, { notes: e.target.value })}
        placeholder="How did today go? What did you learn? What will you improve?"
        rows={3}
        className="input resize-none"
      />
    </section>
  )
}
