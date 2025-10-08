-- Allow VAs to update completed_subreddits field of their assigned tasks
-- Drop the policy if it exists, then recreate it
DROP POLICY IF EXISTS "VAs can update completed_subreddits of assigned tasks" ON public.tasks;

CREATE POLICY "VAs can update completed_subreddits of assigned tasks" ON public.tasks
  FOR UPDATE 
  USING (assigned_to_id = auth.uid())
  WITH CHECK (assigned_to_id = auth.uid());

