import { NextRequest, NextResponse } from 'next/server'
import {
  BloomingApiResponse,
  ApiErrorResponse,
  LocationInfo,
  YearlyBloomingData,
  BloomingEvent
} from '@/types/landsat'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

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

  // Generate ecological data based on biome and coordinates
  const ecologicalData = generateEcologicalData(lat, lng, biome)

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
    ecological_data: ecologicalData,
    metadata: {
      data_sources: ['Landsat 8', 'Landsat 9', 'Mock Data'],
      processing_model: 'Mock ML Model v1.0',
      last_updated: new Date().toISOString(),
      data_quality: 'medium'
    }
  }
}

// Generate ecological data based on location and biome
function generateEcologicalData(lat: number, lng: number, biome: string) {
  // Base ecological data by biome
  const biomeData = {
    temperate_forest: {
      biome: {
        type: 'Temperate Deciduous Forest',
        description: 'Mixed deciduous forest with seasonal leaf drop and diverse understory vegetation.',
        threats: ['Deforestation', 'Climate Change', 'Invasive Species'],
        conservationStatus: 'threatened' as const
      },
      biodiversity: {
        speciesCount: Math.floor(Math.random() * 200) + 300,
        endemicSpecies: Math.floor(Math.random() * 20) + 15,
        diversityIndex: Math.random() * 0.5 + 2.5,
        trend: 'stable' as const
      },
      climateChange: {
        temperatureChange: Math.random() * 2 - 1,
        precipitationChange: Math.random() * 20 - 10,
        impactLevel: 'medium' as const,
        adaptationMeasures: [
          'Assisted migration of tree species',
          'Enhanced forest connectivity',
          'Climate-resilient reforestation'
        ]
      },
      conservation: {
        priority: 'high' as const,
        protectedArea: Math.random() > 0.3,
        threats: ['Urban Development', 'Agriculture Expansion', 'Climate Change'],
        recommendations: [
          'Establish wildlife corridors',
          'Implement sustainable logging practices',
          'Monitor invasive species populations'
        ]
      }
    },
    tropical_forest: {
      biome: {
        type: 'Tropical Rainforest',
        description: 'High biodiversity rainforest with year-round growing season and complex canopy structure.',
        threats: ['Deforestation', 'Mining', 'Agriculture', 'Climate Change'],
        conservationStatus: 'critical' as const
      },
      biodiversity: {
        speciesCount: Math.floor(Math.random() * 500) + 800,
        endemicSpecies: Math.floor(Math.random() * 100) + 50,
        diversityIndex: Math.random() * 0.8 + 3.0,
        trend: 'decreasing' as const
      },
      climateChange: {
        temperatureChange: Math.random() * 3 - 0.5,
        precipitationChange: Math.random() * 30 - 15,
        impactLevel: 'high' as const,
        adaptationMeasures: [
          'Protect intact forest corridors',
          'Restore degraded areas',
          'Implement REDD+ programs'
        ]
      },
      conservation: {
        priority: 'critical' as const,
        protectedArea: Math.random() > 0.5,
        threats: ['Deforestation', 'Mining', 'Agriculture', 'Climate Change'],
        recommendations: [
          'Strengthen protected area networks',
          'Promote sustainable agriculture',
          'Support indigenous land rights'
        ]
      }
    },
    tundra: {
      biome: {
        type: 'Arctic Tundra',
        description: 'Cold, treeless biome with permafrost and short growing seasons supporting hardy vegetation.',
        threats: ['Climate Change', 'Oil/Gas Development', 'Permafrost Thaw'],
        conservationStatus: 'threatened' as const
      },
      biodiversity: {
        speciesCount: Math.floor(Math.random() * 50) + 30,
        endemicSpecies: Math.floor(Math.random() * 10) + 5,
        diversityIndex: Math.random() * 0.3 + 1.0,
        trend: 'decreasing' as const
      },
      climateChange: {
        temperatureChange: Math.random() * 4 + 1,
        precipitationChange: Math.random() * 40 - 20,
        impactLevel: 'high' as const,
        adaptationMeasures: [
          'Monitor permafrost conditions',
          'Protect migratory routes',
          'Manage development impacts'
        ]
      },
      conservation: {
        priority: 'high' as const,
        protectedArea: Math.random() > 0.2,
        threats: ['Climate Change', 'Oil/Gas Development', 'Permafrost Thaw'],
        recommendations: [
          'Establish climate monitoring networks',
          'Limit industrial development',
          'Protect critical habitats'
        ]
      }
    },
    grassland: {
      biome: {
        type: 'Temperate Grassland',
        description: 'Open grassland ecosystems with seasonal precipitation supporting diverse grass species.',
        threats: ['Agriculture', 'Overgrazing', 'Urban Development', 'Climate Change'],
        conservationStatus: 'threatened' as const
      },
      biodiversity: {
        speciesCount: Math.floor(Math.random() * 150) + 200,
        endemicSpecies: Math.floor(Math.random() * 30) + 10,
        diversityIndex: Math.random() * 0.6 + 2.0,
        trend: 'stable' as const
      },
      climateChange: {
        temperatureChange: Math.random() * 2.5 - 0.5,
        precipitationChange: Math.random() * 25 - 12,
        impactLevel: 'medium' as const,
        adaptationMeasures: [
          'Sustainable grazing practices',
          'Restore native grasslands',
          'Implement fire management'
        ]
      },
      conservation: {
        priority: 'medium' as const,
        protectedArea: Math.random() > 0.4,
        threats: ['Agriculture', 'Overgrazing', 'Urban Development'],
        recommendations: [
          'Promote rotational grazing',
          'Restore native species',
          'Establish grassland reserves'
        ]
      }
    }
  }

  // Get base data for the biome
  const baseData = biomeData[biome as keyof typeof biomeData] || biomeData.grassland

  // Add some location-based variation
  const latVariation = Math.abs(lat) / 90
  const lngVariation = Math.abs(lng) / 180

  return {
    ...baseData,
    biodiversity: {
      ...baseData.biodiversity,
      speciesCount: Math.floor(baseData.biodiversity.speciesCount * (0.8 + latVariation * 0.4)),
      endemicSpecies: Math.floor(baseData.biodiversity.endemicSpecies * (0.9 + lngVariation * 0.2))
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
