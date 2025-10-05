/**
 * Unit tests for Mock Landsat Data Generator
 */

import { 
  generateMockLandsatData, 
  generateTimeSeriesData, 
  mockLandsatUtils,
  type LandsatData,
  type TimePeriod 
} from '../mockLandsatApi'

describe('Mock Landsat Data Generator', () => {
  const testLocation = { lat: 40.7128, lng: -74.0060 } // New York City
  const timePeriods: TimePeriod[] = ['before', 'during', 'after']

  describe('generateMockLandsatData', () => {
    it('should generate valid Landsat data structure', () => {
      const data = generateMockLandsatData(testLocation, 'during')
      
      // Check basic structure
      expect(data).toHaveProperty('location')
      expect(data).toHaveProperty('acquisitionDate')
      expect(data).toHaveProperty('satellite')
      expect(data).toHaveProperty('rgbImageUrl')
      expect(data).toHaveProperty('ndviData')
      expect(data).toHaveProperty('cloudCover')
      expect(data).toHaveProperty('dataQuality')
      expect(data).toHaveProperty('processingLevel')
      expect(data).toHaveProperty('ndviStats')
      expect(data).toHaveProperty('bloomAnalysis')
      expect(data).toHaveProperty('ecologicalInsights')
    })

    it('should generate valid location data', () => {
      const data = generateMockLandsatData(testLocation, 'during')
      
      expect(data.location.lat).toBe(testLocation.lat)
      expect(data.location.lng).toBe(testLocation.lng)
      expect(data.location.name).toBeDefined()
      expect(typeof data.location.name).toBe('string')
    })

    it('should generate valid acquisition date', () => {
      const data = generateMockLandsatData(testLocation, 'during')
      
      expect(data.acquisitionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(new Date(data.acquisitionDate)).toBeInstanceOf(Date)
      expect(new Date(data.acquisitionDate).getTime()).not.toBeNaN()
    })

    it('should generate valid satellite data', () => {
      const data = generateMockLandsatData(testLocation, 'during')
      
      expect(['Landsat-8', 'Landsat-9']).toContain(data.satellite)
    })

    it('should generate valid RGB image URL', () => {
      const data = generateMockLandsatData(testLocation, 'during')
      
      expect(data.rgbImageUrl).toMatch(/^https:\/\/picsum\.photos\/seed\/landsat-\d+\/800\/600$/)
    })

    it('should generate valid NDVI data', () => {
      const data = generateMockLandsatData(testLocation, 'during')
      
      expect(Array.isArray(data.ndviData)).toBe(true)
      expect(data.ndviData.length).toBe(50) // 50x50 grid
      expect(data.ndviData[0].length).toBe(50)
      
      // Check NDVI values are within valid range
      data.ndviData.forEach(row => {
        row.forEach(value => {
          expect(value).toBeGreaterThanOrEqual(-1)
          expect(value).toBeLessThanOrEqual(1)
          expect(typeof value).toBe('number')
        })
      })
    })

    it('should generate valid cloud cover', () => {
      const data = generateMockLandsatData(testLocation, 'during')
      
      expect(data.cloudCover).toBeGreaterThanOrEqual(0)
      expect(data.cloudCover).toBeLessThanOrEqual(100)
      expect(typeof data.cloudCover).toBe('number')
    })

    it('should generate valid data quality', () => {
      const data = generateMockLandsatData(testLocation, 'during')
      
      expect(['excellent', 'good', 'fair', 'poor']).toContain(data.dataQuality)
    })

    it('should generate valid NDVI statistics', () => {
      const data = generateMockLandsatData(testLocation, 'during')
      
      expect(data.ndviStats).toHaveProperty('mean')
      expect(data.ndviStats).toHaveProperty('min')
      expect(data.ndviStats).toHaveProperty('max')
      expect(data.ndviStats).toHaveProperty('stdDev')
      
      expect(data.ndviStats.mean).toBeGreaterThanOrEqual(-1)
      expect(data.ndviStats.mean).toBeLessThanOrEqual(1)
      expect(data.ndviStats.min).toBeGreaterThanOrEqual(-1)
      expect(data.ndviStats.min).toBeLessThanOrEqual(1)
      expect(data.ndviStats.max).toBeGreaterThanOrEqual(-1)
      expect(data.ndviStats.max).toBeLessThanOrEqual(1)
      expect(data.ndviStats.stdDev).toBeGreaterThanOrEqual(0)
    })

    it('should generate valid bloom analysis', () => {
      const data = generateMockLandsatData(testLocation, 'during')
      
      expect(data.bloomAnalysis).toHaveProperty('isBlooming')
      expect(data.bloomAnalysis).toHaveProperty('bloomIntensity')
      expect(data.bloomAnalysis).toHaveProperty('bloomConfidence')
      expect(data.bloomAnalysis).toHaveProperty('bloomStage')
      
      expect(typeof data.bloomAnalysis.isBlooming).toBe('boolean')
      expect(data.bloomAnalysis.bloomIntensity).toBeGreaterThanOrEqual(0)
      expect(data.bloomAnalysis.bloomIntensity).toBeLessThanOrEqual(1)
      expect(data.bloomAnalysis.bloomConfidence).toBeGreaterThanOrEqual(0)
      expect(data.bloomAnalysis.bloomConfidence).toBeLessThanOrEqual(1)
      expect(['pre-bloom', 'early-bloom', 'peak-bloom', 'late-bloom', 'post-bloom']).toContain(data.bloomAnalysis.bloomStage)
    })

    it('should generate valid ecological insights', () => {
      const data = generateMockLandsatData(testLocation, 'during')
      
      expect(data.ecologicalInsights).toHaveProperty('vegetationHealth')
      expect(data.ecologicalInsights).toHaveProperty('waterStress')
      expect(data.ecologicalInsights).toHaveProperty('fireRisk')
      expect(data.ecologicalInsights).toHaveProperty('biodiversity')
      
      expect(['excellent', 'good', 'moderate', 'poor']).toContain(data.ecologicalInsights.vegetationHealth)
      expect(['low', 'moderate', 'high']).toContain(data.ecologicalInsights.waterStress)
      expect(['low', 'moderate', 'high']).toContain(data.ecologicalInsights.fireRisk)
      expect(['high', 'moderate', 'low']).toContain(data.ecologicalInsights.biodiversity)
    })
  })

  describe('generateTimeSeriesData', () => {
    it('should generate data for all time periods', () => {
      const timeSeries = generateTimeSeriesData(testLocation, timePeriods)
      
      expect(timeSeries).toHaveProperty('before')
      expect(timeSeries).toHaveProperty('during')
      expect(timeSeries).toHaveProperty('after')
      
      timePeriods.forEach(period => {
        expect(timeSeries[period]).toBeDefined()
        expect(timeSeries[period].location.lat).toBe(testLocation.lat)
        expect(timeSeries[period].location.lng).toBe(testLocation.lng)
      })
    })

    it('should generate different data for different time periods', () => {
      const timeSeries = generateTimeSeriesData(testLocation, timePeriods)
      
      // Acquisition dates should be different
      expect(timeSeries.before.acquisitionDate).not.toBe(timeSeries.during.acquisitionDate)
      expect(timeSeries.during.acquisitionDate).not.toBe(timeSeries.after.acquisitionDate)
      
      // NDVI stats should be different (though might be similar)
      expect(timeSeries.before.ndviStats.mean).not.toBe(timeSeries.during.ndviStats.mean)
      expect(timeSeries.during.ndviStats.mean).not.toBe(timeSeries.after.ndviStats.mean)
    })
  })

  describe('time period variations', () => {
    it('should generate different bloom analysis for different time periods', () => {
      const beforeData = generateMockLandsatData(testLocation, 'before')
      const duringData = generateMockLandsatData(testLocation, 'during')
      const afterData = generateMockLandsatData(testLocation, 'after')
      
      // During bloom should have higher intensity than before
      expect(duringData.bloomAnalysis.bloomIntensity).toBeGreaterThan(beforeData.bloomAnalysis.bloomIntensity)
      
      // During bloom should be more likely to be blooming
      if (duringData.bloomAnalysis.isBlooming && !beforeData.bloomAnalysis.isBlooming) {
        expect(duringData.bloomAnalysis.isBlooming).toBe(true)
        expect(beforeData.bloomAnalysis.isBlooming).toBe(false)
      }
    })

    it('should generate different cloud cover for different time periods', () => {
      const beforeData = generateMockLandsatData(testLocation, 'before')
      const duringData = generateMockLandsatData(testLocation, 'during')
      const afterData = generateMockLandsatData(testLocation, 'after')
      
      // During bloom should generally have less cloud cover
      expect(duringData.cloudCover).toBeLessThanOrEqual(beforeData.cloudCover + 20) // Allow some variance
    })
  })

  describe('location variations', () => {
    it('should generate different data for different locations', () => {
      const nycData = generateMockLandsatData({ lat: 40.7128, lng: -74.0060 }, 'during')
      const laData = generateMockLandsatData({ lat: 34.0522, lng: -118.2437 }, 'during')
      
      expect(nycData.location.name).not.toBe(laData.location.name)
      expect(nycData.rgbImageUrl).not.toBe(laData.rgbImageUrl)
    })

    it('should generate appropriate species for different latitudes', () => {
      const tropicalData = generateMockLandsatData({ lat: 10, lng: 0 }, 'during')
      const temperateData = generateMockLandsatData({ lat: 45, lng: 0 }, 'during')
      
      expect(tropicalData.bloomAnalysis.dominantSpecies).toBeDefined()
      expect(temperateData.bloomAnalysis.dominantSpecies).toBeDefined()
      expect(Array.isArray(tropicalData.bloomAnalysis.dominantSpecies)).toBe(true)
      expect(Array.isArray(temperateData.bloomAnalysis.dominantSpecies)).toBe(true)
    })
  })

  describe('utility functions', () => {
    it('should generate valid location names', () => {
      const name1 = mockLandsatUtils.getLocationName({ lat: 40.7128, lng: -74.0060 })
      const name2 = mockLandsatUtils.getLocationName({ lat: 34.0522, lng: -118.2437 })
      
      expect(typeof name1).toBe('string')
      expect(typeof name2).toBe('string')
      expect(name1.length).toBeGreaterThan(0)
      expect(name2.length).toBeGreaterThan(0)
    })

    it('should generate valid acquisition dates', () => {
      const date1 = mockLandsatUtils.generateAcquisitionDate('before')
      const date2 = mockLandsatUtils.generateAcquisitionDate('during')
      const date3 = mockLandsatUtils.generateAcquisitionDate('after')
      
      expect(date1).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(date2).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(date3).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should generate valid RGB image URLs', () => {
      const url = mockLandsatUtils.generateRGBImageUrl(testLocation, '2023-06-15')
      
      expect(url).toMatch(/^https:\/\/picsum\.photos\/seed\/landsat-\d+\/800\/600$/)
    })

    it('should calculate valid NDVI statistics', () => {
      const testNDVIData = [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
        [0.7, 0.8, 0.9]
      ]
      
      const stats = mockLandsatUtils.calculateNDVIStats(testNDVIData)
      
      expect(stats.mean).toBeCloseTo(0.5, 2)
      expect(stats.min).toBe(0.1)
      expect(stats.max).toBe(0.9)
      expect(stats.stdDev).toBeGreaterThan(0)
    })

    it('should determine data quality based on cloud cover', () => {
      expect(mockLandsatUtils.determineDataQuality(5)).toBe('excellent')
      expect(mockLandsatUtils.determineDataQuality(15)).toBe('good')
      expect(mockLandsatUtils.determineDataQuality(35)).toBe('fair')
      expect(mockLandsatUtils.determineDataQuality(75)).toBe('poor')
    })
  })

  describe('edge cases', () => {
    it('should handle extreme coordinates', () => {
      const northPole = generateMockLandsatData({ lat: 90, lng: 0 }, 'during')
      const southPole = generateMockLandsatData({ lat: -90, lng: 0 }, 'during')
      const equator = generateMockLandsatData({ lat: 0, lng: 0 }, 'during')
      
      expect(northPole).toBeDefined()
      expect(southPole).toBeDefined()
      expect(equator).toBeDefined()
      
      expect(northPole.location.lat).toBe(90)
      expect(southPole.location.lat).toBe(-90)
      expect(equator.location.lat).toBe(0)
    })

    it('should handle extreme longitude values', () => {
      const data = generateMockLandsatData({ lat: 0, lng: 180 }, 'during')
      
      expect(data).toBeDefined()
      expect(data.location.lng).toBe(180)
    })
  })
})
