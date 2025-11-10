import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

interface CreateAliasRequest {
  description?: string
}

export async function POST(request: NextRequest) {
  try {
    const { description = '' }: CreateAliasRequest = await request.json()

    // Firefox Relay API key
    const apiKey = "6c5851c0-9131-434a-a1cd-7fae1d1a6af4"

    // Create relay alias via Firefox Relay API
    // Try different authentication methods
    const response = await fetch("https://relay.firefox.com/api/v1/relayaddresses/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        // Try API key as Bearer token
        "Authorization": `Bearer ${apiKey}`,
        // Also try as X-API-Key header (some APIs use this)
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ description }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error(`Firefox Relay API error ${response.status}:`, errText)
      console.error('Response headers:', Object.fromEntries(response.headers.entries()))
      return NextResponse.json(
        { 
          error: `Firefox Relay API error`,
          details: `Status ${response.status}: ${errText}`,
          status: response.status
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: {
        full_address: data.full_address,
        id: data.id,
        description: data.description,
        created_at: data.created_at,
      }
    })

  } catch (error) {
    console.error('Firefox Relay error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create relay alias',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

