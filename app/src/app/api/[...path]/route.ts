import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:57988'

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const url = `${BACKEND_URL}/api/${path.join('/')}`
  console.log(`[PROXY] ${request.method} ${url}`)

  // Forward headers (excluding host and content-length for FormData)
  const headers = new Headers()
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    // Skip host and content-length (will be recalculated)
    if (lowerKey !== 'host' && lowerKey !== 'content-length') {
      headers.set(key, value)
    }
  })

  console.log('[PROXY] Client Authorization header present:', headers.has('authorization'))

  // If no Authorization header from the client, inject from server-side session.
  // The middleware already refreshed the session via getUser(), so getSession()
  // reads the fresh token from cookies that JS on the browser may not access.
  if (!headers.has('authorization')) {
    console.log('[PROXY] No client auth header, checking server-side session...')
    try {
      const supabase = await createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      console.log('[PROXY] Server session:', { 
        hasSession: !!session, 
        hasAccessToken: !!session?.access_token,
        userId: session?.user?.id
      })
      if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`)
        console.log('[PROXY] Injected Authorization header from server session')
      } else {
        console.warn('[PROXY] No server session found')
      }
    } catch (err) {
      console.error('[PROXY] Error getting server session:', err)
    }
  }

  // Get the request body for non-GET requests
  let body: BodyInit | null = null
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      // For FormData, pass through as-is using arrayBuffer
      // This preserves the multipart boundary and structure
      body = await request.arrayBuffer()
    } catch {
      // No body
    }
  }

  try {
    const response = await fetch(url, {
      method: request.method,
      headers,
      body: body || undefined,
    })

    // Create response with same status and headers
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value)
    })

    // Stream SSE responses directly without buffering
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/event-stream')) {
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      })
    }

    const responseBody = await response.arrayBuffer()

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to backend server' },
      { status: 502 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context)
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context)
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context)
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context)
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context)
}
