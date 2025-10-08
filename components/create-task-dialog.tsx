'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTask } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'
import type { Profile } from '@/lib/supabase'

interface CreateTaskDialogProps {
  users: Profile[]
}

export function CreateTaskDialog({ users }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [taskType, setTaskType] = useState<'general' | 'subreddit_upvote'>('general')
  const [subredditInput, setSubredditInput] = useState('')
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      // Add task_type to form data
      formData.append('taskType', taskType)
      
      await createTask(formData)
      toast({
        title: "Task Created",
        description: "The task has been assigned successfully.",
      })
      setOpen(false)
      // Reset form state
      setTaskType('general')
      setSubredditInput('')
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Create and assign a task to one of your VAs.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Task Type Selection */}
            <div className="grid gap-2">
              <Label htmlFor="taskType">Task Type</Label>
              <Select 
                name="taskType" 
                value={taskType} 
                onValueChange={(value) => setTaskType(value as 'general' | 'subreddit_upvote')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Task</SelectItem>
                  <SelectItem value="subreddit_upvote">Subreddit Upvote Task</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {taskType === 'subreddit_upvote' 
                  ? 'Task to send upvotes to specific subreddits' 
                  : 'General task for any other work'}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder={taskType === 'subreddit_upvote' ? 'e.g., Upvote Marketing Posts' : 'Enter task title'}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={taskType === 'subreddit_upvote' 
                  ? 'e.g., Upvote posts related to our product on target subreddits'
                  : 'Enter detailed task description'}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assignedToId">Assign To</Label>
              <Select name="assignedToId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a VA" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditionally show Target Subreddits for upvote tasks */}
            {taskType === 'subreddit_upvote' && (
              <div className="grid gap-2">
                <Label htmlFor="targetSubreddits">Target Subreddits</Label>
                <Textarea
                  id="targetSubreddits"
                  name="targetSubreddits"
                  placeholder="Enter subreddit names, one per line (e.g., AskReddit)"
                  rows={3}
                  value={subredditInput}
                  onChange={(e) => setSubredditInput(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Enter one subreddit name per line (without r/)
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setOpen(false)
              setTaskType('general')
              setSubredditInput('')
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create & Assign Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
