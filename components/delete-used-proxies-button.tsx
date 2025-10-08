'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteIPProxiesUpToLine } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'

export function DeleteUsedProxiesButton() {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    // Confirm before deleting
    const confirmed = window.confirm(
      'Are you sure you want to delete IP proxies from lines 1-120?\n\n' +
      'This action cannot be undone. These proxies will be permanently removed from the database.'
    )

    if (!confirmed) return

    setIsDeleting(true)
    try {
      const result = await deleteIPProxiesUpToLine(120)
      
      toast({
        title: 'Success',
        description: result.message,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete IP proxies',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      onClick={handleDelete}
      disabled={isDeleting}
      variant="destructive"
      size="sm"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isDeleting ? 'Deleting...' : 'Delete Lines 1-120'}
    </Button>
  )
}

