import { useMemo } from 'react'
import { useApp, submissionEntries } from '../context/AppContext'
import { todayKey } from '../utils/dates'
import { SUBMISSION_MILESTONES } from '../constants/punishments'
import { Flame, Send, Gift } from './Icons'

export default function SubmissionStats() {
  const { days, achievementStats } = useApp()
  const streak = achievementStats.submissionStreak

  const stats = useMemo(() => {
    const today = todayKey()
    const month = today.slice(0, 7) // YYYY-MM

    const tally = (keyFilter) => {
      let subs = 0
      let tasks = 0
      Object.entries(days).forEach(([k, rec]) => {
        if (!keyFilter(k)) return
        const c = submissionEntries(rec.submissions?.company)
        const p = submissionEntries(rec.submissions?.project)
        subs += c.length + p.length
        tasks += [...c, ...p].reduce((n, e) => n + (e.count || 0), 0)
      })
      return { subs, tasks }
    }

    return {
      today: tally((k) => k === today),
      month: tally((k) => k.startsWith(month)),
    }
  }, [days])

  // Next no-gap streak reward.
  const nextMilestone = SUBMISSION_MILESTONES.find((m) => m.days > streak) || null
  const prevDays = [...SUBMISSION_MILESTONES].reverse().find((m) => m.days <= streak)?.days || 0
  const span = nextMilestone ? nextMilestone.days - prevDays : 1
  const pct = nextMilestone ? Math.min(100, Math.round(((streak - prevDays) / span) * 100)) : 100

  return (
    <section className="card p-4 sm:p-5">
      <h2 className="section-title mb-3">
        <span aria-hidden>📈</span> Submission Stats
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-800/40">
          <div className="text-2xl font-extrabold">{stats.today.subs}</div>
          <div className="text-[11px] font-medium text-slate-400">submissions today</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-800/40">
          <div className="text-2xl font-extrabold">{stats.today.tasks}</div>
          <div className="text-[11px] font-medium text-slate-400">tasks today</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-800/40">
          <div className="text-2xl font-extrabold">{stats.month.subs}</div>
          <div className="text-[11px] font-medium text-slate-400">submissions this month</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-800/40">
          <div className="text-2xl font-extrabold">{stats.month.tasks}</div>
          <div className="text-[11px] font-medium text-slate-400">tasks this month</div>
        </div>
      </div>

      {/* No-gap submission streak + next reward */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-orange-50 to-white p-4 dark:from-orange-500/10 dark:to-slate-900">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <div>
              <div className="text-xl font-extrabold leading-none text-orange-600 dark:text-orange-300">
                {streak} day{streak === 1 ? '' : 's'}
              </div>
              <div className="text-[11px] font-medium text-orange-500/80">
                shipping streak (no gap)
              </div>
            </div>
          </div>
          {nextMilestone ? (
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                <Gift className="h-4 w-4 text-amber-500" /> {nextMilestone.days - streak} to go
              </div>
              <div className="max-w-[10rem] text-[11px] text-slate-400">
                {nextMilestone.emoji} {nextMilestone.reward}
              </div>
            </div>
          ) : (
            <div className="text-right text-sm font-bold text-emerald-600 dark:text-emerald-400">
              🏆 All rewards earned
            </div>
          )}
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-orange-200/60 dark:bg-orange-900/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* Milestone markers */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SUBMISSION_MILESTONES.map((m) => {
            const reached = streak >= m.days
            return (
              <span
                key={m.days}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  reached
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                }`}
              >
                {m.emoji} {m.days}d {reached ? '✓' : ''}
              </span>
            )
          })}
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        Submit at least one piece of work every day — miss a day and the streak
        resets. <Send className="inline h-3 w-3" />
      </p>
    </section>
  )
}
