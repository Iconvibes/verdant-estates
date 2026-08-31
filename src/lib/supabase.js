/**
 * Supabase Client — connects to your Supabase project.
 *
 * Set these env vars in Vercel (Settings → Environment Variables):
 *   VITE_SUPABASE_URL   — your Supabase project URL
 *   VITE_SUPABASE_ANON  — your Supabase anon/public key
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON

if (!supabaseUrl || !supabaseAnon) {
  console.warn(
    '⚠️  Supabase env vars not set. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON in your .env file.',
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnon || '')
