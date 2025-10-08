'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAvailableIP, getRedirectLink, getAccountCredentials, spoofImage } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'
import { Copy, Download, Upload } from 'lucide-react'

interface ResourceRequestButtonsProps {
  taskId: number
  vaId: string
}

export function ResourceRequestButtons({ taskId, vaId }: ResourceRequestButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [currentIP, setCurrentIP] = useState<string | null>(null)
  const [currentRedirectLink, setCurrentRedirectLink] = useState<string | null>(null)
  const [currentCredentials, setCurrentCredentials] = useState<any>(null)
  const [currentSpoofedImage, setCurrentSpoofedImage] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGetIP = async () => {
    setLoading('ip')
    try {
      const ip = await getAvailableIP(vaId)
      setCurrentIP(ip)
      toast({
        title: "IP Address Retrieved",
        description: "IP address has been assigned to you.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get IP address",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleGetRedirectLink = async () => {
    setLoading('redirect')
    try {
      const link = await getRedirectLink()
      setCurrentRedirectLink(link)
      toast({
        title: "Redirect Link Generated",
        description: "Redirect link has been generated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate redirect link",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleGetAccountLogin = async () => {
    const platformName = prompt('Enter platform name (e.g., Reddit, Twitter):')
    if (!platformName) return

    setLoading('credentials')
    try {
      const credentials = await getAccountCredentials(platformName)
      setCurrentCredentials(credentials)
      toast({
        title: "Credentials Retrieved",
        description: "Account credentials have been retrieved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get credentials",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleSpoofImage = async (formData: FormData) => {
    setLoading('spoof')
    try {
      const link = await spoofImage(formData)
      setCurrentSpoofedImage(link)
      toast({
        title: "Image Spoofed",
        description: "Image has been processed successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to spoof image",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Text copied to clipboard.",
    })
  }

  return (
    <div className="space-y-4">
      {/* Get IP Button */}
      <div className="space-y-2">
        <Button
          onClick={handleGetIP}
          disabled={loading === 'ip'}
          variant="outline"
          className="w-full"
        >
          {loading === 'ip' ? 'Getting IP...' : 'Get IP Address'}
        </Button>
        {currentIP && (
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <span className="text-sm font-mono">{currentIP}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(currentIP)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Get Redirect Link Button */}
      <div className="space-y-2">
        <Button
          onClick={handleGetRedirectLink}
          disabled={loading === 'redirect'}
          variant="outline"
          className="w-full"
        >
          {loading === 'redirect' ? 'Generating Link...' : 'Get Redirect Link'}
        </Button>
        {currentRedirectLink && (
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <span className="text-sm font-mono truncate">{currentRedirectLink}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(currentRedirectLink)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Get Account Login Button */}
      <div className="space-y-2">
        <Button
          onClick={handleGetAccountLogin}
          disabled={loading === 'credentials'}
          variant="outline"
          className="w-full"
        >
          {loading === 'credentials' ? 'Getting Credentials...' : 'Get Account Login'}
        </Button>
        {currentCredentials && (
          <div className="p-3 bg-gray-50 rounded space-y-2">
            <div>
              <Label className="text-xs text-gray-500">Platform</Label>
              <p className="text-sm font-medium">{currentCredentials.platform_name}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Username</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono">{currentCredentials.username}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(currentCredentials.username)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Password</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono">{currentCredentials.password}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(currentCredentials.password)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spoof Image Button */}
      <div className="space-y-2">
        <form action={handleSpoofImage}>
          <div className="space-y-2">
            <Label htmlFor="image">Upload Image to Spoof</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              required
            />
            <Button
              type="submit"
              disabled={loading === 'spoof'}
              variant="outline"
              className="w-full"
            >
              {loading === 'spoof' ? 'Processing...' : 'Spoof Image'}
            </Button>
          </div>
        </form>
        {currentSpoofedImage && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Spoofed Image Link</Label>
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
              <span className="text-sm font-mono truncate">{currentSpoofedImage}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(currentSpoofedImage)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
