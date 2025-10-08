# Resource Deletion Guide - Individual Delete for Cookies & IP Proxies

## Overview

Admins can now delete individual cookies and IP proxies directly from the resource management page. Each item has its own delete button for easy management.

---

## Features Added

### ✅ Individual Cookie Deletion
- Delete any cookie one at a time
- Confirmation dialog before deletion
- Shows which cookie will be deleted
- Success/error notifications

### ✅ Individual IP Proxy Deletion
- Delete any IP proxy one at a time
- Confirmation dialog before deletion
- Shows line number and IP address
- Success/error notifications

### ✅ Bulk IP Proxy Deletion
- "Delete Lines 1-120" button (existing feature)
- Deletes multiple proxies at once
- Useful for removing already-used proxies

---

## How to Use

### Delete Individual Cookies

1. **Navigate to Resources**
   - Go to `/admin/resources`
   - Or click "Resources" in admin navigation

2. **Find the Cookie**
   - Look in the "Cookie Files" card
   - Each cookie row has a trash icon on the right

3. **Click Delete**
   - Click the trash icon (🗑️) for the cookie you want to delete
   - A confirmation dialog will appear showing the cookie name

4. **Confirm**
   - Click "OK" to confirm deletion
   - Or "Cancel" to abort

5. **Done!**
   - Success message appears
   - The cookie is removed from the list
   - Page automatically updates

---

### Delete Individual IP Proxies

1. **Navigate to Resources**
   - Go to `/admin/resources`
   - Or click "Resources" in admin navigation

2. **Find the IP Proxy**
   - Look in the "IP Proxies" card
   - Each proxy row has a trash icon on the right

