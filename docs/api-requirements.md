# 🌍 Bloome API Requirements - Landsat Blooming Events

## Overview
Bloome adalah platform interaktif untuk monitoring plant blooming events menggunakan NASA Landsat data. Frontend akan mengirim koordinat geografis dari klik pengguna pada 3D Earth dan menerima data analisis blooming untuk lokasi tersebut.

## Primary Endpoint

### `GET /api/blooming-events`

**Purpose**: Mengambil data historis blooming events untuk lokasi geografis tertentu.

**Query Parameters**:
- `latitude` (required): Float, range -90 to 90
- `longitude` (required): Float, range -180 to 180
- `radius` (optional): Float, default 0.01 degrees (~1km), max 1.0 degrees
- `time_range` (optional): String, format "YYYY-MM-DD,YYYY-MM-DD", default last 5 years

**Request Example**:
```bash
GET /api/blooming-events?latitude=40.7128&longitude=-74.0060&radius=0.02&time_range=2019-01-01,2024-12-31
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "location": {
      "lat": 40.7128,
      "lng": -74.0060,
      "name": "New York City, USA",
      "biome": "temperate_forest"
    },
    "temporal_data": [
      {
        "year": 2024,
        "season": "spring",
        "month": 4,
        "blooming_events": [
          {
            "start_date": "2024-03-15",
            "end_date": "2024-05-10",
            "peak_date": "2024-04-20",
            "intensity": 0.85,
            "confidence": 0.92,
            "species": ["Quercus rubra", "Acer saccharum"],
            "ndvi_avg": 0.75,
            "evi_avg": 0.68,
            "weather_correlation": {
              "temperature_avg": 12.5,
              "precipitation_total": 85.2
            }
          }
        ],
        "summary": {
          "total_blooming_days": 56,
          "avg_intensity": 0.78,
          "dominant_species": "Quercus rubra",
          "ecological_insights": "Early spring bloom due to warmer winter temperatures"
        }
      }
    ],
    "trends": {
      "blooming_advance_days_per_decade": -3.2,
      "intensity_trend": "+0.05/year",
      "species_composition_change": "Increasing diversity"
    },
    "metadata": {
      "data_sources": ["Landsat 8", "Landsat 9", "Sentinel-2"],
      "processing_model": "Custom ML Model v2.1",
      "last_updated": "2024-01-15T10:30:00Z",
      "data_quality": "high"
    }
  }
}
```

## Data Structure Details

### Blooming Event Object
```typescript
interface BloomingEvent {
  start_date: string;      // ISO date string
  end_date: string;        // ISO date string
  peak_date: string;       // ISO date string
  intensity: number;       // 0-1 scale (0=no bloom, 1=max bloom)
  confidence: number;      // 0-1 scale (model confidence)
  species: string[];       // Array of potential species names
  ndvi_avg: number;        // Average NDVI during event
  evi_avg: number;         // Average EVI during event
  weather_correlation: {
    temperature_avg: number;
    precipitation_total: number;
  }
}
```

### Vegetation Indices
- **NDVI**: Normalized Difference Vegetation Index = (NIR - RED) / (NIR + RED)
- **EVI**: Enhanced Vegetation Index = 2.5 × (NIR - RED) / (NIR + 6 × RED - 7.5 × BLUE + 1)

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "INVALID_COORDINATES",
  "message": "Latitude must be between -90 and 90, longitude between -180 and 180"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "NO_DATA",
  "message": "No blooming data available for the specified location and time range"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "PROCESSING_ERROR",
  "message": "Error processing Landsat data for the requested location"
}
```

## Performance Requirements

- **Response Time**: < 2 seconds for cached data, < 10 seconds for real-time processing
- **Rate Limiting**: 100 requests/minute per IP untuk development, 1000/minute untuk production
- **Caching**: Implement Redis caching untuk query yang sering digunakan
- **Geospatial Indexing**: Gunakan PostGIS atau MongoDB dengan 2dsphere index untuk query spasial

## Integration with AI/ML

### LLM Integration
- **Species Identification**: Gunakan LLM untuk interpretasi spectral signatures
- **Ecological Insights**: Generate natural language explanations dari data numerik
- **Trend Analysis**: AI-powered analysis dari historical patterns

### ML Models
- **Bloom Detection Model**: CNN untuk detect blooming dari Landsat bands
- **Time Series Forecasting**: LSTM/RNN untuk predict future blooming events
- **Anomaly Detection**: Untuk identify unusual blooming patterns

## Development Notes

### Current Implementation (Frontend Mock)
Frontend saat ini menggunakan mock data hardcoded untuk development dan testing. Backend team perlu replace dengan real implementation.

### Priority Order
1. **Basic Endpoint** dengan mock data serupa current frontend
2. **Real Landsat Integration** dengan NASA/USGS APIs
3. **AI/ML Enhancement** untuk species identification dan insights
4. **Advanced Features** seperti prediction dan anomaly detection

### Testing Data
Berikut contoh koordinat untuk testing berbagai biomes:
- **Tropical Rainforest**: `lat: -3.4653, lng: -62.2159` (Amazon)
- **Temperate Forest**: `lat: 40.7128, lng: -74.0060` (New York)
- **Desert**: `lat: 25.2048, lng: 55.2708` (Dubai)
- **Agricultural**: `lat: 52.5200, lng: 13.4050` (Berlin farmlands)

## Questions for Backend Team

1. **Data Sources**: Apakah akan menggunakan NASA Earthdata API, USGS EarthExplorer, atau Google Earth Engine?
2. **Processing Pipeline**: Di mana ML model akan dijalankan? (cloud, on-premise, edge)?
3. **Caching Strategy**: Bagaimana handle cache invalidation untuk data temporal?
4. **Scalability**: Plan untuk handle high traffic saat viral atau events besar?

---

**Last Updated**: January 2025
**Contact**: Frontend Team Lead
**Status**: 📋 Requirements Defined, ⏳ Awaiting Backend Implementation
