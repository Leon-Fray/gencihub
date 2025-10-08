# 🚀 Run Migrations to Fix Your App

## The Problem
Your app is trying to use two tables that don't exist yet:
1. `account_requests` - for storing new account requests
2. `links` - for storing girly.bio redirect links

## The Solution - Run This Migration

### Step-by-Step Instructions

#### 1. Open Supabase Dashboard
- Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Select your project: `dtrbuomodpheqtazsghp`

#### 2. Open SQL Editor
- In the left sidebar, click on **SQL Editor**
- Click **New query** button

#### 3. Copy and Run the Migration
- Open the file: `supabase/migrations/run_all_new_migrations.sql`
- Copy ALL the contents
- Paste into the SQL Editor
- Click the **RUN** button (or press Ctrl+Enter)

#### 4. Verify Success
You should see a success message. To double-check, run this query:

```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('account_requests', 'links');
```

You should see both tables listed.

#### 5. Add OnlyFans Links to Your Models (IMPORTANT!)
Before the link creation will work, you need to add OnlyFans links to your models:

```sql
-- Check current models and their links
SELECT id, name, oflink FROM public.models;

-- Update each model with their OnlyFans link
-- Replace these with actual OnlyFans URLs for your models:

UPDATE public.models SET oflink = 'https://onlyfans.com/annie' WHERE name = 'Annie';
UPDATE public.models SET oflink = 'https://onlyfans.com/hailey' WHERE name = 'Hailey';
UPDATE public.models SET oflink = 'https://onlyfans.com/camila' WHERE name = 'Camila';
UPDATE public.models SET oflink = 'https://onlyfans.com/talina' WHERE name = 'Talina';
```

## What This Migration Does

### Creates `account_requests` Table
- Stores new account requests from VAs
- Tracks status (pending/approved/rejected)
- Links requests to models and VAs

### Creates `links` Table
- Stores girly.bio redirect links
- Automatically generates slugs (modelname200, modelname201, etc.)
- Tracks clicks and link status
- Links are tied to the user who created them

## After Running the Migration

1. **Test Account Request Form**
   - Go to your app's "New Account" page
   - Select a model
   - Choose a reason
   - Click "Submit Request"
   - You should see a success message ✅

2. **Test Link Creation**
   - Make sure you've added `oflink` values to your models (Step 5 above)
   - Select a model in the form
   - Click "Request Link" under the Redirect Link card
   - You should see the created link (e.g., `https://girly.bio/annie200`)
   - The link should be copied to your clipboard

## Troubleshooting

### Still getting "table doesn't exist" error?
- Make sure you ran the migration in the correct Supabase project
- Try refreshing your app
- Check browser console for detailed error messages

### Link creation fails with "Model does not have OnlyFans link"?
- Make sure you completed Step 5 above
- Check that the model name exactly matches (case-sensitive)
- Run: `SELECT name, oflink FROM public.models;` to verify

### Need help?
Check the browser console (F12) for detailed error messages and share them.

