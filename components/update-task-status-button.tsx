'use client'

import { Button } from '@/components/ui/button'
import { updateTaskStatus } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UpdateTaskStatusButtonProps {
  taskId: number
  currentStatus: string
  newStatus: 'To Do' | 'In Progress' | 'Completed'
}

export function UpdateTaskStatusButton({ 
  taskId, 
  currentStatus, 
  newStatus 
}: UpdateTaskStatusButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleClick = async () => {
    if (currentStatus === newStatus) {
      return
    }

    setLoading(true)
    try {
      await updateTaskStatus(taskId, newStatus)
      toast({
        title: "Status Updated",
        description: `Task status changed to "${newStatus}"`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isActive = currentStatus === newStatus

  return (
    <Button
      onClick={handleClick}
      disabled={loading || isActive}
      variant={isActive ? "default" : "outline"}
      size="sm"
    >
      {loading ? 'Updating...' : newStatus}
    </Button>
  )
}

