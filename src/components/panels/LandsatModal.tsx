'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState, useRef, useCallback } from 'react'
import { ArrowUp, ArrowDown, X, Minimize2, Maximize2, Satellite, MapPin, Calendar, Layers, Eye, Flower2, BarChart3, Image, Leaf, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateMockLandsatData, type LandsatData } from '@/lib/mockLandsatApi'

interface LandsatModalProps {
  className?: string
}

export default function LandsatModal({ className }: LandsatModalProps) {
  // Zustand store state for Landsat Modal
  const { 
    isLandsatModalOpen, 
    setIsLandsatModalOpen, 
    landsatModalMinimized, 
    setLandsatModalMinimized,
    landsatModalPosition,
    setLandsatModalPosition,
    selectedLocation 
  } = useAppStore()
  
  const [landsatData, setLandsatData] = useState<LandsatData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Resize state
  const [size, setSize] = useState({ width: 500, height: 400 })
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Generate mock Landsat data when location is selected
  useEffect(() => {
    if (selectedLocation && isLandsatModalOpen) {
      console.log('🛰️ Generating Landsat data for location:', selectedLocation)
      
      setLoading(true)
      setError(null)
      
      try {
        // Generate mock data for 'during' period (current bloom analysis)
        const mockData = generateMockLandsatData(selectedLocation, 'during')
        setLandsatData(mockData)
        
        console.log('🛰️ Landsat data generated:', mockData)
      } catch (err) {
        console.error('❌ Error generating Landsat data:', err)
        setError('Failed to generate Landsat data')
      } finally {
        setLoading(false)
      }
    }
  }, [selectedLocation, isLandsatModalOpen])

  // Handle minimize/maximize
  const handleMinimize = () => {
    console.log('🔽 Minimizing Landsat Modal')
    setLandsatModalMinimized(true)
  }

  const handleMaximize = () => {
    console.log('🔼 Maximizing Landsat Modal')
    setLandsatModalMinimized(false)
  }

  // Resize functionality (same as ChatWidget)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !panelRef.current) return

    const rect = panelRef.current.getBoundingClientRect()
    const newWidth = Math.max(400, Math.min(1200, e.clientX - rect.left))
    const newHeight = Math.max(300, Math.min(800, e.clientY - rect.top))
    
    setSize({ width: newWidth, height: newHeight })
  }, [isResizing])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'nw-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  // Drag functionality
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    
    const rect = panelRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }, [])

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return

    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y
    
    // Keep panel within viewport bounds
    const maxX = window.innerWidth - size.width
    const maxY = window.innerHeight - size.height
    
    setLandsatModalPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    })
  }, [isDragging, dragOffset, size.width, size.height, setLandsatModalPosition])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', handleDragEnd)
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    } else {
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  // Only render if modal should be open
  if (!isLandsatModalOpen) return null

  // Debug: Log current state
  console.log('🛰️ LandsatModal render state:', { 
    isLandsatModalOpen, 
    landsatModalMinimized, 
    selectedLocation: selectedLocation ? `${selectedLocation.lat}, ${selectedLocation.lng}` : null,
    willShowMinimized: landsatModalMinimized,
    willShowFull: isLandsatModalOpen && !landsatModalMinimized
  })

  // CRITICAL: Minimized view - shows floating button when modal is minimized
  // This allows users to restore modal after minimizing
  if (landsatModalMinimized) {
    console.log('🔽 Rendering MINIMIZED LandsatModal view')
    return (
      <div 
        className={cn("fixed z-10 transform transition-transform duration-300", className)}
        style={{
          left: `${landsatModalPosition.x}px`,
          top: `${landsatModalPosition.y}px`
        }}
      >
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

  console.log('🔍 Rendering FULL LandsatModal view')
  return (
    <div 
      className={cn(
        "fixed z-10 transform transition-transform duration-300",
        isLandsatModalOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
      style={{
        left: `${landsatModalPosition.x}px`,
        top: `${landsatModalPosition.y}px`
      }}
    >
      <Card 
        ref={panelRef}
        className="bg-white/10 backdrop-blur-md border-white/20 flex flex-col relative"
        style={{ 
          width: size.width, 
          height: size.height,
          maxWidth: 'calc(50vw - 2rem)',
          maxHeight: 'calc(100vh - 8rem)'
        }}
      >
        <CardHeader 
          className="cursor-grab active:cursor-grabbing select-none"
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
              onClick={() => setIsLandsatModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 pr-12">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Satellite className="h-5 w-5 text-blue-400" />
              Landsat Analysis
            </CardTitle>
          </div>
          
          {selectedLocation && (
            <CardDescription className="text-blue-200 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-white/70">Loading Landsat data...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-32">
              <div className="text-red-400 text-center">
                <p>❌ Error loading data</p>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          {landsatData && (
            <div className="space-y-4">
              {/* Data Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Acquisition Date</span>
                  </div>
                  <p className="text-blue-200 text-sm">{landsatData.acquisitionDate}</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Satellite</span>
                  </div>
                  <p className="text-green-200 text-sm">{landsatData.satellite}</p>
                </div>
              </div>

              {/* NDVI Statistics */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  NDVI Analysis
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-white/60">Mean NDVI</p>
                    <p className="text-lg font-mono text-green-400">{landsatData.ndviStats.mean.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Range</p>
                    <p className="text-sm font-mono text-blue-200">
                      {landsatData.ndviStats.min.toFixed(3)} - {landsatData.ndviStats.max.toFixed(3)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bloom Analysis */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Flower2 className="h-4 w-4 text-pink-400" />
                  Bloom Analysis
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Bloom Status</span>
                    <span className={`text-sm font-medium ${
                      landsatData.bloomAnalysis.isBlooming ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {landsatData.bloomAnalysis.isBlooming ? 'Blooming' : 'Not Blooming'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Intensity</span>
                    <span className="text-sm text-blue-200">
                      {(landsatData.bloomAnalysis.bloomIntensity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Stage</span>
                    <span className="text-sm text-yellow-200 capitalize">
                      {landsatData.bloomAnalysis.bloomStage.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Quality */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  Data Quality
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Cloud Cover</span>
                    <span className="text-sm text-blue-200">
                      {landsatData.cloudCover.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Quality</span>
                    <span className={`text-sm font-medium ${
                      landsatData.dataQuality === 'excellent' ? 'text-green-400' :
                      landsatData.dataQuality === 'good' ? 'text-blue-400' :
                      landsatData.dataQuality === 'fair' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {landsatData.dataQuality}
                    </span>
                  </div>
                </div>
              </div>

              {/* Placeholder for future visualizations */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Image className="h-4 w-4 text-purple-400" />
                  Satellite Imagery
                </h3>
                <div className="aspect-video bg-gray-800/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white/50">
                    <Satellite className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">RGB Image Preview</p>
                    <p className="text-xs">Coming in next tasks</p>
                  </div>
                </div>
              </div>

              {/* Ecological Insights */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-400" />
                  Ecological Insights
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Vegetation Health</span>
                    <span className={`text-sm font-medium ${
                      landsatData.ecologicalInsights.vegetationHealth === 'excellent' ? 'text-green-400' :
                      landsatData.ecologicalInsights.vegetationHealth === 'good' ? 'text-blue-400' :
                      landsatData.ecologicalInsights.vegetationHealth === 'moderate' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {landsatData.ecologicalInsights.vegetationHealth}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Water Stress</span>
                    <span className={`text-sm font-medium ${
                      landsatData.ecologicalInsights.waterStress === 'low' ? 'text-green-400' :
                      landsatData.ecologicalInsights.waterStress === 'moderate' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {landsatData.ecologicalInsights.waterStress}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Biodiversity</span>
                    <span className={`text-sm font-medium ${
                      landsatData.ecologicalInsights.biodiversity === 'high' ? 'text-green-400' :
                      landsatData.ecologicalInsights.biodiversity === 'moderate' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {landsatData.ecologicalInsights.biodiversity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && !landsatData && (
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-white/50">
                <Satellite className="h-8 w-8 mx-auto mb-2" />
                <p>Select a location on the globe</p>
                <p className="text-sm">to view Landsat analysis</p>
              </div>
            </div>
          )}
        </CardContent>

        {/* Resize Handle - Bottom Right Corner */}
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
