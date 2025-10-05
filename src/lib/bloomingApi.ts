/**
 * Utility functions for interacting with the Blomee backend API
 */

import { 
  generateLocationSpecificNDVI, 
  generateLocationSpecificWeather, 
  generateLocationSpecificBloomStatus,
  generateLocationSpecificEcologicalInsights,
  getCurrentSeason,
  getVariedMockLandsatImage
} from './locationSpecificData'

// Re-export for use in other files
export { getVariedMockLandsatImage }

/**
 * Force region variety for demo purposes
 * This function ensures different regions are shown more frequently
 */
export function mapLocationToRegionWithVariety(lat: number, lng: number, forceVariety: boolean = true): string {
  if (!forceVariety) {
    return mapLocationToRegion(lat, lng)
  }
  
  // For demo: 50% chance to use closest, 50% chance for variety
  const randomFactor = Math.random()
  
  if (randomFactor > 0.5) {
    let closestRegion = AVAILABLE_REGIONS[0]
    let minDistance = calculateDistance(lat, lng, AVAILABLE_REGIONS[0].lat, AVAILABLE_REGIONS[0].lng)
    
    for (const region of AVAILABLE_REGIONS) {
      const distance = calculateDistance(lat, lng, region.lat, region.lng)
      if (distance < minDistance) {
        minDistance = distance
        closestRegion = region
      }
    }
    
    console.log(`📍 Using closest region: ${closestRegion.name} (distance: ${minDistance.toFixed(1)}km)`)
    return closestRegion.id
  } else {
    // 50% chance for variety - pick from all regions
    const randomIndex = Math.floor(Math.random() * AVAILABLE_REGIONS.length)
    const selectedRegion = AVAILABLE_REGIONS[randomIndex]
    console.log(`🎲 Using random region for demo variety: ${selectedRegion.name}`)
    return selectedRegion.id
  }
}

export interface BloomingApiResponse {
  region: string
  date: string
  ndvi_score: number
  bloom_status: string
  weather?: {
    temperature_mean_c: number
    precipitation_mm: number
  }
  satellite_image_available: boolean
  satellite_image_url?: string
}

export interface ForecastApiResponse {
  region: string
  forecast_start: string
  forecast_days: number
  predictions: BloomingApiResponse[]
}

export interface RegionInfo {
  id: string
  name: string
  lat: number
  lng: number
  threshold: number
}

// Available regions from the backend API
export const AVAILABLE_REGIONS: RegionInfo[] = [
  { id: 'japan_cherry', name: 'Japan Cherry Blossoms', lat: 35.0116, lng: 135.7681, threshold: 2000 },
  { id: 'usa_cherry_dc', name: 'USA Cherry Blossoms', lat: 38.9072, lng: -77.0369, threshold: 2000 },
  { id: 'bandung_floriculture', name: 'Bandung Floriculture', lat: -6.9175, lng: 107.6191, threshold: 1500 },
  { id: 'netherlands_tulips', name: 'Netherlands Tulips', lat: 52.3676, lng: 4.9041, threshold: 1000 },
  { id: 'france_lavender', name: 'France Lavender', lat: 43.9493, lng: 5.0514, threshold: 1500 },
  { id: 'uk_bluebells', name: 'UK Bluebells', lat: 51.5074, lng: -0.1278, threshold: 1500 },
  { id: 'california_poppies', name: 'California Poppies', lat: 34.0522, lng: -118.2437, threshold: 2000 },
  { id: 'texas_bluebonnets', name: 'Texas Bluebonnets', lat: 30.2672, lng: -97.7431, threshold: 2000 }
]

const API_BASE_URL = 'http://localhost:8000'

/**
 * Calculate distance between two coordinates in kilometers
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Map location coordinates to closest available region with variety
 */
