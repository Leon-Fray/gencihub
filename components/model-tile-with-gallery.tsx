'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Loader2, Download, Image as ImageIcon, X } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import piexif from 'piexifjs'
import { Model } from '@/lib/model-actions'

interface ModelTileWithGalleryProps {
  model: Model
}

interface ImageInfo {
  name: string
  url: string
  originalUrl: string
}

export function ModelTileWithGallery({ model }: ModelTileWithGalleryProps) {
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
  const [imageList, setImageList] = useState<ImageInfo[]>([])
  const [showGallery, setShowGallery] = useState(false)
  const [error, setError] = useState<string>('')
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null)

  // Helper function to generate random date/time string
  const generateRandomDate = (startYear = 2015, endYear = 2023): string => {
    const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear
    const month = Math.floor(Math.random() * 12) + 1
    const day = Math.floor(Math.random() * 28) + 1
    const hour = Math.floor(Math.random() * 24)
    const minute = Math.floor(Math.random() * 60)
    const second = Math.floor(Math.random() * 60)
    
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${year}:${pad(month)}:${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`
  }

  // Helper function to generate random GPS coordinates
  const generateRandomGPS = () => {
    const latDeg = Math.floor(Math.random() * 90)
    const latMin = Math.floor(Math.random() * 60)
    const latSec = Math.floor(Math.random() * 60) * 100
    const latRef = Math.random() > 0.5 ? 'N' : 'S'
    
    const lonDeg = Math.floor(Math.random() * 180)
    const lonMin = Math.floor(Math.random() * 60)
    const lonSec = Math.floor(Math.random() * 60) * 100
    const lonRef = Math.random() > 0.5 ? 'E' : 'W'
    
    return {
      [piexif.GPSIFD.GPSLatitudeRef]: latRef,
      [piexif.GPSIFD.GPSLatitude]: [[latDeg, 1], [latMin, 1], [latSec, 100]],
      [piexif.GPSIFD.GPSLongitudeRef]: lonRef,
      [piexif.GPSIFD.GPSLongitude]: [[lonDeg, 1], [lonMin, 1], [lonSec, 100]],
    }
  }

  // Helper to get random element from array
  const randomChoice = <T,>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  // Spoof image with Spoof D (Complete spoofing)
  const spoofImageD = (imageDataUrl: string): string => {
    const imageDataUrlClean = imageDataUrl.startsWith('data:') 
      ? imageDataUrl 
      : `data:image/jpeg;base64,${imageDataUrl}`

    // --- Spoof D: Random Date, GPS, and Camera Info Combined ---
    const randomDateD = generateRandomDate(2018, 2024)
    const exifObjD: any = {
      "GPS": generateRandomGPS(),
      "0th": {
        [piexif.ImageIFD.DateTime]: randomDateD,
        [piexif.ImageIFD.Make]: randomChoice(["Apple", "Samsung", "Google", "OnePlus"]),
        [piexif.ImageIFD.Model]: randomChoice(["iPhone 12 Pro", "Galaxy S21", "Pixel 6", "OnePlus 9"]),
        [piexif.ImageIFD.Software]: randomChoice(["Adobe Photoshop 2023", "GIMP 2.10", "Camera+ 2"]),
      },
      "Exif": {
        [piexif.ExifIFD.DateTimeOriginal]: randomDateD,
        [piexif.ExifIFD.ExposureTime]: [1, randomChoice([60, 125, 250, 500])],
        [piexif.ExifIFD.FNumber]: [randomChoice([14, 18, 22, 28]), 10],
        [piexif.ExifIFD.ISOSpeedRatings]: randomChoice([100, 200, 400, 800, 1600]),
      }
    }
    const exifBytesD = piexif.dump(exifObjD)
    return piexif.insert(exifBytesD, imageDataUrlClean)
  }

  const handleShowGallery = async () => {
    console.log('Loading gallery for:', model.storage_folder)
    
    if (!model.storage_folder) {
      console.error('No storage_folder found on model!')
      setError('No storage folder configured for this model. Please upload images to Supabase Storage first.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const supabase = createSupabaseBrowserClient()
      
      // List all files in the model's storage folder
      const { data: files, error: listError } = await supabase
        .storage
        .from('model-images')
        .list(model.storage_folder)

      if (listError) {
        throw new Error(`Failed to list images: ${listError.message}`)
      }

      if (!files || files.length === 0) {
        throw new Error(`No images found in storage folder: model-images/${model.storage_folder}`)
      }

      // Filter to only image files
      const imageFiles = files.filter(file => 
        file.name.match(/\.(jpg|jpeg|png)$/i)
      )

      if (imageFiles.length === 0) {
        throw new Error('No JPG/PNG images found in folder')
      }

      // Get public URLs for all images (thumbnails for display)
      const imageInfos: ImageInfo[] = await Promise.all(
        imageFiles.map(async (file) => {
          const { data: { publicUrl } } = supabase
            .storage
            .from('model-images')
            .getPublicUrl(`${model.storage_folder}/${file.name}`)
          
          return {
            name: file.name,
            url: publicUrl,
            originalUrl: publicUrl
          }
        })
      )

      setImageList(imageInfos)
      setShowGallery(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load images'
      setError(errorMessage)
      console.error('Error loading images:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadSpoofed = async (imageInfo: ImageInfo, index: number) => {
    setDownloadingIndex(index)
    
    try {
      // Fetch the original image
      const response = await fetch(imageInfo.originalUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }

      const blob = await response.blob()
      const reader = new FileReader()
      
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      // Spoof the image with Spoof D
      const spoofedImage = spoofImageD(imageDataUrl)
      
      // Download the spoofed image
      const link = document.createElement('a')
      link.href = spoofedImage
      link.download = imageInfo.name.replace(/\.(jpg|jpeg|png)$/i, '_spoofed.jpg')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error downloading spoofed image:', err)
      alert('Failed to download spoofed image. Please try again.')
    } finally {
      setDownloadingIndex(null)
    }
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
              onClick={handleShowGallery}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="w-full mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Show Image Gallery
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800 font-semibold">Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Gallery Modal */}
        {showGallery && imageList.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">
                  {model.name} - Image Gallery ({imageList.length} images)
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowGallery(false)
                    setImageList([])
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Gallery Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imageList.map((imageInfo, index) => (
                    <div key={index} className="space-y-2">
                      <div className="relative group aspect-square">
                        <img
                          src={imageInfo.url}
                          alt={imageInfo.name}
                          className="w-full h-full object-cover rounded-md border border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDownloadSpoofed(imageInfo, index)}
                            disabled={downloadingIndex === index}
                          >
                            {downloadingIndex === index ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-1" />
                            )}
                            Spoof & Download
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center truncate">
                        {imageInfo.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600 text-center">
                  Click "Spoof & Download" on any image to download it with Spoof D (Complete spoofing)
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

