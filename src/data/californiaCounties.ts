// California Counties Data Structure for Puzzle Game
// Comprehensive data for all 58 counties with geographic, cultural, and educational information

export interface CaliforniaCounty {
  id: string;
  name: string;
  fipsCode: string;
  countySeat: string;
  region: string;
  established: number;
  population: number;
  area: number; // in square miles
  coordinates: {
    latitude: number;
    longitude: number;
  };
  economicFocus: string[];
  naturalFeatures: string[];
  culturalLandmarks: string[];
  funFacts: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  trivia: {
    easy: string[];
    medium: string[];
    hard: string[];
  };
}

export interface CaliforniaRegion {
  id: string;
  name: string;
  description: string;
  counties: string[];
  majorFeatures: string[];
}

export const californiaRegions: CaliforniaRegion[] = [
  {
    id: 'northern',
    name: 'Northern California',
    description: 'Home to San Francisco Bay Area, Silicon Valley, and the state capital',
    counties: ['alameda', 'alpine', 'amador', 'butte', 'calaveras', 'colusa', 'contra_costa', 'del_norte', 'el_dorado', 'glenn', 'humboldt', 'lake', 'lassen', 'marin', 'mendocino', 'modoc', 'mono', 'napa', 'nevada', 'placer', 'plumas', 'sacramento', 'san_benito', 'san_francisco', 'san_joaquin', 'san_mateo', 'santa_clara', 'santa_cruz', 'shasta', 'sierra', 'siskiyou', 'solano', 'sonoma', 'sutter', 'tehama', 'trinity', 'tuolumne', 'yolo', 'yuba'],
    majorFeatures: ['San Francisco Bay', 'Silicon Valley', 'Napa Valley', 'Lake Tahoe', 'Redwood National Parks']
  },
  {
    id: 'central_valley',
    name: 'Central Valley',
    description: 'America\'s agricultural heartland, producing 8% of national farm output',
    counties: ['fresno', 'kern', 'kings', 'madera', 'merced', 'san_joaquin', 'stanislaus', 'tulare'],
    majorFeatures: ['San Joaquin Valley', 'Sacramento Valley', 'Agricultural fields', 'Sierra Nevada foothills']
  },
  {
    id: 'southern',
    name: 'Southern California',
    description: 'Entertainment capital with Hollywood, beaches, and desert landscapes',
    counties: ['imperial', 'los_angeles', 'orange', 'riverside', 'san_bernardino', 'san_diego', 'santa_barbara', 'ventura'],
    majorFeatures: ['Hollywood', 'Disneyland', 'Pacific Coast', 'Mojave Desert', 'San Diego Bay']
  },
  {
    id: 'central_coast',
    name: 'Central Coast',
    description: 'Scenic coastline with vineyards, beaches, and marine sanctuaries',
    counties: ['monterey', 'san_luis_obispo', 'santa_barbara'],
    majorFeatures: ['Monterey Bay', 'Big Sur', 'Pismo Beach', 'Hearst Castle']
  }
];

