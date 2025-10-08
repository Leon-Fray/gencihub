'use client'

import { Button } from '@/components/ui/button'
import { markSubredditAsPosted, unmarkSubredditAsPosted } from '@/app/actions/mark-subreddit-posted'
import { useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TargetSubredditsListProps {
  taskId: string
  targetSubreddits: string[]
  completedSubreddits: string[]
}

export function TargetSubredditsList({ 
  taskId, 
  targetSubreddits, 
  completedSubreddits 
}: TargetSubredditsListProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleMarkAsPosted = async (subreddit: string, isCompleted: boolean) => {
    setLoading(subreddit)
    
    try {
      const result = isCompleted 
        ? await unmarkSubredditAsPosted(taskId, subreddit)
        : await markSubredditAsPosted(taskId, subreddit)
      
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to update')
      }
    } catch (error) {
      console.error('Error updating subreddit:', error)
      alert('An error occurred')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {targetSubreddits.map((subreddit: string, index: number) => {
        const isCompleted = completedSubreddits.includes(subreddit)
        const isLoading = loading === subreddit

        return (
          <div 
            key={index} 
            className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
              isCompleted 
                ? 'bg-green-50 border-green-200' 
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                <span className={`text-sm font-medium ${
                  isCompleted ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {index + 1}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <p className={`font-medium ${isCompleted ? 'text-green-900' : ''}`}>
                  r/{subreddit}
                </p>
                {isCompleted && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                asChild
              >
                <a 
                  href={`https://reddit.com/r/${subreddit}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit
                </a>
              </Button>
              <Button 
                variant={isCompleted ? "secondary" : "default"}
                size="sm"
                onClick={() => handleMarkAsPosted(subreddit, isCompleted)}
                disabled={isLoading}
              >
                {isLoading ? (
                  'Loading...'
                ) : isCompleted ? (
                  'Unmark'
                ) : (
                  'Mark as Posted'
                )}
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

