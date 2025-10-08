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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { assignModelToVA, type Model } from '@/lib/model-actions'
import { useToast } from '@/hooks/use-toast'
import { UserPlus } from 'lucide-react'

interface AssignModelDialogProps {
  vaId: string
  vaName: string
  availableModels: Model[]
  currentUser: { id: string }
}

export function AssignModelDialog({ vaId, vaName, availableModels, currentUser }: AssignModelDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedModelId) {
      toast({
        title: 'Error',
        description: 'Please select a model',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await assignModelToVA(vaId, parseInt(selectedModelId), currentUser.id)
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Model assigned successfully',
        })
        setOpen(false)
        setSelectedModelId('')
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to assign model',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error assigning model:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Assign Model
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Model to {vaName}</DialogTitle>
            <DialogDescription>
              Select a model to assign to this Virtual Assistant
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="model">Model</Label>
              <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">No models available</div>
                  ) : (
                    availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id.toString()}>
                        {model.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedModelId}>
              {isLoading ? 'Assigning...' : 'Assign Model'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