3. **Click Delete**
   - Click the trash icon (🗑️) for the proxy you want to delete
   - A confirmation dialog will appear showing:
     - Line number (e.g., Line #42)
     - IP address (e.g., 123.45.67.89:8080)

4. **Confirm**
   - Click "OK" to confirm deletion
   - Or "Cancel" to abort

5. **Done!**
   - Success message appears
   - The proxy is removed from the list
   - Page automatically updates

---

### Bulk Delete IP Proxies (Lines 1-120)

This is useful for removing proxies that have already been used.

1. **Navigate to Resources**
   - Go to `/admin/resources`

2. **Find Bulk Delete Button**
   - In the "IP Proxies" card header
   - Red "Delete Lines 1-120" button in top-right

3. **Click and Confirm**
   - Click the button
   - Confirm in the dialog
   - All proxies from lines 1-120 will be deleted

4. **Done!**
   - Success message shows how many were deleted
   - Page shows remaining proxies (121+)

---

## Visual Guide

### Cookie Table with Delete Buttons

```
┌─────────────────────────────────────────────────────────┐
│ Cookie Files                                            │
├─────────────────┬──────────────┬─────────────┬─────────┤
│ Cookie Name     │ Last Used    │ Status      │ Actions │
├─────────────────┼──────────────┼─────────────┼─────────┤
│ cookie_001.txt  │ 2 hours ago  │ Assigned    │ 🗑️      │
│ cookie_002.txt  │ Never        │ Available   │ 🗑️      │
│ cookie_003.txt  │ 1 day ago    │ Assigned    │ 🗑️      │
└─────────────────┴──────────────┴─────────────┴─────────┘
```

### IP Proxy Table with Delete Buttons

```
┌─────────────────────────────────────────────────────────────────────┐
│ IP Proxies                           [Delete Lines 1-120] ←Bulk     │
├────────┬──────────────────────┬─────────────┬─────────────────────┤
│ Line # │ IP Proxy             │ Status      │ Actions             │
├────────┼──────────────────────┼─────────────┼─────────────────────┤
│ #121   │ 123.45.67.89:8080   │ Available   │ 🗑️ ←Individual      │
│ #122   │ 98.76.54.32:3128    │ Assigned    │ 🗑️                  │
│ #123   │ 192.168.1.100:8888  │ Available   │ 🗑️                  │
└────────┴──────────────────────┴─────────────┴─────────────────────┘
```

---

## What Was Implemented

### 1. Server Actions (lib/actions.ts)

#### `deleteCookie(cookieId: number)`
- Deletes a single cookie by ID
- Returns success message with cookie name
- Revalidates admin resources page
- Handles errors gracefully

#### `deleteIPProxy(ipProxyId: number)`
- Deletes a single IP proxy by ID
- Returns success message with line number and IP
- Revalidates admin resources and IPs pages
- Handles errors gracefully

#### `deleteIPProxiesUpToLine(lineNumber: number)` (existing)
- Bulk delete proxies up to specified line
- Returns count of deleted proxies
- Used by "Delete Lines 1-120" button

---

### 2. Client Components

#### `DeleteCookieButton` (components/delete-cookie-button.tsx)
- Small trash icon button
- Shows confirmation dialog
- Displays loading state
- Shows toast notifications
- Hover effect (gray → red)

#### `DeleteIPProxyButton` (components/delete-ip-proxy-button.tsx)
- Small trash icon button
- Shows confirmation dialog with line # and IP
- Displays loading state
- Shows toast notifications
- Hover effect (gray → red)

#### `DeleteUsedProxiesButton` (existing)
- Bulk delete button for lines 1-120
- Red destructive button
- Located in card header

---

### 3. Updated UI (app/admin/resources/page.tsx)

**Changes:**
- Added new column "Actions" to both tables
- Each row now has a delete button
- Buttons are right-aligned in the table
- Responsive and accessible design

**Cookie Table Columns:**
1. Cookie Name
2. Last Used
3. Assignment Status
4. Actions (delete button) ← **NEW**

**IP Proxy Table Columns:**
1. Line #
2. IP Proxy
3. Assignment Status
4. Actions (delete button) ← **NEW**

---

## Technical Details

### Database Operations

**Cookies:**
- Table: `cookies`
- Deletes by: `id`
- Cascade: May delete related resource assignments (check your DB schema)

**IP Proxies:**
- Table: `ip_proxies`
- Deletes by: `id`
- Cascade: May delete related resource assignments (check your DB schema)

### Security

- All delete actions require admin authentication
- Confirmation dialogs prevent accidental deletion
- Server-side validation via RLS policies
- Only admins can access these functions

### Error Handling

**Possible Errors:**
- "Failed to fetch cookie/proxy" - Item doesn't exist
- "Failed to delete cookie/proxy" - Database error or permission denied
- Network errors - Connection issues

**User Experience:**
- All errors shown via toast notifications
- Error messages are clear and actionable
- Failed deletions don't break the page
- Loading states prevent duplicate clicks

---

## Important Notes

### ⚠️ Deletion is Permanent
- Deleted items cannot be recovered
- No undo functionality
- Always confirm you're deleting the right item

### 📋 Resource Assignments
- Check your database schema for cascade behavior
- Deleting a cookie/proxy may affect resource assignments
- VAs who already used these resources keep their assignment records
- Only the cookie/proxy entry is deleted

### 🔄 Page Updates
- After deletion, the page automatically refreshes
- No need to manually reload
- Changes are immediate

### 🎯 Best Practices
1. **Review before deleting** - Make sure you're deleting the right item
2. **Check assignments** - See if the resource is currently assigned
3. **Bulk operations** - Use "Delete Lines 1-120" for many items
4. **Keep records** - Resource assignments table maintains history

---

## Troubleshooting

### Delete button doesn't appear
**Solution:**
- Make sure you're logged in as admin
- Check you're on `/admin/resources` page
- Refresh the page
- Verify admin role in database

### "Permission denied" error
**Solution:**
- Verify admin role in `profiles` table
- Check RLS policies on `cookies` and `ip_proxies` tables
- Ensure you're authenticated

### Delete button is disabled
**Reason:**
- Deletion is in progress
- Wait for the current operation to complete

### "Failed to delete" error
**Possible causes:**
1. Database connection issue
2. RLS policy blocking deletion
3. Foreign key constraint violation
4. Item already deleted by another admin

**Solution:**
- Refresh the page to see current state
- Check Supabase logs for details
- Verify RLS policies allow admin deletion

### No confirmation dialog appears
**Solution:**
- Check browser isn't blocking JavaScript
- Ensure browser allows `window.confirm()`
- Try a different browser
- Check console for errors

---

## Comparison: Individual vs Bulk Delete

| Feature | Individual Delete | Bulk Delete (Lines 1-120) |
|---------|------------------|---------------------------|
| **Speed** | One at a time | All at once |
| **Precision** | Exact control | Range-based |
| **Use Case** | Remove specific items | Remove many used proxies |
| **Confirmation** | Per item | Once for all |
| **Undo** | Not available | Not available |
| **Best For** | Careful management | Cleanup operations |

---

## Use Cases

### When to Use Individual Delete

1. **Remove a bad cookie**
   - Cookie file is corrupted
   - Wrong account credentials
   - Duplicate entry

2. **Remove specific IP proxy**
   - Proxy is not working
   - Proxy is banned
   - Wrong proxy added

3. **Clean up one-by-one**
   - Careful resource management
   - Verify each deletion
   - Small cleanup tasks

### When to Use Bulk Delete

1. **Remove used proxies**
   - Lines 1-120 already assigned
   - Clear out old proxies
   - Make room for new ones

2. **Large cleanup**
   - Many proxies to remove
   - Known range of bad proxies
   - Mass deletion needed

---

## Files Modified

1. ✅ **lib/actions.ts**
   - Added `deleteCookie()` function
   - Added `deleteIPProxy()` function
   - Existing `deleteIPProxiesUpToLine()` function

2. ✅ **components/delete-cookie-button.tsx** (NEW)
   - Client component for cookie deletion
   - Handles UI and user interaction

3. ✅ **components/delete-ip-proxy-button.tsx** (NEW)
   - Client component for IP proxy deletion
   - Handles UI and user interaction

4. ✅ **app/admin/resources/page.tsx**
   - Added delete buttons to cookie table
   - Added delete buttons to IP proxy table
   - Updated table columns

5. ✅ **components/delete-used-proxies-button.tsx** (EXISTING)
   - Bulk delete button for lines 1-120

---

## Testing Checklist

Before deploying:

- [ ] Delete a cookie that's never been used
- [ ] Delete a cookie that's been assigned
- [ ] Delete an IP proxy that's available
- [ ] Delete an IP proxy that's assigned
- [ ] Test bulk delete (lines 1-120)
- [ ] Verify confirmation dialogs appear
- [ ] Check success notifications show
- [ ] Test error handling (delete non-existent item)
- [ ] Verify page updates after deletion
- [ ] Test as non-admin (should fail)
- [ ] Check database to confirm deletion
- [ ] Verify resource assignments still exist

---

## Summary

**What You Can Now Do:**
1. ✅ Delete individual cookies with one click
2. ✅ Delete individual IP proxies with one click
3. ✅ Bulk delete IP proxies (lines 1-120)
4. ✅ See confirmation before any deletion
5. ✅ Get instant feedback on success/failure

**How to Access:**
- Navigate to `/admin/resources`
- Look for trash icons (🗑️) on each row
- Or use the bulk delete button in IP Proxies header

**Safety Features:**
- Confirmation dialogs on every deletion
- Clear messages showing what will be deleted
- Error handling with helpful messages
- Admin-only access via RLS policies

---

Ready to manage your resources more efficiently! 🚀

