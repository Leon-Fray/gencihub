-- Cleanup script to drop all existing tables and policies
-- Run this before applying the updated schema.sql

-- Drop policies first (in reverse order of creation)
DROP POLICY IF EXISTS "Admins can manage resource assignments" ON public.resource_assignments;
DROP POLICY IF EXISTS "Admins can view all resource assignments" ON public.resource_assignments;
DROP POLICY IF EXISTS "VAs can create resource assignments" ON public.resource_assignments;
DROP POLICY IF EXISTS "VAs can view their own resource assignments" ON public.resource_assignments;

DROP POLICY IF EXISTS "Admins can manage redirect links" ON public.redirect_links;
DROP POLICY IF EXISTS "VAs can view available redirect links" ON public.redirect_links;

DROP POLICY IF EXISTS "Admins can manage cookies" ON public.cookies;
DROP POLICY IF EXISTS "VAs can view available cookies" ON public.cookies;

DROP POLICY IF EXISTS "Admins can view all time tracking" ON public.time_tracking;
DROP POLICY IF EXISTS "VAs can manage their own time tracking" ON public.time_tracking;

DROP POLICY IF EXISTS "Admins can manage IP addresses" ON public.ip_addresses;
DROP POLICY IF EXISTS "VAs can view IP addresses" ON public.ip_addresses;

DROP POLICY IF EXISTS "Admins can view all work logs" ON public.work_logs;
DROP POLICY IF EXISTS "VAs can create work logs" ON public.work_logs;
DROP POLICY IF EXISTS "VAs can view their own work logs" ON public.work_logs;

DROP POLICY IF EXISTS "Admins can manage credentials" ON public.account_credentials;

DROP POLICY IF EXISTS "Admins can manage all schedules" ON public.schedules;
DROP POLICY IF EXISTS "VAs can view their own schedules" ON public.schedules;

DROP POLICY IF EXISTS "Admins can manage tasks" ON public.tasks;
DROP POLICY IF EXISTS "VAs can view assigned tasks" ON public.tasks;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Drop tables (in reverse order of creation due to foreign key constraints)
DROP TABLE IF EXISTS public.resource_assignments;
DROP TABLE IF EXISTS public.redirect_links;
DROP TABLE IF EXISTS public.cookies;
DROP TABLE IF EXISTS public.time_tracking;
DROP TABLE IF EXISTS public.ip_addresses;
DROP TABLE IF EXISTS public.work_logs;
DROP TABLE IF EXISTS public.account_credentials;
DROP TABLE IF EXISTS public.schedules;
DROP TABLE IF EXISTS public.tasks;
DROP TABLE IF EXISTS public.profiles;

-- Note: We don't drop auth.users as it's managed by Supabase Auth
-- You may want to clean up any test users you created manually
