// Short, punchy motivational lines. Kept deterministic-per-index so tests and
// the UI can pick a stable message without random flicker on re-render.

export const PROJECT_QUOTES = [
  'Another brick laid. This is how empires get built. 🚀',
  'Future you just got a little luckier. Great work.',
  'Consistency compounds. You showed up — that’s the whole game.',
  '3 hours today. That’s 20+ hours a week your competition isn’t doing.',
  'The project moves because you moved it. Proud of you.',
  'Deep work, done. This is your unfair advantage.',
]

export const STREAK_QUOTES = [
  'You’re on fire — keep the chain alive! 🔥',
  'Momentum is real, and it’s working for you now.',
  'Discipline is just showing up again. You did.',
  'Streaks are proof you can trust yourself. Keep going.',
]

export const COMPLETE_QUOTES = [
  'Nice — momentum!',
  'One down. Onto the next.',
  'That’s the rhythm. 🎵',
  'Small wins stack up.',
  'Locked in.',
  'Clean execution.',
]

export const DAY_DONE_QUOTES = [
  'Perfect day. You did everything you set out to do. 🏆',
  'Flawless. Rest well — you earned it.',
  '100%. This is who you’re becoming.',
]

// Pick a line based on a numeric seed so the choice is stable per call site.
export function pick(list, seed = 0) {
  if (!list.length) return ''
  const i = Math.abs(Math.floor(seed)) % list.length
  return list[i]
}
