import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { SCHEDULE, BLOCK_TYPES } from '../constants/schedule'
import { prettyTime, scheduleDayInterval, toKey } from '../utils/dates'
import { toast } from '../utils/toast'
import { Bell, BellOff, Bolt, Clock } from './Icons'

const WARN_SECONDS = 5 * 60 // nudge 5 minutes before a block starts

// Next occurrence of a "HH:MM" clock relative to `from` (used for reminders).
function nextOccurrence(clock, from) {
  const [h, m] = clock.split(':').map(Number)
  const d = new Date(from)
  d.setHours(h, m, 0, 0)
  if (d <= from) d.setDate(d.getDate() + 1)
  return d
}

function computeNext(now) {
  let best = null
  for (const block of SCHEDULE) {
    const start = nextOccurrence(block.start, now)
    const delta = (start - now) / 1000
    if (!best || delta < best.delta) best = { block, start, delta }
  }
  return best
}

function fmtCountdown(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  if (s >= 3600) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return `${h}h ${String(m).padStart(2, '0')}m`
  }
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// Green (fresh) → amber → red (time almost up) as a block progresses.
function timeColor(progress) {
  const hue = Math.round(145 * (1 - Math.max(0, Math.min(1, progress))))
  return `hsl(${hue}, 85%, 50%)`
}

// Decide what the banner's "live" slot should show:
//  - 'overdue' : a block whose time is OVER but you didn't complete/excuse it.
//                The bar STICKS at 100% and stops counting until you resolve it.
//  - 'running' : the block happening now; the bar counts up with time.
//  - null      : nothing live → fall back to an "up next" countdown.
function resolveView(now, record) {
  const key = toKey(now)
  const rows = SCHEDULE.map((block) => {
    const { start, end } = scheduleDayInterval(block, key)
    return {
      block,
      start,
      end,
      completed: Boolean(record.blocks?.[block.id]),
      excused: Boolean(record.excused?.[block.id]),
      skipped: Boolean(record.skipped?.[block.id]),
    }
  })

  const running = rows.find((r) => now >= r.start && now < r.end)
  // Earliest block whose time passed without being completed, excused, or
  // deliberately marked not-done (all count as "resolved" for the banner).
  const overdue = rows.find(
    (r) => now >= r.end && !r.completed && !r.excused && !r.skipped
  )
  const upcoming = rows
    .filter((r) => now < r.start)
    .sort((a, b) => a.start - b.start)[0]

  if (overdue) {
    return {
      mode: 'overdue',
      block: overdue.block,
      start: overdue.start,
      end: overdue.end,
      progress: 1, // stuck full — time is over
      remaining: 0,
      nextBlock: running?.block || upcoming?.block || null,
    }
  }
  if (running) {
    const total = (running.end - running.start) / 1000
    const elapsed = (now - running.start) / 1000
    return {
      mode: 'running',
      block: running.block,
      start: running.start,
      end: running.end,
      progress: Math.max(0, Math.min(1, elapsed / total)),
      remaining: Math.max(0, total - elapsed),
      nextBlock: upcoming?.block || null,
    }
  }
  return null
}

