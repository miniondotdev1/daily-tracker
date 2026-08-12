import { useState } from 'react'
import { useApp, submissionEntries } from '../context/AppContext'
import { toast } from '../utils/toast'
import { READING_REWARDS } from '../constants/rewards'
import { Send, Lock, Plus, Book } from './Icons'

const WORK = {
  company: {
    label: 'Company Work',
    emoji: '💼',
    accent: 'sky',
    placeholder: 'What did you just ship for the company? Tasks closed, PRs merged…',
  },
  project: {
    label: 'Personal Project',
    emoji: '🚀',
    accent: 'project',
    placeholder: 'What moved YOUR project forward? Features, fixes, decisions…',
  },
}

function accentClasses(accent) {
  return accent === 'project'
    ? {
        text: 'text-project-700 dark:text-project-200',
        btn: 'bg-project-600 hover:bg-project-700',
        ring: 'focus:ring-project-500/30 focus:border-project-500',
        chip: 'bg-project-100 text-project-700 dark:bg-project-500/20 dark:text-project-300',
      }
    : {
        text: 'text-sky-700 dark:text-sky-200',
        btn: 'bg-sky-600 hover:bg-sky-700',
        ring: 'focus:ring-sky-500/30 focus:border-sky-500',
        chip: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
      }
}

function rewardLine(seed) {
  return READING_REWARDS[Math.abs(seed) % READING_REWARDS.length]
}

// ---- Company / Project editor ---------------------------------------------
function WorkEditor({ category, dateKey }) {
  const { getDay, updateWorkDraft, submitWork } = useApp()
  const cfg = WORK[category]
  const a = accentClasses(cfg.accent)
  const record = getDay(dateKey)
  const draft = record.workDrafts?.[category] || { text: '', count: 0 }
  const text = draft.text || ''
  const count = draft.count || 0
  const recorded = submissionEntries(record.submissions?.[category]).length
  const [confirming, setConfirming] = useState(false)

  const doSubmit = () => {
    if (!text.trim()) return
    submitWork(category)
    setConfirming(false)
    toast(`${cfg.label} entry #${recorded + 1} recorded. +20 pts 🎉`, {
      emoji: '📤',
      tone: category === 'project' ? 'project' : 'success',
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-3.5 dark:border-slate-800">
      <div className="mb-2 flex items-center justify-between">
        <div className={`flex items-center gap-2 font-bold ${a.text}`}>
          <span className="text-lg">{cfg.emoji}</span>
          {cfg.label}
        </div>
        {recorded > 0 && (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${a.chip}`}>
            {recorded} today
          </span>
        )}
      </div>

      <textarea
        value={text}
        onChange={(e) => updateWorkDraft(category, { text: e.target.value })}
        placeholder={cfg.placeholder}
        rows={2}
        className={`input resize-none ${a.ring}`}
      />
      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-2 py-1.5 dark:border-slate-700">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tasks</span>
          <button
            onClick={() => updateWorkDraft(category, { count: Math.max(0, count - 1) })}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-base font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            −
          </button>
          <span className="w-5 text-center text-sm font-bold tabular-nums">{count}</span>
          <button
            onClick={() => updateWorkDraft(category, { count: count + 1 })}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            disabled={!text.trim()}
            className={`btn flex-1 text-white disabled:cursor-not-allowed disabled:opacity-40 ${a.btn}`}
          >
            <Send className="h-4 w-4" /> Submit &amp; record
          </button>
        ) : (
          <div className="flex flex-1 items-center gap-2">
            <button onClick={() => setConfirming(false)} className="btn-ghost flex-1">
              Cancel
            </button>
            <button onClick={doSubmit} className={`btn flex-1 text-white ${a.btn}`}>
              <Lock className="h-4 w-4" /> Lock it in
            </button>
          </div>
        )}
      </div>
      {confirming && (
        <p className="mt-2 text-center text-[11px] font-medium text-amber-600 dark:text-amber-400">
          Permanent once locked (copy-only). Keep adding more all day.
        </p>
      )}
    </div>
  )
}

// ---- Reading editor -------------------------------------------------------
function ReadingEditor({ dateKey }) {
  const { getDay, updateReadingDraft, submitReading } = useApp()
  const record = getDay(dateKey)
  const reading = record.reading || { pages: '', topic: '', summary: '', submittedAt: null }
  const submitted = Boolean(reading.submittedAt)
  const [confirming, setConfirming] = useState(false)

  const doSubmit = () => {
    if (!reading.summary?.trim()) return
    submitReading()
    setConfirming(false)
    toast(rewardLine((reading.summary || '').length + (Number(reading.pages) || 0)), {
      emoji: '🏆',
      tone: 'success',
      duration: 4500,
    })
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-3.5 dark:border-rose-500/30 dark:bg-rose-500/10">
        <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-200">
          <span className="text-lg">📖</span> Reading Log
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            <Lock className="h-3 w-3" /> Done today
          </span>
        </div>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Today’s reading is locked — open the <b>Reading</b> tab on the right to
          read it back or copy it.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-3.5 dark:border-slate-800">
      <div className="mb-2 flex items-center gap-2 font-bold text-rose-700 dark:text-rose-200">
        <span className="text-lg">📖</span> Reading Log
      </div>
      <div className="mb-2 flex gap-2">
        <div className="w-24">
          <input
            value={reading.pages}
            onChange={(e) =>
              updateReadingDraft({ pages: e.target.value.replace(/[^0-9]/g, '') })
            }
            inputMode="numeric"
            placeholder="Pages"
            className="input"
          />
        </div>
        <input
          value={reading.topic}
          onChange={(e) => updateReadingDraft({ topic: e.target.value })}
          placeholder="Topic covered"
          className="input flex-1"
        />
      </div>
      <textarea
        value={reading.summary}
        onChange={(e) => updateReadingDraft({ summary: e.target.value })}
        placeholder="What did you understand? (short summary in your own words)"
        rows={2}
        className="input resize-none"
      />
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          disabled={!reading.summary?.trim()}
          className="btn mt-2 w-full bg-rose-600 text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" /> Submit summary &amp; get rewarded
        </button>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          <button onClick={() => setConfirming(false)} className="btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={doSubmit}
            className="btn flex-1 bg-rose-600 text-white hover:bg-rose-700"
          >
            <Lock className="h-4 w-4" /> Lock &amp; reward me
          </button>
        </div>
      )}
      {confirming && (
        <p className="mt-2 text-center text-[11px] font-medium text-amber-600 dark:text-amber-400">
          One reading summary per day — this locks it in.
        </p>
      )}
    </div>
  )
}

export default function SubmissionForms({ dateKey }) {
  return (
    <section className="card p-4 sm:p-5">
      <h2 className="section-title mb-1">
        <span aria-hidden>➕</span> Submit Work
      </h2>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Log Company &amp; Project work as many times as you like; add one reading
        summary. Everything is recorded on the right.
      </p>
      <div className="space-y-3">
        <WorkEditor category="company" dateKey={dateKey} />
        <WorkEditor category="project" dateKey={dateKey} />
        <ReadingEditor dateKey={dateKey} />
      </div>
    </section>
  )
}
