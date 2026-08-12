import { useMemo, useState } from 'react'
import {
  useApp,
  submissionEntries,
  blocksDone,
  completionRatio,
} from '../context/AppContext'
import { SCHEDULE } from '../constants/schedule'
import { longDate, prettyDate, todayKey } from '../utils/dates'
import { copyText } from '../utils/clipboard'
import { buildDayReport } from '../utils/report'
import { toast } from '../utils/toast'
import { Copy, Check, Chevron, Star } from './Icons'

// Does a day hold anything worth archiving?
function dayHasData(rec) {
  if (!rec) return false
  return (
    submissionEntries(rec.submissions?.company).length > 0 ||
    submissionEntries(rec.submissions?.project).length > 0 ||
    Boolean(rec.reading?.submittedAt) ||
    blocksDone(rec) > 0 ||
    Boolean(rec.skill?.trim()) ||
    Boolean(rec.notes?.trim()) ||
    Boolean(rec.focusScore)
  )
}

function timeOf(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function EntryLines({ entries, emoji }) {
  return (
    <div className="space-y-1.5">
      {entries.map((e, i) => (
        <div key={e.id || i} className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/50">
          <div className="mb-0.5 text-[11px] font-semibold text-slate-400">
            {emoji} #{i + 1} · {timeOf(e.submittedAt)} · {e.count || 0}{' '}
            {e.count === 1 ? 'task' : 'tasks'}
          </div>
          <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
            {e.text}
          </div>
        </div>
      ))}
    </div>
  )
}

function DayCard({ dateKey, record, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState(false)

  const company = submissionEntries(record.submissions?.company)
  const project = submissionEntries(record.submissions?.project)
  const reading = record.reading?.submittedAt ? record.reading : null
  const done = blocksDone(record)
  const pct = Math.round(completionRatio(record) * 100)
  const isToday = dateKey === todayKey()

  const doCopy = async () => {
    if (await copyText(buildDayReport(record, dateKey))) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
      toast('Day copied to clipboard.', { emoji: '📋', tone: 'success' })
    }
  }

  const pri = (record.priorities || []).filter((p) => p.trim())

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      {/* Header (click to expand) */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <Chevron
          className={`h-4 w-4 flex-none text-slate-400 transition-transform ${
            open ? 'rotate-90' : ''
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
            {isToday && (
              <span className="rounded-md bg-project-100 px-1.5 py-0.5 text-[11px] font-bold text-project-700 dark:bg-project-500/20 dark:text-project-300">
                Today
              </span>
            )}
            <span className="truncate">{longDate(dateKey)}</span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-semibold text-slate-400">
            <span>
              {done}/{SCHEDULE.length} blocks · {pct}%
            </span>
            {company.length > 0 && <span>💼 {company.length}</span>}
            {project.length > 0 && <span>🚀 {project.length}</span>}
            {reading && <span>📖 {reading.pages || 0}p</span>}
            {record.skill?.trim() && <span>🧠 skill</span>}
            {record.focusScore > 0 && (
              <span className="inline-flex items-center gap-0.5">
                <Star className="h-3 w-3 text-amber-400" fill="currentColor" />
                {record.focusScore}
              </span>
            )}
          </div>
        </div>
        {/* completion ring-ish chip */}
        <span
          className={`flex-none rounded-full px-2.5 py-1 text-xs font-extrabold ${
            pct === 100
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
              : pct >= 60
              ? 'bg-project-100 text-project-700 dark:bg-project-500/20 dark:text-project-300'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
          }`}
        >
          {pct}%
        </span>
      </button>

      {/* Body */}
      {open && (
        <div className="space-y-3 border-t border-slate-100 p-3 dark:border-slate-800">
          {pri.length > 0 && (
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Top priorities
              </div>
              <ol className="list-inside list-decimal text-sm text-slate-700 dark:text-slate-200">
                {pri.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ol>
            </div>
          )}

          {company.length > 0 && (
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-sky-500">
                Company work
              </div>
              <EntryLines entries={company} emoji="💼" />
            </div>
          )}

          {project.length > 0 && (
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-project-500">
                Project work
              </div>
              <EntryLines entries={project} emoji="🚀" />
            </div>
          )}

          {reading && (
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-rose-500">
                Reading · {reading.pages || 0} pages · {reading.topic || 'General'}
              </div>
              <p className="whitespace-pre-wrap rounded-lg bg-rose-50 p-2 text-sm text-slate-700 dark:bg-rose-500/10 dark:text-slate-200">
                {reading.summary}
              </p>
            </div>
          )}

          {record.skill?.trim() && (
            <div className="text-sm">
              <span className="font-semibold text-slate-500 dark:text-slate-400">🧠 Skill: </span>
              <span className="text-slate-700 dark:text-slate-200">{record.skill}</span>
            </div>
          )}
          {record.notes?.trim() && (
            <div className="text-sm">
              <span className="font-semibold text-slate-500 dark:text-slate-400">📝 Notes: </span>
              <span className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                {record.notes}
              </span>
            </div>
          )}

          <button onClick={doCopy} className="btn-ghost w-full">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy this day'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function DailyTracking() {
  const { days } = useApp()

  const dayKeys = useMemo(
    () =>
      Object.keys(days)
        .filter((k) => dayHasData(days[k]))
        .sort()
        .reverse(), // most recent first
    [days]
  )

  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="section-title">
          <span aria-hidden>🗓️</span> Daily Tracking
        </h2>
        {dayKeys.length > 0 && (
          <span className="text-xs font-semibold text-slate-400">
            {dayKeys.length} {dayKeys.length === 1 ? 'day' : 'days'} logged
          </span>
        )}
      </div>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Every finished day is archived here — expand any date to review the work
        you submitted, then copy it if you need it.
      </p>

      {dayKeys.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400 dark:border-slate-700">
          No days tracked yet. Complete blocks and submit work to build your
          history.
        </div>
      ) : (
        <div className="space-y-2.5">
          {dayKeys.map((key, i) => (
            <DayCard
              key={key}
              dateKey={key}
              record={days[key]}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      )}
    </section>
  )
}
