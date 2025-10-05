/**
 * Bloom data generator for testing and demonstration purposes
 */

import { BloomIntensity, calculateBloomIntensity } from './bloomUtils'
import { ColorMapping, intensityToColor } from './colorMapping'

export interface BloomDataPoint {
  lat: number
  lng: number
  intensity: number
  season: 'spring' | 'summer' | 'fall' | 'winter'
  phase: 'pre-bloom' | 'bloom' | 'post-bloom' | 'dormant'
  color: ColorMapping
  location: string
}

/**
 * Predefined locations for bloom data generation
 */
export const BLOOM_LOCATIONS = {
  // Northern Hemisphere
  'Amsterdam, Netherlands': { lat: 52.3676, lng: 4.9041 },
  'Tokyo, Japan': { lat: 35.6762, lng: 139.6503 },
  'New York, USA': { lat: 40.7128, lng: -74.0060 },
  'London, UK': { lat: 51.5074, lng: -0.1278 },
  'Berlin, Germany': { lat: 52.5200, lng: 13.4050 },
  'Moscow, Russia': { lat: 55.7558, lng: 37.6176 },
  
  // Southern Hemisphere
  'Sydney, Australia': { lat: -33.8688, lng: 151.2093 },
  'São Paulo, Brazil': { lat: -23.5505, lng: -46.6333 },
  'Cape Town, South Africa': { lat: -33.9249, lng: 18.4241 },
  'Buenos Aires, Argentina': { lat: -34.6118, lng: -58.3960 },
  
  // Tropical Regions
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Mumbai, India': { lat: 19.0760, lng: 72.8777 },
  'Jakarta, Indonesia': { lat: -6.2088, lng: 106.8456 },
  
  // Polar Regions
  'Reykjavik, Iceland': { lat: 64.1466, lng: -21.9426 },
  'Fairbanks, Alaska': { lat: 64.8378, lng: -147.7164 }
}

/**
 * Generate bloom data for a specific location and date
 */
export function generateBloomDataForLocation(
  locationName: string,
  date: Date
): BloomDataPoint | null {
  const location = BLOOM_LOCATIONS[locationName as keyof typeof BLOOM_LOCATIONS]
  if (!location) return null

  const bloom = calculateBloomIntensity(location.lat, date)
  const color = intensityToColor(bloom.intensity, bloom.phase, bloom.season)

  return {
    lat: location.lat,
    lng: location.lng,
    intensity: bloom.intensity,
    season: bloom.season,
    phase: bloom.phase,
    color,
    location: locationName
  }
}

/**
 * Generate bloom data for all predefined locations
 */
export function generateGlobalBloomData(date: Date): BloomDataPoint[] {
  return Object.keys(BLOOM_LOCATIONS)
    .map(locationName => generateBloomDataForLocation(locationName, date))
    .filter((data): data is BloomDataPoint => data !== null)
}

/**
 * Generate bloom data for a grid of coordinates
 */
export function generateGridBloomData(
  startLat: number,
  endLat: number,
  startLng: number,
  endLng: number,
  resolution: number,
  date: Date
): BloomDataPoint[] {
  const data: BloomDataPoint[] = []
  
  const latStep = (endLat - startLat) / resolution
  const lngStep = (endLng - startLng) / resolution
  
  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const lat = startLat + i * latStep
      const lng = startLng + j * lngStep
      const bloom = calculateBloomIntensity(lat, date)
      const color = intensityToColor(bloom.intensity, bloom.phase, bloom.season)
      
      data.push({
        lat,
        lng,
        intensity: bloom.intensity,
        season: bloom.season,
        phase: bloom.phase,
        color,
        location: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`
      })
    }
  }
  
  return data
}

/**
 * Generate seasonal bloom data for a specific location throughout the year
 */
export function generateSeasonalBloomData(
  locationName: string,
  year: number = 2023
): Array<{ date: Date; bloom: BloomDataPoint }> {
  const location = BLOOM_LOCATIONS[locationName as keyof typeof BLOOM_LOCATIONS]
  if (!location) return []

  const data: Array<{ date: Date; bloom: BloomDataPoint }> = []
  
  // Generate data for every week of the year
  for (let week = 0; week < 52; week++) {
    const date = new Date(year, 0, 1 + week * 7)
    const bloom = calculateBloomIntensity(location.lat, date)
    const color = intensityToColor(bloom.intensity, bloom.phase, bloom.season)
    
    data.push({
      date,
      bloom: {
        lat: location.lat,
        lng: location.lng,
        intensity: bloom.intensity,
        season: bloom.season,
        phase: bloom.phase,
        color,
        location: locationName
      }
    })
  }
  
  return data
}

/**
 * Get bloom statistics for a specific date
 */
export function getBloomStatistics(date: Date): {
  totalLocations: number
  activeBloom: number
  peakBloom: number
  dormant: number
  seasonDistribution: Record<string, number>
  phaseDistribution: Record<string, number>
} {
  const globalData = generateGlobalBloomData(date)
  
  const activeBloom = globalData.filter(d => d.intensity > 0.3).length
  const peakBloom = globalData.filter(d => d.intensity > 0.7).length
  const dormant = globalData.filter(d => d.intensity < 0.2).length
  
  const seasonDistribution: Record<string, number> = {}
  const phaseDistribution: Record<string, number> = {}
  
  globalData.forEach(data => {
    seasonDistribution[data.season] = (seasonDistribution[data.season] || 0) + 1
    phaseDistribution[data.phase] = (phaseDistribution[data.phase] || 0) + 1
  })
  
  return {
    totalLocations: globalData.length,
    activeBloom,
    peakBloom,
    dormant,
    seasonDistribution,
    phaseDistribution
  }
}

/**
 * Find locations with peak bloom for a specific date
 */
export function findPeakBloomLocations(date: Date, threshold: number = 0.8): BloomDataPoint[] {
  const globalData = generateGlobalBloomData(date)
  return globalData.filter(data => data.intensity >= threshold)
}

/**
 * Find locations with minimal bloom for a specific date
 */
export function findDormantLocations(date: Date, threshold: number = 0.2): BloomDataPoint[] {
  const globalData = generateGlobalBloomData(date)
  return globalData.filter(data => data.intensity <= threshold)
}
