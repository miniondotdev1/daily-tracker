import { createClient } from '@supabase/supabase-js'

// Cloud sync is OPTIONAL. If the two env vars aren't set, the app runs exactly
// as before — pure localStorage, no accounts. Add the keys (see
// SUPABASE_SETUP.md) to switch cloud accounts on.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // completes OAuth / magic-link redirects
      },
    })
  : null

// The single row per user stores the whole tracker blob as JSONB.
export const DATA_TABLE = 'user_data'
