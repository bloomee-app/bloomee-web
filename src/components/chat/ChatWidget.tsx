'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  MessageCircle, 
  Send, 
  Minimize2, 
  Maximize2, 
  Bot, 
  User,
  Loader2,
  GripVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatWidgetProps {
  className?: string
}

export default function ChatWidget({ className }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  
  // CRITICAL: Use global store for chat state
  // DO NOT CHANGE: This ensures chat state persists across interactions
  const { 
    isChatOpen, 
    setChatOpen, 
    selectedLocation, 
    bloomingData,
    activeTab,
    isChatWidgetExtended,
    setChatWidgetExtended,
    chatWidgetSize,
    setChatWidgetSize,
    chatWidgetPosition,
    setChatWidgetPosition
  } = useAppStore()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'assistant',
        content: 'Hello! I\'m your ecological AI assistant. Ask me about blooming patterns, biodiversity, climate impacts, or conservation recommendations for any location you select on the globe.',
        timestamp: new Date()
      }])
    }
  }, [isChatOpen, messages.length])

  // Set default position to bottom-left when first expanded
  useEffect(() => {
    if (isChatWidgetExtended && chatWidgetPosition.x === 16 && chatWidgetPosition.y === 0) {
      const defaultX = 16 // 16px from left
      const defaultY = window.innerHeight - chatWidgetSize.height - 16 // 16px from bottom
      setChatWidgetPosition({ x: defaultX, y: defaultY })
    }
  }, [isChatWidgetExtended, chatWidgetPosition, chatWidgetSize, setChatWidgetPosition])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Mock AI response based on context
    const aiResponse = await generateMockResponse(inputValue.trim())
    
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    }

    setTimeout(() => {
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000 + Math.random() * 2000) // 1-3 second delay
  }

  const generateMockResponse = async (userInput: string): Promise<string> => {
    // Get current context
    const location = selectedLocation
    const biome = bloomingData?.location?.biome || 'unknown'
    const locationName = bloomingData?.location?.name || 'this location'
    
    // Simple keyword-based responses (mock AI)
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
    
    // Default response
    return `That's an interesting question about ${locationName}! Based on the available data for this ${biome} region, I can provide insights about blooming patterns, biodiversity, climate impacts, or conservation strategies. Could you be more specific about what aspect you'd like me to explain?`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleChat = () => {
    setChatOpen(!isChatOpen)
    setChatWidgetExtended(!isChatWidgetExtended)
  }

  // Resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !widgetRef.current) return

    const rect = widgetRef.current.getBoundingClientRect()
    const newWidth = Math.max(300, Math.min(800, e.clientX - rect.left))
    const newHeight = Math.max(300, Math.min(600, e.clientY - rect.top))
    
    setChatWidgetSize({ width: newWidth, height: newHeight })
  }, [isResizing, setChatWidgetSize])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    setIsDragging(false)
  }, [])

  // Drag functionality
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (isResizing) return
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - chatWidgetPosition.x,
      y: e.clientY - chatWidgetPosition.y
    })
  }, [isResizing, chatWidgetPosition])

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging || isResizing) return

    const newX = Math.max(0, Math.min(window.innerWidth - chatWidgetSize.width, e.clientX - dragStart.x))
    const newY = Math.max(0, Math.min(window.innerHeight - chatWidgetSize.height, e.clientY - dragStart.y))
    
    setChatWidgetPosition({ x: newX, y: newY })
  }, [isDragging, isResizing, dragStart, chatWidgetSize, setChatWidgetPosition])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'nw-resize'
      document.body.style.userSelect = 'none'
    } else if (isDragging) {
      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, isDragging, handleMouseMove, handleDragMove, handleMouseUp])

  // Don't render if chat is closed
  if (!isChatOpen) {
    return (
      <div className={cn("fixed bottom-4 left-4", className)}>
              <Button
                onClick={toggleChat}
                size="lg"
                className="h-12 w-12 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-lg !cursor-pointer"
                style={{
                  borderRadius: '32px 32px 32px 4px'
                }}
              >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    )
  }

  return (
    <div 
      ref={widgetRef}
      className={cn("transform transition-transform duration-300", className)}
      style={{ 
        width: `${chatWidgetSize.width}px`, 
        height: `${chatWidgetSize.height}px`,
        maxWidth: 'calc(50vw - 2rem)',
        maxHeight: 'calc(100vh - 12rem)',
        position: 'relative'
      }}
    >
      <Card className="h-full bg-white/5 backdrop-blur-sm border-white/10 flex flex-col relative">
        {/* Header - Draggable */}
        <div 
          className="flex items-center justify-between p-4 border-b border-white/10 cursor-grab active:cursor-grabbing"
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-white">AI Assistant</h3>
          </div>
          <Button
            onClick={toggleChat}
            size="sm"
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10 !cursor-pointer"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>

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
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-9 !cursor-pointer"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 h-9 w-9 p-0 !cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Resize Handle */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-50 hover:opacity-100 transition-opacity"
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="w-4 h-4 text-white/60 rotate-45" />
        </div>
      </Card>
    </div>
  )
}
