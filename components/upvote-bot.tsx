'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export function UpvoteBot() {
  const [postLink, setPostLink] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSendUpvotes = async () => {
    if (!postLink.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a post link',
        variant: 'destructive',
      })
      return
    }

    // Validate Reddit URL
    if (!postLink.includes('reddit.com')) {
      toast({
        title: 'Error',
        description: 'Please enter a valid Reddit link',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/upvote-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postLink }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send upvotes')
      }

      toast({
        title: 'Success',
        description: data.message || 'Upvotes have been sent!',
      })

      // Clear the input
      setPostLink('')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send upvotes. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🤖 Upvote Bot</CardTitle>
        <CardDescription>Send upvotes to a Reddit post</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="post-link">Post Link</Label>
          <Input 
            id="post-link" 
            value={postLink}
            onChange={(e) => setPostLink(e.target.value)}
            placeholder="https://www.reddit.com/r/subreddit/comments/..."
            className="mt-1"
            disabled={isLoading}
          />
        </div>
        
        <Button 
          onClick={handleSendUpvotes}
          disabled={!postLink.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? 'Sending Upvotes...' : 'Send Upvotes'}
        </Button>
      </CardContent>
    </Card>
  )
}
