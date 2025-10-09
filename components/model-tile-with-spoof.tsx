'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Loader2, Download } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { Model } from '@/lib/model-actions'

interface ModelTileWithSpoofProps {
  model: Model
}

interface SpoofedImage {
  originalName: string
  spoofA: string
  spoofB: string
  spoofC: string
  spoofD: string
}

interface SpoofedImagesResponse {
  totalImages: number
  processedImages: number
  skippedImages: number
  images: SpoofedImage[]
}

export function ModelTileWithSpoof({ model }: ModelTileWithSpoofProps) {
  // Helper function to get initials from model name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Helper function to generate gradient based on model name
  const getGradient = (name: string) => {
    const gradients = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-emerald-400',
      'from-orange-400 to-red-400',
      'from-indigo-400 to-purple-400',
      'from-pink-400 to-rose-400',
    ]
    const index = name.charCodeAt(0) % gradients.length
    return gradients[index]
  }
  const [isLoading, setIsLoading] = useState(false)
  const [spoofedImages, setSpoofedImages] = useState<SpoofedImagesResponse | null>(null)
  const [error, setError] = useState<string>('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleSpoofClick = async () => {
    console.log('=== SPOOF BUTTON CLICKED ===')
    alert('Starting to spoof images...')
    
    setIsLoading(true)
    setError('')
    setSpoofedImages(null)
    setSelectedImageIndex(0)

    try {
      const supabase = createSupabaseBrowserClient()
      
      console.log('Calling image-spoofer with URL:', model.google_drive_link)
      
      // Call the Supabase Edge Function (automatically includes auth token)
      const { data, error: functionError } = await supabase.functions.invoke('image-spoofer', {
        body: { driveUrl: model.google_drive_link, maxImages: 10 }
      })

      console.log('Function response:', { data, functionError })

      if (functionError) {
        console.error('Function error details:', functionError)
        throw new Error(`Edge Function Error: ${functionError.message || JSON.stringify(functionError)}`)
      }

      if (data?.error) {
        console.error('Data error:', data.error)
        throw new Error(data.error)
      }

      console.log('Setting spoofed images:', data)
      setSpoofedImages(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to spoof images'
      setError(errorMessage)
      console.error('Error spoofing images:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadImage = (imageDataUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageDataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className={`w-32 h-32 bg-gradient-to-br ${getGradient(model.name)} rounded-full flex items-center justify-center shadow-lg`}>
            <span className="text-white text-4xl font-bold">
              {getInitials(model.name)}
            </span>
          </div>
        </div>
        <CardTitle className="text-center text-2xl">{model.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Bio</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{model.bio}</p>
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Resources</h4>
          <div className="flex flex-col gap-2">
            <Link 
              href={model.google_drive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"/>
              </svg>
              <span>Open Google Drive</span>
            </Link>
            
            <Button
              onClick={handleSpoofClick}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="w-full mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Spoofing Images...
                </>
              ) : (
                'Spoof Images'
              )}
            </Button>
          </div>
        </div>

        {/* Display Results Section */}
        {isLoading && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>Processing images, please wait...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="pt-4 border-t">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800 font-semibold">Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {spoofedImages && !isLoading && !error && spoofedImages.images.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-sm text-gray-700">
                Spoofed Images ({spoofedImages.processedImages} of {spoofedImages.totalImages})
              </h4>
              {spoofedImages.images.length > 1 && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                    disabled={selectedImageIndex === 0}
                  >
                    ←
                  </Button>
                  <span className="text-xs self-center px-2">{selectedImageIndex + 1}/{spoofedImages.images.length}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedImageIndex(Math.min(spoofedImages.images.length - 1, selectedImageIndex + 1))}
                    disabled={selectedImageIndex === spoofedImages.images.length - 1}
                  >
                    →
                  </Button>
                </div>
              )}
            </div>
            
            {spoofedImages.skippedImages > 0 && (
              <p className="text-xs text-yellow-600 mb-2">
                Note: {spoofedImages.skippedImages} HEIF/HEIC images were skipped
              </p>
            )}

            <p className="text-xs text-gray-600 mb-3">{spoofedImages.images[selectedImageIndex].originalName}</p>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Spoof A */}
              <div className="space-y-2">
                <div className="relative group">
                  <img 
                    src={spoofedImages.images[selectedImageIndex].spoofA} 
                    alt="Spoof A - Random Date & GPS" 
                    className="w-full h-32 object-cover rounded-md border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadImage(spoofedImages.images[selectedImageIndex].spoofA, `${spoofedImages.images[selectedImageIndex].originalName}_SpoofA.jpg`)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">Spoof A (Date & GPS)</p>
              </div>

              {/* Spoof B */}
              <div className="space-y-2">
                <div className="relative group">
                  <img 
                    src={spoofedImages.images[selectedImageIndex].spoofB} 
                    alt="Spoof B - Date & Camera" 
                    className="w-full h-32 object-cover rounded-md border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadImage(spoofedImages.images[selectedImageIndex].spoofB, `${spoofedImages.images[selectedImageIndex].originalName}_SpoofB.jpg`)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">Spoof B (Date & Camera)</p>
              </div>

              {/* Spoof C */}
              <div className="space-y-2">
                <div className="relative group">
                  <img 
                    src={spoofedImages.images[selectedImageIndex].spoofC} 
                    alt="Spoof C - No EXIF" 
                    className="w-full h-32 object-cover rounded-md border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadImage(spoofedImages.images[selectedImageIndex].spoofC, `${spoofedImages.images[selectedImageIndex].originalName}_SpoofC.jpg`)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">Spoof C (No EXIF)</p>
              </div>

              {/* Spoof D */}
              <div className="space-y-2">
                <div className="relative group">
                  <img 
                    src={spoofedImages.images[selectedImageIndex].spoofD} 
                    alt="Spoof D - Complete" 
                    className="w-full h-32 object-cover rounded-md border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadImage(spoofedImages.images[selectedImageIndex].spoofD, `${spoofedImages.images[selectedImageIndex].originalName}_SpoofD.jpg`)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">Spoof D (Complete)</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

