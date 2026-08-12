import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { SCHEDULE, BLOCK_TYPES } from '../constants/schedule'
import { fromKey, addDays, blockInterval, prettyTime } from '../utils/dates'
import { punishmentFor } from '../constants/punishments'
import { toast } from '../utils/toast'
import { Check, Dumbbell, DoorOpen, Snow } from './Icons'

// Anchor a block to its real interval for the schedule-day `dateKey`. The
// after-midnight tail (start hour < 7) belongs to the next calendar day.
function localInterval(block, dateKey) {
  const startHour = Number(block.start.split(':')[0])
  const base = startHour < 7 ? fromKey(addDays(dateKey, 1)) : fromKey(dateKey)
  return blockInterval(block, base)
}

export default function Accountability({ dateKey }) {
  const { getDay, toggleExcused, excuseBlocks, markPunishmentDone } = useApp()
  const record = getDay(dateKey)
  const [now, setNow] = useState(() => new Date())

  // A gentle tick so blocks roll from pending → missed without a refresh.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000)
    return () => window.clearInterval(id)
  }, [])

  const model = useMemo(() => {
    const rows = SCHEDULE.map((block) => {
      const { start, end } = localInterval(block, dateKey)
      const completed = Boolean(record.blocks?.[block.id])
      const excused = Boolean(record.excused?.[block.id])
      const skipped = Boolean(record.skipped?.[block.id])
      let status
      if (completed) status = 'done'
      else if (excused) status = 'excused'
      else if (skipped || now >= end) status = 'missed' // "not done" counts as a miss
      else status = 'pending' // running or upcoming
      return { block, start, end, status }
    })
    return {
      rows,
      finished: rows.filter((r) => r.status === 'done').length,
      missed: rows.filter((r) => r.status === 'missed'),
      excused: rows.filter((r) => r.status === 'excused').length,
      pending: rows.filter((r) => r.status === 'pending'),
    }
  }, [record, dateKey, now])

  const { finished, missed, excused, pending, rows } = model
  const countable = finished + missed.length // excused/pending don't count against you
  const finishRate = countable > 0 ? Math.round((finished / countable) * 100) : 0

  const goOut = () => {
    const ids = pending.map((r) => r.block.id)
    if (!ids.length) return
    excuseBlocks(dateKey, ids)
    toast(`Enjoy — excused ${ids.length} upcoming block${ids.length === 1 ? '' : 's'}. No penalties. 🚪`, {
      emoji: '🚪',
      tone: 'default',
    })
  }

  return (
    <section className="card p-4 sm:p-5">
      <h2 className="section-title mb-3">
        <span aria-hidden>🎯</span> Accountability
      </h2>

      {/* Finished highlight */}
      <div className="mb-4 grid grid-cols-4 gap-2 text-center">
        <div className="rounded-2xl bg-emerald-50 p-2.5 dark:bg-emerald-500/10">
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-300">
            {finished}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-500/80">
            Finished
          </div>
        </div>
        <div className="rounded-2xl bg-rose-50 p-2.5 dark:bg-rose-500/10">
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-300">
            {missed.length}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-rose-500/80">
            Missed
          </div>
        </div>
        <div className="rounded-2xl bg-sky-50 p-2.5 dark:bg-sky-500/10">
          <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-300">{excused}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-sky-500/80">
            Excused
          </div>
        </div>
        <div className="rounded-2xl bg-slate-100 p-2.5 dark:bg-slate-800/60">
          <div className="text-2xl font-extrabold text-slate-600 dark:text-slate-300">
            {pending.length}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            To go
          </div>
        </div>
      </div>

      {/* Finish-rate bar (missed count against you, excused/pending don't) */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">Completion of due blocks</span>
          <span className="text-slate-700 dark:text-slate-200">
            {finished}/{countable} · {finishRate}%
          </span>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${countable ? (finished / countable) * 100 : 0}%` }}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-500"
            style={{ width: `${countable ? (missed.length / countable) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* "Going out" — excuse the rest of today so nothing counts against you */}
      <button
        onClick={goOut}
        disabled={pending.length === 0}
        className="btn-ghost mb-4 w-full disabled:opacity-40"
        title="Heading out? Excuse your remaining blocks so you get no penalties."
      >
        <DoorOpen className="h-4 w-4" /> Going out — excuse the rest of today
      </button>

      {/* Missed blocks → punishments */}
      {missed.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-300">
            <Dumbbell className="h-4 w-4" /> Owed penalties
          </div>
          <div className="space-y-2">
            {missed.map(({ block }) => {
              const punishment = punishmentFor(`${dateKey}|${block.id}`)
              const done = Boolean(record.punishmentsDone?.[block.id])
              return (
                <div
                  key={block.id}
                  className={`rounded-xl border p-3 transition ${
                    done
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                      : 'border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10'
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-base">{BLOCK_TYPES[block.type].emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Missed: {block.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {prettyTime(block.start)}–{prettyTime(block.end)}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`mb-2 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-bold ${
                      done
                        ? 'text-emerald-600 line-through dark:text-emerald-400'
                        : 'bg-white/60 text-rose-700 dark:bg-slate-900/40 dark:text-rose-300'
                    }`}
                  >
                    <Dumbbell className="h-4 w-4 flex-none" /> {punishment}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markPunishmentDone(dateKey, block.id)}
                      disabled={done}
                      className="btn flex-1 bg-emerald-600 py-1.5 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" /> {done ? 'Done' : 'Mark done'}
                    </button>
                    {!done && (
                      <button
                        onClick={() => toggleExcused(dateKey, block.id)}
                        className="btn-ghost flex-none py-1.5"
                        title="I was legitimately away — excuse this block"
                      >
                        <Snow className="h-4 w-4" /> I was away
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400 dark:border-slate-700">
          {pending.length + finished === SCHEDULE.length && finished === 0
            ? 'Your day hasn’t started yet — no penalties.'
            : 'No penalties owed. Keep it clean! 💪'}
        </div>
      )}

      {/* Undo excuses, if any */}
      {excused > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Excused (away)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {rows
              .filter((r) => r.status === 'excused')
              .map(({ block }) => (
                <button
                  key={block.id}
                  onClick={() => toggleExcused(dateKey, block.id)}
                  className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-700 transition hover:bg-sky-200 dark:bg-sky-500/20 dark:text-sky-300"
                  title="Tap to un-excuse"
                >
                  {BLOCK_TYPES[block.type].emoji} {block.title} ✕
                </button>
              ))}
          </div>
        </div>
      )}
    </section>
  )
}
