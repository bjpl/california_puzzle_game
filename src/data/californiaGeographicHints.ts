// Geographic hints for California counties
export const geographicHints: Record<string, {
  neighbors?: string[];
  position?: string;
  landmark?: string;
  size?: string;
  coastline?: boolean;
  border?: string;
}> = {
  'Los Angeles': {
    neighbors: ['Ventura', 'Kern', 'San Bernardino', 'Orange'],
    position: 'Southern California, along the coast',
    landmark: 'Hollywood, Beverly Hills, Santa Monica Pier',
    size: 'Most populous county in the USA',
    coastline: true
  },
  'San Diego': {
    neighbors: ['Orange', 'Riverside', 'Imperial'],
    position: 'Southernmost coastal county, Mexican border',
    landmark: 'Balboa Park, Coronado Bridge, Mexican border at Tijuana',
    size: 'Second most populous county in California',
    coastline: true,
    border: 'Mexico'
  },
  'Orange': {
    neighbors: ['Los Angeles', 'San Bernardino', 'Riverside', 'San Diego'],
    position: 'Southern California coast, between LA and San Diego',
    landmark: 'Disneyland in Anaheim, Huntington Beach',
    size: 'Small but densely populated',
    coastline: true
  },
  'San Francisco': {
    neighbors: ['Marin', 'San Mateo'],
    position: 'Northern California, tip of peninsula',
    landmark: 'Golden Gate Bridge, Alcatraz Island',
    size: 'One of the smallest counties',
    coastline: true
  },
  'Alameda': {
    neighbors: ['Contra Costa', 'San Mateo', 'Santa Clara', 'San Joaquin', 'Stanislaus'],
    position: 'East Bay, across from San Francisco',
    landmark: 'Oakland, Berkeley, Bay Bridge eastern end',
    size: 'Medium-sized Bay Area county',
    coastline: true
  },
  'Sacramento': {
    neighbors: ['Yolo', 'Solano', 'Contra Costa', 'San Joaquin', 'Amador', 'El Dorado', 'Placer', 'Sutter'],
    position: 'Central Valley, state capital region',
    landmark: 'State Capitol building, confluence of American and Sacramento rivers',
    size: 'Medium-sized Central Valley county'
  },
  'San Bernardino': {
    neighbors: ['Kern', 'Los Angeles', 'Orange', 'Riverside', 'Inyo', 'Mono'],
    position: 'Southern California, extends to Nevada/Arizona borders',
    landmark: 'Mojave Desert, San Bernardino Mountains',
    size: 'Largest county by area in the USA',
    border: 'Nevada and Arizona'
  },
  'Riverside': {
    neighbors: ['Orange', 'San Bernardino', 'San Diego', 'Imperial'],
    position: 'Southern California inland, extends to Arizona',
    landmark: 'Palm Springs, Coachella Valley',
    size: 'Fourth largest county in California',
    border: 'Arizona'
  },
  'Ventura': {
    neighbors: ['Santa Barbara', 'Kern', 'Los Angeles'],
    position: 'Southern California coast, northwest of LA',
    landmark: 'Channel Islands National Park headquarters',
    size: 'Medium coastal county',
    coastline: true
  },
  'Kern': {
    neighbors: ['San Luis Obispo', 'Santa Barbara', 'Ventura', 'Los Angeles', 'San Bernardino', 'Inyo', 'Tulare', 'Kings'],
    position: 'Southern Central Valley, Tehachapi Mountains',
    landmark: 'Bakersfield, southern end of Central Valley',
    size: 'Third largest county in California'
  },
  'Fresno': {
    neighbors: ['Merced', 'Madera', 'Kings', 'Tulare', 'Monterey', 'San Benito', 'Mariposa', 'Mono', 'Inyo'],
    position: 'Center of California, Central Valley',
    landmark: 'Geographic center of California, agricultural hub',
    size: 'Large Central Valley county'
  },
  'Santa Clara': {
    neighbors: ['Alameda', 'San Mateo', 'Santa Cruz', 'San Benito', 'Merced', 'Stanislaus'],
    position: 'South Bay Area, Silicon Valley',
    landmark: 'San Jose, Stanford University, tech companies',
    size: 'Heart of Silicon Valley'
  },
  'San Mateo': {
    neighbors: ['San Francisco', 'Santa Clara', 'Alameda', 'Santa Cruz'],
    position: 'Peninsula between SF and San Jose',
    landmark: 'SFO Airport, Half Moon Bay',
    size: 'Narrow peninsula county',
    coastline: true
  },
  'Contra Costa': {
    neighbors: ['Solano', 'Sacramento', 'San Joaquin', 'Alameda', 'Marin', 'Napa', 'Yolo'],
    position: 'East Bay, northeast of Oakland',
    landmark: 'Mount Diablo, Richmond Bridge',
    size: 'Large Bay Area county',
    coastline: true
  },
  'Monterey': {
    neighbors: ['Santa Cruz', 'San Benito', 'Fresno', 'Kings', 'San Luis Obispo'],
    position: 'Central Coast, Monterey Bay',
    landmark: 'Monterey Bay Aquarium, Big Sur, Pebble Beach',
    size: 'Large coastal county',
    coastline: true
  },
  'San Joaquin': {
    neighbors: ['Sacramento', 'Contra Costa', 'Alameda', 'Stanislaus', 'Calaveras', 'Amador'],
    position: 'Northern Central Valley, Delta region',
    landmark: 'Stockton, Sacramento-San Joaquin Delta',
    size: 'Central Valley agricultural county'
  },
  'Sonoma': {
    neighbors: ['Mendocino', 'Lake', 'Napa', 'Marin'],
    position: 'North Bay, Wine Country',
    landmark: 'Wine Country, Russian River, Bodega Bay',
    size: 'Large North Bay county',
    coastline: true
  },
  'Tulare': {
    neighbors: ['Fresno', 'Kings', 'Kern', 'Inyo'],
    position: 'Southern Central Valley',
    landmark: 'Sequoia National Park entrance, agricultural center',
    size: 'Central Valley agricultural county'
  },
  'Santa Barbara': {
    neighbors: ['San Luis Obispo', 'Kern', 'Ventura'],
    position: 'Central Coast, "American Riviera"',
    landmark: 'Santa Barbara Mission, Channel Islands',
    size: 'Coastal county with east-west orientation',
    coastline: true
  },
  'Imperial': {
    neighbors: ['San Diego', 'Riverside'],
    position: 'Southeastern corner, Mexican border',
    landmark: 'Salton Sea, Mexican border at Mexicali',
    size: 'Desert county in southeast corner',
    border: 'Mexico and Arizona'
  }
};

