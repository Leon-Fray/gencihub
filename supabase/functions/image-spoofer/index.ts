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

// Extract folder ID from Google Drive URL
function extractFolderId(url: string): string | null {
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

// Get Google Drive access token using service account
async function getAccessToken(): Promise<string> {
  const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY')
  
  if (!serviceAccountKey) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not found in environment')
  }

  const credentials = JSON.parse(serviceAccountKey)
  
  // Create JWT for service account
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  }
  
  const now = Math.floor(Date.now() / 1000)
  const claim = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }

  // Import the private key
  const privateKey = credentials.private_key
  const encoder = new TextEncoder()
  
  // Create signature
  const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const claimBase64 = btoa(JSON.stringify(claim)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const signatureInput = `${headerBase64}.${claimBase64}`
  
  // Import key for signing
  const keyData = privateKey.replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0))
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signatureInput)
  )
  
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  const jwt = `${signatureInput}.${signatureBase64}`
  
  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  })
  
  if (!tokenResponse.ok) {
    throw new Error('Failed to get access token')
  }
  
  const tokenData = await tokenResponse.json()
  return tokenData.access_token
}

// List all image files in a Google Drive folder
async function listImagesInFolder(folderId: string, accessToken: string): Promise<any[]> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+(mimeType+contains+'image/')&fields=files(id,name,mimeType)&pageSize=1000`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )
  
  if (!response.ok) {
    throw new Error('Failed to list files from Google Drive')
  }
  
  const data = await response.json()
  return data.files || []
}

// Download image from Google Drive
async function downloadImage(fileId: string, accessToken: string): Promise<ArrayBuffer> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )
  
  if (!response.ok) {
    throw new Error('Failed to download image from Google Drive')
  }
  
  return await response.arrayBuffer()
}

// Spoof a single image with all 4 variations
function spoofImage(imageBase64: string) {
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

  return { spoofA, spoofB, spoofC, spoofD }
}

console.info('Image Spoofer server started');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { driveUrl, maxImages = 10 } = await req.json()
    
    if (!driveUrl) {
      return new Response(
        JSON.stringify({ error: 'driveUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract folder ID from URL
    const folderId = extractFolderId(driveUrl)
    if (!folderId) {
      return new Response(
        JSON.stringify({ error: 'Invalid Google Drive folder URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get access token
    const accessToken = await getAccessToken()
    
    // List images in folder
    const files = await listImagesInFolder(folderId, accessToken)
    
    if (files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No images found in folder' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process only first N images to avoid timeout
    const filesToProcess = files.slice(0, maxImages)
    const results = []

    for (const file of filesToProcess) {
      try {
        // Skip HEIF files for now (piexifjs doesn't support them)
        if (file.name.toLowerCase().endsWith('.heif') || file.name.toLowerCase().endsWith('.heic')) {
          console.log(`Skipping HEIF file: ${file.name}`)
          continue
        }

        // Download image
        const imageArrayBuffer = await downloadImage(file.id, accessToken)
        const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageArrayBuffer)))
        
        // Spoof image
        const spoofed = spoofImage(imageBase64)
        
        results.push({
          originalName: file.name,
          ...spoofed
        })
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error.message)
        // Continue with next image
      }
    }

    return new Response(
      JSON.stringify({
        totalImages: files.length,
        processedImages: results.length,
        skippedImages: filesToProcess.length - results.length,
        images: results
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
