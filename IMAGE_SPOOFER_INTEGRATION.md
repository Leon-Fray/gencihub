# Image Spoofer Integration Guide

This document explains the image spoofing integration that translates your Python `spoofDrive.py` script into a Next.js/Supabase Edge Function.

## What Was Created

### 1. Supabase Edge Function (`supabase/functions/image-spoofer/index.ts`)

A TypeScript Deno function that replicates the core spoofing logic from your Python script:

- **Spoof A**: Random Date & GPS coordinates
- **Spoof B**: Different Random Date (2010-2014) & Fake Camera Info (Fujifilm, Sony, Canon, Nikon)
- **Spoof C**: Strips all EXIF data
- **Spoof D**: Complete spoofing with Random Date (2018-2024), GPS, Modern Camera Info (Apple, Samsung, Google, OnePlus), and exposure settings

The function:
- Accepts a `driveUrl` parameter
- Fetches the image from Google Drive
- Processes it with 4 different EXIF spoofing strategies
- Returns all 4 versions as Base64 data URIs

### 2. Import Map (`supabase/import_map.json`)

Configures the `piexifjs` library (equivalent to Python's `piexif`) for EXIF manipulation in Deno.

### 3. Browser Supabase Client (`lib/supabase.ts`)

Added `createSupabaseBrowserClient()` function for client-side Supabase operations.

### 4. Model Tile Component with Spoof Functionality (`components/model-tile-with-spoof.tsx`)

A new React client component that:
- Displays model information (name, bio, Google Drive link)
- Includes a "Spoof Images" button in the Resources section
- Shows loading states during processing
- Displays all 4 spoofed images in a grid with download buttons
- Handles errors gracefully

### 5. Updated Model Details Page (`app/dashboard/model-details/page.tsx`)

Modified to use the new `ModelTileWithSpoof` component instead of inline Cards.

## How to Deploy

### Step 1: Deploy the Edge Function

```bash
# Navigate to your project directory
cd C:\Users\leonf\Desktop\api\nextProjects\vaHub

# Login to Supabase (if not already logged in)
npx supabase login

# Link your project (if not already linked)
npx supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
npx supabase functions deploy image-spoofer
```

### Step 2: Set Environment Variables (if needed)

If your Supabase environment variables aren't already set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 3: Test the Integration

1. Navigate to your app's Model Details page (`/dashboard/model-details`)
2. Find a model with a valid Google Drive link
3. Click the "Spoof Images" button
4. Wait for processing (should take a few seconds)
5. View the 4 spoofed versions
6. Download any version by hovering over the image and clicking "Download"

## Important Notes

### Google Drive URL Format

The function expects Google Drive URLs in one of these formats:
- `https://drive.google.com/file/d/FILE_ID/view`
- `https://drive.google.com/open?id=FILE_ID`
- Any URL containing `/d/FILE_ID`

The function automatically extracts the file ID and converts it to a direct download URL.

### Permissions

Make sure the Google Drive files are:
- Either publicly accessible, OR
- Shared with appropriate permissions

### EXIF Library Differences

The Deno implementation uses `piexifjs` which has some differences from Python's `piexif`:
- GPS coordinates are formatted slightly differently
- Some EXIF tags may have different numeric values
- The overall functionality is equivalent

### Current Limitations

1. **Single Image Processing**: Currently processes one image at a time (not entire folders like the Python script)
2. **Google Drive Direct Link Required**: Needs a direct file link, not a folder link
3. **HEIC Support**: Unlike the Python version with `pillow_heif`, HEIC images may not be supported

## Future Enhancements

Potential improvements you could add:

- [ ] Support for multiple images from a Google Drive folder
- [ ] Batch processing of all model images
- [ ] Progress indicators for multiple images
- [ ] Download all spoofed images as a ZIP file
- [ ] Custom date range selection for spoofing
- [ ] HEIC/HEIF format support
- [ ] Save spoofed images back to Google Drive
- [ ] History of spoofed images per model

## Troubleshooting

### Function Not Found Error

If you get a "Function not found" error:
1. Make sure you deployed the function: `npx supabase functions deploy image-spoofer`
2. Check your Supabase project dashboard to verify the function exists

### Google Drive Fetch Fails

If image fetching fails:
1. Verify the Google Drive link is valid
2. Check that the file is publicly accessible or properly shared
3. Try accessing the direct download URL manually

### CORS Errors

The function includes CORS headers for all origins (`*`). If you still get CORS errors:
1. Check your Supabase project settings
2. Verify the function is deployed correctly
3. Check browser console for specific error messages

### Large Image Timeout

For very large images, the function might timeout:
1. Supabase Edge Functions have a 150-second timeout limit
2. Consider optimizing image size before spoofing
3. Or implement background processing for large batches

## Technical Details

### Function Flow

```
1. Receive POST request with { driveUrl: "..." }
2. Extract Google Drive file ID from URL
3. Convert to direct download URL
4. Fetch image as ArrayBuffer
5. Convert to Base64 data URI
6. For each spoof type (A, B, C, D):
   - Create EXIF object with random data
   - Dump EXIF bytes
   - Insert into image
7. Return all 4 versions as JSON
```

### Date Format

EXIF dates use the format: `YYYY:MM:DD HH:MM:SS`
Example: `2023:05:15 14:30:45`

### GPS Format

GPS coordinates are stored as rational numbers (tuples):
- Latitude: `[[degrees, 1], [minutes, 1], [seconds, 100]]`
- Longitude: `[[degrees, 1], [minutes, 1], [seconds, 100]]`
- Reference: `'N'|'S'` for latitude, `'E'|'W'` for longitude

## API Reference

### Edge Function Endpoint

**POST** `/functions/v1/image-spoofer`

**Request Body:**
```json
{
  "driveUrl": "https://drive.google.com/file/d/FILE_ID/view"
}
```

**Success Response (200):**
```json
{
  "spoof_a": "data:image/jpeg;base64,...",
  "spoof_b": "data:image/jpeg;base64,...",
  "spoof_c": "data:image/jpeg;base64,...",
  "spoof_d": "data:image/jpeg;base64,..."
}
```

**Error Response (400/500):**
```json
{
  "error": "Error message"
}
```

## Component Props

### ModelTileWithSpoof

```typescript
interface ModelTileWithSpoofProps {
  model: {
    id: string
    name: string
    bio: string
    google_drive_link: string
  }
  getInitials: (name: string) => string
  getGradient: (name: string) => string
}
```

## Questions or Issues?

If you encounter any issues or have questions:
1. Check the Supabase Edge Function logs in your dashboard
2. Check the browser console for client-side errors
3. Verify all environment variables are set correctly
4. Test the Edge Function directly using curl or Postman

