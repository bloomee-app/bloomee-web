/**
 * Mock Landsat Data Generator
 * 
 * Generates realistic mock Landsat satellite data for development and demonstration purposes.
 * This unblocks frontend development without requiring a live API.
 */

export interface LandsatData {
  // Basic metadata
  location: {
    lat: number
    lng: number
    name?: string
  }
  acquisitionDate: string
  satellite: 'Landsat-8' | 'Landsat-9'
  
  // Image data
  rgbImageUrl: string
  ndviData: number[][] // 2D array of NDVI values (-1 to 1)
  
  // Data quality indicators
  cloudCover: number // Percentage (0-100)
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor'
  processingLevel: 'L1TP' | 'L1GT' | 'L1GS'
  
  // Analysis results
  ndviStats: {
    mean: number
    min: number
    max: number
    stdDev: number
  }
  
  // Bloom detection
  bloomAnalysis: {
    isBlooming: boolean
    bloomIntensity: number // 0-1 scale
    bloomConfidence: number // 0-1 scale
    dominantSpecies?: string[]
    bloomStage: 'pre-bloom' | 'early-bloom' | 'peak-bloom' | 'late-bloom' | 'post-bloom'
  }
  
  // Ecological insights
  ecologicalInsights: {
    vegetationHealth: 'excellent' | 'good' | 'moderate' | 'poor'
    waterStress: 'low' | 'moderate' | 'high'
    fireRisk: 'low' | 'moderate' | 'high'
    biodiversity: 'high' | 'moderate' | 'low'
  }
}

export type TimePeriod = 'before' | 'during' | 'after'

/**
 * Generate mock Landsat data for a given location and time period
 */
export function generateMockLandsatData(
  location: { lat: number; lng: number },
  timePeriod: TimePeriod = 'during'
): LandsatData {
  // Generate location name based on coordinates
  const locationName = getLocationName(location)
  
  // Generate acquisition date based on time period
  const acquisitionDate = generateAcquisitionDate(timePeriod)
  
  // Generate satellite (randomly choose between Landsat-8 and Landsat-9)
  const satellite = Math.random() > 0.5 ? 'Landsat-8' : 'Landsat-9'
  
  // Generate RGB image URL (using placeholder service)
  const rgbImageUrl = generateRGBImageUrl(location, acquisitionDate)
  
  // Generate NDVI data (2D array)
  const ndviData = generateNDVIData(location, timePeriod)
  
  // Calculate NDVI statistics
  const ndviStats = calculateNDVIStats(ndviData)
  
  // Generate cloud cover (0-100%)
  const cloudCover = generateCloudCover(timePeriod)
  
  // Determine data quality based on cloud cover
  const dataQuality = determineDataQuality(cloudCover)
  
  // Generate bloom analysis
  const bloomAnalysis = generateBloomAnalysis(ndviData, timePeriod, location)
  
  // Generate ecological insights
  const ecologicalInsights = generateEcologicalInsights(ndviData, timePeriod, location)
  
  return {
    location: {
      ...location,
      name: locationName
    },
    acquisitionDate,
    satellite,
    rgbImageUrl,
    ndviData,
    cloudCover,
    dataQuality,
    processingLevel: 'L1TP',
    ndviStats,
    bloomAnalysis,
    ecologicalInsights
  }
}

/**
 * Generate multiple time periods for comparison
 */
export function generateTimeSeriesData(
  location: { lat: number; lng: number },
  periods: TimePeriod[] = ['before', 'during', 'after']
): Record<TimePeriod, LandsatData> {
  const result = {} as Record<TimePeriod, LandsatData>
  
  for (const period of periods) {
    result[period] = generateMockLandsatData(location, period)
  }
  
  return result
}

// Helper functions

function getLocationName(location: { lat: number; lng: number }): string {
  // Simple location naming based on coordinates
  const { lat, lng } = location
  
  if (lat > 40 && lng > -80 && lng < -70) return 'Northeast USA'
  if (lat > 30 && lat < 40 && lng > -120 && lng < -110) return 'California, USA'
  if (lat > 50 && lat < 60 && lng > 0 && lng < 10) return 'Netherlands'
  if (lat > 35 && lat < 45 && lng > 25 && lng < 35) return 'Greece'
  if (lat > -40 && lat < -30 && lng > 140 && lng < 150) return 'Australia'
  if (lat > 0 && lat < 10 && lng > 100 && lng < 110) return 'Indonesia'
  if (lat > 20 && lat < 30 && lng > 70 && lng < 80) return 'India'
  if (lat > -20 && lat < -10 && lng > -50 && lng < -40) return 'Brazil'
  
  return `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`
}

