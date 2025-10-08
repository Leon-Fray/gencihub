import { createSupabaseAdminClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BulkIPDialog } from '@/components/bulk-ip-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/utils'

export default async function IPsPage() {
  const supabase = createSupabaseAdminClient()
  
  const { data: ips } = await supabase
    .from('ip_addresses')
    .select(`
      *,
      profiles!ip_addresses_last_used_by_id_fkey(full_name)
    `)
    .order('last_used_at', { ascending: false, nullsFirst: true })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IP Management</h1>
          <p className="mt-2 text-gray-600">Manage IP addresses for VA tasks</p>
        </div>
        <BulkIPDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>IP Addresses</CardTitle>
          <CardDescription>Manage the pool of IP addresses available for VAs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP Address</TableHead>
                <TableHead>Last Used By</TableHead>
                <TableHead>Last Used At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ips?.map((ip) => (
                <TableRow key={ip.id}>
                  <TableCell className="font-medium">
                    {ip.ip_address}
                  </TableCell>
                  <TableCell>
                    {ip.profiles?.full_name || 'Never used'}
                  </TableCell>
                  <TableCell>
                    {ip.last_used_at ? formatDateTime(ip.last_used_at) : 'Never'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
