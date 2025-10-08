-- ============================================
-- COPY THIS ENTIRE FILE AND RUN IN SUPABASE
-- ============================================

-- This adds a COLUMN (not a table) to your tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS completed_subreddits JSONB DEFAULT '[]'::jsonb;

-- Add permission for VAs to update it
DROP POLICY IF EXISTS "VAs can update completed_subreddits of assigned tasks" ON public.tasks;

CREATE POLICY "VAs can update completed_subreddits of assigned tasks" ON public.tasks
  FOR UPDATE 
  USING (assigned_to_id = auth.uid())
  WITH CHECK (assigned_to_id = auth.uid());

-- Show success message
SELECT '✓ DONE! The completed_subreddits column has been added to the tasks table.' as result;

