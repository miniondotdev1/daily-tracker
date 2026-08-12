import { useApp } from '../context/AppContext'
import { REWARD_TIERS } from '../constants/rewards'
import { Gift } from './Icons'

export default function Rewards() {
  const { rewards } = useApp()
  const { points, nextTier, prevTierAt, unlockedRewards } = rewards

  // Progress toward the next reward tier.
  const span = nextTier ? nextTier.at - prevTierAt : 1
  const into = points - prevTierAt
  const pct = nextTier ? Math.min(100, Math.round((into / span) * 100)) : 100

  return (
    <section className="card overflow-hidden p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">
          <span aria-hidden>🎁</span> Rewards
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-extrabold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
          <Gift className="h-4 w-4" /> {points.toLocaleString()} pts
        </span>
      </div>

      {/* Progress to next reward */}
      {nextTier ? (
        <div className="mb-4 rounded-2xl bg-gradient-to-br from-amber-50 to-white p-4 dark:from-amber-500/10 dark:to-slate-900">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Next reward
            </span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-300">
              {nextTier.at - points} pts to go
            </span>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">{nextTier.emoji}</span>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {nextTier.title}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-amber-200/60 dark:bg-amber-900/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-2xl bg-gradient-to-br from-amber-50 to-white p-4 text-center dark:from-amber-500/10 dark:to-slate-900">
          <div className="text-2xl">👑</div>
          <div className="font-bold text-slate-800 dark:text-slate-100">
            Every reward unlocked. You’re unstoppable.
          </div>
        </div>
      )}

      {/* Reward ladder */}
      <div className="space-y-1.5">
        {REWARD_TIERS.map((t) => {
          const unlocked = unlockedRewards.includes(t)
          return (
            <div
              key={t.at}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                unlocked
                  ? 'bg-emerald-50 dark:bg-emerald-500/10'
                  : 'bg-slate-50 dark:bg-slate-800/40'
              }`}
            >
              <span className={`text-xl ${unlocked ? '' : 'opacity-40 grayscale'}`}>
                {t.emoji}
              </span>
              <span
                className={`flex-1 text-sm font-semibold ${
                  unlocked
                    ? 'text-slate-800 dark:text-slate-100'
                    : 'text-slate-400'
                }`}
              >
                {t.title}
              </span>
              <span
                className={`text-xs font-bold ${
                  unlocked
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400'
                }`}
              >
                {unlocked ? 'Unlocked ✓' : `${t.at} pts`}
              </span>
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-400">
        Earn points by finishing blocks, shipping work, reading, and keeping
        streaks. Cash them in — you set the rules.
      </p>
    </section>
  )
}
