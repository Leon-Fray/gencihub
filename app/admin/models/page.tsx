import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { CreateModelDialog } from '@/components/create-model-dialog'
import { EditModelDialog } from '@/components/edit-model-dialog'
import { getModels, getAllVAsWithModels, deactivateModel } from '@/lib/model-actions'
import { ExternalLink, Users } from 'lucide-react'
import Link from 'next/link'

export default async function ModelsPage() {
  const [models, vasWithModels] = await Promise.all([
    getModels(),
    getAllVAsWithModels(),
  ])

  // Count how many VAs are assigned to each model
  const modelAssignmentCounts = models.map(model => {
    const count = vasWithModels.filter(va => 
      va.models?.some((m: any) => m.id === model.id)
    ).length
    return { ...model, assignedCount: count }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Model Management</h1>
          <p className="mt-2 text-gray-600">Manage celebrity models and their assignments to VAs</p>
        </div>
        <CreateModelDialog />
      </div>

      {/* Models Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vasWithModels.reduce((acc, va) => acc + (va.models?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VAs with Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vasWithModels.filter(va => va.models && va.models.length > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned VAs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vasWithModels.filter(va => !va.models || va.models.length === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Models List */}
      <Card>
        <CardHeader>
          <CardTitle>All Models</CardTitle>
          <CardDescription>View and manage celebrity models</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead>Google Drive</TableHead>
                <TableHead>Assigned VAs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelAssignmentCounts && modelAssignmentCounts.length > 0 ? (
                modelAssignmentCounts.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">
                      {model.name}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="truncate text-sm text-gray-600">
                        {model.bio}
                      </p>
                    </TableCell>
                    <TableCell>
                      <a
                        href={model.google_drive_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Drive
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{model.assignedCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditModelDialog model={model} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No models found. Create your first model to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* VAs and Their Assigned Models */}
      <Card>
        <CardHeader>
          <CardTitle>Model Assignments by VA</CardTitle>
          <CardDescription>View which models are assigned to each Virtual Assistant</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>VA Name</TableHead>
                <TableHead>Assigned Models</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vasWithModels && vasWithModels.length > 0 ? (
                vasWithModels.map((va) => (
                  <TableRow key={va.id}>
                    <TableCell className="font-medium">
                      {va.full_name || 'No name provided'}
                    </TableCell>
                    <TableCell>
                      {va.models && va.models.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {va.models.map((model: any) => (
                            <span
                              key={model.id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                            >
                              {model.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No models assigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href="/admin/users">
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    No VAs found.
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

