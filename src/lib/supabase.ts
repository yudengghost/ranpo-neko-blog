import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Stats and comments will use localStorage fallback.')
}

// Use environment variables if set, otherwise use fallback (no-op client)
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Log once at module init — only runs in browser
if (typeof window !== 'undefined') {
  if (supabase) {
    console.log(`%c[Supabase] Connected %c${supabaseUrl}`,
      'color:#4CAF50', 'color:#888')
  } else {
    console.log('%c[Supabase] Not configured — check .env',
      'color:#FF9800;font-weight:bold')
    console.log('  VITE_SUPABASE_URL:', supabaseUrl || '(missing)')
    console.log('  VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '(set)' : '(missing)')
  }
}

export function getSupabase() {
  return supabase
}
