// Dify AI Service for chat integration
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
  private baseUrl: string
  private apiKey: string
  private userId: string

  constructor() {
    this.baseUrl = 'https://dify-api.faizath.com/v1'
    this.apiKey = 'app-xQx8YpYKECfklbRTbcdZ7ZGo'
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

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  // Send a chat message to Dify AI
  async sendMessage(
    query: string,
    conversationId?: string,
    inputs: Record<string, any> = {},
    responseMode: 'streaming' | 'blocking' = 'streaming'
  ): Promise<DifyChatResponse | ReadableStream<Uint8Array>> {
    const url = `${this.baseUrl}/chat-messages`
    
    // According to Dify docs, inputs should be an empty object if no variables are defined
    const requestBody = {
      query,
      inputs: {}, // Always use empty object as per documentation examples
      response_mode: responseMode,
      user: this.userId,
      ...(conversationId && { conversation_id: conversationId }),
      auto_generate_name: true
    }

    console.log('Sending request to Dify AI:', {
      url,
      requestBody: { ...requestBody, inputs: JSON.stringify({}) }
    })

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      })

      console.log('Dify AI response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Dify API error response:', errorText)
        throw new Error(`Dify API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      if (responseMode === 'streaming') {
        if (!response.body) {
          throw new Error('No response body for streaming request')
        }
        return response.body as ReadableStream<Uint8Array>
      } else {
        const jsonResponse = await response.json()
        console.log('Dify AI blocking response:', jsonResponse)
        return jsonResponse as DifyChatResponse
      }
    } catch (error) {
      console.error('Error in sendMessage:', error)
      throw error
    }
  }

  // Get conversation history
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

    const url = `${this.baseUrl}/messages?${params.toString()}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`Dify API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Submit feedback for a message
  async submitFeedback(
    messageId: string,
    rating: 'like' | 'dislike',
    content?: string
  ): Promise<{ result: string }> {
    const url = `${this.baseUrl}/messages/${messageId}/feedbacks`
    
    const requestBody = {
      rating,
      user: this.userId,
      ...(content && { content })
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Dify API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
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