function generateAcquisitionDate(timePeriod: TimePeriod): string {
  const now = new Date()
  const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (timePeriod) {
    case 'before':
      // 2-3 months before
      baseDate.setMonth(baseDate.getMonth() - 2 - Math.floor(Math.random() * 2))
      break
    case 'during':
      // Current time (within last month)
      baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 30))
      break
    case 'after':
      // 1-2 months after
      baseDate.setMonth(baseDate.getMonth() + 1 + Math.floor(Math.random() * 2))
      break
  }
  
  return baseDate.toISOString().split('T')[0]
}

function generateRGBImageUrl(
  location: { lat: number; lng: number },
  date: string
): string {
  // Use placeholder service with location-based parameters
  const { lat, lng } = location
  const seed = Math.abs(lat * 1000 + lng * 1000) % 1000000
  
  return `https://picsum.photos/seed/landsat-${seed}/800/600`
}

function generateNDVIData(
  location: { lat: number; lng: number },
  timePeriod: TimePeriod
): number[][] {
  const size = 50 // 50x50 grid
  const data: number[][] = []
  
  // Base NDVI values based on location and time period
  const baseNDVI = getBaseNDVI(location, timePeriod)
  const variation = getNDVIVariation(timePeriod)
  
  for (let i = 0; i < size; i++) {
    const row: number[] = []
    for (let j = 0; j < size; j++) {
      // Add some spatial variation
      const spatialVariation = (Math.sin(i * 0.2) + Math.cos(j * 0.2)) * 0.1
      const randomVariation = (Math.random() - 0.5) * variation
      
      let ndvi = baseNDVI + spatialVariation + randomVariation
      
      // Clamp to valid NDVI range (-1 to 1)
      ndvi = Math.max(-1, Math.min(1, ndvi))
      
      row.push(parseFloat(ndvi.toFixed(3)))
    }
    data.push(row)
  }
  
  return data
}

function getBaseNDVI(location: { lat: number; lng: number }, timePeriod: TimePeriod): number {
  const { lat, lng } = location
  
  // Base NDVI varies by location (latitude affects vegetation)
  let baseNDVI = 0.3 + (Math.abs(lat) / 90) * 0.4 // More vegetation near equator
  
  // Adjust for time period
  switch (timePeriod) {
    case 'before':
      baseNDVI *= 0.7 // Less vegetation before bloom
      break
    case 'during':
      baseNDVI *= 1.2 // More vegetation during bloom
      break
    case 'after':
      baseNDVI *= 0.9 // Slightly less after bloom
      break
  }
  
  return Math.max(0.1, Math.min(0.8, baseNDVI))
}

function getNDVIVariation(timePeriod: TimePeriod): number {
  switch (timePeriod) {
    case 'before':
      return 0.15 // More uniform before bloom
    case 'during':
      return 0.25 // More variation during bloom
    case 'after':
      return 0.20 // Moderate variation after bloom
  }
}

function calculateNDVIStats(ndviData: number[][]): LandsatData['ndviStats'] {
  const flatData = ndviData.flat()
  const mean = flatData.reduce((sum, val) => sum + val, 0) / flatData.length
  const min = Math.min(...flatData)
  const max = Math.max(...flatData)
  
  const variance = flatData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / flatData.length
  const stdDev = Math.sqrt(variance)
  
  return {
    mean: parseFloat(mean.toFixed(3)),
    min: parseFloat(min.toFixed(3)),
    max: parseFloat(max.toFixed(3)),
    stdDev: parseFloat(stdDev.toFixed(3))
  }
}

function generateCloudCover(timePeriod: TimePeriod): number {
  // Cloud cover varies by season and time period
  const baseCloudCover = 20 + Math.random() * 40 // 20-60% base
  
  switch (timePeriod) {
    case 'before':
      return Math.min(100, baseCloudCover + Math.random() * 20) // Slightly more clouds
    case 'during':
      return Math.max(0, baseCloudCover - Math.random() * 15) // Clearer during bloom
    case 'after':
      return baseCloudCover + Math.random() * 10 // Moderate clouds
  }
}

