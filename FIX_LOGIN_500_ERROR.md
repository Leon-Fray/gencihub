# Fix 500 Error on Login - RLS Policy Issue

## Problem

When trying to log in, you get a 500 error from Supabase:
```
GET https://otvfvyklyxgnrktvmban.supabase.co/rest/v1/profiles?select=role&id=eq.943490ad-141f-4a7b-9fca-7ec9c3486074 500 (Internal Server Error)
```

## Root Cause

The Row Level Security (RLS) policy `"Admins can view all profiles"` has a **circular dependency**:

```sql
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles  -- This query is ALSO subject to RLS!
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

When the policy tries to check if you're an admin, it queries the `profiles` table, but that query itself is blocked by RLS, creating an infinite loop that results in a 500 error.

## Solution

Run the SQL script to remove the problematic policy. The app will work correctly because:

1. Users can still view their own profile (via the `"Users can view their own profile"` policy)
2. Admin pages already use `createSupabaseAdminClient()` which bypasses RLS entirely

## Steps to Fix

### 1. Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**

### 2. Run This SQL

Copy and paste this into the SQL editor:

```sql
-- Remove the problematic RLS policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
```

### 3. Click "Run" or Press Ctrl+Enter

That's it! The 500 error should be fixed.

## Why This Works

### Before (Broken):
1. User logs in
2. App tries to fetch profile with RLS enabled
3. RLS policy checks if user is admin by querying profiles table
4. That query is also blocked by RLS → **500 ERROR**

### After (Fixed):
1. User logs in
2. App fetches profile → ✅ "Users can view their own profile" policy allows it
3. Profile data returned successfully
4. App redirects to correct dashboard based on role

## Verification

After running the SQL:

1. Try logging in again
2. You should successfully log in
3. Check browser console - you should see:
   ```
   HomePage: Sign in successful
   Admin Layout - Session: Found
   Admin Layout - Profile: {role: 'admin'}
   ```
4. No more 500 errors!

## For Admin Operations

Admin pages are already configured to use `createSupabaseAdminClient()` which bypasses RLS, so they can still:
- View all users
- View all profiles
- Manage all data

This is already set up in:
- `app/admin/users/page.tsx`
- `app/admin/tasks/page.tsx`
- `app/admin/page.tsx`
- And other admin pages

## Alternative: If You Want to Keep the Policy

If you need the RLS policy for some reason, you can use this more complex version:

```sql
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins and self can view profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR  -- Users can see their own profile
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );
```

But the simpler solution (just drop the policy) is recommended.

## Need Help?

If you still see 500 errors after running the SQL, check:

1. **Supabase logs**: Dashboard → Logs → check for errors
2. **Browser console**: Look for detailed error messages
3. **Network tab**: Check the failed request for more details
4. **Server console**: Check your Next.js terminal for logs

The logs will show exactly which query is failing and why.

