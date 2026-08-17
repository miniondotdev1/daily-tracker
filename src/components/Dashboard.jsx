import {
  useApp,
  blocksDone,
  completionRatio,
} from '../context/AppContext'
import { PROJECT_MINUTES_GOAL } from '../constants/schedule'
import { Flame, Bolt, Star, Book, Target } from './Icons'

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="card animate-slide-up flex items-center gap-3 p-3.5 sm:p-4">
      <div
        className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl text-xl ${accent}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xl font-extrabold leading-none tracking-tight sm:text-2xl">
          {value}
        </div>
        <div className="mt-1 truncate text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </div>
        {sub && (
          <div className="text-[11px] text-slate-400 dark:text-slate-500">{sub}</div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard({ dateKey }) {
  const { getDay, streaks, schedule } = useApp()
  const record = getDay(dateKey)

  // The "hero" block (or one literally named project) drives the project-hours
  // stat. Guarded so it never crashes if that block was edited away.
  const heroBlock = schedule.find((b) => b.hero) || schedule.find((b) => b.id === 'project')
  const pct = Math.round(completionRatio(record) * 100)
  const projectMinutes = record.focus?.project || 0
  const projectFromBlock =
    heroBlock && record.blocks?.[heroBlock.id]
      ? heroBlock.projectMinutes || PROJECT_MINUTES_GOAL
      : 0
  const projectTotal = Math.max(projectMinutes, projectFromBlock)
  const projectHrs = (projectTotal / 60).toFixed(projectTotal % 60 === 0 ? 0 : 1)
  const hasSkill = Boolean(record.skill?.trim())
  const focusScore = record.focusScore || 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard
        icon={<Target className="h-5 w-5" />}
        label="Daily completion"
        value={`${pct}%`}
        sub={`${blocksDone(record)}/${schedule.length} blocks`}
        accent="bg-project-100 text-project-600 dark:bg-project-500/20 dark:text-project-300"
      />
      <StatCard
        icon={<span aria-hidden>🚀</span>}
        label="Project hours"
        value={`${projectHrs}h`}
        sub={`goal ${(PROJECT_MINUTES_GOAL / 60).toFixed(0)}h+`}
        accent="bg-project-100 text-project-600 dark:bg-project-500/20 dark:text-project-300"
      />
      <StatCard
        icon={<Book className="h-5 w-5" />}
        label="Skill logged"
        value={hasSkill ? 'Yes' : '—'}
        sub={hasSkill ? 'nice work' : 'log one today'}
        accent="bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300"
      />
      <StatCard
        icon={<Star className="h-5 w-5" />}
        label="Focus score"
        value={focusScore ? `${focusScore}/5` : '—'}
        sub={focusScore ? '' : 'rate your day'}
        accent="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300"
      />
      <StatCard
        icon={<Flame className="h-5 w-5" />}
        label="Current streak"
        value={`${streaks.current}d`}
        sub={`best ${streaks.longest}d`}
        accent="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300"
      />
    </div>
  )
}
