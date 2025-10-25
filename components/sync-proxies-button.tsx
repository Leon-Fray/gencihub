'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { syncIPProxiesFromFile } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'
import { RefreshCw } from 'lucide-react'

export function SyncProxiesButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSync() {
    setLoading(true)
    try {
      const result = await syncIPProxiesFromFile()
      toast({
        title: "Proxies Synced",
        description: result.message,
      })
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync proxies",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleSync} 
      disabled={loading}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Syncing...' : 'Sync from File'}
    </Button>
  )
}