export const californiaCounties: CaliforniaCounty[] = [
  {
    id: 'alameda',
    name: 'Alameda County',
    fipsCode: '06001',
    countySeat: 'Oakland',
    region: 'northern',
    established: 1853,
    population: 1648556,
    area: 738,
    coordinates: { latitude: 37.6017, longitude: -121.7195 },
    economicFocus: ['Technology', 'Port operations', 'Healthcare', 'Education'],
    naturalFeatures: ['San Francisco Bay', 'East Bay Hills', 'Livermore Valley'],
    culturalLandmarks: ['Oakland Museum', 'UC Berkeley', 'Port of Oakland', 'Lake Merritt'],
    funFacts: [
      'Home to the busiest container port on the West Coast',
      'Oakland has more sunny days than San Francisco',
      'The county name comes from Spanish "álamo" meaning poplar tree'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What is the county seat of Alameda County?', 'Which bay borders Alameda County?'],
      medium: ['What does "alameda" mean in Spanish?', 'Which major university is located in this county?'],
      hard: ['In what year was Alameda County established?', 'What is the main cargo handled at the Port of Oakland?']
    }
  },
  {
    id: 'alpine',
    name: 'Alpine County',
    fipsCode: '06003',
    countySeat: 'Markleeville',
    region: 'northern',
    established: 1864,
    population: 1043,
    area: 739,
    coordinates: { latitude: 38.7586, longitude: -119.8126 },
    economicFocus: ['Tourism', 'Recreation', 'Forestry'],
    naturalFeatures: ['Sierra Nevada Mountains', 'Lake Tahoe', 'Carson River'],
    culturalLandmarks: ['Grover Hot Springs State Park', 'Historic Markleeville', 'Monitor Pass'],
    funFacts: [
      'California\'s least populous county',
      'Named for its high alpine environment',
      'Contains parts of Lake Tahoe'
    ],
    difficulty: 'hard',
    trivia: {
      easy: ['Which county has the smallest population in California?', 'What mountains are Alpine County located in?'],
      medium: ['What is the county seat of Alpine County?', 'What famous lake is partially in Alpine County?'],
      hard: ['When was Alpine County established?', 'What natural hot springs are located in Alpine County?']
    }
  },
  {
    id: 'amador',
    name: 'Amador County',
    fipsCode: '06005',
    countySeat: 'Jackson',
    region: 'northern',
    established: 1854,
    population: 40474,
    area: 594,
    coordinates: { latitude: 38.4266, longitude: -120.6687 },
    economicFocus: ['Wine production', 'Tourism', 'Agriculture', 'Mining heritage'],
    naturalFeatures: ['Sierra Nevada foothills', 'Mokelumne River', 'Gold country terrain'],
    culturalLandmarks: ['Sutter Creek Historic District', 'Amador County Museum', 'Black Chasm Cavern'],
    funFacts: [
      'Part of California\'s Gold Country',
      'Named after José María Amador, a Spanish soldier and rancher',
      'Home to numerous historic gold rush towns'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What is the county seat of Amador County?', 'What historical period is Amador County famous for?'],
      medium: ['Who was José María Amador?', 'What type of cavern can be found in Amador County?'],
      hard: ['In which year was Amador County established?', 'What river flows through Amador County?']
    }
  },
  {
    id: 'butte',
    name: 'Butte County',
    fipsCode: '06007',
    countySeat: 'Oroville',
    region: 'northern',
    established: 1850,
    population: 219186,
    area: 1640,
    coordinates: { latitude: 39.6395, longitude: -121.6168 },
    economicFocus: ['Agriculture', 'Education', 'Healthcare', 'Government'],
    naturalFeatures: ['Sacramento Valley', 'Sierra Nevada foothills', 'Feather River', 'Oroville Dam'],
    culturalLandmarks: ['California State University Chico', 'Oroville Dam', 'Bidwell Park', 'Chinese Temple'],
    funFacts: [
      'One of the original 27 counties formed in 1850',
      'Home to the tallest dam in the United States (Oroville Dam)',
      'Chico is known as the "City of Roses"'
    ],
    difficulty: 'easy',
    trivia: {
      easy: ['What is the county seat of Butte County?', 'Which university is located in Chico?'],
      medium: ['What is the tallest dam in the United States?', 'What is Chico known as?'],
      hard: ['In what year was Butte County established?', 'What river is the Oroville Dam built on?']
    }
  },
  {
    id: 'calaveras',
    name: 'Calaveras County',
    fipsCode: '06009',
    countySeat: 'San Andreas',
    region: 'northern',
    established: 1850,
    population: 45292,
    area: 1020,
    coordinates: { latitude: 38.1963, longitude: -120.5471 },
    economicFocus: ['Tourism', 'Wine production', 'Timber', 'Agriculture'],
    naturalFeatures: ['Sierra Nevada foothills', 'Calaveras River', 'New Melones Lake'],
    culturalLandmarks: ['Calaveras Big Trees State Park', 'Angels Camp', 'Murphys Historic District'],
    funFacts: [
      'Famous for Mark Twain\'s "The Celebrated Jumping Frog of Calaveras County"',
      'Name means "skulls" in Spanish',
      'Home to giant sequoia trees'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What famous story is associated with Calaveras County?', 'What does "calaveras" mean in Spanish?'],
      medium: ['Who wrote "The Celebrated Jumping Frog of Calaveras County"?', 'What type of giant trees grow here?'],
      hard: ['What is the county seat of Calaveras County?', 'What annual event occurs in Angels Camp?']
    }
  },
  {
    id: 'colusa',
    name: 'Colusa County',
    fipsCode: '06011',
    countySeat: 'Colusa',
    region: 'northern',
    established: 1850,
    population: 21917,
    area: 1151,
    coordinates: { latitude: 39.2145, longitude: -122.0094 },
    economicFocus: ['Agriculture', 'Rice production', 'Almonds', 'Cattle ranching'],
    naturalFeatures: ['Sacramento Valley', 'Sacramento River', 'Coast Range foothills'],
    culturalLandmarks: ['Colusa County Courthouse', 'Sacramento National Wildlife Refuge', 'Colusa-Sacramento River State Recreation Area'],
    funFacts: [
      'One of California\'s top rice-producing counties',
      'Named after the Colusi Native American tribe',
      'Has more than 95% of its land dedicated to agriculture'
    ],
    difficulty: 'hard',
    trivia: {
      easy: ['What is the main agricultural product of Colusa County?', 'What river runs through Colusa County?'],
      medium: ['What Native American tribe was Colusa County named after?', 'What percentage of the county is agricultural land?'],
      hard: ['When was Colusa County established?', 'What wildlife refuge is located in the county?']
    }
  },
  {
    id: 'contra_costa',
    name: 'Contra Costa County',
    fipsCode: '06013',
    countySeat: 'Martinez',
    region: 'northern',
    established: 1850,
    population: 1161413,
    area: 720,
    coordinates: { latitude: 37.9299, longitude: -121.9018 },
    economicFocus: ['Petrochemicals', 'Technology', 'Healthcare', 'Retail'],
    naturalFeatures: ['San Francisco Bay', 'Diablo Range', 'Sacramento-San Joaquin Delta'],
    culturalLandmarks: ['Mount Diablo State Park', 'John Muir National Historic Site', 'Lindsay Wildlife Experience'],
    funFacts: [
      'Name means "opposite coast" in Spanish',
      'Home to major oil refineries',
      'Mount Diablo offers views of 40+ counties on clear days'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What does "Contra Costa" mean?', 'What famous mountain is located in this county?'],
      medium: ['What is the county seat of Contra Costa County?', 'What type of industrial facilities are common here?'],
      hard: ['How many counties can be seen from Mount Diablo on clear days?', 'What naturalist has a historic site in this county?']
    }
  },
  {
    id: 'del_norte',
    name: 'Del Norte County',
    fipsCode: '06015',
    countySeat: 'Crescent City',
    region: 'northern',
    established: 1857,
    population: 27812,
    area: 1008,
    coordinates: { latitude: 41.7416, longitude: -124.0835 },
    economicFocus: ['Timber', 'Fishing', 'Tourism', 'Prison operations'],
    naturalFeatures: ['Pacific Ocean coastline', 'Redwood forests', 'Smith River', 'Klamath Mountains'],
    culturalLandmarks: ['Redwood National and State Parks', 'Battery Point Lighthouse', 'Pelican Bay State Prison'],
    funFacts: [
      'Home to some of the world\'s tallest trees',
      'Name means "of the north" in Spanish',
      'Frequently affected by tsunamis due to Pacific location'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What famous trees grow in Del Norte County?', 'What does "Del Norte" mean?'],
      medium: ['What is the county seat of Del Norte County?', 'What natural disaster sometimes affects this coastal area?'],
      hard: ['What major river flows through Del Norte County?', 'In what year was Del Norte County established?']
    }
  },
  {
    id: 'el_dorado',
    name: 'El Dorado County',
    fipsCode: '06017',
    countySeat: 'Placerville',
    region: 'northern',
    established: 1850,
    population: 193221,
    area: 1712,
    coordinates: { latitude: 38.7265, longitude: -120.3962 },
    economicFocus: ['Tourism', 'Wine production', 'Government', 'Agriculture'],
    naturalFeatures: ['Lake Tahoe', 'Sierra Nevada Mountains', 'American River', 'El Dorado National Forest'],
    culturalLandmarks: ['Lake Tahoe', 'Sutter\'s Mill', 'Marshall Gold Discovery State Historic Park', 'Apple Hill'],
    funFacts: [
      'Where gold was first discovered in California (1848)',
      'Name means "the golden one" in Spanish',
      'Contains part of Lake Tahoe'
    ],
    difficulty: 'easy',
    trivia: {
      easy: ['Where was gold first discovered in California?', 'What famous lake is partially in El Dorado County?'],
      medium: ['What does "El Dorado" mean?', 'What historic mill is located in this county?'],
      hard: ['In what year was gold discovered at Sutter\'s Mill?', 'What seasonal attraction involves apple orchards?']
    }
  },
  {
    id: 'fresno',
    name: 'Fresno County',
    fipsCode: '06019',
    countySeat: 'Fresno',
    region: 'central_valley',
    established: 1856,
    population: 1013581,
    area: 5958,
    coordinates: { latitude: 36.7378, longitude: -119.7871 },
    economicFocus: ['Agriculture', 'Food processing', 'Education', 'Healthcare'],
    naturalFeatures: ['San Joaquin Valley', 'Sierra Nevada Mountains', 'Kings River', 'San Joaquin River'],
    culturalLandmarks: ['Fresno State University', 'Forestiere Underground Gardens', 'Kearney Mansion Museum'],
    funFacts: [
      'Leading agricultural county in the US by value',
      'Produces more than 350 different crops',
      'Home to the largest Armenian-American population outside of Armenia'
    ],
    difficulty: 'easy',
    trivia: {
      easy: ['What is Fresno County famous for producing?', 'What is the county seat?'],
      medium: ['How many different crops are grown in Fresno County?', 'What ethnic population has a large community here?'],
      hard: ['What underground attraction was built by one man over 40 years?', 'What is Fresno County\'s ranking in US agricultural production?']
    }
  },
  {
    id: 'glenn',
    name: 'Glenn County',
    fipsCode: '06021',
    countySeat: 'Willows',
    region: 'northern',
    established: 1891,
    population: 28917,
    area: 1315,
    coordinates: { latitude: 39.5240, longitude: -122.3094 },
    economicFocus: ['Agriculture', 'Rice production', 'Almonds', 'Livestock'],
    naturalFeatures: ['Sacramento Valley', 'Sacramento River', 'Coast Range foothills'],
    culturalLandmarks: ['Willows Museum', 'Sacramento National Wildlife Refuge Complex', 'Glenn County Fairgrounds'],
    funFacts: [
      'Named after Dr. Hugh J. Glenn, a large landowner',
      'One of California\'s major rice-producing areas',
      'Established relatively late compared to other counties'
    ],
    difficulty: 'hard',
    trivia: {
      easy: ['What is the county seat of Glenn County?', 'What grain is Glenn County famous for producing?'],
      medium: ['Who was Glenn County named after?', 'What type of refuge is located in the county?'],
      hard: ['In what year was Glenn County established?', 'What makes Glenn County unique among California counties in terms of establishment date?']
    }
  },
  {
    id: 'humboldt',
    name: 'Humboldt County',
    fipsCode: '06023',
    countySeat: 'Eureka',
    region: 'northern',
    established: 1853,
    population: 135558,
    area: 3568,
    coordinates: { latitude: 40.7450, longitude: -123.8695 },
    economicFocus: ['Timber', 'Fishing', 'Cannabis cultivation', 'Tourism'],
    naturalFeatures: ['Pacific Ocean coastline', 'Redwood forests', 'Humboldt Bay', 'Eel River'],
    culturalLandmarks: ['Humboldt State University', 'Avenue of the Giants', 'Sequoia Park Zoo'],
    funFacts: [
      'Home to the world\'s tallest trees (coast redwoods)',
      'Named after Alexander von Humboldt, German naturalist',
      'The Victorian seaport of Eureka is well-preserved'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What type of trees is Humboldt County famous for?', 'What is the county seat?'],
      medium: ['Who was Humboldt County named after?', 'What scenic drive features giant redwoods?'],
      hard: ['What university is located in Humboldt County?', 'What bay provides harbor access to the Pacific?']
    }
  },
  {
    id: 'imperial',
    name: 'Imperial County',
    fipsCode: '06025',
    countySeat: 'El Centro',
    region: 'southern',
    established: 1907,
    population: 179702,
    area: 4175,
    coordinates: { latitude: 32.8478, longitude: -115.5631 },
    economicFocus: ['Agriculture', 'Geothermal energy', 'Border trade', 'Military'],
    naturalFeatures: ['Colorado Desert', 'Salton Sea', 'Colorado River', 'Imperial Valley'],
    culturalLandmarks: ['Salton Sea', 'Imperial Sand Dunes', 'Calexico border crossing'],
    funFacts: [
      'California\'s newest county (established 1907)',
      'Most of the county is below sea level',
      'Major winter vegetable producer for the US'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What is unique about Imperial County\'s elevation?', 'When was Imperial County established?'],
      medium: ['What large inland lake is located in Imperial County?', 'What type of energy is produced here using underground heat?'],
      hard: ['What desert covers most of Imperial County?', 'What makes Imperial Valley important for agriculture?']
    }
  },
  {
    id: 'inyo',
    name: 'Inyo County',
    fipsCode: '06027',
    countySeat: 'Independence',
    region: 'northern',
    established: 1866,
    population: 19016,
    area: 10192,
    coordinates: { latitude: 37.1841, longitude: -118.2478 },
    economicFocus: ['Tourism', 'Mining', 'Livestock', 'Government'],
    naturalFeatures: ['Sierra Nevada Mountains', 'White Mountains', 'Owens Valley', 'Mount Whitney', 'Death Valley'],
    culturalLandmarks: ['Mount Whitney', 'Manzanar National Historic Site', 'Ancient Bristlecone Pine Forest'],
    funFacts: [
      'Contains both the highest and lowest points in the continental US',
      'Mount Whitney (14,505 ft) and Death Valley (-282 ft) are 85 miles apart',
      'Home to the world\'s oldest trees (bristlecone pines)'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What is the highest point in the continental United States?', 'What valley contains the lowest point?'],
      medium: ['What is unique about the elevation extremes in Inyo County?', 'What type of ancient trees grow here?'],
      hard: ['What Japanese American internment camp was located in Inyo County?', 'How far apart are Mount Whitney and Death Valley?']
    }
  },
  {
    id: 'kern',
    name: 'Kern County',
    fipsCode: '06029',
    countySeat: 'Bakersfield',
    region: 'central_valley',
    established: 1866,
    population: 909235,
    area: 8073,
    coordinates: { latitude: 35.3738, longitude: -118.9597 },
    economicFocus: ['Oil production', 'Agriculture', 'Aerospace', 'Energy'],
    naturalFeatures: ['San Joaquin Valley', 'Sierra Nevada Mountains', 'Tehachapi Mountains', 'Kern River'],
    culturalLandmarks: ['California Living Museum', 'Kern County Museum', 'Tehachapi Wind Farm'],
    funFacts: [
      'Major oil-producing county since the early 1900s',
      'Leading producer of almonds, pistachios, and grapes',
      'Home to one of the world\'s largest wind farms'
    ],
    difficulty: 'easy',
    trivia: {
      easy: ['What is the county seat of Kern County?', 'What energy resource is Kern County famous for?'],
      medium: ['What nuts is Kern County a leading producer of?', 'What type of renewable energy farm is located here?'],
      hard: ['What mountain range contains many wind turbines in Kern County?', 'What river flows through Kern County?']
    }
  },
  {
    id: 'kings',
    name: 'Kings County',
    fipsCode: '06031',
    countySeat: 'Hanford',
    region: 'central_valley',
    established: 1893,
    population: 152486,
    area: 1390,
    coordinates: { latitude: 36.1105, longitude: -119.8143 },
    economicFocus: ['Agriculture', 'Dairy farming', 'Food processing', 'Cotton'],
    naturalFeatures: ['San Joaquin Valley', 'Kings River', 'Tulare Lake bed'],
    culturalLandmarks: ['Hanford Carnegie Museum', 'Colonel Allensworth State Historic Park', 'Tachi Palace Casino'],
    funFacts: [
      'Named after the Kings River',
      'Home to Colonel Allensworth, California\'s only all-black town',
      'Major dairy and cotton producing county'
    ],
    difficulty: 'hard',
    trivia: {
      easy: ['What is the county seat of Kings County?', 'What river was Kings County named after?'],
      medium: ['What historic town was California\'s only all-black community?', 'What type of farming is Kings County known for?'],
      hard: ['Who was Colonel Allensworth?', 'What lake bed is located in Kings County?']
    }
  },
  {
    id: 'lake',
    name: 'Lake County',
    fipsCode: '06033',
    countySeat: 'Lakeport',
    region: 'northern',
    established: 1861,
    population: 64148,
    area: 1258,
    coordinates: { latitude: 39.0840, longitude: -122.7593 },
    economicFocus: ['Tourism', 'Wine production', 'Agriculture', 'Geothermal energy'],
    naturalFeatures: ['Clear Lake', 'Mayacamas Mountains', 'Cobb Mountain', 'Coast Range'],
    culturalLandmarks: ['Clear Lake State Park', 'Anderson Marsh State Historic Park', 'Lake County Museum'],
    funFacts: [
      'Named after Clear Lake, California\'s largest natural lake',
      'Clear Lake is one of the oldest lakes in North America',
      'Major geothermal energy production area'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What lake is Lake County named after?', 'What is the county seat?'],
      medium: ['What makes Clear Lake special among California lakes?', 'What type of renewable energy is produced here?'],
      hard: ['How old is Clear Lake geologically?', 'What mountains surround Lake County?']
    }
  },
  {
    id: 'lassen',
    name: 'Lassen County',
    fipsCode: '06035',
    countySeat: 'Susanville',
    region: 'northern',
    established: 1864,
    population: 32730,
    area: 4720,
    coordinates: { latitude: 40.6573, longitude: -120.5687 },
    economicFocus: ['Forestry', 'Agriculture', 'Prison operations', 'Tourism'],
    naturalFeatures: ['Sierra Nevada Mountains', 'Cascade Range', 'Honey Lake', 'Susan River'],
    culturalLandmarks: ['Lassen Volcanic National Park', 'Eagle Lake', 'Bizz Johnson Trail'],
    funFacts: [
      'Named after Peter Lassen, Danish pioneer',
      'Home to Lassen Volcanic National Park',
      'Contains Eagle Lake, famous for trout fishing'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What national park is located in Lassen County?', 'What is the county seat?'],
      medium: ['Who was Peter Lassen?', 'What lake is famous for trout fishing?'],
      hard: ['What trail was converted from a former railroad?', 'What two mountain ranges meet in Lassen County?']
    }
  },
  {
    id: 'los_angeles',
    name: 'Los Angeles County',
    fipsCode: '06037',
    countySeat: 'Los Angeles',
    region: 'southern',
    established: 1850,
    population: 9757179,
    area: 4751,
    coordinates: { latitude: 34.0522, longitude: -118.2437 },
    economicFocus: ['Entertainment', 'Technology', 'International trade', 'Aerospace', 'Fashion'],
    naturalFeatures: ['Pacific Ocean coastline', 'San Gabriel Mountains', 'Santa Monica Mountains', 'Los Angeles River'],
    culturalLandmarks: ['Hollywood', 'Disneyland', 'Getty Center', 'Griffith Observatory', 'Santa Monica Pier'],
    funFacts: [
      'Most populous county in the United States',
      'Hollywood is the entertainment capital of the world',
      'Home to more than 10 million people'
    ],
    difficulty: 'easy',
    trivia: {
      easy: ['What is the most populous county in the US?', 'What neighborhood is famous for movies and entertainment?'],
      medium: ['What theme park opened in Anaheim in 1955?', 'What observatory is located in Griffith Park?'],
      hard: ['What mountain ranges are located in Los Angeles County?', 'What pier is a famous tourist attraction in Santa Monica?']
    }
  },
  {
    id: 'madera',
    name: 'Madera County',
    fipsCode: '06039',
    countySeat: 'Madera',
    region: 'central_valley',
    established: 1893,
    population: 158006,
    area: 2138,
    coordinates: { latitude: 37.1550, longitude: -119.7700 },
    economicFocus: ['Agriculture', 'Timber', 'Tourism', 'Wine production'],
    naturalFeatures: ['Sierra Nevada Mountains', 'San Joaquin River', 'Yosemite National Park (partial)'],
    culturalLandmarks: ['Yosemite National Park', 'Madera County Courthouse', 'Fossil Discovery Center'],
    funFacts: [
      'Name means "wood" or "timber" in Spanish',
      'Contains part of Yosemite National Park',
      'Major wine-producing region'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What does "madera" mean in Spanish?', 'What famous national park partially extends into this county?'],
      medium: ['What is the county seat of Madera County?', 'What type of alcoholic beverage is produced here?'],
      hard: ['In what year was Madera County established?', 'What center displays ancient fossils found in the area?']
    }
  },
  {
    id: 'marin',
    name: 'Marin County',
    fipsCode: '06041',
    countySeat: 'San Rafael',
    region: 'northern',
    established: 1850,
    population: 258826,
    area: 520,
    coordinates: { latitude: 38.0834, longitude: -122.7633 },
    economicFocus: ['Technology', 'Healthcare', 'Professional services', 'Tourism'],
    naturalFeatures: ['San Francisco Bay', 'Pacific Ocean coastline', 'Mount Tamalpais', 'Golden Gate Bridge (northern end)'],
    culturalLandmarks: ['Golden Gate Bridge', 'Muir Woods National Monument', 'Point Reyes National Seashore'],
    funFacts: [
      'Named after Chief Marin of the Coast Miwok tribe',
      'Home to Muir Woods, famous for old-growth redwoods',
      'One of California\'s wealthiest counties'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What famous bridge connects Marin County to San Francisco?', 'What woods are famous for redwood trees?'],
      medium: ['Who was Chief Marin?', 'What mountain peak is popular with hikers?'],
      hard: ['What national seashore is located in western Marin County?', 'What makes Muir Woods special among California forests?']
    }
  },
  {
    id: 'mariposa',
    name: 'Mariposa County',
    fipsCode: '06043',
    countySeat: 'Mariposa',
    region: 'northern',
    established: 1850,
    population: 17131,
    area: 1449,
    coordinates: { latitude: 37.4859, longitude: -119.9663 },
    economicFocus: ['Tourism', 'Mining', 'Agriculture', 'Forestry'],
    naturalFeatures: ['Sierra Nevada Mountains', 'Yosemite National Park', 'Merced River'],
    culturalLandmarks: ['Yosemite National Park', 'Mariposa Museum and History Center', 'California State Mining and Mineral Museum'],
    funFacts: [
      'Name means "butterfly" in Spanish',
      'Contains most of Yosemite National Park',
      'One of the original 27 counties'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What does "mariposa" mean in Spanish?', 'What famous national park is mostly located here?'],
      medium: ['What museum displays mining artifacts and minerals?', 'What river flows through Yosemite in this county?'],
      hard: ['Is Mariposa County one of the original 27 counties?', 'What percentage of Yosemite National Park is in Mariposa County?']
    }
  },
  {
    id: 'mendocino',
    name: 'Mendocino County',
    fipsCode: '06045',
    countySeat: 'Ukiah',
    region: 'northern',
    established: 1850,
    population: 86749,
    area: 3506,
    coordinates: { latitude: 39.3016, longitude: -123.2081 },
    economicFocus: ['Wine production', 'Timber', 'Cannabis cultivation', 'Tourism'],
    naturalFeatures: ['Pacific Ocean coastline', 'Coast Range mountains', 'Russian River', 'Redwood forests'],
    culturalLandmarks: ['Mendocino Headlands State Park', 'Anderson Valley wineries', 'Point Arena Lighthouse'],
    funFacts: [
      'Famous for its dramatic coastal cliffs and Victorian village of Mendocino',
      'Major wine-producing region, especially Pinot Noir',
      'Named after Cape Mendocino, California\'s westernmost point'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What is the county seat of Mendocino County?', 'What type of alcoholic beverage is this county famous for?'],
      medium: ['What Victorian coastal village is a major tourist attraction?', 'What cape was the county named after?'],
      hard: ['What valley is particularly famous for wine production?', 'What lighthouse marks the western coast?']
    }
  },
  {
    id: 'merced',
    name: 'Merced County',
    fipsCode: '06047',
    countySeat: 'Merced',
    region: 'central_valley',
    established: 1855,
    population: 281202,
    area: 1935,
    coordinates: { latitude: 37.3022, longitude: -120.4829 },
    economicFocus: ['Agriculture', 'Education', 'Food processing', 'Dairy farming'],
    naturalFeatures: ['San Joaquin Valley', 'Merced River', 'Sierra Nevada foothills'],
    culturalLandmarks: ['University of California Merced', 'Merced County Courthouse Museum', 'Castle Air Museum'],
    funFacts: [
      'Name means "mercy" in Spanish',
      'Home to UC Merced, the newest UC campus',
      'Major agricultural producer, especially almonds and dairy'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What does "merced" mean in Spanish?', 'What UC campus is located here?'],
      medium: ['What is the county seat of Merced County?', 'What type of farming is important here besides crops?'],
      hard: ['What museum displays vintage military aircraft?', 'When was UC Merced established?']
    }
  },
  {
    id: 'modoc',
    name: 'Modoc County',
    fipsCode: '06049',
    countySeat: 'Alturas',
    region: 'northern',
    established: 1874,
    population: 8700,
    area: 3944,
    coordinates: { latitude: 41.5412, longitude: -120.5687 },
    economicFocus: ['Agriculture', 'Ranching', 'Timber', 'Government'],
    naturalFeatures: ['Modoc Plateau', 'South Warner Wilderness', 'Goose Lake', 'Pit River'],
    culturalLandmarks: ['Modoc National Forest', 'Lava Beds National Monument', 'Modoc County Museum'],
    funFacts: [
      'Named after the Modoc Native American tribe',
      'California\'s northeastern corner county',
      'Part of the Great Basin region'
    ],
    difficulty: 'hard',
    trivia: {
      easy: ['What Native American tribe was Modoc County named after?', 'What is the county seat?'],
      medium: ['What geographic region is Modoc County part of?', 'What plateau characterizes the landscape?'],
      hard: ['What national monument featuring volcanic formations is nearby?', 'What year was Modoc County established?']
    }
  },
  {
    id: 'mono',
    name: 'Mono County',
    fipsCode: '06051',
    countySeat: 'Bridgeport',
    region: 'northern',
    established: 1861,
    population: 13195,
    area: 3030,
    coordinates: { latitude: 38.2547, longitude: -118.9577 },
    economicFocus: ['Tourism', 'Mining', 'Recreation', 'Government'],
    naturalFeatures: ['Sierra Nevada Mountains', 'Mono Lake', 'Mammoth Lakes', 'Eastern Sierra'],
    culturalLandmarks: ['Mono Lake', 'Mammoth Mountain Ski Area', 'Bodie State Historic Park'],
    funFacts: [
      'Mono Lake is one of the oldest lakes in North America',
      'Bodie is a preserved gold rush ghost town',
      'Home to Mammoth Mountain, a major ski resort'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What ancient lake is Mono County famous for?', 'What winter sport is popular at Mammoth Mountain?'],
      medium: ['What historic ghost town is preserved here?', 'What is the county seat of Mono County?'],
      hard: ['How old is Mono Lake approximately?', 'What mountain range dominates the eastern part of the county?']
    }
  },
  {
    id: 'monterey',
    name: 'Monterey County',
    fipsCode: '06053',
    countySeat: 'Salinas',
    region: 'central_coast',
    established: 1850,
    population: 434061,
    area: 3322,
    coordinates: { latitude: 36.2674, longitude: -121.4944 },
    economicFocus: ['Agriculture', 'Tourism', 'Military', 'Technology'],
    naturalFeatures: ['Pacific Ocean coastline', 'Salinas Valley', 'Santa Lucia Mountains', 'Monterey Bay'],
    culturalLandmarks: ['Monterey Bay Aquarium', 'Carmel Mission', 'Pebble Beach Golf Links', 'Big Sur'],
    funFacts: [
      'Salinas Valley is known as "America\'s Salad Bowl"',
      'Former capital of Mexican California',
      'Home to the famous Monterey Bay Aquarium'
    ],
    difficulty: 'easy',
    trivia: {
      easy: ['What valley is known as "America\'s Salad Bowl"?', 'What famous aquarium is located in Monterey?'],
      medium: ['What was Monterey\'s historical significance in Mexican California?', 'What scenic coastal area extends south from Monterey?'],
      hard: ['What mission was established by Father Junípero Serra?', 'What prestigious golf course is located at Pebble Beach?']
    }
  },
  {
    id: 'napa',
    name: 'Napa County',
    fipsCode: '06055',
    countySeat: 'Napa',
    region: 'northern',
    established: 1850,
    population: 138019,
    area: 754,
    coordinates: { latitude: 38.5025, longitude: -122.2654 },
    economicFocus: ['Wine production', 'Tourism', 'Agriculture', 'Hospitality'],
    naturalFeatures: ['Napa Valley', 'Vaca Mountains', 'Mayacamas Mountains', 'Napa River'],
    culturalLandmarks: ['Napa Valley wineries', 'Calistoga hot springs', 'Oxbow Public Market'],
    funFacts: [
      'World-renowned wine-producing region',
      'Named after the Napa Native American tribe',
      'Home to over 400 wineries'
    ],
    difficulty: 'easy',
    trivia: {
      easy: ['What is Napa County most famous for producing?', 'What is the county seat?'],
      medium: ['How many wineries are approximately in Napa County?', 'What Native American tribe was the county named after?'],
      hard: ['What town is famous for its hot springs?', 'What mountains border the Napa Valley?']
    }
  },
  {
    id: 'nevada',
    name: 'Nevada County',
    fipsCode: '06057',
    countySeat: 'Nevada City',
    region: 'northern',
    established: 1851,
    population: 102241,
    area: 958,
    coordinates: { latitude: 39.2608, longitude: -121.0161 },
    economicFocus: ['Technology', 'Tourism', 'Healthcare', 'Forestry'],
    naturalFeatures: ['Sierra Nevada foothills', 'Yuba River', 'Bear River', 'Tahoe National Forest'],
    culturalLandmarks: ['Nevada City Historic District', 'Empire Mine State Historic Park', 'South Yuba River State Park'],
    funFacts: [
      'Named before the state of Nevada',
      'Nevada City has well-preserved Gold Rush architecture',
      'Empire Mine was one of California\'s largest gold mines'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What historic period is Nevada County famous for?', 'What is the county seat?'],
      medium: ['Which was named first: Nevada County or Nevada State?', 'What major gold mine operated here?'],
      hard: ['What architectural style is preserved in Nevada City?', 'What river is popular for recreation in the county?']
    }
  },
  {
    id: 'orange',
    name: 'Orange County',
    fipsCode: '06059',
    countySeat: 'Santa Ana',
    region: 'southern',
    established: 1889,
    population: 3170435,
    area: 948,
    coordinates: { latitude: 33.7175, longitude: -117.8311 },
    economicFocus: ['Technology', 'Tourism', 'Healthcare', 'International trade'],
    naturalFeatures: ['Pacific Ocean coastline', 'Santa Ana Mountains', 'Newport Bay'],
    culturalLandmarks: ['Disneyland', 'Crystal Cathedral', 'Mission San Juan Capistrano', 'Huntington Beach'],
    funFacts: [
      'Originally named for its orange groves',
      'Home to Disneyland, opened in 1955',
      'One of the most densely populated counties in the US'
    ],
    difficulty: 'easy',
    trivia: {
      easy: ['What fruit was Orange County originally famous for?', 'What famous theme park is located here?'],
      medium: ['When did Disneyland open?', 'What is the county seat of Orange County?'],
      hard: ['What historic mission is famous for swallows returning each spring?', 'What crystal structure was a famous religious landmark?']
    }
  },
  {
    id: 'placer',
    name: 'Placer County',
    fipsCode: '06061',
    countySeat: 'Auburn',
    region: 'northern',
    established: 1851,
    population: 404739,
    area: 1407,
    coordinates: { latitude: 39.0916, longitude: -120.7939 },
    economicFocus: ['Technology', 'Agriculture', 'Tourism', 'Healthcare'],
    naturalFeatures: ['Sierra Nevada Mountains', 'Lake Tahoe (partial)', 'American River', 'Bear River'],
    culturalLandmarks: ['Lake Tahoe', 'Auburn State Recreation Area', 'Foresthill Bridge'],
    funFacts: [
      'Name refers to placer mining (gold found in stream beds)',
      'Contains part of Lake Tahoe',
      'Foresthill Bridge is one of the highest bridges in California'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What type of mining was Placer County named after?', 'What famous lake is partially in this county?'],
      medium: ['What is the county seat of Placer County?', 'What river is popular for rafting?'],
      hard: ['What bridge is notable for its height?', 'What recreation area surrounds Auburn?']
    }
  },
  {
    id: 'plumas',
    name: 'Plumas County',
    fipsCode: '06063',
    countySeat: 'Quincy',
    region: 'northern',
    established: 1854,
    population: 19915,
    area: 2553,
    coordinates: { latitude: 39.9567, longitude: -120.9547 },
    economicFocus: ['Forestry', 'Tourism', 'Recreation', 'Government'],
    naturalFeatures: ['Sierra Nevada Mountains', 'Feather River', 'Lake Almanor'],
    culturalLandmarks: ['Plumas County Museum', 'Feather River Scenic Byway', 'Lakes Basin Recreation Area'],
    funFacts: [
      'Name means "feathers" in Spanish, after the Feather River',
      'Contains numerous mountain lakes',
      'Popular destination for outdoor recreation'
    ],
    difficulty: 'hard',
    trivia: {
      easy: ['What does "plumas" mean in Spanish?', 'What river was the county named after?'],
      medium: ['What is the county seat of Plumas County?', 'What large lake is located in the county?'],
      hard: ['What scenic byway runs through Plumas County?', 'What recreational area contains many mountain lakes?']
    }
  },
  {
    id: 'riverside',
    name: 'Riverside County',
    fipsCode: '06065',
    countySeat: 'Riverside',
    region: 'southern',
    established: 1893,
    population: 2529933,
    area: 7208,
    coordinates: { latitude: 33.7537, longitude: -116.3755 },
    economicFocus: ['Agriculture', 'Distribution/logistics', 'Tourism', 'Military'],
    naturalFeatures: ['Coachella Valley', 'San Bernardino Mountains', 'Santa Rosa Mountains', 'Salton Sea'],
    culturalLandmarks: ['Palm Springs', 'Joshua Tree National Park', 'Mission Inn', 'Coachella Music Festival'],
    funFacts: [
      'Home to Palm Springs, famous desert resort city',
      'Contains part of Joshua Tree National Park',
      'Coachella Valley hosts the famous music festival'
    ],
    difficulty: 'easy',
    trivia: {
      easy: ['What desert resort city is located in Riverside County?', 'What national park is partially in this county?'],
      medium: ['What valley hosts a famous annual music festival?', 'What historic hotel is located in the city of Riverside?'],
      hard: ['What mountain ranges are located in Riverside County?', 'What inland sea borders the county?']
    }
  },
  {
    id: 'sacramento',
    name: 'Sacramento County',
    fipsCode: '06067',
    countySeat: 'Sacramento',
    region: 'northern',
    established: 1850,
    population: 1585055,
    area: 966,
    coordinates: { latitude: 38.4747, longitude: -121.3542 },
    economicFocus: ['Government', 'Healthcare', 'Education', 'Agriculture'],
    naturalFeatures: ['Sacramento River', 'American River', 'Sacramento Valley'],
    culturalLandmarks: ['California State Capitol', 'Old Sacramento Historic District', 'Crocker Art Museum'],
    funFacts: [
      'Home to California\'s state capital',
      'Named after the Sacramento River',
      'Old Sacramento preserves Gold Rush era buildings'
    ],
    difficulty: 'easy',
    trivia: {
      easy: ['What is the capital city of California?', 'What river is Sacramento County named after?'],
      medium: ['What historic district preserves Gold Rush architecture?', 'What is California\'s oldest art museum?'],
      hard: ['What building houses the California state government?', 'What river confluence is located in Sacramento?']
    }
  },
  {
    id: 'san_benito',
    name: 'San Benito County',
    fipsCode: '06069',
    countySeat: 'Hollister',
    region: 'northern',
    established: 1874,
    population: 64209,
    area: 1389,
    coordinates: { latitude: 36.7269, longitude: -121.1725 },
    economicFocus: ['Agriculture', 'Wine production', 'Oil production', 'Government'],
    naturalFeatures: ['Diablo Range', 'San Andreas Fault', 'Pacheco Creek'],
    culturalLandmarks: ['Pinnacles National Park', 'San Juan Bautista State Historic Park', 'Hollister Hills State Vehicular Recreation Area'],
    funFacts: [
      'Named after San Benito Valley',
      'Home to Pinnacles National Park',
      'San Andreas Fault runs through the county'
    ],
    difficulty: 'hard',
    trivia: {
      easy: ['What national park is located in San Benito County?', 'What is the county seat?'],
      medium: ['What major geological fault runs through the county?', 'What valley was the county named after?'],
      hard: ['What state historic park preserves a mission and town?', 'What year was San Benito County established?']
    }
  },
  {
    id: 'san_bernardino',
    name: 'San Bernardino County',
    fipsCode: '06071',
    countySeat: 'San Bernardino',
    region: 'southern',
    established: 1853,
    population: 2214281,
    area: 20105,
    coordinates: { latitude: 34.8041, longitude: -116.4197 },
    economicFocus: ['Logistics', 'Transportation', 'Military', 'Tourism'],
    naturalFeatures: ['Mojave Desert', 'San Bernardino Mountains', 'Death Valley', 'Colorado River'],
    culturalLandmarks: ['Big Bear Lake', 'Lake Arrowhead', 'Calico Ghost Town', 'Route 66'],
    funFacts: [
      'Largest county in the United States by area',
      'Contains both mountain resorts and desert landscapes',
      'Part of the historic Route 66 passes through here'
    ],
    difficulty: 'easy',
    trivia: {
      easy: ['What is the largest county in the US by area?', 'What famous highway passes through San Bernardino County?'],
      medium: ['What mountain lakes are popular resort destinations?', 'What ghost town represents the Old West?'],
      hard: ['What desert covers much of the county?', 'What national park extends into San Bernardino County?']
    }
  },
  {
    id: 'san_diego',
    name: 'San Diego County',
    fipsCode: '06073',
    countySeat: 'San Diego',
    region: 'southern',
    established: 1850,
    population: 3298799,
    area: 4526,
    coordinates: { latitude: 32.7157, longitude: -117.1611 },
    economicFocus: ['Military', 'Biotechnology', 'Tourism', 'International trade'],
    naturalFeatures: ['Pacific Ocean coastline', 'Peninsular Ranges', 'Colorado Desert', 'San Diego Bay'],
    culturalLandmarks: ['Balboa Park', 'San Diego Zoo', 'Mission San Diego', 'USS Midway Museum'],
    funFacts: [
      'Site of the first European settlement in California',
      'Home to the world-famous San Diego Zoo',
      'Major naval and military presence'
    ],
    difficulty: 'easy',
    trivia: {
      easy: ['What zoo is San Diego famous for?', 'What bay is the city of San Diego located on?'],
      medium: ['What was the first European settlement in California?', 'What park contains many museums and the zoo?'],
      hard: ['What aircraft carrier is now a museum?', 'What desert extends into eastern San Diego County?']
    }
  },
  {
    id: 'san_francisco',
    name: 'San Francisco County',
    fipsCode: '06075',
    countySeat: 'San Francisco',
    region: 'northern',
    established: 1850,
    population: 815201,
    area: 47,
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
    economicFocus: ['Technology', 'Finance', 'Tourism', 'Healthcare'],
    naturalFeatures: ['San Francisco Bay', 'Pacific Ocean', 'Hills throughout the city'],
    culturalLandmarks: ['Golden Gate Bridge', 'Alcatraz Island', 'Fisherman\'s Wharf', 'Lombard Street'],
    funFacts: [
      'Only city-county in California',
      'Golden Gate Bridge is an international icon',
      'Famous for its steep hills and cable cars'
    ],
    difficulty: 'easy',
    trivia: {
      easy: ['What famous bridge is in San Francisco?', 'What former prison island is now a tourist attraction?'],
      medium: ['What street is known as the "crookedest street in the world"?', 'What type of public transportation is San Francisco famous for?'],
      hard: ['What makes San Francisco County unique among California counties?', 'What wharf area is a major tourist destination?']
    }
  },
  {
    id: 'san_joaquin',
    name: 'San Joaquin County',
    fipsCode: '06077',
    countySeat: 'Stockton',
    region: 'central_valley',
    established: 1850,
    population: 789410,
    area: 1391,
    coordinates: { latitude: 37.9577, longitude: -121.2908 },
    economicFocus: ['Agriculture', 'Transportation', 'Manufacturing', 'Distribution'],
    naturalFeatures: ['San Joaquin River', 'Sacramento-San Joaquin Delta', 'Central Valley'],
    culturalLandmarks: ['Stockton Deep Water Channel', 'University of the Pacific', 'Haggin Museum'],
    funFacts: [
      'Named after Saint Joachim',
      'Stockton is an inland seaport',
      'Major agricultural producer in the Central Valley'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What is the county seat of San Joaquin County?', 'What saint was the county named after?'],
      medium: ['What makes Stockton unusual as an inland city?', 'What delta system is located here?'],
      hard: ['What channel allows ships to reach Stockton?', 'What private university is located in Stockton?']
    }
  },
  {
    id: 'san_luis_obispo',
    name: 'San Luis Obispo County',
    fipsCode: '06079',
    countySeat: 'San Luis Obispo',
    region: 'central_coast',
    established: 1850,
    population: 282424,
    area: 3304,
    coordinates: { latitude: 35.3050, longitude: -120.6625 },
    economicFocus: ['Agriculture', 'Tourism', 'Education', 'Wine production'],
    naturalFeatures: ['Pacific Ocean coastline', 'Santa Lucia Mountains', 'Morro Bay', 'Pismo Beach'],
    culturalLandmarks: ['Hearst Castle', 'Morro Rock', 'Mission San Luis Obispo', 'Cal Poly San Luis Obispo'],
    funFacts: [
      'Home to the opulent Hearst Castle',
      'Morro Rock is a distinctive volcanic landmark',
      'Famous for its coastal dunes and beaches'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What castle was built by newspaper magnate William Randolph Hearst?', 'What distinctive rock formation is located near Morro Bay?'],
      medium: ['What university is known for its engineering programs?', 'What beach is famous for its sand dunes?'],
      hard: ['What mission was founded in the city of San Luis Obispo?', 'What type of geological formation is Morro Rock?']
    }
  },
  {
    id: 'san_mateo',
    name: 'San Mateo County',
    fipsCode: '06081',
    countySeat: 'Redwood City',
    region: 'northern',
    established: 1856,
    population: 764442,
    area: 449,
    coordinates: { latitude: 37.4973, longitude: -122.3331 },
    economicFocus: ['Technology', 'Biotechnology', 'Finance', 'Healthcare'],
    naturalFeatures: ['San Francisco Bay', 'Pacific Ocean coastline', 'Santa Cruz Mountains'],
    culturalLandmarks: ['Stanford University (partial)', 'Half Moon Bay', 'Filoli Gardens', 'Año Nuevo State Park'],
    funFacts: [
      'Part of Silicon Valley',
      'Half Moon Bay is famous for pumpkins',
      'Home to many tech company headquarters'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What is the county seat of San Mateo County?', 'What coastal town is famous for pumpkins?'],
      medium: ['What prestigious university has facilities in San Mateo County?', 'What gardens are famous for their formal design?'],
      hard: ['What state park is known for elephant seal viewing?', 'What makes San Mateo County part of Silicon Valley?']
    }
  },
  {
    id: 'santa_barbara',
    name: 'Santa Barbara County',
    fipsCode: '06083',
    countySeat: 'Santa Barbara',
    region: 'central_coast',
    established: 1850,
    population: 448229,
    area: 2738,
    coordinates: { latitude: 34.4208, longitude: -119.6982 },
    economicFocus: ['Tourism', 'Agriculture', 'Technology', 'Wine production'],
    naturalFeatures: ['Pacific Ocean coastline', 'Channel Islands', 'Santa Ynez Mountains', 'Santa Maria Valley'],
    culturalLandmarks: ['Santa Barbara Mission', 'University of California Santa Barbara', 'Solvang', 'Channel Islands National Park'],
    funFacts: [
      'Known as the "American Riviera"',
      'Home to Channel Islands National Park',
      'Solvang is a Danish-themed town'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What is Santa Barbara County nicknamed?', 'What Danish-themed town is located here?'],
      medium: ['What university is located in Santa Barbara?', 'What islands form a national park off the coast?'],
      hard: ['What mission is known as the "Queen of the Missions"?', 'What valley is known for wine production?']
    }
  },
  {
    id: 'santa_clara',
    name: 'Santa Clara County',
    fipsCode: '06085',
    countySeat: 'San Jose',
    region: 'northern',
    established: 1850,
    population: 1927852,
    area: 1291,
    coordinates: { latitude: 37.3541, longitude: -121.9552 },
    economicFocus: ['Technology', 'Software', 'Hardware manufacturing', 'Venture capital'],
    naturalFeatures: ['San Francisco Bay', 'Santa Cruz Mountains', 'Coyote Creek'],
    culturalLandmarks: ['Silicon Valley', 'Stanford University', 'Winchester Mystery House', 'Great America'],
    funFacts: [
      'Heart of Silicon Valley',
      'Home to major tech companies like Apple, Google, Facebook',
      'San Jose is the largest city in Northern California'
    ],
    difficulty: 'easy',
    trivia: {
      easy: ['What valley is Santa Clara County the heart of?', 'What is the largest city in Northern California?'],
      medium: ['What mysterious house has staircases leading to nowhere?', 'What major university is located here?'],
      hard: ['What theme park is located in Santa Clara County?', 'What type of companies is Silicon Valley famous for?']
    }
  },
  {
    id: 'santa_cruz',
    name: 'Santa Cruz County',
    fipsCode: '06087',
    countySeat: 'Santa Cruz',
    region: 'northern',
    established: 1850,
    population: 270861,
    area: 445,
    coordinates: { latitude: 37.0525, longitude: -122.0131 },
    economicFocus: ['Tourism', 'Agriculture', 'Technology', 'Education'],
    naturalFeatures: ['Pacific Ocean coastline', 'Santa Cruz Mountains', 'Monterey Bay'],
    culturalLandmarks: ['Santa Cruz Beach Boardwalk', 'University of California Santa Cruz', 'Big Sur (northern part)'],
    funFacts: [
      'Home to the famous Santa Cruz Beach Boardwalk',
      'UC Santa Cruz is known for its redwood forest campus',
      'Major surfing destination'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What beach attraction is Santa Cruz famous for?', 'What university has a campus in the redwoods?'],
      medium: ['What bay borders Santa Cruz County to the south?', 'What sport is Santa Cruz known for?'],
      hard: ['What scenic area extends into northern Santa Cruz County?', 'What makes UC Santa Cruz campus unique?']
    }
  },
  {
    id: 'shasta',
    name: 'Shasta County',
    fipsCode: '06089',
    countySeat: 'Redding',
    region: 'northern',
    established: 1850,
    population: 182155,
    area: 3785,
    coordinates: { latitude: 40.7364, longitude: -122.2014 },
    economicFocus: ['Healthcare', 'Government', 'Tourism', 'Forestry'],
    naturalFeatures: ['Cascade Range', 'Mount Shasta', 'Shasta Lake', 'Sacramento River'],
    culturalLandmarks: ['Mount Shasta', 'Shasta Dam', 'Lassen Volcanic National Park (partial)', 'Sundial Bridge'],
    funFacts: [
      'Mount Shasta is a prominent volcanic peak',
      'Shasta Dam creates California\'s largest reservoir',
      'The Sundial Bridge is a distinctive architectural landmark'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What mountain peak dominates Shasta County?', 'What is the county seat?'],
      medium: ['What type of geological formation is Mount Shasta?', 'What dam creates the largest reservoir in California?'],
      hard: ['What unique bridge spans the Sacramento River in Redding?', 'What mountain range is Shasta County part of?']
    }
  },
  {
    id: 'sierra',
    name: 'Sierra County',
    fipsCode: '06091',
    countySeat: 'Downieville',
    region: 'northern',
    established: 1852,
    population: 3236,
    area: 953,
    coordinates: { latitude: 39.5780, longitude: -120.8039 },
    economicFocus: ['Tourism', 'Forestry', 'Recreation', 'Government'],
    naturalFeatures: ['Sierra Nevada Mountains', 'Yuba River', 'Tahoe National Forest'],
    culturalLandmarks: ['Downieville Historic District', 'Sierra County Museum', 'Lakes Basin'],
    funFacts: [
      'California\'s second-least populous county',
      'Named after the Sierra Nevada mountain range',
      'Downieville is a well-preserved Gold Rush town'
    ],
    difficulty: 'hard',
    trivia: {
      easy: ['What mountain range was Sierra County named after?', 'What is the county seat?'],
      medium: ['What historic period does Downieville represent?', 'What is Sierra County\'s population ranking?'],
      hard: ['What river flows through Sierra County?', 'What recreational area contains many alpine lakes?']
    }
  },
  {
    id: 'siskiyou',
    name: 'Siskiyou County',
    fipsCode: '06093',
    countySeat: 'Yreka',
    region: 'northern',
    established: 1852,
    population: 44076,
    area: 6278,
    coordinates: { latitude: 41.8100, longitude: -122.6350 },
    economicFocus: ['Agriculture', 'Timber', 'Tourism', 'Government'],
    naturalFeatures: ['Cascade Range', 'Klamath Mountains', 'Mount Shasta', 'Klamath River'],
    culturalLandmarks: ['Mount Shasta', 'Lava Beds National Monument', 'Yreka Historic District'],
    funFacts: [
      'Contains Mount Shasta, a major volcanic peak',
      'Borders Oregon to the north',
      'Rich in Native American history'
    ],
    difficulty: 'hard',
    trivia: {
      easy: ['What state borders Siskiyou County to the north?', 'What major volcanic peak is located here?'],
      medium: ['What is the county seat of Siskiyou County?', 'What national monument preserves volcanic landscapes?'],
      hard: ['What mountain ranges converge in Siskiyou County?', 'What river system flows through the county?']
    }
  },
  {
    id: 'solano',
    name: 'Solano County',
    fipsCode: '06095',
    countySeat: 'Fairfield',
    region: 'northern',
    established: 1850,
    population: 453491,
    area: 822,
    coordinates: { latitude: 38.2685, longitude: -121.9018 },
    economicFocus: ['Government', 'Military', 'Biotechnology', 'Agriculture'],
    naturalFeatures: ['San Francisco Bay', 'Sacramento-San Joaquin Delta', 'Suisun Bay'],
    culturalLandmarks: ['Travis Air Force Base', 'Jelly Belly Factory', 'Benicia State Recreation Area'],
    funFacts: [
      'Home to Travis Air Force Base',
      'Jelly Belly candy is manufactured here',
      'Named after Chief Solano of the Suisunes tribe'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What candy is manufactured in Solano County?', 'What military base is located here?'],
      medium: ['Who was Chief Solano?', 'What is the county seat of Solano County?'],
      hard: ['What bay is formed by the confluence of rivers?', 'What Native American tribe was Chief Solano associated with?']
    }
  },
  {
    id: 'sonoma',
    name: 'Sonoma County',
    fipsCode: '06097',
    countySeat: 'Santa Rosa',
    region: 'northern',
    established: 1850,
    population: 488863,
    area: 1598,
    coordinates: { latitude: 38.5816, longitude: -122.9888 },
    economicFocus: ['Wine production', 'Agriculture', 'Tourism', 'Technology'],
    naturalFeatures: ['Pacific Ocean coastline', 'Russian River', 'Sonoma Valley', 'Mayacamas Mountains'],
    culturalLandmarks: ['Sonoma Plaza', 'Armstrong Redwoods State Natural Reserve', 'Sonoma Coast State Park'],
    funFacts: [
      'Major wine-producing region',
      'Site of the Bear Flag Revolt in 1846',
      'Contains diverse landscapes from coast to valleys'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What is Sonoma County most famous for producing?', 'What is the county seat?'],
      medium: ['What historic revolt occurred in Sonoma in 1846?', 'What river flows through Sonoma County?'],
      hard: ['What plaza was the center of the Bear Flag Revolt?', 'What natural reserve protects ancient redwood trees?']
    }
  },
  {
    id: 'stanislaus',
    name: 'Stanislaus County',
    fipsCode: '06099',
    countySeat: 'Modesto',
    region: 'central_valley',
    established: 1854,
    population: 552878,
    area: 1495,
    coordinates: { latitude: 37.5322, longitude: -120.9876 },
    economicFocus: ['Agriculture', 'Food processing', 'Manufacturing', 'Distribution'],
    naturalFeatures: ['San Joaquin Valley', 'Stanislaus River', 'Tuolumne River'],
    culturalLandmarks: ['McHenry Mansion', 'Modesto Arch', 'Gallo Center for the Arts'],
    funFacts: [
      'Major agricultural producer, especially nuts and dairy',
      'Home to E. & J. Gallo Winery headquarters',
      'Modesto is known as the "Water, Wealth, Contentment, Health" city'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What is the county seat of Stanislaus County?', 'What type of agricultural products is the county known for?'],
      medium: ['What famous winery has its headquarters here?', 'What slogan appears on the Modesto Arch?'],
      hard: ['What mansion is a historic landmark in Modesto?', 'What two rivers flow through Stanislaus County?']
    }
  },
  {
    id: 'sutter',
    name: 'Sutter County',
    fipsCode: '06101',
    countySeat: 'Yuba City',
    region: 'northern',
    established: 1850,
    population: 99063,
    area: 603,
    coordinates: { latitude: 39.1373, longitude: -121.6169 },
    economicFocus: ['Agriculture', 'Food processing', 'Government', 'Healthcare'],
    naturalFeatures: ['Sacramento Valley', 'Feather River', 'Sacramento River'],
    culturalLandmarks: ['Sutter Buttes', 'Community Memorial Museum', 'Yuba City Historic District'],
    funFacts: [
      'Named after John Sutter, early California pioneer',
      'Home to the Sutter Buttes, world\'s smallest mountain range',
      'Major rice and prune producing area'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['Who was Sutter County named after?', 'What is known as the world\'s smallest mountain range?'],
      medium: ['What is the county seat of Sutter County?', 'What crops is Sutter County known for?'],
      hard: ['What fort did John Sutter establish?', 'What rivers border Sutter County?']
    }
  },
  {
    id: 'tehama',
    name: 'Tehama County',
    fipsCode: '06103',
    countySeat: 'Red Bluff',
    region: 'northern',
    established: 1856,
    population: 65084,
    area: 2951,
    coordinates: { latitude: 40.0524, longitude: -122.1614 },
    economicFocus: ['Agriculture', 'Ranching', 'Forestry', 'Government'],
    naturalFeatures: ['Sacramento Valley', 'Coast Range', 'Sacramento River'],
    culturalLandmarks: ['William B. Ide Adobe State Historic Park', 'Red Bluff Historic District', 'Lassen Volcanic National Park (partial)'],
    funFacts: [
      'Named from a Native American word meaning "high water"',
      'Red Bluff was an important steamboat landing',
      'Major almond and walnut producing area'
    ],
    difficulty: 'hard',
    trivia: {
      easy: ['What is the county seat of Tehama County?', 'What does "tehama" mean in Native American language?'],
      medium: ['What historic role did Red Bluff play in transportation?', 'What nuts is Tehama County known for producing?'],
      hard: ['What state historic park preserves an adobe home?', 'What year was Tehama County established?']
    }
  },
  {
    id: 'trinity',
    name: 'Trinity County',
    fipsCode: '06105',
    countySeat: 'Weaverville',
    region: 'northern',
    established: 1850,
    population: 16060,
    area: 3179,
    coordinates: { latitude: 40.7655, longitude: -123.1393 },
    economicFocus: ['Forestry', 'Tourism', 'Mining', 'Cannabis cultivation'],
    naturalFeatures: ['Klamath Mountains', 'Trinity River', 'Trinity Lake', 'Shasta-Trinity National Forest'],
    culturalLandmarks: ['Weaverville Historic District', 'Trinity County Courthouse', 'Joss House State Historic Park'],
    funFacts: [
      'Named after the Trinity River',
      'Weaverville has a preserved Chinese temple',
      'Part of the historic California gold country'
    ],
    difficulty: 'hard',
    trivia: {
      easy: ['What river was Trinity County named after?', 'What is the county seat?'],
      medium: ['What type of temple is preserved in Weaverville?', 'What lake provides recreation in Trinity County?'],
      hard: ['What national forest covers much of Trinity County?', 'What state historic park preserves Chinese heritage?']
    }
  },
  {
    id: 'tulare',
    name: 'Tulare County',
    fipsCode: '06107',
    countySeat: 'Visalia',
    region: 'central_valley',
    established: 1852,
    population: 473117,
    area: 4839,
    coordinates: { latitude: 36.2077, longitude: -118.8597 },
    economicFocus: ['Agriculture', 'Dairy farming', 'Food processing', 'Tourism'],
    naturalFeatures: ['San Joaquin Valley', 'Sierra Nevada Mountains', 'Sequoia National Park', 'Kings Canyon National Park'],
    culturalLandmarks: ['Sequoia National Park', 'General Sherman Tree', 'Crystal Cave'],
    funFacts: [
      'Home to the General Sherman Tree, world\'s largest tree by volume',
      'Named after Tulare Lake, once California\'s largest freshwater lake',
      'Major producer of oranges, grapes, and dairy products'
    ],
    difficulty: 'easy',
    trivia: {
      easy: ['What national park contains the world\'s largest tree?', 'What is the county seat of Tulare County?'],
      medium: ['What is the name of the world\'s largest tree by volume?', 'What lake was Tulare County named after?'],
      hard: ['What cave system can be toured in Sequoia National Park?', 'What happened to Tulare Lake?']
    }
  },
  {
    id: 'tuolumne',
    name: 'Tuolumne County',
    fipsCode: '06109',
    countySeat: 'Sonora',
    region: 'northern',
    established: 1850,
    population: 55810,
    area: 2236,
    coordinates: { latitude: 37.9827, longitude: -120.0182 },
    economicFocus: ['Tourism', 'Timber', 'Mining', 'Agriculture'],
    naturalFeatures: ['Sierra Nevada Mountains', 'Yosemite National Park (partial)', 'Tuolumne River'],
    culturalLandmarks: ['Yosemite National Park', 'Columbia State Historic Park', 'Railtown 1897 State Historic Park'],
    funFacts: [
      'Contains part of Yosemite National Park',
      'Columbia is a preserved Gold Rush town',
      'Home to historic steam train operations'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What famous national park extends into Tuolumne County?', 'What is the county seat?'],
      medium: ['What historic town preserves Gold Rush era buildings?', 'What type of historic transportation is preserved here?'],
      hard: ['What state historic park features steam trains?', 'What river flows through Tuolumne County?']
    }
  },
  {
    id: 'ventura',
    name: 'Ventura County',
    fipsCode: '06111',
    countySeat: 'Ventura',
    region: 'southern',
    established: 1873,
    population: 843843,
    area: 1843,
    coordinates: { latitude: 34.3705, longitude: -119.1391 },
    economicFocus: ['Agriculture', 'Tourism', 'Military', 'Technology'],
    naturalFeatures: ['Pacific Ocean coastline', 'Channel Islands', 'Santa Monica Mountains', 'Oxnard Plain'],
    culturalLandmarks: ['Channel Islands National Park', 'Mission San Buenaventura', 'Ronald Reagan Presidential Library'],
    funFacts: [
      'Major strawberry producing region',
      'Home to Channel Islands National Park',
      'Contains the Ronald Reagan Presidential Library'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What fruit is Ventura County famous for growing?', 'What presidential library is located here?'],
      medium: ['What mission was founded in the city of Ventura?', 'What islands form a national park off the coast?'],
      hard: ['What plain is known for its fertile agricultural land?', 'What mountain range extends into Ventura County?']
    }
  },
  {
    id: 'yolo',
    name: 'Yolo County',
    fipsCode: '06113',
    countySeat: 'Woodland',
    region: 'northern',
    established: 1850,
    population: 220408,
    area: 1015,
    coordinates: { latitude: 38.6047, longitude: -121.9018 },
    economicFocus: ['Agriculture', 'Education', 'Government', 'Research'],
    naturalFeatures: ['Sacramento Valley', 'Sacramento River', 'Cache Creek'],
    culturalLandmarks: ['University of California Davis', 'California State Fair (sometimes)', 'Woodland Opera House'],
    funFacts: [
      'Home to UC Davis, a leading agricultural research university',
      'Name possibly derives from a Native American word for valley',
      'Major producer of tomatoes, almonds, and other crops'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What major university is located in Yolo County?', 'What is the county seat?'],
      medium: ['What is UC Davis particularly known for studying?', 'What does "yolo" possibly mean in Native American language?'],
      hard: ['What historic opera house is located in Woodland?', 'What creek flows through Yolo County?']
    }
  },
  {
    id: 'yuba',
    name: 'Yuba County',
    fipsCode: '06115',
    countySeat: 'Marysville',
    region: 'northern',
    established: 1850,
    population: 81575,
    area: 630,
    coordinates: { latitude: 39.2668, longitude: -121.4169 },
    economicFocus: ['Agriculture', 'Military', 'Government', 'Healthcare'],
    naturalFeatures: ['Sacramento Valley', 'Yuba River', 'Feather River', 'Sutter Buttes'],
    culturalLandmarks: ['Beale Air Force Base', 'Bok Kai Temple', 'Mary Aaron Memorial Museum'],
    funFacts: [
      'Named after the Yuba River',
      'Marysville was once known as the "Gateway to the Gold Fields"',
      'Home to Beale Air Force Base'
    ],
    difficulty: 'medium',
    trivia: {
      easy: ['What river was Yuba County named after?', 'What is the county seat?'],
      medium: ['What Air Force base is located in Yuba County?', 'What was Marysville\'s nickname during the Gold Rush?'],
      hard: ['What Chinese temple is preserved in Marysville?', 'What mountain formation is shared with neighboring Sutter County?']
    }
  }
];

// Difficulty-based county groupings for game progression
export const difficultyLevels = {
  easy: californiaCounties.filter(county => county.difficulty === 'easy').map(county => county.id),
  medium: californiaCounties.filter(county => county.difficulty === 'medium').map(county => county.id),
  hard: californiaCounties.filter(county => county.difficulty === 'hard').map(county => county.id)
};

// Helper functions for game logic
export const getCountyById = (id: string): CaliforniaCounty | undefined => {
  return californiaCounties.find(county => county.id === id);
};

export const getCountiesByRegion = (regionId: string): CaliforniaCounty[] => {
  const region = californiaRegions.find(r => r.id === regionId);
  if (!region) return [];
  return californiaCounties.filter(county => region.counties.includes(county.id));
};

export const getCountiesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): CaliforniaCounty[] => {
  return californiaCounties.filter(county => county.difficulty === difficulty);
};

export const getTriviaByDifficulty = (countyId: string, difficulty: 'easy' | 'medium' | 'hard'): string[] => {
  const county = getCountyById(countyId);
  return county ? county.trivia[difficulty] : [];
};

export default californiaCounties;