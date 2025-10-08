import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Server-side Supabase client with cookie handling
export const createSupabaseServerClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Admin client with service role key (for server actions)
export const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types
export interface Profile {
  id: string
  full_name: string | null
  role: 'va' | 'admin'
}

export interface Task {
  id: number
  created_at: string
  title: string
  description: string | null
  status: 'To Do' | 'In Progress' | 'Completed'
  assigned_to_id: string | null
  due_date: string | null
  task_type: 'subreddit_upvote' | 'general'
  target_subreddits: string[] | null
  completed_subreddits: string[] | null
}

export interface Schedule {
  id: number
  va_id: string
  start_time: string
  end_time: string
  notes: string | null
}

export interface AccountCredential {
  id: number
  platform_name: string
  username: string
  encrypted_password: string
}

export interface WorkLog {
  id: number
  created_at: string
  va_id: string
  task_id: number
  notes: string | null
  ip_used: string | null
  redirect_link_created: string | null
}

export interface IpAddress {
  id: number
  ip_address: string
  last_used_by_id: string | null
  last_used_at: string | null
}

export interface TimeTracking {
  id: number
  va_id: string
  clock_in: string
  clock_out: string | null
}

export interface Cookie {
  id: number
  cookie_name: string
  cookie_file_path: string
  created_at: string
  last_used_by_id: string | null
  last_used_at: string | null
  is_active: boolean
}

export interface RedirectLink {
  id: number
  link_url: string
  slug: string
  created_at: string
  last_used_by_id: string | null
  last_used_at: string | null
  is_active: boolean
}

export interface ResourceAssignment {
  id: number
  va_id: string
  ip_address_id: number | null
  cookie_id: number | null
  redirect_link_id: number | null
  assigned_at: string
  returned_at: string | null
  notes: string | null
  assignment_type: string
}
