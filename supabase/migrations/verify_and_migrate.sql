-- ===========================================================================
-- VERIFICATION AND MIGRATION SCRIPT
-- ===========================================================================
-- This script will:
-- 1. Verify the tasks table exists
-- 2. Add the completed_subreddits COLUMN (not a table) to the tasks table
-- 3. Add the necessary permissions
-- ===========================================================================

-- First, let's verify the tasks table exists
-- If this fails, you need to run the main schema.sql first
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
        RAISE EXCEPTION 'ERROR: The tasks table does not exist. Please run the main schema.sql file first.';
    END IF;
END $$;

-- The tasks table exists, so now add the completed_subreddits COLUMN
-- Note: This is a COLUMN, not a new table!
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS completed_subreddits JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document what this column is for
COMMENT ON COLUMN public.tasks.completed_subreddits IS 'Array of subreddit names that have been posted to for this task';

-- Add the RLS policy to allow VAs to update this column
DROP POLICY IF EXISTS "VAs can update completed_subreddits of assigned tasks" ON public.tasks;

CREATE POLICY "VAs can update completed_subreddits of assigned tasks" ON public.tasks
  FOR UPDATE 
  USING (assigned_to_id = auth.uid())
  WITH CHECK (assigned_to_id = auth.uid());

-- Verify the column was added successfully
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'completed_subreddits'
    ) THEN
        RAISE NOTICE '✓ SUCCESS: completed_subreddits column added to tasks table';
    ELSE
        RAISE EXCEPTION '✗ ERROR: Failed to add completed_subreddits column';
    END IF;
END $$;

-- ===========================================================================
-- Migration Complete!
-- ===========================================================================
-- The completed_subreddits COLUMN has been added to the tasks TABLE
-- You should see a success message above
-- ===========================================================================

