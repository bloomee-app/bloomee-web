/**
 * Example usage of Mock Landsat Data Generator
 * This file demonstrates how to use the mock data generator
 */

import { 
  generateMockLandsatData, 
  generateTimeSeriesData,
  type LandsatData,
  type TimePeriod 
} from './mockLandsatApi'

// Example 1: Generate single Landsat data
export function exampleSingleData() {
  const location = { lat: 40.7128, lng: -74.0060 } // New York City
  const timePeriod: TimePeriod = 'during'
  
  const landsatData = generateMockLandsatData(location, timePeriod)
  
  console.log('Single Landsat Data Example:')
  console.log('Location:', landsatData.location)
  console.log('Acquisition Date:', landsatData.acquisitionDate)
  console.log('Satellite:', landsatData.satellite)
  console.log('Cloud Cover:', landsatData.cloudCover + '%')
  console.log('Data Quality:', landsatData.dataQuality)
  console.log('NDVI Mean:', landsatData.ndviStats.mean)
  console.log('Is Blooming:', landsatData.bloomAnalysis.isBlooming)
  console.log('Bloom Intensity:', landsatData.bloomAnalysis.bloomIntensity)
  console.log('Bloom Stage:', landsatData.bloomAnalysis.bloomStage)
  console.log('Vegetation Health:', landsatData.ecologicalInsights.vegetationHealth)
  
  return landsatData
}

// Example 2: Generate time series data for comparison
export function exampleTimeSeriesData() {
  const location = { lat: 34.0522, lng: -118.2437 } // Los Angeles
  
  const timeSeries = generateTimeSeriesData(location, ['before', 'during', 'after'])
  
  console.log('\nTime Series Data Example:')
  console.log('Location:', location)
  
  Object.entries(timeSeries).forEach(([period, data]) => {
    console.log(`\n${period.toUpperCase()} Period:`)
    console.log('  Date:', data.acquisitionDate)
    console.log('  NDVI Mean:', data.ndviStats.mean)
    console.log('  Cloud Cover:', data.cloudCover + '%')
    console.log('  Is Blooming:', data.bloomAnalysis.isBlooming)
    console.log('  Bloom Intensity:', data.bloomAnalysis.bloomIntensity)
    console.log('  Bloom Stage:', data.bloomAnalysis.bloomStage)
  })
  
  return timeSeries
}

// Example 3: Generate data for multiple locations
export function exampleMultipleLocations() {
  const locations = [
    { lat: 40.7128, lng: -74.0060, name: 'New York City' },
    { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' },
    { lat: 51.5074, lng: -0.1278, name: 'London' },
    { lat: -33.8688, lng: 151.2093, name: 'Sydney' },
    { lat: 0, lng: 0, name: 'Equator' }
  ]
  
  console.log('\nMultiple Locations Example:')
  
  const results = locations.map(location => {
    const data = generateMockLandsatData(location, 'during')
    
    console.log(`\n${location.name} (${location.lat}, ${location.lng}):`)
    console.log('  Generated Name:', data.location.name)
    console.log('  NDVI Mean:', data.ndviStats.mean)
    console.log('  Vegetation Health:', data.ecologicalInsights.vegetationHealth)
    console.log('  Biodiversity:', data.ecologicalInsights.biodiversity)
    console.log('  Dominant Species:', data.bloomAnalysis.dominantSpecies?.join(', '))
    
    return { location, data }
  })
  
  return results
}

// Example 4: Validate data structure
export function exampleDataValidation() {
  const location = { lat: 37.7749, lng: -122.4194 } // San Francisco
  const data = generateMockLandsatData(location, 'during')
  
  console.log('\nData Validation Example:')
  
  // Validate NDVI data structure
  console.log('NDVI Data Structure:')
  console.log('  Grid Size:', data.ndviData.length + 'x' + data.ndviData[0].length)
  console.log('  All values in range [-1, 1]:', 
    data.ndviData.every(row => 
      row.every(value => value >= -1 && value <= 1)
    )
  )
  
  // Validate statistics consistency
  const calculatedMean = data.ndviData.flat().reduce((sum, val) => sum + val, 0) / (data.ndviData.length * data.ndviData[0].length)
  console.log('  Mean calculation matches:', Math.abs(data.ndviStats.mean - calculatedMean) < 0.001)
  
  // Validate URL format
  console.log('  RGB URL format valid:', data.rgbImageUrl.startsWith('https://picsum.photos/seed/landsat-'))
  
  // Validate date format
  console.log('  Date format valid:', /^\d{4}-\d{2}-\d{2}$/.test(data.acquisitionDate))
  
  return data
}

// Run all examples (for testing purposes)
export function runAllExamples() {
  console.log('=== Mock Landsat Data Generator Examples ===\n')
  
  const singleData = exampleSingleData()
  const timeSeriesData = exampleTimeSeriesData()
  const multipleLocationsData = exampleMultipleLocations()
  const validatedData = exampleDataValidation()
  
  console.log('\n=== All Examples Completed Successfully ===')
  
  return {
    singleData,
    timeSeriesData,
    multipleLocationsData,
    validatedData
  }
}

// Export for potential use in components
export { generateMockLandsatData, generateTimeSeriesData }
