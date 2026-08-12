import { useApp } from '../context/AppContext'

// Daily Top 3 priorities — especially for steering the evening Project block.
export default function Priorities({ dateKey }) {
  const { getDay, updateDay } = useApp()
  const record = getDay(dateKey)
  const priorities = record.priorities || ['', '', '']

  const setPriority = (i, val) => {
    const next = [...priorities]
    next[i] = val
    updateDay(dateKey, { priorities: next })
  }

  const doneCount = priorities.filter((p) => p.trim()).length

  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="section-title">
          <span aria-hidden>🎯</span> Today’s Top 3
        </h2>
        <span className="text-xs font-semibold text-slate-400">{doneCount}/3 set</span>
      </div>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        What must happen today — especially for your Project block?
      </p>
      <div className="space-y-2">
        {priorities.map((p, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span
              className={`flex h-7 w-7 flex-none items-center justify-center rounded-lg text-sm font-bold ${
                i === 0
                  ? 'bg-project-100 text-project-600 dark:bg-project-500/20 dark:text-project-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {i + 1}
            </span>
            <input
              value={p}
              onChange={(e) => setPriority(i, e.target.value)}
              placeholder={
                i === 0 ? 'Most important thing…' : `Priority ${i + 1} (optional)`
              }
              className="input"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
