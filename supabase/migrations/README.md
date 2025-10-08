# Database Migrations

This directory contains SQL migration files for the vaHub application.

## Recent Migrations

### add_completed_subreddits.sql
Adds a `completed_subreddits` JSONB column to the `tasks` table to track which subreddits have been posted to for each task.

### add_va_update_policy.sql
Adds a Row Level Security (RLS) policy that allows VAs to update the `completed_subreddits` field of their assigned tasks.

## How to Apply Migrations

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file
4. Execute the SQL

### Option 2: Using Supabase CLI
If you have the Supabase CLI installed:

```bash
# Apply all pending migrations
supabase db push

# Or apply a specific migration
supabase db execute -f supabase/migrations/add_completed_subreddits.sql
supabase db execute -f supabase/migrations/add_va_update_policy.sql
```

### Option 3: Manual Execution
You can also connect to your database and execute the SQL directly using any PostgreSQL client.

## Migration Order
The migrations should be applied in the following order:
1. `add_completed_subreddits.sql` - Adds the column
2. `add_va_update_policy.sql` - Adds the RLS policy

## Verification
After applying the migrations, verify they were successful by:
1. Checking that the `completed_subreddits` column exists in the `tasks` table
2. Verifying that the RLS policy exists:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'tasks';
   ```

