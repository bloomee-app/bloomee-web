// Test file for Chat History Service
import { chatHistoryService, ChatMessage, Conversation } from '../chatHistoryService'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('ChatHistoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return empty history when no data is stored', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    const history = chatHistoryService.getChatHistory()
    
    expect(history).toEqual({
      conversations: [],
      messages: {}
    })
  })

  it('should create a new conversation', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      conversations: [],
      messages: {}
    }))
    
    const conversation = chatHistoryService.createConversation('Test Conversation')
    
    expect(conversation).toEqual(expect.objectContaining({
      id: expect.stringMatching(/^conv_\d+_[a-z0-9]+$/),
      title: 'Test Conversation',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      messageCount: 0
    }))
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'bloome_chat_history',
      expect.stringContaining('Test Conversation')
    )
  })

  it('should add a message to a conversation', () => {
    const conversationId = 'test-conversation-id'
    const message: ChatMessage = {
      id: 'test-message-id',
      type: 'user',
      content: 'Hello, world!',
      timestamp: new Date(),
    }

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      conversations: [{
        id: conversationId,
        title: 'Test Conversation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0
      }],
      messages: {
        [conversationId]: []
      }
    }))
    
    chatHistoryService.addMessage(conversationId, message)
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'bloome_chat_history',
      expect.stringContaining('Hello, world!')
    )
  })

  it('should get messages for a conversation', () => {
    const conversationId = 'test-conversation-id'
    const messages: ChatMessage[] = [
      {
        id: 'msg1',
        type: 'user',
        content: 'Hello',
        timestamp: new Date(),
      },
      {
        id: 'msg2',
        type: 'assistant',
        content: 'Hi there!',
        timestamp: new Date(),
      }
    ]

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      conversations: [],
      messages: {
        [conversationId]: messages
      }
    }))
    
    const retrievedMessages = chatHistoryService.getMessages(conversationId)
    
    expect(retrievedMessages).toHaveLength(2)
    expect(retrievedMessages[0].content).toBe('Hello')
    expect(retrievedMessages[1].content).toBe('Hi there!')
  })

  it('should delete a conversation', () => {
    const conversationId = 'test-conversation-id'
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      conversations: [{
        id: conversationId,
        title: 'Test Conversation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 2
      }],
      messages: {
        [conversationId]: [
          { id: 'msg1', type: 'user', content: 'Hello', timestamp: new Date().toISOString() }
        ]
      },
      currentConversationId: conversationId
    }))
    
    chatHistoryService.deleteConversation(conversationId)
    
    const setItemCall = mockLocalStorage.setItem.mock.calls[0]
    const savedData = JSON.parse(setItemCall[1])
    
    expect(savedData.conversations).toHaveLength(0)
    expect(savedData.messages[conversationId]).toBeUndefined()
    expect(savedData.currentConversationId).toBeUndefined()
  })

  it('should export and import history correctly', () => {
    const testHistory = {
      conversations: [{
        id: 'test-conv',
        title: 'Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 1
      }],
      messages: {
        'test-conv': [{
          id: 'test-msg',
          type: 'user' as const,
          content: 'Test message',
          timestamp: new Date().toISOString()
        }]
      }
    }

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testHistory))
    
    const exported = chatHistoryService.exportHistory()
    const parsed = JSON.parse(exported)
    
    expect(parsed.conversations).toHaveLength(1)
    expect(parsed.messages['test-conv']).toHaveLength(1)
    
    // Test import
    const importResult = chatHistoryService.importHistory(exported)
    expect(importResult).toBe(true)
  })

  it('should handle invalid import data gracefully', () => {
    const invalidJson = 'invalid json'
    
    const result = chatHistoryService.importHistory(invalidJson)
    
    expect(result).toBe(false)
  })

  it('should get conversation statistics', () => {
    const testHistory = {
      conversations: [
        {
          id: 'conv1',
          title: 'First',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          messageCount: 5
        },
        {
          id: 'conv2',
          title: 'Second',
          createdAt: '2023-01-02T00:00:00.000Z',
          updatedAt: '2023-01-02T00:00:00.000Z',
          messageCount: 3
        }
      ],
      messages: {}
    }

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testHistory))
    
    const stats = chatHistoryService.getStats()
    
    expect(stats.totalConversations).toBe(2)
    expect(stats.totalMessages).toBe(8)
    expect(stats.oldestConversation).toEqual(new Date('2023-01-01T00:00:00.000Z'))
    expect(stats.newestConversation).toEqual(new Date('2023-01-02T00:00:00.000Z'))
  })
})
