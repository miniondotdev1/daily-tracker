import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { toast } from '../utils/toast'
import { Plus, Trash, Check, Target } from './Icons'

export default function Milestones() {
  const { milestones, addMilestone, updateMilestone, removeMilestone } = useApp()
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    addMilestone({ title: title.trim(), target: Number(target) || 1 })
    setTitle('')
    setTarget('')
  }

  const step = (m, delta) => {
    const before = m.completed
    updateMilestone(m.id, { current: m.current + delta })
    if (!before && m.current + delta >= m.target) {
      toast(`Milestone complete: ${m.title}! 🏁`, { emoji: '🎊', tone: 'project' })
    }
  }

  const active = milestones.filter((m) => !m.completed)
  const done = milestones.filter((m) => m.completed)

  return (
    <section className="card p-4 sm:p-5">
      <h2 className="section-title mb-3">
        <span aria-hidden>🏁</span> Project Milestones
      </h2>

      {/* Add form */}
      <form onSubmit={submit} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Milestone (e.g. Ship MVP auth)"
          className="input flex-1"
        />
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Steps"
          inputMode="numeric"
          className="input sm:w-24"
        />
        <button type="submit" className="btn-primary sm:w-auto">
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>

      {milestones.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-400 dark:border-slate-700">
          <Target className="mx-auto mb-2 h-8 w-8 opacity-50" />
          No milestones yet. Break your project into wins you can check off.
        </div>
      )}

      {/* Active milestones */}
      <div className="space-y-3">
        {active.map((m) => {
          const pct = Math.round((m.current / m.target) * 100)
          return (
            <div
              key={m.id}
              className="animate-slide-up rounded-2xl border border-slate-200 p-3 dark:border-slate-800"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-800 dark:text-slate-100">
                    {m.title}
                  </div>
                  <div className="text-xs text-slate-400">
                    {m.current} / {m.target} · {pct}%
                  </div>
                </div>
                <button
                  onClick={() => removeMilestone(m.id)}
                  className="flex-none rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                  title="Delete"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
              <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-project-500 to-project-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => step(m, -1)}
                  disabled={m.current === 0}
                  className="btn-ghost h-8 flex-none px-3 py-1 text-base disabled:opacity-40"
                >
                  −
                </button>
                <button
                  onClick={() => step(m, 1)}
                  className="btn-ghost h-8 flex-1 px-3 py-1 text-base"
                >
                  +
                </button>
                <button
                  onClick={() => updateMilestone(m.id, { current: m.target })}
                  className="btn-primary h-8 flex-none px-3 py-1"
                >
                  <Check className="h-4 w-4" /> Done
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Completed milestones */}
      {done.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Completed ({done.length})
          </div>
          <div className="space-y-1.5">
            {done.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-emerald-50 px-3 py-2 dark:bg-emerald-500/10"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="truncate text-sm font-medium text-emerald-800 line-through dark:text-emerald-300">
                    {m.title}
                  </span>
                </div>
                <button
                  onClick={() => removeMilestone(m.id)}
                  className="flex-none rounded-lg p-1 text-emerald-500/70 hover:text-rose-500"
                  title="Delete"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
