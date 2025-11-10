'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Copy, Mail, Loader2 } from 'lucide-react'

interface RelayAlias {
  full_address: string
  id: string
  description: string
  created_at: string
}

export function VerifyAccountClient() {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedAlias, setGeneratedAlias] = useState<RelayAlias | null>(null)
  const [aliases, setAliases] = useState<RelayAlias[]>([])
  const { toast } = useToast()

  const handleGenerateAlias = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/firefox-relay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to generate alias')
      }

      if (result.success && result.data) {
        const newAlias = result.data
        setGeneratedAlias(newAlias)
        setAliases(prev => [newAlias, ...prev])
        setDescription('')
        
        toast({
          title: 'Email mask generated',
          description: `Created ${newAlias.full_address}`,
        })
      }
    } catch (error) {
      console.error('Error generating alias:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate email mask',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied to clipboard',
      description: text,
    })
  }

  return (
    <div className="space-y-6">
      {/* Generate New Alias Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Generate Email Mask
          </CardTitle>
          <CardDescription>
            Create a new Firefox Relay email alias for account verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="e.g., Reddit account verification"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <Button 
            onClick={handleGenerateAlias} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Generate Email Mask
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Alias Display */}
      {generatedAlias && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Email Mask Generated</CardTitle>
            <CardDescription className="text-green-700">
              Your new email mask is ready to use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-green-900">Email Address</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedAlias.full_address}
                  readOnly
                  className="bg-white font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyToClipboard(generatedAlias.full_address)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {generatedAlias.description && (
              <div className="space-y-2">
                <Label className="text-green-900">Description</Label>
                <p className="text-sm text-green-700">{generatedAlias.description}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-green-900">Created</Label>
              <p className="text-sm text-green-700">
                {new Date(generatedAlias.created_at).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alias History */}
      {aliases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Email Masks</CardTitle>
            <CardDescription>
              History of all email masks created in this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aliases.map((alias) => (
                <div
                  key={alias.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-medium truncate">
                      {alias.full_address}
                    </p>
                    {alias.description && (
                      <p className="text-xs text-gray-500 mt-1">{alias.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(alias.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyToClipboard(alias.full_address)}
                    className="ml-2 flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

