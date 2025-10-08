# 🔧 Migration Fix Guide

## ⚠️ Important Clarification

**We are NOT creating a new table!** We are adding a **column** to the existing `tasks` table.

Think of it like this:
- **Table** = A spreadsheet (like your `tasks` table)
- **Column** = A new column in that spreadsheet (like adding a new column called `completed_subreddits`)

## 📋 Step-by-Step Fix

### Step 1: Check What You Have

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Create a **New Query**
3. Copy and paste this entire script:

```sql
-- Check if tasks table exists
SELECT 
    'tasks table' as check_item,
    CASE 
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks')
        THEN '✓ EXISTS' 
        ELSE '✗ MISSING - Run schema.sql first!'
    END as status;

-- Show all columns in the tasks table (if it exists)
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tasks'
ORDER BY ordinal_position;
```

4. Click **"Run"**

### Step 2: Interpret Results

**If you see the tasks table and its columns:**
- ✅ Good! Proceed to Step 3

**If you see "MISSING" or no columns:**
- ❌ You need to create the tasks table first
- Go to `supabase/schema.sql` in your project
- Run that entire file in the SQL Editor first
- Then come back to this guide

### Step 3: Add the Column (Not a Table!)

1. In **SQL Editor**, create a **New Query**
2. Copy and paste this:

```sql
-- Add completed_subreddits COLUMN to the tasks TABLE
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS completed_subreddits JSONB DEFAULT '[]'::jsonb;

-- Add permissions for VAs to update this column
DROP POLICY IF EXISTS "VAs can update completed_subreddits of assigned tasks" ON public.tasks;

CREATE POLICY "VAs can update completed_subreddits of assigned tasks" ON public.tasks
  FOR UPDATE 
  USING (assigned_to_id = auth.uid())
  WITH CHECK (assigned_to_id = auth.uid());

-- Verify it worked
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'tasks' 
            AND column_name = 'completed_subreddits'
        )
        THEN '✓ SUCCESS: Column added!'
        ELSE '✗ FAILED: Column not added'
    END as result;
```

3. Click **"Run"**
4. You should see: `✓ SUCCESS: Column added!`

### Step 4: Verify in Table Editor

1. Go to **Table Editor** → **tasks** table
2. Scroll through the columns
3. You should now see a new column called **completed_subreddits**
4. It should show type: **JSONB**

### Step 5: Test the Feature

1. Refresh your app in the browser (Ctrl + Shift + R for hard refresh)
2. Go to a Subreddit Upvote Task
3. Click **"Mark as Posted"** on a subreddit
4. It should now work! ✨

## 🐛 Troubleshooting

### Error: "table tasks does not exist"

This means you haven't created the main database schema yet.

**Fix:**
1. Go to `supabase/schema.sql`
2. Copy the entire file contents
3. Run it in SQL Editor
4. Then run the migration again

### Error: "column already exists"

This is actually fine! It means the column was already added. Just refresh your app.

### Still not working?

Check these:
1. Are you logged in as a VA user?
2. Is the task assigned to you?
3. Did you hard refresh the browser? (Ctrl + Shift + R)
4. Check browser console (F12) for error messages

## 📊 What's Being Changed

**BEFORE:**
```
tasks table:
├── id
├── title
├── description
├── status
├── assigned_to_id
├── due_date
├── task_type
└── target_subreddits
```

**AFTER:**
```
tasks table:
├── id
├── title
├── description
├── status
├── assigned_to_id
├── due_date
├── task_type
├── target_subreddits
└── completed_subreddits  ← NEW COLUMN (not a new table!)
```

## 💡 Summary

- ❌ We are NOT creating a `completed_subreddits` table
- ✅ We ARE adding a `completed_subreddits` column to the `tasks` table
- 📝 This column will store an array of subreddit names that have been posted to
- 🔒 VAs can only update this column for tasks assigned to them

