-- ===========================================================================
-- Combined Migrations for Subreddit Tracking Feature
-- ===========================================================================
-- Run this entire file in your Supabase SQL Editor to apply all migrations
-- This is safe to run multiple times (idempotent)
-- ===========================================================================

-- STEP 1: Add completed_subreddits column to tasks table
-- This column tracks which subreddits have been posted to for each task
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS completed_subreddits JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.tasks.completed_subreddits IS 'Array of subreddit names that have been posted to for this task';

-- STEP 2: Add RLS policy to allow VAs to update completed_subreddits
-- This allows VAs to mark subreddits as posted for their assigned tasks
DROP POLICY IF EXISTS "VAs can update completed_subreddits of assigned tasks" ON public.tasks;

CREATE POLICY "VAs can update completed_subreddits of assigned tasks" ON public.tasks
  FOR UPDATE 
  USING (assigned_to_id = auth.uid())
  WITH CHECK (assigned_to_id = auth.uid());

-- ===========================================================================
-- Migration Complete!
-- ===========================================================================
-- You can now use the "Mark as Posted" feature in the Target Subreddits list
-- ===========================================================================

