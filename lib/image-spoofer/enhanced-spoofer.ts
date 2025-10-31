import piexif from 'piexifjs'
import { SpoofConfig } from './types'

// Helper function to generate random date/time string
function generateRandomDate(startYear = 2015, endYear = 2023): string {
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
function generateRandomGPS() {
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
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface EnhancedSpoofResult {
  spoofA: string
  spoofB: string
  spoofC: string
  spoofD: string
  enhanced: string
}

/**
 * Enhanced image spoofer with advanced visual modifications
 * Works client-side using HTML5 Canvas
 */
export async function spoofImageEnhanced(
  imageDataUrl: string,
  config: Partial<SpoofConfig> = {}
): Promise<EnhancedSpoofResult> {
  const {
    quality = 85,
    enableNoise = true,
    enableWarping = true,
    enableColorShift = true,
    enableFilters = true,
    enableShapes = true
  } = config

  // Load image into canvas
  const img = await loadImage(imageDataUrl)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  
  canvas.width = img.width
  canvas.height = img.height
  
  // Draw original image
  ctx.drawImage(img, 0, 0)
  
  // Apply visual enhancements
  if (enableNoise) addNoise(ctx, canvas.width, canvas.height)
  if (enableWarping) applyWarping(ctx, canvas.width, canvas.height)
  if (enableColorShift) applyColorShift(ctx, canvas.width, canvas.height)
  if (enableFilters) applyFilters(ctx, canvas.width, canvas.height)
  if (enableShapes) addRandomShapes(ctx, canvas.width, canvas.height)
  
  // Get enhanced image data URL
  const enhancedImage = canvas.toDataURL('image/jpeg', quality / 100)
  
  // Create traditional EXIF spoofed versions
  const spoofA = spoofImageBasic(imageDataUrl, 'A')
  const spoofB = spoofImageBasic(imageDataUrl, 'B')
  const spoofC = spoofImageBasic(imageDataUrl, 'C')
  const spoofD = spoofImageBasic(imageDataUrl, 'D')
  
  // Create enhanced version with EXIF spoofing
  const enhancedSpoofed = spoofImageBasic(enhancedImage, 'D')
  
  return {
    spoofA,
    spoofB,
    spoofC,
    spoofD,
    enhanced: enhancedSpoofed
  }
}

/**
 * Basic EXIF spoofing (original functionality)
 */
function spoofImageBasic(imageDataUrl: string, variant: 'A' | 'B' | 'C' | 'D'): string {
  const imageDataUrlClean = imageDataUrl.startsWith('data:') 
    ? imageDataUrl 
    : `data:image/jpeg;base64,${imageDataUrl}`

  if (variant === 'C') {
    // Strip all EXIF data
    return imageDataUrlClean
  }

  // --- Spoof A: Random Date & GPS ---
  if (variant === 'A') {
    const exifObjA: any = {
      "GPS": generateRandomGPS(),
      "Exif": {},
      "0th": {}
    }
    const randomDateA = generateRandomDate()
    exifObjA["Exif"][piexif.ExifIFD.DateTimeOriginal] = randomDateA
    exifObjA["0th"][piexif.ImageIFD.DateTime] = randomDateA
    const exifBytesA = piexif.dump(exifObjA)
    return piexif.insert(exifBytesA, imageDataUrlClean)
  }

  // --- Spoof B: Different Random Date & Fake Camera Info ---
  if (variant === 'B') {
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
    return piexif.insert(exifBytesB, imageDataUrlClean)
  }

  // --- Spoof D: Complete spoofing ---
  if (variant === 'D') {
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

  return imageDataUrlClean
}

/**
 * Load image from data URL or URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Add random noise to image
 */
function addNoise(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  
  // Add subtle noise (1-2% of pixels)
  const noiseLevel = 0.015
  for (let i = 0; i < data.length; i += 4) {
    if (Math.random() < noiseLevel) {
      const noise = Math.random() * 60 - 30 // -30 to 30
      data[i] = Math.max(0, Math.min(255, data[i] + noise))     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)) // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)) // B
    }
  }
  
  ctx.putImageData(imageData, 0, 0)
}

/**
 * Apply subtle warping/distortion
 */
function applyWarping(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const displacement = 0.5 // Very subtle
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')!
  tempCanvas.width = width
  tempCanvas.height = height
  
  // Copy original
  tempCtx.drawImage(ctx.canvas, 0, 0)
  
  // Apply slight displacement
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      const offsetX = (Math.random() - 0.5) * displacement * 2
      const offsetY = (Math.random() - 0.5) * displacement * 2
      
      ctx.drawImage(
        tempCanvas,
        x, y, 10, 10,
        x + offsetX, y + offsetY, 10, 10
      )
    }
  }
}

/**
 * Apply subtle color shift
 */
function applyColorShift(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  
  // Shift one color channel slightly
  const channelShift = 1 + (Math.random() - 0.5) * 0.15 // 0.925 to 1.075
  const channel = Math.floor(Math.random() * 3) // 0=R, 1=G, 2=B
  
  for (let i = channel; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] * channelShift))
  }
  
  ctx.putImageData(imageData, 0, 0)
}

/**
 * Apply subtle filters
 */
function applyFilters(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  
  // Apply subtle vignette effect
  const centerX = width / 2
  const centerY = height / 2
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY)
  
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width
    const y = Math.floor((i / 4) / width)
    const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
    const vignette = 1 - (dist / maxDist) * 0.15 // 15% darkening at edges
    
    data[i] *= vignette     // R
    data[i + 1] *= vignette // G
    data[i + 2] *= vignette // B
  }
  
  ctx.putImageData(imageData, 0, 0)
}

/**
 * Add random subtle shapes (as artifacts/overlays)
 */
function addRandomShapes(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Add 1-3 very subtle shapes
  const numShapes = Math.floor(Math.random() * 3) + 1
  
  for (let i = 0; i < numShapes; i++) {
    ctx.save()
    ctx.globalAlpha = 0.05 + Math.random() * 0.1 // Very subtle: 5-15%
    ctx.fillStyle = randomChoice([
      '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00'
    ])
    
    const size = width * 0.05 + Math.random() * width * 0.1
    const x = Math.random() * width
    const y = Math.random() * height
    
    const shapeType = Math.random()
    if (shapeType < 0.33) {
      // Circle
      ctx.beginPath()
      ctx.arc(x, y, size / 2, 0, Math.PI * 2)
      ctx.fill()
    } else if (shapeType < 0.66) {
      // Rectangle
      ctx.fillRect(x - size / 2, y - size / 2, size, size)
    } else {
      // Triangle
      ctx.beginPath()
      ctx.moveTo(x, y - size / 2)
      ctx.lineTo(x - size / 2, y + size / 2)
      ctx.lineTo(x + size / 2, y + size / 2)
      ctx.closePath()
      ctx.fill()
    }
    
    ctx.restore()
  }
}

