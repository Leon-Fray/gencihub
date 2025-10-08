import { NextRequest, NextResponse } from 'next/server'
import { HttpsProxyAgent } from 'https-proxy-agent'
import https from 'https'

// Force this route to use Node.js runtime (required for proxy support)
export const runtime = 'nodejs'

// ===================================================================
// CONFIGURATION (from upvote.py)
// ===================================================================

const API_KEY = "xru1IOVjfOuey2jqQ1XUY9Pf22Q2hhDB"
const API_URL = "https://upvote.biz/api/v1"
const SERVICE_ID = 2
const QUANTITY = 10

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
    
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: options.method,
      headers: {
        ...options.headers,
        'Content-Length': Buffer.byteLength(body),
      },
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

    req.write(body)
    req.end()
  })
}

// ===================================================================
// API ROUTE HANDLER
// ===================================================================

export async function POST(request: NextRequest) {
  try {
    const { postLink } = await request.json()

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

    // Prepare the payload for upvote.biz API
    const formData = new URLSearchParams({
      key: API_KEY,
      action: 'add',
      service: SERVICE_ID.toString(),
      link: postLink,
      quantity: QUANTITY.toString()
    })

    // Make the request to upvote.biz API through the proxy
    const response = await makeProxyRequest(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
      },
    }, formData.toString())

    if (response.status !== 200) {
      throw new Error(`API responded with status ${response.status}: ${response.text}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Upvotes have been sent successfully!',
      data: response.data
    })

  } catch (error) {
    console.error('Upvote bot error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send upvotes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

