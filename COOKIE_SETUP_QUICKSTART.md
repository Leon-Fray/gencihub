# Cookie Management - Quick Start Guide

## What Was Implemented

✅ **One-time cookie assignment system**
- Each cookie file is assigned to only ONE VA permanently
- Once assigned, a cookie file is never given to another VA
- VAs receive the next available cookie file sequentially

✅ **Automatic sync from Supabase Storage**
- Upload cookie files to the `cookies` bucket
- Click "Sync from Storage" to add them to the database
- No manual entry needed for bulk uploads

✅ **VA cookie request interface**
- VAs can request cookies from the New Account page
- Cookie contents **automatically copied to clipboard**
- Preview of contents shown in UI
- Visual confirmation of permanent assignment

✅ **Admin resource management**
- View all cookies and their assignment status
- See which cookies are available vs. assigned
- Track all resource assignments with full audit trail

## Quick Setup (3 Steps) - No Storage Policies Needed!

### 1. Create the Storage Bucket

1. Open **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Enter name: `cookies`
4. Set it as **Public** or **Private** (your choice)
5. Click **"Create bucket"**

### 2. Upload Cookie Files

1. Click on the `cookies` bucket
2. Click **"Upload files"**
3. Select your cookie files (`.json` or `.txt` format)
4. Upload to the **root** of the bucket (no subdirectories)

### 3. Sync to Database

1. Go to **`/admin/resources`** page in your app
2. Click **"Sync from Storage"** button
3. You'll see a success message with how many files were added

**Done!** VAs can now request cookies - the contents will be automatically copied to their clipboard!

## File Locations

### New Files Created
- `components/sync-cookies-button.tsx` - Sync button for admin
- `components/request-cookie-button.tsx` - Request button for VAs (auto-copies to clipboard!)
- ~~`supabase/storage_policies_cookies.sql`~~ - No longer needed!
- ~~`supabase/storage_policies_cookies_public.sql`~~ - No longer needed!
- `COOKIE_MANAGEMENT_SYSTEM.md` - Full documentation
- `COOKIE_SETUP_QUICKSTART.md` - This setup guide

### Modified Files
- `lib/actions.ts` - Updated `getAvailableCookie()` to only assign once + reads file contents directly + auto-copies to clipboard
- `app/admin/resources/page.tsx` - Added real data and sync button
- `components/new-account-page-client.tsx` - Added cookie request button
- `components/create-cookie-dialog.tsx` - Updated labels for clarity

## Key Changes to `getAvailableCookie()`

**Before**: Used "least recently used" logic - cookies could be reused
```typescript
.order('last_used_at', { ascending: true, nullsFirst: true })
```

**After**: Only assigns unassigned cookies - one-time use only
```typescript
.is('last_used_by_id', null) // Only unassigned cookies
.order('id', { ascending: true }) // Sequential order
```

**New Approach**: Reads file contents directly and copies to clipboard
```typescript
// Read file contents using admin client (bypasses storage policies!)
const { data: fileData } = await supabase.storage
  .from('cookies')
  .download(cookieData.cookie_file_path)

const cookieContents = await fileData.text()
// Returns contents directly - VAs can copy to clipboard
```

## Testing the System

### Test as Admin

1. Go to `/admin/resources`
2. Click "Sync from Storage"
3. Verify cookies appear in the table with "Available" status
4. Check the Resource Assignments section (should be empty initially)

### Test as VA

1. Go to `/dashboard/new-account`
2. Scroll to "Request Resources" section
3. Click "Request Cookie" button
4. You should see:
   - Cookie file name
   - Preview of cookie contents (first 200 characters)
   - **Cookie contents automatically copied to clipboard!**
   - Copy button to copy again if needed
   - Permanent assignment notice

5. Paste (Ctrl+V) somewhere to verify the cookie contents
6. Go back to `/admin/resources` as admin
7. The cookie should now show "Assigned" status
8. Resource Assignments table should show the assignment

### Test One-Time Assignment

1. As a second VA, request a cookie
2. You should get a **different** cookie file
3. The first VA's cookie should never be offered again

### Test Exhaustion

