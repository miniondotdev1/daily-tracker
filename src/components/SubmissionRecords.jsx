import { useState, useMemo } from 'react'
import { useApp, submissionEntries } from '../context/AppContext'
import { copyText } from '../utils/clipboard'
import { toast } from '../utils/toast'
import { longDate, prettyDate } from '../utils/dates'
import { Copy, Check, Lock, Bolt } from './Icons'

const META = {
  company: { label: 'Company', emoji: '💼', accent: 'sky' },
  project: { label: 'Project', emoji: '🚀', accent: 'project' },
  reading: { label: 'Reading', emoji: '📖', accent: 'rose' },
}

const ACCENT = {
  sky: {
    activeText: 'text-sky-600 dark:text-sky-300',
    bar: 'bg-sky-500',
    soft: 'bg-sky-50 dark:bg-sky-500/10',
    chip: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  },
  project: {
    activeText: 'text-project-600 dark:text-project-300',
    bar: 'bg-project-500',
    soft: 'bg-project-50 dark:bg-project-500/10',
    chip: 'bg-project-100 text-project-700 dark:bg-project-500/20 dark:text-project-300',
  },
  rose: {
    activeText: 'text-rose-600 dark:text-rose-300',
    bar: 'bg-rose-500',
    soft: 'bg-rose-50 dark:bg-rose-500/10',
    chip: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  },
}

function timeOf(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// Turn each category's stored data into a uniform list of display entries,
// tagged with their category and original 1-based order.
function useRecords(dateKey) {
  const { getDay } = useApp()
  const record = getDay(dateKey)
  return useMemo(() => {
    const company = submissionEntries(record.submissions?.company).map((e, i) => ({
      ...e,
      cat: 'company',
      ord: i + 1,
    }))
    const project = submissionEntries(record.submissions?.project).map((e, i) => ({
      ...e,
      cat: 'project',
      ord: i + 1,
    }))
    const r = record.reading?.submittedAt ? record.reading : null
    const reading = r
      ? [
          {
            id: 'reading',
            cat: 'reading',
            ord: 1,
            submittedAt: r.submittedAt,
            text: r.summary,
            pages: r.pages,
            topic: r.topic,
          },
        ]
      : []
    const all = [...company, ...project, ...reading].sort(
      (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
    )
    return { company, project, reading, latest: all[0] || null }
  }, [record])
}

function buildCopy(entry, dateKey) {
  const m = META[entry.cat]
  if (entry.cat === 'reading') {
    return (
      `${m.emoji} Reading — ${longDate(dateKey)} ${timeOf(entry.submittedAt)}\n` +
      `Pages: ${entry.pages || 0} · Topic: ${entry.topic || '—'}\n\n${entry.text}`
    )
  }
  return (
    `${m.emoji} ${m.label} #${entry.ord} — ${longDate(dateKey)} ${timeOf(entry.submittedAt)}\n` +
    `Tasks: ${entry.count || 0}\n\n${entry.text}`
  )
}

function EntryCard({ entry, dateKey }) {
  const m = META[entry.cat]
  const a = ACCENT[m.accent]
  const [copied, setCopied] = useState(false)

  const doCopy = async () => {
    if (await copyText(buildCopy(entry, dateKey))) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
      toast('Copied to clipboard.', { emoji: '📋' })
    }
  }

  return (
    <div className={`animate-slide-up rounded-xl ${a.soft} p-3`}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${a.chip}`}>
            {entry.cat === 'reading' ? 'Summary' : `#${entry.ord}`}
          </span>
          <span className="inline-flex items-center gap-1">
            <Lock className="h-3 w-3" /> {prettyDate(dateKey)} · {timeOf(entry.submittedAt)}
          </span>
          {entry.cat === 'reading' ? (
            <span>· {entry.pages || 0} pages{entry.topic ? ` · ${entry.topic}` : ''}</span>
          ) : (
            <span>· {entry.count || 0} {entry.count === 1 ? 'task' : 'tasks'}</span>
          )}
        </div>
        <button
          onClick={doCopy}
          className="inline-flex flex-none items-center gap-1 rounded-lg bg-white/70 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-white dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {entry.text}
      </p>
    </div>
  )
}

export default function SubmissionRecords({ dateKey }) {
  const { company, project, reading, latest } = useRecords(dateKey)
  const lists = { company, project, reading }

  // Default to the category of the most recent update, else Company.
  const [tab, setTab] = useState(latest?.cat || 'company')

  const active = lists[tab] || []
  const newestFirst = [...active].reverse() // latest entry on top

  return (
    <section className="card p-4 sm:p-5">
      <h2 className="section-title mb-3">
        <span aria-hidden>🗄️</span> Records
      </h2>

      {/* Latest update — always at the top */}
      {latest ? (
        <button
          onClick={() => setTab(latest.cat)}
          className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-3 text-left transition hover:shadow-sm dark:border-slate-800 dark:from-slate-800/60 dark:to-slate-900"
        >
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white text-xl shadow-sm dark:bg-slate-900">
            {META[latest.cat].emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <Bolt className="h-3 w-3" /> Latest update · {META[latest.cat].label} ·{' '}
              {timeAgo(latest.submittedAt)}
            </div>
            <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {latest.text}
            </div>
          </div>
        </button>
      ) : (
        <div className="mb-3 rounded-2xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400 dark:border-slate-700">
          Nothing submitted yet today. Your latest update will appear here.
        </div>
      )}

      {/* 3 tabs */}
      <div className="mb-3 flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {['company', 'project', 'reading'].map((key) => {
          const m = META[key]
          const a = ACCENT[m.accent]
          const n = lists[key].length
          const activeTab = tab === key
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all ${
                activeTab
                  ? `bg-white shadow-sm dark:bg-slate-950 ${a.activeText}`
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
              {n > 0 && (
                <span className={`rounded-full px-1.5 text-[11px] font-bold ${a.chip}`}>
                  {n}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Records list, newest first */}
      {newestFirst.length > 0 ? (
        <div className="space-y-2">
          {newestFirst.map((entry) => (
            <EntryCard key={entry.id} entry={entry} dateKey={dateKey} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400 dark:border-slate-700">
          No {META[tab].label} submissions yet today.
          <br />
          Use the form on the left to record one.
        </div>
      )}
    </section>
  )
}
