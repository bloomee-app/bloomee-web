/**
 * Color mapping utilities for bloom visualization
 */

export interface ColorMapping {
  r: number
  g: number
  b: number
  intensity: number
}

/**
 * Color schemes for different bloom phases
 */
export const BLOOM_COLORS = {
  dormant: {
    base: { r: 0.3, g: 0.3, b: 0.3 }, // Dark gray/brown
    range: { r: 0.2, g: 0.2, b: 0.2 }
  },
  'pre-bloom': {
    base: { r: 0.4, g: 0.5, b: 0.3 }, // Dull green
    range: { r: 0.2, g: 0.2, b: 0.1 }
  },
  bloom: {
    base: { r: 0.2, g: 0.7, b: 0.3 }, // Vibrant green
    range: { r: 0.3, g: 0.3, b: 0.2 }
  },
  'post-bloom': {
    base: { r: 0.6, g: 0.4, b: 0.2 }, // Yellow/orange
    range: { r: 0.2, g: 0.2, b: 0.1 }
  }
}

/**
 * Seasonal color variations
 */
export const SEASONAL_COLORS = {
  spring: { r: 0.0, g: 0.3, b: 0.0 }, // Fresh green
  summer: { r: 0.0, g: 0.5, b: 0.0 }, // Deep green
  fall: { r: 0.3, g: 0.2, b: 0.0 }, // Orange/brown
  winter: { r: 0.2, g: 0.2, b: 0.2 } // Gray/brown
}

/**
 * Convert bloom intensity to color
 */
export function intensityToColor(
  intensity: number,
  phase: 'pre-bloom' | 'bloom' | 'post-bloom' | 'dormant',
  season: 'spring' | 'summer' | 'fall' | 'winter'
): ColorMapping {
  const phaseColors = BLOOM_COLORS[phase]
  const seasonalShift = SEASONAL_COLORS[season]
  
  // Base color from phase
  let r = phaseColors.base.r
  let g = phaseColors.base.g
  let b = phaseColors.base.b
  
  // Apply intensity scaling
  const intensityFactor = Math.pow(intensity, 0.8) // Slight gamma correction for better visual
  r *= intensityFactor
  g *= intensityFactor
  b *= intensityFactor
  
  // Apply seasonal shift
  r = Math.min(1, r + seasonalShift.r * intensity * 0.3)
  g = Math.min(1, g + seasonalShift.g * intensity * 0.3)
  b = Math.min(1, b + seasonalShift.b * intensity * 0.3)
  
  // Add some variation based on intensity
  const variation = intensity * 0.1
  r += (Math.random() - 0.5) * variation
  g += (Math.random() - 0.5) * variation
  b += (Math.random() - 0.5) * variation
  
  // Clamp values
  r = Math.max(0, Math.min(1, r))
  g = Math.max(0, Math.min(1, g))
  b = Math.max(0, Math.min(1, b))
  
  return {
    r,
    g,
    b,
    intensity
  }
}

/**
 * Convert color to Three.js Color object
 */
export function colorMappingToThreeJS(color: ColorMapping): { r: number; g: number; b: number } {
  return {
    r: color.r,
    g: color.g,
    b: color.b
  }
}

/**
 * Generate a color palette for a range of intensities
 */
export function generateColorPalette(
  phase: 'pre-bloom' | 'bloom' | 'post-bloom' | 'dormant',
  season: 'spring' | 'summer' | 'fall' | 'winter',
  steps: number = 10
): ColorMapping[] {
  const palette: ColorMapping[] = []
  
  for (let i = 0; i < steps; i++) {
    const intensity = i / (steps - 1)
    const color = intensityToColor(intensity, phase, season)
    palette.push(color)
  }
  
  return palette
}

/**
 * Interpolate between two colors based on intensity
 */
export function interpolateColors(
  color1: ColorMapping,
  color2: ColorMapping,
  factor: number
): ColorMapping {
  const clampedFactor = Math.max(0, Math.min(1, factor))
  
  return {
    r: color1.r + (color2.r - color1.r) * clampedFactor,
    g: color1.g + (color2.g - color1.g) * clampedFactor,
    b: color1.b + (color2.b - color1.b) * clampedFactor,
    intensity: color1.intensity + (color2.intensity - color1.intensity) * clampedFactor
  }
}

/**
 * Create a smooth transition between bloom phases
 */
export function createPhaseTransition(
  fromPhase: 'pre-bloom' | 'bloom' | 'post-bloom' | 'dormant',
  toPhase: 'pre-bloom' | 'bloom' | 'post-bloom' | 'dormant',
  season: 'spring' | 'summer' | 'fall' | 'winter',
  progress: number
): ColorMapping {
  const fromColor = intensityToColor(0.5, fromPhase, season)
  const toColor = intensityToColor(0.5, toPhase, season)
  
  return interpolateColors(fromColor, toColor, progress)
}
