// Test file for Dify AI service integration
import { difyService } from '../difyService'

// Mock fetch for testing
global.fetch = jest.fn()

describe('DifyService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => null),
        removeItem: jest.fn(() => null),
      },
      writable: true,
    })
  })

  it('should create a user ID if none exists', () => {
    const userId = (difyService as any).userId
    expect(userId).toBeDefined()
    expect(userId).toMatch(/^user_\d+_[a-z0-9]+$/)
  })

  it('should reuse existing user ID from localStorage', () => {
    const mockUserId = 'user_1234567890_abc123'
    ;(window.localStorage.getItem as jest.Mock).mockReturnValue(mockUserId)
    
    // Create new instance to test localStorage integration
    const { DifyService } = require('../difyService')
    const service = new DifyService()
    
    expect((service as any).userId).toBe(mockUserId)
  })

  it('should send message with correct headers and body', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        event: 'message',
        task_id: 'test-task-id',
        id: 'test-id',
        message_id: 'test-message-id',
        conversation_id: 'test-conversation-id',
        answer: 'Test response',
        created_at: Date.now()
      })
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    const result = await difyService.sendMessage('Test query', undefined, {}, 'blocking')

    expect(global.fetch).toHaveBeenCalledWith(
      'https://dify-api.faizath.com/v1/chat-messages',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer app-xQx8YpYKECfklbRTbcdZ7ZGo',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Test query',
          inputs: {},
          response_mode: 'blocking',
          user: expect.any(String),
          auto_generate_name: true
        })
      })
    )

    expect(result).toEqual(expect.objectContaining({
      event: 'message',
      task_id: 'test-task-id',
      id: 'test-id',
      message_id: 'test-message-id',
      conversation_id: 'test-conversation-id',
      answer: 'Test response'
    }))
  })

  it('should handle API errors gracefully', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    await expect(difyService.sendMessage('Test query')).rejects.toThrow(
      'Dify API error: 500 Internal Server Error'
    )
  })

  it('should get messages with correct parameters', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        limit: 20,
        has_more: false,
        data: []
      })
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    const result = await difyService.getMessages('test-conversation-id', 'first-id', 10)

    expect(global.fetch).toHaveBeenCalledWith(
      'https://dify-api.faizath.com/v1/messages?user=user_1234567890_abc123&conversation_id=test-conversation-id&limit=10&first_id=first-id',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer app-xQx8YpYKECfklbRTbcdZ7ZGo',
        }
      })
    )

    expect(result).toEqual({
      limit: 20,
      has_more: false,
      data: []
    })
  })
})

