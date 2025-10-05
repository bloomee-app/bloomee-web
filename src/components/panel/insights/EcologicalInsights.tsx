'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { 
  Leaf, 
  Droplets, 
  Thermometer, 
  Shield, 
  TreePine, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EcologicalData } from '@/types/landsat'

interface EcologicalInsightsProps {
  data: EcologicalData
  className?: string
}

export default function EcologicalInsights({ data, className }: EcologicalInsightsProps) {
  const getConservationIcon = (status: string) => {
    switch (status) {
      case 'stable': return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'threatened': return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-400" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getConservationColor = (status: string) => {
    switch (status) {
      case 'stable': return 'border-green-400/30 bg-green-400/10'
      case 'threatened': return 'border-yellow-400/30 bg-yellow-400/10'
      case 'critical': return 'border-red-400/30 bg-red-400/10'
      default: return 'border-gray-400/30 bg-gray-400/10'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'stable': return <div className="h-4 w-4 bg-gray-400 rounded-full" />
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'border-green-400/50 bg-green-400/10'
      case 'medium': return 'border-yellow-400/50 bg-yellow-400/10'
      case 'high': return 'border-orange-400/50 bg-orange-400/10'
      case 'critical': return 'border-red-400/50 bg-red-400/10'
      default: return 'border-gray-400/50 bg-gray-400/10'
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Biome Analysis */}
      <Card className="p-4 bg-white/5 backdrop-blur-sm border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <TreePine className="h-5 w-5 text-green-400" />
          <h3 className="font-semibold text-white">Biome Analysis</h3>
          {getConservationIcon(data.biome.conservationStatus)}
        </div>
        <div className="space-y-2">
          <div>
            <span className="text-sm text-white/70">Type: </span>
            <span className="text-sm text-white font-medium">{data.biome.type}</span>
          </div>
          <p className="text-sm text-white/80">{data.biome.description}</p>
          <div className="flex flex-wrap gap-1">
            {data.biome.threats.map((threat, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-red-400/20 text-red-300 text-xs rounded-full"
              >
                {threat}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Biodiversity Indicators */}
      <Card className="p-4 bg-white/5 backdrop-blur-sm border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="h-5 w-5 text-green-400" />
          <h3 className="font-semibold text-white">Biodiversity Indicators</h3>
          {getTrendIcon(data.biodiversity.trend)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-2xl font-bold text-white">{data.biodiversity.speciesCount}</div>
            <div className="text-xs text-white/60">Total Species</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{data.biodiversity.endemicSpecies}</div>
            <div className="text-xs text-white/60">Endemic Species</div>
          </div>
          <div className="col-span-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Diversity Index:</span>
              <span className="text-sm text-white font-medium">{data.biodiversity.diversityIndex.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Climate Change Assessment */}
      <Card className="p-4 bg-white/5 backdrop-blur-sm border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Thermometer className="h-5 w-5 text-orange-400" />
          <h3 className="font-semibold text-white">Climate Change Impact</h3>
          <span className={cn("text-sm font-medium", getImpactColor(data.climateChange.impactLevel))}>
            {data.climateChange.impactLevel.toUpperCase()}
          </span>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1">
                <Thermometer className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-white/70">Temperature:</span>
              </div>
              <div className="text-sm text-white font-medium">
                {data.climateChange.temperatureChange > 0 ? '+' : ''}{data.climateChange.temperatureChange.toFixed(1)}°C
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <Droplets className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-white/70">Precipitation:</span>
              </div>
              <div className="text-sm text-white font-medium">
                {data.climateChange.precipitationChange > 0 ? '+' : ''}{data.climateChange.precipitationChange.toFixed(1)}%
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm text-white/70 mb-2">Adaptation Measures:</div>
            <div className="space-y-1">
              {data.climateChange.adaptationMeasures.map((measure, index) => (
                <div key={index} className="text-xs text-white/80 bg-white/5 p-2 rounded">
                  • {measure}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Conservation Priority */}
      <Card className={cn("p-4 backdrop-blur-sm border", getPriorityColor(data.conservation.priority))}>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">Conservation Priority</h3>
          <span className="text-sm font-medium text-white/80 uppercase">
            {data.conservation.priority}
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">Protected Area:</span>
            {data.conservation.protectedArea ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-400" />
            )}
            <span className="text-sm text-white/80">
              {data.conservation.protectedArea ? 'Yes' : 'No'}
            </span>
          </div>
          
          <div>
            <div className="text-sm text-white/70 mb-2">Key Threats:</div>
            <div className="flex flex-wrap gap-1">
              {data.conservation.threats.map((threat, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-red-400/20 text-red-300 text-xs rounded-full"
                >
                  {threat}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-white/70 mb-2">Recommendations:</div>
            <div className="space-y-1">
              {data.conservation.recommendations.map((rec, index) => (
                <div key={index} className="text-xs text-white/80 bg-white/5 p-2 rounded">
                  • {rec}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
