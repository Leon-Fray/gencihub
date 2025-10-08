import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { createSupabaseServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UpdateTaskStatusButton } from '@/components/update-task-status-button'
import { TargetSubredditsList } from '@/components/target-subreddits-list'
import { WorkNotesForm } from '@/components/work-notes-form'
import { UpvoteBot } from '@/components/upvote-bot'

interface TaskDetailPageProps {
  params: {
    id: string
  }
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const supabase = createSupabaseServerClient()
  
  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/')
  }

  // Fetch the task
  const { data: task, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !task) {
    redirect('/dashboard')
  }

  // Verify this task is assigned to the current user
  if (task.assigned_to_id !== session.user.id) {
    redirect('/dashboard')
  }

  const isUpvoteTask = task.task_type === 'subreddit_upvote'
  const targetSubreddits = task.target_subreddits || []
  
  // Get completed subreddits from the task
  const completedSubreddits: string[] = Array.isArray(task.completed_subreddits) 
    ? task.completed_subreddits 
    : []
  const remainingSubreddits = targetSubreddits.filter((sub: string) => !completedSubreddits.includes(sub))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
          <p className="mt-2 text-gray-600">
            {isUpvoteTask ? 'Subreddit Upvote Task' : 'General Task'}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          {isUpvoteTask && targetSubreddits.length > 0 && (
            <span className="text-sm text-gray-500">
              Progress: {completedSubreddits.length}/{targetSubreddits.length} subreddits
            </span>
          )}
        </div>
      </div>

      {/* Task Details */}
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>Complete information about this task</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-sm text-gray-500">Task Type</h3>
            <p className="text-gray-900 mt-1">
              {isUpvoteTask ? (
                <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm">
                  Subreddit Upvote Task
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm">
                  General Task
                </span>
              )}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-sm text-gray-500">Description</h3>
            <p className="text-gray-900 mt-1">{task.description || 'No description provided'}</p>
          </div>
          
          {task.due_date && (
            <div>
              <h3 className="font-medium text-sm text-gray-500">Due Date</h3>
              <p className="text-gray-900 mt-1">{formatDate(task.due_date)}</p>
            </div>
          )}
          
          <div>
            <h3 className="font-medium text-sm text-gray-500">Created</h3>
            <p className="text-gray-900 mt-1">{formatDate(task.created_at)}</p>
          </div>

          {isUpvoteTask && targetSubreddits.length > 0 && (
            <div>
              <h3 className="font-medium text-sm text-gray-500">Progress</h3>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Completed</span>
                  <span>{completedSubreddits.length}/{targetSubreddits.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${targetSubreddits.length > 0 ? (completedSubreddits.length / targetSubreddits.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <h3 className="font-medium text-sm text-gray-500 mb-3">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              <UpdateTaskStatusButton taskId={task.id} currentStatus={task.status} newStatus="To Do" />
              <UpdateTaskStatusButton taskId={task.id} currentStatus={task.status} newStatus="In Progress" />
              <UpdateTaskStatusButton taskId={task.id} currentStatus={task.status} newStatus="Completed" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditionally show subreddit-specific content */}
      {isUpvoteTask && targetSubreddits.length > 0 && (
        <>
          {/* Subreddit List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Target Subreddits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>🎯 Target Subreddits</span>
                  <span className="text-sm font-normal text-gray-500">
                    {targetSubreddits.length} total
                  </span>
                </CardTitle>
                <CardDescription>Subreddits assigned for this task</CardDescription>
              </CardHeader>
              <CardContent>
                <TargetSubredditsList 
                  taskId={params.id}
                  targetSubreddits={targetSubreddits}
                  completedSubreddits={completedSubreddits}
                />
              </CardContent>
            </Card>

            {/* Upvote Bot */}
            <UpvoteBot />

            {/* Work Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Work Notes</CardTitle>
                <CardDescription>Add notes about your work on this task</CardDescription>
              </CardHeader>
              <CardContent>
                <WorkNotesForm taskId={params.id} initialNotes={task.work_notes} />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* For general tasks, show work notes */}
      {!isUpvoteTask && (
        <Card>
          <CardHeader>
            <CardTitle>Work Notes</CardTitle>
            <CardDescription>Document your work and progress on this task</CardDescription>
          </CardHeader>
          <CardContent>
            <WorkNotesForm taskId={params.id} initialNotes={task.work_notes} />
          </CardContent>
        </Card>
      )}

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