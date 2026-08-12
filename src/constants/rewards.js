// A self-directed reward system. You earn points for the behaviours that
// actually move your life forward, and cash them in for real-world treats you
// pick for yourself. Points are DERIVED from stored data (see AppContext) so
// they can never be gamed or double-counted.

export const POINTS = {
  projectBlock: 30, // completed the all-important project block
  perfectDay: 50, // 100% of blocks
  skill: 15, // logged a new skill
  streakDay: 10, // a day that counts toward the streak
  submission: 20, // submitted company or project work
  reading: 25, // submitted a reading summary
  milestone: 40, // completed a project milestone
}

// Cash-in tiers. Feel free to rename these to rewards that motivate YOU.
export const REWARD_TIERS = [
  { at: 100, emoji: '☕', title: 'A really good coffee' },
  { at: 300, emoji: '🎬', title: 'Guilt-free movie night' },
  { at: 600, emoji: '🎮', title: 'An evening of gaming' },
  { at: 1000, emoji: '🍽️', title: 'A proper nice dinner' },
  { at: 1500, emoji: '🛍️', title: 'Buy that thing you wanted' },
  { at: 2500, emoji: '🏖️', title: 'Plan a weekend getaway' },
  { at: 4000, emoji: '✈️', title: 'Book the trip' },
  { at: 6000, emoji: '👑', title: 'You define it — you earned it' },
]

// Encouraging lines shown after submitting a reading summary.
export const READING_REWARDS = [
  'Knowledge banked. Your future self is smarter for it. 📚',
  'Every page compounds. That’s a real edge you’re building.',
  'You read AND reflected — that’s how learning actually sticks.',
  'Another summary in the vault. Discipline looks good on you.',
  'Readers are leaders. You just proved it again. 👑',
]
