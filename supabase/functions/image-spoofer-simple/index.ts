// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import piexif from "https://esm.sh/piexifjs@1.0.6";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

console.info('Image Spoofer (Simple) server started');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl } = await req.json()
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Fetching image from:', imageUrl)

    // Fetch the image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`)
    }

    const imageArrayBuffer = await imageResponse.arrayBuffer()
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageArrayBuffer)))
    const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`

    // --- Spoof A: Random Date & GPS ---
    const exifObjA = {
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
    const exifObjB = {
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
    const exifObjD = {
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

    // Return all four spoofed images
    return new Response(
      JSON.stringify({
        spoof_a: spoofA,
        spoof_b: spoofB,
        spoof_c: spoofC,
        spoof_d: spoofD
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Connection': 'keep-alive'
        } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