function determineDataQuality(cloudCover: number): LandsatData['dataQuality'] {
  if (cloudCover < 10) return 'excellent'
  if (cloudCover < 25) return 'good'
  if (cloudCover < 50) return 'fair'
  return 'poor'
}

function generateBloomAnalysis(
  ndviData: number[][],
  timePeriod: TimePeriod,
  location: { lat: number; lng: number }
): LandsatData['bloomAnalysis'] {
  const ndviStats = calculateNDVIStats(ndviData)
  const { lat } = location
  
  // Determine if blooming based on NDVI and time period
  let isBlooming = false
  let bloomIntensity = 0
  let bloomConfidence = 0.5
  let bloomStage: LandsatData['bloomAnalysis']['bloomStage'] = 'pre-bloom'
  
  switch (timePeriod) {
    case 'before':
      isBlooming = false
      bloomIntensity = 0.1 + Math.random() * 0.2
      bloomConfidence = 0.7
      bloomStage = 'pre-bloom'
      break
    case 'during':
      isBlooming = ndviStats.mean > 0.4
      bloomIntensity = 0.6 + Math.random() * 0.4
      bloomConfidence = 0.8
      bloomStage = Math.random() > 0.5 ? 'early-bloom' : 'peak-bloom'
      break
    case 'after':
      isBlooming = ndviStats.mean > 0.3
      bloomIntensity = 0.2 + Math.random() * 0.3
      bloomConfidence = 0.6
      bloomStage = Math.random() > 0.5 ? 'late-bloom' : 'post-bloom'
      break
  }
  
  // Generate dominant species based on location
  const dominantSpecies = generateDominantSpecies(location)
  
  return {
    isBlooming,
    bloomIntensity: parseFloat(bloomIntensity.toFixed(2)),
    bloomConfidence: parseFloat(bloomConfidence.toFixed(2)),
    dominantSpecies,
    bloomStage
  }
}

function generateDominantSpecies(location: { lat: number; lng: number }): string[] {
  const { lat, lng } = location
  
  // Species vary by geographic region
  if (lat > 40) {
    return ['Oak', 'Maple', 'Pine', 'Birch']
  } else if (lat > 20) {
    return ['Eucalyptus', 'Acacia', 'Olive', 'Cypress']
  } else if (lat > 0) {
    return ['Mangrove', 'Palm', 'Bamboo', 'Tropical Hardwood']
  } else {
    return ['Eucalyptus', 'Acacia', 'Baobab', 'Savanna Grass']
  }
}

function generateEcologicalInsights(
  ndviData: number[][],
  timePeriod: TimePeriod,
  location: { lat: number; lng: number }
): LandsatData['ecologicalInsights'] {
  const ndviStats = calculateNDVIStats(ndviData)
  const { lat } = location
  
  // Determine vegetation health based on NDVI
  let vegetationHealth: LandsatData['ecologicalInsights']['vegetationHealth']
  if (ndviStats.mean > 0.6) vegetationHealth = 'excellent'
  else if (ndviStats.mean > 0.4) vegetationHealth = 'good'
  else if (ndviStats.mean > 0.2) vegetationHealth = 'moderate'
  else vegetationHealth = 'poor'
  
  // Water stress (inverse relationship with NDVI)
  let waterStress: LandsatData['ecologicalInsights']['waterStress']
  if (ndviStats.mean > 0.5) waterStress = 'low'
  else if (ndviStats.mean > 0.3) waterStress = 'moderate'
  else waterStress = 'high'
  
  // Fire risk (higher in dry areas with low NDVI)
  let fireRisk: LandsatData['ecologicalInsights']['fireRisk']
  if (ndviStats.mean > 0.4) fireRisk = 'low'
  else if (ndviStats.mean > 0.2) fireRisk = 'moderate'
  else fireRisk = 'high'
  
  // Biodiversity (higher in tropical regions)
  let biodiversity: LandsatData['ecologicalInsights']['biodiversity']
  if (Math.abs(lat) < 20) biodiversity = 'high'
  else if (Math.abs(lat) < 40) biodiversity = 'moderate'
  else biodiversity = 'low'
  
  return {
    vegetationHealth,
    waterStress,
    fireRisk,
    biodiversity
  }
}

// Export utility functions for testing
export const mockLandsatUtils = {
  getLocationName,
  generateAcquisitionDate,
  generateRGBImageUrl,
  generateNDVIData,
  calculateNDVIStats,
  generateCloudCover,
  determineDataQuality,
  generateBloomAnalysis,
  generateEcologicalInsights
}
