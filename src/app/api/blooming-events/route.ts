import { NextRequest, NextResponse } from 'next/server'
import {
  BloomingApiResponse,
  ApiErrorResponse,
  LocationInfo,
  YearlyBloomingData,
  BloomingEvent
} from '@/types/landsat'

// Mock data generator untuk testing
function generateMockBloomingData(lat: number, lng: number): BloomingApiResponse['data'] {
  // Determine biome based on coordinates (simplified)
  let biome = 'unknown'
  let locationName = 'Unknown Location'

  if (lat > 23.5 && lat < 66.5) {
    biome = 'temperate_forest'
    locationName = 'Temperate Forest Region'
  } else if (lat > -23.5 && lat < 23.5) {
    biome = 'tropical_forest'
    locationName = 'Tropical Forest Region'
  } else if (Math.abs(lat) > 66.5) {
    biome = 'tundra'
    locationName = 'Arctic Region'
  } else {
    biome = 'grassland'
    locationName = 'Grassland Region'
  }

  // Generate 5 years of mock data
  const temporal_data: YearlyBloomingData[] = []

  for (let year = 2020; year <= 2024; year++) {
    const yearData: YearlyBloomingData = {
      year,
      season: year % 2 === 0 ? 'spring' : 'summer',
      month: year % 2 === 0 ? 4 : 7,
      blooming_events: [],
      summary: {
        total_blooming_days: 0,
        avg_intensity: 0,
        dominant_species: '',
        ecological_insights: ''
      }
    }

    // Generate 1-3 blooming events per year
    const numEvents = Math.floor(Math.random() * 3) + 1

    for (let i = 0; i < numEvents; i++) {
      const event: BloomingEvent = {
        start_date: `${year}-0${(i + 1) * 2}-15`,
        end_date: `${year}-0${(i + 1) * 2 + 1}-10`,
        peak_date: `${year}-0${(i + 1) * 2 + 1}-01`,
        intensity: Math.random() * 0.4 + 0.6, // 0.6-1.0
        confidence: Math.random() * 0.2 + 0.8, // 0.8-1.0
        species: ['Quercus rubra', 'Acer saccharum', 'Betula papyrifera'],
        ndvi_avg: Math.random() * 0.3 + 0.6, // 0.6-0.9
        evi_avg: Math.random() * 0.2 + 0.5,  // 0.5-0.7
        weather_correlation: {
          temperature_avg: Math.random() * 10 + 10, // 10-20°C
          precipitation_total: Math.random() * 50 + 50 // 50-100mm
        }
      }

      yearData.blooming_events.push(event)
    }

    // Calculate summary
    const totalDays = yearData.blooming_events.reduce((sum, event) => {
      const start = new Date(event.start_date)
      const end = new Date(event.end_date)
      return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }, 0)

    const avgIntensity = yearData.blooming_events.reduce((sum, event) => sum + event.intensity, 0) / yearData.blooming_events.length

    yearData.summary = {
      total_blooming_days: totalDays,
      avg_intensity: avgIntensity,
      dominant_species: yearData.blooming_events[0]?.species[0] || 'Unknown',
      ecological_insights: `Strong blooming observed in ${year} with ${numEvents} distinct events.`
    }

    temporal_data.push(yearData)
  }

  return {
    location: {
      lat,
      lng,
      name: locationName,
      biome
    },
    temporal_data,
    trends: {
      blooming_advance_days_per_decade: -2.5,
      intensity_trend: '+0.03/year',
      species_composition_change: 'Stable with slight increase in diversity'
    },
    metadata: {
      data_sources: ['Landsat 8', 'Landsat 9', 'Mock Data'],
      processing_model: 'Mock ML Model v1.0',
      last_updated: new Date().toISOString(),
      data_quality: 'medium'
    }
  }
}

// Input validation helper
function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

export async function GET(request: NextRequest): Promise<NextResponse<BloomingApiResponse | ApiErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const latitude = parseFloat(searchParams.get('latitude') || '')
    const longitude = parseFloat(searchParams.get('longitude') || '')

    // Validate input
    if (isNaN(latitude) || isNaN(longitude) || !validateCoordinates(latitude, longitude)) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_COORDINATES',
          message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
        } as ApiErrorResponse,
        { status: 400 }
      )
    }

    // Generate mock data
    const mockData = generateMockBloomingData(latitude, longitude)

    return NextResponse.json({
      success: true,
      data: mockData
    })

  } catch (error) {
    console.error('Error in blooming-events API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'PROCESSING_ERROR',
        message: 'Error processing Landsat data for the requested location'
      } as ApiErrorResponse,
      { status: 500 }
    )
  }
}
