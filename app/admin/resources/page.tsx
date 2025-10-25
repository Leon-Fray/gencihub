import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateCookieDialog } from '@/components/create-cookie-dialog'
import { CreateRedirectLinkDialog } from '@/components/create-redirect-link-dialog'
import { SyncCookiesButton } from '@/components/sync-cookies-button'
import { VerifyCookieSetupButton } from '@/components/verify-cookie-setup-button'
import { DeleteUsedProxiesButton } from '@/components/delete-used-proxies-button'
import { DeleteCookieButton } from '@/components/delete-cookie-button'
import { DeleteIPProxyButton } from '@/components/delete-ip-proxy-button'
import { UploadCookieDialog } from '@/components/upload-cookie-dialog'
import { AddProxiesDialog } from '@/components/add-proxies-dialog'
import { SyncProxiesButton } from '@/components/sync-proxies-button'
import { ClearAndResyncProxiesButton } from '@/components/clear-and-resync-proxies-button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/utils'
import { getAllCookies, getAllRedirectLinks, getAllIPProxies, getResourceAssignments } from '@/lib/actions'

export default async function ResourcesPage() {
  // Fetch real data from Supabase
  const cookies = await getAllCookies()
  const ipProxies = await getAllIPProxies()
  const redirectLinks = await getAllRedirectLinks()
  const resourceAssignments = await getResourceAssignments()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
          <p className="mt-2 text-gray-600">Manage cookies, IP proxies, redirect links, and track resource assignments</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <VerifyCookieSetupButton />
          <SyncCookiesButton />
          <UploadCookieDialog />
          <CreateCookieDialog />
          <CreateRedirectLinkDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cookies Management */}
        <Card>
          <CardHeader>
            <CardTitle>Cookie Files</CardTitle>
            <CardDescription>
              Upload single or multiple cookie files - they'll be automatically renamed to Cookie_1, Cookie_2, etc.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cookie Name</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Assignment Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cookies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      No cookies found. Click &quot;Upload Cookie File&quot; to add cookie files automatically.
                    </TableCell>
                  </TableRow>
                ) : (
                  cookies.map((cookie) => (
                    <TableRow key={cookie.id}>
                      <TableCell className="font-medium">
                        {cookie.cookie_name}
                      </TableCell>
                      <TableCell>
                        {cookie.last_used_at ? formatDateTime(cookie.last_used_at) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cookie.last_used_by_id ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {cookie.last_used_by_id ? 'Assigned' : 'Available'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DeleteCookieButton 
                          cookieId={cookie.id} 
                          cookieName={cookie.cookie_name}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* IP Proxies Management */}
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle>IP Proxies</CardTitle>
                <CardDescription>Manage IP proxies from proxyListNew.txt</CardDescription>
              </div>
              <DeleteUsedProxiesButton />
            </div>
            <div className="flex flex-wrap gap-2">
              <ClearAndResyncProxiesButton />
              <SyncProxiesButton />
              <AddProxiesDialog />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line #</TableHead>
                  <TableHead>IP Proxy</TableHead>
                  <TableHead>Assignment Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ipProxies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      No IP proxies found. Click &quot;Sync from File&quot; to load proxies from proxyListNew.txt.
                    </TableCell>
                  </TableRow>
                ) : (
                  ipProxies.map((ip) => (
                    <TableRow key={ip.id}>
                      <TableCell className="font-medium">
                        #{ip.line_number}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {ip.ip_proxy}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ip.last_used_by_id ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {ip.last_used_by_id ? 'Assigned' : 'Available'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DeleteIPProxyButton 
                          ipProxyId={ip.id} 
                          ipProxy={ip.ip_proxy}
                          lineNumber={ip.line_number}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Redirect Links Management */}
        <Card>
          <CardHeader>
            <CardTitle>Redirect Links</CardTitle>
            <CardDescription>Manage redirect links for tracking and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redirectLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">
                      {link.link_url}
                    </TableCell>
                    <TableCell>
                      {link.slug}
                    </TableCell>
                    <TableCell>
                      {link.last_used_at ? formatDateTime(link.last_used_at) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        link.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {link.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Resource Assignment Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Assignment History</CardTitle>
          <CardDescription>Track which resources have been assigned to which users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>IP Proxy</TableHead>
                <TableHead>Cookie</TableHead>
                <TableHead>Redirect Link</TableHead>
                <TableHead>Assignment Type</TableHead>
                <TableHead>Assigned At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resourceAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No resource assignments yet.
                  </TableCell>
                </TableRow>
              ) : (
                resourceAssignments.map((assignment: any) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {assignment.profiles?.full_name || 'Unknown User'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {assignment.ip_proxies?.ip_proxy || '-'}
                    </TableCell>
                    <TableCell>
                      {assignment.cookies?.cookie_name || '-'}
                    </TableCell>
                    <TableCell>
                      {assignment.redirect_links?.link_url || '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        assignment.assignment_type === 'new_account' ? 'bg-blue-100 text-blue-800' :
                        assignment.assignment_type === 'task' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.assignment_type.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatDateTime(assignment.assigned_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
