'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState, useRef, useCallback } from 'react'
import { BloomingApiResponse } from '@/types/landsat'
import { ArrowUp, ArrowDown, X, Minimize2, Maximize2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import TabContent from './tabs/TabContent'

interface ComparisonPanelProps {
  className?: string
}

export default function ComparisonPanel({ className }: ComparisonPanelProps) {
  // CRITICAL: These store values are essential for auto-open behavior
  // DO NOT REMOVE: selectedLocation triggers panel auto-open when globe is clicked
  const { 
    isPanelOpen, 
    setPanelOpen, 
    selectedLocation, 
    isMinimized, 
    setIsMinimized, 
    setBloomingData: setGlobalBloomingData,
    panelSize,
    setPanelSize,
    panelPosition,
    setPanelPosition
  } = useAppStore()
  const [bloomingData, setBloomingData] = useState<BloomingApiResponse['data'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const panelRef = useRef<HTMLDivElement>(null)

  // Fungsi untuk maximize panel
  const handleMaximize = () => {
    setIsMinimized(false)
  }

  // Fungsi untuk minimize panel
  const handleMinimize = () => {
    setIsMinimized(true)
  }

  // Resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: panelSize.width,
      height: panelSize.height
    })
  }, [panelSize])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return

    // Calculate delta from initial mouse position
    const deltaX = e.clientX - resizeStart.x
    const deltaY = e.clientY - resizeStart.y
    
    // Calculate new size based on initial size + delta
    const newWidth = Math.max(300, Math.min(800, resizeStart.width + deltaX))
    const newHeight = Math.max(300, Math.min(window.innerHeight - 100, resizeStart.height + deltaY))
    
    console.log('Resize debug:', {
      deltaX,
      deltaY,
      startWidth: resizeStart.width,
      startHeight: resizeStart.height,
      newWidth,
      newHeight
    })
    
    setPanelSize({ width: newWidth, height: newHeight })
  }, [isResizing, setPanelSize, resizeStart])

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
      x: e.clientX - panelPosition.x,
      y: e.clientY - panelPosition.y
    })
  }, [isResizing, panelPosition])

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging || isResizing) return

    const newX = Math.max(0, Math.min(window.innerWidth - panelSize.width, e.clientX - dragStart.x))
    const newY = Math.max(0, Math.min(window.innerHeight - panelSize.height, e.clientY - dragStart.y))
    
    setPanelPosition({ x: newX, y: newY })
  }, [isDragging, isResizing, dragStart, panelSize, setPanelPosition])

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

  // Set default position to right side when first opened
  useEffect(() => {
    if (isPanelOpen && panelPosition.x === 0 && panelPosition.y === 0) {
      const defaultX = window.innerWidth - panelSize.width - 24 // 24px from right
      const defaultY = 24 // 24px from top
      setPanelPosition({ x: defaultX, y: defaultY })
    }
  }, [isPanelOpen, panelPosition, panelSize, setPanelPosition])

  useEffect(() => {
    // CRITICAL: Always clear data when no location is selected
    // But don't clear data just because panel is closed - it might be minimized
    if (!selectedLocation) {
      setBloomingData(null)
      setError(null)
      return
    }

    // Only fetch data if panel is actually open (not minimized)
    if (!isPanelOpen) {
      return
    }

    const fetchBloomingData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/blooming-events?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lng}`
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          setBloomingData(result.data) // Local state
          setGlobalBloomingData(result.data) // Global store for chat access
        } else {
          setError(result.message || 'Failed to load data')
        }
      } catch (err) {
        console.error('Error fetching blooming data:', err)
        setError('Failed to load blooming data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchBloomingData()
  }, [selectedLocation, isPanelOpen])

  // CRITICAL: Panel opening is controlled by Globe click (store.setPanelOpen)
  // We intentionally avoid auto-opening here to allow manual close/minimize
  // DO NOT CHANGE: Keeps user controls predictable
  useEffect(() => {
    // no-op by design
  }, [selectedLocation, isPanelOpen])

  // CRITICAL: Minimize/expand is user-driven; Globe click explicitly unminimizes
  // DO NOT CHANGE: Prevents hidden state flips after user action
  useEffect(() => {
    // no-op by design
  }, [isMinimized])

  // CRITICAL: Always render panel when location is selected, even if minimized
  // DO NOT CHANGE: This allows panel to show minimized state and auto-expand
  // Only return null if no location is selected AND panel is closed
  if (!selectedLocation) return null

  // Debug: Log current state
  console.log('🖼️ ComparisonPanel render state:', { 
    isPanelOpen, 
    isMinimized, 
    selectedLocation: selectedLocation ? `${selectedLocation.lat}, ${selectedLocation.lng}` : null,
    willShowMinimized: isMinimized,
    willShowFull: isPanelOpen && !isMinimized
  })

  const getTrendIcon = (trend: string) => {
    if (trend.includes('+')) return <ArrowUp className="text-green-400 h-4 w-4" />
    if (trend.includes('-')) return <ArrowDown className="text-red-400 h-4 w-4" />
    return null
  }

  // CRITICAL: Minimized view - shows floating button when panel is minimized
  // DO NOT MODIFY: This allows users to restore panel after minimizing
  // The panel will auto-expand when new location is selected (see useEffect above)
  if (isMinimized) {
    console.log('🔽 Rendering MINIMIZED panel view')
    return (
      <div className={cn("fixed top-6 right-6 z-10 transform transition-transform duration-300", className)}>
        <Card className="bg-white/10 backdrop-blur-md border-white/20 w-16 h-16 flex items-center justify-center">
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-white/70 hover:bg-white/10 hover:text-white !cursor-pointer"
            onClick={handleMaximize}
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        </Card>
      </div>
    )
  }

  console.log('🔍 Rendering FULL panel view')
  return (
    <div 
      ref={panelRef}
      className={cn(
        "fixed z-10 transform transition-transform duration-300",
        isPanelOpen ? "translate-x-0" : "translate-x-full",
        className
      )}
      style={{ 
        width: `${panelSize.width}px`,
        height: `${panelSize.height}px`,
        left: `${panelPosition.x}px`,
        top: `${panelPosition.y}px`
      }}
    >
      <Card className="bg-white/10 backdrop-blur-md border-white/20 h-full flex flex-col relative">
        <CardHeader 
          className="cursor-grab active:cursor-grabbing"
          onMouseDown={handleDragStart}
        >
          <div className="absolute top-3 right-3 flex gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-white/70 hover:bg-white/10 hover:text-white !cursor-pointer"
              onClick={handleMinimize}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-white/70 hover:bg-white/10 hover:text-white !cursor-pointer"
              onClick={() => setPanelOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-white">
            {bloomingData ? bloomingData.location.name : 'Blooming Analysis'}
          </CardTitle>
          <CardDescription className="text-blue-200">
            {selectedLocation
              ? `${selectedLocation.lat.toFixed(4)}°, ${selectedLocation.lng.toFixed(4)}°`
              : 'Select a location on the globe'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {loading && (
            <div className="text-white/80 text-sm text-center py-4">
              Loading blooming data...
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm p-3 bg-red-400/10 rounded">
              {error}
            </div>
          )}

          {bloomingData && !loading && !error && (
            <TabContent bloomingData={bloomingData} getTrendIcon={getTrendIcon} />
          )}

          {(!loading && !error && !selectedLocation) && (
            <div className="text-white/80 text-sm text-center py-4">
              Click on the globe to view blooming data for that location.
            </div>
          )}
        </CardContent>
        
        {/* Resize Handle - Bottom Right */}
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