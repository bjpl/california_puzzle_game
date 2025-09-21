import { County, CaliforniaRegion, DifficultyLevel } from '@/types';

// California county data with regions and difficulty classifications
export const CALIFORNIA_COUNTIES: County[] = [
  // Bay Area Counties
  {
    id: 'alameda',
    name: 'Alameda',
    fips: '06001',
    region: CaliforniaRegion.BAY_AREA,
    population: 1671329,
    area: 738.4,
    geometry: {} as GeoJSON.Geometry, // Will be loaded from TopoJSON
    centroid: [-122.0822, 37.6463],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'contra_costa',
    name: 'Contra Costa',
    fips: '06013',
    region: CaliforniaRegion.BAY_AREA,
    population: 1165927,
    area: 716.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-121.9018, 37.8534],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'marin',
    name: 'Marin',
    fips: '06041',
    region: CaliforniaRegion.BAY_AREA,
    population: 262321,
    area: 520.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-122.7633, 38.0834],
    difficulty: DifficultyLevel.EASY
  },
  {
    id: 'napa',
    name: 'Napa',
    fips: '06055',
    region: CaliforniaRegion.BAY_AREA,
    population: 138019,
    area: 754.2,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-122.2654, 38.5025],
    difficulty: DifficultyLevel.EASY
  },
  {
    id: 'san_francisco',
    name: 'San Francisco',
    fips: '06075',
    region: CaliforniaRegion.BAY_AREA,
    population: 873965,
    area: 46.9,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-122.4194, 37.7749],
    difficulty: DifficultyLevel.EASY
  },
  {
    id: 'san_mateo',
    name: 'San Mateo',
    fips: '06081',
    region: CaliforniaRegion.BAY_AREA,
    population: 766573,
    area: 449.2,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-122.3255, 37.5630],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'santa_clara',
    name: 'Santa Clara',
    fips: '06085',
    region: CaliforniaRegion.BAY_AREA,
    population: 1927852,
    area: 1290.8,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-121.7195, 37.2744],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'solano',
    name: 'Solano',
    fips: '06095',
    region: CaliforniaRegion.BAY_AREA,
    population: 447643,
    area: 829.3,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-122.0004, 38.3105],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'sonoma',
    name: 'Sonoma',
    fips: '06097',
    region: CaliforniaRegion.BAY_AREA,
    population: 488863,
    area: 1575.8,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-122.8580, 38.5780],
    difficulty: DifficultyLevel.MEDIUM
  },

  // Los Angeles Area (Southern California)
  {
    id: 'los_angeles',
    name: 'Los Angeles',
    fips: '06037',
    region: CaliforniaRegion.SOUTHERN,
    population: 10014009,
    area: 4751.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-118.2437, 34.0522],
    difficulty: DifficultyLevel.HARD
  },
  {
    id: 'orange',
    name: 'Orange',
    fips: '06059',
    region: CaliforniaRegion.SOUTHERN,
    population: 3186989,
    area: 948.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-117.8311, 33.7175],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'riverside',
    name: 'Riverside',
    fips: '06065',
    region: CaliforniaRegion.SOUTHERN,
    population: 2458395,
    area: 7208.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-116.4194, 33.7806],
    difficulty: DifficultyLevel.HARD
  },
  {
    id: 'san_bernardino',
    name: 'San Bernardino',
    fips: '06071',
    region: CaliforniaRegion.SOUTHERN,
    population: 2180085,
    area: 20105.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-116.4194, 34.8194],
    difficulty: DifficultyLevel.EXPERT
  },
  {
    id: 'ventura',
    name: 'Ventura',
    fips: '06111',
    region: CaliforniaRegion.SOUTHERN,
    population: 843843,
    area: 1845.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-119.1391, 34.3681],
    difficulty: DifficultyLevel.MEDIUM
  },

  // San Diego Area
  {
    id: 'san_diego',
    name: 'San Diego',
    fips: '06073',
    region: CaliforniaRegion.SOUTHERN,
    population: 3338330,
    area: 4206.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-116.7664, 32.8801],
    difficulty: DifficultyLevel.HARD
  },
  {
    id: 'imperial',
    name: 'Imperial',
    fips: '06025',
    region: CaliforniaRegion.SOUTHERN,
    population: 181215,
    area: 4175.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-115.4734, 33.0114],
    difficulty: DifficultyLevel.MEDIUM
  },

  // Central Valley
  {
    id: 'fresno',
    name: 'Fresno',
    fips: '06019',
    region: CaliforniaRegion.CENTRAL_VALLEY,
    population: 999101,
    area: 5958.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-119.2321, 36.7378],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'kern',
    name: 'Kern',
    fips: '06029',
    region: CaliforniaRegion.CENTRAL_VALLEY,
    population: 900202,
    area: 8141.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-118.8597, 35.3738],
    difficulty: DifficultyLevel.HARD
  },
  {
    id: 'kings',
    name: 'Kings',
    fips: '06031',
    region: CaliforniaRegion.CENTRAL_VALLEY,
    population: 152940,
    area: 1389.6,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-119.8779, 36.0633],
    difficulty: DifficultyLevel.EASY
  },
  {
    id: 'madera',
    name: 'Madera',
    fips: '06039',
    region: CaliforniaRegion.CENTRAL_VALLEY,
    population: 157327,
    area: 2137.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-119.8006, 37.0085],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'merced',
    name: 'Merced',
    fips: '06047',
    region: CaliforniaRegion.CENTRAL_VALLEY,
    population: 281202,
    area: 1929.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-120.7463, 37.1552],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'san_joaquin',
    name: 'San Joaquin',
    fips: '06077',
    region: CaliforniaRegion.CENTRAL_VALLEY,
    population: 779233,
    area: 1399.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-121.2501, 37.9577],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'stanislaus',
    name: 'Stanislaus',
    fips: '06099',
    region: CaliforniaRegion.CENTRAL_VALLEY,
    population: 552878,
    area: 1494.7,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-120.9876, 37.5091],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'tulare',
    name: 'Tulare',
    fips: '06107',
    region: CaliforniaRegion.CENTRAL_VALLEY,
    population: 473117,
    area: 4839.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-118.7434, 36.2077],
    difficulty: DifficultyLevel.HARD
  },

  // Central Coast
  {
    id: 'monterey',
    name: 'Monterey',
    fips: '06053',
    region: CaliforniaRegion.COASTAL,
    population: 434061,
    area: 3281.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-121.0943, 36.2333],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'san_benito',
    name: 'San Benito',
    fips: '06069',
    region: CaliforniaRegion.CENTRAL,
    population: 64209,
    area: 1389.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-121.0681, 36.5761],
    difficulty: DifficultyLevel.EASY
  },
  {
    id: 'san_luis_obispo',
    name: 'San Luis Obispo',
    fips: '06079',
    region: CaliforniaRegion.COASTAL,
    population: 282424,
    area: 3304.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-120.4358, 35.3102],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'santa_barbara',
    name: 'Santa Barbara',
    fips: '06083',
    region: CaliforniaRegion.COASTAL,
    population: 446475,
    area: 2737.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-119.9579, 34.5708],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'santa_cruz',
    name: 'Santa Cruz',
    fips: '06087',
    region: CaliforniaRegion.COASTAL,
    population: 270861,
    area: 445.2,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-122.0308, 37.0431],
    difficulty: DifficultyLevel.EASY
  },

  // Northern California
  {
    id: 'butte',
    name: 'Butte',
    fips: '06007',
    region: CaliforniaRegion.NORTHERN,
    population: 211313,
    area: 1636.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-121.6169, 39.6270],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'colusa',
    name: 'Colusa',
    fips: '06011',
    region: CaliforniaRegion.NORTHERN,
    population: 21839,
    area: 1150.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-122.2094, 39.0145],
    difficulty: DifficultyLevel.EASY
  },
  {
    id: 'el_dorado',
    name: 'El Dorado',
    fips: '06017',
    region: CaliforniaRegion.NORTHERN,
    population: 191185,
    area: 1708.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-120.4357, 38.7265],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'glenn',
    name: 'Glenn',
    fips: '06021',
    region: CaliforniaRegion.NORTHERN,
    population: 28393,
    area: 1315.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-122.3778, 39.5885],
    difficulty: DifficultyLevel.EASY
  },
  {
    id: 'lake',
    name: 'Lake',
    fips: '06033',
    region: CaliforniaRegion.NORTHERN,
    population: 64386,
    area: 1256.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-122.8498, 39.0840],
    difficulty: DifficultyLevel.EASY
  },
  {
    id: 'mendocino',
    name: 'Mendocino',
    fips: '06045',
    region: CaliforniaRegion.NORTHERN,
    population: 86749,
    area: 3506.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-123.7983, 39.3080],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'nevada',
    name: 'Nevada',
    fips: '06057',
    region: CaliforniaRegion.NORTHERN,
    population: 102241,
    area: 958.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-121.0153, 39.2658],
    difficulty: DifficultyLevel.EASY
  },
  {
    id: 'placer',
    name: 'Placer',
    fips: '06061',
    region: CaliforniaRegion.NORTHERN,
    population: 404739,
    area: 1407.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-120.8039, 39.0916],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'sacramento',
    name: 'Sacramento',
    fips: '06067',
    region: CaliforniaRegion.NORTHERN,
    population: 1585055,
    area: 966.2,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-121.3269, 38.4747],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'shasta',
    name: 'Shasta',
    fips: '06089',
    region: CaliforniaRegion.NORTHERN,
    population: 182155,
    area: 3775.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-122.2436, 40.7751],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'sutter',
    name: 'Sutter',
    fips: '06101',
    region: CaliforniaRegion.NORTHERN,
    population: 99063,
    area: 602.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-121.6169, 39.1457],
    difficulty: DifficultyLevel.EASY
  },
  {
    id: 'tehama',
    name: 'Tehama',
    fips: '06103',
    region: CaliforniaRegion.NORTHERN,
    population: 65829,
    area: 2951.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-122.3778, 40.0282],
    difficulty: DifficultyLevel.MEDIUM
  },
  {
    id: 'yolo',
    name: 'Yolo',
    fips: '06113',
    region: CaliforniaRegion.NORTHERN,
    population: 220500,
    area: 1012.0,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-121.9018, 38.7646],
    difficulty: DifficultyLevel.EASY
  },
  {
    id: 'yuba',
    name: 'Yuba',
    fips: '06115',
    region: CaliforniaRegion.NORTHERN,
    population: 81575,
    area: 630.7,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-121.4167, 39.2735],
    difficulty: DifficultyLevel.EASY
  }
];

