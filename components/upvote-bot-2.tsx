'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function UpvoteBot2() {
  const [postLink, setPostLink] = useState('')
  const [targetUpvotes, setTargetUpvotes] = useState('1')
  const [speedPreset, setSpeedPreset] = useState('fast')
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

    setIsLoading(true)

    try {
      const payload = {
        postLink,
        action: 'upvote',
        target_upvotes: targetUpvotes, // Send the raw string
        speed_preset: speedPreset,
      }

      const response = await fetch('/api/upvote-bot-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create upvote order')
      }

      toast({
        title: 'Success',
        description: data.message || 'Upvote order created successfully!',
      })

      setPostLink('')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create upvote order. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handle100TestOrders = async () => {
    if (!postLink.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a post link',
        variant: 'destructive',
      })
      return
    }

    if (!postLink.includes('reddit.com')) {
      toast({
        title: 'Error',
        description: 'Please enter a valid Reddit link',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    let successfulOrders = 0

    try {
      const payload = {
        postLink,
        action: 'upvote',
        target_upvotes: '0 * NaN', // Specific value for test
        speed_preset: 'fast', // Specific value for test
      }

      const response = await fetch('/api/upvote-bot-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to create test order`)
      }
      successfulOrders++

      toast({
        title: 'Success',
        description: `Successfully created ${successfulOrders} soft boost order!`,
      })
      setPostLink('')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create some test upvote orders. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🤖 UpvoteBot 2.0</CardTitle>
        <CardDescription>Send upvotes to a Reddit post</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="post-link-2">Post Link</Label>
          <Input 
            id="post-link-2" 
            value={postLink}
            onChange={(e) => setPostLink(e.target.value)}
            placeholder="https://www.reddit.com/r/subreddit/comments/..."
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="target-upvotes">Target Upvotes</Label>
          <Input 
            id="target-upvotes"
            type="text"
            value={targetUpvotes}
            onChange={(e) => setTargetUpvotes(e.target.value)}
            placeholder="1"
            className="mt-1"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Number of upvotes to add to the post
          </p>
        </div>

        <div>
          <Label htmlFor="speed-preset">Delivery Speed</Label>
          <Select value={speedPreset} onValueChange={setSpeedPreset} disabled={isLoading}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select speed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="snail">Snail (Slowest)</SelectItem>
              <SelectItem value="slowest">Slowest</SelectItem>
              <SelectItem value="slower">Slower</SelectItem>
              <SelectItem value="slow">Slow</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="fast">Fast (Recommended)</SelectItem>
              <SelectItem value="turbo">Turbo (Fastest)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Choose how fast upvotes will be delivered
          </p>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={!postLink.trim() || isLoading}
          className="w-full"
        >
          {isLoading 
            ? 'Creating Upvote Order...' 
            : 'Create Upvote Order'
          }
        </Button>
        <Button 
          onClick={handle100TestOrders}
          disabled={!postLink.trim() || isLoading}
          className="w-full mt-2 bg-green-200 text-green-800 hover:bg-green-300"
          variant="secondary"
        >
          Soft Boost
        </Button>
      </CardContent>
    </Card>
  )
}