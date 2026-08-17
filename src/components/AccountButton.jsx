import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from '../utils/toast'
import AuthModal from './AuthModal'
import { User, LogOut, Cloud, Check } from './Icons'

function SyncDot({ status }) {
  const map = {
    synced: { c: 'bg-emerald-500', t: 'Synced to the cloud' },
    syncing: { c: 'bg-amber-500 animate-pulse', t: 'Syncing…' },
    error: { c: 'bg-rose-500', t: 'Sync error — will retry' },
    offline: { c: 'bg-slate-300 dark:bg-slate-600', t: 'Not signed in' },
  }
  const s = map[status] || map.offline
  return <span title={s.t} className={`h-2 w-2 flex-none rounded-full ${s.c}`} />
}

export default function AccountButton() {
  const { user, loading, syncStatus, signOut } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (loading) {
    return <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
  }

  // Signed out → a "Sign in" button that opens the modal.
  if (!user) {
    return (
      <>
        <button onClick={() => setModalOpen(true)} className="btn-ghost h-10 px-3">
          <User className="h-4 w-4" /> <span className="hidden sm:inline">Sign in</span>
        </button>
        {modalOpen && <AuthModal onClose={() => setModalOpen(false)} />}
      </>
    )
  }

  // Signed in → avatar + dropdown.
  const email = user.email || 'Account'
  const initial = email[0]?.toUpperCase() || '?'
  const statusLabel = {
    synced: 'All changes synced',
    syncing: 'Syncing…',
    error: 'Sync error — retrying',
    offline: 'Offline',
  }[syncStatus]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-project-600 text-sm font-extrabold text-white transition hover:bg-project-700"
        title={email}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        {initial}
        <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white p-0.5 dark:bg-slate-950">
          <SyncDot status={syncStatus} />
        </span>
      </button>

      {menuOpen && (
        <div className="animate-slide-up absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Signed in as
            </div>
            <div className="truncate font-bold text-slate-800 dark:text-slate-100">
              {email}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <SyncDot status={syncStatus} /> {statusLabel}
            </div>
          </div>
          <div className="p-1.5">
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
              <Cloud className="h-4 w-4" /> Your data syncs to every device you
              sign in on.
            </div>
            <button
              onClick={async () => {
                setMenuOpen(false)
                await signOut()
                toast('Signed out. Your data stays on this device.', { emoji: '👋' })
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
