# Recent Events Examples

## Generated Events for Different Regions

### Japan Cherry Blossoms
- **Bloom Start**: "Japan Cherry Blossoms Bloom Season Begins - Early signs of flowering observed in the region."
- **Peak Bloom**: "Japan Cherry Blossoms Peak Bloom Period - Optimal viewing conditions and maximum flower density."
- **Weather Event**: "Weather Impact on Japan Cherry Blossoms - Environmental conditions affecting bloom timing and quality."
- **Conservation**: "Japan Cherry Blossoms Conservation Update - Efforts to protect and preserve natural resources."

### Bandung Floriculture
- **Bloom Start**: "Bandung Floriculture Bloom Season Begins - Early signs of flowering observed in the region."
- **Peak Bloom**: "Bandung Floriculture Peak Bloom Period - Optimal viewing conditions and maximum flower density."
- **Weather Event**: "Weather Impact on Bandung Floriculture - Weather impacts flower cultivation."
- **Research**: "Bandung Floriculture Research Update - Agricultural research and development."

### Netherlands Tulips
- **Bloom Start**: "Netherlands Tulips Bloom Season Begins - Tulip season begins in Keukenhof."
- **Peak Bloom**: "Netherlands Tulips Peak Bloom Period - Peak tulip viewing period."
- **Conservation**: "Netherlands Tulips Conservation Update - Tulip variety conservation."

### France Lavender
- **Bloom Start**: "France Lavender Bloom Season Begins - Lavender fields begin blooming."
- **Peak Bloom**: "France Lavender Peak Bloom Period - Peak lavender harvest season."
- **Weather Event**: "Weather Impact on France Lavender - Weather impacts lavender cultivation."

## Event Types and Frequencies

### Japan Cherry Blossoms (30-day period):
- **Bloom Start**: 30% chance
- **Peak Bloom**: 25% chance  
- **Bloom End**: 20% chance
- **Weather Event**: 15% chance
- **Conservation**: 5% chance
- **Research**: 5% chance

### Bandung Floriculture (30-day period):
- **Bloom Start**: 25% chance
- **Peak Bloom**: 20% chance
- **Bloom End**: 15% chance
- **Weather Event**: 20% chance (higher due to tropical climate)
- **Conservation**: 10% chance (sustainable farming focus)
- **Research**: 10% chance (agricultural development focus)

## Event Metadata Examples

### Bloom Events:
```json
{
  "ndvi_change": 0.12,
  "temperature_anomaly": 2.3,
  "precipitation_anomaly": -15.2
}
```

### Weather Events:
```json
{
  "temperature_anomaly": -5.8,
  "precipitation_anomaly": 42.1
}
```

### Conservation/Research Events:
```json
{
  "species_count": 127
}
```

## Visual Indicators

### Intensity Levels:
- **High** (0.7+): Green badge - Peak bloom, major events
- **Medium** (0.4-0.7): Yellow badge - Bloom start/end, moderate events  
- **Low** (0.0-0.4): Blue badge - Weather events, minor activities

### Event Count Display:
- Shows total number of recent events: "Recent Events (6)"
- Displays up to 8 most recent events
- Scrollable list for more events
- Chronological order (newest first)

## Benefits of Multiple Events

1. **Rich Data Visualization**: Users see multiple data points instead of single events
2. **Location-Specific Context**: Events match the actual characteristics of each region
3. **Temporal Variety**: Events spread across different dates in the past 30 days
4. **Realistic Patterns**: Event frequencies match real-world patterns for each location
5. **Enhanced User Experience**: More engaging and informative interface
