/**
 * Demo script untuk menunjukkan bloom visualization system
 */

import { generateGlobalBloomData, getBloomStatistics, findPeakBloomLocations, findDormantLocations } from './bloomDataGenerator'
import { calculateBloomIntensity } from './bloomUtils'

/**
 * Demo function untuk menunjukkan bloom data pada tanggal tertentu
 */
export function demoBloomVisualization(date: Date) {
  console.log('🌍 Bloom Visualization Demo')
  console.log('📅 Date:', date.toLocaleDateString())
  console.log('=' .repeat(50))

  // Generate global bloom data
  const globalData = generateGlobalBloomData(date)
  
  // Get statistics
  const stats = getBloomStatistics(date)
  
  console.log('📊 Bloom Statistics:')
  console.log(`   Total Locations: ${stats.totalLocations}`)
  console.log(`   Active Bloom (>30%): ${stats.activeBloom}`)
  console.log(`   Peak Bloom (>70%): ${stats.peakBloom}`)
  console.log(`   Dormant (<20%): ${stats.dormant}`)
  
  console.log('\n🌱 Season Distribution:')
  Object.entries(stats.seasonDistribution).forEach(([season, count]) => {
    console.log(`   ${season}: ${count} locations`)
  })
  
  console.log('\n🌸 Phase Distribution:')
  Object.entries(stats.phaseDistribution).forEach(([phase, count]) => {
    console.log(`   ${phase}: ${count} locations`)
  })

  // Find peak bloom locations
  const peakLocations = findPeakBloomLocations(date, 0.8)
  if (peakLocations.length > 0) {
    console.log('\n🌟 Peak Bloom Locations:')
    peakLocations.forEach(location => {
      console.log(`   ${location.location}: ${(location.intensity * 100).toFixed(1)}% (${location.season})`)
    })
  }

  // Find dormant locations
  const dormantLocations = findDormantLocations(date, 0.2)
  if (dormantLocations.length > 0) {
    console.log('\n❄️ Dormant Locations:')
    dormantLocations.slice(0, 5).forEach(location => {
      console.log(`   ${location.location}: ${(location.intensity * 100).toFixed(1)}% (${location.phase})`)
    })
    if (dormantLocations.length > 5) {
      console.log(`   ... and ${dormantLocations.length - 5} more`)
    }
  }

  return {
    globalData,
    stats,
    peakLocations,
    dormantLocations
  }
}

/**
 * Demo function untuk menunjukkan perubahan bloom sepanjang tahun
 */
export function demoSeasonalChanges(locationName: string = 'Amsterdam, Netherlands', year: number = 2023) {
  console.log(`🌱 Seasonal Bloom Changes for ${locationName} (${year})`)
  console.log('=' .repeat(60))

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  months.forEach((month, index) => {
    const date = new Date(year, index, 15) // Middle of each month
    const bloom = calculateBloomIntensity(52.3676, date) // Amsterdam coordinates
    
    const intensityBar = '█'.repeat(Math.floor(bloom.intensity * 20))
    const intensityPercent = (bloom.intensity * 100).toFixed(1)
    
    console.log(`${month.padEnd(10)}: ${intensityPercent.padStart(5)}% ${intensityBar.padEnd(20)} ${bloom.phase} (${bloom.season})`)
  })
}

/**
 * Demo function untuk membandingkan bloom antar lokasi
 */
export function demoLocationComparison(date: Date) {
  console.log('🌍 Bloom Comparison Across Locations')
  console.log('📅 Date:', date.toLocaleDateString())
  console.log('=' .repeat(50))

  const locations = [
    'Amsterdam, Netherlands',
    'Tokyo, Japan',
    'Sydney, Australia',
    'São Paulo, Brazil',
    'Singapore',
    'Reykjavik, Iceland'
  ]

  locations.forEach(locationName => {
    const data = generateGlobalBloomData(date).find(d => d.location === locationName)
    if (data) {
      const intensityBar = '█'.repeat(Math.floor(data.intensity * 15))
      const intensityPercent = (data.intensity * 100).toFixed(1)
      
      console.log(`${locationName.padEnd(25)}: ${intensityPercent.padStart(5)}% ${intensityBar.padEnd(15)} ${data.phase}`)
    }
  })
}

/**
 * Demo function untuk menunjukkan efek latitude
 */
export function demoLatitudeEffect(date: Date) {
  console.log('🌍 Latitude Effect on Bloom Intensity')
  console.log('📅 Date:', date.toLocaleDateString())
  console.log('=' .repeat(50))

  const latitudes = [80, 60, 40, 20, 0, -20, -40, -60, -80]
  
  latitudes.forEach(lat => {
    const bloom = calculateBloomIntensity(lat, date)
    const intensityBar = '█'.repeat(Math.floor(bloom.intensity * 15))
    const intensityPercent = (bloom.intensity * 100).toFixed(1)
    const hemisphere = lat >= 0 ? 'N' : 'S'
    
    console.log(`${Math.abs(lat).toString().padStart(2)}°${hemisphere}.padEnd(4)}: ${intensityPercent.padStart(5)}% ${intensityBar.padEnd(15)} ${bloom.season}`)
  })
}

// Export demo functions untuk digunakan di console atau testing
export const bloomDemo = {
  visualization: demoBloomVisualization,
  seasonal: demoSeasonalChanges,
  comparison: demoLocationComparison,
  latitude: demoLatitudeEffect
}
