import { NextRequest, NextResponse } from 'next/server'

const DIFY_API_BASE_URL = process.env.DIFY_API_BASE_URL || 'https://dify-api.faizath.com/v1'
const DIFY_API_KEY = process.env.DIFY_API_KEY

export async function GET(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!DIFY_API_KEY) {
      return NextResponse.json(
        { error: 'Dify API key not configured' },
        { status: 500 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const conversationId = searchParams.get('conversation_id')
    const user = searchParams.get('user')
    const firstId = searchParams.get('first_id')
    const limit = searchParams.get('limit') || '20'

    // Validate required fields
    if (!conversationId || !user) {
      return NextResponse.json(
        { error: 'Missing required parameters: conversation_id and user are required' },
        { status: 400 }
      )
    }

    // Build query parameters for Dify API
    const params = new URLSearchParams({
      user,
      conversation_id: conversationId,
      limit
    })

    if (firstId) {
      params.append('first_id', firstId)
    }

    const url = `${DIFY_API_BASE_URL}/messages?${params.toString()}`

    console.log('Fetching message history from Dify API:', url)

    // Forward request to Dify API
    const difyResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      }
    })

    console.log('Dify API response status:', difyResponse.status)

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text()
      console.error('Dify API error:', errorText)
      return NextResponse.json(
        { error: `Dify API error: ${difyResponse.status} ${difyResponse.statusText}`, details: errorText },
        { status: difyResponse.status }
      )
    }

    const data = await difyResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in chat history API route:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}