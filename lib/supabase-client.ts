import { createBrowserClient } from '@supabase/ssr'

// Client-side Supabase client (for use in 'use client' components)
// Uses cookies for session storage so server can read the session
export const createSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

