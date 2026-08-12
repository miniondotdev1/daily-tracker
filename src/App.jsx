import { useState } from 'react'
import { todayKey } from './utils/dates'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ScheduleTracker from './components/ScheduleTracker'
import ProgressPanel from './components/ProgressPanel'
import Pomodoro from './components/Pomodoro'
import Priorities from './components/Priorities'
import EnergyLog from './components/EnergyLog'
import SkillsNotes from './components/SkillsNotes'
import ContributionGraph from './components/ContributionGraph'
import HabitStrength from './components/HabitStrength'
import Badges from './components/Badges'
import Milestones from './components/Milestones'
import Reports from './components/Reports'
import Toaster from './components/Toaster'
import NextUpBanner from './components/NextUpBanner'
import Accountability from './components/Accountability'
import SubmissionForms from './components/SubmissionForms'
import SubmissionRecords from './components/SubmissionRecords'
import SubmissionStats from './components/SubmissionStats'
import DailyReport from './components/DailyReport'
import DailyTracking from './components/DailyTracking'
import Rewards from './components/Rewards'
import PlanTomorrow, { TodayPlan } from './components/PlanTomorrow'

const TABS = [
  { key: 'today', label: 'Today', emoji: '📅' },
  { key: 'work', label: 'Work', emoji: '✅' },
  { key: 'momentum', label: 'Momentum', emoji: '🔥' },
  { key: 'reports', label: 'Reports', emoji: '📊' },
]

export default function App() {
  const [tab, setTab] = useState('today')
  const dateKey = todayKey()

  return (
    <div className="min-h-screen pb-24 sm:pb-10">
      <Toaster />
      <Header />

      {/* Tab navigation */}
      <nav className="sticky top-[57px] z-20 border-b border-slate-200/70 bg-slate-50/80 backdrop-blur-lg dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative flex items-center gap-1.5 px-3 py-3 text-sm font-semibold transition-colors sm:px-4 ${
                tab === t.key
                  ? 'text-project-600 dark:text-project-300'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span aria-hidden>{t.emoji}</span>
              {t.label}
              {tab === t.key && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-project-500" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Live "next up" banner with 5-minute reminders — always visible */}
      <NextUpBanner />

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6 sm:py-6">
        {tab === 'today' && (
          <div className="space-y-5 animate-fade-in">
            <Dashboard dateKey={dateKey} />
            <TodayPlan dateKey={dateKey} />

            <div className="grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ScheduleTracker dateKey={dateKey} />
              </div>
              <div className="space-y-5 lg:col-span-5">
                <ProgressPanel dateKey={dateKey} />
                <Accountability dateKey={dateKey} />
                <Pomodoro />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Priorities dateKey={dateKey} />
              <EnergyLog dateKey={dateKey} />
              <div className="md:col-span-2 xl:col-span-1">
                <SkillsNotes dateKey={dateKey} />
              </div>
            </div>
          </div>
        )}

        {tab === 'work' && (
          <div className="space-y-5 animate-fade-in">
            <SubmissionStats />
            {/* Left: all submission inputs · Right: recorded data in 3 tabs */}
            <div className="grid items-start gap-5 lg:grid-cols-2">
              <SubmissionForms dateKey={dateKey} />
              <SubmissionRecords dateKey={dateKey} />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <DailyReport dateKey={dateKey} />
              <PlanTomorrow />
            </div>
            <DailyTracking />
          </div>
        )}

        {tab === 'momentum' && (
          <div className="space-y-5 animate-fade-in">
            <ContributionGraph />
            <div className="grid gap-5 lg:grid-cols-2">
              <HabitStrength />
              <Rewards />
            </div>
            <Milestones />
            <Badges />
          </div>
        )}

        {tab === 'reports' && (
          <div className="animate-fade-in">
            <Reports />
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-6 text-center text-xs text-slate-400 sm:px-6">
        Built for consistency · Your data lives only in this browser (localStorage).
      </footer>

      {/* Mobile bottom tab bar for large touch targets */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/90 sm:hidden">
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors ${
                tab === t.key
                  ? 'text-project-600 dark:text-project-300'
                  : 'text-slate-400'
              }`}
            >
              <span className="text-lg">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
