'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getAvailableCookie } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'
import { Copy, Check, FileText } from 'lucide-react'

interface RequestCookieButtonProps {
  vaId: string
}

export function RequestCookieButton({ vaId }: RequestCookieButtonProps) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [cookieData, setCookieData] = useState<{
    cookie_name: string
    cookie_file_path: string
    cookie_contents: string
  } | null>(null)
  const { toast } = useToast()

  async function handleRequestCookie() {
    setLoading(true)
    try {
      const data = await getAvailableCookie(vaId)
      setCookieData(data)
      
      // Automatically copy to clipboard
      await navigator.clipboard.writeText(data.cookie_contents)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
      
      toast({
        title: "Cookie Assigned & Copied!",
        description: `Cookie file "${data.cookie_name}" has been assigned to you and copied to your clipboard.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get cookie",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!cookieData) return
    
    await navigator.clipboard.writeText(cookieData.cookie_contents)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
    
    toast({
      title: "Copied!",
      description: "Cookie contents copied to clipboard.",
    })
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleRequestCookie} 
        disabled={loading || !!cookieData}
        className="w-full"
      >
        {loading ? 'Requesting...' : cookieData ? 'Cookie Assigned ✓' : 'Request Cookie'}
      </Button>
      
      {cookieData && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
          <div>
            <p className="text-sm font-medium text-green-900">Cookie File:</p>
            <p className="text-sm text-green-700 font-mono break-all">{cookieData.cookie_name}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-medium text-green-900">Cookie Contents:</p>
            <div className="max-h-32 overflow-y-auto bg-white p-2 rounded border border-green-300">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all">
                {cookieData.cookie_contents.substring(0, 200)}
                {cookieData.cookie_contents.length > 200 ? '...' : ''}
              </pre>
            </div>
          </div>
          
          <Button
            onClick={copyToClipboard}
            variant="default"
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Cookie Contents
              </>
            )}
          </Button>
          
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-100 p-2 rounded">
            <FileText className="h-4 w-4 flex-shrink-0" />
            <p>
              <strong>Permanently assigned to you.</strong> Contents were automatically copied to your clipboard.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

