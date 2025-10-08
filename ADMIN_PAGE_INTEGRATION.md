# Admin Page Integration Guide

## Adding IP Proxy Management to Admin Resources Page

To complete the integration, you'll need to add the IP Proxy sync button and display to your admin resources page.

## Quick Integration

### Option 1: Add to Existing Resources Page

If you have an `/admin/resources` page, add the IP Proxies section similar to how cookies are displayed:

```tsx
import { SyncIPProxiesButton } from '@/components/sync-ip-proxies-button'
import { getAllIPProxies } from '@/lib/actions'

export default async function ResourcesPage() {
  const ipProxies = await getAllIPProxies()
  
  return (
    <div className="space-y-8">
      {/* Existing sections... */}
      
      {/* IP Proxies Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>IP Proxies</CardTitle>
            <CardDescription>
              Manage IP proxies from proxyList300.txt
            </CardDescription>
          </div>
          <SyncIPProxiesButton />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left">Line #</th>
                  <th className="p-3 text-left">IP Proxy</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Assigned To</th>
                  <th className="p-3 text-left">Assigned At</th>
                </tr>
              </thead>
              <tbody>
                {ipProxies.map((ip) => (
                  <tr key={ip.id} className="border-b">
                    <td className="p-3 text-sm">#{ip.line_number}</td>
                    <td className="p-3 text-sm font-mono">{ip.ip_proxy}</td>
                    <td className="p-3 text-sm">
                      {ip.last_used_by_id ? (
                        <span className="text-orange-600">Assigned</span>
                      ) : (
                        <span className="text-green-600">Available</span>
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      {ip.last_used_by_id ? 'VA Name' : '-'}
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {ip.last_used_at 
                        ? new Date(ip.last_used_at).toLocaleDateString()
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Option 2: Create Dedicated IP Management Page

Create `/admin/ip-proxies/page.tsx`:

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SyncIPProxiesButton } from '@/components/sync-ip-proxies-button'
import { getAllIPProxies, getResourceAssignments } from '@/lib/actions'

export default async function IPProxiesPage() {
  const ipProxies = await getAllIPProxies()
  const assignments = await getResourceAssignments()
  
  const ipAssignments = assignments.filter(a => a.ip_proxy_id)
  const availableCount = ipProxies.filter(ip => !ip.last_used_by_id).length
  const assignedCount = ipProxies.filter(ip => ip.last_used_by_id).length
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">IP Proxy Management</h1>
          <p className="text-gray-600">Manage IP proxies from proxyList300.txt</p>
        </div>
        <SyncIPProxiesButton />
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{ipProxies.length}</CardTitle>
            <CardDescription>Total IPs</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">{availableCount}</CardTitle>
            <CardDescription>Available</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">{assignedCount}</CardTitle>
            <CardDescription>Assigned</CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      {/* IP List */}
      <Card>
        <CardHeader>
          <CardTitle>All IP Proxies</CardTitle>
          <CardDescription>From proxyList300.txt</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Table from Option 1 */}
        </CardContent>
      </Card>
      
      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent IP Assignments</CardTitle>
          <CardDescription>Latest IP proxy assignments to VAs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ipAssignments.slice(0, 10).map((assignment) => (
              <div key={assignment.id} className="flex justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{assignment.profiles?.full_name}</p>
                  <p className="text-sm text-gray-600 font-mono">
                    {assignment.ip_proxies?.ip_proxy}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {new Date(assignment.assigned_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

## What You Need to Do

1. **Run the database migration:**
   - Go to Supabase SQL Editor
   - Run `supabase/migrations/add_ip_proxies_table.sql`

2. **Create the storage bucket:**
   - Go to Supabase Dashboard → Storage
   - Create new bucket: `ips` (private)

3. **Set storage policies:**
   - Run `supabase/storage_policies_ips.sql` in SQL Editor

4. **Upload your IP file:**
   - Create `proxyList300.txt` with one IP per line
   - Upload to the `ips` bucket

5. **Add UI to admin page:**
   - Choose Option 1 or Option 2 above
   - Add the code to your admin page

6. **Test the system:**
   - Click "Sync from Storage" as admin
   - Request an IP as VA
   - Verify assignment appears in admin view

## File Location Reminder

The sync button component is already created at:
- `components/sync-ip-proxies-button.tsx`

Just import it and add it to your admin page!

## Example: If You Have a Resources Page Like Cookies

Look for where you have:
```tsx
<SyncCookiesButton />
```

Add the IP proxies section right next to it with:
```tsx
<SyncIPProxiesButton />
```

That's it! The system will work exactly like the cookie system.

