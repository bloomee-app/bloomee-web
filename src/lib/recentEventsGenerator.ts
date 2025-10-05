/**
 * Recent Events Generator
 * Generates multiple realistic recent events based on location and season
 */

export interface RecentEvent {
  id: string
  title: string
  description: string
  date: string
  type: 'bloom_start' | 'peak_bloom' | 'bloom_end' | 'weather_event' | 'conservation' | 'research'
  impact: 'low' | 'medium' | 'high'
  region: string
  metadata?: {
    ndvi_change?: number
    temperature_anomaly?: number
    precipitation_anomaly?: number
    species_count?: number
  }
}

export interface LocationEventPatterns {
  region: string
  eventTypes: {
    bloom_start: { frequency: number; description: string }
    peak_bloom: { frequency: number; description: string }
    bloom_end: { frequency: number; description: string }
    weather_event: { frequency: number; description: string }
    conservation: { frequency: number; description: string }
    research: { frequency: number; description: string }
  }
  typicalEvents: string[]
}

// Location-specific event patterns
const LOCATION_EVENT_PATTERNS: Record<string, LocationEventPatterns> = {
  'japan_cherry': {
    region: 'Japan Cherry Blossoms',
    eventTypes: {
      bloom_start: { frequency: 0.3, description: 'Cherry blossoms begin to open' },
      peak_bloom: { frequency: 0.25, description: 'Peak cherry blossom viewing period' },
      bloom_end: { frequency: 0.2, description: 'Cherry blossom season concludes' },
      weather_event: { frequency: 0.15, description: 'Weather impacts on cherry blossoms' },
      conservation: { frequency: 0.05, description: 'Cherry tree conservation efforts' },
      research: { frequency: 0.05, description: 'Cherry blossom research updates' }
    },
    typicalEvents: [
      'Sakura Festival preparations begin',
      'Tourist influx during peak bloom',
      'Traditional hanami celebrations',
      'Weather warnings for cherry blossom viewing',
      'Local government bloom predictions',
      'Cultural events and performances'
    ]
  },
  'usa_cherry_dc': {
    region: 'USA Cherry Blossoms',
    eventTypes: {
      bloom_start: { frequency: 0.3, description: 'National Cherry Blossom Festival begins' },
      peak_bloom: { frequency: 0.25, description: 'Peak bloom period in Washington DC' },
      bloom_end: { frequency: 0.2, description: 'Cherry blossom season ends' },
      weather_event: { frequency: 0.15, description: 'Weather affects bloom timing' },
      conservation: { frequency: 0.05, description: 'Cherry tree maintenance and care' },
      research: { frequency: 0.05, description: 'Urban forestry research' }
    },
    typicalEvents: [
      'National Cherry Blossom Festival events',
      'Peak bloom predictions by NPS',
      'Tourist crowds and traffic management',
      'Cultural exchange programs',
      'Tree health monitoring',
      'Festival parade and performances'
    ]
  },
  'bandung_floriculture': {
    region: 'Bandung Floriculture',
    eventTypes: {
      bloom_start: { frequency: 0.25, description: 'Floriculture season begins' },
      peak_bloom: { frequency: 0.2, description: 'Peak flower production period' },
      bloom_end: { frequency: 0.15, description: 'Seasonal flower harvest ends' },
      weather_event: { frequency: 0.2, description: 'Weather impacts flower cultivation' },
      conservation: { frequency: 0.1, description: 'Sustainable farming initiatives' },
      research: { frequency: 0.1, description: 'Agricultural research and development' }
    },
    typicalEvents: [
      'Flower market trading updates',
      'Export season preparations',
      'Local farmer cooperatives activities',
      'Greenhouse technology improvements',
      'Organic farming initiatives',
      'Flower variety development'
    ]
  },
  'netherlands_tulips': {
    region: 'Netherlands Tulips',
    eventTypes: {
      bloom_start: { frequency: 0.3, description: 'Tulip season begins in Keukenhof' },
      peak_bloom: { frequency: 0.25, description: 'Peak tulip viewing period' },
      bloom_end: { frequency: 0.2, description: 'Tulip season concludes' },
      weather_event: { frequency: 0.15, description: 'Weather affects tulip cultivation' },
      conservation: { frequency: 0.05, description: 'Tulip variety conservation' },
      research: { frequency: 0.05, description: 'Floriculture research updates' }
    },
    typicalEvents: [
      'Keukenhof Gardens opening',
      'Tulip festival celebrations',
      'Flower auction market updates',
      'Tourist season management',
      'Breeding program developments',
      'Export market activities'
    ]
  },
  'france_lavender': {
    region: 'France Lavender',
    eventTypes: {
      bloom_start: { frequency: 0.25, description: 'Lavender fields begin blooming' },
      peak_bloom: { frequency: 0.3, description: 'Peak lavender harvest season' },
      bloom_end: { frequency: 0.2, description: 'Lavender harvest completed' },
      weather_event: { frequency: 0.15, description: 'Weather impacts lavender cultivation' },
      conservation: { frequency: 0.05, description: 'Traditional farming preservation' },
      research: { frequency: 0.05, description: 'Aromatic plant research' }
    },
    typicalEvents: [
      'Lavender harvest festival',
      'Essential oil production updates',
      'Tourist photography season',
      'Traditional farming practices',
      'Aromatherapy industry news',
      'Regional tourism campaigns'
    ]
  },
  'uk_bluebells': {
    region: 'UK Bluebells',
    eventTypes: {
      bloom_start: { frequency: 0.3, description: 'Bluebell woodlands begin blooming' },
      peak_bloom: { frequency: 0.25, description: 'Peak bluebell viewing period' },
      bloom_end: { frequency: 0.2, description: 'Bluebell season ends' },
      weather_event: { frequency: 0.15, description: 'Weather affects woodland blooms' },
      conservation: { frequency: 0.05, description: 'Ancient woodland conservation' },
      research: { frequency: 0.05, description: 'Botanical research updates' }
    },
    typicalEvents: [
      'Woodland trust activities',
      'Nature reserve visits increase',
      'Botanical survey results',
      'Wildlife habitat protection',
      'Educational nature walks',
      'Conservation volunteer programs'
    ]
  },
  'california_poppies': {
    region: 'California Poppies',
    eventTypes: {
      bloom_start: { frequency: 0.3, description: 'Wildflower season begins' },
      peak_bloom: { frequency: 0.25, description: 'Super bloom period' },
      bloom_end: { frequency: 0.2, description: 'Wildflower season concludes' },
      weather_event: { frequency: 0.15, description: 'Drought or rainfall impacts' },
      conservation: { frequency: 0.05, description: 'Native plant conservation' },
      research: { frequency: 0.05, description: 'Ecosystem research updates' }
    },
    typicalEvents: [
      'Antelope Valley Poppy Reserve updates',
      'Super bloom tourism management',
      'Wildfire prevention measures',
      'Native species protection',
      'Photography permit regulations',
      'Ecosystem restoration projects'
    ]
  },
  'texas_bluebonnets': {
    region: 'Texas Bluebonnets',
    eventTypes: {
      bloom_start: { frequency: 0.3, description: 'Bluebonnet season begins' },
      peak_bloom: { frequency: 0.25, description: 'Peak bluebonnet viewing period' },
      bloom_end: { frequency: 0.2, description: 'Bluebonnet season ends' },
      weather_event: { frequency: 0.15, description: 'Weather affects wildflower blooms' },
      conservation: { frequency: 0.05, description: 'Native prairie conservation' },
      research: { frequency: 0.05, description: 'Wildflower research updates' }
    },
    typicalEvents: [
      'Wildflower center activities',
      'Highway beautification programs',
      'Photography tourism season',
      'Native seed collection',
      'Prairie restoration projects',
      'Educational programs for schools'
    ]
  }
}

