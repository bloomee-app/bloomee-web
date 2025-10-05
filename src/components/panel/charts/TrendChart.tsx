'use client'

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, TrendingUp, BarChart3, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

// Mock data generator for multi-year trends
const generateTrendData = () => {
  const years = [2020, 2021, 2022, 2023, 2024]
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return years.flatMap(year => 
    months.map((month, index) => {
      // Simulate seasonal blooming patterns
      const baseIntensity = 0.3
      const seasonalFactor = Math.sin((index / 12) * 2 * Math.PI) * 0.4 + 0.6
      const yearFactor = 1 + (year - 2020) * 0.05 // Slight increase over years
      const randomFactor = 0.8 + Math.random() * 0.4
      
      const intensity = Math.max(0, Math.min(1, baseIntensity + seasonalFactor * yearFactor * randomFactor))
      
      return {
        year,
        month,
        monthIndex: index + 1,
        date: `${year}-${String(index + 1).padStart(2, '0')}-01`,
        intensity: Number(intensity.toFixed(3)),
        speciesCount: Math.floor(15 + intensity * 25 + Math.random() * 10),
        temperature: 20 + seasonalFactor * 15 + Math.random() * 5,
        precipitation: Math.max(0, 50 + Math.sin((index / 12) * 2 * Math.PI + Math.PI) * 30 + Math.random() * 20)
      }
    })
  )
}

type ChartMode = 'intensity' | 'species' | 'climate'
type ViewMode = 'monthly' | 'yearly' | 'seasonal'

interface TrendChartProps {
  className?: string
}

