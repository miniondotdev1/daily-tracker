import { useApp } from '../context/AppContext'
import { BLOCK_TYPES } from '../constants/schedule'
import { toast } from '../utils/toast'
import { Close, Plus, Trash, Chevron, Star, Clock } from './Icons'

const TYPE_OPTIONS = Object.entries(BLOCK_TYPES).map(([key, v]) => ({
  key,
  label: v.label,
  emoji: v.emoji,
}))

export default function ScheduleEditor({ onClose }) {
  const {
    schedule,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    sortSchedule,
    resetSchedule,
  } = useApp()

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-sm animate-fade-in sm:p-6"
      onMouseDown={onClose}
    >
      <div
        className="animate-pop-in my-4 w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-slate-100 bg-white/90 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <span className="text-2xl">🗓️</span> Edit schedule
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reorder, retime, rename, add or remove tasks. Changes save
              instantly.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <Close className="h-5 w-5" />
          </button>
        </div>

        {/* Blocks */}
        <div className="space-y-3 p-4 sm:p-5">
          {schedule.map((block, i) => {
            const type = BLOCK_TYPES[block.type] || BLOCK_TYPES.routine
            return (
              <div
                key={block.id}
                className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800"
              >
                {/* Title */}
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800">
                    {i + 1}
                  </span>
                  <input
                    value={block.title}
                    onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                    placeholder="Task name"
                    className="input flex-1"
                  />
                </div>

                {/* Time + type */}
                <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <label className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-2 dark:border-slate-700">
                    <Clock className="h-4 w-4 flex-none text-slate-400" />
                    <input
                      type="time"
                      value={block.start}
                      onChange={(e) => updateBlock(block.id, { start: e.target.value })}
                      className="w-full bg-transparent py-2 text-sm font-semibold outline-none"
                    />
                  </label>
                  <label className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-2 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-400">to</span>
                    <input
                      type="time"
                      value={block.end}
                      onChange={(e) => updateBlock(block.id, { end: e.target.value })}
                      className="w-full bg-transparent py-2 text-sm font-semibold outline-none"
                    />
                  </label>
                  <select
                    value={block.type}
                    onChange={(e) => updateBlock(block.id, { type: e.target.value })}
                    className="input col-span-2 py-2 sm:col-span-2"
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.emoji} {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveBlock(block.id, -1)}
                    disabled={i === 0}
                    className="btn-ghost h-8 px-2 disabled:opacity-30"
                    aria-label="Move up"
                    title="Move up"
                  >
                    <Chevron className="h-4 w-4 -rotate-90" />
                  </button>
                  <button
                    onClick={() => moveBlock(block.id, 1)}
                    disabled={i === schedule.length - 1}
                    className="btn-ghost h-8 px-2 disabled:opacity-30"
                    aria-label="Move down"
                    title="Move down"
                  >
                    <Chevron className="h-4 w-4 rotate-90" />
                  </button>

                  <button
                    onClick={() => updateBlock(block.id, { hero: !block.hero })}
                    className={`btn h-8 px-2.5 ${
                      block.hero
                        ? 'bg-project-100 text-project-700 dark:bg-project-500/20 dark:text-project-300'
                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Mark as the most important task of the day"
                  >
                    <Star className="h-4 w-4" fill={block.hero ? 'currentColor' : 'none'} />
                    <span className="hidden sm:inline">Highlight</span>
                  </button>

                  <span className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{}}>
                    <span aria-hidden>{type.emoji}</span>
                  </span>

                  <button
                    onClick={() => {
                      if (schedule.length <= 1) {
                        toast('Keep at least one task.', { emoji: '⚠️' })
                        return
                      }
                      removeBlock(block.id)
                    }}
                    className="btn h-8 px-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    aria-label="Delete task"
                    title="Delete"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}

          <button onClick={() => addBlock()} className="btn-ghost w-full border border-dashed border-slate-300 dark:border-slate-700">
            <Plus className="h-4 w-4" /> Add task
          </button>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2 rounded-b-3xl border-t border-slate-100 bg-white/90 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex gap-2">
            <button onClick={sortSchedule} className="btn-ghost">
              <Clock className="h-4 w-4" /> Sort by time
            </button>
            <button
              onClick={() => {
                resetSchedule()
                toast('Schedule reset to the default.', { emoji: '↩️' })
              }}
              className="btn-ghost text-slate-500"
            >
              Reset to default
            </button>
          </div>
          <button onClick={onClose} className="btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
