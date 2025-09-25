/**
 * Centralized Region Color Configuration
 * This file provides a single source of truth for all region colors across the application
 *
 * PATTERN: Configuration Object Pattern
 * WHY: Centralizing configuration prevents inconsistencies and makes updates easier
 * CONCEPT: Single Source of Truth (SSOT) principle
 */

export interface RegionColorConfig {
  hex: string;           // For SVG/Canvas rendering
  tailwindGradient: string;  // For gradient backgrounds
  tailwindBg: string;    // For solid backgrounds
  tailwindBorder: string; // For borders
  tailwindText: string;  // For text
  tailwindLight: string; // For light backgrounds
  tailwindLightBorder: string; // For light borders
  name: string;          // Human-readable color name
}

export const REGION_COLORS: Record<string, RegionColorConfig> = {
  'Southern California': {
    hex: '#ef4444',
    tailwindGradient: 'from-red-400 to-red-500',
    tailwindBg: 'bg-red-500',
    tailwindBorder: 'border-red-400',
    tailwindText: 'text-red-900',
    tailwindLight: 'bg-red-100',
    tailwindLightBorder: 'border-red-400',
    name: 'Red'
  },
  'Bay Area': {
    hex: '#3b82f6',
    tailwindGradient: 'from-blue-400 to-blue-500',
    tailwindBg: 'bg-blue-500',
    tailwindBorder: 'border-blue-400',
    tailwindText: 'text-blue-900',
    tailwindLight: 'bg-blue-100',
    tailwindLightBorder: 'border-blue-400',
    name: 'Blue'
  },
  'Central Valley': {
    hex: '#22c55e',
    tailwindGradient: 'from-green-400 to-green-500',
    tailwindBg: 'bg-green-500',
    tailwindBorder: 'border-green-400',
    tailwindText: 'text-green-900',
    tailwindLight: 'bg-green-100',
    tailwindLightBorder: 'border-green-400',
    name: 'Green'
  },
  'Central Coast': {
    hex: '#a855f7',
    tailwindGradient: 'from-purple-400 to-purple-500',
    tailwindBg: 'bg-purple-500',
    tailwindBorder: 'border-purple-400',
    tailwindText: 'text-purple-900',
    tailwindLight: 'bg-purple-100',
    tailwindLightBorder: 'border-purple-400',
    name: 'Purple'
  },
  'Northern California': {
    hex: '#f97316',
    tailwindGradient: 'from-orange-400 to-orange-500',
    tailwindBg: 'bg-orange-500',
    tailwindBorder: 'border-orange-400',
    tailwindText: 'text-orange-900',
    tailwindLight: 'bg-orange-100',
    tailwindLightBorder: 'border-orange-400',
    name: 'Orange'
  },
  'Sierra Nevada': {
    hex: '#eab308',
    tailwindGradient: 'from-yellow-400 to-yellow-500',
    tailwindBg: 'bg-yellow-500',
    tailwindBorder: 'border-yellow-400',
    tailwindText: 'text-yellow-900',
    tailwindLight: 'bg-yellow-100',
    tailwindLightBorder: 'border-yellow-400',
    name: 'Yellow'
  },
  'North Coast': {
    hex: '#14b8a6',
    tailwindGradient: 'from-teal-400 to-teal-500',
    tailwindBg: 'bg-teal-500',
    tailwindBorder: 'border-teal-400',
    tailwindText: 'text-teal-900',
    tailwindLight: 'bg-teal-100',
    tailwindLightBorder: 'border-teal-400',
    name: 'Teal'
  }
};

// Sub-region mappings (for counties that use different region names)
export const SUB_REGION_MAPPING: Record<string, string> = {
  'Sacramento Valley': 'Northern California',
  'San Joaquin Valley': 'Central Valley',
  'Desert': 'Southern California',
  'Inland Empire': 'Southern California',
  'Greater Los Angeles': 'Southern California',
  'San Francisco Bay Area': 'Bay Area'
};

/**
 * Get the color configuration for a region
 * @param region - The region name
 * @returns RegionColorConfig or a default gray configuration
 */
export function getRegionColor(region: string): RegionColorConfig {
  // First check if it's a sub-region that maps to a main region
  const mappedRegion = SUB_REGION_MAPPING[region] || region;

  // Return the color config or a default
  return REGION_COLORS[mappedRegion] || {
    hex: '#6b7280',
    tailwindGradient: 'from-gray-400 to-gray-500',
    tailwindBg: 'bg-gray-500',
    tailwindBorder: 'border-gray-400',
    tailwindText: 'text-gray-900',
    tailwindLight: 'bg-gray-100',
    tailwindLightBorder: 'border-gray-400',
    name: 'Gray'
  };
}

/**
 * Get just the hex color for a region (for backwards compatibility)
 * @param region - The region name
 * @returns Hex color string
 */
export function getRegionHexColor(region: string): string {
  return getRegionColor(region).hex;
}

// Export a simple object for components that just need hex colors
export const REGION_HEX_COLORS: Record<string, string> = Object.entries(REGION_COLORS).reduce(
  (acc, [region, config]) => {
    acc[region] = config.hex;
    return acc;
  },
  {} as Record<string, string>
);