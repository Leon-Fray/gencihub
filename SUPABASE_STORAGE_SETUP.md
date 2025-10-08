# Supabase Storage Setup for Image Spoofing

## Step 1: Create Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Name it: `model-images`
4. Make it **Public** (so the Edge Function can access the images)
5. Click **Create bucket**

## Step 2: Upload Model Images

For each model (e.g., Annie):

1. Click on the `model-images` bucket
2. Create a folder for the model (e.g., `annie/`)
3. Upload all images for that model into that folder
4. The structure should look like:
   ```
   model-images/
   ├── annie/
   │   ├── image1.jpg
   │   ├── image2.jpg
   │   └── ...
   ├── model2/
   │   ├── image1.jpg
   │   └── ...
   ```

## Step 3: Update Model Records

Update each model's `google_drive_link` field to be the storage path instead:

```sql
UPDATE public.models 
SET google_drive_link = 'annie'
WHERE name = 'Annie';
```

Or you can add a new column:

```sql
ALTER TABLE public.models 
ADD COLUMN storage_folder TEXT;

UPDATE public.models 
SET storage_folder = 'annie'
WHERE name = 'Annie';
```

## Step 4: Deploy Simple Edge Function

Deploy the new simplified function:
- Go to **Supabase Dashboard** → **Edge Functions**
- Create function: `image-spoofer-simple`
- Paste the code from `supabase/functions/image-spoofer-simple/index.ts`
- Deploy

## Step 5: Get Image URLs

Images will be accessible at:
```
https://YOUR_PROJECT.supabase.co/storage/v1/object/public/model-images/annie/image1.jpg
```

The format is:
```
{SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
```

## Alternative: Keep Google Drive Links in UI

You can keep the Google Drive link for viewing but use Supabase Storage for spoofing:
- `google_drive_link`: For the "Open Google Drive" button
- `storage_folder`: For the spoofer to list and process images

This way users can still browse the Drive folder, but spoofing happens via Storage.

