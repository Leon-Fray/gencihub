# Quick Migration Guide

## The Issue
You're seeing "task not found" because the `completed_subreddits` column doesn't exist in your database yet.

## Solution - Apply Database Migrations

### Option 1: Using Supabase Dashboard (Recommended - Easiest)

1. **Go to your Supabase project**:
   - Open https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migration 1** (Add Column):
   - Copy this SQL:
   ```sql
   -- Add completed_subreddits column to tasks table
   ALTER TABLE public.tasks 
   ADD COLUMN IF NOT EXISTS completed_subreddits JSONB DEFAULT '[]'::jsonb;

   COMMENT ON COLUMN public.tasks.completed_subreddits IS 'Array of subreddit names that have been posted to for this task';
   ```
   - Paste it into the SQL Editor
   - Click "Run" or press `Ctrl+Enter`

4. **Run Migration 2** (Add RLS Policy):
   - Create another new query
   - Copy this SQL:
   ```sql
   -- Allow VAs to update completed_subreddits field of their assigned tasks
   DROP POLICY IF EXISTS "VAs can update completed_subreddits of assigned tasks" ON public.tasks;
   
   CREATE POLICY "VAs can update completed_subreddits of assigned tasks" ON public.tasks
     FOR UPDATE 
     USING (assigned_to_id = auth.uid())
     WITH CHECK (assigned_to_id = auth.uid());
   ```
   - Paste it into the SQL Editor
   - Click "Run" or press `Ctrl+Enter`

5. **Verify**:
   - Go to "Table Editor" → "tasks" table
   - Check that you see a new column called `completed_subreddits`
   - It should show as `JSONB` type

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to your project directory
cd C:\Users\leonf\Desktop\api\nextProjects\vaHub

# Apply migrations
supabase db push
```

## Test the Feature

After applying the migrations:

1. Refresh your browser page
2. Click "Mark as Posted" on any subreddit
3. You should now see:
   - The subreddit card turns green
   - A checkmark icon appears
   - The progress counter updates (e.g., 1/3)
   - The progress bar fills accordingly

## Troubleshooting

### Still seeing errors?
- Check browser console (F12) for detailed error messages
- Verify both migrations were successfully applied
- Try hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

### Wrong permissions?
Make sure you're logged in as the VA that the task is assigned to.

