# Models System - Quick Setup Guide

## The Issue

The "Assign Model" button wasn't showing because:
1. The models tables didn't exist in the database yet
2. The current user wasn't being fetched correctly (now fixed ✅)

## How to Fix

You need to run the database migration to create the models tables.

### Option 1: Run the Migration SQL (Recommended)

1. Open your Supabase Dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/add_models_system.sql`
4. Click "Run" to execute it

### Option 2: Use the Setup Script (For Fresh Databases)

If you're setting up a completely new database, run:
```sql
-- In Supabase SQL Editor
\i supabase/setup.sql
```

This includes everything including the models system.

### Option 3: Run via Terminal (If you have psql access)

```bash
# Connect to your Supabase database
psql "postgresql://[your-connection-string]"

# Run the migration
\i supabase/migrations/add_models_system.sql
```

## What the Migration Does

The migration will:
1. ✅ Create the `models` table
2. ✅ Create the `model_assignments` junction table  
3. ✅ Insert 4 initial models (Annie, Hailey, Camila, Talina)
4. ✅ Set up Row Level Security (RLS) policies
5. ✅ Create performance indexes

## Verify It Worked

After running the migration, you should be able to:

1. **See the Models page:** Navigate to `/admin/models`
   - You should see 4 models listed
   
2. **Assign models to VAs:** Go to `/admin/users`
   - You should now see an "Assign Model" button in the Actions column for VA users
   
3. **Check the database:**
   ```sql
   -- Should return 4 models
   SELECT * FROM public.models;
   
   -- Should return the table structure
   \d public.models
   \d public.model_assignments
   ```

## Initial Models (Update These!)

The migration creates these placeholder models. **You should update the Google Drive links** with your actual links:

```sql
-- Update Annie's Google Drive link
UPDATE public.models 
SET google_drive_link = 'https://drive.google.com/drive/folders/YOUR_ACTUAL_FOLDER_ID'
WHERE name = 'Annie';

-- Update Hailey's Google Drive link
UPDATE public.models 
SET google_drive_link = 'https://drive.google.com/drive/folders/YOUR_ACTUAL_FOLDER_ID'
WHERE name = 'Hailey';

-- Update Camila's Google Drive link
UPDATE public.models 
SET google_drive_link = 'https://drive.google.com/drive/folders/YOUR_ACTUAL_FOLDER_ID'
WHERE name = 'Camila';

-- Update Talina's Google Drive link
UPDATE public.models 
SET google_drive_link = 'https://drive.google.com/drive/folders/YOUR_ACTUAL_FOLDER_ID'
WHERE name = 'Talina';
```

You can also update the bios to be more accurate to your models.

## After Migration

Once the migration is complete:

1. Refresh your browser on the Users page
2. You should see the "Assign Model" button appear for VA users
3. Click it to assign models to VAs
4. Visit the Models page to manage your models

## Troubleshooting

**Still not seeing the button?**
1. Check browser console for errors
2. Verify you're logged in as an admin
3. Make sure the migration ran successfully (check for errors in SQL Editor)
4. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

**Models not showing?**
```sql
-- Check if models were inserted
SELECT * FROM public.models;

-- If empty, run this:
INSERT INTO public.models (name, google_drive_link, bio) VALUES
  ('Annie', 'https://drive.google.com/drive/folders/annie', 'Annie is a talented model known for her stunning photoshoots and vibrant personality.'),
  ('Hailey', 'https://drive.google.com/drive/folders/hailey', 'Hailey brings elegance and grace to every project she works on.'),
  ('Camila', 'https://drive.google.com/drive/folders/camila', 'Camila is known for her versatile looks and professional approach to modeling.'),
  ('Talina', 'https://drive.google.com/drive/folders/talina', 'Talina combines natural beauty with a strong social media presence.');
```

## Next Steps

After setting up:
1. Update the Google Drive links for all models
2. Customize the model bios
3. Assign models to your VAs
4. (Optional) Add more models using the "Create Model" button on the Models page

