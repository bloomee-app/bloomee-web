// Dify AI Service for chat integration (using Next.js API routes)
export interface DifyMessage {
  id: string
  conversation_id: string
  inputs: Record<string, any>
  query: string
  answer: string
  message_files: Array<{
    id: string
    type: string
    url: string
    belongs_to: string
  }>
  feedback: {
    rating: string
  } | null
  retriever_resources: Array<{
    position: number
    dataset_id: string
    dataset_name: string
    document_id: string
    document_name: string
    segment_id: string
    score: number
    content: string
  }>
  created_at: number
}

export interface DifyMessagesResponse {
  limit: number
  has_more: boolean
  data: DifyMessage[]
}

export interface DifyChatResponse {
  event: string
  task_id: string
  id: string
  message_id: string
  conversation_id: string
  answer: string
  created_at: number
  feedback?: {
    rating: string
  }
  retriever_resources?: Array<{
    position: number
    dataset_id: string
    dataset_name: string
    document_id: string
    document_name: string
    segment_id: string
    score: number
    content: string
  }>
}

export interface DifyStreamResponse {
  event: string
  task_id: string
  id: string
  message_id: string
  conversation_id: string
  answer: string
  created_at: number
  metadata?: {
    usage?: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
    }
  }
}

class DifyService {
  private userId: string

  constructor() {
    this.userId = this.getOrCreateUserId()
  }

  private getOrCreateUserId(): string {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    let userId = localStorage.getItem('dify_user_id')
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('dify_user_id', userId)
    }
    return userId
  }

  // Send a chat message via Next.js API route
  async sendMessage(
    query: string,
    conversationId?: string,
    inputs: Record<string, any> = {},
    responseMode: 'streaming' | 'blocking' = 'streaming'
  ): Promise<DifyChatResponse | ReadableStream<Uint8Array>> {
    const url = '/api/chat'
    
    // According to Dify docs, inputs should be an empty object if no variables are defined
    const requestBody = {
      query,
      inputs: {}, // Always use empty object as per documentation examples
      responseMode,
      user: this.userId,
      ...(conversationId && { conversationId }),
    }

    console.log('Sending request to Next.js API:', {
      url,
      requestBody: { ...requestBody, inputs: JSON.stringify({}) }
    })

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Next.js API response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Next.js API error response:', errorData)
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`)
      }

      if (responseMode === 'streaming') {
        if (!response.body) {
          throw new Error('No response body for streaming request')
        }
        return response.body as ReadableStream<Uint8Array>
      } else {
        const jsonResponse = await response.json()
        console.log('Next.js API blocking response:', jsonResponse)
        return jsonResponse as DifyChatResponse
      }
    } catch (error) {
      console.error('Error in sendMessage:', error)
      throw error
    }
  }

  // Get conversation history via Next.js API route
  async getMessages(
    conversationId: string,
    firstId?: string,
    limit: number = 20
  ): Promise<DifyMessagesResponse> {
    const params = new URLSearchParams({
      user: this.userId,
      conversation_id: conversationId,
      limit: limit.toString()
    })

    if (firstId) {
      params.append('first_id', firstId)
    }

    const url = `/api/chat/history?${params.toString()}`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Next.js API error response:', errorData)
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`)
      }

      return response.json()
    } catch (error) {
      console.error('Error in getMessages:', error)
      throw error
    }
  }

  // Submit feedback via Next.js API route
  async submitFeedback(
    messageId: string,
    rating: 'like' | 'dislike',
    content?: string
  ): Promise<{ result: string }> {
    const url = '/api/chat/feedback'
    
    const requestBody = {
      messageId,
      rating,
      user: this.userId,
      ...(content && { content })
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Next.js API error response:', errorData)
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`)
      }

      return response.json()
    } catch (error) {
      console.error('Error in submitFeedback:', error)
      throw error
    }
  }

  // Parse streaming response
  async parseStreamResponse(stream: ReadableStream): Promise<{
    conversationId: string
    messageId: string
    fullAnswer: string
    retrieverResources?: any[]
  }> {
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let conversationId = ''
    let messageId = ''
    let fullAnswer = ''
    let retrieverResources: any[] = []

    console.log('Starting to parse streaming response...')

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('Stream ended')
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        console.log('Received chunk:', chunk)
        
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.trim() === '') continue
          
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim()
              if (jsonStr === '[DONE]') {
                console.log('Stream completed')
                continue
              }
              
              const data = JSON.parse(jsonStr)
              console.log('Parsed streaming data:', data)
              
              if (data.event === 'message') {
                // Accumulate streaming text chunks
                conversationId = data.conversation_id || conversationId
                messageId = data.message_id || messageId
                fullAnswer += data.answer || ''
                
                console.log('Updated values:', { conversationId, messageId, fullAnswer: fullAnswer.substring(0, 100) + '...' })
              } else if (data.event === 'message_end') {
                // Final message with metadata
                conversationId = data.conversation_id || conversationId
                messageId = data.message_id || messageId
                if (data.metadata?.retriever_resources) {
                  retrieverResources = data.metadata.retriever_resources
                }
                console.log('Message ended with metadata:', data.metadata)
              }
            } catch (e) {
              console.warn('Failed to parse streaming line:', line, e)
              // Skip invalid JSON lines
              continue
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing stream:', error)
      throw error
    } finally {
      reader.releaseLock()
    }

    console.log('Final parsed result:', { conversationId, messageId, fullAnswer: fullAnswer.substring(0, 100) + '...', retrieverResources })
    return { conversationId, messageId, fullAnswer, retrieverResources }
  }
}

export const difyService = new DifyService()
