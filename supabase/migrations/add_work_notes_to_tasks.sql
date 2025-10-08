-- Add work_notes column to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS work_notes TEXT;

