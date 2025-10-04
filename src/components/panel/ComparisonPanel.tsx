'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { BloomingApiResponse } from '@/types/landsat'
import { ArrowUp, ArrowDown, Leaf, Droplets, Sun, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ComparisonPanel() {
  const { isPanelOpen, setPanelOpen, selectedLocation } = useAppStore()
  const [bloomingData, setBloomingData] = useState<BloomingApiResponse['data'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        const response = await fetch(
          `/api/blooming-events?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lng}`
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: BloomingApiResponse = await response.json()

        if (result.success) {
          setBloomingData(result.data)
        } else {
          setError(result.message)
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

  if (!isPanelOpen) return null

  const getTrendIcon = (trend: string) => {
    if (trend.includes('+')) return <ArrowUp className="text-green-400 h-4 w-4" />
    if (trend.includes('-')) return <ArrowDown className="text-red-400 h-4 w-4" />
    return null
  }

  return (
    <div className={cn(
      "fixed top-6 right-6 z-10 w-96 max-h-[80vh] overflow-y-auto transform transition-transform duration-300",
      isPanelOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute top-3 right-3 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => setPanelOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
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
        <CardContent className="space-y-6">
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
            <>
              {/* Lokasi dan Biome */}
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Leaf className="h-4 w-4" />
                <p><strong>Biome:</strong> {bloomingData.location.biome.replace('_', ' ')}</p>
              </div>

              {/* Ringkasan Tren */}
              <div className="space-y-2">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <span>Trends</span>
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    {getTrendIcon(bloomingData.trends.intensity_trend)}
                    <span>Intensity: {bloomingData.trends.intensity_trend}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    {getTrendIcon(bloomingData.trends.blooming_advance_days_per_decade.toString())}
                    <span>Advance: {bloomingData.trends.blooming_advance_days_per_decade} days/decade</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Leaf className="h-4 w-4 text-white/60" />
                    <span>Species: {bloomingData.trends.species_composition_change}</span>
                  </div>
                </div>
              </div>

              {/* Event Terkini */}
              <div className="space-y-2">
                <h4 className="text-white font-medium">Recent Events</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {bloomingData.temporal_data.slice(-3).map((yearData) => (
                    <div key={yearData.year} className="bg-white/5 p-3 rounded text-sm">
                      <div className="text-white/90 font-medium">
                        <span className="text-blue-300">{yearData.summary.dominant_species}</span> in {yearData.year}
                      </div>
                      <div className="flex justify-between text-white/70 text-xs mt-1">
                        <span>{yearData.blooming_events.length} events</span>
                        <span>Avg Intensity: {yearData.summary.avg_intensity.toFixed(2)}</span>
                      </div>
                      <p className="text-white/60 text-xs mt-1">
                        {yearData.summary.ecological_insights}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detail Cuaca */}
              {bloomingData.temporal_data[0] && (
                <div className="space-y-2">
                  <h4 className="text-white font-medium">Weather Correlation</h4>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-yellow-300" />
                      <span>Temp: {bloomingData.temporal_data[0].blooming_events[0]?.weather_correlation.temperature_avg.toFixed(1)}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-300" />
                      <span>Precip: {bloomingData.temporal_data[0].blooming_events[0]?.weather_correlation.precipitation_total.toFixed(1)}mm</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="text-white/60 text-xs border-t border-white/10 pt-2">
                Last updated: {new Date(bloomingData.metadata.last_updated).toLocaleDateString()}
              </div>
            </>
          )}

          {!selectedLocation && !loading && !error && (
            <div className="text-white/80 text-sm text-center py-4">
              Click on the globe to view blooming data for that location.
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!bloomingData}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}