/**
 * Generate multiple recent events for a specific region
 */
export function generateRecentEvents(regionId: string, count: number = 8): RecentEvent[] {
  const pattern = LOCATION_EVENT_PATTERNS[regionId]
  if (!pattern) {
    return generateDefaultEvents(regionId, count)
  }

  const events: RecentEvent[] = []
  const now = new Date()
  
  // Generate events for the past 30 days
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30) + 1
    const eventDate = new Date(now)
    eventDate.setDate(eventDate.getDate() - daysAgo)
    
    const eventType = selectEventType(pattern.eventTypes)
    const event = generateEventForType(regionId, eventType, eventDate, pattern)
    
    events.push(event)
  }
  
  // Sort by date (most recent first)
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Select event type based on frequency weights
 */
function selectEventType(eventTypes: LocationEventPatterns['eventTypes']): keyof LocationEventPatterns['eventTypes'] {
  const types = Object.keys(eventTypes) as Array<keyof LocationEventPatterns['eventTypes']>
  const weights = types.map(type => eventTypes[type].frequency)
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let random = Math.random() * totalWeight
  
  for (let i = 0; i < types.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return types[i]
    }
  }
  
  return types[0]
}

/**
 * Generate a specific event based on type and region
 */
function generateEventForType(
  regionId: string, 
  eventType: keyof LocationEventPatterns['eventTypes'],
  date: Date,
  pattern: LocationEventPatterns
): RecentEvent {
  const baseEvent = {
    id: `${regionId}_${eventType}_${date.getTime()}`,
    region: regionId,
    date: date.toISOString().split('T')[0],
    type: eventType,
    impact: getRandomImpact(),
    metadata: generateEventMetadata(eventType)
  }

  switch (eventType) {
    case 'bloom_start':
      return {
        ...baseEvent,
        title: `${pattern.region} Bloom Season Begins`,
        description: pattern.eventTypes.bloom_start.description + '. Early signs of flowering observed in the region.'
      }
    
    case 'peak_bloom':
      return {
        ...baseEvent,
        title: `${pattern.region} Peak Bloom Period`,
        description: pattern.eventTypes.peak_bloom.description + '. Optimal viewing conditions and maximum flower density.'
      }
    
    case 'bloom_end':
      return {
        ...baseEvent,
        title: `${pattern.region} Season Concludes`,
        description: pattern.eventTypes.bloom_end.description + '. Flowering period comes to an end for this season.'
      }
    
    case 'weather_event':
      return {
        ...baseEvent,
        title: `Weather Impact on ${pattern.region}`,
        description: pattern.eventTypes.weather_event.description + '. Environmental conditions affecting bloom timing and quality.'
      }
    
    case 'conservation':
      return {
        ...baseEvent,
        title: `${pattern.region} Conservation Update`,
        description: pattern.eventTypes.conservation.description + '. Efforts to protect and preserve natural resources.'
      }
    
    case 'research':
      return {
        ...baseEvent,
        title: `${pattern.region} Research Update`,
        description: pattern.eventTypes.research.description + '. New findings and scientific developments in the field.'
      }
    
    default:
      return {
        ...baseEvent,
        title: `${pattern.region} Activity Update`,
        description: 'Recent activity and developments in the region.'
      }
  }
}

