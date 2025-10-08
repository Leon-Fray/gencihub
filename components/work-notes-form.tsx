'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { updateWorkNotes } from '@/lib/actions'

interface WorkNotesFormProps {
  taskId: string
  initialNotes?: string | null
}

export function WorkNotesForm({ taskId, initialNotes }: WorkNotesFormProps) {
  const [notes, setNotes] = useState(initialNotes || '')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Update local state when initialNotes changes (e.g., after navigation)
  useEffect(() => {
    setNotes(initialNotes || '')
  }, [initialNotes])

  async function handleSave() {
    setLoading(true)
    try {
      await updateWorkNotes(taskId, notes)
      toast({
        title: "Success",
        description: "Work notes saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save work notes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes" 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Document your progress, challenges, or any important information..."
          rows={6}
          className="mt-1"
        />
      </div>
      
      <Button 
        onClick={handleSave} 
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Saving...' : 'Save Work Notes'}
      </Button>
      
      <div className="pt-4 border-t">
        <p className="text-sm text-gray-500 text-center">
          Use work notes to track your progress and communicate with admins
        </p>
      </div>
    </div>
  )
}

