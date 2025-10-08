# Admin Pages RLS Fix

## Problem
Admin pages were unable to fetch VA users from the database when creating tasks. The dropdown showing VAs was empty even though VAs existed in the database.

## Root Cause
The admin pages were using `createSupabaseServerClient()` which respects Row Level Security (RLS) policies. The RLS policy for viewing profiles has the following constraint:

```sql
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

This policy checks if the current user is an admin by querying the profiles table, but that query itself is subject to RLS, which can cause issues with data retrieval.

## Solution
Changed all admin pages to use `createSupabaseAdminClient()` instead of `createSupabaseServerClient()`. The admin client uses the service role key and bypasses RLS policies, which is appropriate for admin-only pages.

## Files Updated
- ✅ `app/admin/page.tsx` (Admin Dashboard)
- ✅ `app/admin/tasks/page.tsx` (Task Management)
- ✅ `app/admin/scheduler/page.tsx` (Scheduler)
- ✅ `app/admin/ips/page.tsx` (IP Management)
- ✅ `app/admin/credentials/page.tsx` (Credentials)
- ℹ️ `app/admin/users/page.tsx` (Already using admin client)
- ℹ️ `app/admin/resources/page.tsx` (Uses mock data, no DB queries)

## Changes Made
```typescript
// Before (incorrect for admin pages)
import { createSupabaseServerClient } from '@/lib/supabase'
const supabase = createSupabaseServerClient()

// After (correct for admin pages)
import { createSupabaseAdminClient } from '@/lib/supabase'
const supabase = createSupabaseAdminClient()
```

## Security Note
Using the admin client is safe in these cases because:
1. These pages are protected by the admin layout authentication check
2. Only users with `role = 'admin'` can access these routes
3. The admin client is only used in server-side components (not exposed to client)
4. All admin actions use server actions which already use the admin client

## Testing
After this fix:
- ✅ Admins can now see all VAs in the task assignment dropdown
- ✅ All admin pages load data correctly without RLS restrictions
- ✅ VA users still only see their own assigned tasks (they use the regular server client)
- ✅ Authentication and authorization still work correctly

