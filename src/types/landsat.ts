// Landsat and Blooming Event Data Types

export interface LandsatBands {
  red: number
  green: number
  blue: number
  nir: number
  swir1: number
  swir2: number
}

export interface VegetationIndices {
  ndvi: number      // Normalized Difference Vegetation Index
  evi: number       // Enhanced Vegetation Index
  ndwi: number      // Normalized Difference Water Index
}

export interface WeatherCorrelation {
  temperature_avg: number
  precipitation_total: number
}

export interface BloomingEvent {
  start_date: string      // ISO date string
  end_date: string        // ISO date string
  peak_date: string       // ISO date string
  intensity: number       // 0-1 scale (0=no bloom, 1=max bloom)
  confidence: number      // 0-1 scale (model confidence)
  species: string[]       // Array of potential species names
  ndvi_avg: number        // Average NDVI during event
  evi_avg: number         // Average EVI during event
  weather_correlation: WeatherCorrelation
}

export interface YearlyBloomingData {
  year: number
  season: 'spring' | 'summer' | 'fall' | 'winter'
  month: number
  blooming_events: BloomingEvent[]
  summary: {
    total_blooming_days: number
    avg_intensity: number
    dominant_species: string
    ecological_insights: string
  }
}

export interface LocationInfo {
  lat: number
  lng: number
  name: string
  biome: string
}

export interface BloomingTrends {
  blooming_advance_days_per_decade: number
  intensity_trend: string
  species_composition_change: string
}

// Ecological Data Types
export interface EcologicalData {
  biome: {
    type: string
    description: string
    threats: string[]
    conservationStatus: 'stable' | 'threatened' | 'critical'
  }
  biodiversity: {
    speciesCount: number
    endemicSpecies: number
    diversityIndex: number
    trend: 'increasing' | 'stable' | 'decreasing'
  }
  climateChange: {
    temperatureChange: number
    precipitationChange: number
    impactLevel: 'low' | 'medium' | 'high'
    adaptationMeasures: string[]
  }
  conservation: {
    priority: 'low' | 'medium' | 'high' | 'critical'
    protectedArea: boolean
    threats: string[]
    recommendations: string[]
  }
}

export interface BloomingApiResponse {
  success: boolean
  data: {
    location: LocationInfo
    temporal_data: YearlyBloomingData[]
    trends: BloomingTrends
    ecological_data: EcologicalData
    metadata: {
      data_sources: string[]
      processing_model: string
      last_updated: string
      data_quality: string
    }
  }
}

export interface ApiErrorResponse {
  success: false
  error: string
  message: string
}

// Helper functions untuk calculate vegetation indices
export const calculateNDVI = (nir: number, red: number): number => {
  return (nir - red) / (nir + red)
}

export const calculateEVI = (nir: number, red: number, blue: number): number => {
  return 2.5 * (nir - red) / (nir + 6 * red - 7.5 * blue + 1)
}

export const calculateNDWI = (green: number, nir: number): number => {
  return (green - nir) / (green + nir)
}
