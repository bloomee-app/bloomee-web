'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState, useRef, useCallback } from 'react'
import { ArrowUp, ArrowDown, X, Minimize2, Maximize2, Satellite, MapPin, Calendar, Layers, Eye, Flower2, BarChart3, Image, Leaf, GripVertical, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateMockLandsatData, type LandsatData } from '@/lib/mockLandsatApi'
import { 
  fetchBloomingPrediction, 
  mapLocationToRegion,
  mapLocationToRegionWithVariety,
  getRegionName,
  getImageUrlWithFallback,
  getVariedMockLandsatImage,
  testApiConnection
} from '@/lib/bloomingApi'
import { 
  generateLocationSpecificNDVI, 
  generateLocationSpecificWeather, 
  generateLocationSpecificBloomStatus,
  generateLocationSpecificEcologicalInsights,
  getCurrentSeason
} from '@/lib/locationSpecificData'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Test API connection on component mount
  useEffect(() => {
    testApiConnection()
  }, [])

  // Fetch Landsat data from backend API when location is selected
  useEffect(() => {
    if (selectedLocation && isLandsatModalOpen) {
      console.log('🛰️ Fetching Landsat data for location:', selectedLocation)
      
      setLoading(true)
      setError(null)
      
      const fetchLandsatData = async () => {
        try {
          // Map location to closest available region from backend
          // Use accurate mapping (no forced variety for better accuracy)
          const region = mapLocationToRegionWithVariety(selectedLocation.lat, selectedLocation.lng, false)
          
          // Get current date in YYYY-MM-DD format
          const currentDate = new Date().toISOString().split('T')[0]
          
          try {
            // Try to fetch from backend API first
            const result = await fetchBloomingPrediction(region, currentDate, {
              includeWeather: true,
              includeImages: true
            })
            
            // Transform backend response to LandsatData format
            const landsatData = transformToLandsatData(result, selectedLocation, region, true)
            setLandsatData(landsatData)
            
            console.log('🛰️ Landsat data fetched from API:', landsatData)
          } catch (apiErr) {
            console.warn('🛰️ Backend API unavailable, using fallback data:', apiErr)
            
            // Fallback to mock data when API fails
            const fallbackData = createFallbackLandsatData(region, selectedLocation)
            setLandsatData(fallbackData)
            
            console.log('🛰️ Using fallback Landsat data:', fallbackData)
          }
        } catch (err) {
          console.error('❌ Unexpected error:', err)
          // Even if everything fails, provide basic fallback data
          const region = mapLocationToRegionWithVariety(selectedLocation.lat, selectedLocation.lng, false)
          const fallbackData = createFallbackLandsatData(region, selectedLocation)
          setLandsatData(fallbackData)
        } finally {
          setLoading(false)
        }
      }
      
      fetchLandsatData()
    }
  }, [selectedLocation, isLandsatModalOpen])


  // Create fallback Landsat data when API is unavailable
  const createFallbackLandsatData = (region: string, location: { lat: number, lng: number }): LandsatData => {
    const season = getCurrentSeason()
    const ndviScore = generateLocationSpecificNDVI(region, season)
    const bloomStatus = generateLocationSpecificBloomStatus(region, ndviScore, season)
    const ecologicalInsights = generateLocationSpecificEcologicalInsights(region, ndviScore)
    
    const isBlooming = bloomStatus.includes('Bloom')
    
    return {
      location: {
        lat: location.lat,
        lng: location.lng,
        name: getRegionName(region)
      },
      acquisitionDate: new Date().toISOString().split('T')[0],
      satellite: 'Landsat-9',
      rgbImageUrl: getVariedMockLandsatImage(region), // Use varied mock image in fallback
      ndviData: [], // Mock 2D array
      cloudCover: Math.random() * 30, // 0-30%
      dataQuality: Math.random() > 0.5 ? 'good' : 'fair',
      processingLevel: 'L1TP',
      ndviStats: {
        mean: ndviScore,
        min: Math.max(0, ndviScore - 0.2),
        max: Math.min(1, ndviScore + 0.2),
        stdDev: 0.1
      },
      bloomAnalysis: {
        isBlooming,
        bloomIntensity: Math.min(1, Math.max(0, (ndviScore - 0.1) / 0.6)),
        bloomConfidence: 0.6,
        bloomStage: isBlooming ? 'peak-bloom' : 'pre-bloom'
      },
      ecologicalInsights: {
        vegetationHealth: ecologicalInsights.vegetationHealth as 'excellent' | 'good' | 'moderate' | 'poor',
        waterStress: ecologicalInsights.waterStress as 'high' | 'low' | 'moderate',
        fireRisk: ecologicalInsights.fireRisk as 'high' | 'low' | 'moderate',
        biodiversity: ecologicalInsights.biodiversity as 'high' | 'low' | 'moderate'
      }
    }
  }

  // Helper function getCurrentSeason is now imported from locationSpecificData

  // Transform backend API response to LandsatData format
  const transformToLandsatData = (apiResponse: any, location: { lat: number, lng: number }, region: string, isRealData: boolean = true): LandsatData => {
    const ndviScore = apiResponse.ndvi_score || 0
    
    // Determine bloom analysis based on NDVI score and bloom status
    const bloomStatus = apiResponse.bloom_status || 'Unknown'
    const isBlooming = bloomStatus.includes('Bloom') && ndviScore > 0.3
    const bloomIntensity = Math.min(1, Math.max(0, (ndviScore - 0.1) / 0.6)) // Normalize to 0-1
    const bloomStage = determineBloomStage(ndviScore, bloomStatus)
    
    // Determine data quality based on cloud cover (mock since backend doesn't provide this)
    const cloudCover = Math.random() * 30 // Mock cloud cover 0-30%
    const dataQuality = cloudCover < 10 ? 'excellent' : cloudCover < 20 ? 'good' : cloudCover < 30 ? 'fair' : 'poor'
    
    // Determine ecological insights based on NDVI and weather
    const vegetationHealth = ndviScore > 0.6 ? 'excellent' : ndviScore > 0.4 ? 'good' : ndviScore > 0.2 ? 'moderate' : 'poor'
    const waterStress = apiResponse.weather?.precipitation_mm > 10 ? 'low' : apiResponse.weather?.precipitation_mm > 5 ? 'moderate' : 'high'
    const biodiversity = ndviScore > 0.5 ? 'high' : ndviScore > 0.3 ? 'moderate' : 'low'
    
    return {
      location: {
        lat: location.lat,
        lng: location.lng,
        name: getRegionName(region)
      },
      acquisitionDate: apiResponse.date || new Date().toISOString().split('T')[0],
      satellite: 'Landsat-9', // Default satellite
      rgbImageUrl: apiResponse.satellite_image_url || '',
      ndviData: [], // Mock 2D array - would be populated with actual NDVI data
      cloudCover,
      dataQuality,
      processingLevel: 'L1TP' as 'L1TP' | 'L1GT' | 'L1GS',
      ndviStats: {
        mean: ndviScore,
        min: Math.max(0, ndviScore - 0.2),
        max: Math.min(1, ndviScore + 0.2),
        stdDev: 0.1 // Mock standard deviation
      },
      bloomAnalysis: {
        isBlooming,
        bloomIntensity,
        bloomConfidence: 0.8,
        bloomStage: bloomStage as 'pre-bloom' | 'early-bloom' | 'peak-bloom' | 'late-bloom' | 'post-bloom'
      },
      ecologicalInsights: {
        vegetationHealth,
        waterStress,
        fireRisk: waterStress === 'low' ? 'high' : waterStress === 'moderate' ? 'moderate' : 'low',
        biodiversity
      }
    }
  }

  // Helper function to determine bloom stage based on NDVI and status
  const determineBloomStage = (ndvi: number, status: string): string => {
    if (ndvi < 0.1) return 'dormant'
    if (ndvi < 0.3) return 'pre-bloom'
    if (status.includes('Early')) return 'early-bloom'
    if (status.includes('Active') || status.includes('Peak')) return 'active-bloom'
    return 'post-bloom'
  }

  // Handle minimize/maximize
  const handleMinimize = () => {
    if (isAnimating) return
    console.log('🔽 Minimizing Landsat Modal')
    setIsAnimating(true)
    setLandsatModalMinimized(true)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handleMaximize = () => {
    if (isAnimating) return
    console.log('🔼 Maximizing Landsat Modal')
    setIsAnimating(true)
    setLandsatModalMinimized(false)
    setTimeout(() => setIsAnimating(false), 500)
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

  if (!isLandsatModalOpen) return null

  console.log('🔍 Rendering LandsatModal view')
  return (
    <div 
      ref={containerRef}
      className={cn(
        "fixed z-10 rounded-lg overflow-hidden transition-all duration-500 ease-in-out",
        isLandsatModalOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
      style={{
        width: landsatModalMinimized ? '48px' : `${size.width}px`,
        height: landsatModalMinimized ? '48px' : `${size.height}px`,
        left: `${landsatModalPosition.x}px`,
        top: `${landsatModalPosition.y}px`
      }}
    >
      <div ref={panelRef} className="w-full h-full relative">
        {/* Minimized Icon */}
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
            landsatModalMinimized ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
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
            !landsatModalMinimized ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
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
            <CardDescription className="text-blue-200 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-blue-200 hover:bg-white/10 hover:text-white !cursor-pointer"
                onClick={() => {
                  const coords = `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
                  navigator.clipboard.writeText(coords)
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
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

          {/* Removed error display - always show data with fallback */}

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

              {/* Satellite Imagery */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Image className="h-4 w-4 text-purple-400" />
                  Satellite Imagery
                </h3>
                <div className="aspect-video bg-gray-800/50 rounded-lg overflow-hidden">
                  <img 
                    src={getImageUrlWithFallback(landsatData.rgbImageUrl, selectedLocation ? mapLocationToRegionWithVariety(selectedLocation.lat, selectedLocation.lng, false) : 'japan_cherry')}
                    alt="Satellite imagery"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to varied mock image if API image fails to load
                      const target = e.target as HTMLImageElement
                      if (!target.src.includes('mock-landsat')) {
                        target.src = getVariedMockLandsatImage(selectedLocation ? mapLocationToRegionWithVariety(selectedLocation.lat, selectedLocation.lng, false) : 'japan_cherry')
                      } else {
                        // If mock image also fails, show placeholder
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex items-center justify-center h-full">
                              <div class="text-center text-white/50">
                                <svg class="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"/>
                                </svg>
                                <p class="text-sm">Image not available</p>
                              </div>
                            </div>
                          `
                        }
                      }
                    }}
                  />
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

          {!loading && !landsatData && (
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
      </div>
    </div>
  )
}
