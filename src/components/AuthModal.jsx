import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Close, Mail, GoogleG, Cloud } from './Icons'

export default function AuthModal({ onClose }) {
  const {
    isSupabaseConfigured,
    signInPassword,
    signUpPassword,
    signInGoogle,
    signInMagicLink,
  } = useAuth()

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null) // { type: 'error'|'success', text }

  const run = async (fn) => {
    setBusy(true)
    setMsg(null)
    try {
      const { error } = (await fn()) || {}
      if (error) setMsg({ type: 'error', text: error.message })
      return !error
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Something went wrong.' })
      return false
    } finally {
      setBusy(false)
    }
  }

  const submitPassword = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    if (mode === 'signup') {
      const ok = await run(() => signUpPassword(email, password))
      if (ok)
        setMsg({
          type: 'success',
          text: 'Account created. Check your email if confirmation is required, then sign in.',
        })
    } else {
      const ok = await run(() => signInPassword(email, password))
      if (ok) onClose()
    }
  }

  const magic = async () => {
    if (!email) {
      setMsg({ type: 'error', text: 'Enter your email first.' })
      return
    }
    const ok = await run(() => signInMagicLink(email))
    if (ok)
      setMsg({ type: 'success', text: `Magic link sent to ${email}. Check your inbox.` })
  }

  const google = () => run(() => signInGoogle()) // redirects away

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in"
      onMouseDown={onClose}
    >
      <div
        className="animate-pop-in w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-extrabold">
              <span className="text-2xl">🎯</span>
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Sync your progress across every device.
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

        {!isSupabaseConfigured ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <div className="mb-1 flex items-center gap-2 font-bold">
              <Cloud className="h-4 w-4" /> Cloud sync not set up yet
            </div>
            Accounts need a free Supabase project. Add your{' '}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-500/20">
              VITE_SUPABASE_URL
            </code>{' '}
            and{' '}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-500/20">
              VITE_SUPABASE_ANON_KEY
            </code>{' '}
            (see <b>SUPABASE_SETUP.md</b>), then reload. Until then your data
            stays saved locally in this browser.
          </div>
        ) : (
          <>
            {/* Google */}
            <button
              onClick={google}
              disabled={busy}
              className="mb-3 flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <GoogleG className="text-lg" /> Continue with Google
            </button>

            <div className="my-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              or
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Email + password */}
            <form onSubmit={submitPassword} className="space-y-2.5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                className="input"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="input"
              />
              <button type="submit" disabled={busy} className="btn-primary w-full">
                {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            {/* Magic link */}
            <button
              onClick={magic}
              disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold text-project-600 transition hover:bg-project-50 disabled:opacity-50 dark:text-project-300 dark:hover:bg-project-500/10"
            >
              <Mail className="h-4 w-4" /> Email me a magic link instead
            </button>

            {msg && (
              <div
                className={`mt-3 rounded-xl px-3 py-2 text-xs font-medium ${
                  msg.type === 'error'
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                }`}
              >
                {msg.text}
              </div>
            )}

            <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
              {mode === 'signin' ? (
                <>
                  New here?{' '}
                  <button
                    onClick={() => {
                      setMode('signup')
                      setMsg(null)
                    }}
                    className="font-bold text-project-600 dark:text-project-300"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('signin')
                      setMsg(null)
                    }}
                    className="font-bold text-project-600 dark:text-project-300"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
