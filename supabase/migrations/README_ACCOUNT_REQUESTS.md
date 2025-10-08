# Account Requests Migration

This migration adds a new table `account_requests` to store new account requests from VAs.

## What It Does

- Creates a new `account_requests` table to store:
  - VA ID (who made the request)
  - Model ID (which model the account is for)
  - Reason for the request
  - Status (pending, approved, rejected)
  - Timestamps and review information
  
- Sets up Row Level Security (RLS) policies:
  - VAs can view and create their own account requests
  - Admins can view and manage all account requests
  
- Creates indexes for better query performance

## How to Run

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `add_account_requests.sql`
4. Paste and run the SQL

### Option 2: Using Supabase CLI
```bash
supabase db push
```

## Verification

After running the migration, verify it was successful:

```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'account_requests';

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'account_requests';
```

## What This Enables

- VAs can submit new account requests through the UI
- Requests are stored with model and reason information
- Admins can review, approve, or reject requests
- The data persists and can be used for resource assignment

