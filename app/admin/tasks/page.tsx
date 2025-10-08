import { createSupabaseAdminClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateTaskDialog } from '@/components/create-task-dialog'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function TasksPage() {
  const supabase = createSupabaseAdminClient()
  
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      profiles!tasks_assigned_to_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'va')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="mt-2 text-gray-600">Create and manage tasks for your VAs</p>
        </div>
        <CreateTaskDialog users={users || []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>Manage tasks assigned to your VAs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks?.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{task.title}</h3>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </div>
                    {task.task_type === 'subreddit_upvote' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Upvote Task
                      </span>
                    )}
                    {task.task_type === 'general' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        General
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>👤 {task.profiles?.full_name || 'Unassigned'}</span>
                    {task.due_date && (
                      <span>📅 {formatDate(task.due_date)}</span>
                    )}
                    <span>🕒 {formatDate(task.created_at)}</span>
                  </div>
                  {task.target_subreddits && task.task_type === 'subreddit_upvote' && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">🎯 Target Subreddits ({Array.isArray(task.target_subreddits) ? task.target_subreddits.length : 0}): </span>
                      <span className="text-sm font-medium">
                        {Array.isArray(task.target_subreddits) 
                          ? task.target_subreddits.slice(0, 5).map((s: string) => `r/${s}`).join(', ') + (task.target_subreddits.length > 5 ? `, +${task.target_subreddits.length - 5} more` : '')
                          : task.target_subreddits
                        }
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Link href={`/admin/tasks/${task.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case 'To Do':
      return 'bg-gray-100 text-gray-800'
    case 'In Progress':
      return 'bg-blue-100 text-blue-800'
    case 'Completed':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
