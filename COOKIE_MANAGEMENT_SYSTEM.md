# Cookie Management System

## Overview

The Cookie Management System allows VAs to request browser cookie files for authentication. Each cookie file is assigned **only once** to a single VA and is never reused. This ensures cookie integrity and prevents conflicts.

## How It Works

1. **Storage**: Cookie files are stored in a Supabase Storage bucket called `cookies`
2. **Database Tracking**: The `cookies` table tracks which files are available and who they're assigned to
3. **One-Time Assignment**: Each cookie file can only be assigned to one VA permanently
4. **Sequential Distribution**: VAs get the next available (unassigned) cookie file in order

## Setup Instructions

### Step 1: Create Supabase Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Name it: `cookies`
4. **Recommended**: Keep it **Private** (only authenticated users can access)
   - If private, files are accessed via signed URLs
   - If public, files are directly downloadable via public URLs
5. Click **Create bucket**

### Step 2: Upload Cookie Files

1. Click on the `cookies` bucket
2. Upload your browser cookie files (`.json` or `.txt` format)
3. Upload all files to the **root** of the bucket (not in subdirectories)
4. Example structure:
   ```
   cookies/
   ├── chrome_cookie_001.json
   ├── firefox_cookie_002.json
   ├── safari_cookie_003.json
   └── ...
   ```

### Step 3: Sync Files to Database

1. Go to **Admin** → **Resources** page
2. Click **"Sync from Storage"** button
3. The system will automatically:
   - List all cookie files in the storage bucket
   - Add new files to the database
   - Skip files that are already tracked

### Step 4: VAs Request Cookies

VAs can request cookies from the **Dashboard** → **New Account** page:

1. Click the **"Request Cookie"** button in the Cookie File section
2. The system assigns the next available cookie file
3. A download link is provided
4. The cookie file is permanently marked as assigned to that VA

## Database Schema

### Cookies Table

```sql
CREATE TABLE public.cookies (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  cookie_name TEXT NOT NULL,
  cookie_file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_used_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true NOT NULL
);
```

**Key Fields:**
- `cookie_name`: Name of the cookie file
- `cookie_file_path`: Path in Supabase Storage bucket
- `last_used_by_id`: VA who was assigned this cookie (NULL = available)
- `last_used_at`: When the cookie was assigned
- `is_active`: Whether the cookie is active (can be set to false to disable)

### Resource Assignments Table

Tracks all resource assignments including cookies:

```sql
CREATE TABLE public.resource_assignments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  va_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cookie_id BIGINT REFERENCES public.cookies(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  assignment_type TEXT NOT NULL -- 'new_account', 'task', 'other'
);
```

## API Functions

### For Admins

#### `syncCookiesFromStorage()`
Syncs cookie files from Supabase Storage to the database.

```typescript
const result = await syncCookiesFromStorage()
// Returns: { added: number, message: string }
```

#### `getAllCookies()`
Gets all cookie files with their assignment status.

```typescript
const cookies = await getAllCookies()
```

#### `createCookie(formData)`
Manually add a cookie file to the database (alternative to sync).

```typescript
const formData = new FormData()
formData.append('cookieName', 'chrome_cookie_001.json')
formData.append('cookieFilePath', 'chrome_cookie_001.json')
await createCookie(formData)
```

### For VAs

#### `getAvailableCookie(vaId)`
Assigns the next available cookie file to a VA.

```typescript
const cookie = await getAvailableCookie(vaId)
// Returns: {
//   cookie_name: string,
//   cookie_file_path: string,
//   download_url: string
// }
```

**Important**: 
- This function only returns cookies where `last_used_by_id` is NULL
- Once assigned, the cookie is permanently linked to that VA
- Throws an error if no cookies are available

## Assignment Logic

```typescript
// Get next unassigned cookie
const { data: cookieData } = await supabase
  .from('cookies')
  .select('*')
  .eq('is_active', true)
  .is('last_used_by_id', null) // Only unassigned cookies
  .order('id', { ascending: true }) // Sequential order
  .limit(1)
  .single()

// Permanently assign to VA
await supabase
  .from('cookies')
  .update({
    last_used_by_id: vaId,
    last_used_at: new Date().toISOString(),
  })
  .eq('id', cookieData.id)
```

