import { NextRequest, NextResponse } from 'next/server'

const DIFY_API_BASE_URL = process.env.DIFY_API_BASE_URL || 'https://dify-api.faizath.com/v1'
const DIFY_API_KEY = process.env.DIFY_API_KEY

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!DIFY_API_KEY) {
      return NextResponse.json(
        { error: 'Dify API key not configured' },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { query, conversationId, inputs = {}, responseMode = 'blocking', user } = body

    // Validate required fields
    if (!query || !user) {
      return NextResponse.json(
        { error: 'Missing required fields: query and user are required' },
        { status: 400 }
      )
    }

    // Prepare request to Dify API
    const difyRequestBody = {
      query,
      inputs,
      response_mode: responseMode,
      user,
      ...(conversationId && { conversation_id: conversationId }),
      auto_generate_name: true
    }

    console.log('Forwarding request to Dify API:', {
      url: `${DIFY_API_BASE_URL}/chat-messages`,
      body: difyRequestBody
    })

    // Forward request to Dify API
    const difyResponse = await fetch(`${DIFY_API_BASE_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(difyRequestBody)
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

    // Handle streaming response
    if (responseMode === 'streaming') {
      // Return the stream directly
      return new NextResponse(difyResponse.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Handle blocking response
    const data = await difyResponse.json()
    console.log('Dify API response data:', data)
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in chat API route:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}