-- Allow VAs to update work_notes on their assigned tasks
CREATE POLICY "VAs can update work notes on assigned tasks" ON public.tasks
  FOR UPDATE USING (
    assigned_to_id = auth.uid()
  )
  WITH CHECK (
    assigned_to_id = auth.uid()
  );

