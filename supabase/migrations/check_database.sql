-- ===========================================================================
-- DATABASE VERIFICATION SCRIPT
-- ===========================================================================
-- Run this first to check what exists in your database
-- ===========================================================================

-- Check if tasks table exists
SELECT 
    'tasks table' as check_item,
    CASE 
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks')
        THEN '✓ EXISTS' 
        ELSE '✗ MISSING - Run schema.sql first!'
    END as status;

-- Check if completed_subreddits column exists
SELECT 
    'completed_subreddits column' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'tasks' 
            AND column_name = 'completed_subreddits'
        )
        THEN '✓ EXISTS' 
        ELSE '✗ MISSING - Run migration to add it'
    END as status;

-- Show all columns in the tasks table (if it exists)
SELECT 
    'Current columns in tasks table:' as info,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tasks';

-- Show current RLS policies on tasks table
SELECT 
    'Current RLS policies:' as info,
    string_agg(policyname, ', ') as policies
FROM pg_policies 
WHERE tablename = 'tasks';

