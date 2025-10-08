'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NewAccountForm } from '@/components/new-account-form'
import { RequestLinkButton } from '@/components/request-link-button'
import { RequestCookieButton } from '@/components/request-cookie-button'
import { RequestIPButton } from '@/components/request-ip-button'

interface Model {
  id: number
  name: string
  google_drive_link: string
  bio: string
  created_at: string
  is_active: boolean
  storage_folder?: string
}

interface NewAccountPageClientProps {
  models: Model[]
  vaName: string
  vaId: string
}

export function NewAccountPageClient({ models, vaName, vaId }: NewAccountPageClientProps) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [createdLinks, setCreatedLinks] = useState<string[]>([])

  useEffect(() => {
    // Listen for model selection events from the form
    const handleModelSelected = (e: CustomEvent) => {
      setSelectedModel(e.detail.model)
    }

    window.addEventListener('modelSelected', handleModelSelected as EventListener)

    return () => {
      window.removeEventListener('modelSelected', handleModelSelected as EventListener)
    }
  }, [])

  const handleLinkCreated = (url: string) => {
    setCreatedLinks(prev => [url, ...prev])
  }

  return (
    <>
      <div className="max-w-2xl mx-auto">
        {/* Account Creation Form */}
        <NewAccountForm 
          models={models} 
          vaName={vaName}
          vaId={vaId}
        />
      </div>

      {/* Resource Request Section */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Request Resources</CardTitle>
            <CardDescription>Request IP proxy, cookie file, and redirect link for the new account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* IP Proxy Request */}
              <div className="p-6 border rounded-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-2xl">🌐</span>
                </div>
                <h3 className="font-semibold mb-2 text-center">IP Proxy</h3>
                <p className="text-sm text-gray-600 mb-4 text-center">Get a fresh IP address for the new account</p>
                <RequestIPButton vaId={vaId} />
              </div>

              {/* Cookie Request */}
              <div className="p-6 border rounded-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">🍪</span>
                </div>
                <h3 className="font-semibold mb-2 text-center">Cookie File</h3>
                <p className="text-sm text-gray-600 mb-4 text-center">Get a browser cookie file for authentication</p>
                <RequestCookieButton vaId={vaId} />
              </div>

              {/* Redirect Link Request */}
              <div className="text-center p-6 border rounded-lg">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-2xl">🔗</span>
                </div>
                <h3 className="font-semibold mb-2">Redirect Link</h3>
                <p className="text-sm text-gray-600 mb-4">Get a unique redirect link for tracking</p>
                <RequestLinkButton
                  vaId={vaId}
                  vaName={vaName}
                  selectedModel={selectedModel}
                  onLinkCreated={handleLinkCreated}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Created Links Display */}
      {createdLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Created Links</CardTitle>
            <CardDescription>Links created in this session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {createdLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <code className="text-sm font-mono">{link}</code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(link)}
                  >
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

