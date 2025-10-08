-- Simple RLS Fix for Profiles Table
-- The issue: Circular dependency in "Admins can view all profiles" policy
-- The solution: Only allow users to view their own profile via RLS
--               Admin operations should use the service role key (bypasses RLS)

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Keep only the simple policy for users to see their own profile
-- The existing policy "Users can view their own profile" already exists
-- So we don't need to recreate it

-- That's it! Now:
-- 1. All users can see their own profile (via RLS)
-- 2. Admin pages use createSupabaseAdminClient() which bypasses RLS
-- 3. No more circular dependency = no more 500 errors

-- Run this in your Supabase SQL Editor

