'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { verifyCookieStorageSetup } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export function VerifyCookieSetupButton() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    bucketExists: boolean
    filesFound: number
    filesList: string[]
    errors: string[]
  } | null>(null)
  const { toast } = useToast()

  async function handleVerify() {
    setLoading(true)
    try {
      const data = await verifyCookieStorageSetup()
      setResults(data)
      
      if (data.errors.length === 0 && data.filesFound > 0) {
        toast({
          title: "✅ Setup Verified!",
          description: `Found ${data.filesFound} cookie file(s) in storage. Everything is working!`,
        })
      } else if (data.errors.length > 0) {
        toast({
          title: "⚠️ Setup Issues Found",
          description: data.errors[0],
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify setup",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleVerify} 
        disabled={loading}
        variant="outline"
      >
        {loading ? 'Checking...' : '🔍 Verify Setup'}
      </Button>
      
      {results && (
        <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
          <h3 className="font-semibold text-sm">Setup Verification Results:</h3>
          
          {/* Bucket Status */}
          <div className="flex items-center gap-2">
            {results.bucketExists ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm">
              Storage bucket "cookies": {results.bucketExists ? 'Exists ✓' : 'Not found ✗'}
            </span>
          </div>
          
          {/* Files Status */}
          <div className="flex items-center gap-2">
            {results.filesFound > 0 ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <span className="text-sm">
              Cookie files found: {results.filesFound}
            </span>
          </div>
          
          {/* File List */}
          {results.filesList.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-700 mb-1">Files in storage:</p>
              <ul className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                {results.filesList.map((file, idx) => (
                  <li key={idx} className="font-mono bg-white px-2 py-1 rounded">
                    {file}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Errors */}
          {results.errors.length > 0 && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-xs font-medium text-red-800 mb-1">Issues:</p>
              <ul className="text-xs text-red-700 space-y-1">
                {results.errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Success Message */}
          {results.errors.length === 0 && results.filesFound > 0 && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-xs text-green-700">
                ✅ Everything looks good! You can now sync these files to the database.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

