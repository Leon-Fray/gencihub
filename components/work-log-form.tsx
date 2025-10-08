'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createWorkLog } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'

interface WorkLogFormProps {
  taskId: number
  vaId: string
}

export function WorkLogForm({ taskId, vaId }: WorkLogFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      // Add taskId and vaId to form data
      formData.append('taskId', taskId.toString())
      formData.append('vaId', vaId)
      
      await createWorkLog(formData)
      toast({
        title: "Work Log Created",
        description: "Your work log has been submitted successfully.",
      })
      
      // Reset form
      const form = document.getElementById('work-log-form') as HTMLFormElement
      form?.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create work log",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form id="work-log-form" action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notes">Work Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Describe what you accomplished, any issues encountered, or other relevant information..."
          rows={4}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ipUsed">IP Used (Optional)</Label>
          <input
            id="ipUsed"
            name="ipUsed"
            type="text"
            placeholder="e.g., 192.168.1.1"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="redirectLinkCreated">Redirect Link Created (Optional)</Label>
          <input
            id="redirectLinkCreated"
            name="redirectLinkCreated"
            type="text"
            placeholder="e.g., https://example.com/redirect/123"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting...' : 'Submit Work Log'}
      </Button>
    </form>
  )
}
