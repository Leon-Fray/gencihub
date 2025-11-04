import { NextRequest, NextResponse } from 'next/server'
import { HttpsProxyAgent } from 'https-proxy-agent'
import https from 'https'

// Force this route to use Node.js runtime (required for proxy support)
export const runtime = 'nodejs'

// ===================================================================
// CONFIGURATION
// ===================================================================

const API_KEY = "dfc249193332b368285a69aba9dee9d6"
const API_BASE_URL = "https://upvotehub.com/api"

// Proxy configuration
const PROXY_IP = '45.45.153.16'
const PROXY_PORT = '61234'
const PROXY_USERNAME = '89404_YojKq'
const PROXY_PASSWORD = 'iEU6SOsuyh'

// ===================================================================
// Helper function to make request with proxy
// ===================================================================

function makeProxyRequest(url: string, options: any, body: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const proxyUrl = `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@${PROXY_IP}:${PROXY_PORT}`
    const agent = new HttpsProxyAgent(proxyUrl)

    const urlObj = new URL(url)
    const method = options.method || 'GET'
    const isBodyRequest = ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
    
    const headers: any = { ...options.headers }
    if (isBodyRequest && body) {
      headers['Content-Length'] = Buffer.byteLength(body)
    }
    
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: method,
      headers: headers,
      agent: agent,
    }

    const req = https.request(requestOptions, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({ status: res.statusCode, data: jsonData, text: data })
        } catch (e) {
          resolve({ status: res.statusCode, data: null, text: data })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    if (isBodyRequest && body) {
      req.write(body)
    }
    req.end()
  })
}

// ===================================================================
// API ROUTE HANDLER
// ===================================================================

export async function POST(request: NextRequest) {
  try {
    const { postLink, speed_preset = 'fast', target_upvotes } = await request.json()

    if (!postLink) {
      return NextResponse.json(
        { error: 'Post link is required' },
        { status: 400 }
      )
    }

    // Validate Reddit URL
    if (!postLink.includes('reddit.com')) {
      return NextResponse.json(
        { error: 'Please provide a valid Reddit link' },
        { status: 400 }
      )
    }

    // Validate speed preset
    const validSpeedPresets = ['snail', 'slowest', 'slower', 'slow', 'normal', 'fast', 'turbo']
    if (!validSpeedPresets.includes(speed_preset)) {
      return NextResponse.json(
        { error: `Speed preset must be one of: ${validSpeedPresets.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate target upvotes
    if (!target_upvotes || target_upvotes < 1) {
      return NextResponse.json(
        { error: 'Target upvotes must be at least 1' },
        { status: 400 }
      )
    }

    const endpoint = `${API_BASE_URL}/v3/createOrder`
    const requestBody = {
      url: postLink,
      speed_preset,
      target_upvotes
    }

    // Make the request to UpvoteHub API through the proxy
    const response = await makeProxyRequest(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
      },
    }, JSON.stringify(requestBody))

    if (response.status !== 200) {
      const errorMsg = response.data?.message || response.text || 'Unknown error'
      console.error(`UpvoteHub API error (status ${response.status}):`, errorMsg)
      return NextResponse.json(
        { 
          error: `API request failed: ${errorMsg}`,
          details: response.data
        },
        { status: 400 }
      )
    }

    // Check if the API returned an error status
    if (response.data?.status === 'error') {
      console.error('UpvoteHub API error response:', response.data)
      return NextResponse.json(
        { 
          error: response.data.message || 'API request failed',
          details: response.data
        },
        { status: 400 }
      )
    }

    if (!response.data || !response.data.order_id) {
      console.error('Invalid response from UpvoteHub API:', response.data)
      return NextResponse.json(
        { 
          error: 'Invalid response from API: Missing order_id',
          details: response.data
        },
        { status: 500 }
      )
    }

    const successMessage = `Upvote order created! Order ID: ${response.data.order_id}`

    return NextResponse.json({
      success: true,
      message: successMessage,
      order_id: response.data.order_id,
      cost: response.data.cost || response.data.price,
      data: response.data
    })

  } catch (error) {
    console.error('UpvoteBot 2.0 error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

