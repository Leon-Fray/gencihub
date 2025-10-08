-- Add task_type column to tasks table
-- This migration adds a task_type field to distinguish between different types of tasks

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'general' NOT NULL;

-- Update the constraint to only allow specific task types
ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_task_type_check 
CHECK (task_type IN ('subreddit_upvote', 'general'));

-- Add comment explaining the task_type values
COMMENT ON COLUMN public.tasks.task_type IS 'Type of task: subreddit_upvote (for sending upvotes to subreddits) or general (for other tasks)';

