'use client'

import { BarChart3, Leaf } from 'lucide-react'
import { BloomingApiResponse } from '@/types/landsat'
import TrendChart from '../charts/TrendChart'

interface TrendsTabProps {
  bloomingData: BloomingApiResponse['data']
  getTrendIcon: (trend: string) => React.ReactNode
}

export default function TrendsTab({ bloomingData, getTrendIcon }: TrendsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white font-medium">
        <BarChart3 className="h-5 w-5" />
        <span>Trend Analysis</span>
      </div>
      
      {/* Quick Stats */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white/80 text-sm">
          {getTrendIcon(bloomingData.trends.intensity_trend)}
          <span><strong>Intensity:</strong> {bloomingData.trends.intensity_trend}</span>
        </div>
        <div className="flex items-center gap-2 text-white/80 text-sm">
          {getTrendIcon(bloomingData.trends.blooming_advance_days_per_decade.toString())}
          <span><strong>Advance:</strong> {bloomingData.trends.blooming_advance_days_per_decade} days/decade</span>
        </div>
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <Leaf className="h-4 w-4 text-white/60" />
          <span><strong>Species:</strong> {bloomingData.trends.species_composition_change}</span>
        </div>
      </div>

      {/* Multi-year Trend Chart */}
      <TrendChart />
    </div>
  )
}
