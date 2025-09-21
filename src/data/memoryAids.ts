// Memory Aids and Mnemonics for California Counties
// Structured learning aids to help remember county locations and features

export interface MemoryAid {
  countyId: string;
  locationMnemonic: string;
  shapeMnemonic: string;
  neighboringCounties: string[];
  visualCues: string[];
  associations: string[];
  rhymes?: string;
  acronyms?: string;
}

export const memoryAidsData: MemoryAid[] = [
  // CORNER COUNTIES - Easy to remember as they're at the state's corners
  {
    countyId: 'san-diego',
    locationMnemonic: 'Southwest corner - "Sandy Diego sits at the bottom corner, greeting Mexico"',
    shapeMnemonic: 'Looks like a hand waving at Mexico',
    neighboringCounties: ['imperial', 'riverside', 'orange'],
    visualCues: [
      'Furthest southwest - bottom left corner',
      'Touches Mexico border',
      'Pacific Ocean on the west',
      'Largest county in Southern California by area'
    ],
    associations: [
      'San Diego Zoo → Southernmost major zoo',
      'Navy ships → Guardian of the southern border',
      'Tijuana nearby → International border'
    ],
    rhymes: 'San Diego way below, where the southern borders flow'
  },
  {
    countyId: 'del-norte',
    locationMnemonic: 'Northwest corner - "Del Norte" literally means "of the north"',
    shapeMnemonic: 'Rectangle pressed against Oregon',
    neighboringCounties: ['siskiyou', 'humboldt'],
    visualCues: [
      'Furthest northwest - top left corner',
      'Touches Oregon border',
      'Pacific Ocean on the west',
      'Smallest corner county'
    ],
    associations: [
      'Redwood trees → Tallest trees at the top',
      'Del Norte = "The North" in Spanish',
      'Oregon Trail ended nearby'
    ],
    rhymes: 'Del Norte at the top, where California\'s corner stops'
  },
  {
    countyId: 'imperial',
    locationMnemonic: 'Southeast corner - "Imperial guards the desert corner"',
    shapeMnemonic: 'Large rectangle in the corner, like a cornerstone',
    neighboringCounties: ['san-diego', 'riverside'],
    visualCues: [
      'Furthest southeast - bottom right corner',
      'Touches both Mexico and Arizona',
      'Salton Sea in the north',
      'Desert landscape'
    ],
    associations: [
      'Imperial Valley → Emperor of agriculture',
      'Below sea level → Lowest corner',
      'Desert empire → Imperial Desert'
    ],
    rhymes: 'Imperial in the corner heat, where three borders meet'
  },
  {
    countyId: 'modoc',
    locationMnemonic: 'Northeast corner - "Modoc marks the top right corner"',
    shapeMnemonic: 'Square-ish shape in the corner',
    neighboringCounties: ['siskiyou', 'lassen', 'shasta'],
    visualCues: [
      'Furthest northeast - top right corner',
      'Touches both Oregon and Nevada',
      'High plateau region',
      'Least populated corner'
    ],
    associations: [
      'Modoc Plateau → High corner of California',
      'Lava beds → Volcanic corner',
      'Remote → Most isolated corner'
    ],
    rhymes: 'Modoc in the corner high, where three state borders lie'
  },

  // BAY AREA - Arranged around San Francisco Bay
  {
    countyId: 'san-francisco',
    locationMnemonic: 'Tiny square at the Golden Gate - "The thumb of the hand"',
    shapeMnemonic: 'Small square peninsula, like a postage stamp',
    neighboringCounties: ['marin', 'san-mateo'],
    visualCues: [
      'Smallest county - just 47 square miles',
      'Peninsula tip between bay and ocean',
      'Golden Gate Bridge connects to Marin',
      'Bay Bridge connects to Alameda'
    ],
    associations: [
      'Golden Gate → Gateway position',
      'Smallest but mightiest',
      'City = County (only one like this)'
    ],
    rhymes: 'San Francisco, small and square, guardian of the bay so fair'
  },
  {
    countyId: 'alameda',
    locationMnemonic: 'East of the Bay - "Alameda is All-the-media\'s Oakland home"',
    shapeMnemonic: 'Elongated along the east bay shore',
    neighboringCounties: ['contra-costa', 'santa-clara', 'san-joaquin', 'stanislaus'],
    visualCues: [
      'East side of San Francisco Bay',
      'Oakland directly across from SF',
      'Contains Berkeley (UC)',
      'Long and narrow along bay'
    ],
    associations: [
      'Oakland A\'s → Athletics Alameda',
      'Berkeley → Brainy Bay (UC Berkeley)',
      'BART hub → Bay Area Rapid Transit center'
    ],
    rhymes: 'Alameda holds the east, where Oakland never sleeps'
  },
  {
    countyId: 'marin',
    locationMnemonic: 'North of Golden Gate - "Marin is marvelously north of the bridge"',
    shapeMnemonic: 'Triangle pointing south toward SF',
    neighboringCounties: ['sonoma', 'san-francisco'],
    visualCues: [
      'North of Golden Gate Bridge',
      'Triangle shape with point toward SF',
      'Mount Tamalpais visible',
      'Wealthy suburban peninsula'
    ],
    associations: [
      'Marin → Marine (by the water)',
      'Golden Gate\'s northern anchor',
      'Mount Tam → Marin\'s mountain'
    ],
    rhymes: 'Marin sits north with pride, on the Golden Gate\'s far side'
  },

  // CENTRAL VALLEY - North to South like a spine
  {
    countyId: 'sacramento',
    locationMnemonic: 'Capital in the upper Central Valley - "Sacra-center of government"',
    shapeMnemonic: 'Where two rivers form a Y shape',
    neighboringCounties: ['placer', 'el-dorado', 'amador', 'san-joaquin', 'yolo', 'sutter'],
    visualCues: [
      'Upper Central Valley',
      'Where American and Sacramento rivers meet',
      'Capital star on maps',
      'Center of Northern California'
    ],
    associations: [
      'Capital → Crown of the valley',
      'Sacramento Kings → Valley royalty',
      'Two rivers → Two branches of government'
    ],
    rhymes: 'Sacramento holds the crown, where two rivers flow through town'
  },
  {
    countyId: 'fresno',
    locationMnemonic: 'Dead center of California - "Fresno is in the Fres-NO middle of nowhere"',
    shapeMnemonic: 'Large square in the center, like the bullseye',
    neighboringCounties: ['madera', 'kings', 'tulare', 'inyo', 'mono', 'merced', 'san-benito'],
    visualCues: [
      'Geographic center of California',
      'Largest Central Valley county',
      'Square-ish shape',
      'Surrounded by other counties'
    ],
    associations: [
      'Fresno → Fresh? No! (It\'s hot)',
      'Raisin Capital → Dried in the center',
      'Geographic center → Heart of California'
    ],
    rhymes: 'Fresno in the center sits, where the valley never quits'
  },
  {
    countyId: 'kern',
    locationMnemonic: 'Southern Valley anchor - "Kern is at the valley\'s southern turn"',
    shapeMnemonic: 'Large irregular shape at valley\'s south end',
    neighboringCounties: ['san-luis-obispo', 'santa-barbara', 'ventura', 'los-angeles', 'san-bernardino', 'inyo', 'tulare', 'kings'],
    visualCues: [
      'Southern end of Central Valley',
      'Third largest county by area',
      'Bakersfield at center',
      'Mountains on three sides'
    ],
    associations: [
      'Kern → Core (center of southern valley)',
      'Bakersfield → Baking in the southern heat',
      'Oil fields → Black gold in the south'
    ],
    rhymes: 'Kern commands the southern gate, where the valley meets its fate'
  },

  // MOUNTAIN COUNTIES - Sierra Nevada Chain
  {
    countyId: 'alpine',
    locationMnemonic: 'Alpine = Alps = Highest mountains - "Alpine is literally alpine"',
    shapeMnemonic: 'Small triangle in the high Sierra',
    neighboringCounties: ['el-dorado', 'amador', 'calaveras', 'tuolumne', 'mono'],
    visualCues: [
      'Named Alpine for a reason',
      'Smallest population county',
      'Lake Tahoe area',
      'High elevation throughout'
    ],
    associations: [
      'Alpine → Alps → Highest peaks',
      'Least populated → Too high to live',
      'Bear Valley → Bears in the mountains'
    ],
    rhymes: 'Alpine county, high and small, lowest population of them all'
  },
  {
    countyId: 'mono',
    locationMnemonic: 'Mono Lake is the key - "Mono has one (mono) famous lake"',
    shapeMnemonic: 'Long and thin along Nevada border',
    neighboringCounties: ['tuolumne', 'mariposa', 'madera', 'fresno', 'inyo', 'alpine'],
    visualCues: [
      'Eastern Sierra, touches Nevada',
      'Mono Lake visible on maps',
      'Long north-south orientation',
      'Yosemite\'s eastern gate'
    ],
    associations: [
      'Mono → One → One unique lake',
      'Mono Lake → Alien-looking landmark',
      'Eastern Sierra → Dramatic eastern wall'
    ],
    rhymes: 'Mono on the eastern side, where strange waters do reside'
  },

  // WINE COUNTRY
  {
    countyId: 'napa',
    locationMnemonic: 'Napa Valley runs north-south - "Napa is naturally above San Francisco"',
    shapeMnemonic: 'Elongated valley shape between mountains',
    neighboringCounties: ['sonoma', 'yolo', 'solano', 'lake'],
    visualCues: [
      'North of San Francisco Bay',
      'Long valley orientation',
      'East of Sonoma',
      'Wine glass shape'
    ],
    associations: [
      'Napa → Grapa (grapes)',
      'Wine Valley → Vine Valley',
      'Narrow valley → Wine bottle neck'
    ],
    rhymes: 'Napa Valley, long and fine, filled with vines that make the wine'
  },
  {
    countyId: 'sonoma',
    locationMnemonic: 'Sonoma is west of Napa - "Sonoma by the Sea (almost)"',
    shapeMnemonic: 'Larger than Napa, reaches the coast',
    neighboringCounties: ['mendocino', 'lake', 'napa', 'marin'],
    visualCues: [
      'West of Napa',
      'Touches Pacific Ocean',
      'Larger than Napa',
      'North of Marin'
    ],
    associations: [
      'Sonoma → Soma (body) of wine country',
      'Coastal wines → Ocean influence',
      'Russian River → Runs through it'
    ],
    rhymes: 'Sonoma, wider, by the sea, where the coastal wines run free'
  },

  // COASTAL COUNTIES - Pacific Coast Chain
  {
    countyId: 'monterey',
    locationMnemonic: 'Monterey Bay is the key - "Monterey has the famous aquarium bay"',
    shapeMnemonic: 'Distinctive bay indent on coast',
    neighboringCounties: ['santa-cruz', 'san-benito', 'fresno', 'kings', 'san-luis-obispo'],
    visualCues: [
      'Monterey Bay\'s curve',
      'Central coast position',
      'Large coastal county',
      'Salinas Valley inland'
    ],
    associations: [
      'Monterey → Aquarium → Marine life',
      'Steinbeck country → Cannery Row',
      'Artichokes → Artichoke capital'
    ],
    rhymes: 'Monterey upon the bay, where the sea otters play'
  },
  {
    countyId: 'humboldt',
    locationMnemonic: 'Humboldt has huge trees - "Humboldt holds the redwood giants"',
    shapeMnemonic: 'Large coastal county with Humboldt Bay',
    neighboringCounties: ['del-norte', 'siskiyou', 'trinity', 'mendocino'],
    visualCues: [
      'Humboldt Bay indent',
      'North coast position',
      'Redwood country',
      'Large and rectangular'
    ],
    associations: [
      'Humboldt → Humble giants (redwoods)',
      'Eureka → Found it! (county seat)',
      'Lost Coast → Hidden coastline'
    ],
    rhymes: 'Humboldt, where the tall trees grow, and the coastal fog rolls slow'
  }
];

