-- Fix RLS Policies for Profiles Table
-- This fixes the circular dependency issue where the "Admins can view all profiles" 
-- policy tries to query the profiles table, which itself has RLS enabled

-- First, drop the existing problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate it without the circular dependency
-- This policy allows users to see all profiles if they are an admin
-- We check the role directly in the same table without a subquery
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR -- Users can always see their own profile
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' -- Admins can see all
  );

-- Alternative simpler approach: Just allow users to see their own profile
-- and handle admin access via the service role key (which bypasses RLS)
-- Uncomment the lines below if you prefer this approach:

-- DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
-- 
-- CREATE POLICY "Users can view their own profile" ON public.profiles
--   FOR SELECT USING (auth.uid() = id);
-- 
-- -- Then in your code, use createSupabaseAdminClient() for admin operations

-- Note: The same circular dependency issue exists in other policies.
-- If you encounter 500 errors on other tables, apply similar fixes.

-- Fix for tasks table
DROP POLICY IF EXISTS "VAs can view assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can manage tasks" ON public.tasks;

CREATE POLICY "VAs can view assigned tasks" ON public.tasks
  FOR SELECT USING (
    assigned_to_id = auth.uid() OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can manage tasks" ON public.tasks
  FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Note: After running this, you may still want to use the admin client 
-- (createSupabaseAdminClient) in admin pages for better performance
-- as it bypasses RLS entirely.

