import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DeleteTaskButton } from '@/components/delete-task-button'

interface AdminTaskDetailPageProps {
  params: {
    id: string
  }
}

export default async function AdminTaskDetailPage({ params }: AdminTaskDetailPageProps) {
  const supabase = createSupabaseAdminClient()
  
  // Fetch the task with assigned user info
  const { data: task, error } = await supabase
    .from('tasks')
    .select(`
      *,
      profiles!tasks_assigned_to_id_fkey(id, full_name, role)
    `)
    .eq('id', params.id)
    .single()

  if (error || !task) {
    redirect('/admin/tasks')
  }

  const isUpvoteTask = task.task_type === 'subreddit_upvote'
  const targetSubreddits = task.target_subreddits || []

  // Fetch work logs for this task
  const { data: workLogs } = await supabase
    .from('work_logs')
    .select(`
      *,
      profiles!work_logs_va_id_fkey(full_name)
    `)
    .eq('task_id', task.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/admin/tasks" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← Back to Tasks
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
          <p className="mt-2 text-gray-600">
            Task Details and Management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          <DeleteTaskButton taskId={task.id} />
        </div>
      </div>

      {/* Main Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Information */}
        <Card>
          <CardHeader>
            <CardTitle>Task Information</CardTitle>
            <CardDescription>Core details about this task</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-gray-500">Task Type</h3>
              <p className="text-gray-900 mt-1">
                {isUpvoteTask ? (
                  <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm">
                    🎯 Subreddit Upvote Task
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm">
                    📋 General Task
                  </span>
                )}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-gray-500">Description</h3>
              <p className="text-gray-900 mt-1">{task.description || 'No description provided'}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-gray-500">Status</h3>
              <p className="text-gray-900 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500">Created</h3>
                <p className="text-gray-900 mt-1">{formatDate(task.created_at)}</p>
              </div>
              
              {task.due_date && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Due Date</h3>
                  <p className="text-gray-900 mt-1">{formatDate(task.due_date)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
            <CardDescription>Who is working on this task</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-gray-500">Assigned To</h3>
              <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                {task.profiles ? (
                  <div>
                    <p className="font-medium text-gray-900">{task.profiles.full_name}</p>
                    <p className="text-sm text-gray-500 mt-1">Role: {task.profiles.role.toUpperCase()}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Unassigned</p>
                )}
              </div>
            </div>

            {task.profiles && (
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-2">Quick Actions</h3>
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/users`}>
                      View User Profile
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/scheduler`}>
                      View User Schedule
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subreddit List for Upvote Tasks */}
      {isUpvoteTask && targetSubreddits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Target Subreddits</span>
              <span className="text-sm font-normal text-gray-500">
                {targetSubreddits.length} subreddits assigned
              </span>
            </CardTitle>
            <CardDescription>Subreddits assigned for this upvote task</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {targetSubreddits.map((subreddit: string, index: number) => (
                <div key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">r/{subreddit}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Work Logs</span>
            <span className="text-sm font-normal text-gray-500">
              {workLogs?.length || 0} entries
            </span>
          </CardTitle>
          <CardDescription>Activity and notes logged for this task</CardDescription>
        </CardHeader>
        <CardContent>
          {workLogs && workLogs.length > 0 ? (
            <div className="space-y-4">
              {workLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{log.profiles?.full_name || 'Unknown User'}</p>
                      <p className="text-sm text-gray-500">{formatDate(log.created_at)}</p>
                    </div>
                  </div>
                  {log.notes && (
                    <p className="text-gray-700 mt-2">{log.notes}</p>
                  )}
                  {(log.ip_used || log.redirect_link_created) && (
                    <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                      {log.ip_used && (
                        <p>IP Used: <span className="font-mono">{log.ip_used}</span></p>
                      )}
                      {log.redirect_link_created && (
                        <p>Redirect Link: <span className="font-mono">{log.redirect_link_created}</span></p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No work logs yet</p>
          )}
        </CardContent>
      </Card>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Work Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{workLogs?.length || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Total entries</p>
          </CardContent>
        </Card>

        {isUpvoteTask && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subreddits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{targetSubreddits.length}</p>
              <p className="text-sm text-gray-500 mt-1">Total targets</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Time Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{new Date(task.created_at).toLocaleDateString()}</p>
            <p className="text-sm text-gray-500 mt-1">{new Date(task.created_at).toLocaleTimeString()}</p>
          </CardContent>
        </Card>
      </div>
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

