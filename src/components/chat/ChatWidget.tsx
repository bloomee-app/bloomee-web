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
  GripVertical
} from 'lucide-react'
import { FaClockRotateLeft } from "react-icons/fa6"
import { IoChatbubbleOutline } from "react-icons/io5";
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
  const [showHistory, setShowHistory] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [panelSize, setPanelSize] = useState({ width: 384, height: 384 }) // 96 * 4 = 384px
  const [panelPosition, setPanelPosition] = useState({ x: 16, y: 0 }) // Will be calculated to bottom position
  const [isPositionInitialized, setIsPositionInitialized] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
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
  }, [panelSize.height])

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
  }, [isChatWidgetExtended, isPositionInitialized, panelSize.height])

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

    // Mock AI response
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
    }, 1000 + Math.random() * 2000)
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
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
  }

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return

    const newWidth = Math.max(300, Math.min(600, e.clientX - panelPosition.x))
    const newHeight = Math.max(300, Math.min(500, e.clientY - panelPosition.y))
    
    setPanelSize({ width: newWidth, height: newHeight })
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
  }, [isResizing, isDragging, handleResizeMove, handleDragMove])

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
        width: '384px', // Always full size for transform to work
        height: '384px', // Always full size for transform to work
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
          width: '384px', // Always full size for transform to work
          height: '384px', // Always full size for transform to work
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
                <h4 className="text-sm font-medium text-white mb-3">Chat History</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <div className="text-xs text-white/70 p-2 bg-white/10 rounded cursor-pointer hover:bg-white/20 transition-colors">
                    <div className="font-medium">Session 1 - Today 14:30</div>
                    <div className="text-white/50">Discussed blooming patterns in Amazon rainforest...</div>
                  </div>
                  <div className="text-xs text-white/70 p-2 bg-white/10 rounded cursor-pointer hover:bg-white/20 transition-colors">
                    <div className="font-medium">Session 2 - Today 12:15</div>
                    <div className="text-white/50">Asked about biodiversity conservation strategies...</div>
                  </div>
                  <div className="text-xs text-white/70 p-2 bg-white/10 rounded cursor-pointer hover:bg-white/20 transition-colors">
                    <div className="font-medium">Session 3 - Yesterday 16:45</div>
                    <div className="text-white/50">Explored climate impact on flowering seasons...</div>
                  </div>
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
              className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-50 hover:opacity-100 transition-opacity"
              onMouseDown={handleResizeStart}
            >
              <GripVertical className="w-4 h-4 text-white/60 rotate-45" />
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}