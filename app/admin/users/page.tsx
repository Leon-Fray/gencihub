import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { CreateUserDialog } from '@/components/create-user-dialog'
import { AssignModelDialog } from '@/components/assign-model-dialog'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase'
import { getModels, getVAModelAssignments, removeModelFromVA } from '@/lib/model-actions'
import { X } from 'lucide-react'
import { RemoveModelButton } from '@/components/remove-model-button'

export default async function UsersPage() {
  const supabase = createSupabaseAdminClient()
  const supabaseServer = createSupabaseServerClient()
  
  // Fetch real users from database
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')

  if (profileError) {
    console.error('Error fetching profiles:', profileError)
  }

  // Fetch auth users to get email addresses and created_at
  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('Error fetching auth users:', authError)
  }

  // Fetch all models
  const allModels = await getModels()

  // Get current logged-in admin user for assignment tracking
  const { data: { session } } = await supabaseServer.auth.getSession()
  const currentUser = session?.user || null

  // Combine profile and auth data, and fetch model assignments for VAs
  const usersWithModels = await Promise.all(
    profiles?.map(async profile => {
      const authUser = authUsers?.find(u => u.id === profile.id)
      let modelAssignments = []
      
      if (profile.role === 'va') {
        modelAssignments = await getVAModelAssignments(profile.id)
      }
      
      return {
        ...profile,
        email: authUser?.email || 'N/A',
        created_at: authUser?.created_at || new Date().toISOString(),
        assignedModels: modelAssignments
      }
    }) || []
  )

  const users = usersWithModels.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  console.log('Profiles found:', profiles?.length || 0)
  console.log('Auth users found:', authUsers?.length || 0)
  console.log('Combined users:', users.length)
  console.log('Current user:', currentUser?.id)
  console.log('Available models:', allModels.length)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">Manage users and their roles in the system</p>
        </div>
        <CreateUserDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View and manage user accounts and model assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Models</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user) => {
                  // Get models that are NOT assigned to this VA
                  const assignedModelIds = user.assignedModels?.map((a: any) => a.model_id) || []
                  const availableModels = allModels.filter(m => !assignedModelIds.includes(m.id))
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name || 'No name provided'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.role === 'va' ? (
                          <div className="flex flex-wrap gap-2">
                            {user.assignedModels && user.assignedModels.length > 0 ? (
                              user.assignedModels.map((assignment: any) => (
                                <div key={assignment.id} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {assignment.model?.name}
                                  <RemoveModelButton 
                                    vaId={user.id}
                                    modelId={assignment.model_id}
                                  />
                                </div>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">No models assigned</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role === 'va' && currentUser && (
                          <AssignModelDialog 
                            vaId={user.id}
                            vaName={user.full_name || user.email}
                            availableModels={availableModels}
                            currentUser={{ id: currentUser.id }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No users found. Create your first user to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function getRoleColor(role: string) {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800'
    case 'va':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
