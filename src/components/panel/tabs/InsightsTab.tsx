'use client'

import { Brain } from 'lucide-react'
import { BloomingApiResponse } from '@/types/landsat'
import EcologicalInsights from '../insights/EcologicalInsights'

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
      
      {/* Ecological Insights Component */}
      {bloomingData.ecological_data && (
        <EcologicalInsights data={bloomingData.ecological_data} />
      )}
    </div>
  )
}
