import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createSupabaseServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function VADashboard() {
  const supabase = createSupabaseServerClient()
  
  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/')
  }

  const vaId = session.user.id

  // Fetch today's schedule
  const today = new Date().toISOString().split('T')[0]
  const { data: todaysSchedule } = await supabase
    .from('schedules')
    .select('*')
    .eq('va_id', vaId)
    .gte('start_time', `${today}T00:00:00Z`)
    .lte('start_time', `${today}T23:59:59Z`)
    .order('start_time', { ascending: true })

  // Fetch tasks assigned to this VA
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_to_id', vaId)
    .order('created_at', { ascending: false })

  // Group tasks by status
  const todoTasks = tasks?.filter(task => task.status === 'To Do') || []
  const inProgressTasks = tasks?.filter(task => task.status === 'In Progress') || []
  const completedTasks = tasks?.filter(task => task.status === 'Completed') || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">VA Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your task management center</p>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Your work schedule for today</CardDescription>
        </CardHeader>
        <CardContent>
          {todaysSchedule && todaysSchedule.length > 0 ? (
            <div className="space-y-4">
              {todaysSchedule.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">
                      {new Date(schedule.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(schedule.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </h3>
                    {schedule.notes && (
                      <p className="text-sm text-gray-600 mt-1">{schedule.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No schedule for today</p>
          )}
        </CardContent>
      </Card>

      {/* Task Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* To Do Column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              To Do
              <span className="text-sm font-normal text-gray-500">({todoTasks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todoTasks.length > 0 ? (
              todoTasks.map((task) => (
                <div key={task.id} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{task.title}</h3>
                    {task.task_type === 'subreddit_upvote' && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Upvote
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  {task.due_date && (
                    <p className="text-xs text-gray-500 mt-2">
                      Due: {formatDate(task.due_date)}
                    </p>
                  )}
                  <div className="mt-3">
                    <Link href={`/dashboard/task/${task.id}`}>
                      <Button size="sm" variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No tasks to do</p>
            )}
          </CardContent>
        </Card>

        {/* In Progress Column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              In Progress
              <span className="text-sm font-normal text-gray-500">({inProgressTasks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inProgressTasks.length > 0 ? (
              inProgressTasks.map((task) => (
                <div key={task.id} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{task.title}</h3>
                    {task.task_type === 'subreddit_upvote' && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Upvote
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  {task.due_date && (
                    <p className="text-xs text-gray-500 mt-2">
                      Due: {formatDate(task.due_date)}
                    </p>
                  )}
                  <div className="mt-3">
                    <Link href={`/dashboard/task/${task.id}`}>
                      <Button size="sm" variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No tasks in progress</p>
            )}
          </CardContent>
        </Card>

        {/* Completed Column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Completed
              <span className="text-sm font-normal text-gray-500">({completedTasks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedTasks.length > 0 ? (
              completedTasks.map((task) => (
                <div key={task.id} className="p-4 border rounded-lg bg-white opacity-75">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{task.title}</h3>
                    {task.task_type === 'subreddit_upvote' && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Upvote
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Completed: {formatDate(task.created_at)}
                  </p>
                  <div className="mt-3">
                    <Link href={`/dashboard/task/${task.id}`}>
                      <Button size="sm" variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No completed tasks</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
