'use client'

import { X } from 'lucide-react'
import { removeModelFromVA } from '@/lib/model-actions'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

interface RemoveModelButtonProps {
  vaId: string
  modelId: number
}

export function RemoveModelButton({ vaId, modelId }: RemoveModelButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to remove this model assignment?')) {
      return
    }

    setIsLoading(true)

    try {
      const result = await removeModelFromVA(vaId, modelId)
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Model removed successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to remove model',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error removing model:', error)
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
    <button
      onClick={handleRemove}
      disabled={isLoading}
      className="ml-1 text-purple-600 hover:text-purple-800 disabled:opacity-50"
      title="Remove model"
    >
      <X className="h-3 w-3" />
    </button>
  )
}

