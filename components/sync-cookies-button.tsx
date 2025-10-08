'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { syncCookiesFromStorage, syncIPProxiesFromStorage } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SyncCookiesButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSync() {
    setLoading(true)
    try {
      // Sync cookies
      const cookieResult = await syncCookiesFromStorage()
      
      // Try to sync IPs, but don't fail if bucket/file doesn't exist yet
      let ipResult = { added: 0, message: '' }
      try {
        ipResult = await syncIPProxiesFromStorage()
      } catch (ipError) {
        // Only show IP error if cookies also failed
        if (cookieResult.added === 0) {
          console.log('IP sync skipped:', ipError)
        }
      }
      
      const totalAdded = cookieResult.added + ipResult.added
      const messages = []
      
      if (cookieResult.added > 0) {
        messages.push(`${cookieResult.added} cookie${cookieResult.added > 1 ? 's' : ''}`)
      }
      if (ipResult.added > 0) {
        messages.push(`${ipResult.added} IP${ipResult.added > 1 ? 's' : ''}`)
      }
      
      toast({
        title: totalAdded > 0 ? "Sync Successful" : "Already Up to Date",
        description: totalAdded > 0 
          ? `Added ${messages.join(' and ')} from storage.`
          : cookieResult.message || "All resources are already synced.",
      })
      
      router.refresh()
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync resources from storage",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleSync} 
      disabled={loading}
      variant="outline"
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Syncing...' : 'Sync from Storage'}
    </Button>
  )
}

