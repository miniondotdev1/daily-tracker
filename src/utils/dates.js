// Date helpers. All dates are handled in the user's LOCAL time and keyed by a
// `YYYY-MM-DD` string so localStorage records line up with the calendar day the
// user actually experiences (no UTC drift).

export function toKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey() {
  return toKey(new Date())
}

// Add (or subtract) whole days to a date key and return a new key.
export function addDays(key, delta) {
  const d = fromKey(key)
  d.setDate(d.getDate() + delta)
  return toKey(d)
}

export function isToday(key) {
  return key === todayKey()
}

// Human-friendly label like "Fri, Aug 7".
export function prettyDate(key) {
  return fromKey(key).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function longDate(key) {
  return fromKey(key).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ISO week key like "2026-W32" for weekly reports / freeze allowance.
export function weekKey(key) {
  const d = fromKey(key)
  // Shift to Thursday of the current week (ISO 8601).
  const target = new Date(d)
  const day = (d.getDay() + 6) % 7 // Mon=0..Sun=6
  target.setDate(d.getDate() - day + 3)
  const firstThursday = new Date(target.getFullYear(), 0, 4)
  const week =
    1 +
    Math.round(
      ((target - firstThursday) / 86400000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7
    )
  return `${target.getFullYear()}-W${String(week).padStart(2, '0')}`
}

// Return the last `n` date keys ending at (and including) `endKey`, oldest first.
export function lastNDays(n, endKey = todayKey()) {
  const out = []
  for (let i = n - 1; i >= 0; i--) out.push(addDays(endKey, -i))
  return out
}

// Build a grid of weeks (columns) x 7 days (rows) for a contribution graph.
// Returns { weeks: string[][], startKey } where each week is Sun..Sat keys.
export function contributionGrid(numWeeks = 16, endKey = todayKey()) {
  const end = fromKey(endKey)
  // Find the Saturday that ends the current week so the last column is "now".
  const endSaturday = new Date(end)
  endSaturday.setDate(end.getDate() + (6 - end.getDay()))
  const totalDays = numWeeks * 7
  const start = new Date(endSaturday)
  start.setDate(endSaturday.getDate() - totalDays + 1)

  const weeks = []
  let cursor = new Date(start)
  for (let w = 0; w < numWeeks; w++) {
    const col = []
    for (let d = 0; d < 7; d++) {
      col.push(toKey(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(col)
  }
  return { weeks, startKey: toKey(start) }
}

// Parse "HH:MM" into minutes since midnight (00:00 -> handled as next day for
// the very last blocks so ordering stays intuitive is NOT needed here; the
// schedule array order is authoritative).
export function minutesFromClock(clock) {
  const [h, m] = clock.split(':').map(Number)
  return h * 60 + m
}

// Format a clock string "07:30" into "7:30 AM".
export function prettyTime(clock) {
  const [h, m] = clock.split(':').map(Number)
  const ampm = h >= 12 && h < 24 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
}

// Hour before which a start time is treated as the "after-midnight tail" of the
// previous day's schedule (e.g. a 00:30 sleep block) rather than an early
// morning start. Anything at/after this hour is a same-day block.
export const WRAP_HOUR = 5

// Resolve a block's real interval for the schedule-day `dateKey`, correctly
// pushing the after-midnight tail (start hour < WRAP_HOUR) to the next calendar
// day. This is the schedule-aware version used by the banner and accountability.
export function scheduleDayInterval(block, dateKey) {
  const startHour = Number(block.start.split(':')[0])
  const base = startHour < WRAP_HOUR ? fromKey(addDays(dateKey, 1)) : fromKey(dateKey)
  return blockInterval(block, base)
}

// Resolve a block's [start, end) as real Date objects anchored to `baseDate`.
// If end <= start the block wraps past midnight, so end rolls to the next day.
export function blockInterval(block, baseDate) {
  const [sh, sm] = block.start.split(':').map(Number)
  const [eh, em] = block.end.split(':').map(Number)
  const start = new Date(baseDate)
  start.setHours(sh, sm, 0, 0)
  const end = new Date(baseDate)
  end.setHours(eh, em, 0, 0)
  if (end <= start) end.setDate(end.getDate() + 1)
  return { start, end }
}

// Which block (if any) is running right now? Checks today's and yesterday's
// anchoring so after-midnight blocks resolve correctly.
export function currentBlock(schedule, now = new Date()) {
  for (const offset of [0, -1]) {
    const base = new Date(now)
    base.setDate(base.getDate() + offset)
    for (const block of schedule) {
      const { start, end } = blockInterval(block, base)
      if (now >= start && now < end) return { block, start, end }
    }
  }
  return null
}