export default function NextUpBanner() {
  const { settings, setSettings, getDay } = useApp()
  const remindersOn = Boolean(settings.reminders)
  const record = getDay(toKey(new Date()))

  const [now, setNow] = useState(() => new Date())
  const firedWarn = useRef(new Set())
  const prevKeyRef = useRef(null)

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const view = resolveView(now, record)
  const next = computeNext(now)
  const key = next ? `${next.block.id}-${next.start.toDateString()}` : null

  // 5-minute warning + "go" nudge for the next block.
  useEffect(() => {
    if (!next) return
    if (next.delta <= WARN_SECONDS && next.delta > 0 && !firedWarn.current.has(key)) {
      firedWarn.current.add(key)
      const mins = Math.max(1, Math.round(next.delta / 60))
      toast(`${next.block.title} starts in ${mins} min — wrap up and get ready.`, {
        emoji: '⏰',
        tone: next.block.hero ? 'project' : 'default',
        duration: 6000,
      })
      if (remindersOn && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('⏰ Up next in 5 minutes', {
          body: `${next.block.title} · ${prettyTime(next.block.start)}`,
        })
      }
    }
    if (prevKeyRef.current && prevKeyRef.current !== key) {
      if (remindersOn && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('▶️ Time to start', { body: 'Your next block has begun. Go.' })
      }
    }
    prevKeyRef.current = key
  }, [key, next, remindersOn]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleReminders = async () => {
    if (remindersOn) {
      setSettings((s) => ({ ...s, reminders: false }))
      return
    }
    if (!('Notification' in window)) {
      toast('This browser doesn’t support notifications.', { emoji: '⚠️' })
      return
    }
    let perm = Notification.permission
    if (perm === 'default') perm = await Notification.requestPermission()
    if (perm === 'granted') {
      setSettings((s) => ({ ...s, reminders: true }))
      toast('Reminders on — I’ll nudge you 5 min before each block. 🔔', {
        emoji: '🔔',
        tone: 'success',
      })
    } else {
      toast('Notifications blocked. You’ll still get in-app nudges.', { emoji: '🔕' })
    }
  }

  const BellButton = (
    <button
      onClick={toggleReminders}
      title={remindersOn ? 'Reminders on — click to turn off' : 'Turn on 5-min reminders'}
      className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl transition active:scale-90 ${
        remindersOn
          ? 'bg-project-100 text-project-600 dark:bg-project-500/20 dark:text-project-300'
          : 'bg-slate-100 text-slate-400 hover:text-slate-600 dark:bg-slate-800'
      }`}
    >
      {remindersOn ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
    </button>
  )

  // ---- Running / Overdue: progress fill + color + next-task chip ---------
  if (view) {
    const over = view.mode === 'overdue'
    const { progress, remaining, block } = view
    // Overdue sticks fully red; a running block sweeps green → red with time.
    const color = over ? 'hsl(0, 85%, 50%)' : timeColor(progress)
    const type = BLOCK_TYPES[block.type]
    const nextBlock = view.nextBlock

    return (
      <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-6">
        <div
          className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border bg-white px-3.5 py-2.5 dark:bg-slate-900 sm:px-4 ${
            over
              ? 'border-rose-300 dark:border-rose-500/40'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          {/* Background progress fill — solid band, grows LEFT → RIGHT with
              time. When the block's time is over it STICKS at 100% (full) and
              stops advancing. */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0"
            style={{
              width: `${progress * 100}%`,
              background: color,
              opacity: over ? 0.16 : 0.2,
              transition: 'width 1s linear, background 1s linear',
            }}
          />
          {/* Leading edge line at the progress front (hidden once stuck full). */}
          {!over && (
            <div
              className="pointer-events-none absolute inset-y-0"
              style={{
                left: `${progress * 100}%`,
                width: '2px',
                background: color,
                opacity: 0.7,
                transition: 'left 1s linear, background 1s linear',
              }}
            />
          )}

          <span className="relative flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-slate-100 text-lg dark:bg-slate-800">
            {type.emoji}
          </span>

          <div className="relative min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <span className="relative flex h-2 w-2">
                {!over && (
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                    style={{ background: color }}
                  />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
              </span>
              {over ? (
                <span className="text-rose-500">
                  Time’s up · {prettyTime(block.start)}–{prettyTime(block.end)}
                </span>
              ) : (
                <>Running now · {prettyTime(block.start)}–{prettyTime(block.end)}</>
              )}
            </div>
            <div className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
              {block.hero && <span className="mr-1">⭐</span>}
              {block.title}
            </div>
          </div>

          {/* Remaining / stuck state */}
          <div className="relative flex-none text-right">
            {over ? (
              <>
                <div className="text-sm font-extrabold leading-none text-rose-500">
                  Overdue
                </div>
                <div className="text-[10px] font-medium text-slate-400">
                  mark it done or away
                </div>
              </>
            ) : (
              <>
                <div
                  className="font-mono text-base font-extrabold tabular-nums leading-none"
                  style={{ color }}
                >
                  {fmtCountdown(remaining)}
                </div>
                <div className="text-[10px] font-medium text-slate-400">left</div>
              </>
            )}
          </div>

          {/* Next task chip — right corner */}
          {nextBlock && (
            <div className="relative hidden flex-none items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800/80 sm:flex">
              <div className="text-right">
                <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Next task
                </div>
                <div className="max-w-[9rem] truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {BLOCK_TYPES[nextBlock.type].emoji} {nextBlock.title}
                </div>
              </div>
              <div className="flex items-center gap-0.5 text-[10px] font-bold tabular-nums text-slate-400">
                <Clock className="h-3 w-3" />
                {prettyTime(nextBlock.start)}
              </div>
            </div>
          )}

          <div className="relative">{BellButton}</div>
        </div>
      </div>
    )
  }

  // ---- Nothing live: "Up next" countdown --------------------------------
  if (!next) return null
  const urgent = next.delta <= WARN_SECONDS
  const type = BLOCK_TYPES[next.block.type]

  return (
    <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-6">
      <div
        className={[
          'flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 transition-colors sm:px-4',
          urgent
            ? next.block.hero
              ? 'border-project-400 bg-project-50 dark:border-project-500/50 dark:bg-project-500/15'
              : 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10'
            : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
        ].join(' ')}
      >
        <span
          className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl text-lg ${
            urgent ? 'bg-white shadow-sm dark:bg-slate-900 animate-float' : 'bg-slate-100 dark:bg-slate-800'
          }`}
        >
          {type.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            <Bolt className="h-3 w-3" />
            {urgent ? 'Get ready' : 'Up next'}
            <span className="text-slate-300 dark:text-slate-600">·</span>
            {prettyTime(next.block.start)}
          </div>
          <div className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
            {next.block.title}
          </div>
        </div>
        <div className="flex-none text-right">
          <div
            className={`font-mono text-lg font-extrabold tabular-nums leading-none ${
              urgent
                ? next.block.hero
                  ? 'text-project-600 dark:text-project-300'
                  : 'text-amber-600 dark:text-amber-400'
                : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            {fmtCountdown(next.delta)}
          </div>
          <div className="text-[10px] font-medium text-slate-400">until start</div>
        </div>
        {BellButton}
      </div>
    </div>
  )
}
