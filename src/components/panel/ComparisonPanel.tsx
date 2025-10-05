'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState, useRef } from 'react'
import { BloomingApiResponse } from '@/types/landsat'
import { ArrowUp, ArrowDown, X, Minimize2, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import TabContent from './tabs/TabContent'

type PanelState = 'default' | 'fullscreen'

export default function ComparisonPanel() {
  // CRITICAL: These store values are essential for auto-open behavior
  // DO NOT REMOVE: selectedLocation triggers panel auto-open when globe is clicked
  const { isPanelOpen, setPanelOpen, selectedLocation, isMinimized, setIsMinimized, setBloomingData: setGlobalBloomingData } = useAppStore()
  const [bloomingData, setBloomingData] = useState<BloomingApiResponse['data'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [panelState, setPanelState] = useState<PanelState>('default')
  
  const dragStartRef = useRef<{ y: number } | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleMaximize = () => {
    setIsMinimized(false)
    setPanelState('default')
  }

  // Fungsi untuk minimize panel
  const handleMinimize = () => {
    setIsMinimized(true);
  }

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
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
      try {
        const response = await fetch(`/api/blooming-events?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lng}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const result = await response.json()
        if (result.success) {
          setBloomingData(result.data)
          setGlobalBloomingData(result.data)
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
  }, [selectedLocation, isPanelOpen, setGlobalBloomingData])

  if (!selectedLocation) return null

  const getTrendIcon = (trend: string) => {
    if (trend.includes('+')) return <ArrowUp className="text-green-400 h-4 w-4" />
    if (trend.includes('-')) return <ArrowDown className="text-red-400 h-4 w-4" />
    return null
  }

  if (isMinimized && isPanelOpen) {
    return (
      <>
        {/* Minimize mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-30 p-2 md:hidden">
          <Card 
            className="bg-white/10 backdrop-blur-md border-white/20 flex items-center justify-between p-2 cursor-pointer"
            onClick={handleMaximize}
          >
            <div className="text-white text-sm font-semibold ml-2">
              {bloomingData?.location.name || 'Blooming Analysis'}
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </Card>
        </div>
        {/* Minimize desktop */}
        <div className="fixed top-6 right-6 z-10 transform transition-transform duration-300 hidden md:block">
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
      </>
    )
  }

  return (
    <div 
      ref={panelRef}
      className={cn(
      "fixed z-10 transform transition-transform duration-300",
      "bottom-0 left-0 right-0 w-full rounded-t-2xl",
      panelState === 'default' ? 'h-[75vh]' : 'h-full',
      "md:top-6 md:right-6 md:bottom-12 md:left-auto md:w-[500px] md:h-auto md:rounded-lg",
      isPanelOpen ? "translate-y-0" : "translate-y-full md:translate-y-0 md:translate-x-full"
    )}>
      <Card className="bg-white/10 backdrop-blur-md border-white/20 h-full flex flex-col">
        <div 
          className="md:hidden flex-shrink-0 flex justify-center py-3 cursor-grab active:cursor-grabbing"
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
        >
          <div className="w-16 h-1.5 bg-white/30 rounded-full" />
        </div>

        <CardHeader className="pt-0 md:pt-6">
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
          {error && <div className="text-red-400 text-sm p-3 bg-red-400/10 rounded">{error}</div>}
          {bloomingData && !loading && !error && <TabContent bloomingData={bloomingData} getTrendIcon={getTrendIcon} />}
        </CardContent>
      </Card>
    </div>
  )
}