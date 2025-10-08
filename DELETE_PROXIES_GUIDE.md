# Guide: Delete Used IP Proxies (Lines 1-120)

You mentioned that IP proxies up to line 120 have already been used and should be removed. I've created two methods to do this:

## Method 1: Using the Admin Interface (Easiest) ✅

I've added a "Delete Lines 1-120" button to your admin resources page.

### Steps:

1. **Navigate to Admin Resources**
   - Go to `/admin/resources` in your browser
   - Or click "Resources" in the admin navigation

2. **Find the IP Proxies Card**
   - Look for the "IP Proxies" section
   - You'll see a red "Delete Lines 1-120" button in the top-right corner

3. **Click the Delete Button**
   - Click "Delete Lines 1-120"
   - A confirmation dialog will appear
   - Confirm the deletion

4. **Done!**
   - All IP proxies from lines 1-120 will be deleted
   - You'll see a success message
   - The page will refresh showing only remaining proxies (121+)

### What Happens:
- Deletes all IP proxies with `line_number <= 120`
- Shows a confirmation dialog before deleting
- Displays success/error messages
- Automatically refreshes the page

---

## Method 2: Using SQL (Alternative)

If you prefer to run SQL directly in Supabase:

### Steps:

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to **SQL Editor**

2. **Run the SQL Script**
   - Open the file: `supabase/delete_used_proxies.sql`
   - Copy the contents
   - Paste into SQL Editor
   - Click "Run"

### SQL Script:

```sql
-- Delete IP proxies from line 1 to 120 (already used)

-- Optional: Preview what will be deleted
SELECT id, line_number, ip_proxy, last_used_by_id 
FROM public.ip_proxies 
WHERE line_number <= 120
ORDER BY line_number;

-- Delete the proxies
DELETE FROM public.ip_proxies 
WHERE line_number <= 120;

-- Optional: Verify deletion
SELECT COUNT(*) as remaining_proxies,
       MIN(line_number) as first_line,
       MAX(line_number) as last_line
FROM public.ip_proxies;
```

---

## What Was Changed

### 1. New Server Action: `deleteIPProxiesUpToLine`
**File**: `lib/actions.ts`

- Added a new function to delete IP proxies up to a specific line number
- Safely counts and deletes proxies
- Revalidates the admin pages to show updated data
- Returns success message with count of deleted proxies

### 2. New Component: `DeleteUsedProxiesButton`
**File**: `components/delete-used-proxies-button.tsx`

- Client component with delete functionality
- Shows confirmation dialog before deleting
- Displays loading state while deleting
- Shows toast notifications for success/error
- Hardcoded to delete lines 1-120

### 3. Updated Admin Resources Page
**File**: `app/admin/resources/page.tsx`

- Added the delete button to the IP Proxies card
- Positioned in the header next to the title
- Styled as a destructive (red) button

### 4. SQL Script for Manual Deletion
**File**: `supabase/delete_used_proxies.sql`

- Ready-to-run SQL script
- Includes preview queries
- Includes verification queries

---

## Verification

After deletion, you can verify the results:

### In the Admin Interface:
1. Go to `/admin/resources`
2. Look at the IP Proxies table
3. The first line number should now be 121 or higher

### In Supabase:
1. Go to SQL Editor
2. Run:
   ```sql
   SELECT MIN(line_number) as first_line, 
          MAX(line_number) as last_line,
          COUNT(*) as total_proxies
   FROM public.ip_proxies;
   ```
3. `first_line` should be 121 or higher

---

## Important Notes

⚠️ **This action is permanent!**
- Deleted proxies cannot be recovered
- Make sure you want to delete lines 1-120
- A confirmation dialog will appear before deletion

✅ **Safe to delete because:**
- These proxies have already been used
- Each proxy is assigned only once
- Deleting them won't affect existing assignments
- Resource assignments table still has the records

🔄 **What happens to assignments:**
- Existing resource assignments are kept
- VAs who already got these IPs still have their assignment records
- Only the proxy entries in `ip_proxies` table are deleted

---

## Troubleshooting

### "Delete button doesn't appear"
- Make sure you're logged in as admin
- Refresh the page
- Check that you're on `/admin/resources`

### "Permission denied" error
- Make sure you're logged in as admin
- Check RLS policies in Supabase
- Verify your admin role in the profiles table

### "Failed to delete" error
- Check Supabase connection
- Verify the `ip_proxies` table exists
- Check browser console for detailed errors

### Want to delete a different range?
Edit the button component (`components/delete-used-proxies-button.tsx`):
```tsx
const result = await deleteIPProxiesUpToLine(120) // Change this number
```

Or use SQL directly:
```sql
DELETE FROM public.ip_proxies 
WHERE line_number <= 150; -- Change this number
```

---

## Next Steps

After deleting the used proxies:

1. **Verify deletion** (see Verification section above)
2. **Update your source file** (optional)
   - If you want to keep proxyList300.txt clean
   - Remove lines 1-120 from the file
   - This prevents re-syncing deleted proxies

3. **Continue using the system**
   - VAs will now get proxies starting from line 121+
   - System will continue to assign in order

---

## Summary

**Easiest Method**: Use the "Delete Lines 1-120" button at `/admin/resources`

**Alternative**: Run the SQL script in Supabase SQL Editor

**Result**: All IP proxies from lines 1-120 will be permanently deleted

**Next Available**: Line 121 will be the next proxy assigned to a VA

---

## Questions?

- Button location: `/admin/resources` page, IP Proxies card, top-right
- Files changed: 4 files (action, component, page, SQL script)
- Time to delete: < 5 seconds
- Reversible: No (deletion is permanent)

Ready to delete? Go to `/admin/resources` and click the button! 🚀

