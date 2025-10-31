// Server-side compatible spoofer (no Canvas API)
import piexif from 'piexifjs'
import { SpoofConfig } from './types'

export interface SpoofResult {
  spoofA: string
  spoofB: string
  spoofC: string
  spoofD: string
}

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

/**
 * Basic EXIF spoofing (server-side compatible)
 */
export async function spoofImageBasic(
  imageDataUrl: string,
  config?: Partial<SpoofConfig>
): Promise<SpoofResult> {
  const imageDataUrlClean = imageDataUrl.startsWith('data:') 
    ? imageDataUrl 
    : `data:image/jpeg;base64,${imageDataUrl}`

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
  const spoofA = piexif.insert(exifBytesA, imageDataUrlClean)

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
  const spoofB = piexif.insert(exifBytesB, imageDataUrlClean)

  // --- Spoof C: Strip All EXIF Data ---
  const spoofC = imageDataUrlClean

  // --- Spoof D: Complete spoofing ---
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
  const spoofD = piexif.insert(exifBytesD, imageDataUrlClean)

  return {
    spoofA,
    spoofB,
    spoofC,
    spoofD
  }
}

