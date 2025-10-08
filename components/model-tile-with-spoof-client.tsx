'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Loader2, Download } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import piexif from 'piexifjs'
import JSZip from 'jszip'

interface Model {
  id: string
  name: string
  bio: string
  google_drive_link: string
  storage_folder?: string
}

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

export function ModelTileWithSpoofClient({ model }: ModelTileWithSpoofProps) {
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
  const [spoofedImages, setSpoofedImages] = useState<SpoofedImage[]>([])
  const [error, setError] = useState<string>('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

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

  // Spoof a single image
  const spoofImage = (imageDataUrl: string) => {
    // --- Spoof A: Random Date & GPS ---
    const exifObjA: any = {
      "GPS": generateRandomGPS(),
      "Exif": {},
      "0th": {}
    }
    const randomDateA = generateRandomDate()
    exifObjA["Exif"][piexif.ExifIFD.DateTimeOriginal] = randomDateA
    exifObjA["0th"][piexif.ImageIFD.DateTime] = randomDateA
    const exifBytesA = piexif.dump(exifObjA)
    const spoofA = piexif.insert(exifBytesA, imageDataUrl)

    // --- Spoof B: Different Random Date & Fake Camera Info ---
    const randomDateB = generateRandomDate(2010, 2014)
    const exifObjB: any = {
      "0th": {
        [piexif.ImageIFD.DateTime]: randomDateB,
        [piexif.ImageIFD.Make]: randomChoice(["Fujifilm", "Sony", "Canon", "Nikon"]),
        [piexif.ImageIFD.Model]: randomChoice(["Super-Camera 1000", "Digital Pro X"]),
      },
      "Exif": {
        [piexif.ExifIFD.DateTimeOriginal]: randomDateB
      },
      "GPS": {}
    }
    const exifBytesB = piexif.dump(exifObjB)
    const spoofB = piexif.insert(exifBytesB, imageDataUrl)

    // --- Spoof C: Strip All EXIF Data ---
    const spoofC = imageDataUrl

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
    const spoofD = piexif.insert(exifBytesD, imageDataUrl)

    return { spoofA, spoofB, spoofC, spoofD }
  }

  const handleSpoofClick = async () => {
    console.log('Full model object:', model)
    console.log('storage_folder value:', model.storage_folder)
    
    if (!model.storage_folder) {
      console.error('No storage_folder found on model!')
      setError('No storage folder configured for this model. Please upload images to Supabase Storage first.')
      return
    }

    setIsLoading(true)
    setError('')
    setSpoofedImages([])
    setSelectedImageIndex(0)
    setProgress({ current: 0, total: 0 })

    try {
      const supabase = createSupabaseBrowserClient()
      
      console.log('Storage folder:', model.storage_folder)
      console.log('Full path: model-images/' + model.storage_folder)
      
      // List all files in the model's storage folder
      const { data: files, error: listError } = await supabase
        .storage
        .from('model-images')
        .list(model.storage_folder)

      console.log('List response:', { files, listError })

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

      setProgress({ current: 0, total: imageFiles.length })
      const results: SpoofedImage[] = []

      // Process each image
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        setProgress({ current: i + 1, total: imageFiles.length })

        try {
          // Get public URL
          const { data: { publicUrl } } = supabase
            .storage
            .from('model-images')
            .getPublicUrl(`${model.storage_folder}/${file.name}`)

          // Fetch image
          const response = await fetch(publicUrl)
          if (!response.ok) {
            console.error(`Failed to fetch ${file.name}`)
            continue
          }

          const blob = await response.blob()
          const reader = new FileReader()
          
          await new Promise((resolve, reject) => {
            reader.onload = () => {
              try {
                const base64 = reader.result as string
                const spoofed = spoofImage(base64)
                
                results.push({
                  originalName: file.name,
                  ...spoofed
                })
                resolve(true)
              } catch (err) {
                console.error(`Error spoofing ${file.name}:`, err)
                reject(err)
              }
            }
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
        } catch (err) {
          console.error(`Error processing ${file.name}:`, err)
          // Continue with next image
        }
      }

      if (results.length === 0) {
        throw new Error('Failed to process any images')
      }

      setSpoofedImages(results)
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

  const downloadAllSpoofA = async () => {
    const zip = new JSZip()
    
    // Add all Spoof A images to the zip
    spoofedImages.forEach((image, index) => {
      // Convert data URL to binary
      const base64Data = image.spoofA.split(',')[1]
      zip.file(`SpoofA_${index + 1}_${image.originalName}`, base64Data, { base64: true })
    })
    
    // Generate the zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    
    // Download the zip file
    const link = document.createElement('a')
    link.href = URL.createObjectURL(zipBlob)
    link.download = `${model.name}_SpoofA_Images.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
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
                  Spoofing {progress.current}/{progress.total}...
                </>
              ) : (
                'Spoof Images from Storage'
              )}
            </Button>
          </div>
        </div>

        {/* Display Results Section */}
        {isLoading && progress.total > 0 && (
          <div className="pt-4 border-t">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Processing {progress.current} of {progress.total} images...
            </p>
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

        {spoofedImages.length > 0 && !isLoading && !error && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-sm text-gray-700">
                Spoofed Images ({spoofedImages.length})
              </h4>
              {spoofedImages.length > 1 && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                    disabled={selectedImageIndex === 0}
                  >
                    ←
                  </Button>
                  <span className="text-xs self-center px-2">{selectedImageIndex + 1}/{spoofedImages.length}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedImageIndex(Math.min(spoofedImages.length - 1, selectedImageIndex + 1))}
                    disabled={selectedImageIndex === spoofedImages.length - 1}
                  >
                    →
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={downloadAllSpoofA}
              variant="default"
              size="sm"
              className="w-full mb-3"
            >
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>

            <p className="text-xs text-gray-600 mb-3">{spoofedImages[selectedImageIndex].originalName}</p>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Spoof A */}
              <div className="space-y-2">
                <div className="relative group">
                  <img 
                    src={spoofedImages[selectedImageIndex].spoofA} 
                    alt="Spoof A - Random Date & GPS" 
                    className="w-full h-32 object-cover rounded-md border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadImage(spoofedImages[selectedImageIndex].spoofA, `${spoofedImages[selectedImageIndex].originalName}_SpoofA.jpg`)}
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
                    src={spoofedImages[selectedImageIndex].spoofB} 
                    alt="Spoof B - Date & Camera" 
                    className="w-full h-32 object-cover rounded-md border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadImage(spoofedImages[selectedImageIndex].spoofB, `${spoofedImages[selectedImageIndex].originalName}_SpoofB.jpg`)}
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
                    src={spoofedImages[selectedImageIndex].spoofC} 
                    alt="Spoof C - No EXIF" 
                    className="w-full h-32 object-cover rounded-md border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadImage(spoofedImages[selectedImageIndex].spoofC, `${spoofedImages[selectedImageIndex].originalName}_SpoofC.jpg`)}
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
                    src={spoofedImages[selectedImageIndex].spoofD} 
                    alt="Spoof D - Complete" 
                    className="w-full h-32 object-cover rounded-md border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadImage(spoofedImages[selectedImageIndex].spoofD, `${spoofedImages[selectedImageIndex].originalName}_SpoofD.jpg`)}
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

