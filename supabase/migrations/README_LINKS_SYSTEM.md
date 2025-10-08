# Links System Migration

This migration adds the girly.bio redirect links system to your application.

## What It Does

### 1. Prerequisites
- Assumes the `oflink` column already exists in the models table to store OnlyFans links

### 2. Creates Links Table
Creates a new `links` table to store redirect links with:
- `title`: VA Name who created the link
- `destination_url`: The OnlyFans link from the model
- `slug`: Auto-generated slug (modelname + number starting at 200)
- `user_id`: The VA who created the link
- `domain`: Always "girly.bio"
- `is_active`: Whether the link is active
- `clicks`: Track how many times the link has been clicked

### 3. RLS Policies
- VAs can view, create, and update their own links
- Admins can view and manage all links

### 4. Slug Numbering Logic
- Automatically generates slugs like `modelname200`, `modelname201`, etc.
- Queries existing links to find the highest number
- Increments by 1 for each new link
- Starts at 200 if no links exist for that model

## How to Run

### Step 1: Run the Migration

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `add_links_table.sql`
4. Paste and click **Run**

#### Option B: Using Supabase CLI
```bash
supabase db push
```

### Step 2: Add OnlyFans Links to Models

After running the migration, you need to populate the `oflink` field for your models (if not already done):

```sql
-- Example: Update models with their OnlyFans links
UPDATE public.models SET oflink = 'https://onlyfans.com/annie' WHERE name = 'Annie';
UPDATE public.models SET oflink = 'https://onlyfans.com/hailey' WHERE name = 'Hailey';
UPDATE public.models SET oflink = 'https://onlyfans.com/camila' WHERE name = 'Camila';
UPDATE public.models SET oflink = 'https://onlyfans.com/talina' WHERE name = 'Talina';
```

## Verification

After running the migration, verify it was successful:

```sql
-- Check if links table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'links';

-- Check if oflink column exists in models
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'models' 
AND column_name = 'oflink';

-- Check RLS policies for links table
SELECT * FROM pg_policies 
WHERE tablename = 'links';
```

## Features Enabled

After this migration, your VAs can:

1. **Select a model** from their assigned models
2. **Click "Request Link"** to create a redirect link
3. **Automatically get a unique slug** (e.g., `annie200`, `annie201`)
4. **Copy the link** to clipboard (e.g., `https://girly.bio/annie200`)
5. **See created links** in the session with copy buttons
6. **Links redirect** to the model's OnlyFans page

## Technical Details

### Slug Generation Algorithm
```typescript
1. Normalize model name (lowercase, remove special chars)
2. Query existing links for this model
3. Find highest number used
4. Increment by 1 (or start at 200 if none exist)
5. Return: baseSlug + number
```

### Example Slug Progression
- First link for "Annie": `annie200`
- Second link for "Annie": `annie201`
- Third link for "Annie": `annie202`
- First link for "Hailey": `hailey200`

### Database Schema
```sql
CREATE TABLE public.links (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  domain TEXT NOT NULL DEFAULT 'girly.bio',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  clicks INTEGER DEFAULT 0
);
```

## Troubleshooting

### Error: "Model does not have an OnlyFans link configured"
**Solution**: Make sure you've added the `oflink` value for the model in Step 2 above.

### Error: "Model not found"
**Solution**: Ensure the model name matches exactly (case-sensitive) with what's in the database.

### Links not creating
**Solution**: 
1. Check that the migration ran successfully
2. Verify RLS policies are in place
3. Check browser console for errors
4. Ensure the VA has selected a model before clicking "Request Link"

