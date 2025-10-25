'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { clearAndResyncProxies } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'
import { RefreshCw } from 'lucide-react'

export function ClearAndResyncProxiesButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleClearAndResync() {
    const confirmed = window.confirm(
      '⚠️ MIGRATE TO NEW PROXY LIST?\n\n' +
      'This will:\n' +
      '• Delete all UNASSIGNED proxies from the old list\n' +
      '• Keep any proxies already assigned to VAs\n' +
      '• Sync all 372 proxies from proxyListNew.txt\n\n' +
      'This is a one-time migration. Continue?'
    )
    
    if (!confirmed) return

    setLoading(true)
    try {
      const result = await clearAndResyncProxies()
      toast({
        title: "Migration Complete! ✅",
        description: result.message,
      })
    } catch (error) {
      toast({
        title: "Migration Failed",
        description: error instanceof Error ? error.message : "Failed to clear and resync proxies",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
      disabled={loading}
      onClick={handleClearAndResync}
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Migrating...' : 'Migrate to New Proxies'}
    </Button>
  )
}