// Pattern-based memory strategies
export const memoryPatterns = {
  borderCounties: {
    oregon: ['del-norte', 'siskiyou', 'modoc'],
    nevada: ['modoc', 'lassen', 'plumas', 'sierra', 'nevada', 'placer', 'el-dorado', 'alpine', 'mono', 'inyo'],
    arizona: ['imperial', 'riverside', 'san-bernardino'],
    mexico: ['san-diego', 'imperial'],
    pacific: ['del-norte', 'humboldt', 'mendocino', 'sonoma', 'marin', 'san-francisco', 'san-mateo', 'santa-cruz', 'monterey', 'san-luis-obispo', 'santa-barbara', 'ventura', 'los-angeles', 'orange', 'san-diego']
  },

  sizeExtremes: {
    largest: ['san-bernardino', 'inyo', 'kern', 'riverside', 'fresno'],
    smallest: ['san-francisco', 'orange', 'santa-cruz', 'alpine', 'marin']
  },

  shapePatterns: {
    rectangular: ['modoc', 'lassen', 'imperial', 'glenn', 'colusa'],
    triangular: ['alpine', 'marin', 'santa-cruz'],
    elongated: ['napa', 'inyo', 'san-benito'],
    compact: ['san-francisco', 'orange', 'yolo']
  },

  nameOrigins: {
    spanish: ['los-angeles', 'san-diego', 'san-francisco', 'sacramento', 'san-joaquin', 'santa-barbara', 'santa-clara', 'monterey'],
    native: ['modoc', 'shasta', 'tehama', 'tuolumne', 'yolo', 'inyo', 'mono'],
    english: ['orange', 'kings', 'imperial', 'alpine', 'glenn'],
    people: ['humboldt', 'del-norte', 'mendocino', 'lake', 'stanislaus']
  }
};

