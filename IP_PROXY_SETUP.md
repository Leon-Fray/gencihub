# IP Proxy System Setup Guide

## Overview

The IP Proxy system allows VAs to request unique IP proxy addresses from a file (`proxyList300.txt`) stored in Supabase Storage. Each IP is assigned only once to ensure no two VAs use the same IP proxy.

## Quick Setup

### 1. Run the Database Migration

Execute the migration to create the `ip_proxies` table:

```bash
# In your Supabase SQL Editor, run:
supabase/migrations/add_ip_proxies_table.sql
```

Or if using Supabase CLI:

```bash
supabase migration up
```

### 2. Create Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Create a new bucket named `ips`
3. Set the bucket to **Private** (recommended for security)

### 3. Upload IP Proxy File

1. Create or prepare your `proxyList300.txt` file with one IP proxy per line:
   ```
   123.45.67.89:8080
   98.76.54.32:3128
   192.168.1.100:8888
   ...
   ```

2. Upload `proxyList300.txt` to the `ips` bucket in Supabase Storage

### 4. Sync IPs from Storage

As an admin:
1. Go to `/admin/resources` page
2. Click **"Sync from Storage"** button in the IP Proxies section
3. The system will read the file and populate the database

## How It Works

### For Admins

**Syncing IP Proxies:**
- The sync function reads `proxyList300.txt` from the `ips` storage bucket
- Each line becomes an IP proxy entry in the database
- Line numbers are tracked to maintain order
- Only new IPs are added (duplicates are skipped)
- You can run sync multiple times safely

**Managing IP Proxies:**
- View all IP proxies in `/admin/resources`
- See which IPs are assigned to which VAs
- Track when each IP was assigned

### For VAs

**Requesting an IP Proxy:**
1. Go to `/dashboard/new-account`
2. Click **"Request IP"** button
3. The next available IP proxy is assigned
4. IP is automatically copied to clipboard
5. IP is permanently assigned (one-time use only)

**Important Notes:**
- Each IP proxy can only be assigned once
- Once assigned, you cannot request another IP
- The IP is automatically copied to your clipboard
- You can copy it again using the "Copy IP Proxy" button

## File Structure

### New Files
- `components/request-ip-button.tsx` - VA button to request IP proxies
- `components/sync-ip-proxies-button.tsx` - Admin button to sync from storage
- `supabase/migrations/add_ip_proxies_table.sql` - Database migration
- `IP_PROXY_SETUP.md` - This setup guide

### Modified Files
- `lib/actions.ts` - Added `getAvailableIPProxy()`, `syncIPProxiesFromStorage()`, `getAllIPProxies()`
- `components/new-account-page-client.tsx` - Added IP request button

## Database Schema

### `ip_proxies` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key (auto-increment) |
| `ip_proxy` | TEXT | The IP proxy string (unique) |
| `line_number` | INT | Line number from the file |
| `created_at` | TIMESTAMPTZ | When added to database |
| `last_used_by_id` | UUID | VA who was assigned this IP |
| `last_used_at` | TIMESTAMPTZ | When it was assigned |
| `is_active` | BOOLEAN | Whether IP is active |

### Key Features

**One-Time Assignment:**
```typescript
.is('last_used_by_id', null) // Only unassigned IPs
.order('line_number', { ascending: true }) // Sequential order
```

**Automatic Clipboard Copy:**
```typescript
await navigator.clipboard.writeText(data.ip_proxy)
```

## Testing the System

### Test as Admin

1. Go to `/admin/resources`
2. Click "Sync from Storage" in the IP Proxies section
3. Verify IPs appear in the table with "Available" status
4. Check the Resource Assignments section (should be empty initially)

### Test as VA

1. Go to `/dashboard/new-account`
2. Scroll to "Request Resources" section
3. Click "Request IP" button
4. You should see:
   - IP proxy address
   - Line number from file
   - **IP automatically copied to clipboard!**
   - Copy button to copy again if needed
   - Permanent assignment notice

5. Paste (Ctrl+V) somewhere to verify the IP was copied
6. Go back to `/admin/resources` as admin to verify assignment

## Troubleshooting

### "File not found" error
- Ensure the bucket is named exactly `ips`
- Ensure the file is named exactly `proxyList300.txt`
- Check file is in the root of the bucket (not in a subfolder)

### "All IPs assigned" error
- All IPs in the file have been assigned to VAs
- Add more IPs to `proxyList300.txt`
- Run sync again to load new IPs

### IPs not appearing after sync
- Check browser console for errors
- Verify database migration ran successfully
- Ensure you have admin privileges

## Storage Policies

The `ips` bucket should have the following policies:

**Admin Access (Read/Write):**
```sql
-- Admins can read from ips bucket
CREATE POLICY "Admins can read ips"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ips' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can upload to ips bucket
CREATE POLICY "Admins can upload ips"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ips' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## Comparison with Cookie System

The IP Proxy system follows the same pattern as the Cookie system:

| Feature | Cookies | IP Proxies |
|---------|---------|------------|
| Storage Location | `cookies` bucket | `ips` bucket |
| Source File | Various `.json`/`.txt` files | `proxyList300.txt` |
| Assignment | One-time only | One-time only |
| Auto-copy | ✓ | ✓ |
| Line tracking | ✗ | ✓ (line numbers) |
| Sync function | `syncCookiesFromStorage()` | `syncIPProxiesFromStorage()` |

## Future Enhancements

Potential improvements:
- Support for multiple IP list files
- IP proxy validation
- Bulk IP upload via UI
- IP proxy rotation (if needed)
- Export assigned IPs report
- IP proxy testing/verification