export function mapLocationToRegion(lat: number, lng: number): string {
  // For demo purposes, add some randomness to show different regions
  const randomFactor = Math.random()
  
  // 70% chance to use closest region, 30% chance for variety
  if (randomFactor > 0.3) {
    let closestRegion = AVAILABLE_REGIONS[0]
    let minDistance = calculateDistance(lat, lng, AVAILABLE_REGIONS[0].lat, AVAILABLE_REGIONS[0].lng)
    
    for (const region of AVAILABLE_REGIONS) {
      const distance = calculateDistance(lat, lng, region.lat, region.lng)
      if (distance < minDistance) {
        minDistance = distance
        closestRegion = region
      }
    }
    
    // If distance is within threshold, use that region
    if (minDistance <= closestRegion.threshold) {
      console.log(`📍 Using closest region: ${closestRegion.name} (distance: ${minDistance.toFixed(1)}km)`)
      return closestRegion.id
    }
  }
  
  // 30% chance for variety or if no region is close enough
  // Weight regions based on latitude proximity for more realistic variety
  const weightedRegions = AVAILABLE_REGIONS.map(region => ({
    ...region,
    weight: Math.max(0.1, 1 / (1 + Math.abs(lat - region.lat) / 10))
  }))
  
  // Sort by weight and pick from top candidates
  weightedRegions.sort((a, b) => b.weight - a.weight)
  const topCandidates = weightedRegions.slice(0, 4)
  const randomIndex = Math.floor(Math.random() * topCandidates.length)
  
  const selectedRegion = topCandidates[randomIndex]
  console.log(`🎲 Using random region for variety: ${selectedRegion.name} (from ${topCandidates.map(r => r.name).join(', ')})`)
  
  return selectedRegion.id
}

/**
 * Get region display name by ID
 */
export function getRegionName(regionId: string): string {
  const region = AVAILABLE_REGIONS.find(r => r.id === regionId)
  return region?.name || regionId
}

/**
 * Fetch blooming prediction data for a specific region and date
 * Includes automatic fallback to mock data if API is unavailable
 */
