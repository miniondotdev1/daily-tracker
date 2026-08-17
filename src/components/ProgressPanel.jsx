import { useMemo } from 'react'
import { useApp, completionRatio } from '../context/AppContext'
import { BLOCK_TYPES, ACCENT_CLASSES } from '../constants/schedule'
import { prettyTime, weekKey, todayKey } from '../utils/dates'
import { toast } from '../utils/toast'
import CircularProgress, { progressColor } from './CircularProgress'
import { Flame, Snow, Bolt } from './Icons'

export default function ProgressPanel({ dateKey }) {
  const { schedule, getDay, streaks, canFreeze, toggleFreeze, freezesUsedThisWeek } =
    useApp()
  const record = getDay(dateKey)
  const ratio = completionRatio(record)
  const pct = Math.round(ratio * 100)

  const nextBlock = useMemo(
    () =>
      schedule.find(
        (b) => !record.blocks[b.id] && !record.excused?.[b.id] && !record.skipped?.[b.id]
      ),
    [schedule, record.blocks, record.excused, record.skipped]
  )

  const frozen = record.freeze
  const freezeAvailable = canFreeze(dateKey)
  const usedThisWeek = freezesUsedThisWeek(dateKey)

  const handleFreeze = () => {
    const now = toggleFreeze(dateKey)
    if (now) {
      toast('Freeze applied — your streak is safe today. ❄️', {
        emoji: '🛡️',
        tone: 'default',
      })
    }
  }

  return (
    <section className="card flex flex-col items-center p-5 sm:p-6">
      <h2 className="section-title mb-4 self-start">
        <span aria-hidden>🎯</span> Daily Progress
      </h2>

      <CircularProgress value={ratio} size={200} stroke={16} dynamicColor>
        <div
          className="animate-pop-in text-5xl font-extrabold tracking-tight transition-colors duration-700"
          style={{ color: progressColor(ratio) }}
        >
          {pct}
          <span className="text-2xl">%</span>
        </div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {pct === 100 ? 'Perfect day 🏆' : 'complete'}
        </div>
      </CircularProgress>

      {/* Next-up block to build momentum */}
      <div className="mt-5 w-full">
        {nextBlock ? (
          <div className="flex items-center gap-3 rounded-2xl border border-project-200 bg-project-50 p-3 dark:border-project-500/30 dark:bg-project-500/10">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white text-xl shadow-sm dark:bg-slate-900">
              {BLOCK_TYPES[nextBlock.type].emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-project-600 dark:text-project-300">
                <Bolt className="h-3 w-3" /> Up next
              </div>
              <div className="truncate font-semibold text-slate-800 dark:text-slate-100">
                {nextBlock.title}
              </div>
            </div>
            <div className="flex-none text-right text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
              {prettyTime(nextBlock.start)}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            🎉 Everything done. Go rest — you earned it.
          </div>
        )}
      </div>

      {/* Streak + freeze */}
      <div className="mt-4 grid w-full grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-2xl bg-orange-50 p-3 dark:bg-orange-500/10">
          <Flame className="h-6 w-6 text-orange-500" />
          <div>
            <div className="text-lg font-extrabold leading-none text-orange-600 dark:text-orange-300">
              {streaks.current}
            </div>
            <div className="text-[11px] font-medium text-orange-500/80 dark:text-orange-300/70">
              day streak
            </div>
          </div>
        </div>

        <button
          onClick={handleFreeze}
          disabled={!frozen && !freezeAvailable}
          className={[
            'flex items-center gap-2 rounded-2xl p-3 text-left transition-all active:scale-95',
            frozen
              ? 'bg-sky-100 ring-2 ring-sky-400 dark:bg-sky-500/20'
              : freezeAvailable
              ? 'bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/10 dark:hover:bg-sky-500/20'
              : 'cursor-not-allowed bg-slate-100 opacity-60 dark:bg-slate-800',
          ].join(' ')}
          title={
            frozen
              ? 'Freeze active for this day — tap to remove'
              : freezeAvailable
              ? 'Use your weekly freeze to protect this day'
              : 'No freeze left this week'
          }
        >
          <Snow className={`h-6 w-6 ${frozen ? 'text-sky-500' : 'text-sky-400'}`} />
          <div>
            <div className="text-sm font-extrabold leading-tight text-sky-600 dark:text-sky-300">
              {frozen ? 'Frozen' : 'Freeze'}
            </div>
            <div className="text-[11px] font-medium text-sky-500/80 dark:text-sky-300/70">
              {frozen ? 'streak protected' : `${1 - usedThisWeek} left this week`}
            </div>
          </div>
        </button>
      </div>
    </section>
  )
}
