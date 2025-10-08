'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createRedirectLink } from '@/lib/link-actions'
import { useToast } from '@/hooks/use-toast'

interface RequestLinkButtonProps {
  vaId: string
  vaName: string
  selectedModel: string | null
  onLinkCreated?: (url: string) => void
}

export function RequestLinkButton({ 
  vaId, 
  vaName, 
  selectedModel,
  onLinkCreated 
}: RequestLinkButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleRequestLink = async () => {
    console.log('🖱️ Request Link button clicked!')
    console.log('📋 Current state:', { vaId, vaName, selectedModel })
    
    if (!selectedModel) {
      console.log('❌ No model selected')
      toast({
        title: 'Model Required',
        description: 'Please select a model before requesting a redirect link.',
        variant: 'destructive',
      })
      return
    }

    console.log('✅ Model selected, creating link...')
    setIsLoading(true)

    try {
      console.log('📞 Calling createRedirectLink function...')
      const result = await createRedirectLink(vaId, vaName, selectedModel)
      console.log('📊 Result from createRedirectLink:', result)

      if (result.success && result.url) {
        // Copy to clipboard
        await navigator.clipboard.writeText(result.url)
        
        toast({
          title: 'Link Created Successfully!',
          description: (
            <div className="space-y-1">
              <p className="font-medium">{result.url}</p>
              <p className="text-sm text-muted-foreground">Link copied to clipboard!</p>
            </div>
          ),
        })

        if (onLinkCreated) {
          onLinkCreated(result.url)
        }
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create link. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error requesting link:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      className="w-full" 
      onClick={handleRequestLink}
      disabled={isLoading || !selectedModel}
    >
      {isLoading ? 'Creating Link...' : 'Request Link'}
    </Button>
  )
}

