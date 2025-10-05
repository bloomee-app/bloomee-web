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
    const { messageId, rating, user, content } = body

    // Validate required fields
    if (!messageId || !rating || !user) {
      return NextResponse.json(
        { error: 'Missing required fields: messageId, rating, and user are required' },
        { status: 400 }
      )
    }

    // Validate rating value
    if (rating !== 'like' && rating !== 'dislike') {
      return NextResponse.json(
        { error: 'Invalid rating value. Must be "like" or "dislike"' },
        { status: 400 }
      )
    }

    // Prepare request to Dify API
    const difyRequestBody = {
      rating,
      user,
      ...(content && { content })
    }

    const url = `${DIFY_API_BASE_URL}/messages/${messageId}/feedbacks`

    console.log('Submitting feedback to Dify API:', url)

    // Forward request to Dify API
    const difyResponse = await fetch(url, {
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

    const data = await difyResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in feedback API route:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}