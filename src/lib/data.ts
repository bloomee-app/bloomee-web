export interface Hotspot {
  id: string
  name: string
  latitude: number
  longitude: number
  description: string
  type: 'deforestation' | 'urbanization' | 'agriculture' | 'water' | 'forest'
  severity: 'low' | 'medium' | 'high'
  color: string
}

export const hotspots: Hotspot[] = [
  {
    id: 'amazon-brazil',
    name: 'Amazon Rainforest, Brazil',
    latitude: -3.4653,
    longitude: -62.2159,
    description: 'Deforestation hotspot in the Amazon rainforest',
    type: 'deforestation',
    severity: 'high',
    color: '#ef4444'
  },
  {
    id: 'kalimantan-indonesia',
    name: 'Kalimantan, Indonesia',
    latitude: -0.7893,
    longitude: 113.9213,
    description: 'Palm oil plantation expansion and forest loss',
    type: 'deforestation',
    severity: 'high',
    color: '#ef4444'
  },
  {
    id: 'jakarta-indonesia',
    name: 'Jakarta, Indonesia',
    latitude: -6.2088,
    longitude: 106.8456,
    description: 'Rapid urban expansion and land use change',
    type: 'urbanization',
    severity: 'high',
    color: '#f97316'
  },
  {
    id: 'amazon-peru',
    name: 'Amazon Basin, Peru',
    latitude: -4.0383,
    longitude: -73.0258,
    description: 'Mining and agricultural expansion',
    type: 'deforestation',
    severity: 'medium',
    color: '#f59e0b'
  },
  {
    id: 'central-valley-california',
    name: 'Central Valley, California',
    latitude: 36.7783,
    longitude: -119.4179,
    description: 'Intensive agricultural development',
    type: 'agriculture',
    severity: 'medium',
    color: '#10b981'
  },
  {
    id: 'great-plains-usa',
    name: 'Great Plains, USA',
    latitude: 39.8283,
    longitude: -98.5795,
    description: 'Agricultural expansion and crop patterns',
    type: 'agriculture',
    severity: 'low',
    color: '#10b981'
  },
  {
    id: 'aral-sea',
    name: 'Aral Sea, Central Asia',
    latitude: 45.0,
    longitude: 60.0,
    description: 'Water body shrinkage due to irrigation',
    type: 'water',
    severity: 'high',
    color: '#3b82f6'
  },
  {
    id: 'congo-basin',
    name: 'Congo Basin, Africa',
    latitude: 0.2280,
    longitude: 20.8783,
    description: 'Tropical forest conservation area',
    type: 'forest',
    severity: 'low',
    color: '#059669'
  }
]

// Utility function to convert lat/lon to 3D coordinates on sphere
export function latLonToVector3(lat: number, lon: number, radius: number = 1.1) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  
  return {
    x: -(radius * Math.sin(phi) * Math.cos(theta)),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta)
  }
}
