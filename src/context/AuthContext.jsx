import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import { supabase, isSupabaseConfigured, DATA_TABLE } from '../lib/supabase'
import {
  SYNC_KEYS,
  readLocalBlob,
  writeLocalBlob,
  mergeBlobs,
  blobHash,
} from '../lib/sync'

const AuthContext = createContext(null)

const redirectTo =
  typeof window !== 'undefined' ? window.location.origin : undefined

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  // 'offline' (not signed in) | 'syncing' | 'synced' | 'error'
  const [syncStatus, setSyncStatus] = useState('offline')

  const lastSyncedHash = useRef('') // guards against push/pull echo loops
  const pushTimer = useRef(null)

  // ---- Session bootstrap -------------------------------------------------
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // ---- Cloud helpers -----------------------------------------------------
  const pullCloud = useCallback(async (uid) => {
    const { data, error } = await supabase
      .from(DATA_TABLE)
      .select('data')
      .eq('user_id', uid)
      .maybeSingle()
    if (error) throw error
    return data?.data || null
  }, [])

  const pushCloud = useCallback(async (uid, blob) => {
    const { error } = await supabase.from(DATA_TABLE).upsert(
      {
        user_id: uid,
        data: blob,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    if (error) throw error
  }, [])

  // ---- Initial reconcile on login ---------------------------------------
  useEffect(() => {
    if (!supabase || !user) {
      setSyncStatus('offline')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        setSyncStatus('syncing')
        const cloud = await pullCloud(user.id)
        const local = readLocalBlob()
        const merged = mergeBlobs(local, cloud || {})
        if (cancelled) return
        writeLocalBlob(merged) // updates the UI everywhere
        await pushCloud(user.id, merged) // seed / reconcile the cloud copy
        lastSyncedHash.current = blobHash(merged)
        if (!cancelled) setSyncStatus('synced')
      } catch (err) {
        console.warn('Initial sync failed', err)
        if (!cancelled) setSyncStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, pullCloud, pushCloud])

  // ---- Push local changes up (debounced) --------------------------------
  useEffect(() => {
    if (!supabase || !user) return

    const schedulePush = () => {
      if (pushTimer.current) clearTimeout(pushTimer.current)
      pushTimer.current = setTimeout(async () => {
        const blob = readLocalBlob()
        const hash = blobHash(blob)
        if (hash === lastSyncedHash.current) return // nothing new
        try {
          setSyncStatus('syncing')
          await pushCloud(user.id, blob)
          lastSyncedHash.current = hash
          setSyncStatus('synced')
        } catch (err) {
          console.warn('Push failed', err)
          setSyncStatus('error')
        }
      }, 1200)
    }

    const onLocalChange = (e) => {
      if (e.detail && !SYNC_KEYS.includes(e.detail.key)) return
      if (e.key && !SYNC_KEYS.includes(e.key)) return
      schedulePush()
    }

    window.addEventListener('local-storage', onLocalChange)
    window.addEventListener('storage', onLocalChange)
    return () => {
      window.removeEventListener('local-storage', onLocalChange)
      window.removeEventListener('storage', onLocalChange)
      if (pushTimer.current) clearTimeout(pushTimer.current)
    }
  }, [user, pushCloud])

  // ---- Live pull from other devices (realtime) --------------------------
  useEffect(() => {
    if (!supabase || !user) return
    const channel = supabase
      .channel(`user_data_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: DATA_TABLE,
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const incoming = payload.new?.data
          if (!incoming) return
          if (blobHash(incoming) === lastSyncedHash.current) return // our echo
          const merged = mergeBlobs(readLocalBlob(), incoming)
          writeLocalBlob(merged)
          lastSyncedHash.current = blobHash(merged)
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Also pull when the tab regains focus (cheap cross-device catch-up).
  useEffect(() => {
    if (!supabase || !user) return
    const onFocus = async () => {
      try {
        const cloud = await pullCloud(user.id)
        if (!cloud) return
        if (blobHash(cloud) === lastSyncedHash.current) return
        const merged = mergeBlobs(readLocalBlob(), cloud)
        writeLocalBlob(merged)
        lastSyncedHash.current = blobHash(merged)
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [user, pullCloud])

  // ---- Auth methods ------------------------------------------------------
  const notConfigured = {
    error: { message: 'Cloud accounts aren’t configured yet. See SUPABASE_SETUP.md.' },
  }

  const signUpPassword = useCallback(async (email, password) => {
    if (!supabase) return notConfigured
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    })
    return { data, error }
  }, [])

  const signInPassword = useCallback(async (email, password) => {
    if (!supabase) return notConfigured
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }, [])

  const signInGoogle = useCallback(async () => {
    if (!supabase) return notConfigured
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    return { data, error }
  }, [])

  const signInMagicLink = useCallback(async (email) => {
    if (!supabase) return notConfigured
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    return { data, error }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    lastSyncedHash.current = ''
    setSyncStatus('offline')
    // Local data is left in place so the app keeps working offline.
  }, [])

  const value = {
    isSupabaseConfigured,
    user,
    loading,
    syncStatus,
    signUpPassword,
    signInPassword,
    signInGoogle,
    signInMagicLink,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
