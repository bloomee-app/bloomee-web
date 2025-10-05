'use client'

import { Brain } from 'lucide-react'
import { BloomingApiResponse } from '@/types/landsat'

interface InsightsTabProps {
  bloomingData: BloomingApiResponse['data']
}

export default function InsightsTab({ bloomingData }: InsightsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white font-medium">
        <Brain className="h-5 w-5" />
        <span>Ecological Insights</span>
      </div>
      
      <div className="space-y-3">
        <div className="bg-white/5 p-3 rounded text-sm">
          <h5 className="text-blue-300 font-medium mb-2">Biodiversity Impact</h5>
          <p className="text-white/80 text-xs">
            {bloomingData.trends.species_composition_change} suggests changes in local ecosystem composition.
          </p>
        </div>
        
        <div className="bg-white/5 p-3 rounded text-sm">
          <h5 className="text-green-300 font-medium mb-2">Conservation Status</h5>
          <p className="text-white/80 text-xs">
            Current blooming patterns indicate {bloomingData.trends.intensity_trend === 'increasing' ? 'improving' : 'stable'} ecosystem health.
          </p>
        </div>

        <div className="bg-white/5 p-3 rounded text-sm">
          <h5 className="text-yellow-300 font-medium mb-2">Climate Correlation</h5>
          <p className="text-white/80 text-xs">
            Blooming timing shows {bloomingData.trends.blooming_advance_days_per_decade < 0 ? 'advancing' : 'delaying'} trends, potentially linked to climate change.
          </p>
        </div>
      </div>
    </div>
  )
}
