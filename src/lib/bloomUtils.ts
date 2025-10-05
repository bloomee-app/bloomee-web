/**
 * Bloom utilities for calculating seasonal bloom patterns based on date and latitude
 */

export interface BloomIntensity {
  intensity: number // 0-1, where 1 is peak bloom
  season: 'spring' | 'summer' | 'fall' | 'winter'
  phase: 'pre-bloom' | 'bloom' | 'post-bloom' | 'dormant'
}

/**
 * Calculate the day of year (1-365/366)
 */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Calculate bloom intensity based on latitude and date
 * This simulates realistic seasonal bloom patterns for different regions
 */
export function calculateBloomIntensity(latitude: number, date: Date): BloomIntensity {
  const dayOfYear = getDayOfYear(date)
  const absLatitude = Math.abs(latitude)
  
  // Determine hemisphere
  const isNorthern = latitude >= 0
  
  // Base seasonal pattern (for northern hemisphere)
  let season: 'spring' | 'summer' | 'fall' | 'winter'
  let phase: 'pre-bloom' | 'bloom' | 'post-bloom' | 'dormant'
  let intensity: number
  
  if (isNorthern) {
    // Northern Hemisphere patterns
    if (dayOfYear >= 60 && dayOfYear < 150) { // March-May
      season = 'spring'
      const springProgress = (dayOfYear - 60) / 90
      if (springProgress < 0.3) {
        phase = 'pre-bloom'
        intensity = springProgress / 0.3 * 0.3
      } else if (springProgress < 0.7) {
        phase = 'bloom'
        intensity = 0.3 + (springProgress - 0.3) / 0.4 * 0.7
      } else {
        phase = 'post-bloom'
        intensity = 1.0 - (springProgress - 0.7) / 0.3 * 0.5
      }
    } else if (dayOfYear >= 150 && dayOfYear < 240) { // June-August
      season = 'summer'
      const summerProgress = (dayOfYear - 150) / 90
      if (summerProgress < 0.2) {
        phase = 'bloom'
        intensity = 0.8 + summerProgress / 0.2 * 0.2
      } else if (summerProgress < 0.8) {
        phase = 'bloom'
        intensity = 1.0
      } else {
        phase = 'post-bloom'
        intensity = 1.0 - (summerProgress - 0.8) / 0.2 * 0.3
      }
    } else if (dayOfYear >= 240 && dayOfYear < 330) { // September-November
      season = 'fall'
      const fallProgress = (dayOfYear - 240) / 90
      if (fallProgress < 0.4) {
        phase = 'post-bloom'
        intensity = 0.7 - fallProgress / 0.4 * 0.4
      } else {
        phase = 'dormant'
        intensity = 0.3 - (fallProgress - 0.4) / 0.6 * 0.3
      }
    } else { // December-February
      season = 'winter'
      phase = 'dormant'
      intensity = Math.max(0, 0.1 - Math.abs(dayOfYear - 15) / 45 * 0.1)
    }
  } else {
    // Southern Hemisphere patterns (shifted by 6 months)
    const shiftedDay = (dayOfYear + 183) % 365
    
    if (shiftedDay >= 60 && shiftedDay < 150) { // September-November
      season = 'spring'
      const springProgress = (shiftedDay - 60) / 90
      if (springProgress < 0.3) {
        phase = 'pre-bloom'
        intensity = springProgress / 0.3 * 0.3
      } else if (springProgress < 0.7) {
        phase = 'bloom'
        intensity = 0.3 + (springProgress - 0.3) / 0.4 * 0.7
      } else {
        phase = 'post-bloom'
        intensity = 1.0 - (springProgress - 0.7) / 0.3 * 0.5
      }
    } else if (shiftedDay >= 150 && shiftedDay < 240) { // December-February
      season = 'summer'
      const summerProgress = (shiftedDay - 150) / 90
      if (summerProgress < 0.2) {
        phase = 'bloom'
        intensity = 0.8 + summerProgress / 0.2 * 0.2
      } else if (summerProgress < 0.8) {
        phase = 'bloom'
        intensity = 1.0
      } else {
        phase = 'post-bloom'
        intensity = 1.0 - (summerProgress - 0.8) / 0.2 * 0.3
      }
    } else if (shiftedDay >= 240 && shiftedDay < 330) { // March-May
      season = 'fall'
      const fallProgress = (shiftedDay - 240) / 90
      if (fallProgress < 0.4) {
        phase = 'post-bloom'
        intensity = 0.7 - fallProgress / 0.4 * 0.4
      } else {
        phase = 'dormant'
        intensity = 0.3 - (fallProgress - 0.4) / 0.6 * 0.3
      }
    } else { // June-August
      season = 'winter'
      phase = 'dormant'
      intensity = Math.max(0, 0.1 - Math.abs(shiftedDay - 15) / 45 * 0.1)
    }
  }
  
  // Adjust intensity based on latitude (tropical vs polar regions)
  const latitudeFactor = calculateLatitudeFactor(absLatitude)
  intensity *= latitudeFactor
  
  return {
    intensity: Math.max(0, Math.min(1, intensity)),
    season,
    phase
  }
}

/**
 * Calculate latitude-based bloom factor
 * Tropical regions have more consistent bloom, polar regions more seasonal
 */
function calculateLatitudeFactor(latitude: number): number {
  if (latitude < 10) {
    // Tropical regions - consistent bloom throughout year
    return 0.8 + Math.random() * 0.2
  } else if (latitude < 30) {
    // Subtropical regions - moderate seasonal variation
    return 0.7 + Math.random() * 0.3
  } else if (latitude < 50) {
    // Temperate regions - strong seasonal variation
    return 0.6 + Math.random() * 0.4
  } else if (latitude < 70) {
    // Boreal regions - very seasonal
    return 0.3 + Math.random() * 0.4
  } else {
    // Polar regions - minimal bloom
    return 0.1 + Math.random() * 0.2
  }
}

/**
 * Generate bloom data for a grid of coordinates
 */
export function generateBloomGrid(
  startLat: number,
  endLat: number,
  startLng: number,
  endLng: number,
  resolution: number,
  date: Date
): Array<{ lat: number; lng: number; bloom: BloomIntensity }> {
  const data: Array<{ lat: number; lng: number; bloom: BloomIntensity }> = []
  
  const latStep = (endLat - startLat) / resolution
  const lngStep = (endLng - startLng) / resolution
  
  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const lat = startLat + i * latStep
      const lng = startLng + j * lngStep
      const bloom = calculateBloomIntensity(lat, date)
      
      data.push({ lat, lng, bloom })
    }
  }
  
  return data
}

/**
 * Convert 3D point to latitude/longitude
 */
export function pointToLatLng(point: { x: number; y: number; z: number }): { lat: number; lng: number } {
  const lat = Math.asin(point.y) * (180 / Math.PI)
  const lng = Math.atan2(point.x, point.z) * (180 / Math.PI)
  return { lat, lng }
}

/**
 * Convert latitude/longitude to 3D point on unit sphere
 */
export function latLngToPoint(lat: number, lng: number): { x: number; y: number; z: number } {
  const phi = (lat * Math.PI) / 180
  const theta = (lng * Math.PI) / 180
  
  return {
    x: Math.cos(phi) * Math.sin(theta),
    y: Math.sin(phi),
    z: Math.cos(phi) * Math.cos(theta)
  }
}