// Region definitions and filters
export const REGION_FILTERS = {
  [CaliforniaRegion.ALL]: () => true,
  [CaliforniaRegion.BAY_AREA]: (county: County) => county.region === CaliforniaRegion.BAY_AREA,
  [CaliforniaRegion.SOUTHERN]: (county: County) => county.region === CaliforniaRegion.SOUTHERN,
  [CaliforniaRegion.NORTHERN]: (county: County) => county.region === CaliforniaRegion.NORTHERN,
  [CaliforniaRegion.CENTRAL]: (county: County) => county.region === CaliforniaRegion.CENTRAL,
  [CaliforniaRegion.CENTRAL_VALLEY]: (county: County) => county.region === CaliforniaRegion.CENTRAL_VALLEY,
  [CaliforniaRegion.COASTAL]: (county: County) => county.region === CaliforniaRegion.COASTAL,
  [CaliforniaRegion.INLAND]: (county: County) =>
    county.region !== CaliforniaRegion.COASTAL && county.region !== CaliforniaRegion.BAY_AREA
};

export const REGION_INFO = {
  [CaliforniaRegion.ALL]: {
    name: 'All California',
    description: 'All 58 California counties',
    countyCount: 58,
    difficulty: DifficultyLevel.EXPERT
  },
  [CaliforniaRegion.BAY_AREA]: {
    name: 'Bay Area',
    description: 'San Francisco Bay Area counties',
    countyCount: 9,
    difficulty: DifficultyLevel.MEDIUM
  },
  [CaliforniaRegion.SOUTHERN]: {
    name: 'Southern California',
    description: 'Los Angeles, Orange, San Diego, and surrounding counties',
    countyCount: 7,
    difficulty: DifficultyLevel.HARD
  },
  [CaliforniaRegion.NORTHERN]: {
    name: 'Northern California',
    description: 'Sacramento Valley and northern mountain counties',
    countyCount: 14,
    difficulty: DifficultyLevel.MEDIUM
  },
  [CaliforniaRegion.CENTRAL]: {
    name: 'Central California',
    description: 'Central coast and inland counties',
    countyCount: 8,
    difficulty: DifficultyLevel.MEDIUM
  },
  [CaliforniaRegion.CENTRAL_VALLEY]: {
    name: 'Central Valley',
    description: 'San Joaquin and Sacramento valley counties',
    countyCount: 8,
    difficulty: DifficultyLevel.MEDIUM
  },
  [CaliforniaRegion.COASTAL]: {
    name: 'Coastal Counties',
    description: 'Pacific coast counties from Mendocino to San Diego',
    countyCount: 12,
    difficulty: DifficultyLevel.MEDIUM
  },
  [CaliforniaRegion.INLAND]: {
    name: 'Inland Counties',
    description: 'Interior counties away from the coast',
    countyCount: 46,
    difficulty: DifficultyLevel.HARD
  }
};

// Helper functions
export const getCountiesByRegion = (region: CaliforniaRegion): County[] => {
  const filter = REGION_FILTERS[region];
  return CALIFORNIA_COUNTIES.filter(filter);
};

export const getCountyById = (id: string): County | undefined => {
  return CALIFORNIA_COUNTIES.find(county => county.id === id);
};

export const getCountiesByDifficulty = (difficulty: DifficultyLevel): County[] => {
  return CALIFORNIA_COUNTIES.filter(county => county.difficulty === difficulty);
};

export const getRandomCounty = (region: CaliforniaRegion = CaliforniaRegion.ALL): County => {
  const counties = getCountiesByRegion(region);
  return counties[Math.floor(Math.random() * counties.length)];
};

// California state boundary and projection settings
export const CALIFORNIA_BOUNDS = {
  north: 42.0095,
  south: 32.5343,
  east: -114.1312,
  west: -124.4096
};

export const CALIFORNIA_CENTER: [number, number] = [-119.4179, 36.7783];

export const CALIFORNIA_PROJECTION_CONFIG = {
  type: 'mercator' as const,
  scale: 2400,
  center: CALIFORNIA_CENTER,
  translate: [400, 300] // Will be adjusted based on container size
};