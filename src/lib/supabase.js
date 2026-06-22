import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn('[Algodeck] Supabase env vars missing — running in offline mode (localStorage only)')
}

export const supabase = url && key ? createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
}) : null

export const isSupabaseEnabled = () => supabase !== null