-- Add completed_subreddits column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS completed_subreddits JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.tasks.completed_subreddits IS 'Array of subreddit names that have been posted to for this task';