1. If you have 3 cookies and 3 VAs request them
2. The 4th VA should get an error: "No available cookies..."
3. Upload more cookies and sync to resolve

## Usage Examples

### VA Requests Cookie
```typescript
// Automatically called by RequestCookieButton
const cookie = await getAvailableCookie(vaId)
// Returns: {
//   cookie_name: "chrome_cookie_001.json",
//   cookie_file_path: "chrome_cookie_001.json", 
//   cookie_contents: "[actual cookie file contents as text]"
// }
// Contents are automatically copied to clipboard!
```

### Admin Syncs New Files
```typescript
// Automatically called by SyncCookiesButton
const result = await syncCookiesFromStorage()
// Returns: {
//   added: 5,
//   message: "Successfully added 5 new cookie files to the database."
// }
```

### Admin Views All Cookies
```typescript
const cookies = await getAllCookies()
// Returns array of all cookies with assignment info
```

## Storage Bucket Structure

```
cookies/  (Supabase Storage Bucket)
├── chrome_cookie_001.json
├── chrome_cookie_002.json
├── firefox_cookie_001.json
├── safari_cookie_001.json
└── ... (more cookie files)
```

**Important**: 
- Keep files in the root of the bucket (no folders)
- Supported extensions: `.json`, `.txt`
- File names become the `cookie_name` in the database

## Database Structure

After syncing, your `cookies` table will look like:

| id | cookie_name | cookie_file_path | last_used_by_id | is_active |
|----|-------------|------------------|-----------------|-----------|
| 1  | chrome_cookie_001.json | chrome_cookie_001.json | NULL | true |
| 2  | chrome_cookie_002.json | chrome_cookie_002.json | NULL | true |
| 3  | firefox_cookie_001.json | firefox_cookie_001.json | user-uuid-123 | true |

**Status Legend**:
- `last_used_by_id = NULL` → Available (green badge)
- `last_used_by_id = <uuid>` → Assigned (blue badge)

## Troubleshooting

### ~~404 Error "Object not found"~~ ✅ FIXED!
**This is no longer an issue!** We now read cookie contents directly using the admin client, bypassing all storage policies. No storage policies needed!

### "No available cookies" error
- Upload more cookie files to Supabase Storage
- Click "Sync from Storage"
- Verify files are `.json` or `.txt`

### Sync button doesn't add files
- Check files are in the root of the bucket
- Check file extensions (must be `.json` or `.txt`)
- Check browser console for errors

### Download link doesn't work
- If bucket is private, make it public or use signed URLs
- Verify file exists in Supabase Storage
- Check the file path in the database matches storage

### Same cookie given to multiple VAs
- This should NOT happen with the new implementation
- If it does, check that you're using the updated `getAvailableCookie()` function
- Verify the query includes `.is('last_used_by_id', null)`

## Monitoring

Check available cookies:
```sql
SELECT COUNT(*) FROM cookies 
WHERE is_active = true AND last_used_by_id IS NULL;
```

View recent assignments:
```sql
SELECT c.cookie_name, p.full_name, ra.assigned_at
FROM resource_assignments ra
JOIN cookies c ON ra.cookie_id = c.id
JOIN profiles p ON ra.va_id = p.id
ORDER BY ra.assigned_at DESC
LIMIT 10;
```

## Next Steps

1. ✅ Create the `cookies` storage bucket
2. ✅ Upload your cookie files
3. ✅ Sync them using the admin interface
4. ✅ Test VA cookie requests (contents auto-copy to clipboard!)
5. 📚 Read `COOKIE_MANAGEMENT_SYSTEM.md` for full documentation

## Why No Storage Policies Needed?

The system uses the **Supabase Admin Client** to read cookie files directly from storage. The admin client bypasses all RLS and storage policies, so:
- ✅ No 404 errors
- ✅ No policy configuration needed
- ✅ Works with both public and private buckets
- ✅ Contents copied directly to clipboard

## Need Help?

Refer to the full documentation in `COOKIE_MANAGEMENT_SYSTEM.md` for:
- Detailed API reference
- Security considerations
- Advanced configuration options
- Troubleshooting guide

