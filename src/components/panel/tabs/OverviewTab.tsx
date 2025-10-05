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
        <h4 className="text-white font-medium">Recent Events ({bloomingData.temporal_data[0]?.blooming_events.length || 0})</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {bloomingData.temporal_data[0]?.blooming_events.slice(0, 8).map((event, index) => (
            <div key={index} className="bg-white/5 p-3 rounded text-sm">
              <div className="flex justify-between items-start">
                <div className="text-white/90 font-medium text-xs">
                  {new Date(event.start_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  event.intensity > 0.7 ? 'bg-green-500/20 text-green-300' :
                  event.intensity > 0.4 ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {event.intensity > 0.7 ? 'High' : event.intensity > 0.4 ? 'Medium' : 'Low'}
                </div>
              </div>
              <div className="text-white/80 text-xs mt-1">
                <span className="text-blue-300">{event.species[0]}</span> activity
              </div>
              <div className="flex justify-between text-white/60 text-xs mt-1">
                <span>NDVI: {event.ndvi_avg.toFixed(2)}</span>
                <span>Temp: {event.weather_correlation.temperature_avg.toFixed(1)}°C</span>
              </div>
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
