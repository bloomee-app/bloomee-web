'use client'

import { Leaf, Sun, Droplets } from 'lucide-react'
import { BloomingApiResponse } from '@/types/landsat'

interface OverviewTabProps {
  bloomingData: BloomingApiResponse['data']
}

export default function OverviewTab({ bloomingData }: OverviewTabProps) {
  return (
    <div className="space-y-4">
      {/* Lokasi dan Biome */}
      <div className="flex items-center gap-2 text-white/90 text-sm">
        <Leaf className="h-4 w-4" />
        <p><strong>Biome:</strong> {bloomingData.location.biome.replace('_', ' ')}</p>
      </div>

      {/* Event Terkini */}
      <div className="space-y-2">
        <h4 className="text-white font-medium">Recent Events</h4>
        <div className="space-y-2">
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
    </div>
  )
}
