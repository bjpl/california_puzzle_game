// Geographic hints for California counties - All 58 Counties
export const geographicHints: Record<string, {
  neighbors?: string[];
  position?: string;
  landmark?: string;
  size?: string;
  coastline?: boolean;
  border?: string;
}> = {
  // Southern California Region
  'Los Angeles': {
    neighbors: ['Ventura', 'Kern', 'San Bernardino', 'Orange'],
    position: 'Southern California, along the coast',
    landmark: 'Hollywood, Beverly Hills, Santa Monica Pier, Griffith Observatory',
    size: 'Most populous county in the USA (10+ million)',
    coastline: true
  },
  'San Diego': {
    neighbors: ['Orange', 'Riverside', 'Imperial'],
    position: 'Southernmost coastal county, Mexican border',
    landmark: 'Balboa Park, Coronado Bridge, San Diego Zoo, Mexican border at Tijuana',
    size: 'Second most populous county in California',
    coastline: true,
    border: 'Mexico'
  },
  'Orange': {
    neighbors: ['Los Angeles', 'San Bernardino', 'Riverside', 'San Diego'],
    position: 'Southern California coast, between LA and San Diego',
    landmark: 'Disneyland in Anaheim, Huntington Beach, Newport Beach',
    size: 'Small but densely populated (3+ million)',
    coastline: true
  },
  'Riverside': {
    neighbors: ['Orange', 'San Bernardino', 'San Diego', 'Imperial'],
    position: 'Southern California inland, extends to Arizona',
    landmark: 'Palm Springs, Coachella Valley, Temecula wine country',
    size: 'Fourth largest county in California by area',
    border: 'Arizona'
  },
  'San Bernardino': {
    neighbors: ['Kern', 'Los Angeles', 'Orange', 'Riverside', 'Inyo', 'Mono'],
    position: 'Southern California, extends to Nevada/Arizona borders',
    landmark: 'Mojave Desert, San Bernardino Mountains, Big Bear Lake',
    size: 'Largest county by area in the USA',
    border: 'Nevada and Arizona'
  },
  'Ventura': {
    neighbors: ['Santa Barbara', 'Kern', 'Los Angeles'],
    position: 'Southern California coast, northwest of LA',
    landmark: 'Channel Islands National Park headquarters, Oxnard beaches',
    size: 'Medium coastal county',
    coastline: true
  },
  'Imperial': {
    neighbors: ['San Diego', 'Riverside'],
    position: 'Southeastern corner, Mexican border, lowest point in California',
    landmark: 'Salton Sea, Mexican border at Mexicali, Imperial Sand Dunes',
    size: 'Desert county in southeast corner',
    border: 'Mexico and Arizona'
  },

  // Bay Area Region
  'San Francisco': {
    neighbors: ['Marin', 'San Mateo'],
    position: 'Northern California, tip of peninsula',
    landmark: 'Golden Gate Bridge, Alcatraz Island, Fisherman\'s Wharf',
    size: 'One of the smallest counties (47 sq mi)',
    coastline: true
  },
  'Alameda': {
    neighbors: ['Contra Costa', 'San Mateo', 'Santa Clara', 'San Joaquin', 'Stanislaus'],
    position: 'East Bay, across from San Francisco',
    landmark: 'Oakland, Berkeley, UC Berkeley, Bay Bridge eastern end',
    size: 'Medium-sized Bay Area county',
    coastline: true
  },
  'Santa Clara': {
    neighbors: ['Alameda', 'San Mateo', 'Santa Cruz', 'San Benito', 'Merced', 'Stanislaus'],
    position: 'South Bay Area, Silicon Valley',
    landmark: 'San Jose, Stanford University, Apple HQ, Google HQ',
    size: 'Heart of Silicon Valley'
  },
  'San Mateo': {
    neighbors: ['San Francisco', 'Santa Clara', 'Alameda', 'Santa Cruz'],
    position: 'Peninsula between SF and San Jose',
    landmark: 'SFO Airport, Half Moon Bay, Facebook HQ',
    size: 'Narrow peninsula county',
    coastline: true
  },
  'Contra Costa': {
    neighbors: ['Solano', 'Sacramento', 'San Joaquin', 'Alameda', 'Marin', 'Napa', 'Yolo'],
    position: 'East Bay, northeast of Oakland',
    landmark: 'Mount Diablo, Richmond Bridge, Concord',
    size: 'Large Bay Area county',
    coastline: true
  },
  'Marin': {
    neighbors: ['Sonoma', 'San Francisco', 'Contra Costa'],
    position: 'North of Golden Gate Bridge',
    landmark: 'Golden Gate Bridge (north side), Muir Woods, Mount Tamalpais',
    size: 'Wealthy suburban county north of SF',
    coastline: true
  },
  'Solano': {
    neighbors: ['Napa', 'Yolo', 'Sacramento', 'Contra Costa', 'Sonoma'],
    position: 'Northeast Bay Area, between Bay and Central Valley',
    landmark: 'Travis Air Force Base, Vallejo (former state capital)',
    size: 'Eastern edge of Bay Area'
  },
  'Napa': {
    neighbors: ['Sonoma', 'Lake', 'Yolo', 'Solano'],
    position: 'North Bay, famous wine country',
    landmark: 'Napa Valley wineries, hot air balloons, St. Helena',
    size: 'Small wine country county'
  },
  'Sonoma': {
    neighbors: ['Mendocino', 'Lake', 'Napa', 'Marin'],
    position: 'North Bay, Wine Country and coast',
    landmark: 'Wine Country, Russian River, Bodega Bay, Santa Rosa',
    size: 'Large North Bay county',
    coastline: true
  },

  // Central Valley Region
  'Sacramento': {
    neighbors: ['Yolo', 'Solano', 'Contra Costa', 'San Joaquin', 'Amador', 'El Dorado', 'Placer', 'Sutter'],
    position: 'Central Valley, state capital region',
    landmark: 'State Capitol building, American and Sacramento rivers confluence',
    size: 'Medium-sized Central Valley county'
  },
  'San Joaquin': {
    neighbors: ['Sacramento', 'Contra Costa', 'Alameda', 'Stanislaus', 'Calaveras', 'Amador'],
    position: 'Northern Central Valley, Delta region',
    landmark: 'Stockton, Sacramento-San Joaquin Delta, Port of Stockton',
    size: 'Central Valley agricultural county'
  },
  'Fresno': {
    neighbors: ['Merced', 'Madera', 'Kings', 'Tulare', 'Monterey', 'San Benito', 'Mariposa', 'Mono', 'Inyo'],
    position: 'Center of California, Central Valley',
    landmark: 'Geographic center of California, Fresno (5th largest city)',
    size: 'Large Central Valley county, 6th largest in CA'
  },
  'Kern': {
    neighbors: ['San Luis Obispo', 'Santa Barbara', 'Ventura', 'Los Angeles', 'San Bernardino', 'Inyo', 'Tulare', 'Kings'],
    position: 'Southern Central Valley, Tehachapi Mountains',
    landmark: 'Bakersfield, southern end of Central Valley, oil fields',
    size: 'Third largest county in California'
  },
  'Tulare': {
    neighbors: ['Fresno', 'Kings', 'Kern', 'Inyo'],
    position: 'Southern Central Valley',
    landmark: 'Sequoia National Park entrance, Visalia, agricultural center',
    size: 'Central Valley agricultural county'
  },
  'Stanislaus': {
    neighbors: ['San Joaquin', 'Alameda', 'Santa Clara', 'Merced', 'Mariposa', 'Tuolumne', 'Calaveras'],
    position: 'Central Valley, east of Bay Area',
    landmark: 'Modesto, agricultural hub, "Water Wealth Contentment Health"',
    size: 'Medium Central Valley county'
  },
  'Merced': {
    neighbors: ['Stanislaus', 'Santa Clara', 'San Benito', 'Fresno', 'Madera', 'Mariposa'],
    position: 'Central Valley, gateway to Yosemite',
    landmark: 'UC Merced, Castle Air Museum, gateway to Yosemite',
    size: 'Central Valley agricultural county'
  },
  'Kings': {
    neighbors: ['Fresno', 'Tulare', 'Kern', 'Monterey', 'San Luis Obispo'],
    position: 'Central Valley, southwest of Fresno',
    landmark: 'Hanford, Lemoore Naval Air Station',
    size: 'Small Central Valley county'
  },
  'Madera': {
    neighbors: ['Merced', 'Fresno', 'Mono', 'Mariposa'],
    position: 'Central Valley, north of Fresno',
    landmark: 'Bass Lake, southern Yosemite entrance, wine country',
    size: 'Central Valley county with Sierra foothills'
  },
  'Yolo': {
    neighbors: ['Colusa', 'Sutter', 'Sacramento', 'Solano', 'Napa', 'Lake'],
    position: 'Central Valley, west of Sacramento',
    landmark: 'UC Davis, agricultural research, Davis',
    size: 'Medium agricultural county'
  },
  'Sutter': {
    neighbors: ['Butte', 'Yuba', 'Placer', 'Sacramento', 'Yolo', 'Colusa'],
    position: 'Northern Central Valley',
    landmark: 'Sutter Buttes (smallest mountain range in the world)',
    size: 'Small Central Valley county'
  },
  'Yuba': {
    neighbors: ['Butte', 'Plumas', 'Sierra', 'Nevada', 'Placer', 'Sutter'],
    position: 'Northern Central Valley, foothills',
    landmark: 'Marysville, Beale Air Force Base',
    size: 'Small county between valley and mountains'
  },

  // Central Coast Region
  'Monterey': {
    neighbors: ['Santa Cruz', 'San Benito', 'Fresno', 'Kings', 'San Luis Obispo'],
    position: 'Central Coast, Monterey Bay',
    landmark: 'Monterey Bay Aquarium, Big Sur, Pebble Beach, Carmel',
    size: 'Large coastal county',
    coastline: true
  },
  'Santa Barbara': {
    neighbors: ['San Luis Obispo', 'Kern', 'Ventura'],
    position: 'Central Coast, "American Riviera"',
    landmark: 'Santa Barbara Mission, Channel Islands, UCSB',
    size: 'Coastal county with unique east-west orientation',
    coastline: true
  },
  'San Luis Obispo': {
    neighbors: ['Monterey', 'Kings', 'Kern', 'Santa Barbara'],
    position: 'Central Coast, halfway between LA and SF',
    landmark: 'Hearst Castle, Cal Poly, Pismo Beach, Morro Bay',
    size: 'Large Central Coast county',
    coastline: true
  },
  'Santa Cruz': {
    neighbors: ['San Mateo', 'Santa Clara', 'San Benito', 'Monterey'],
    position: 'Central Coast, north of Monterey Bay',
    landmark: 'Santa Cruz Beach Boardwalk, UC Santa Cruz, redwoods',
    size: 'Small coastal county',
    coastline: true
  },
  'San Benito': {
    neighbors: ['Santa Clara', 'Santa Cruz', 'Monterey', 'Fresno', 'Merced'],
    position: 'Inland from Monterey Bay',
    landmark: 'Pinnacles National Park, San Juan Bautista Mission',
    size: 'Small inland county'
  },

  // Northern California Region
  'Shasta': {
    neighbors: ['Siskiyou', 'Modoc', 'Lassen', 'Plumas', 'Tehama', 'Trinity'],
    position: 'Northern California, Mount Shasta region',
    landmark: 'Mount Shasta, Shasta Lake, Redding, Sundial Bridge',
    size: 'Large northern county'
  },
  'Butte': {
    neighbors: ['Tehama', 'Plumas', 'Yuba', 'Sutter', 'Colusa', 'Glenn'],
    position: 'Northern Central Valley',
    landmark: 'Chico, CSU Chico, Oroville Dam (tallest in US)',
    size: 'Northern Valley county'
  },
  'Tehama': {
    neighbors: ['Shasta', 'Trinity', 'Mendocino', 'Glenn', 'Butte', 'Plumas'],
    position: 'Northern California, upper Central Valley',
    landmark: 'Red Bluff, Sacramento River, Lassen Volcanic National Park access',
    size: 'Rural northern county'
  },
  'Glenn': {
    neighbors: ['Tehama', 'Mendocino', 'Lake', 'Colusa', 'Butte'],
    position: 'Northern Central Valley, west side',
    landmark: 'Black Butte Lake, agricultural area',
    size: 'Small agricultural county'
  },
  'Colusa': {
    neighbors: ['Glenn', 'Butte', 'Sutter', 'Yolo', 'Lake'],
    position: 'Northern Central Valley, west of Sacramento River',
    landmark: 'Sacramento River, rice farming, wildlife refuges',
    size: 'Small agricultural county'
  },
  'Siskiyou': {
    neighbors: ['Del Norte', 'Modoc', 'Shasta', 'Trinity'],
    position: 'Northernmost California, Oregon border',
    landmark: 'Mount Shasta (peak), Klamath River, Oregon border',
    size: 'Fifth largest county in California',
    border: 'Oregon'
  },
  'Modoc': {
    neighbors: ['Siskiyou', 'Shasta', 'Lassen'],
    position: 'Northeastern corner, Nevada/Oregon borders',
    landmark: 'Alturas, Modoc National Forest, lava beds',
    size: 'Remote northeastern county',
    border: 'Oregon and Nevada'
  },
  'Lassen': {
    neighbors: ['Modoc', 'Shasta', 'Plumas', 'Sierra'],
    position: 'Northeastern California',
    landmark: 'Lassen Volcanic National Park, Susanville',
    size: 'Large northeastern county',
    border: 'Nevada'
  },
  'Trinity': {
    neighbors: ['Siskiyou', 'Shasta', 'Tehama', 'Mendocino', 'Humboldt'],
    position: 'Northwestern California, no incorporated cities',
    landmark: 'Trinity Alps, Weaverville, Trinity Lake',
    size: 'Large mountainous county with smallest population'
  },

  // North Coast Region
  'Humboldt': {
    neighbors: ['Del Norte', 'Siskiyou', 'Trinity', 'Mendocino'],
    position: 'North Coast, Redwood Country',
    landmark: 'Redwood National and State Parks, Eureka, Humboldt Bay',
    size: 'Large coastal county',
    coastline: true
  },
  'Mendocino': {
    neighbors: ['Humboldt', 'Trinity', 'Tehama', 'Glenn', 'Lake', 'Sonoma'],
    position: 'North Coast, south of Humboldt',
    landmark: 'Mendocino village, Fort Bragg, coastal redwoods',
    size: 'Large coastal county',
    coastline: true
  },
  'Del Norte': {
    neighbors: ['Siskiyou', 'Humboldt'],
    position: 'Northwestern corner, Oregon border',
    landmark: 'Crescent City, Redwood National Park, Oregon border',
    size: 'Small northwestern county',
    coastline: true,
    border: 'Oregon'
  },
  'Lake': {
    neighbors: ['Mendocino', 'Glenn', 'Colusa', 'Yolo', 'Napa', 'Sonoma'],
    position: 'North of Bay Area, inland',
    landmark: 'Clear Lake (largest natural lake in CA), wine country',
    size: 'Small inland county'
  },

  // Sierra Nevada Region
  'Placer': {
    neighbors: ['Nevada', 'Yuba', 'Sutter', 'Sacramento', 'El Dorado'],
    position: 'Sierra foothills to Lake Tahoe',
    landmark: 'Lake Tahoe (north shore), Auburn, Roseville',
    size: 'From valley to high Sierra'
  },
  'El Dorado': {
    neighbors: ['Sacramento', 'Amador', 'Alpine', 'Nevada', 'Placer'],
    position: 'Sierra Nevada, Lake Tahoe south shore',
    landmark: 'Lake Tahoe (south shore), Placerville, gold country',
    size: 'Mountain county east of Sacramento'
  },
  'Nevada': {
    neighbors: ['Placer', 'Sierra', 'Yuba'],
    position: 'Northern Sierra Nevada',
    landmark: 'Nevada City, Grass Valley, gold rush towns',
    size: 'Small mountain county'
  },
  'Sierra': {
    neighbors: ['Plumas', 'Yuba', 'Nevada'],
    position: 'Northern Sierra Nevada',
    landmark: 'Downieville, Sierra Buttes, tiny mountain county',
    size: 'Second smallest county by population'
  },
  'Plumas': {
    neighbors: ['Shasta', 'Lassen', 'Sierra', 'Yuba', 'Butte', 'Tehama'],
    position: 'Northern Sierra Nevada',
    landmark: 'Lake Almanor, Feather River, Quincy',
    size: 'Large mountain county',
    border: 'Nevada'
  },
  'Amador': {
    neighbors: ['Sacramento', 'San Joaquin', 'Calaveras', 'Alpine', 'El Dorado'],
    position: 'Sierra foothills, gold country',
    landmark: 'Sutter Creek, Jackson, gold rush towns',
    size: 'Small foothill county'
  },
  'Calaveras': {
    neighbors: ['San Joaquin', 'Stanislaus', 'Tuolumne', 'Alpine', 'Amador'],
    position: 'Sierra foothills',
    landmark: 'Angels Camp (jumping frogs), Murphys, Big Trees State Park',
    size: 'Foothill county'
  },
  'Tuolumne': {
    neighbors: ['Stanislaus', 'Merced', 'Mariposa', 'Mono', 'Alpine', 'Calaveras'],
    position: 'Sierra Nevada, Yosemite region',
    landmark: 'Yosemite National Park (northern part), Sonora',
    size: 'Large mountain county'
  },
  'Mariposa': {
    neighbors: ['Merced', 'Madera', 'Mono', 'Tuolumne', 'Stanislaus'],
    position: 'Sierra Nevada, Yosemite',
    landmark: 'Yosemite Valley, Half Dome, El Capitan',
    size: 'Small mountain county, mostly Yosemite'
  },
  'Mono': {
    neighbors: ['Tuolumne', 'Mariposa', 'Madera', 'Fresno', 'Inyo'],
    position: 'Eastern Sierra, Nevada border',
    landmark: 'Mono Lake, Mammoth Mountain ski resort, Yosemite east entrance',
    size: 'Large eastern Sierra county',
    border: 'Nevada'
  },
  'Inyo': {
    neighbors: ['Mono', 'Fresno', 'Tulare', 'Kern', 'San Bernardino'],
    position: 'Eastern California, Nevada border',
    landmark: 'Mount Whitney (highest peak in lower 48), Death Valley (lowest point)',
    size: 'Second largest county in California',
    border: 'Nevada'
  },
  'Alpine': {
    neighbors: ['El Dorado', 'Amador', 'Calaveras', 'Tuolumne', 'Mono'],
    position: 'Eastern Sierra, south of Lake Tahoe',
    landmark: 'Markleeville, least populated county in California',
    size: 'Smallest county by population',
    border: 'Nevada'
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
    'Southern California': ['Los Angeles', 'Orange', 'San Diego', 'Imperial', 'Riverside', 'San Bernardino', 'Ventura'],
    'Central Valley': ['Sacramento', 'San Joaquin', 'Stanislaus', 'Merced', 'Madera', 'Fresno', 'Kings', 'Tulare', 'Kern', 'Butte', 'Colusa', 'Glenn', 'Sutter', 'Yolo', 'Yuba'],
    'Central Coast': ['Monterey', 'San Luis Obispo', 'Santa Barbara', 'Santa Cruz', 'San Benito'],
    'Northern California': ['Shasta', 'Siskiyou', 'Modoc', 'Lassen', 'Tehama', 'Trinity'],
    'Sierra Nevada': ['Alpine', 'Amador', 'Calaveras', 'El Dorado', 'Inyo', 'Mariposa', 'Mono', 'Nevada', 'Placer', 'Plumas', 'Sierra', 'Tuolumne'],
    'North Coast': ['Del Norte', 'Humboldt', 'Lake', 'Mendocino']
  };

  for (const [region, counties] of Object.entries(regions)) {
    if (counties.includes(countyName)) {
      return region;
    }
  }
  return 'California';
}