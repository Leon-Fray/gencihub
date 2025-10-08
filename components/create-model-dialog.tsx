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
import { createModel } from '@/lib/model-actions'
import { useToast } from '@/hooks/use-toast'
import { PlusCircle } from 'lucide-react'

export function CreateModelDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    googleDriveLink: '',
    bio: '',
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.googleDriveLink || !formData.bio) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await createModel(
        formData.name,
        formData.googleDriveLink,
        formData.bio
      )
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Model created successfully',
        })
        setOpen(false)
        setFormData({
          name: '',
          googleDriveLink: '',
          bio: '',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create model',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating model:', error)
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
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Model
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Model</DialogTitle>
            <DialogDescription>
              Add a new celebrity model to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Model Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Annie"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="googleDriveLink">Google Drive Link</Label>
              <Input
                id="googleDriveLink"
                type="url"
                value={formData.googleDriveLink}
                onChange={(e) => setFormData({ ...formData, googleDriveLink: e.target.value })}
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief description of the model"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Model'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

