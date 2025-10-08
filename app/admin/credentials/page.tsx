import { createSupabaseAdminClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateCredentialDialog } from '@/components/create-credential-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function CredentialsPage() {
  const supabase = createSupabaseAdminClient()
  
  const { data: credentials } = await supabase
    .from('account_credentials')
    .select('*')
    .order('platform_name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credential Vault</h1>
          <p className="mt-2 text-gray-600">Manage account credentials securely</p>
        </div>
        <CreateCredentialDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Credentials</CardTitle>
          <CardDescription>Securely stored account credentials for VAs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credentials?.map((credential) => (
                <TableRow key={credential.id}>
                  <TableCell className="font-medium">
                    {credential.platform_name}
                  </TableCell>
                  <TableCell>{credential.username}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
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
