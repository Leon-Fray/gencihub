'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function UpvoteBot() {
  const [postLink, setPostLink] = useState('')
  const [action, setAction] = useState<'upvote' | 'comment'>('upvote')
  const [quantity, setQuantity] = useState('10')
  const [speed, setSpeed] = useState('900')
  const [comments, setComments] = useState('')
  const [delay1, setDelay1] = useState('')
  const [delay2, setDelay2] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
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

    // Validate comments if action is comment
    if (action === 'comment' && !comments.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter at least one comment',
        variant: 'destructive',
      })
      return
    }

    // Validate quantity for upvotes
    if (action === 'upvote') {
      const qty = parseInt(quantity)
      if (isNaN(qty) || qty < 1 || qty > 1000) {
        toast({
          title: 'Error',
          description: 'Quantity must be between 1 and 1000',
          variant: 'destructive',
        })
        return
      }
    }

    setIsLoading(true)

    try {
      const payload: any = {
        postLink,
        action,
      }

      if (action === 'upvote') {
        payload.quantity = parseInt(quantity)
        payload.speed = parseInt(speed)
      } else if (action === 'comment') {
        payload.comments = comments
        if (delay1) payload.delay1 = parseInt(delay1)
        if (delay2) payload.delay2 = parseInt(delay2)
      }

      const response = await fetch('/api/upvote-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to send ${action}s`)
      }

      toast({
        title: 'Success',
        description: data.message || `${action === 'upvote' ? 'Upvotes' : 'Comments'} have been sent!`,
      })

      // Clear the inputs
      setPostLink('')
      setComments('')
      setDelay1('')
      setDelay2('')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to send ${action}s. Please try again.`,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🤖 Reddit Bot</CardTitle>
        <CardDescription>Send upvotes or custom comments to a Reddit post</CardDescription>
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

        <Tabs value={action} onValueChange={(value: string) => setAction(value as 'upvote' | 'comment')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upvote">Upvotes</TabsTrigger>
            <TabsTrigger value="comment">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="upvote" className="space-y-4">
            <div>
              <Label htmlFor="quantity">Number of Upvotes</Label>
              <Input 
                id="quantity"
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                className="mt-1"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a number between 1 and 1000
              </p>
            </div>

            <div>
              <Label htmlFor="speed">Delivery Speed (per hour)</Label>
              <Input 
                id="speed"
                type="number"
                min="1"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                placeholder="900"
                className="mt-1"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                How fast upvotes will be delivered per hour (default: 900)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="comment" className="space-y-4">
            <div>
              <Label htmlFor="comments">Custom Comments</Label>
              <textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter comments (one per line for multiple comments)"
                className="mt-1 w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter one or multiple comments. Use line breaks to separate multiple comments.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delay1">Min Delay (seconds)</Label>
                <Input 
                  id="delay1"
                  type="number"
                  min="0"
                  value={delay1}
                  onChange={(e) => setDelay1(e.target.value)}
                  placeholder="Optional"
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="delay2">Max Delay (seconds)</Label>
                <Input 
                  id="delay2"
                  type="number"
                  min="0"
                  value={delay2}
                  onChange={(e) => setDelay2(e.target.value)}
                  placeholder="Optional"
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Optional: Set delay between comments to appear more natural
            </p>
          </TabsContent>
        </Tabs>
        
        <Button 
          onClick={handleSubmit}
          disabled={!postLink.trim() || isLoading}
          className="w-full"
        >
          {isLoading 
            ? `Sending ${action === 'upvote' ? 'Upvotes' : 'Comments'}...` 
            : `Send ${action === 'upvote' ? 'Upvotes' : 'Comments'}`
          }
        </Button>
      </CardContent>
    </Card>
  )
}
