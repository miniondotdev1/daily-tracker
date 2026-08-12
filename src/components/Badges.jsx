import { useApp } from '../context/AppContext'
import { prettyDate } from '../utils/dates'

export default function Badges() {
  const { badges } = useApp()
  const unlocked = badges.filter((b) => b.unlocked).length

  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">
          <span aria-hidden>🏅</span> Achievements
        </h2>
        <span className="text-xs font-semibold text-slate-400">
          {unlocked}/{badges.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {badges.map((b) => (
          <div
            key={b.id}
            title={b.description}
            className={[
              'flex flex-col items-center rounded-2xl border p-3 text-center transition-all',
              b.unlocked
                ? 'animate-pop-in border-amber-200 bg-gradient-to-b from-amber-50 to-white shadow-sm dark:border-amber-500/30 dark:from-amber-500/10 dark:to-slate-900'
                : 'border-slate-200 bg-slate-50 opacity-70 grayscale dark:border-slate-800 dark:bg-slate-800/40',
            ].join(' ')}
          >
            <div className={`text-4xl ${b.unlocked ? 'animate-float' : ''}`}>
              {b.unlocked ? b.emoji : '🔒'}
            </div>
            <div className="mt-2 text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">
              {b.title}
            </div>
            <div className="mt-1 text-[11px] leading-snug text-slate-400">
              {b.description}
            </div>
            {b.unlocked && b.unlockedAt && (
              <div className="mt-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                {prettyDate(b.unlockedAt)}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
