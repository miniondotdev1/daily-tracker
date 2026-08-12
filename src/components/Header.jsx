import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { longDate, todayKey } from '../utils/dates'
import { toast } from '../utils/toast'
import ThemeToggle from './ThemeToggle'
import { Download, Trash, Chevron } from './Icons'

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Burning the midnight oil'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 22) return 'Good evening'
  return 'Winding down'
}

export default function Header() {
  const { exportData, importData, clearAll } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const menuRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (importData(data)) {
          toast('Data imported successfully.', { emoji: '📥', tone: 'success' })
        } else {
          toast('Could not read that file.', { emoji: '⚠️' })
        }
      } catch {
        toast('Invalid JSON file.', { emoji: '⚠️' })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-slate-50/80 backdrop-blur-lg dark:border-slate-800/70 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <h1 className="truncate text-lg font-extrabold tracking-tight sm:text-xl">
              Daily Tracker
            </h1>
          </div>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {greeting()} · {longDate(todayKey())}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="btn-ghost h-10 px-3"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              Data <Chevron className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-90' : ''}`} />
            </button>

            {menuOpen && (
              <div className="animate-slide-up absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <button
                  onClick={() => {
                    exportData()
                    setMenuOpen(false)
                    toast('Exported your data as JSON.', { emoji: '💾', tone: 'success' })
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Download className="h-4 w-4 text-slate-500" /> Export JSON
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="rotate-180"><Download className="h-4 w-4 text-slate-500" /></span> Import JSON
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json"
                  onChange={handleImport}
                  className="hidden"
                />
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    setConfirming(true)
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  <Trash className="h-4 w-4" /> Clear all data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm clear */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="animate-pop-in w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-2 text-4xl">⚠️</div>
            <h3 className="text-lg font-bold">Clear all data?</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              This permanently erases every day, milestone, badge and setting from
              this browser. Consider exporting first. This cannot be undone.
            </p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setConfirming(false)} className="btn-ghost flex-1">
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAll()
                  setConfirming(false)
                  toast('All data cleared. Fresh start!', { emoji: '🧹' })
                }}
                className="btn flex-1 bg-rose-600 text-white hover:bg-rose-700"
              >
                Clear everything
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
