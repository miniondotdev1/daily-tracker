import { useApp } from '../context/AppContext'

const LEVELS = [
  { key: 'low', label: 'Low', emoji: '🪫', class: 'bg-rose-100 text-rose-600 ring-rose-400 dark:bg-rose-500/20 dark:text-rose-300' },
  { key: 'medium', label: 'Medium', emoji: '⚡', class: 'bg-amber-100 text-amber-600 ring-amber-400 dark:bg-amber-500/20 dark:text-amber-300' },
  { key: 'high', label: 'High', emoji: '🔋', class: 'bg-emerald-100 text-emerald-600 ring-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300' },
]

function EnergyRow({ label, value, onPick }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {LEVELS.map((lvl) => {
          const active = value === lvl.key
          return (
            <button
              key={lvl.key}
              onClick={() => onPick(active ? null : lvl.key)}
              className={[
                'flex flex-col items-center gap-0.5 rounded-xl border py-2 text-xs font-semibold transition-all active:scale-95',
                active
                  ? `${lvl.class} border-transparent ring-2`
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700',
              ].join(' ')}
            >
              <span className="text-lg">{lvl.emoji}</span>
              {lvl.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Quick 1-tap energy logging for morning and post-gym, for pattern awareness.
export default function EnergyLog({ dateKey }) {
  const { getDay, updateDay } = useApp()
  const record = getDay(dateKey)
  const energy = record.energy || { morning: null, afterGym: null }

  return (
    <section className="card p-4 sm:p-5">
      <h2 className="section-title mb-3">
        <span aria-hidden>⚡</span> Energy Log
      </h2>
      <div className="space-y-4">
        <EnergyRow
          label="Morning"
          value={energy.morning}
          onPick={(v) => updateDay(dateKey, { energy: { morning: v } })}
        />
        <EnergyRow
          label="After Gym"
          value={energy.afterGym}
          onPick={(v) => updateDay(dateKey, { energy: { afterGym: v } })}
        />
      </div>
    </section>
  )
}