export async function fetchBloomingPrediction(
  region: string, 
  date: string, 
  options: {
    includeWeather?: boolean
    includeImages?: boolean
    useSimpleModel?: boolean
  } = {}
): Promise<BloomingApiResponse> {
  try {
    const params = new URLSearchParams({
      date,
      include_weather: String(options.includeWeather ?? true),
      include_images: String(options.includeImages ?? true),
      use_simple_model: String(options.useSimpleModel ?? false)
    })
    
    const response = await fetch(`${API_BASE_URL}/predict/${region}?${params}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    console.warn(`API unavailable for region ${region}, using fallback data:`, error)
    // Return fallback data instead of throwing error
    return createFallbackBloomingResponse(region, date, options)
  }
}

/**
 * Create fallback blooming response when API is unavailable
 * Uses location-specific data for realistic variations
 */
function createFallbackBloomingResponse(
  region: string, 
  date: string, 
  options: {
    includeWeather?: boolean
    includeImages?: boolean
    useSimpleModel?: boolean
  }
): BloomingApiResponse {
  const season = getCurrentSeason()
  const ndviScore = generateLocationSpecificNDVI(region, season)
  const bloomStatus = generateLocationSpecificBloomStatus(region, ndviScore, season)
  const weather = options.includeWeather ? generateLocationSpecificWeather(region, season) : undefined
  
  return {
    region,
    date,
    ndvi_score: ndviScore,
    bloom_status: bloomStatus,
    weather,
    satellite_image_available: options.includeImages ? Math.random() > 0.3 : false,
    satellite_image_url: options.includeImages ? (Math.random() > 0.3 ? `/predict/${region}/image?date=${date}` : getVariedMockLandsatImage(region)) : undefined
  }
}

// getCurrentSeason is now imported from locationSpecificData

/**
 * Fetch forecast data for a specific region and date range
 * Includes automatic fallback to mock data if API is unavailable
 */
export async function fetchForecast(
  region: string,
  startDate: string,
  days: number = 7,
  options: {
    includeWeather?: boolean
    includeImages?: boolean
    useSimpleModel?: boolean
  } = {}
): Promise<ForecastApiResponse> {
  try {
    const params = new URLSearchParams({
      start_date: startDate,
      days: String(days),
      include_weather: String(options.includeWeather ?? true),
      include_images: String(options.includeImages ?? true),
      use_simple_model: String(options.useSimpleModel ?? false)
    })
    
    const response = await fetch(`${API_BASE_URL}/predict/${region}/forecast?${params}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    console.warn(`Forecast API unavailable for region ${region}, using fallback data:`, error)
    // Return fallback forecast data instead of throwing error
    return createFallbackForecastResponse(region, startDate, days, options)
  }
}

/**
 * Create fallback forecast response when API is unavailable
 * Uses location-specific data for realistic variations across forecast days
 */
function createFallbackForecastResponse(
  region: string,
  startDate: string,
  days: number,
  options: {
    includeWeather?: boolean
    includeImages?: boolean
    useSimpleModel?: boolean
  }
): ForecastApiResponse {
  const predictions = []
  const baseDate = new Date(startDate)
  const season = getCurrentSeason()
  
  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)
    
    // Use location-specific NDVI generation
    const ndviScore = generateLocationSpecificNDVI(region, season)
    const bloomStatus = generateLocationSpecificBloomStatus(region, ndviScore, season)
    const weather = options.includeWeather ? generateLocationSpecificWeather(region, season) : undefined
    
    predictions.push({
      region,
      date: date.toISOString().split('T')[0],
      ndvi_score: ndviScore,
      bloom_status: bloomStatus,
      weather,
      satellite_image_available: options.includeImages ? Math.random() > 0.4 : false,
      satellite_image_url: options.includeImages ? (Math.random() > 0.4 ? `/predict/${region}/image?date=${date.toISOString().split('T')[0]}` : getVariedMockLandsatImage(region)) : undefined
    })
  }
  
  return {
    region,
    forecast_start: startDate,
    forecast_days: days,
    predictions
  }
}

/**
 * Get satellite image URL for a specific region and date
 * Returns mock image URL as fallback
 */
export function getSatelliteImageUrl(region: string, date: string): string {
  return `${API_BASE_URL}/predict/${region}/image?date=${date}`
}

/**
 * Get satellite image URL with fallback to varied mock images
 * This function handles the image URL resolution consistently across the app
 */
export function getImageUrlWithFallback(imageUrl?: string, regionId?: string): string {
  if (!imageUrl) {
    // Use region-specific mock image if region is provided
    return regionId ? getVariedMockLandsatImage(regionId) : '/mock-landsat.png'
  }
  
  // If it's already a mock image, return as is
  if (imageUrl.includes('mock-landsat')) {
    return imageUrl
  }
  
  // If it's an API URL, return with full path
  if (imageUrl.startsWith('/predict/')) {
    return `${API_BASE_URL}${imageUrl}`
  }
  
  // For any other URL, return as is
  return imageUrl
}

/**
 * Check if satellite image is available for a specific region and date
 */
export async function checkSatelliteImageAvailability(region: string, date: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/predict/${region}/image/metadata?date=${date}`)
    if (!response.ok) return false
    
    const metadata = await response.json()
    return metadata.available === true
  } catch (error) {
    console.error('Error checking satellite image availability:', error)
    return false
  }
}

/**
 * Get all available regions from the API
 */
export async function getAvailableRegions(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/regions`)
    if (!response.ok) {
      throw new Error(`Failed to fetch regions: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.regions || []
  } catch (error) {
    console.error('Error fetching available regions:', error)
    return AVAILABLE_REGIONS.map(r => r.id)
  }
}

/**
 * Check API health status
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.ok
  } catch (error) {
    console.error('API health check failed:', error)
    return false
  }
}
