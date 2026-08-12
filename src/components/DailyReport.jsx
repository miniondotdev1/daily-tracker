import { useState } from 'react'
import { useApp, submissionEntries } from '../context/AppContext'
import { copyText } from '../utils/clipboard'
import { buildDayReport } from '../utils/report'
import { toast } from '../utils/toast'
import { Copy, Check, Clock } from './Icons'

// A single, copyable end-of-day report that pulls together everything the user
// submitted and did. One click to copy the whole thing (e.g. into a journal or
// a standup update).
export default function DailyReport({ dateKey }) {
  const { getDay } = useApp()
  const record = getDay(dateKey)
  const [copied, setCopied] = useState(false)

  const company = submissionEntries(record.submissions?.company)
  const project = submissionEntries(record.submissions?.project)
  const reading = record.reading?.submittedAt ? record.reading : null

  const items = [
    {
      key: 'company',
      label: 'Company work',
      emoji: '💼',
      done: company.length > 0,
      badge: company.length,
    },
    {
      key: 'project',
      label: 'Project work',
      emoji: '🚀',
      done: project.length > 0,
      badge: project.length,
    },
    { key: 'reading', label: 'Reading summary', emoji: '📚', done: Boolean(reading), badge: 0 },
  ]
  const submittedCount = items.filter((i) => i.done).length

  const doCopy = async () => {
    const ok = await copyText(buildDayReport(record, dateKey))
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
      toast('Full daily report copied.', { emoji: '📋', tone: 'success' })
    }
  }

  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="section-title">
          <span aria-hidden>📄</span> Daily Report
        </h2>
        <span className="text-xs font-semibold text-slate-400">
          {submittedCount}/3 submitted
        </span>
      </div>

      <div className="space-y-2">
        {items.map((i) => (
          <div
            key={i.key}
            className={`flex items-center gap-3 rounded-xl border p-2.5 ${
              i.done
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <span
              className={`flex h-7 w-7 flex-none items-center justify-center rounded-full ${
                i.done
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
              }`}
            >
              {i.done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Clock className="h-4 w-4" />}
            </span>
            <span className="text-lg">{i.emoji}</span>
            <span className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {i.label}
            </span>
            <span
              className={`text-xs font-bold ${
                i.done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
              }`}
            >
              {i.done
                ? i.badge > 0
                  ? `${i.badge}× submitted`
                  : 'Submitted'
                : 'Pending'}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={doCopy}
        className="btn-ghost mt-4 w-full"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copied!' : 'Copy full daily report'}
      </button>
    </section>
  )
}
