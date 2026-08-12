import { useEffect } from 'react'
import CircularProgress from './CircularProgress'
import { Play, Pause, Close } from './Icons'

// A distraction-free, full-screen overlay showing only the timer, the current
// task, and the controls. Everything else is hidden.
export default function FocusMode({
  taskLabel,
  taskEmoji,
  phase,
  category,
  timeText,
  progress,
  running,
  onToggle,
  onEnd,
}) {
  // Lock body scroll while focus mode is open, and allow Esc to exit.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onEnd()
      if (e.key === ' ') {
        e.preventDefault()
        onToggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onEnd, onToggle])

  const isBreak = phase === 'break'
  const ring = isBreak
    ? 'text-emerald-400'
    : category === 'project'
    ? 'text-project-400'
    : 'text-sky-400'

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 px-6 text-white">
      {/* Ambient glow */}
      <div
        className={`pointer-events-none absolute -top-40 h-96 w-96 rounded-full blur-3xl ${
          isBreak ? 'bg-emerald-500/20' : category === 'project' ? 'bg-project-500/25' : 'bg-sky-500/20'
        }`}
      />

      <button
        onClick={onEnd}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
        aria-label="End focus"
      >
        <Close className="h-5 w-5" />
      </button>

      <div className="mb-8 flex items-center gap-2 text-lg font-semibold text-white/80">
        <span className="text-2xl">{taskEmoji}</span>
        {isBreak ? 'Break — breathe' : taskLabel}
      </div>

      <CircularProgress
        value={progress}
        size={280}
        stroke={12}
        trackClass="text-white/10"
        progressClass={ring}
      >
        <div className="font-mono text-7xl font-extrabold tabular-nums">{timeText}</div>
        <div className="mt-2 text-sm uppercase tracking-widest text-white/40">
          {isBreak ? 'resting' : 'deep focus'}
        </div>
      </CircularProgress>

      <div className="mt-10 flex items-center gap-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-slate-900 transition hover:bg-white/90 active:scale-95"
        >
          {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          {running ? 'Pause' : 'Resume'}
        </button>
        <button
          onClick={onEnd}
          className="rounded-2xl border border-white/20 px-6 py-4 text-lg font-semibold text-white/80 transition hover:bg-white/10"
        >
          End Focus
        </button>
      </div>

      <p className="mt-10 max-w-sm text-center text-sm text-white/40">
        Tip: press <kbd className="rounded bg-white/10 px-1.5 py-0.5">Space</kbd> to
        pause/resume, <kbd className="rounded bg-white/10 px-1.5 py-0.5">Esc</kbd> to
        exit.
      </p>
    </div>
  )
}
