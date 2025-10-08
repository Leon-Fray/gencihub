import { createClient } from '@supabase/supabase-js'

// Browser-side Supabase client
export const createSupabaseBrowserClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

