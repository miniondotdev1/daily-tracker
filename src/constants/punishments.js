// Light-hearted "accountability" penalties assigned when a scheduled block is
// missed (its time passed and it wasn't completed or excused). The point isn't
// shame — it's a quick, physical reset that turns a slip into momentum.

export const PUNISHMENTS = [
  '10 push-ups',
  '50 jumping jacks',
  '20 squats',
  '30-second plank',
  '15 burpees',
  '20 walking lunges',
  '1-minute wall sit',
  '25 crunches',
  '40 high knees',
  '15 mountain climbers (each side)',
  '2-minute brisk walk',
  '10 diamond push-ups',
]

// Deterministic pick so a given missed block always shows the SAME penalty
// (no reshuffling on every render).
export function punishmentFor(seed = '') {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return PUNISHMENTS[h % PUNISHMENTS.length]
}

// Submission-streak reward milestones (consecutive days shipping work, no gap).
export const SUBMISSION_MILESTONES = [
  { days: 10, emoji: '🔥', reward: 'A well-earned rest day treat' },
  { days: 20, emoji: '💪', reward: 'Buy yourself something small' },
  { days: 25, emoji: '🚀', reward: 'A proper celebration meal' },
  { days: 50, emoji: '👑', reward: 'A reward you choose — you earned it' },
  { days: 100, emoji: '🏆', reward: 'Legendary. Do something unforgettable' },
]