export default function TrendChart({ className }: TrendChartProps) {
  // CRITICAL: Use global store for chart settings to persist across location changes
  // DO NOT CHANGE: This ensures chart filters stay the same when user clicks different locations
  const { 
    trendMode, 
    setTrendMode, 
    viewMode, 
    setViewMode, 
    selectedSeason, 
    setSelectedSeason 
  } = useAppStore()
  
  const rawData = generateTrendData()
  
  // Process data based on view mode
  const processedData = (() => {
    if (viewMode === 'yearly') {
      const yearlyData = rawData.reduce((acc, item) => {
        const existing = acc.find(d => d.year === item.year)
        if (existing) {
          existing.intensity = (existing.intensity + item.intensity) / 2
          existing.speciesCount += item.speciesCount
          existing.temperature = (existing.temperature + item.temperature) / 2
          existing.precipitation += item.precipitation
        } else {
          acc.push({ ...item })
        }
        return acc
      }, [] as any[])
      
      return yearlyData.map(item => ({
        ...item,
        speciesCount: Math.floor(item.speciesCount / 12),
        precipitation: Math.floor(item.precipitation / 12),
        label: item.year.toString()
      }))
    }
    
    if (viewMode === 'seasonal') {
      const seasons = {
        'spring': [3, 4, 5],
        'summer': [6, 7, 8], 
        'fall': [9, 10, 11],
        'winter': [12, 1, 2]
      }
      
      const seasonData = Object.entries(seasons).map(([season, months]) => {
        const seasonItems = rawData.filter(item => months.includes(item.monthIndex))
        const avgIntensity = seasonItems.reduce((sum, item) => sum + item.intensity, 0) / seasonItems.length
        const totalSpecies = seasonItems.reduce((sum, item) => sum + item.speciesCount, 0) / seasonItems.length
        const avgTemp = seasonItems.reduce((sum, item) => sum + item.temperature, 0) / seasonItems.length
        const totalPrecip = seasonItems.reduce((sum, item) => sum + item.precipitation, 0) / seasonItems.length
        
        return {
          season,
          intensity: Number(avgIntensity.toFixed(3)),
          speciesCount: Math.floor(totalSpecies),
          temperature: Number(avgTemp.toFixed(1)),
          precipitation: Number(totalPrecip.toFixed(1)),
          label: season.charAt(0).toUpperCase() + season.slice(1)
        }
      })
      
      if (selectedSeason !== 'all') {
        return seasonData.filter(item => item.season === selectedSeason)
      }
      
      return seasonData
    }
    
    // Monthly view
    return rawData.slice(-24).map(item => ({
      ...item,
      label: `${item.month} ${item.year}`
    }))
  })()
  
  const getChartData = () => {
    switch (trendMode) {
      case 'intensity':
        return processedData.map(item => ({
          ...item,
          value: item.intensity,
          color: '#3b82f6'
        }))
      case 'species':
        return processedData.map(item => ({
          ...item,
          value: item.speciesCount,
          color: '#10b981'
        }))
      case 'climate':
        return processedData.map(item => ({
          ...item,
          value: item.temperature,
          precipitation: item.precipitation,
          color: '#f59e0b'
        }))
      default:
        return []
    }
  }
  
  const chartData = getChartData()
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 p-3 shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Intensity:</span> {(data.intensity * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Species:</span> {data.speciesCount}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Temperature:</span> {data.temperature?.toFixed(1)}°C
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Precipitation:</span> {data.precipitation?.toFixed(1)}mm
          </p>
        </Card>
      )
    }
    return null
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Chart Controls */}
      <div className="flex flex-wrap gap-2">
        {/* Chart Mode */}
        <div className="flex gap-1 bg-white/10 rounded-lg p-1">
          <Button
            size="sm"
            variant={trendMode === 'intensity' ? 'default' : 'ghost'}
            onClick={() => setTrendMode('intensity')}
            className="text-xs"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Intensity
          </Button>
          <Button
            size="sm"
            variant={trendMode === 'species' ? 'default' : 'ghost'}
            onClick={() => setTrendMode('species')}
            className="text-xs"
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            Species
          </Button>
          <Button
            size="sm"
            variant={trendMode === 'climate' ? 'default' : 'ghost'}
            onClick={() => setTrendMode('climate')}
            className="text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Climate
          </Button>
        </div>
        
        {/* View Mode */}
        <div className="flex gap-1 bg-white/10 rounded-lg p-1">
          <Button
            size="sm"
            variant={viewMode === 'monthly' ? 'default' : 'ghost'}
            onClick={() => setViewMode('monthly')}
            className="text-xs"
          >
            Monthly
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'yearly' ? 'default' : 'ghost'}
            onClick={() => setViewMode('yearly')}
            className="text-xs"
          >
            Yearly
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'seasonal' ? 'default' : 'ghost'}
            onClick={() => setViewMode('seasonal')}
            className="text-xs"
          >
            Seasonal
          </Button>
        </div>
        
        {/* Season Filter (only for seasonal view) */}
        {viewMode === 'seasonal' && (
          <div className="flex gap-1 bg-white/10 rounded-lg p-1">
            <Button
              size="sm"
              variant={selectedSeason === 'all' ? 'default' : 'ghost'}
              onClick={() => setSelectedSeason('all')}
              className="text-xs"
            >
              <Filter className="h-3 w-3 mr-1" />
              All
            </Button>
            {(['spring', 'summer', 'fall', 'winter'] as const).map(season => (
              <Button
                key={season}
                size="sm"
                variant={selectedSeason === season ? 'default' : 'ghost'}
                onClick={() => setSelectedSeason(season)}
                className="text-xs capitalize"
              >
                {season}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {trendMode === 'climate' ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="label" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)"
                fontSize={11}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f59e0b"
                fill="rgba(245, 158, 11, 0.2)"
                name="Temperature (°C)"
              />
              <Area
                type="monotone"
                dataKey="precipitation"
                stroke="#3b82f6"
                fill="rgba(59, 130, 246, 0.2)"
                name="Precipitation (mm)"
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="label" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)"
                fontSize={11}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartData[0]?.color || '#3b82f6'}
                strokeWidth={2}
                dot={{ fill: chartData[0]?.color || '#3b82f6', strokeWidth: 2, r: 4 }}
                name={trendMode === 'intensity' ? 'Blooming Intensity' : 'Species Count'}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      
      {/* Chart Summary */}
      <div className="bg-white/5 p-3 rounded text-sm">
        <h5 className="text-white font-medium mb-2">Trend Summary</h5>
        <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
          <div>
            <span className="font-medium">Current View:</span> {viewMode} {trendMode}
          </div>
          <div>
            <span className="font-medium">Data Points:</span> {chartData.length}
          </div>
          <div>
            <span className="font-medium">Date Range:</span> 2020-2024
          </div>
          <div>
            <span className="font-medium">Source:</span> Mock NASA Landsat
          </div>
        </div>
      </div>
    </div>
  )
}
