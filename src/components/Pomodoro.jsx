import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { PROJECT_MINUTES_GOAL } from '../constants/schedule'
import { lastNDays, todayKey } from '../utils/dates'
import { toast } from '../utils/toast'
import FocusMode from './FocusMode'
import { Play, Pause, Reset, Expand } from './Icons'

const MODES = {
  '50/10': { work: 50, brk: 10, label: '50 / 10' },
  '25/5': { work: 25, brk: 5, label: '25 / 5' },
}

const CATEGORIES = {
  project: { label: 'Personal Project', emoji: '🚀', accent: 'project' },
  company: { label: 'Company Work', emoji: '💼', accent: 'sky' },
}

function fmt(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function Pomodoro() {
  const { settings, setSettings, addFocusMinutes, days } = useApp()

  const mode = settings.pomodoroMode || '50/10'
  const modeCfg = MODES[mode]

  const [category, setCategory] = useState('project')
  const [phase, setPhase] = useState('work') // 'work' | 'break'
  const [secondsLeft, setSecondsLeft] = useState(modeCfg.work * 60)
  const [running, setRunning] = useState(false)
  const [focusOpen, setFocusOpen] = useState(false)

  const phaseTotal = (phase === 'work' ? modeCfg.work : modeCfg.brk) * 60
  const tickRef = useRef(null)

  // If the mode changes while idle, reset the clock to the new work length.
  useEffect(() => {
    if (!running) {
      setSecondsLeft((phase === 'work' ? modeCfg.work : modeCfg.brk) * 60)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Log the focused minutes elapsed in the CURRENT work phase, then reset the
  // baseline. Used both on natural completion and when ending early.
  const flushWork = useCallback(
    (elapsedSeconds) => {
      const mins = Math.floor(elapsedSeconds / 60)
      if (phase === 'work' && mins > 0) {
        addFocusMinutes(category, mins)
      }
    },
    [phase, category, addFocusMinutes]
  )

  const handleComplete = useCallback(() => {
    if (phase === 'work') {
      addFocusMinutes(category, modeCfg.work)
      toast(
        `${modeCfg.work} min of ${CATEGORIES[category].label} logged. Take a ${modeCfg.brk} min break.`,
        { emoji: '🎉', tone: category === 'project' ? 'project' : 'success' }
      )
      setPhase('break')
      setSecondsLeft(modeCfg.brk * 60)
    } else {
      toast('Break over — back to deep work. 🔒', { emoji: '⏱️' })
      setPhase('work')
      setSecondsLeft(modeCfg.work * 60)
    }
  }, [phase, category, modeCfg, addFocusMinutes])

  // The interval tick.
  useEffect(() => {
    if (!running) return
    tickRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) return 0
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(tickRef.current)
  }, [running])

  // React to reaching zero.
  useEffect(() => {
    if (secondsLeft === 0 && running) {
      handleComplete()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft])

  const start = () => {
    setRunning(true)
    setFocusOpen(true)
  }
  const pause = () => setRunning(false)

  const reset = () => {
    // Log any partial progress made in this work phase before wiping it.
    if (phase === 'work') flushWork(phaseTotal - secondsLeft)
    setRunning(false)
    setPhase('work')
    setSecondsLeft(modeCfg.work * 60)
  }

  const endFocus = () => {
    // Ending focus mode logs partial minutes but keeps the clock where it is so
    // the user can resume; running is paused.
    if (phase === 'work' && running) flushWork(phaseTotal - secondsLeft)
    setRunning(false)
    setFocusOpen(false)
  }

  const progress = 1 - secondsLeft / phaseTotal

  // Daily & weekly focused-minute totals from stored data.
  const totals = useMemo(() => {
    const today = days[todayKey()]?.focus || { company: 0, project: 0 }
    const week = lastNDays(7).reduce(
      (acc, k) => {
        const f = days[k]?.focus
        if (f) {
          acc.company += f.company || 0
          acc.project += f.project || 0
        }
        return acc
      },
      { company: 0, project: 0 }
    )
    return {
      todayProject: today.project || 0,
      todayCompany: today.company || 0,
      todayAll: (today.project || 0) + (today.company || 0),
      weekAll: week.company + week.project,
      weekProject: week.project,
    }
  }, [days])

  const projectGoalPct = Math.min(
    100,
    Math.round((totals.todayProject / PROJECT_MINUTES_GOAL) * 100)
  )

  const catCfg = CATEGORIES[category]
  const ringColor =
    phase === 'break'
      ? 'text-emerald-500'
      : category === 'project'
      ? 'text-project-500'
      : 'text-sky-500'

  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">
          <span aria-hidden>⏱️</span> Focus Timer
        </h2>
        {/* Mode toggle */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800">
          {Object.entries(MODES).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setSettings((s) => ({ ...s, pomodoroMode: k }))}
              disabled={running}
              className={`rounded-md px-2.5 py-1 transition-all disabled:opacity-50 ${
                mode === k
                  ? 'bg-white text-project-600 shadow-sm dark:bg-slate-950 dark:text-project-300'
                  : 'text-slate-500'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category picker */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        {Object.entries(CATEGORIES).map(([k, v]) => (
          <button
            key={k}
            onClick={() => !running && setCategory(k)}
            disabled={running}
            className={[
              'flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all',
              category === k
                ? k === 'project'
                  ? 'border-project-400 bg-project-50 text-project-700 ring-1 ring-project-300 dark:bg-project-500/10 dark:text-project-200'
                  : 'border-sky-400 bg-sky-50 text-sky-700 ring-1 ring-sky-300 dark:bg-sky-500/10 dark:text-sky-200'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700',
              running ? 'cursor-not-allowed opacity-60' : '',
            ].join(' ')}
          >
            <span aria-hidden>{v.emoji}</span>
            {v.label}
          </button>
        ))}
      </div>

      {/* Timer readout */}
      <div className="flex flex-col items-center rounded-2xl bg-slate-50 py-6 dark:bg-slate-800/40">
        <div
          className={`text-xs font-bold uppercase tracking-widest ${
            phase === 'break' ? 'text-emerald-500' : ringColor
          }`}
        >
          {phase === 'break' ? '☕ Break' : `${catCfg.emoji} ${catCfg.label}`}
        </div>
        <div className="my-1 font-mono text-6xl font-extrabold tabular-nums tracking-tight">
          {fmt(secondsLeft)}
        </div>
        {/* thin progress bar */}
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              phase === 'break' ? 'bg-emerald-500' : category === 'project' ? 'bg-project-500' : 'bg-sky-500'
            }`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {!running ? (
          <button onClick={start} className="btn-primary flex-1">
            <Play className="h-4 w-4" /> {secondsLeft < phaseTotal ? 'Resume' : 'Start Focus'}
          </button>
        ) : (
          <button onClick={pause} className="btn-ghost flex-1">
            <Pause className="h-4 w-4" /> Pause
          </button>
        )}
        <button onClick={() => setFocusOpen(true)} className="btn-ghost" title="Focus mode">
          <Expand className="h-4 w-4" />
        </button>
        <button onClick={reset} className="btn-ghost" title="Reset">
          <Reset className="h-4 w-4" />
        </button>
      </div>

      {/* Project goal meter */}
      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">
            Today’s project focus
          </span>
          <span className="text-project-600 dark:text-project-300">
            {totals.todayProject} / {PROJECT_MINUTES_GOAL} min
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-project-500 to-project-400 transition-all duration-700"
            style={{ width: `${projectGoalPct}%` }}
          />
        </div>
        {projectGoalPct >= 100 && (
          <div className="mt-1.5 text-center text-xs font-bold text-project-600 dark:text-project-300">
            🎯 Daily project goal smashed!
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/40">
          <div className="text-lg font-extrabold">{totals.todayAll}m</div>
          <div className="text-[11px] font-medium text-slate-400">focused today</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/40">
          <div className="text-lg font-extrabold">
            {(totals.weekAll / 60).toFixed(1)}h
          </div>
          <div className="text-[11px] font-medium text-slate-400">focused this week</div>
        </div>
      </div>

      {focusOpen && (
        <FocusMode
          taskLabel={phase === 'break' ? 'Break' : catCfg.label}
          taskEmoji={phase === 'break' ? '☕' : catCfg.emoji}
          phase={phase}
          category={category}
          timeText={fmt(secondsLeft)}
          progress={progress}
          running={running}
          onToggle={() => (running ? pause() : setRunning(true))}
          onEnd={endFocus}
        />
      )}
    </section>
  )
}
