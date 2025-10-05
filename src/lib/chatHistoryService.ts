// Chat History Service for local storage management
export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  conversationId?: string
  messageId?: string
  retrieverResources?: Array<{
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

export interface Conversation {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  lastMessage?: string
}

export interface ChatHistory {
  conversations: Conversation[]
  currentConversationId?: string
  messages: Record<string, ChatMessage[]> // conversationId -> messages
}

class ChatHistoryService {
  private storageKey = 'bloome_chat_history'
  private maxConversations = 50
  private maxMessagesPerConversation = 100

  // Get all chat history from localStorage
  getChatHistory(): ChatHistory {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) {
        return {
          conversations: [],
          messages: {}
        }
      }
      
      const parsed = JSON.parse(stored)
      
      // Convert date strings back to Date objects
      parsed.conversations = parsed.conversations.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt)
      }))
      
      // Convert message timestamps back to Date objects
      Object.keys(parsed.messages).forEach(conversationId => {
        parsed.messages[conversationId] = parsed.messages[conversationId].map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      })
      
      return parsed
    } catch (error) {
      console.error('Error loading chat history:', error)
      return {
        conversations: [],
        messages: {}
      }
    }
  }

  // Save chat history to localStorage
  private saveChatHistory(history: ChatHistory): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(history))
    } catch (error) {
      console.error('Error saving chat history:', error)
    }
  }

  // Create a new conversation
  createConversation(title?: string): Conversation {
    const conversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title || 'New Conversation',
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0
    }

    const history = this.getChatHistory()
    history.conversations.unshift(conversation)
    history.messages[conversation.id] = []
    
    // Limit number of conversations
    if (history.conversations.length > this.maxConversations) {
      const removed = history.conversations.splice(this.maxConversations)
      removed.forEach(conv => {
        delete history.messages[conv.id]
      })
    }
    
    this.saveChatHistory(history)
    return conversation
  }

  // Add a message to a conversation
  addMessage(conversationId: string, message: ChatMessage): void {
    const history = this.getChatHistory()
    
    if (!history.messages[conversationId]) {
      history.messages[conversationId] = []
    }
    
    history.messages[conversationId].push(message)
    
    // Limit messages per conversation
    if (history.messages[conversationId].length > this.maxMessagesPerConversation) {
      history.messages[conversationId] = history.messages[conversationId].slice(-this.maxMessagesPerConversation)
    }
    
    // Update conversation metadata
    const conversation = history.conversations.find(conv => conv.id === conversationId)
    if (conversation) {
      conversation.updatedAt = new Date()
      conversation.messageCount = history.messages[conversationId].length
      conversation.lastMessage = message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '')
      
      // Auto-generate title from first user message if still default
      if (conversation.title === 'New Conversation' && message.type === 'user') {
        conversation.title = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
      }
    }
    
    this.saveChatHistory(history)
  }

  // Get messages for a conversation
  getMessages(conversationId: string): ChatMessage[] {
    const history = this.getChatHistory()
    return history.messages[conversationId] || []
  }

  // Get all conversations
  getConversations(): Conversation[] {
    const history = this.getChatHistory()
    return history.conversations
  }

  // Delete a conversation
  deleteConversation(conversationId: string): void {
    const history = this.getChatHistory()
    history.conversations = history.conversations.filter(conv => conv.id !== conversationId)
    delete history.messages[conversationId]
    
    if (history.currentConversationId === conversationId) {
      history.currentConversationId = undefined
    }
    
    this.saveChatHistory(history)
  }

  // Set current conversation
  setCurrentConversation(conversationId: string): void {
    const history = this.getChatHistory()
    history.currentConversationId = conversationId
    this.saveChatHistory(history)
  }

  // Update conversation name
  updateConversationName(conversationId: string, newName: string): void {
    const history = this.getChatHistory()
    const conversation = history.conversations.find(c => c.id === conversationId)
    if (conversation) {
      conversation.title = newName
      conversation.updatedAt = new Date()
      this.saveChatHistory(history)
    }
  }

  // Get current conversation ID
  getCurrentConversationId(): string | undefined {
    const history = this.getChatHistory()
    return history.currentConversationId
  }

  // Clear all chat history
  clearAllHistory(): void {
    localStorage.removeItem(this.storageKey)
  }

  // Export chat history as JSON
  exportHistory(): string {
    const history = this.getChatHistory()
    return JSON.stringify(history, null, 2)
  }

  // Import chat history from JSON
  importHistory(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData)
      
      // Validate structure
      if (!imported.conversations || !Array.isArray(imported.conversations)) {
        throw new Error('Invalid chat history format')
      }
      
      if (!imported.messages || typeof imported.messages !== 'object') {
        throw new Error('Invalid chat history format')
      }
      
      // Convert dates
      imported.conversations = imported.conversations.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt)
      }))
      
      Object.keys(imported.messages).forEach(conversationId => {
        imported.messages[conversationId] = imported.messages[conversationId].map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      })
      
      localStorage.setItem(this.storageKey, JSON.stringify(imported))
      return true
    } catch (error) {
      console.error('Error importing chat history:', error)
      return false
    }
  }

  // Get conversation statistics
  getStats(): {
    totalConversations: number
    totalMessages: number
    oldestConversation?: Date
    newestConversation?: Date
  } {
    const history = this.getChatHistory()
    const conversations = history.conversations
    
    let totalMessages = 0
    let oldestDate: Date | undefined
    let newestDate: Date | undefined
    
    conversations.forEach(conv => {
      totalMessages += conv.messageCount
      
      if (!oldestDate || conv.createdAt < oldestDate) {
        oldestDate = conv.createdAt
      }
      
      if (!newestDate || conv.createdAt > newestDate) {
        newestDate = conv.createdAt
      }
    })
    
    return {
      totalConversations: conversations.length,
      totalMessages,
      oldestConversation: oldestDate,
      newestConversation: newestDate
    }
  }
}

export const chatHistoryService = new ChatHistoryService()
