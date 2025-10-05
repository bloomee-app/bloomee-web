'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Send, 
  Minimize2, 
  Bot, 
  User,
  Loader2,
  GripVertical,
  Trash2,
  Download,
  Upload
} from 'lucide-react'
import { FaClockRotateLeft } from "react-icons/fa6"
import { IoChatbubbleOutline } from "react-icons/io5";
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { difyService } from '@/lib/difyService'
import { 
  chatHistoryService, 
  ChatMessage, 
  Conversation 
} from '@/lib/chatHistoryService'

interface ChatWidgetProps {
  className?: string
}

export default function ChatWidget({ className }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [panelSize, setPanelSize] = useState({ width: 384, height: 384 }) // 96 * 4 = 384px
  const [panelPosition, setPanelPosition] = useState({ x: 16, y: 0 }) // Will be calculated to bottom position
  const [isPositionInitialized, setIsPositionInitialized] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  
  const { 
    isChatOpen, 
    setChatOpen, 
    selectedLocation, 
    bloomingData,
    isChatWidgetExtended,
    setChatWidgetExtended
  } = useAppStore()

  // Load chat history and conversations on mount
  useEffect(() => {
    if (isChatOpen) {
      loadChatHistory()
    }
  }, [isChatOpen])

  // Load chat history from localStorage
  const loadChatHistory = () => {
    try {
      const historyConversations = chatHistoryService.getConversations()
      setConversations(historyConversations)
      
      const savedConversationId = chatHistoryService.getCurrentConversationId()
      
      if (savedConversationId && historyConversations.find(c => c.id === savedConversationId)) {
        // Load existing conversation
        setCurrentConversationId(savedConversationId)
        const savedMessages = chatHistoryService.getMessages(savedConversationId)
        setMessages(savedMessages)
      } else if (historyConversations.length > 0) {
        // Load most recent conversation
        const mostRecent = historyConversations[0]
        setCurrentConversationId(mostRecent.id)
        const savedMessages = chatHistoryService.getMessages(mostRecent.id)
        setMessages(savedMessages)
      } else {
        // Create new conversation with welcome message
        createNewConversation()
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      setError('Failed to load chat history')
      createNewConversation()
    }
  }

  // Create a new conversation
  const createNewConversation = () => {
    const newConversation = chatHistoryService.createConversation()
    setCurrentConversationId(newConversation.id)
    chatHistoryService.setCurrentConversation(newConversation.id)
    
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'assistant',
      content: 'Hello! I\'m your ecological AI assistant powered by Dify AI. Ask me about blooming patterns, biodiversity, climate impacts, or conservation recommendations for any location you select on the globe.',
      timestamp: new Date()
    }
    
    setMessages([welcomeMessage])
    chatHistoryService.addMessage(newConversation.id, welcomeMessage)
    setConversations(prev => [newConversation, ...prev])
  }

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedExtended = localStorage.getItem('chatWidgetExtended')
    if (savedExtended !== null) {
      const isExtended = JSON.parse(savedExtended)
      setChatWidgetExtended(isExtended)
      
      // If it was expanded, set proper position immediately
      if (isExtended) {
        const properY = Math.max(16, window.innerHeight - panelSize.height - 16)
        setPanelPosition({ x: 16, y: properY })
        setIsPositionInitialized(true)
      }
    }
    setIsLoaded(true)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Save state to localStorage when it changes (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('chatWidgetExtended', JSON.stringify(isChatWidgetExtended))
    }
  }, [isChatWidgetExtended, isLoaded])

  // Set proper bottom position when expanding for the first time
  useEffect(() => {
    if (isChatWidgetExtended && !isPositionInitialized) {
      const properY = Math.max(16, window.innerHeight - panelSize.height - 16)
      setPanelPosition(prev => ({ ...prev, y: properY }))
      setIsPositionInitialized(true)
    }
  }, [isChatWidgetExtended, isPositionInitialized])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentConversationId) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    chatHistoryService.addMessage(currentConversationId, userMessage)
    
    const query = inputValue.trim()
    setInputValue('')
    setIsLoading(true)
    setError(null)

    try {
      // Send message to Dify AI (using blocking mode first for debugging)
      // According to Dify docs, inputs should be empty object if no variables are defined
      console.log('Sending message to Dify AI:', { query, currentConversationId })
      
      // For new conversations, don't send conversation_id to let Dify create a new one
      // Only send conversation_id if it's a valid UUID from Dify
      const isDifyConversationId = currentConversationId && currentConversationId.startsWith('conv_') === false
      const conversationIdToSend = isDifyConversationId ? currentConversationId : undefined
      
      console.log('Using conversation ID:', conversationIdToSend)
      
      const response = await difyService.sendMessage(
        query,
        conversationIdToSend,
        {}, // Empty inputs object as per documentation
        'blocking'
      )

      // Handle blocking response
      console.log('Dify AI response received:', response)
      
      if (response && typeof response === 'object' && 'answer' in response) {
        const difyResponse = response as any
        
        const assistantMessage: ChatMessage = {
          id: difyResponse.message_id || (Date.now() + 1).toString(),
          type: 'assistant',
          content: difyResponse.answer || 'No response received',
          timestamp: new Date(),
          conversationId: difyResponse.conversation_id,
          messageId: difyResponse.message_id,
          retrieverResources: difyResponse.retriever_resources
        }

        setMessages(prev => [...prev, assistantMessage])
        chatHistoryService.addMessage(currentConversationId, assistantMessage)
        
        // Update conversation ID if it changed or if this is a new conversation
        if (difyResponse.conversation_id && difyResponse.conversation_id !== currentConversationId) {
          console.log('Updating conversation ID from', currentConversationId, 'to', difyResponse.conversation_id)
          setCurrentConversationId(difyResponse.conversation_id)
          chatHistoryService.setCurrentConversation(difyResponse.conversation_id)
          
          // Update the conversation name in chat history service
          chatHistoryService.updateConversationName(difyResponse.conversation_id, 'New Chat')
        }
        
        console.log('Successfully processed Dify AI response')
      } else {
        console.error('Invalid response format from Dify AI:', response)
        throw new Error('Invalid response format from Dify AI')
      }
    } catch (error) {
      console.error('Error sending message to Dify AI:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      })
      
      // Fallback to mock response if Dify AI fails
      const mockResponse = await generateMockResponse(query)
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: mockResponse,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
      chatHistoryService.addMessage(currentConversationId, assistantMessage)
      
      // Show warning about fallback
      setError(`Using fallback response. Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExpand = () => {
    setChatOpen(true)
    setChatWidgetExtended(true)
    
    // Set position immediately
    const properY = Math.max(16, window.innerHeight - panelSize.height - 16)
    setPanelPosition({ x: 16, y: properY })
    setIsPositionInitialized(true)
  }

  const handleMinimize = () => {
    setChatOpen(true)
    setChatWidgetExtended(false)
  }

  // Switch to a different conversation
  const switchConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId)
    chatHistoryService.setCurrentConversation(conversationId)
    const conversationMessages = chatHistoryService.getMessages(conversationId)
    setMessages(conversationMessages)
    setShowHistory(false)
  }

  // Start a new conversation
  const startNewConversation = () => {
    createNewConversation()
    setShowHistory(false)
  }

  // Delete a conversation
  const deleteConversation = (conversationId: string) => {
    chatHistoryService.deleteConversation(conversationId)
    setConversations(prev => prev.filter(c => c.id !== conversationId))
    
    if (conversationId === currentConversationId) {
      startNewConversation()
    }
  }

  // Export chat history
  const exportHistory = () => {
    const historyData = chatHistoryService.exportHistory()
    const blob = new Blob([historyData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bloome-chat-history-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Import chat history
  const importHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const success = chatHistoryService.importHistory(content)
        
        if (success) {
          loadChatHistory()
          setError(null)
        } else {
          setError('Failed to import chat history. Please check the file format.')
        }
      } catch (error) {
        setError('Failed to import chat history. Please check the file format.')
      }
    }
    reader.readAsText(file)
    
    // Reset input
    event.target.value = ''
  }


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Fallback mock response function
  const generateMockResponse = async (userInput: string): Promise<string> => {
    const location = selectedLocation
    const biome = bloomingData?.location?.biome || 'unknown'
    const locationName = bloomingData?.location?.name || 'this location'
    
    const input = userInput.toLowerCase()
    
    if (input.includes('bloom') || input.includes('flowering')) {
      return `Based on the data for ${locationName}, I can see that this ${biome} region shows interesting blooming patterns. The recent data indicates ${bloomingData?.trends?.intensity_trend || 'stable blooming trends'}. Would you like me to explain the ecological implications of these patterns?`
    }
    
    if (input.includes('biodiversity') || input.includes('species')) {
      return `The biodiversity in this ${biome} ecosystem is quite remarkable. I can see from the data that there are multiple species contributing to the blooming events here. The ecological diversity suggests a healthy ecosystem, though there may be conservation concerns depending on the specific threats present in this region.`
    }
    
    if (input.includes('climate') || input.includes('temperature') || input.includes('weather')) {
      return `Climate conditions play a crucial role in blooming patterns here. Based on the data, I can see correlations between temperature and precipitation with blooming intensity. The climate change impacts in this region show ${bloomingData?.ecological_data?.climateChange?.impactLevel || 'moderate'} levels of concern.`
    }
    
    if (input.includes('conservation') || input.includes('protect')) {
      return `Conservation efforts in this ${biome} region are ${bloomingData?.ecological_data?.conservation?.priority || 'important'}. The key recommendations include protecting critical habitats, monitoring invasive species, and implementing sustainable practices. Would you like specific conservation strategies for this area?`
    }
    
    if (input.includes('help') || input.includes('what can you do')) {
      return `I can help you understand:\n\n• **Blooming Patterns** - Analyze seasonal flowering trends and intensity\n• **Biodiversity Insights** - Explain species composition and ecological diversity\n• **Climate Impacts** - Discuss temperature and precipitation effects on blooms\n• **Conservation Guidance** - Provide recommendations for ecosystem protection\n• **Ecological Context** - Explain the broader environmental implications\n\nTry asking me about any of these topics for the current location!`
    }
    
    return `That's an interesting question about ${locationName}! Based on the available data for this ${biome} region, I can provide insights about blooming patterns, biodiversity, climate impacts, or conservation strategies. Could you be more specific about what aspect you'd like me to explain?`
  }

  // Drag functionality
  const handleDragStart = (e: React.MouseEvent) => {
    if (isResizing) return
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - panelPosition.x,
      y: e.clientY - panelPosition.y
    })
  }

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging || isResizing) return

    const newX = Math.max(0, Math.min(window.innerWidth - panelSize.width, e.clientX - dragStart.x))
    const newY = Math.max(0, Math.min(window.innerHeight - panelSize.height, e.clientY - dragStart.y))
    
    setPanelPosition({ x: newX, y: newY })
  }

  // Resize functionality
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: panelSize.width,
      height: panelSize.height
    })
  }

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return

    const deltaX = e.clientX - resizeStart.x
    const deltaY = e.clientY - resizeStart.y
    
    const newWidth = Math.max(300, Math.min(800, resizeStart.width + deltaX))
    const newHeight = Math.max(300, Math.min(700, resizeStart.height + deltaY))
    
    setPanelSize({ width: newWidth, height: newHeight })
    
    // Adjust position if panel goes out of viewport
    const newX = Math.min(panelPosition.x, window.innerWidth - newWidth)
    const newY = Math.min(panelPosition.y, window.innerHeight - newHeight)
    
    if (newX !== panelPosition.x || newY !== panelPosition.y) {
      setPanelPosition({ x: Math.max(0, newX), y: Math.max(0, newY) })
    }
  }

  const handleMouseUp = () => {
    setIsResizing(false)
    setIsDragging(false)
  }

  // Event listeners for drag and resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'nw-resize'
      document.body.style.userSelect = 'none'
    } else if (isDragging) {
      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    } else {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, isDragging, panelPosition.x, panelPosition.y])

  if (!isChatOpen) return null

  return (
    <div 
      ref={widgetRef}
      className={cn("fixed z-50", className)}
      style={{
        left: isChatWidgetExtended ? `${panelPosition.x}px` : '16px',
        ...(isChatWidgetExtended
          ? { top: `${panelPosition.y}px` }
          : { bottom: '16px' }
        ),
        width: isChatWidgetExtended ? `${panelSize.width}px` : '384px', // Use panelSize when expanded
        height: isChatWidgetExtended ? `${panelSize.height}px` : '384px', // Use panelSize when expanded
        transition: (isDragging || isResizing) ? 'none' : 'all 0.3s ease'
      }}
    >
      <Card 
        className={cn(
          "transition-all duration-300 ease-out overflow-hidden",
          isChatWidgetExtended 
            ? "bg-white/10 backdrop-blur-xl border border-white/20" 
            : "bg-white/10 backdrop-blur-md border border-white/60 !cursor-pointer hover:bg-white/15 hover:border-white/80"
        )}
        style={{
          width: isChatWidgetExtended ? `${panelSize.width}px` : '384px', // Use panelSize when expanded
          height: isChatWidgetExtended ? `${panelSize.height}px` : '384px', // Use panelSize when expanded
          borderRadius: isChatWidgetExtended 
            ? '16px' 
            : '126px 126px 126px 0px', // Rounded corners with pointed bottom-left
          transformOrigin: 'bottom left', // Expand from bottom-left corner
          transform: isChatWidgetExtended 
            ? 'scale(1)' 
            : 'scale(0.125)', // 48/384 = 0.125 (48px button from 384px panel)
          boxShadow: isChatWidgetExtended 
            ? '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)' 
            : '0 4px 20px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.6), inset 0 1px 0 rgba(255,255,255,0.3)'
        }}
        onClick={!isChatWidgetExtended ? handleExpand : undefined}
      >
        {/* Minimized State - Button */}
        {!isChatWidgetExtended && (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="relative z-10" style={{ transform: 'scale(8)' }}>
              <IoChatbubbleOutline className="h-6 w-6 text-white/90 drop-shadow-sm" />
            </div>
          </div>
        )}

        {/* Expanded State - Panel */}
        {isChatWidgetExtended && (
          <div className="h-full flex flex-col">
            {/* Header - Draggable */}
            <div 
              className="flex items-center justify-between p-4 border-b border-white/10 cursor-grab active:cursor-grabbing"
              onMouseDown={handleDragStart}
            >
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-white">AI Assistant</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  size="sm"
                  variant="ghost"
                  className="text-white/60 hover:text-white hover:bg-white/10 !cursor-pointer"
                  title="Chat History"
                >
                  <FaClockRotateLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleMinimize}
                  size="sm"
                  variant="ghost"
                  className="text-white/60 hover:text-white hover:bg-white/10 !cursor-pointer"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat History Panel */}
            {showHistory && (
              <div className="border-b border-white/10 p-4 bg-white/5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white">Chat History</h4>
                  <div className="flex gap-1">
                    <Button
                      onClick={startNewConversation}
                      size="sm"
                      variant="ghost"
                      className="text-white/60 hover:text-white hover:bg-white/10 !cursor-pointer h-6 px-2 text-xs"
                    >
                      New
                    </Button>
                    <Button
                      onClick={exportHistory}
                      size="sm"
                      variant="ghost"
                      className="text-white/60 hover:text-white hover:bg-white/10 !cursor-pointer h-6 px-2"
                      title="Export History"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <label className="text-white/60 hover:text-white hover:bg-white/10 !cursor-pointer h-6 px-2 rounded flex items-center justify-center text-xs">
                      <Upload className="h-3 w-3" />
                      <input
                        type="file"
                        accept=".json"
                        onChange={importHistory}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                
                {error && (
                  <div className="text-xs text-red-400 mb-2 p-2 bg-red-500/10 rounded">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="text-xs text-white/50 p-2 text-center">
                      No conversations yet
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={cn(
                          "text-xs p-2 rounded cursor-pointer transition-colors group",
                          conversation.id === currentConversationId
                            ? "bg-blue-500/20 text-white border border-blue-400/30"
                            : "text-white/70 bg-white/10 hover:bg-white/20"
                        )}
                        onClick={() => switchConversation(conversation.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {conversation.title}
                            </div>
                            <div className="text-white/50 text-xs">
                              {conversation.updatedAt.toLocaleDateString()} {conversation.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {conversation.lastMessage && (
                              <div className="text-white/40 truncate mt-1">
                                {conversation.lastMessage}
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteConversation(conversation.id)
                            }}
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10 !cursor-pointer h-4 w-4 p-0 ml-2"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.type === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3 text-sm",
                      message.type === 'user'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-white/10 text-white/90'
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {/* Show retriever resources for assistant messages */}
                    {message.type === 'assistant' && message.retrieverResources && message.retrieverResources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="text-xs text-white/60 mb-1">Sources:</div>
                        <div className="space-y-1">
                          {message.retrieverResources.map((resource, index) => (
                            <div key={index} className="text-xs text-white/50 bg-white/5 rounded p-1">
                              <div className="font-medium">{resource.dataset_name}</div>
                              <div className="truncate">{resource.document_name}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className={cn(
                      "text-xs mt-1 opacity-60",
                      message.type === 'user' ? 'text-blue-100' : 'text-white/60'
                    )}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>

                  {message.type === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-sm text-white/90">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about blooming patterns, biodiversity, climate impacts..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10 !cursor-pointer"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 h-10 w-10 p-0 !cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Resize Handle */}
            <div
              className="absolute bottom-0 right-0 w-6 h-6 cursor-nw-resize opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center bg-black/20 hover:bg-black/40 rounded-tl-lg"
              onMouseDown={handleResizeStart}
              title="Resize chat panel"
            >
              <GripVertical className="w-4 h-4 text-white/80 rotate-45" />
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}