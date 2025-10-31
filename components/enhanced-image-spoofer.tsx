'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Download, Upload } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { SpoofConfig } from '@/lib/image-spoofer/types'
import { spoofImageEnhanced } from '@/lib/image-spoofer/enhanced-spoofer'

export function EnhancedImageSpoofer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [config, setConfig] = useState<Partial<SpoofConfig>>({
    quality: 85,
    enableNoise: true,
    enableWarping: true,
    enableColorShift: true,
    enableFilters: true,
    enableShapes: true
  })
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
      setResults(null)
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid image file',
        variant: 'destructive',
      })
    }
  }

  const handleSpoof = async () => {
    if (!previewUrl) {
      toast({
        title: 'Error',
        description: 'Please select an image first',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    try {
      const result = await spoofImageEnhanced(previewUrl, config)
      setResults(result)
      toast({
        title: 'Success',
        description: 'Image spoofed successfully!',
      })
    } catch (error) {
      console.error('Spoofing error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to spoof image',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
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

  const toggleConfig = (key: keyof SpoofConfig) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎨 Enhanced Image Spoofer</CardTitle>
        <CardDescription>
          Spoof images with advanced visual modifications and EXIF data manipulation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div>
          <Label htmlFor="image-upload">Select Image</Label>
          <div className="mt-2 flex gap-2">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="flex-1"
              disabled={isProcessing}
            />
            {selectedFile && (
              <span className="self-center text-sm text-gray-500 truncate max-w-xs">
                {selectedFile.name}
              </span>
            )}
          </div>
        </div>

        {/* Configuration Options */}
        <div className="space-y-3 border-t pt-4">
          <Label>Advanced Options</Label>
          
          <div className="space-y-2">
            <div>
              <Label htmlFor="quality">Quality</Label>
              <Input
                id="quality"
                type="range"
                min="50"
                max="100"
                step="5"
                value={config.quality || 85}
                onChange={(e) => setConfig({ ...config, quality: parseInt(e.target.value) })}
                className="mt-1"
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {config.quality}% JPEG Quality
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => toggleConfig('enableNoise')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                  config.enableNoise
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700'
                }`}
                disabled={isProcessing}
              >
                <Checkbox 
                  checked={config.enableNoise} 
                  className="w-4 h-4"
                  onCheckedChange={() => toggleConfig('enableNoise')}
                />
                <span className="text-sm">Add Noise</span>
              </button>

              <button
                type="button"
                onClick={() => toggleConfig('enableWarping')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                  config.enableWarping
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700'
                }`}
                disabled={isProcessing}
              >
                <Checkbox 
                  checked={config.enableWarping} 
                  className="w-4 h-4"
                  onCheckedChange={() => toggleConfig('enableWarping')}
                />
                <span className="text-sm">Warping</span>
              </button>

              <button
                type="button"
                onClick={() => toggleConfig('enableColorShift')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                  config.enableColorShift
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700'
                }`}
                disabled={isProcessing}
              >
                <Checkbox 
                  checked={config.enableColorShift} 
                  className="w-4 h-4"
                  onCheckedChange={() => toggleConfig('enableColorShift')}
                />
                <span className="text-sm">Color Shift</span>
              </button>

              <button
                type="button"
                onClick={() => toggleConfig('enableFilters')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                  config.enableFilters
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700'
                }`}
                disabled={isProcessing}
              >
                <Checkbox 
                  checked={config.enableFilters} 
                  className="w-4 h-4"
                  onCheckedChange={() => toggleConfig('enableFilters')}
                />
                <span className="text-sm">Vignette</span>
              </button>

              <button
                type="button"
                onClick={() => toggleConfig('enableShapes')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                  config.enableShapes
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700'
                }`}
                disabled={isProcessing}
              >
                <Checkbox 
                  checked={config.enableShapes} 
                  className="w-4 h-4"
                  onCheckedChange={() => toggleConfig('enableShapes')}
                />
                <span className="text-sm">Random Shapes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="border-t pt-4">
            <Label>Preview</Label>
            <div className="mt-2">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 w-auto rounded-md border border-gray-200"
              />
            </div>
          </div>
        )}

        {/* Process Button */}
        <Button
          onClick={handleSpoof}
          disabled={!previewUrl || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Spoof Image
            </>
          )}
        </Button>

        {/* Results */}
        {results && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Results</Label>
              <Button
                onClick={() => {
                  setResults(null)
                  setPreviewUrl('')
                  setSelectedFile(null)
                  const input = document.getElementById('image-upload') as HTMLInputElement
                  if (input) input.value = ''
                }}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Spoof A */}
              <div className="space-y-2">
                <div className="relative group">
                  <img
                    src={results.spoofA}
                    alt="Spoof A - Random Date & GPS"
                    className="w-full h-40 object-cover rounded-md border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadImage(results.spoofA, 'spoof_a.jpg')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-center font-medium">
                  Spoof A (Date & GPS)
                </p>
              </div>

              {/* Spoof B */}
              <div className="space-y-2">
                <div className="relative group">
                  <img
                    src={results.spoofB}
                    alt="Spoof B - Date & Camera"
                    className="w-full h-40 object-cover rounded-md border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadImage(results.spoofB, 'spoof_b.jpg')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-center font-medium">
                  Spoof B (Date & Camera)
                </p>
              </div>

              {/* Spoof C */}
              <div className="space-y-2">
                <div className="relative group">
                  <img
                    src={results.spoofC}
                    alt="Spoof C - No EXIF"
                    className="w-full h-40 object-cover rounded-md border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadImage(results.spoofC, 'spoof_c.jpg')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-center font-medium">
                  Spoof C (No EXIF)
                </p>
              </div>

              {/* Spoof D */}
              <div className="space-y-2">
                <div className="relative group">
                  <img
                    src={results.spoofD}
                    alt="Spoof D - Complete"
                    className="w-full h-40 object-cover rounded-md border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadImage(results.spoofD, 'spoof_d.jpg')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-center font-medium">
                  Spoof D (Complete)
                </p>
              </div>

              {/* Enhanced */}
              <div className="space-y-2 md:col-span-2">
                <div className="relative group">
                  <img
                    src={results.enhanced}
                    alt="Enhanced - Advanced Modifications"
                    className="w-full h-40 object-cover rounded-md border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadImage(results.enhanced, 'spoof_enhanced.jpg')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Enhanced
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-center font-medium">
                  ✨ Enhanced (Advanced Visual + Full EXIF)
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

