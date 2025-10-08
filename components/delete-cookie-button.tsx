'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteCookie } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

interface DeleteCookieButtonProps {
  cookieId: number
  cookieName: string
}

export function DeleteCookieButton({ cookieId, cookieName }: DeleteCookieButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this cookie?\n\nCookie: ${cookieName}\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    setIsDeleting(true)
    try {
      const result = await deleteCookie(cookieId)
      
      toast({
        title: 'Success',
        description: result.message,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete cookie',
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
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete cookie</span>
    </Button>
  )
}

