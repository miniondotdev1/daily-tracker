import { useMemo, useState } from 'react'
import {
  useApp,
  blocksDone,
  projectHoursMet,
} from '../context/AppContext'
import { SCHEDULE } from '../constants/schedule'
import {
  contributionGrid,
  fromKey,
  prettyDate,
  todayKey,
  isToday,
} from '../utils/dates'
import { Flame } from './Icons'

const NUM_WEEKS = 16

// Map a day record to an intensity level 0..4.
function levelFor(record) {
  if (!record) return 0
  const done = blocksDone(record)
  if (done === 0) return 0
  const ratio = done / SCHEDULE.length
  let lvl = ratio >= 0.9 ? 4 : ratio >= 0.65 ? 3 : ratio >= 0.35 ? 2 : 1
  // Hitting 3+ project hours is special — bump a full day to the top level.
  if (projectHoursMet(record) && lvl >= 3) lvl = 4
  return lvl
}

const LEVEL_CLASS = [
  'bg-slate-100 dark:bg-slate-800',
  'bg-project-200 dark:bg-project-900/70',
  'bg-project-300 dark:bg-project-700',
  'bg-project-400 dark:bg-project-600',
  'bg-project-500 dark:bg-project-500',
]

const DOW = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export default function ContributionGraph() {
  const { days, streaks } = useApp()
  const [hover, setHover] = useState(null)

  const { weeks } = useMemo(() => contributionGrid(NUM_WEEKS), [])

  // Month labels along the top (show a label when the month changes).
  const monthLabels = useMemo(() => {
    let lastMonth = -1
    return weeks.map((week) => {
      const d = fromKey(week[0])
      const m = d.getMonth()
      if (m !== lastMonth) {
        lastMonth = m
        return d.toLocaleDateString(undefined, { month: 'short' })
      }
      return ''
    })
  }, [weeks])

  const today = todayKey()

  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title">
          <span aria-hidden>🟩</span> Consistency
        </h2>
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 font-semibold text-orange-600 dark:text-orange-300">
            <Flame className="h-4 w-4" /> {streaks.current}d current
          </span>
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            🏆 {streaks.longest}d best
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-flex min-w-full flex-col gap-1">
          {/* Month row */}
          <div className="flex gap-1 pl-8">
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="w-3.5 text-[10px] font-medium text-slate-400 sm:w-4"
              >
                {m}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Day-of-week labels */}
            <div className="flex w-7 flex-col gap-1 pr-1">
              {DOW.map((d, i) => (
                <div
                  key={i}
                  className="h-3.5 text-[9px] leading-3.5 text-slate-400 sm:h-4"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((key) => {
                  const rec = days[key]
                  const future = key > today
                  const lvl = future ? 0 : levelFor(rec)
                  return (
                    <div
                      key={key}
                      onMouseEnter={() => !future && setHover(key)}
                      onMouseLeave={() => setHover(null)}
                      className={[
                        'h-3.5 w-3.5 rounded-[4px] transition-transform sm:h-4 sm:w-4',
                        future ? 'opacity-30' : 'hover:scale-125 hover:ring-2 hover:ring-project-400/50',
                        LEVEL_CLASS[lvl],
                        isToday(key) ? 'ring-2 ring-project-500 ring-offset-1 dark:ring-offset-slate-900' : '',
                        rec?.freeze ? 'ring-1 ring-sky-400' : '',
                      ].join(' ')}
                      title={`${prettyDate(key)} — ${rec ? blocksDone(rec) : 0} blocks${
                        rec?.freeze ? ' · ❄️ frozen' : ''
                      }`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend + hover detail */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <div className="h-4">
          {hover && (
            <span className="animate-fade-in font-medium text-slate-500 dark:text-slate-300">
              {prettyDate(hover)} · {days[hover] ? blocksDone(days[hover]) : 0}/
              {SCHEDULE.length} blocks
              {days[hover] && projectHoursMet(days[hover]) ? ' · 🚀 3h+' : ''}
              {days[hover]?.freeze ? ' · ❄️' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {LEVEL_CLASS.map((c, i) => (
            <span key={i} className={`h-3 w-3 rounded-[3px] ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </section>
  )
}
