'use client'

import { Target } from 'lucide-react'
import { BloomingApiResponse } from '@/types/landsat'

interface DecisionsTabProps {
  bloomingData: BloomingApiResponse['data']
}

export default function DecisionsTab({ bloomingData }: DecisionsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white font-medium">
        <Target className="h-5 w-5" />
        <span>Decision Support</span>
      </div>
      
      <div className="space-y-3">
        <div className="bg-white/5 p-3 rounded text-sm">
          <h5 className="text-purple-300 font-medium mb-2">Agricultural Planning</h5>
          <p className="text-white/80 text-xs mb-2">
            Based on current trends, consider adjusting planting schedules.
          </p>
          <ul className="text-white/70 text-xs space-y-1 ml-2">
            <li>• Monitor pollen levels for crop timing</li>
            <li>• Adjust irrigation based on precipitation patterns</li>
          </ul>
        </div>
        
        <div className="bg-white/5 p-3 rounded text-sm">
          <h5 className="text-orange-300 font-medium mb-2">Conservation Actions</h5>
          <p className="text-white/80 text-xs mb-2">
            Recommended conservation strategies for this location.
          </p>
          <ul className="text-white/70 text-xs space-y-1 ml-2">
            <li>• Protect native species diversity</li>
            <li>• Monitor invasive species introduction</li>
            <li>• Maintain habitat connectivity</li>
          </ul>
        </div>

        <div className="bg-white/5 p-3 rounded text-sm">
          <h5 className="text-red-300 font-medium mb-2">Health Alerts</h5>
          <p className="text-white/80 text-xs mb-2">
            Public health considerations for this region.
          </p>
          <ul className="text-white/70 text-xs space-y-1 ml-2">
            <li>• Allergy season timing predictions</li>
            <li>• Pollen count monitoring recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
