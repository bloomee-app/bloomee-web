/**
 * Location-specific mock data generator
 * Provides realistic and varied mock data based on different regions
 */

export interface LocationSpecificData {
  region: string
  biome: string
  climate: string
  typicalSpecies: string[]
  bloomSeasons: string[]
  ndviRange: { min: number; max: number }
  weatherPatterns: {
    temperature: { min: number; max: number }
    precipitation: { min: number; max: number }
  }
  ecologicalCharacteristics: {
    biodiversity: 'high' | 'moderate' | 'low'
    vegetationDensity: 'dense' | 'moderate' | 'sparse'
    waterAvailability: 'abundant' | 'moderate' | 'limited'
  }
}

// Location-specific data configurations
export const LOCATION_DATA: Record<string, LocationSpecificData> = {
  'japan_cherry': {
    region: 'Japan Cherry Blossoms',
    biome: 'Temperate Deciduous Forest',
    climate: 'Humid Subtropical',
    typicalSpecies: ['Sakura (Cherry Blossom)', 'Japanese Maple', 'Bamboo', 'Pine'],
    bloomSeasons: ['spring'],
    ndviRange: { min: 0.3, max: 0.8 },
    weatherPatterns: {
      temperature: { min: 5, max: 25 },
      precipitation: { min: 50, max: 200 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'high',
      vegetationDensity: 'dense',
      waterAvailability: 'abundant'
    }
  },
  'usa_cherry_dc': {
    region: 'USA Cherry Blossoms',
    biome: 'Temperate Deciduous Forest',
    climate: 'Humid Continental',
    typicalSpecies: ['Cherry Blossom', 'Dogwood', 'Red Maple', 'Oak'],
    bloomSeasons: ['spring'],
    ndviRange: { min: 0.2, max: 0.7 },
    weatherPatterns: {
      temperature: { min: -5, max: 30 },
      precipitation: { min: 40, max: 150 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'moderate',
      vegetationDensity: 'moderate',
      waterAvailability: 'moderate'
    }
  },
  'bandung_floriculture': {
    region: 'Bandung Floriculture',
    biome: 'Tropical Highland',
    climate: 'Tropical Highland',
    typicalSpecies: ['Orchids', 'Hibiscus', 'Frangipani', 'Bougainvillea'],
    bloomSeasons: ['spring', 'summer', 'fall'],
    ndviRange: { min: 0.5, max: 0.9 },
    weatherPatterns: {
      temperature: { min: 18, max: 28 },
      precipitation: { min: 100, max: 300 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'high',
      vegetationDensity: 'dense',
      waterAvailability: 'abundant'
    }
  },
  'netherlands_tulips': {
    region: 'Netherlands Tulips',
    biome: 'Temperate Grassland',
    climate: 'Oceanic',
    typicalSpecies: ['Tulips', 'Daffodils', 'Hyacinth', 'Crocus'],
    bloomSeasons: ['spring'],
    ndviRange: { min: 0.4, max: 0.8 },
    weatherPatterns: {
      temperature: { min: 2, max: 20 },
      precipitation: { min: 30, max: 100 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'moderate',
      vegetationDensity: 'moderate',
      waterAvailability: 'abundant'
    }
  },
  'france_lavender': {
    region: 'France Lavender',
    biome: 'Mediterranean Scrub',
    climate: 'Mediterranean',
    typicalSpecies: ['Lavender', 'Rosemary', 'Thyme', 'Olive'],
    bloomSeasons: ['summer'],
    ndviRange: { min: 0.3, max: 0.7 },
    weatherPatterns: {
      temperature: { min: 8, max: 35 },
      precipitation: { min: 20, max: 80 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'moderate',
      vegetationDensity: 'sparse',
      waterAvailability: 'limited'
    }
  },
  'uk_bluebells': {
    region: 'UK Bluebells',
    biome: 'Temperate Deciduous Forest',
    climate: 'Oceanic',
    typicalSpecies: ['Bluebells', 'Primroses', 'Wood Anemone', 'Beech'],
    bloomSeasons: ['spring'],
    ndviRange: { min: 0.4, max: 0.8 },
    weatherPatterns: {
      temperature: { min: 3, max: 22 },
      precipitation: { min: 60, max: 120 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'high',
      vegetationDensity: 'dense',
      waterAvailability: 'abundant'
    }
  },
  'california_poppies': {
    region: 'California Poppies',
    biome: 'Mediterranean Scrub',
    climate: 'Mediterranean',
    typicalSpecies: ['California Poppy', 'Sagebrush', 'Oak', 'Manzanita'],
    bloomSeasons: ['spring'],
    ndviRange: { min: 0.2, max: 0.6 },
    weatherPatterns: {
      temperature: { min: 10, max: 32 },
      precipitation: { min: 15, max: 60 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'moderate',
      vegetationDensity: 'sparse',
      waterAvailability: 'limited'
    }
  },
  'texas_bluebonnets': {
    region: 'Texas Bluebonnets',
    biome: 'Temperate Grassland',
    climate: 'Humid Subtropical',
    typicalSpecies: ['Bluebonnets', 'Indian Paintbrush', 'Prickly Pear', 'Mesquite'],
    bloomSeasons: ['spring'],
    ndviRange: { min: 0.3, max: 0.7 },
    weatherPatterns: {
      temperature: { min: 8, max: 35 },
      precipitation: { min: 25, max: 120 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'moderate',
      vegetationDensity: 'sparse',
      waterAvailability: 'moderate'
    }
  },
  // Additional regions for better global coverage
  'south_africa_protea': {
    region: 'South Africa Protea',
    biome: 'Fynbos',
    climate: 'Mediterranean',
    typicalSpecies: ['Protea', 'Erica', 'Restio', 'Leucadendron'],
    bloomSeasons: ['winter', 'spring'],
    ndviRange: { min: 0.4, max: 0.8 },
    weatherPatterns: {
      temperature: { min: 5, max: 25 },
      precipitation: { min: 20, max: 80 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'high',
      vegetationDensity: 'moderate',
      waterAvailability: 'moderate'
    }
  },
  'morocco_roses': {
    region: 'Morocco Roses',
    biome: 'Desert Scrub',
    climate: 'Arid',
    typicalSpecies: ['Damask Rose', 'Cactus', 'Aloe', 'Date Palm'],
    bloomSeasons: ['spring'],
    ndviRange: { min: 0.2, max: 0.6 },
    weatherPatterns: {
      temperature: { min: 10, max: 40 },
      precipitation: { min: 10, max: 50 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'low',
      vegetationDensity: 'sparse',
      waterAvailability: 'limited'
    }
  },
  'kenya_wildflowers': {
    region: 'Kenya Wildflowers',
    biome: 'Savanna',
    climate: 'Tropical Savanna',
    typicalSpecies: ['Acacia', 'Baobab', 'Wildflowers', 'Grasses'],
    bloomSeasons: ['spring', 'summer'],
    ndviRange: { min: 0.3, max: 0.8 },
    weatherPatterns: {
      temperature: { min: 15, max: 35 },
      precipitation: { min: 30, max: 150 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'high',
      vegetationDensity: 'moderate',
      waterAvailability: 'moderate'
    }
  },
  'australia_wildflowers': {
    region: 'Australia Wildflowers',
    biome: 'Arid Scrub',
    climate: 'Arid',
    typicalSpecies: ['Kangaroo Paw', 'Wattle', 'Eucalyptus', 'Wildflowers'],
    bloomSeasons: ['spring', 'winter'],
    ndviRange: { min: 0.2, max: 0.7 },
    weatherPatterns: {
      temperature: { min: 5, max: 45 },
      precipitation: { min: 10, max: 80 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'moderate',
      vegetationDensity: 'sparse',
      waterAvailability: 'limited'
    }
  },
  'brazil_flowers': {
    region: 'Brazil Flowers',
    biome: 'Tropical Rainforest',
    climate: 'Tropical',
    typicalSpecies: ['Orchids', 'Bromeliads', 'Heliconia', 'Passion Flower'],
    bloomSeasons: ['spring', 'summer'],
    ndviRange: { min: 0.6, max: 0.9 },
    weatherPatterns: {
      temperature: { min: 20, max: 35 },
      precipitation: { min: 100, max: 300 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'high',
      vegetationDensity: 'dense',
      waterAvailability: 'abundant'
    }
  },
  'india_lotus': {
    region: 'India Lotus',
    biome: 'Wetland',
    climate: 'Tropical Monsoon',
    typicalSpecies: ['Lotus', 'Water Lily', 'Mango', 'Banyan'],
    bloomSeasons: ['summer', 'monsoon'],
    ndviRange: { min: 0.5, max: 0.9 },
    weatherPatterns: {
      temperature: { min: 15, max: 40 },
      precipitation: { min: 50, max: 400 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'high',
      vegetationDensity: 'dense',
      waterAvailability: 'abundant'
    }
  },
  'canada_tulips': {
    region: 'Canada Tulips',
    biome: 'Temperate Forest',
    climate: 'Continental',
    typicalSpecies: ['Tulips', 'Maple', 'Pine', 'Wildflowers'],
    bloomSeasons: ['spring'],
    ndviRange: { min: 0.2, max: 0.8 },
    weatherPatterns: {
      temperature: { min: -20, max: 25 },
      precipitation: { min: 40, max: 120 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'moderate',
      vegetationDensity: 'moderate',
      waterAvailability: 'abundant'
    }
  },
  'chile_wildflowers': {
    region: 'Chile Wildflowers',
    biome: 'Mediterranean',
    climate: 'Mediterranean',
    typicalSpecies: ['Wildflowers', 'Cacti', 'Shrubs', 'Herbs'],
    bloomSeasons: ['spring'],
    ndviRange: { min: 0.2, max: 0.6 },
    weatherPatterns: {
      temperature: { min: 5, max: 30 },
      precipitation: { min: 20, max: 100 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'moderate',
      vegetationDensity: 'moderate',
      waterAvailability: 'moderate'
    }
  },
  'new_zealand_flowers': {
    region: 'New Zealand Flowers',
    biome: 'Temperate Forest',
    climate: 'Oceanic',
    typicalSpecies: ['Native Flowers', 'Ferns', 'Trees', 'Shrubs'],
    bloomSeasons: ['spring', 'summer'],
    ndviRange: { min: 0.4, max: 0.9 },
    weatherPatterns: {
      temperature: { min: 0, max: 25 },
      precipitation: { min: 60, max: 200 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'high',
      vegetationDensity: 'dense',
      waterAvailability: 'abundant'
    }
  },
  'argentina_flowers': {
    region: 'Argentina Flowers',
    biome: 'Grassland',
    climate: 'Temperate',
    typicalSpecies: ['Wildflowers', 'Grasses', 'Herbs', 'Shrubs'],
    bloomSeasons: ['spring', 'summer'],
    ndviRange: { min: 0.3, max: 0.7 },
    weatherPatterns: {
      temperature: { min: 5, max: 30 },
      precipitation: { min: 40, max: 120 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'moderate',
      vegetationDensity: 'moderate',
      waterAvailability: 'moderate'
    }
  },
  'patagonia_wildflowers': {
    region: 'Patagonia Wildflowers',
    biome: 'Steppe',
    climate: 'Cold Desert',
    typicalSpecies: ['Patagonian Wildflowers', 'Grasses', 'Shrubs', 'Herbs'],
    bloomSeasons: ['spring', 'summer'],
    ndviRange: { min: 0.2, max: 0.6 },
    weatherPatterns: {
      temperature: { min: -10, max: 20 },
      precipitation: { min: 20, max: 80 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'low',
      vegetationDensity: 'sparse',
      waterAvailability: 'limited'
    }
  },
  'chile_patagonia': {
    region: 'Chile Patagonia',
    biome: 'Temperate Rainforest',
    climate: 'Oceanic',
    typicalSpecies: ['Native Flowers', 'Ferns', 'Mosses', 'Trees'],
    bloomSeasons: ['spring', 'summer'],
    ndviRange: { min: 0.4, max: 0.8 },
    weatherPatterns: {
      temperature: { min: -5, max: 15 },
      precipitation: { min: 80, max: 200 }
    },
    ecologicalCharacteristics: {
      biodiversity: 'high',
      vegetationDensity: 'dense',
      waterAvailability: 'abundant'
    }
  }
}

/**
 * Generate realistic NDVI score based on location and season
 */
export function generateLocationSpecificNDVI(regionId: string, season: string): number {
  const locationData = LOCATION_DATA[regionId]
  if (!locationData) {
    // Fallback to default range
    return 0.3 + Math.random() * 0.5
  }

  const { ndviRange, bloomSeasons } = locationData
  const isBloomingSeason = bloomSeasons.includes(season)
  
  // Higher NDVI during blooming seasons
  const baseMin = isBloomingSeason ? ndviRange.min + 0.1 : ndviRange.min
  const baseMax = isBloomingSeason ? ndviRange.max : ndviRange.max - 0.1
  
  // Add some randomness but keep within realistic bounds
  const variation = (baseMax - baseMin) * 0.3 // 30% variation
  const randomFactor = (Math.random() - 0.5) * variation
  
  return Math.max(ndviRange.min, Math.min(ndviRange.max, baseMin + (baseMax - baseMin) * Math.random() + randomFactor))
}

/**
 * Generate realistic weather data based on location
 */
export function generateLocationSpecificWeather(regionId: string, season: string) {
  const locationData = LOCATION_DATA[regionId]
  if (!locationData) {
    // Fallback to default
    return {
      temperature_mean_c: 20 + Math.random() * 10,
      precipitation_mm: Math.random() * 50
    }
  }

  const { weatherPatterns } = locationData
  const { temperature, precipitation } = weatherPatterns
  
  // Seasonal temperature adjustments
  const seasonalTempAdjustment = {
    spring: 0,
    summer: 8,
    fall: -5,
    winter: -10
  }[season] || 0
  
  const baseTemp = (temperature.min + temperature.max) / 2
  const tempVariation = (temperature.max - temperature.min) * 0.4
  const finalTemp = baseTemp + seasonalTempAdjustment + (Math.random() - 0.5) * tempVariation
  
  // Seasonal precipitation adjustments
  const seasonalPrecipMultiplier = {
    spring: 1.2,
    summer: 0.8,
    fall: 1.0,
    winter: 1.1
  }[season] || 1.0
  
  const basePrecip = (precipitation.min + precipitation.max) / 2
  const precipVariation = (precipitation.max - precipitation.min) * 0.5
  const finalPrecip = Math.max(0, basePrecip * seasonalPrecipMultiplier + (Math.random() - 0.5) * precipVariation)
  
  return {
    temperature_mean_c: Math.round(finalTemp * 10) / 10,
    precipitation_mm: Math.round(finalPrecip * 10) / 10
  }
}

/**
 * Generate bloom status based on NDVI, location, and season
 */
export function generateLocationSpecificBloomStatus(regionId: string, ndvi: number, season: string): string {
  const locationData = LOCATION_DATA[regionId]
  if (!locationData) {
    // Fallback logic
    if (ndvi > 0.7) return 'Peak Bloom'
    if (ndvi > 0.5) return 'Active Bloom'
    if (ndvi > 0.3) return 'Early Bloom'
    return 'Pre-Bloom'
  }

  const { bloomSeasons, ndviRange } = locationData
  const isBloomingSeason = bloomSeasons.includes(season)
  
  // Adjust thresholds based on location characteristics
  const peakThreshold = ndviRange.max * 0.9
  const activeThreshold = ndviRange.max * 0.7
  const earlyThreshold = ndviRange.max * 0.5
  
  if (!isBloomingSeason) {
    // Outside blooming season
    if (ndvi > earlyThreshold) return 'Post-Bloom'
    return 'Dormant'
  }
  
  // During blooming season
  if (ndvi > peakThreshold) return 'Peak Bloom'
  if (ndvi > activeThreshold) return 'Active Bloom'
  if (ndvi > earlyThreshold) return 'Early Bloom'
  return 'Pre-Bloom'
}

/**
 * Generate ecological insights based on location characteristics
 */
export function generateLocationSpecificEcologicalInsights(regionId: string, ndvi: number) {
  const locationData = LOCATION_DATA[regionId]
  if (!locationData) {
    return {
      vegetationHealth: ndvi > 0.6 ? 'excellent' : ndvi > 0.4 ? 'good' : 'moderate',
      waterStress: 'moderate',
      fireRisk: 'moderate',
      biodiversity: 'moderate'
    }
  }

  const { ecologicalCharacteristics } = locationData
  
  // Vegetation health based on NDVI and location characteristics
  const baseThreshold = ecologicalCharacteristics.vegetationDensity === 'dense' ? 0.6 : 
                       ecologicalCharacteristics.vegetationDensity === 'moderate' ? 0.5 : 0.4
  
  const vegetationHealth = ndvi > baseThreshold + 0.1 ? 'excellent' :
                          ndvi > baseThreshold ? 'good' :
                          ndvi > baseThreshold - 0.1 ? 'moderate' : 'poor'
  
  // Water stress based on location characteristics
  const waterStress = ecologicalCharacteristics.waterAvailability === 'abundant' ? 'low' :
                     ecologicalCharacteristics.waterAvailability === 'moderate' ? 'moderate' : 'high'
  
  // Fire risk based on climate and vegetation
  const fireRisk = locationData.climate.includes('Mediterranean') ? 'high' :
                  ecologicalCharacteristics.waterAvailability === 'limited' ? 'moderate' : 'low'
  
  return {
    vegetationHealth,
    waterStress,
    fireRisk,
    biodiversity: ecologicalCharacteristics.biodiversity
  }
}

/**
 * Get current season based on month
 */
export function getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

/**
 * Available mock Landsat images
 */
export const MOCK_LANDSAT_IMAGES = [
  '/mock-landsat.png',
  '/mock-landsat2.png',
  '/mock-landsat3.png',
  '/mock-landsat4.png',
  '/mock-landsat5.png',
  '/mock-landsat6.png',
  '/mock-landsat7.png'
]

/**
 * Get a random mock Landsat image
 * Uses region ID as seed for consistent image selection per region
 */
export function getMockLandsatImage(regionId: string): string {
  // Use region ID as seed for consistent image selection
  let hash = 0
  for (let i = 0; i < regionId.length; i++) {
    const char = regionId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % MOCK_LANDSAT_IMAGES.length
  return MOCK_LANDSAT_IMAGES[index]
}

/**
 * Get mock Landsat image with some randomness for variety
 * Sometimes returns random image, sometimes returns region-specific image
 */
export function getVariedMockLandsatImage(regionId: string): string {
  // 70% chance to use region-specific image, 30% chance for random
  const useRegionSpecific = Math.random() > 0.3
  
  if (useRegionSpecific) {
    return getMockLandsatImage(regionId)
  } else {
    // Return random image for variety
    const randomIndex = Math.floor(Math.random() * MOCK_LANDSAT_IMAGES.length)
    return MOCK_LANDSAT_IMAGES[randomIndex]
  }
}
