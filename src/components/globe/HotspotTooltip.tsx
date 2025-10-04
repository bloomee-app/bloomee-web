'use client'

import { useAppStore } from '@/lib/store'

export default function HotspotTooltip() {
  const { hoveredHotspot } = useAppStore()

  if (!hoveredHotspot) return null

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
      <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm border border-white/20">
        <div className="font-semibold">{hoveredHotspot.name}</div>
        <div className="text-xs text-gray-300 capitalize">
          {hoveredHotspot.type} • {hoveredHotspot.severity} severity
        </div>
      </div>
    </div>
  )
}