/**
 * Generate default events if region pattern not found
 */
function generateDefaultEvents(regionId: string, count: number): RecentEvent[] {
  const events: RecentEvent[] = []
  const now = new Date()
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30) + 1
    const eventDate = new Date(now)
    eventDate.setDate(eventDate.getDate() - daysAgo)
    
    events.push({
      id: `${regionId}_default_${i}`,
      title: `${regionId} Activity Update`,
      description: 'Recent activity and developments in the region.',
      date: eventDate.toISOString().split('T')[0],
      type: 'bloom_start',
      impact: getRandomImpact(),
      region: regionId,
      metadata: generateEventMetadata('bloom_start')
    })
  }
  
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Get random impact level
 */
function getRandomImpact(): 'low' | 'medium' | 'high' {
  const rand = Math.random()
  if (rand < 0.6) return 'low'
  if (rand < 0.9) return 'medium'
  return 'high'
}

/**
 * Generate metadata based on event type
 */
function generateEventMetadata(eventType: keyof LocationEventPatterns['eventTypes']) {
  const metadata: any = {}
  
  switch (eventType) {
    case 'bloom_start':
    case 'peak_bloom':
    case 'bloom_end':
      metadata.ndvi_change = (Math.random() - 0.5) * 0.3 // -0.15 to 0.15
      break
    
    case 'weather_event':
      metadata.temperature_anomaly = (Math.random() - 0.5) * 10 // -5 to 5 degrees
      metadata.precipitation_anomaly = (Math.random() - 0.5) * 50 // -25 to 25 mm
      break
    
    case 'conservation':
    case 'research':
      metadata.species_count = Math.floor(Math.random() * 100) + 50 // 50-150 species
      break
  }
  
  return Object.keys(metadata).length > 0 ? metadata : undefined
}

