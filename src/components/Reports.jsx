import { useMemo, useState } from 'react'
import {
  useApp,
  completionRatio,
  blocksDone,
} from '../context/AppContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { SCHEDULE } from '../constants/schedule'
import { lastNDays, weekKey, todayKey, prettyDate } from '../utils/dates'

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/40">
      <div className="text-2xl font-extrabold tracking-tight">{value}</div>
      <div className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </div>
      {hint && <div className="text-[11px] text-slate-400">{hint}</div>}
    </div>
  )
}

export default function Reports() {
  const { days, streaks } = useApp()
  const [range, setRange] = useState(7) // 7 or 30
  const [reflections, setReflections] = useLocalStorage('dt.reflections', {})

  const wk = weekKey(todayKey())

  const summary = useMemo(() => {
    const keys = lastNDays(range)
    let focusMin = 0
    let scoreSum = 0
    let scoreCount = 0
    let skills = 0
    let completedRatioSum = 0
    let activeDays = 0
    let best = { key: null, done: -1 }

    keys.forEach((k) => {
      const rec = days[k]
      if (!rec) return
      const done = blocksDone(rec)
      const hasActivity =
        done > 0 ||
        rec.skill?.trim() ||
        (rec.focus?.company || 0) + (rec.focus?.project || 0) > 0
      if (hasActivity) activeDays += 1

      focusMin += (rec.focus?.company || 0) + (rec.focus?.project || 0)
      if (rec.focusScore) {
        scoreSum += rec.focusScore
        scoreCount += 1
      }
      if (rec.skill?.trim()) skills += 1
      completedRatioSum += completionRatio(rec)
      if (done > best.done) best = { key: k, done }
    })

    return {
      focusHours: (focusMin / 60).toFixed(1),
      avgScore: scoreCount ? (scoreSum / scoreCount).toFixed(1) : '—',
      skills,
      completionRate: Math.round((completedRatioSum / range) * 100),
      activeDays,
      best,
    }
  }, [days, range])

  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">
          <span aria-hidden>📊</span> {range === 7 ? 'Weekly' : 'Monthly'} Report
        </h2>
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800">
          {[7, 30].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-3 py-1 transition-all ${
                range === r
                  ? 'bg-white text-project-600 shadow-sm dark:bg-slate-950 dark:text-project-300'
                  : 'text-slate-500'
              }`}
            >
              {r === 7 ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Focused hours" value={`${summary.focusHours}h`} />
        <Stat label="Avg focus score" value={summary.avgScore} hint="out of 5" />
        <Stat label="Skills learned" value={summary.skills} />
        <Stat label="Longest streak" value={`${streaks.longest}d`} />
        <Stat label="Completion rate" value={`${summary.completionRate}%`} />
        <Stat
          label="Best day"
          value={summary.best.key ? `${summary.best.done}/${SCHEDULE.length}` : '—'}
          hint={summary.best.key ? prettyDate(summary.best.key) : ''}
        />
      </div>

      {/* Weekly reflection */}
      <div className="mt-5">
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          🪞 Weekly reflection
        </label>
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          What went well this week, and what’s the one thing you’ll improve next
          week?
        </p>
        <textarea
          value={reflections[wk] || ''}
          onChange={(e) =>
            setReflections((prev) => ({ ...prev, [wk]: e.target.value }))
          }
          rows={3}
          placeholder="This week I…"
          className="input resize-none"
        />
      </div>
    </section>
  )
}