## UI Components

### Admin UI (`/admin/resources`)

- **Sync from Storage**: Button to sync new cookie files from Supabase Storage
- **Cookie List**: Table showing all cookies with assignment status
  - Green badge: "Available" (not assigned)
  - Blue badge: "Assigned" (already assigned to a VA)
- **Resource Assignments**: History of all cookie assignments

### VA UI (`/dashboard/new-account`)

- **Request Cookie Button**: VAs can request a cookie file
- **Download Options**: 
  - Direct download button
  - Copy download URL to clipboard
- **Assignment Confirmation**: Shows the cookie file name and permanent assignment notice

## Storage Bucket Configuration

### Option 1: Private Bucket (Recommended)

**Pros:**
- More secure
- Files require authentication
- Access controlled via RLS policies

**Cons:**
- Slightly more complex setup
- Need to use signed URLs for downloads

**Setup:**
```typescript
// Generate signed URL for download (valid for 1 hour)
const { data } = supabase
  .storage
  .from('cookies')
  .createSignedUrl(filePath, 3600)
```

### Option 2: Public Bucket

**Pros:**
- Simpler setup
- Direct download URLs
- No expiration

**Cons:**
- Less secure
- Anyone with the URL can download

**Setup:**
```typescript
// Get public URL
const { data } = supabase
  .storage
  .from('cookies')
  .getPublicUrl(filePath)
```

**Current Implementation**: Uses public URLs for simplicity. If you need private access, update the `getAvailableCookie` function to use `createSignedUrl` instead.

## Monitoring & Maintenance

### Check Available Cookies

```sql
-- Count available cookies
SELECT COUNT(*) FROM cookies 
WHERE is_active = true AND last_used_by_id IS NULL;

-- List assigned cookies
SELECT c.cookie_name, p.full_name, c.last_used_at
FROM cookies c
LEFT JOIN profiles p ON c.last_used_by_id = p.id
WHERE c.last_used_by_id IS NOT NULL
ORDER BY c.last_used_at DESC;
```

### Add More Cookies

When running low on available cookies:

1. Upload new cookie files to the Supabase Storage `cookies` bucket
2. Go to Admin → Resources
3. Click "Sync from Storage"
4. New files will be automatically added to the database

### Reset a Cookie (if needed)

If you need to make a cookie available again:

```sql
UPDATE cookies 
SET last_used_by_id = NULL, last_used_at = NULL 
WHERE id = <cookie_id>;
```

**Warning**: This breaks the one-time assignment guarantee. Only do this if absolutely necessary.

## Troubleshooting

### No cookies available error

**Problem**: `getAvailableCookie` throws "No available cookies" error

**Solutions**:
1. Upload more cookie files to Supabase Storage
2. Click "Sync from Storage" in Admin → Resources
3. Check if cookies exist but are marked as `is_active = false`

### Cookie files not showing after sync

**Problem**: Files uploaded but not appearing after sync

**Checks**:
1. Ensure files are in the root of the `cookies` bucket (not in subdirectories)
2. Check file extensions (must be `.json` or `.txt`)
3. Verify bucket name is exactly `cookies`
4. Check browser console for error messages

### Download link not working

**Problem**: Cookie download URL returns 404 or access denied

**Solutions**:
1. If bucket is private, ensure user is authenticated
2. Check if file exists in storage: Supabase Dashboard → Storage → cookies
3. Verify the file path stored in database matches the actual file path

## Security Considerations

1. **Access Control**: Ensure VAs can only access their own assigned cookies
2. **One-Time Use**: The system enforces one-time assignment to prevent conflicts
3. **Audit Trail**: All assignments are logged in `resource_assignments` table
4. **Storage Permissions**: Configure bucket RLS policies to restrict access
5. **File Validation**: Only `.json` and `.txt` files are synced

## Future Enhancements

Potential improvements:

1. **Cookie Expiration**: Add expiration dates for cookies
2. **Cookie Return**: Allow VAs to return cookies back to the pool
3. **Cookie Validation**: Validate cookie file contents before assignment
4. **Batch Upload**: UI for uploading multiple cookie files at once
5. **Usage Analytics**: Track cookie usage patterns and success rates
6. **Automatic Cleanup**: Remove or archive old/expired cookies