// Learning progression strategies
export const learningStrategies = {
  beginner: [
    'Start with the four corners: Del Norte (NW), Modoc (NE), Imperial (SE), San Diego (SW)',
    'Learn the coastal counties from north to south like reading a map edge',
    'Identify the Bay Area circle around San Francisco Bay',
    'Find the Central Valley spine from Sacramento to Kern'
  ],

  intermediate: [
    'Group counties by regions and learn neighboring relationships',
    'Use shape patterns - rectangles in the north, irregular in the south',
    'Follow historical routes like El Camino Real',
    'Connect counties with similar names (all the "San" counties)'
  ],

  advanced: [
    'Master the mountain counties along the Sierra Nevada',
    'Learn the complete border sequences',
    'Understand watershed and geographic boundaries',
    'Connect economic and cultural relationships'
  ]
};

// Spatial relationship helpers
export const spatialRelationships = {
  northOf: {
    'los-angeles': ['ventura', 'kern', 'san-bernardino'],
    'san-francisco': ['marin', 'sonoma', 'napa', 'solano'],
    'sacramento': ['sutter', 'yuba', 'placer', 'nevada'],
    'san-diego': ['riverside', 'orange', 'imperial']
  },

  southOf: {
    'sacramento': ['san-joaquin', 'solano', 'yolo'],
    'san-francisco': ['san-mateo', 'alameda', 'santa-clara'],
    'fresno': ['madera', 'merced', 'san-benito']
  },

  eastOf: {
    'san-francisco': ['alameda', 'contra-costa'],
    'los-angeles': ['san-bernardino', 'riverside'],
    'sacramento': ['el-dorado', 'placer', 'nevada']
  },

  westOf: {
    'sacramento': ['yolo', 'solano'],
    'fresno': ['san-benito', 'monterey'],
    'kern': ['san-luis-obispo', 'santa-barbara']
  }
};

// Export helper functions
export function getMemoryAid(countyId: string): MemoryAid | undefined {
  return memoryAidsData.find(aid => aid.countyId === countyId);
}

export function getCountiesByPattern(pattern: keyof typeof memoryPatterns, subPattern?: string): string[] {
  if (subPattern) {
    return (memoryPatterns[pattern] as any)[subPattern] || [];
  }
  return Object.values(memoryPatterns[pattern]).flat();
}

export function getSpatialRelationship(countyId: string, direction: 'northOf' | 'southOf' | 'eastOf' | 'westOf'): string[] {
  return spatialRelationships[direction][countyId] || [];
}

export function getLearningStrategy(level: 'beginner' | 'intermediate' | 'advanced'): string[] {
  return learningStrategies[level];
}