// Helper function to determine hint characteristics
export function getCountyCharacteristics(countyName: string) {
  const hints = geographicHints[countyName];
  if (!hints) return {};

  return {
    isCoastal: hints.coastline || false,
    isBorder: !!hints.border,
    borderLocation: hints.border,
    isLarge: hints.size?.includes('largest') || hints.size?.includes('Large'),
    isSmall: hints.size?.includes('smallest') || hints.size?.includes('Small'),
    region: determineRegion(countyName)
  };
}

function determineRegion(countyName: string): string {
  const regions: Record<string, string[]> = {
    'Bay Area': ['San Francisco', 'Alameda', 'Contra Costa', 'Marin', 'Napa', 'San Mateo', 'Santa Clara', 'Solano', 'Sonoma'],
    'Southern California': ['Los Angeles', 'Orange', 'San Diego', 'Imperial', 'Riverside', 'San Bernardino', 'Ventura', 'Santa Barbara'],
    'Central Valley': ['Sacramento', 'San Joaquin', 'Stanislaus', 'Merced', 'Madera', 'Fresno', 'Kings', 'Tulare', 'Kern'],
    'Central Coast': ['Monterey', 'San Luis Obispo', 'Santa Cruz', 'San Benito'],
    'Northern California': ['Butte', 'Colusa', 'Glenn', 'Lake', 'Mendocino', 'Shasta', 'Sutter', 'Tehama', 'Trinity', 'Yolo'],
    'Sierra Nevada': ['Alpine', 'Amador', 'Calaveras', 'El Dorado', 'Inyo', 'Mariposa', 'Mono', 'Nevada', 'Placer', 'Plumas', 'Sierra', 'Tuolumne'],
    'North Coast': ['Del Norte', 'Humboldt', 'Mendocino']
  };

  for (const [region, counties] of Object.entries(regions)) {
    if (counties.includes(countyName)) {
      return region;
    }
  }
  return 'California';
}