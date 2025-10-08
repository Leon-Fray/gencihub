'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getAvailableIPProxy } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'
import { Copy, Check, Globe } from 'lucide-react'

interface RequestIPButtonProps {
  vaId: string
}

export function RequestIPButton({ vaId }: RequestIPButtonProps) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [ipData, setIpData] = useState<{
    ip_proxy: string
    line_number: number
  } | null>(null)
  const { toast } = useToast()

  async function handleRequestIP() {
    setLoading(true)
    try {
      const data = await getAvailableIPProxy(vaId)
      setIpData(data)
      
      // Automatically copy to clipboard
      await navigator.clipboard.writeText(data.ip_proxy)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
      
      toast({
        title: "IP Proxy Assigned & Copied!",
        description: `IP proxy has been assigned to you and copied to your clipboard.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get IP proxy",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!ipData) return
    
    await navigator.clipboard.writeText(ipData.ip_proxy)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
    
    toast({
      title: "Copied!",
      description: "IP proxy copied to clipboard.",
    })
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleRequestIP} 
        disabled={loading || !!ipData}
        className="w-full"
      >
        {loading ? 'Requesting...' : ipData ? 'IP Assigned ✓' : 'Request IP'}
      </Button>
      
      {ipData && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <div>
            <p className="text-sm font-medium text-blue-900">IP Proxy:</p>
            <p className="text-sm text-blue-700 font-mono break-all">{ipData.ip_proxy}</p>
          </div>
          
          <div>
            <p className="text-xs text-blue-600">Line #{ipData.line_number} from proxyList300.txt</p>
          </div>
          
          <Button
            onClick={copyToClipboard}
            variant="default"
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy IP Proxy
              </>
            )}
          </Button>
          
          <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-100 p-2 rounded">
            <Globe className="h-4 w-4 flex-shrink-0" />
            <p>
              <strong>Permanently assigned to you.</strong> IP was automatically copied to your clipboard.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

