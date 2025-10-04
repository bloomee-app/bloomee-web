'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { BloomingApiResponse } from '@/types/landsat'

export default function ComparisonPanel() {
  const { isPanelOpen, setPanelOpen, selectedLocation } = useAppStore()
  const [bloomingData, setBloomingData] = useState<BloomingApiResponse['data'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch blooming data ketika selectedLocation berubah
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

  return (
    <div className="absolute top-6 right-6 z-10">
      <Card className="w-96 bg-white/10 backdrop-blur-md border-white/20 max-h-[80vh] overflow-y-auto">
        <CardHeader>
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
        <CardContent className="space-y-4">
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
              {/* Location Info */}
              <div className="space-y-2">
                <div className="text-white/90 text-sm">
                  <strong>Biome:</strong> {bloomingData.location.biome.replace('_', ' ')}
                </div>
                <div className="text-white/70 text-xs">
                  {bloomingData.temporal_data.length} years of data • {bloomingData.metadata.data_sources.join(', ')}
                </div>
              </div>

              {/* Trends */}
              <div className="space-y-2">
                <h4 className="text-white font-medium">Trends</h4>
                <div className="text-white/80 text-sm space-y-1">
                  <div>Blooming advance: {bloomingData.trends.blooming_advance_days_per_decade} days/decade</div>
                  <div>Intensity trend: {bloomingData.trends.intensity_trend}</div>
                  <div>Species diversity: {bloomingData.trends.species_composition_change}</div>
                </div>
              </div>

              {/* Recent Blooming Events */}
              <div className="space-y-2">
                <h4 className="text-white font-medium">Recent Blooming Events</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {bloomingData.temporal_data.slice(-3).map((yearData) => (
                    <div key={yearData.year} className="bg-white/5 p-3 rounded text-sm">
                      <div className="text-white/90 font-medium">{yearData.year} - {yearData.season}</div>
                      <div className="text-white/70 text-xs">
                        {yearData.blooming_events.length} events • {yearData.summary.total_blooming_days} days
                      </div>
                      <div className="text-blue-300 text-xs mt-1">
                        {yearData.summary.ecological_insights}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/20"
              onClick={() => setPanelOpen(false)}
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
