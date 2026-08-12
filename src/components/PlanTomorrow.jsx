import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { addDays, todayKey, prettyDate } from '../utils/dates'
import { toast } from '../utils/toast'
import { Plus, Trash, Rocket, Clock, Check } from './Icons'

const PRINCIPLES = [
  'Question every task — is it even necessary?',
  'Delete before you optimize.',
  'Time-box everything. No time = it won’t happen.',
  'Attack the highest-leverage work first.',
  'Hardest thing while your energy is highest.',
]

let idSeed = 0
function newId() {
  idSeed += 1
  return `t_${Date.now()}_${idSeed}`
}

// Editor for TOMORROW's time-boxed task list. Elon-style: ruthless, boxed,
// leverage-first.
export default function PlanTomorrow() {
  const { getDay, setPlan } = useApp()
  const tomorrowKey = addDays(todayKey(), 1)
  const plan = getDay(tomorrowKey).plan || []
  const [text, setText] = useState('')
  const [mins, setMins] = useState('')

  const addTask = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const next = [
      ...plan,
      { id: newId(), text: text.trim(), mins: Number(mins) || 0, done: false },
    ]
    setPlan(tomorrowKey, next)
    setText('')
    setMins('')
    if (next.length === 1) {
      toast('Tomorrow is now a plan, not a wish. 🚀', { emoji: '🗺️', tone: 'project' })
    }
  }

  const removeTask = (id) =>
    setPlan(tomorrowKey, plan.filter((t) => t.id !== id))

  const totalMins = plan.reduce((n, t) => n + (t.mins || 0), 0)

  return (
    <section className="card overflow-hidden">
      {/* Elon-style header banner */}
      <div className="bg-gradient-to-br from-slate-900 to-project-900 p-4 text-white sm:p-5">
        <h2 className="flex items-center gap-2 text-base font-extrabold">
          <Rocket className="h-5 w-5" /> Plan Tomorrow — think like Elon
        </h2>
        <p className="mt-0.5 text-xs text-white/70">
          Design {prettyDate(tomorrowKey)} before it happens. Ruthless, boxed,
          leverage-first.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRINCIPLES.map((p) => (
            <span
              key={p}
              className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {/* Add task */}
        <form onSubmit={addTask} className="mb-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Highest-leverage task for tomorrow…"
            className="input flex-1"
          />
          <div className="flex gap-2">
            <div className="relative w-28">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={mins}
                onChange={(e) => setMins(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="min"
                inputMode="numeric"
                className="input pl-9"
              />
            </div>
            <button type="submit" className="btn-primary flex-none">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </form>

        {plan.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-400 dark:border-slate-700">
            <Rocket className="mx-auto mb-2 h-8 w-8 opacity-50" />
            Empty. What are the 3–6 things that will make tomorrow a win?
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>
                {plan.length} task{plan.length === 1 ? '' : 's'}
              </span>
              {totalMins > 0 && (
                <span>
                  ~{Math.floor(totalMins / 60)}h {totalMins % 60}m time-boxed
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {plan.map((t, i) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-2.5 dark:border-slate-800"
                >
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-project-100 text-xs font-bold text-project-600 dark:bg-project-500/20 dark:text-project-300">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {t.text}
                  </span>
                  {t.mins > 0 && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {t.mins}m
                    </span>
                  )}
                  <button
                    onClick={() => removeTask(t.id)}
                    className="flex-none rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}

// Compact viewer for TODAY's plan (authored last night). Lets you tick tasks off.
export function TodayPlan({ dateKey }) {
  const { getDay, togglePlanTask } = useApp()
  const plan = getDay(dateKey).plan || []
  if (plan.length === 0) return null

  const done = plan.filter((t) => t.done).length

  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="section-title">
          <span aria-hidden>🗺️</span> Today’s Battle Plan
        </h2>
        <span className="text-xs font-semibold text-slate-400">
          {done}/{plan.length} done
        </span>
      </div>
      <ul className="space-y-2">
        {plan.map((t, i) => (
          <li key={t.id}>
            <button
              onClick={() => togglePlanTask(dateKey, t.id)}
              className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 p-2.5 text-left transition active:scale-[0.99] dark:border-slate-800"
            >
              <span
                className={`flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 transition ${
                  t.done
                    ? 'border-transparent bg-project-600 text-white'
                    : 'border-slate-300 text-transparent group-hover:border-slate-400 dark:border-slate-600'
                }`}
              >
                {t.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              <span
                className={`flex-1 text-sm font-medium ${
                  t.done
                    ? 'text-slate-400 line-through dark:text-slate-500'
                    : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                {t.text}
              </span>
              {t.mins > 0 && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {t.mins}m
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
