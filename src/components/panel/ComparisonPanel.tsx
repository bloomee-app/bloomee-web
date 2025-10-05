'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState, useRef, useCallback } from 'react'
import { BloomingApiResponse } from '@/types/landsat'
import { ArrowUp, ArrowDown, X, Minimize2, Maximize2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import TabContent from './tabs/TabContent'
import { 
  fetchBloomingPrediction, 
  fetchForecast, 
  mapLocationToRegion, 
  mapLocationToRegionWithVariety,
  getRegionName,
  getVariedMockLandsatImage
} from '@/lib/bloomingApi'
import { 
  generateLocationSpecificNDVI, 
  generateLocationSpecificWeather, 
  generateLocationSpecificBloomStatus,
  getCurrentSeason
} from '@/lib/locationSpecificData'
import { generateRecentEvents, type RecentEvent } from '@/lib/recentEventsGenerator'

interface ComparisonPanelProps {
  className?: string
}

type PanelState = 'default' | 'fullscreen'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const [panelState, setPanelState] = useState<PanelState>('default')
  
  const dragStartRef = useRef<{ y: number } | null>(null)

  const handleMaximize = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setIsMinimized(false)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handleMinimize = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setIsMinimized(true)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handleMobileDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY
    dragStartRef.current = { y }
    if (panelRef.current) {
      panelRef.current.style.transition = 'none'
    }
  }

  const handleDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!dragStartRef.current) return

    const yEnd = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY
    const deltaY = yEnd - dragStartRef.current.y
    const dragThreshold = 50

    if (panelRef.current) {
      panelRef.current.style.transition = 'height 0.3s ease-in-out'
    }

    if (panelState === 'default') {
      if (deltaY < -dragThreshold) {
        setPanelState('fullscreen')
      } else if (deltaY > dragThreshold) {
        setIsMinimized(true)
      }
    } else if (panelState === 'fullscreen') {
      if (deltaY > dragThreshold) {
        setPanelState('default')
      }
    }

    dragStartRef.current = null
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
    const newHeight = Math.max(300, Math.min(window.innerHeight - 50, resizeStart.height + deltaY))
    
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

  // Drag functionality for desktop
  const handleDesktopDragStart = useCallback((e: React.MouseEvent) => {
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
    if (!isPanelOpen || !selectedLocation) {
      setPanelState('default')
    }
  }, [isPanelOpen, selectedLocation])

  useEffect(() => {
    if (!selectedLocation || !isPanelOpen) {
      setBloomingData(null)
      setError(null)
      return
    }

    const fetchBloomingData = async () => {
      setLoading(true)
      setError(null)
      
        // Always provide fallback data - no more "failed" states
        // Use variety function for demo purposes to show different regions
        const region = mapLocationToRegionWithVariety(selectedLocation.lat, selectedLocation.lng, true)
      const currentDate = new Date().toISOString().split('T')[0]
      
      try {
        // Try to fetch from backend API first
        const result = await fetchBloomingPrediction(region, currentDate, {
          includeWeather: true,
          includeImages: true
        })
        
        // Fetch forecast data for trends
        const forecastResult = await fetchForecast(region, currentDate, 7, {
          includeWeather: true,
          includeImages: true
        })
        
        // Use real backend data
        const transformedData = createBloomingData(result, forecastResult.predictions || [], region, selectedLocation, true)
        setBloomingData(transformedData)
        setGlobalBloomingData(transformedData)
        
      } catch (err) {
        console.warn('Backend API unavailable, using fallback data:', err)
        
        // Fallback to mock data when API fails
        const fallbackResult = createFallbackBloomingData(region, selectedLocation)
        const fallbackForecast = createFallbackForecastData(region, currentDate)
        
        const transformedData = createBloomingData(fallbackResult, fallbackForecast, region, selectedLocation, false)
        setBloomingData(transformedData)
        setGlobalBloomingData(transformedData)
      } finally {
        setLoading(false)
      }
    }

    // Helper function to create blooming data structure
    const createBloomingData = (result: any, forecast: any[], region: string, location: { lat: number, lng: number }, isRealData: boolean) => {
      return {
        location: {
          name: getRegionName(region),
          lat: location.lat,
          lng: location.lng,
          biome: 'Temperate Forest'
        },
        temporal_data: [{
          year: new Date().getFullYear(),
          season: getCurrentSeason(),
          month: new Date().getMonth() + 1,
          blooming_events: generateRecentEvents(region, 6).map(event => ({
            start_date: event.date,
            end_date: event.date,
            peak_date: event.date,
            intensity: event.type === 'peak_bloom' ? 0.9 : event.type === 'bloom_start' ? 0.6 : 0.3,
            confidence: isRealData ? 0.8 : 0.6,
            species: [getRegionName(region)],
            ndvi_avg: result.ndvi_score + (event.metadata?.ndvi_change || 0),
            evi_avg: (result.ndvi_score + (event.metadata?.ndvi_change || 0)) * 1.2,
            weather_correlation: {
              temperature_avg: (result.weather?.temperature_mean_c || 20) + (event.metadata?.temperature_anomaly || 0),
              precipitation_total: (result.weather?.precipitation_mm || 0) + (event.metadata?.precipitation_anomaly || 0)
            }
          })),
          summary: {
            total_blooming_days: result.bloom_status?.includes('Bloom') ? 1 : 0,
            avg_intensity: Math.min(1, Math.max(0, (result.ndvi_score - 0.1) / 0.6)),
            dominant_species: getRegionName(region),
            ecological_insights: `Current bloom status: ${result.bloom_status || 'Analyzing...'}`
          }
        }],
        trends: {
          blooming_advance_days_per_decade: 0,
          intensity_trend: result.ndvi_score > 0.5 ? 'increasing' : 'stable',
          species_composition_change: 'stable'
        },
        ecological_data: {
          biome: {
            type: 'Temperate Forest',
            description: 'Mixed deciduous and coniferous forest',
            threats: ['Climate change', 'Urbanization'],
            conservationStatus: 'stable' as 'stable' | 'threatened' | 'critical'
          },
          biodiversity: {
            speciesCount: 150,
            endemicSpecies: 10,
            diversityIndex: result.ndvi_score,
            trend: result.ndvi_score > 0.5 ? 'increasing' as 'increasing' | 'stable' | 'decreasing' : 'stable' as 'increasing' | 'stable' | 'decreasing'
          },
          climateChange: {
            temperatureChange: 1.5,
            precipitationChange: 0.2,
            impactLevel: 'medium' as 'high' | 'low' | 'medium',
            adaptationMeasures: ['Reforestation', 'Conservation']
          },
          conservation: {
            priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
            protectedArea: true,
            threats: ['Climate change'],
            recommendations: ['Monitor bloom timing', 'Protect habitat']
          }
        },
        metadata: {
          data_sources: isRealData ? ['Landsat', 'MODIS'] : ['Mock Data'],
          processing_model: isRealData ? 'NDVI Analysis' : 'Simulated Analysis',
          last_updated: new Date().toISOString(),
          data_quality: isRealData ? 'good' : 'simulated'
        }
      }
    }

    // Create fallback blooming data when API is unavailable using location-specific data
    const createFallbackBloomingData = (region: string, location: { lat: number, lng: number }) => {
      const season = getCurrentSeason()
      const ndviScore = generateLocationSpecificNDVI(region, season)
      const bloomStatus = generateLocationSpecificBloomStatus(region, ndviScore, season)
      const weather = generateLocationSpecificWeather(region, season)
      
      return {
        date: new Date().toISOString().split('T')[0],
        ndvi_score: ndviScore,
        bloom_status: bloomStatus,
        weather,
        satellite_image_available: Math.random() > 0.3, // 70% chance
        satellite_image_url: Math.random() > 0.3 ? '/predict/' + region + '/image' : getVariedMockLandsatImage(region)
      }
    }

    // Create fallback forecast data using location-specific data
    const createFallbackForecastData = (region: string, startDate: string) => {
      const forecast = []
      const baseDate = new Date(startDate)
      const season = getCurrentSeason()
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(baseDate)
        date.setDate(date.getDate() + i)
        
        // Use location-specific data generation
        const ndviScore = generateLocationSpecificNDVI(region, season)
        const bloomStatus = generateLocationSpecificBloomStatus(region, ndviScore, season)
        const weather = generateLocationSpecificWeather(region, season)
        
        forecast.push({
          date: date.toISOString().split('T')[0],
          ndvi_score: ndviScore,
          bloom_status: bloomStatus,
          weather,
          satellite_image_available: Math.random() > 0.4,
          satellite_image_url: Math.random() > 0.4 ? '/predict/' + region + '/image' : getVariedMockLandsatImage(region)
        })
      }
      
      return forecast
    }
    fetchBloomingData()
  }, [selectedLocation, isPanelOpen, setGlobalBloomingData])

  // Helper function getCurrentSeason is now imported from locationSpecificData

  if (!selectedLocation || !isPanelOpen) return null

  const getTrendIcon = (trend: string) => {
    if (trend.includes('+')) return <ArrowUp className="text-green-400 h-4 w-4" />
    if (trend.includes('-')) return <ArrowDown className="text-red-400 h-4 w-4" />
    return null
  }

  if (!isPanelOpen) return null

  return (
    <div 
      ref={containerRef}
      className={cn(
        "fixed z-10 rounded-lg overflow-hidden transition-all duration-500 ease-in-out",
        // Mobile responsive styles
        "bottom-0 left-0 right-0 w-full rounded-t-2xl md:rounded-lg",
        panelState === 'default' ? 'h-[85vh]' : 'h-full',
        // Desktop styles with custom positioning
        "md:top-auto md:right-auto md:bottom-auto md:left-auto md:w-auto md:h-auto",
        // Hide panel completely when closed instead of sliding
        isPanelOpen ? "translate-y-0 md:translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full opacity-0 pointer-events-none",
        className
      )}
      style={{ 
        // Apply custom positioning only on desktop
        ...(window.innerWidth >= 768 && {
          width: isMinimized ? '48px' : `${panelSize.width}px`,
          height: isMinimized ? '48px' : `${panelSize.height}px`,
          left: isMinimized ? `${window.innerWidth - 72}px` : `${panelPosition.x}px`,
          top: isMinimized ? '24px' : `${panelPosition.y}px`
        })
      }}
    >
      <div ref={panelRef} className="w-full h-full relative">
        {/* Minimized Icon */}
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
            isMinimized ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 w-full h-full flex items-center justify-center">
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-white/70 hover:bg-white/10 hover:text-white !cursor-pointer h-8 w-8"
              onClick={handleMaximize}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </Card>
        </div>

        {/* Full Content */}
        <div 
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            !isMinimized ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 h-full flex flex-col relative">
                {/* Mobile drag handle */}
                <div 
                  className="md:hidden flex-shrink-0 flex justify-center py-3 cursor-grab active:cursor-grabbing"
                  onTouchStart={handleMobileDragStart}
                  onTouchEnd={handleDragEnd}
                  onMouseDown={handleMobileDragStart}
                  onMouseUp={handleDragEnd}
                >
                  <div className="w-16 h-1.5 bg-white/30 rounded-full" />
                </div>

                <CardHeader 
                  className="cursor-grab active:cursor-grabbing pt-0 md:pt-6"
                  onMouseDown={handleDesktopDragStart}
                >
                  <div className="absolute top-3 right-3 flex gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-white/70 hover:bg-white/10 hover:text-white !cursor-pointer hidden md:flex"
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
                  {loading && <div className="text-white/80 text-sm text-center py-4">Loading...</div>}
                  {bloomingData && !loading && <TabContent bloomingData={bloomingData} getTrendIcon={getTrendIcon} />}
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
      </div>
    </div>
  )
}