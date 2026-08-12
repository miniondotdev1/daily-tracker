import { useMemo } from 'react'
import { useApp, projectHoursMet } from '../context/AppContext'
import {
  SCHEDULE,
  BLOCK_TYPES,
  ACCENT_CLASSES,
} from '../constants/schedule'
import { prettyTime } from '../utils/dates'
import { toast } from '../utils/toast'
import {
  PROJECT_QUOTES,
  COMPLETE_QUOTES,
  DAY_DONE_QUOTES,
  pick,
} from '../utils/motivational'
import { Check, Bolt, DoorOpen, Close } from './Icons'

export default function ScheduleTracker({ dateKey }) {
  const { getDay, toggleBlock, toggleExcused, toggleSkipped, clearBlockFlags } = useApp()
  const record = getDay(dateKey)
  const doneCount = SCHEDULE.filter((b) => record.blocks[b.id]).length

  // The "next" block to nudge momentum: first block that's not completed, away,
  // or marked not-done.
  const nextBlockId = useMemo(
    () =>
      SCHEDULE.find(
        (b) =>
          !record.blocks[b.id] && !record.excused?.[b.id] && !record.skipped?.[b.id]
      )?.id,
    [record.blocks, record.excused, record.skipped]
  )

  const handleAway = (block) => {
    const nowExcused = !record.excused?.[block.id]
    toggleExcused(dateKey, block.id)
    toast(
      nowExcused
        ? `“${block.title}” marked away — it won’t count as finished or missed.`
        : `“${block.title}” back on your plate.`,
      { emoji: nowExcused ? '🚪' : '↩️' }
    )
  }

  const handleSkip = (block) => {
    const nowSkipped = !record.skipped?.[block.id]
    toggleSkipped(dateKey, block.id)
    toast(
      nowSkipped
        ? `“${block.title}” marked not done — it counts as a miss.`
        : `“${block.title}” back on your plate.`,
      { emoji: nowSkipped ? '✖️' : '↩️' }
    )
  }

  const handleToggle = (block) => {
    const nowDone = toggleBlock(dateKey, block.id)
    // Completing a block clears any away / not-done flag it had.
    if (nowDone) clearBlockFlags(dateKey, block.id)
    if (!nowDone) return

    const completedAfter = doneCount + 1

    // Celebrate the all-important project block extra hard.
    if (block.hero) {
      toast(pick(PROJECT_QUOTES, doneCount + block.title.length), {
        emoji: '🚀',
        tone: 'project',
        duration: 4200,
      })
    } else if (completedAfter === SCHEDULE.length) {
      toast(pick(DAY_DONE_QUOTES, doneCount), {
        emoji: '🏆',
        tone: 'success',
        duration: 4500,
      })
    } else {
      // Point at the next block to keep momentum going.
      const remaining = SCHEDULE.find(
        (b) => b.id !== block.id && !record.blocks[b.id]
      )
      const msg = remaining
        ? `${pick(COMPLETE_QUOTES, block.title.length)} Next: ${remaining.title}.`
        : pick(COMPLETE_QUOTES, block.title.length)
      toast(msg, { emoji: '✅', tone: 'success' })
    }
  }

  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">
          <span aria-hidden>🗓️</span> Today’s Schedule
        </h2>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {doneCount}/{SCHEDULE.length} done
        </span>
      </div>

      <ul className="space-y-2.5">
        {SCHEDULE.map((block, i) => {
          const type = BLOCK_TYPES[block.type]
          const accent = ACCENT_CLASSES[type.accent]
          const done = Boolean(record.blocks[block.id])
          const excused = Boolean(record.excused?.[block.id])
          const skipped = Boolean(record.skipped?.[block.id])
          const muted = done || excused || skipped
          const isNext = block.id === nextBlockId
          const hero = block.hero

          return (
            <li
              key={block.id}
              style={{ animationDelay: `${i * 22}ms` }}
              className="animate-slide-up"
            >
              <div
                className={[
                  'group flex items-stretch gap-1 rounded-2xl border transition-all duration-200',
                  excused
                    ? 'border-sky-200 bg-sky-50/60 dark:border-sky-500/30 dark:bg-sky-500/5'
                    : skipped
                    ? 'border-rose-200 bg-rose-50/60 dark:border-rose-500/30 dark:bg-rose-500/5'
                    : hero
                    ? done
                      ? 'border-project-300 bg-project-50 dark:border-project-500/40 dark:bg-project-500/10'
                      : 'border-project-300 bg-gradient-to-r from-project-50 to-white ring-1 ring-project-300/50 hover:shadow-md dark:border-project-500/40 dark:from-project-500/10 dark:to-slate-900 dark:ring-project-500/30'
                    : done
                    ? 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40'
                    : `border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 ${
                        isNext
                          ? 'ring-2 ' + accent.ring + ' ring-offset-1 dark:ring-offset-slate-900'
                          : ''
                      }`,
                ].join(' ')}
              >
                {/* Main toggle area (mark complete) */}
                <button
                  onClick={() => handleToggle(block)}
                  disabled={excused || skipped}
                  aria-pressed={done}
                  className="flex flex-1 items-center gap-3 rounded-l-2xl p-3 text-left transition-transform active:scale-[0.99] disabled:cursor-default disabled:active:scale-100"
                >
                  {/* Checkbox */}
                  <span
                    className={[
                      'flex h-7 w-7 flex-none items-center justify-center rounded-full border-2 transition-all',
                      excused
                        ? 'border-sky-300 text-sky-500 dark:border-sky-500/50'
                        : skipped
                        ? 'border-rose-300 text-rose-500 dark:border-rose-500/50'
                        : done
                        ? `${accent.solid} border-transparent text-white`
                        : 'border-slate-300 text-transparent group-hover:border-slate-400 dark:border-slate-600',
                    ].join(' ')}
                  >
                    {excused ? (
                      <DoorOpen className="h-4 w-4" />
                    ) : skipped ? (
                      <Close className="h-4 w-4" strokeWidth={3} />
                    ) : (
                      done && <Check className="animate-check-pop h-4 w-4" strokeWidth={3} />
                    )}
                  </span>

                  {/* Time */}
                  <div className="w-[4.5rem] flex-none">
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        muted
                          ? 'text-slate-400 dark:text-slate-500'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {prettyTime(block.start)}
                    </div>
                    <div className="text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
                      {prettyTime(block.end)}
                    </div>
                  </div>

                  {/* Title + type */}
                  <div className="min-w-0 flex-1">
                    <div
                      className={`truncate font-semibold ${
                        hero && !muted ? 'text-project-700 dark:text-project-200' : ''
                      } ${
                        muted
                          ? 'text-slate-400 line-through dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {hero && <span className="mr-1">⭐</span>}
                      {block.title}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${accent.bgSoft} ${accent.text}`}
                      >
                        <span aria-hidden>{type.emoji}</span>
                        {type.label}
                      </span>
                      {excused ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                          <DoorOpen className="h-3 w-3" /> Away · not counted
                        </span>
                      ) : skipped ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                          <Close className="h-3 w-3" /> Not done · counts as miss
                        </span>
                      ) : (
                        isNext &&
                        !done && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-project-100 px-2 py-0.5 text-[11px] font-bold text-project-700 dark:bg-project-500/20 dark:text-project-200">
                            <Bolt className="h-3 w-3" /> Up next
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </button>

                {/* Away — doesn't count as finished OR missed (no penalty). */}
                <button
                  onClick={() => handleAway(block)}
                  title={excused ? 'Bring this task back' : 'I was away — don’t count this task'}
                  aria-label={excused ? 'Un-mark away' : 'Mark away'}
                  className={[
                    'flex w-10 flex-none items-center justify-center border-l transition-colors',
                    excused
                      ? 'border-sky-200 bg-sky-100 text-sky-600 dark:border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-300'
                      : 'border-slate-100 text-slate-300 hover:bg-slate-50 hover:text-sky-500 dark:border-slate-800 dark:text-slate-600 dark:hover:bg-slate-800',
                  ].join(' ')}
                >
                  <DoorOpen className="h-4 w-4" />
                </button>

                {/* Not done — I chose not to do it; counts as a miss (penalty). */}
                <button
                  onClick={() => handleSkip(block)}
                  title={skipped ? 'Bring this task back' : 'I didn’t do this — mark not done'}
                  aria-label={skipped ? 'Un-mark not done' : 'Mark not done'}
                  className={[
                    'flex w-10 flex-none items-center justify-center rounded-r-2xl border-l transition-colors',
                    skipped
                      ? 'border-rose-200 bg-rose-100 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300'
                      : 'border-slate-100 text-slate-300 hover:bg-slate-50 hover:text-rose-500 dark:border-slate-800 dark:text-slate-600 dark:hover:bg-slate-800',
                  ].join(' ')}
                >
                  <Close className="h-4 w-4" />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Little project-hours confirmation footer */}
      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-2.5 text-sm font-medium dark:bg-slate-800/50">
        {projectHoursMet(record) ? (
          <span className="text-project-600 dark:text-project-300">
            🚀 3+ project hours logged today — outstanding.
          </span>
        ) : (
          <span className="text-slate-500 dark:text-slate-400">
            Your 19:00 Project block is the day’s MVP. Protect it.
          </span>
        )}
      </div>
    </section>
  )
}
