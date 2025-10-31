import { NextRequest, NextResponse } from 'next/server'
import { SpoofConfig } from '@/lib/image-spoofer/types'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageDataUrl, config } = body as { imageDataUrl: string; config?: Partial<SpoofConfig> }

    if (!imageDataUrl) {
      return NextResponse.json(
        { error: 'imageDataUrl is required' },
        { status: 400 }
      )
    }

    // Import and use the enhanced spoofer
    // Note: Since the enhanced spoofer uses browser APIs (Canvas), we need to 
    // either use it client-side or use a server-side alternative
    
    // For server-side, we'll use the basic EXIF spoofing approach
    // Enhanced visual modifications will be done client-side
    const { spoofImageBasic } = await import('@/lib/image-spoofer/server-spoofer')
    
    const result = await spoofImageBasic(imageDataUrl, config)
    
    return NextResponse.json({
      success: true,
      result
    })
  } catch (error) {
    console.error('Image spoofing error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to spoof image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

