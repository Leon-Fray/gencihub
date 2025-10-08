'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function markSubredditAsPosted(taskId: string, subreddit: string) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Fetch the current task to verify ownership and get current completed subreddits
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('completed_subreddits, assigned_to_id')
      .eq('id', taskId)
      .single()

    if (fetchError) {
      console.error('Database error fetching task:', fetchError)
      return { 
        success: false, 
        error: fetchError.code === '42703' 
          ? 'Database migration required. The completed_subreddits column does not exist. Please apply migrations.' 
          : `Database error: ${fetchError.message}` 
      }
    }

    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    // Verify the task is assigned to the current user
    if (task.assigned_to_id !== session.user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get current completed subreddits or initialize as empty array
    const completedSubreddits = Array.isArray(task.completed_subreddits) 
      ? task.completed_subreddits 
      : []

    // Check if already marked as completed
    if (completedSubreddits.includes(subreddit)) {
      return { success: true, message: 'Already marked as posted' }
    }

    // Add the subreddit to completed list
    const updatedCompleted = [...completedSubreddits, subreddit]

    // Update the task
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ completed_subreddits: updatedCompleted })
      .eq('id', taskId)

    if (updateError) {
      console.error('Database error updating task:', updateError)
      return { 
        success: false, 
        error: updateError.code === '42703' 
          ? 'Database migration required. Please apply migrations.' 
          : `Failed to update task: ${updateError.message}` 
      }
    }

    // Revalidate the page
    revalidatePath(`/dashboard/task/${taskId}`)
    
    return { success: true, message: 'Marked as posted' }
  } catch (error) {
    console.error('Error marking subreddit as posted:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function unmarkSubredditAsPosted(taskId: string, subreddit: string) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Fetch the current task to verify ownership and get current completed subreddits
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('completed_subreddits, assigned_to_id')
      .eq('id', taskId)
      .single()

    if (fetchError) {
      console.error('Database error fetching task:', fetchError)
      return { 
        success: false, 
        error: fetchError.code === '42703' 
          ? 'Database migration required. The completed_subreddits column does not exist. Please apply migrations.' 
          : `Database error: ${fetchError.message}` 
      }
    }

    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    // Verify the task is assigned to the current user
    if (task.assigned_to_id !== session.user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get current completed subreddits
    const completedSubreddits = Array.isArray(task.completed_subreddits) 
      ? task.completed_subreddits 
      : []

    // Remove the subreddit from completed list
    const updatedCompleted = completedSubreddits.filter((sub: string) => sub !== subreddit)

    // Update the task
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ completed_subreddits: updatedCompleted })
      .eq('id', taskId)

    if (updateError) {
      console.error('Database error updating task:', updateError)
      return { 
        success: false, 
        error: updateError.code === '42703' 
          ? 'Database migration required. Please apply migrations.' 
          : `Failed to update task: ${updateError.message}` 
      }
    }

    // Revalidate the page
    revalidatePath(`/dashboard/task/${taskId}`)
    
    return { success: true, message: 'Unmarked as posted' }
  } catch (error) {
    console.error('Error unmarking subreddit as posted:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

