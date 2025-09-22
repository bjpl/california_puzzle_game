// Comprehensive California Counties Quiz Question Database
// Multiple question types for each county, organized by region

export interface QuizQuestion {
  id: string;
  countyId: string;
  countyName: string;
  region: string;
  type: 'capital' | 'landmark' | 'geography' | 'history' | 'economy' | 'demographics' | 'nature' | 'culture';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correctAnswer: string;
  options: string[];
  explanation?: string;
}

// Helper function to shuffle array for random options
const shuffle = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Bay Area Counties Quiz Questions
const bayAreaQuestions: QuizQuestion[] = [
  // San Francisco County
  {
    id: 'sf-capital',
    countyId: 'san-francisco',
    countyName: 'San Francisco',
    region: 'Bay Area',
    type: 'capital',
    difficulty: 'easy',
    question: 'What is unique about San Francisco County\'s government structure?',
    correctAnswer: 'It\'s the only consolidated city-county in California',
    options: shuffle(['It\'s the only consolidated city-county in California', 'It has no county seat', 'It has two county seats', 'It\'s governed by the state directly']),
    explanation: 'San Francisco is both a city and a county, making it unique in California.'
  },
  {
    id: 'sf-landmark',
    countyId: 'san-francisco',
    countyName: 'San Francisco',
    region: 'Bay Area',
    type: 'landmark',
    difficulty: 'easy',
    question: 'Which famous bridge connects San Francisco to Marin County?',
    correctAnswer: 'Golden Gate Bridge',
    options: shuffle(['Golden Gate Bridge', 'Bay Bridge', 'Richmond Bridge', 'San Mateo Bridge']),
  },
  {
    id: 'sf-geography',
    countyId: 'san-francisco',
    countyName: 'San Francisco',
    region: 'Bay Area',
    type: 'geography',
    difficulty: 'medium',
    question: 'San Francisco is the ___ smallest county by area in California.',
    correctAnswer: 'Second',
    options: shuffle(['Second', 'First', 'Third', 'Fourth']),
    explanation: 'At only 47 square miles, San Francisco is the second smallest county after Alpine County.'
  },

  // Alameda County
  {
    id: 'alameda-capital',
    countyId: 'alameda',
    countyName: 'Alameda',
    region: 'Bay Area',
    type: 'capital',
    difficulty: 'easy',
    question: 'What is the county seat of Alameda County?',
    correctAnswer: 'Oakland',
    options: shuffle(['Oakland', 'Berkeley', 'Fremont', 'Hayward']),
  },
  {
    id: 'alameda-landmark',
    countyId: 'alameda',
    countyName: 'Alameda',
    region: 'Bay Area',
    type: 'landmark',
    difficulty: 'medium',
    question: 'Which prestigious university is located in Alameda County?',
    correctAnswer: 'UC Berkeley',
    options: shuffle(['UC Berkeley', 'Stanford', 'UC Davis', 'San Francisco State']),
  },
  {
    id: 'alameda-geography',
    countyId: 'alameda',
    countyName: 'Alameda',
    region: 'Bay Area',
    type: 'geography',
    difficulty: 'medium',
    question: 'Alameda County is located in which part of the Bay Area?',
    correctAnswer: 'East Bay',
    options: shuffle(['East Bay', 'North Bay', 'South Bay', 'Peninsula']),
  },

  // Santa Clara County
  {
    id: 'santa-clara-capital',
    countyId: 'santa-clara',
    countyName: 'Santa Clara',
    region: 'Bay Area',
    type: 'capital',
    difficulty: 'easy',
    question: 'What is the county seat of Santa Clara County?',
    correctAnswer: 'San Jose',
    options: shuffle(['San Jose', 'Santa Clara', 'Palo Alto', 'Mountain View']),
  },
  {
    id: 'santa-clara-economy',
    countyId: 'santa-clara',
    countyName: 'Santa Clara',
    region: 'Bay Area',
    type: 'economy',
    difficulty: 'easy',
    question: 'Santa Clara County is known as the heart of which tech region?',
    correctAnswer: 'Silicon Valley',
    options: shuffle(['Silicon Valley', 'Tech Coast', 'Digital Delta', 'Innovation District']),
  },
  {
    id: 'santa-clara-landmark',
    countyId: 'santa-clara',
    countyName: 'Santa Clara',
    region: 'Bay Area',
    type: 'landmark',
    difficulty: 'medium',
    question: 'Which major tech company has its headquarters in Cupertino, Santa Clara County?',
    correctAnswer: 'Apple',
    options: shuffle(['Apple', 'Microsoft', 'Amazon', 'IBM']),
  },

  // San Mateo County
  {
    id: 'san-mateo-capital',
    countyId: 'san-mateo',
    countyName: 'San Mateo',
    region: 'Bay Area',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of San Mateo County?',
    correctAnswer: 'Redwood City',
    options: shuffle(['Redwood City', 'San Mateo', 'Daly City', 'South San Francisco']),
  },
  {
    id: 'san-mateo-landmark',
    countyId: 'san-mateo',
    countyName: 'San Mateo',
    region: 'Bay Area',
    type: 'landmark',
    difficulty: 'easy',
    question: 'Which major airport is located in San Mateo County?',
    correctAnswer: 'San Francisco International Airport (SFO)',
    options: shuffle(['San Francisco International Airport (SFO)', 'Oakland International', 'San Jose International', 'Sacramento International']),
  },

  // Contra Costa County
  {
    id: 'contra-costa-capital',
    countyId: 'contra-costa',
    countyName: 'Contra Costa',
    region: 'Bay Area',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Contra Costa County?',
    correctAnswer: 'Martinez',
    options: shuffle(['Martinez', 'Concord', 'Richmond', 'Walnut Creek']),
  },
  {
    id: 'contra-costa-landmark',
    countyId: 'contra-costa',
    countyName: 'Contra Costa',
    region: 'Bay Area',
    type: 'landmark',
    difficulty: 'medium',
    question: 'Which prominent mountain is located in Contra Costa County?',
    correctAnswer: 'Mount Diablo',
    options: shuffle(['Mount Diablo', 'Mount Tamalpais', 'Mount Hamilton', 'Mount Umunhum']),
  },
  {
    id: 'contra-costa-history',
    countyId: 'contra-costa',
    countyName: 'Contra Costa',
    region: 'Bay Area',
    type: 'history',
    difficulty: 'hard',
    question: 'What does "Contra Costa" mean in Spanish?',
    correctAnswer: 'Opposite Coast',
    options: shuffle(['Opposite Coast', 'Golden Coast', 'Beautiful Coast', 'Western Coast']),
    explanation: 'The name refers to the county being on the opposite coast of the Bay from San Francisco.'
  },

  // Marin County
  {
    id: 'marin-capital',
    countyId: 'marin',
    countyName: 'Marin',
    region: 'Bay Area',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Marin County?',
    correctAnswer: 'San Rafael',
    options: shuffle(['San Rafael', 'Sausalito', 'Mill Valley', 'Novato']),
  },
  {
    id: 'marin-landmark',
    countyId: 'marin',
    countyName: 'Marin',
    region: 'Bay Area',
    type: 'landmark',
    difficulty: 'easy',
    question: 'Which famous redwood forest is located in Marin County?',
    correctAnswer: 'Muir Woods',
    options: shuffle(['Muir Woods', 'Big Basin', 'Armstrong Redwoods', 'Humboldt Redwoods']),
  },
  {
    id: 'marin-demographics',
    countyId: 'marin',
    countyName: 'Marin',
    region: 'Bay Area',
    type: 'demographics',
    difficulty: 'medium',
    question: 'Marin County has one of the highest ___ in California.',
    correctAnswer: 'Income per capita',
    options: shuffle(['Income per capita', 'Population density', 'Number of beaches', 'Agricultural output']),
  },

  // Solano County
  {
    id: 'solano-capital',
    countyId: 'solano',
    countyName: 'Solano',
    region: 'Bay Area',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Solano County?',
    correctAnswer: 'Fairfield',
    options: shuffle(['Fairfield', 'Vallejo', 'Vacaville', 'Benicia']),
  },
  {
    id: 'solano-history',
    countyId: 'solano',
    countyName: 'Solano',
    region: 'Bay Area',
    type: 'history',
    difficulty: 'hard',
    question: 'Which city in Solano County briefly served as California\'s state capital?',
    correctAnswer: 'Vallejo',
    options: shuffle(['Vallejo', 'Benicia', 'Fairfield', 'Vacaville']),
    explanation: 'Vallejo was the state capital in 1852 and 1853.'
  },
  {
    id: 'solano-landmark',
    countyId: 'solano',
    countyName: 'Solano',
    region: 'Bay Area',
    type: 'landmark',
    difficulty: 'medium',
    question: 'Which major Air Force base is located in Solano County?',
    correctAnswer: 'Travis Air Force Base',
    options: shuffle(['Travis Air Force Base', 'Beale Air Force Base', 'Edwards Air Force Base', 'Vandenberg Air Force Base']),
  },

  // Napa County
  {
    id: 'napa-capital',
    countyId: 'napa',
    countyName: 'Napa',
    region: 'Bay Area',
    type: 'capital',
    difficulty: 'easy',
    question: 'What is the county seat of Napa County?',
    correctAnswer: 'Napa',
    options: shuffle(['Napa', 'St. Helena', 'Calistoga', 'Yountville']),
  },
  {
    id: 'napa-economy',
    countyId: 'napa',
    countyName: 'Napa',
    region: 'Bay Area',
    type: 'economy',
    difficulty: 'easy',
    question: 'Napa County is world-famous for producing what?',
    correctAnswer: 'Wine',
    options: shuffle(['Wine', 'Cheese', 'Almonds', 'Olives']),
  },
  {
    id: 'napa-culture',
    countyId: 'napa',
    countyName: 'Napa',
    region: 'Bay Area',
    type: 'culture',
    difficulty: 'medium',
    question: 'What is Napa Valley\'s most planted grape variety?',
    correctAnswer: 'Cabernet Sauvignon',
    options: shuffle(['Cabernet Sauvignon', 'Chardonnay', 'Pinot Noir', 'Merlot']),
  },

  // Sonoma County
  {
    id: 'sonoma-capital',
    countyId: 'sonoma',
    countyName: 'Sonoma',
    region: 'Bay Area',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Sonoma County?',
    correctAnswer: 'Santa Rosa',
    options: shuffle(['Santa Rosa', 'Sonoma', 'Petaluma', 'Healdsburg']),
  },
  {
    id: 'sonoma-geography',
    countyId: 'sonoma',
    countyName: 'Sonoma',
    region: 'Bay Area',
    type: 'geography',
    difficulty: 'medium',
    question: 'Which river flows through Sonoma County to the Pacific Ocean?',
    correctAnswer: 'Russian River',
    options: shuffle(['Russian River', 'Sacramento River', 'American River', 'Eel River']),
  },
  {
    id: 'sonoma-landmark',
    countyId: 'sonoma',
    countyName: 'Sonoma',
    region: 'Bay Area',
    type: 'landmark',
    difficulty: 'medium',
    question: 'Which coastal town in Sonoma County was the setting for Alfred Hitchcock\'s "The Birds"?',
    correctAnswer: 'Bodega Bay',
    options: shuffle(['Bodega Bay', 'Half Moon Bay', 'Monterey Bay', 'Morro Bay']),
  },
];

// Southern California Counties Quiz Questions
const southernCaliforniaQuestions: QuizQuestion[] = [
  // Los Angeles County
  {
    id: 'la-capital',
    countyId: 'los-angeles',
    countyName: 'Los Angeles',
    region: 'Southern California',
    type: 'capital',
    difficulty: 'easy',
    question: 'What is the county seat of Los Angeles County?',
    correctAnswer: 'Los Angeles',
    options: shuffle(['Los Angeles', 'Long Beach', 'Pasadena', 'Santa Monica']),
  },
  {
    id: 'la-demographics',
    countyId: 'los-angeles',
    countyName: 'Los Angeles',
    region: 'Southern California',
    type: 'demographics',
    difficulty: 'easy',
    question: 'Los Angeles County is the most ___ county in the United States.',
    correctAnswer: 'Populous',
    options: shuffle(['Populous', 'Wealthy', 'Diverse', 'Visited']),
    explanation: 'With over 10 million residents, LA County has more people than 40 U.S. states.'
  },
  {
    id: 'la-landmark',
    countyId: 'los-angeles',
    countyName: 'Los Angeles',
    region: 'Southern California',
    type: 'landmark',
    difficulty: 'easy',
    question: 'Which famous entertainment district is located in Los Angeles County?',
    correctAnswer: 'Hollywood',
    options: shuffle(['Hollywood', 'Broadway', 'The Strip', 'French Quarter']),
  },
  {
    id: 'la-culture',
    countyId: 'los-angeles',
    countyName: 'Los Angeles',
    region: 'Southern California',
    type: 'culture',
    difficulty: 'medium',
    question: 'Which famous art museum is located on Wilshire Boulevard?',
    correctAnswer: 'LACMA (Los Angeles County Museum of Art)',
    options: shuffle(['LACMA (Los Angeles County Museum of Art)', 'The Getty Center', 'MOCA', 'The Broad']),
  },

  // San Diego County
  {
    id: 'sd-capital',
    countyId: 'san-diego',
    countyName: 'San Diego',
    region: 'Southern California',
    type: 'capital',
    difficulty: 'easy',
    question: 'What is the county seat of San Diego County?',
    correctAnswer: 'San Diego',
    options: shuffle(['San Diego', 'La Jolla', 'Oceanside', 'Chula Vista']),
  },
  {
    id: 'sd-geography',
    countyId: 'san-diego',
    countyName: 'San Diego',
    region: 'Southern California',
    type: 'geography',
    difficulty: 'easy',
    question: 'San Diego County shares an international border with which country?',
    correctAnswer: 'Mexico',
    options: shuffle(['Mexico', 'Canada', 'Guatemala', 'Belize']),
  },
  {
    id: 'sd-landmark',
    countyId: 'san-diego',
    countyName: 'San Diego',
    region: 'Southern California',
    type: 'landmark',
    difficulty: 'easy',
    question: 'Which world-famous zoo is located in San Diego\'s Balboa Park?',
    correctAnswer: 'San Diego Zoo',
    options: shuffle(['San Diego Zoo', 'Los Angeles Zoo', 'Oakland Zoo', 'San Francisco Zoo']),
  },
  {
    id: 'sd-history',
    countyId: 'san-diego',
    countyName: 'San Diego',
    region: 'Southern California',
    type: 'history',
    difficulty: 'medium',
    question: 'San Diego is known as the birthplace of what in California?',
    correctAnswer: 'California (first Spanish mission)',
    options: shuffle(['California (first Spanish mission)', 'Gold Rush', 'Movie industry', 'Computer technology']),
    explanation: 'Mission San Diego de Alcalá, founded in 1769, was the first Spanish mission in California.'
  },

  // Orange County
  {
    id: 'orange-capital',
    countyId: 'orange',
    countyName: 'Orange',
    region: 'Southern California',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Orange County?',
    correctAnswer: 'Santa Ana',
    options: shuffle(['Santa Ana', 'Anaheim', 'Irvine', 'Newport Beach']),
  },
  {
    id: 'orange-landmark',
    countyId: 'orange',
    countyName: 'Orange',
    region: 'Southern California',
    type: 'landmark',
    difficulty: 'easy',
    question: 'Which famous theme park opened in Orange County in 1955?',
    correctAnswer: 'Disneyland',
    options: shuffle(['Disneyland', 'Universal Studios', 'Six Flags', 'Knott\'s Berry Farm']),
  },
  {
    id: 'orange-geography',
    countyId: 'orange',
    countyName: 'Orange',
    region: 'Southern California',
    type: 'geography',
    difficulty: 'medium',
    question: 'Which famous surf beach is located in Orange County?',
    correctAnswer: 'Huntington Beach',
    options: shuffle(['Huntington Beach', 'Venice Beach', 'Malibu Beach', 'Manhattan Beach']),
  },

  // Riverside County
  {
    id: 'riverside-capital',
    countyId: 'riverside',
    countyName: 'Riverside',
    region: 'Southern California',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Riverside County?',
    correctAnswer: 'Riverside',
    options: shuffle(['Riverside', 'Palm Springs', 'Corona', 'Temecula']),
  },
  {
    id: 'riverside-landmark',
    countyId: 'riverside',
    countyName: 'Riverside',
    region: 'Southern California',
    type: 'landmark',
    difficulty: 'easy',
    question: 'Which famous desert resort city is located in Riverside County?',
    correctAnswer: 'Palm Springs',
    options: shuffle(['Palm Springs', 'Santa Barbara', 'Carmel', 'Big Sur']),
  },
  {
    id: 'riverside-culture',
    countyId: 'riverside',
    countyName: 'Riverside',
    region: 'Southern California',
    type: 'culture',
    difficulty: 'medium',
    question: 'Which famous music festival takes place annually in Riverside County?',
    correctAnswer: 'Coachella',
    options: shuffle(['Coachella', 'Burning Man', 'Outside Lands', 'Lightning in a Bottle']),
  },

  // San Bernardino County
  {
    id: 'san-bernardino-capital',
    countyId: 'san-bernardino',
    countyName: 'San Bernardino',
    region: 'Southern California',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of San Bernardino County?',
    correctAnswer: 'San Bernardino',
    options: shuffle(['San Bernardino', 'Ontario', 'Rancho Cucamonga', 'Fontana']),
  },
  {
    id: 'san-bernardino-geography',
    countyId: 'san-bernardino',
    countyName: 'San Bernardino',
    region: 'Southern California',
    type: 'geography',
    difficulty: 'easy',
    question: 'San Bernardino County is the ___ county by area in the United States.',
    correctAnswer: 'Largest',
    options: shuffle(['Largest', 'Second largest', 'Third largest', 'Fourth largest']),
    explanation: 'At 20,105 square miles, it\'s larger than Vermont, New Hampshire, Massachusetts, and New Jersey combined.'
  },
  {
    id: 'san-bernardino-nature',
    countyId: 'san-bernardino',
    countyName: 'San Bernardino',
    region: 'Southern California',
    type: 'nature',
    difficulty: 'medium',
    question: 'Which desert comprises much of San Bernardino County?',
    correctAnswer: 'Mojave Desert',
    options: shuffle(['Mojave Desert', 'Sonoran Desert', 'Chihuahuan Desert', 'Great Basin Desert']),
  },

  // Ventura County
  {
    id: 'ventura-capital',
    countyId: 'ventura',
    countyName: 'Ventura',
    region: 'Southern California',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Ventura County?',
    correctAnswer: 'Ventura',
    options: shuffle(['Ventura', 'Oxnard', 'Thousand Oaks', 'Simi Valley']),
  },
  {
    id: 'ventura-landmark',
    countyId: 'ventura',
    countyName: 'Ventura',
    region: 'Southern California',
    type: 'landmark',
    difficulty: 'medium',
    question: 'Channel Islands National Park headquarters is located in which Ventura County city?',
    correctAnswer: 'Ventura',
    options: shuffle(['Ventura', 'Oxnard', 'Port Hueneme', 'Camarillo']),
  },
  {
    id: 'ventura-economy',
    countyId: 'ventura',
    countyName: 'Ventura',
    region: 'Southern California',
    type: 'economy',
    difficulty: 'medium',
    question: 'Ventura County is one of the principal counties for which agricultural product?',
    correctAnswer: 'Strawberries',
    options: shuffle(['Strawberries', 'Apples', 'Oranges', 'Grapes']),
  },

  // Imperial County
  {
    id: 'imperial-capital',
    countyId: 'imperial',
    countyName: 'Imperial',
    region: 'Southern California',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Imperial County?',
    correctAnswer: 'El Centro',
    options: shuffle(['El Centro', 'Calexico', 'Brawley', 'Imperial']),
  },
  {
    id: 'imperial-geography',
    countyId: 'imperial',
    countyName: 'Imperial',
    region: 'Southern California',
    type: 'geography',
    difficulty: 'medium',
    question: 'Which large saline lake is located in Imperial County?',
    correctAnswer: 'Salton Sea',
    options: shuffle(['Salton Sea', 'Mono Lake', 'Clear Lake', 'Lake Tahoe']),
  },
  {
    id: 'imperial-nature',
    countyId: 'imperial',
    countyName: 'Imperial',
    region: 'Southern California',
    type: 'nature',
    difficulty: 'hard',
    question: 'Imperial County contains California\'s lowest point. What is it?',
    correctAnswer: 'Badwater Basin (-282 feet)',
    options: shuffle(['Badwater Basin (-282 feet)', 'Death Valley (-282 feet)', 'Salton Sea (-236 feet)', 'Colorado Desert (-200 feet)']),
    explanation: 'Part of Death Valley extends into Imperial County, containing California\'s lowest elevation.'
  },
];

// Central Valley Counties Quiz Questions
const centralValleyQuestions: QuizQuestion[] = [
  // Sacramento County
  {
    id: 'sacramento-capital',
    countyId: 'sacramento',
    countyName: 'Sacramento',
    region: 'Central Valley',
    type: 'capital',
    difficulty: 'easy',
    question: 'What is the county seat of Sacramento County?',
    correctAnswer: 'Sacramento',
    options: shuffle(['Sacramento', 'Elk Grove', 'Folsom', 'Citrus Heights']),
  },
  {
    id: 'sacramento-history',
    countyId: 'sacramento',
    countyName: 'Sacramento',
    region: 'Central Valley',
    type: 'history',
    difficulty: 'easy',
    question: 'Sacramento is the ___ capital of California.',
    correctAnswer: 'State',
    options: shuffle(['State', 'Former', 'Agricultural', 'Industrial']),
  },
  {
    id: 'sacramento-landmark',
    countyId: 'sacramento',
    countyName: 'Sacramento',
    region: 'Central Valley',
    type: 'landmark',
    difficulty: 'medium',
    question: 'Which two rivers meet in Sacramento?',
    correctAnswer: 'American and Sacramento Rivers',
    options: shuffle(['American and Sacramento Rivers', 'Sacramento and San Joaquin Rivers', 'Feather and Sacramento Rivers', 'American and Feather Rivers']),
  },

  // Fresno County
  {
    id: 'fresno-capital',
    countyId: 'fresno',
    countyName: 'Fresno',
    region: 'Central Valley',
    type: 'capital',
    difficulty: 'easy',
    question: 'What is the county seat of Fresno County?',
    correctAnswer: 'Fresno',
    options: shuffle(['Fresno', 'Clovis', 'Sanger', 'Reedley']),
  },
  {
    id: 'fresno-geography',
    countyId: 'fresno',
    countyName: 'Fresno',
    region: 'Central Valley',
    type: 'geography',
    difficulty: 'medium',
    question: 'Fresno County contains the geographic center of what?',
    correctAnswer: 'California',
    options: shuffle(['California', 'Central Valley', 'United States', 'San Joaquin Valley']),
  },
  {
    id: 'fresno-economy',
    countyId: 'fresno',
    countyName: 'Fresno',
    region: 'Central Valley',
    type: 'economy',
    difficulty: 'medium',
    question: 'Fresno County leads the nation in agricultural production of which crop?',
    correctAnswer: 'Grapes (raisins)',
    options: shuffle(['Grapes (raisins)', 'Almonds', 'Strawberries', 'Lettuce']),
  },

  // Kern County
  {
    id: 'kern-capital',
    countyId: 'kern',
    countyName: 'Kern',
    region: 'Central Valley',
    type: 'capital',
    difficulty: 'easy',
    question: 'What is the county seat of Kern County?',
    correctAnswer: 'Bakersfield',
    options: shuffle(['Bakersfield', 'Delano', 'Ridgecrest', 'Tehachapi']),
  },
  {
    id: 'kern-economy',
    countyId: 'kern',
    countyName: 'Kern',
    region: 'Central Valley',
    type: 'economy',
    difficulty: 'medium',
    question: 'Kern County is a major producer of which energy resource?',
    correctAnswer: 'Oil',
    options: shuffle(['Oil', 'Natural gas', 'Solar power', 'Wind energy']),
    explanation: 'Kern County produces about 70% of California\'s oil.'
  },
  {
    id: 'kern-geography',
    countyId: 'kern',
    countyName: 'Kern',
    region: 'Central Valley',
    type: 'geography',
    difficulty: 'medium',
    question: 'Which mountain range passes through Kern County?',
    correctAnswer: 'Tehachapi Mountains',
    options: shuffle(['Tehachapi Mountains', 'Coast Range', 'Cascade Range', 'Peninsular Ranges']),
  },

  // San Joaquin County
  {
    id: 'san-joaquin-capital',
    countyId: 'san-joaquin',
    countyName: 'San Joaquin',
    region: 'Central Valley',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of San Joaquin County?',
    correctAnswer: 'Stockton',
    options: shuffle(['Stockton', 'Tracy', 'Lodi', 'Manteca']),
  },
  {
    id: 'san-joaquin-geography',
    countyId: 'san-joaquin',
    countyName: 'San Joaquin',
    region: 'Central Valley',
    type: 'geography',
    difficulty: 'medium',
    question: 'San Joaquin County is located in which delta region?',
    correctAnswer: 'Sacramento-San Joaquin Delta',
    options: shuffle(['Sacramento-San Joaquin Delta', 'Colorado River Delta', 'Klamath River Delta', 'Eel River Delta']),
  },

  // Stanislaus County
  {
    id: 'stanislaus-capital',
    countyId: 'stanislaus',
    countyName: 'Stanislaus',
    region: 'Central Valley',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Stanislaus County?',
    correctAnswer: 'Modesto',
    options: shuffle(['Modesto', 'Turlock', 'Ceres', 'Riverbank']),
  },
  {
    id: 'stanislaus-culture',
    countyId: 'stanislaus',
    countyName: 'Stanislaus',
    region: 'Central Valley',
    type: 'culture',
    difficulty: 'hard',
    question: 'What is Modesto\'s city motto?',
    correctAnswer: 'Water, Wealth, Contentment, Health',
    options: shuffle(['Water, Wealth, Contentment, Health', 'Gateway to Yosemite', 'Heart of the Valley', 'City of Great Neighbors']),
  },

  // Additional Central Valley counties with 2-3 questions each
  // Tulare County
  {
    id: 'tulare-capital',
    countyId: 'tulare',
    countyName: 'Tulare',
    region: 'Central Valley',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Tulare County?',
    correctAnswer: 'Visalia',
    options: shuffle(['Visalia', 'Tulare', 'Porterville', 'Dinuba']),
  },
  {
    id: 'tulare-landmark',
    countyId: 'tulare',
    countyName: 'Tulare',
    region: 'Central Valley',
    type: 'landmark',
    difficulty: 'medium',
    question: 'Which national park has an entrance in Tulare County?',
    correctAnswer: 'Sequoia National Park',
    options: shuffle(['Sequoia National Park', 'Yosemite National Park', 'Kings Canyon National Park', 'Joshua Tree National Park']),
  },

  // Merced County
  {
    id: 'merced-capital',
    countyId: 'merced',
    countyName: 'Merced',
    region: 'Central Valley',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Merced County?',
    correctAnswer: 'Merced',
    options: shuffle(['Merced', 'Los Banos', 'Atwater', 'Livingston']),
  },
  {
    id: 'merced-landmark',
    countyId: 'merced',
    countyName: 'Merced',
    region: 'Central Valley',
    type: 'landmark',
    difficulty: 'medium',
    question: 'Which UC campus is located in Merced County?',
    correctAnswer: 'UC Merced',
    options: shuffle(['UC Merced', 'UC Davis', 'UC Riverside', 'UC Santa Cruz']),
  },

  // Kings County
  {
    id: 'kings-capital',
    countyId: 'kings',
    countyName: 'Kings',
    region: 'Central Valley',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Kings County?',
    correctAnswer: 'Hanford',
    options: shuffle(['Hanford', 'Lemoore', 'Avenal', 'Corcoran']),
  },
  {
    id: 'kings-landmark',
    countyId: 'kings',
    countyName: 'Kings',
    region: 'Central Valley',
    type: 'landmark',
    difficulty: 'hard',
    question: 'Which Naval Air Station is located in Kings County?',
    correctAnswer: 'NAS Lemoore',
    options: shuffle(['NAS Lemoore', 'Travis AFB', 'Beale AFB', 'Edwards AFB']),
  },

  // Madera County
  {
    id: 'madera-capital',
    countyId: 'madera',
    countyName: 'Madera',
    region: 'Central Valley',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Madera County?',
    correctAnswer: 'Madera',
    options: shuffle(['Madera', 'Chowchilla', 'Oakhurst', 'Bass Lake']),
  },

  // Yolo County
  {
    id: 'yolo-capital',
    countyId: 'yolo',
    countyName: 'Yolo',
    region: 'Central Valley',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Yolo County?',
    correctAnswer: 'Woodland',
    options: shuffle(['Woodland', 'Davis', 'West Sacramento', 'Winters']),
  },
  {
    id: 'yolo-landmark',
    countyId: 'yolo',
    countyName: 'Yolo',
    region: 'Central Valley',
    type: 'landmark',
    difficulty: 'easy',
    question: 'Which UC campus is located in Yolo County?',
    correctAnswer: 'UC Davis',
    options: shuffle(['UC Davis', 'UC Berkeley', 'UC Merced', 'Sacramento State']),
  },

  // Butte County
  {
    id: 'butte-capital',
    countyId: 'butte',
    countyName: 'Butte',
    region: 'Central Valley',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Butte County?',
    correctAnswer: 'Oroville',
    options: shuffle(['Oroville', 'Chico', 'Paradise', 'Gridley']),
  },
  {
    id: 'butte-landmark',
    countyId: 'butte',
    countyName: 'Butte',
    region: 'Central Valley',
    type: 'landmark',
    difficulty: 'medium',
    question: 'Which dam in Butte County is the tallest in the United States?',
    correctAnswer: 'Oroville Dam',
    options: shuffle(['Oroville Dam', 'Shasta Dam', 'Hoover Dam', 'Grand Coulee Dam']),
  },

  // Sutter County
  {
    id: 'sutter-capital',
    countyId: 'sutter',
    countyName: 'Sutter',
    region: 'Central Valley',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Sutter County?',
    correctAnswer: 'Yuba City',
    options: shuffle(['Yuba City', 'Live Oak', 'Sutter', 'Nicolaus']),
  },
  {
    id: 'sutter-landmark',
    countyId: 'sutter',
    countyName: 'Sutter',
    region: 'Central Valley',
    type: 'landmark',
    difficulty: 'hard',
    question: 'Which unique geological feature is known as the world\'s smallest mountain range?',
    correctAnswer: 'Sutter Buttes',
    options: shuffle(['Sutter Buttes', 'Castle Rock', 'Mount Diablo', 'Bishop Peak']),
  },

  // Yuba County
  {
    id: 'yuba-capital',
    countyId: 'yuba',
    countyName: 'Yuba',
    region: 'Central Valley',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Yuba County?',
    correctAnswer: 'Marysville',
    options: shuffle(['Marysville', 'Wheatland', 'Linda', 'Olivehurst']),
  },

  // Colusa County
  {
    id: 'colusa-capital',
    countyId: 'colusa',
    countyName: 'Colusa',
    region: 'Central Valley',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Colusa County?',
    correctAnswer: 'Colusa',
    options: shuffle(['Colusa', 'Williams', 'Arbuckle', 'Maxwell']),
  },

  // Glenn County
  {
    id: 'glenn-capital',
    countyId: 'glenn',
    countyName: 'Glenn',
    region: 'Central Valley',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Glenn County?',
    correctAnswer: 'Willows',
    options: shuffle(['Willows', 'Orland', 'Hamilton City', 'Artois']),
  },
];

// Central Coast Counties Quiz Questions
const centralCoastQuestions: QuizQuestion[] = [
  // Monterey County
  {
    id: 'monterey-capital',
    countyId: 'monterey',
    countyName: 'Monterey',
    region: 'Central Coast',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Monterey County?',
    correctAnswer: 'Salinas',
    options: shuffle(['Salinas', 'Monterey', 'Carmel', 'Seaside']),
  },
  {
    id: 'monterey-landmark',
    countyId: 'monterey',
    countyName: 'Monterey',
    region: 'Central Coast',
    type: 'landmark',
    difficulty: 'easy',
    question: 'Which famous aquarium is located in Monterey County?',
    correctAnswer: 'Monterey Bay Aquarium',
    options: shuffle(['Monterey Bay Aquarium', 'California Academy of Sciences', 'Aquarium of the Pacific', 'SeaWorld']),
  },
  {
    id: 'monterey-geography',
    countyId: 'monterey',
    countyName: 'Monterey',
    region: 'Central Coast',
    type: 'geography',
    difficulty: 'easy',
    question: 'Which scenic coastal drive runs through Monterey County?',
    correctAnswer: 'Big Sur',
    options: shuffle(['Big Sur', 'Pacific Coast Highway', 'Highway 101', 'Route 66']),
  },
  {
    id: 'monterey-culture',
    countyId: 'monterey',
    countyName: 'Monterey',
    region: 'Central Coast',
    type: 'culture',
    difficulty: 'medium',
    question: 'Which famous golf course is located in Pebble Beach, Monterey County?',
    correctAnswer: 'Pebble Beach Golf Links',
    options: shuffle(['Pebble Beach Golf Links', 'Augusta National', 'St. Andrews', 'Torrey Pines']),
  },

  // Santa Barbara County
  {
    id: 'santa-barbara-capital',
    countyId: 'santa-barbara',
    countyName: 'Santa Barbara',
    region: 'Central Coast',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Santa Barbara County?',
    correctAnswer: 'Santa Barbara',
    options: shuffle(['Santa Barbara', 'Santa Maria', 'Lompoc', 'Carpinteria']),
  },
  {
    id: 'santa-barbara-geography',
    countyId: 'santa-barbara',
    countyName: 'Santa Barbara',
    region: 'Central Coast',
    type: 'geography',
    difficulty: 'hard',
    question: 'Santa Barbara County has an unusual coastline that faces which direction?',
    correctAnswer: 'South',
    options: shuffle(['South', 'West', 'North', 'East']),
    explanation: 'Santa Barbara\'s coastline runs east-west, making it face south, unique in California.'
  },
  {
    id: 'santa-barbara-culture',
    countyId: 'santa-barbara',
    countyName: 'Santa Barbara',
    region: 'Central Coast',
    type: 'culture',
    difficulty: 'medium',
    question: 'Santa Barbara is often called the "American _____"',
    correctAnswer: 'Riviera',
    options: shuffle(['Riviera', 'Venice', 'Paradise', 'Oasis']),
  },

  // San Luis Obispo County
  {
    id: 'slo-capital',
    countyId: 'san-luis-obispo',
    countyName: 'San Luis Obispo',
    region: 'Central Coast',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of San Luis Obispo County?',
    correctAnswer: 'San Luis Obispo',
    options: shuffle(['San Luis Obispo', 'Paso Robles', 'Pismo Beach', 'Atascadero']),
  },
  {
    id: 'slo-landmark',
    countyId: 'san-luis-obispo',
    countyName: 'San Luis Obispo',
    region: 'Central Coast',
    type: 'landmark',
    difficulty: 'easy',
    question: 'Which famous castle is located in San Luis Obispo County?',
    correctAnswer: 'Hearst Castle',
    options: shuffle(['Hearst Castle', 'Scotty\'s Castle', 'Napa Castle', 'Winchester Mystery House']),
  },
  {
    id: 'slo-nature',
    countyId: 'san-luis-obispo',
    countyName: 'San Luis Obispo',
    region: 'Central Coast',
    type: 'nature',
    difficulty: 'medium',
    question: 'Which volcanic plug is a famous landmark in San Luis Obispo County?',
    correctAnswer: 'Morro Rock',
    options: shuffle(['Morro Rock', 'Devils Postpile', 'Half Dome', 'El Capitan']),
  },

  // Santa Cruz County
  {
    id: 'santa-cruz-capital',
    countyId: 'santa-cruz',
    countyName: 'Santa Cruz',
    region: 'Central Coast',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Santa Cruz County?',
    correctAnswer: 'Santa Cruz',
    options: shuffle(['Santa Cruz', 'Watsonville', 'Capitola', 'Scotts Valley']),
  },
  {
    id: 'santa-cruz-landmark',
    countyId: 'santa-cruz',
    countyName: 'Santa Cruz',
    region: 'Central Coast',
    type: 'landmark',
    difficulty: 'easy',
    question: 'Which famous beach boardwalk is located in Santa Cruz?',
    correctAnswer: 'Santa Cruz Beach Boardwalk',
    options: shuffle(['Santa Cruz Beach Boardwalk', 'Venice Beach Boardwalk', 'Mission Beach Boardwalk', 'Huntington Pier']),
  },
  {
    id: 'santa-cruz-culture',
    countyId: 'santa-cruz',
    countyName: 'Santa Cruz',
    region: 'Central Coast',
    type: 'culture',
    difficulty: 'medium',
    question: 'Santa Cruz is considered the birthplace of what sport in California?',
    correctAnswer: 'Surfing',
    options: shuffle(['Surfing', 'Skateboarding', 'Mountain biking', 'Rock climbing']),
  },

  // San Benito County
  {
    id: 'san-benito-capital',
    countyId: 'san-benito',
    countyName: 'San Benito',
    region: 'Central Coast',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of San Benito County?',
    correctAnswer: 'Hollister',
    options: shuffle(['Hollister', 'San Juan Bautista', 'Tres Pinos', 'Ridgemark']),
  },
  {
    id: 'san-benito-landmark',
    countyId: 'san-benito',
    countyName: 'San Benito',
    region: 'Central Coast',
    type: 'landmark',
    difficulty: 'medium',
    question: 'Which national park is partially located in San Benito County?',
    correctAnswer: 'Pinnacles National Park',
    options: shuffle(['Pinnacles National Park', 'Yosemite National Park', 'Joshua Tree National Park', 'Channel Islands National Park']),
  },
];

// Northern California Counties Quiz Questions
const northernCaliforniaQuestions: QuizQuestion[] = [
  // Shasta County
  {
    id: 'shasta-capital',
    countyId: 'shasta',
    countyName: 'Shasta',
    region: 'Northern California',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Shasta County?',
    correctAnswer: 'Redding',
    options: shuffle(['Redding', 'Anderson', 'Shasta Lake', 'Red Bluff']),
  },
  {
    id: 'shasta-landmark',
    countyId: 'shasta',
    countyName: 'Shasta',
    region: 'Northern California',
    type: 'landmark',
    difficulty: 'easy',
    question: 'Which major volcano is visible from Shasta County?',
    correctAnswer: 'Mount Shasta',
    options: shuffle(['Mount Shasta', 'Mount Lassen', 'Mount Whitney', 'Mount Diablo']),
  },
  {
    id: 'shasta-nature',
    countyId: 'shasta',
    countyName: 'Shasta',
    region: 'Northern California',
    type: 'nature',
    difficulty: 'medium',
    question: 'Which large reservoir is located in Shasta County?',
    correctAnswer: 'Shasta Lake',
    options: shuffle(['Shasta Lake', 'Lake Oroville', 'Clear Lake', 'Lake Almanor']),
  },

  // Tehama County
  {
    id: 'tehama-capital',
    countyId: 'tehama',
    countyName: 'Tehama',
    region: 'Northern California',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Tehama County?',
    correctAnswer: 'Red Bluff',
    options: shuffle(['Red Bluff', 'Corning', 'Tehama', 'Los Molinos']),
  },
  {
    id: 'tehama-geography',
    countyId: 'tehama',
    countyName: 'Tehama',
    region: 'Northern California',
    type: 'geography',
    difficulty: 'medium',
    question: 'Which major river flows through Tehama County?',
    correctAnswer: 'Sacramento River',
    options: shuffle(['Sacramento River', 'American River', 'Feather River', 'Trinity River']),
  },

  // Siskiyou County
  {
    id: 'siskiyou-capital',
    countyId: 'siskiyou',
    countyName: 'Siskiyou',
    region: 'Northern California',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Siskiyou County?',
    correctAnswer: 'Yreka',
    options: shuffle(['Yreka', 'Mount Shasta', 'Weed', 'Dunsmuir']),
  },
  {
    id: 'siskiyou-geography',
    countyId: 'siskiyou',
    countyName: 'Siskiyou',
    region: 'Northern California',
    type: 'geography',
    difficulty: 'medium',
    question: 'Siskiyou County borders which state?',
    correctAnswer: 'Oregon',
    options: shuffle(['Oregon', 'Nevada', 'Arizona', 'Washington']),
  },

  // Modoc County
  {
    id: 'modoc-capital',
    countyId: 'modoc',
    countyName: 'Modoc',
    region: 'Northern California',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Modoc County?',
    correctAnswer: 'Alturas',
    options: shuffle(['Alturas', 'Canby', 'Likely', 'Cedarville']),
  },
  {
    id: 'modoc-geography',
    countyId: 'modoc',
    countyName: 'Modoc',
    region: 'Northern California',
    type: 'geography',
    difficulty: 'hard',
    question: 'Modoc County is in which corner of California?',
    correctAnswer: 'Northeastern',
    options: shuffle(['Northeastern', 'Northwestern', 'Southeastern', 'North-central']),
  },

  // Lassen County
  {
    id: 'lassen-capital',
    countyId: 'lassen',
    countyName: 'Lassen',
    region: 'Northern California',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Lassen County?',
    correctAnswer: 'Susanville',
    options: shuffle(['Susanville', 'Westwood', 'Bieber', 'Herlong']),
  },
  {
    id: 'lassen-landmark',
    countyId: 'lassen',
    countyName: 'Lassen',
    region: 'Northern California',
    type: 'landmark',
    difficulty: 'medium',
    question: 'Which volcanic national park is located in Lassen County?',
    correctAnswer: 'Lassen Volcanic National Park',
    options: shuffle(['Lassen Volcanic National Park', 'Crater Lake National Park', 'Mount Rainier National Park', 'Yellowstone National Park']),
  },

  // Trinity County
  {
    id: 'trinity-capital',
    countyId: 'trinity',
    countyName: 'Trinity',
    region: 'Northern California',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Trinity County?',
    correctAnswer: 'Weaverville',
    options: shuffle(['Weaverville', 'Hayfork', 'Trinity Center', 'Lewiston']),
  },
  {
    id: 'trinity-demographics',
    countyId: 'trinity',
    countyName: 'Trinity',
    region: 'Northern California',
    type: 'demographics',
    difficulty: 'hard',
    question: 'Trinity County has no incorporated cities. True or False?',
    correctAnswer: 'True',
    options: shuffle(['True', 'False', 'Has one city', 'Has two cities']),
    explanation: 'Trinity County is one of two California counties with no incorporated cities.'
  },
];

// Sierra Nevada Counties Quiz Questions
const sierraQuestions: QuizQuestion[] = [
  // Placer County
  {
    id: 'placer-capital',
    countyId: 'placer',
    countyName: 'Placer',
    region: 'Sierra Nevada',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Placer County?',
    correctAnswer: 'Auburn',
    options: shuffle(['Auburn', 'Roseville', 'Rocklin', 'Lincoln']),
  },
  {
    id: 'placer-landmark',
    countyId: 'placer',
    countyName: 'Placer',
    region: 'Sierra Nevada',
    type: 'landmark',
    difficulty: 'easy',
    question: 'Which part of Lake Tahoe is in Placer County?',
    correctAnswer: 'North shore',
    options: shuffle(['North shore', 'South shore', 'East shore', 'West shore']),
  },

  // El Dorado County
  {
    id: 'el-dorado-capital',
    countyId: 'el-dorado',
    countyName: 'El Dorado',
    region: 'Sierra Nevada',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of El Dorado County?',
    correctAnswer: 'Placerville',
    options: shuffle(['Placerville', 'South Lake Tahoe', 'Cameron Park', 'El Dorado Hills']),
  },
  {
    id: 'el-dorado-history',
    countyId: 'el-dorado',
    countyName: 'El Dorado',
    region: 'Sierra Nevada',
    type: 'history',
    difficulty: 'medium',
    question: 'El Dorado County was named after what?',
    correctAnswer: 'The mythical city of gold',
    options: shuffle(['The mythical city of gold', 'A Spanish explorer', 'A Native American tribe', 'A mountain peak']),
    explanation: 'El Dorado means "the golden one" in Spanish, referring to the legendary city of gold.'
  },

  // Nevada County
  {
    id: 'nevada-capital',
    countyId: 'nevada',
    countyName: 'Nevada',
    region: 'Sierra Nevada',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Nevada County?',
    correctAnswer: 'Nevada City',
    options: shuffle(['Nevada City', 'Grass Valley', 'Truckee', 'Penn Valley']),
  },
  {
    id: 'nevada-history',
    countyId: 'nevada',
    countyName: 'Nevada',
    region: 'Sierra Nevada',
    type: 'history',
    difficulty: 'medium',
    question: 'Nevada County is known for its history in what industry?',
    correctAnswer: 'Gold mining',
    options: shuffle(['Gold mining', 'Logging', 'Railroad', 'Agriculture']),
  },

  // Alpine County
  {
    id: 'alpine-capital',
    countyId: 'alpine',
    countyName: 'Alpine',
    region: 'Sierra Nevada',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Alpine County?',
    correctAnswer: 'Markleeville',
    options: shuffle(['Markleeville', 'Bear Valley', 'Kirkwood', 'Hope Valley']),
  },
  {
    id: 'alpine-demographics',
    countyId: 'alpine',
    countyName: 'Alpine',
    region: 'Sierra Nevada',
    type: 'demographics',
    difficulty: 'medium',
    question: 'Alpine County has the ___ population of any California county.',
    correctAnswer: 'Smallest',
    options: shuffle(['Smallest', 'Second smallest', 'Third smallest', 'Fourth smallest']),
    explanation: 'Alpine County has fewer than 1,200 residents, making it California\'s least populated county.'
  },

  // Mono County
  {
    id: 'mono-capital',
    countyId: 'mono',
    countyName: 'Mono',
    region: 'Sierra Nevada',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Mono County?',
    correctAnswer: 'Bridgeport',
    options: shuffle(['Bridgeport', 'Mammoth Lakes', 'Lee Vining', 'June Lake']),
  },
  {
    id: 'mono-landmark',
    countyId: 'mono',
    countyName: 'Mono',
    region: 'Sierra Nevada',
    type: 'landmark',
    difficulty: 'easy',
    question: 'Which famous saline lake is located in Mono County?',
    correctAnswer: 'Mono Lake',
    options: shuffle(['Mono Lake', 'Salton Sea', 'Clear Lake', 'Lake Tahoe']),
  },

  // Inyo County
  {
    id: 'inyo-capital',
    countyId: 'inyo',
    countyName: 'Inyo',
    region: 'Sierra Nevada',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Inyo County?',
    correctAnswer: 'Independence',
    options: shuffle(['Independence', 'Bishop', 'Lone Pine', 'Big Pine']),
  },
  {
    id: 'inyo-geography',
    countyId: 'inyo',
    countyName: 'Inyo',
    region: 'Sierra Nevada',
    type: 'geography',
    difficulty: 'medium',
    question: 'Inyo County contains both California\'s highest and lowest points. What is the highest?',
    correctAnswer: 'Mount Whitney',
    options: shuffle(['Mount Whitney', 'Mount Shasta', 'Mount Williamson', 'White Mountain Peak']),
    explanation: 'Mount Whitney (14,505 ft) is the highest, and Death Valley (-282 ft) is the lowest.'
  },

  // Additional Sierra Nevada counties
  // Amador County
  {
    id: 'amador-capital',
    countyId: 'amador',
    countyName: 'Amador',
    region: 'Sierra Nevada',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Amador County?',
    correctAnswer: 'Jackson',
    options: shuffle(['Jackson', 'Sutter Creek', 'Ione', 'Plymouth']),
  },

  // Calaveras County
  {
    id: 'calaveras-capital',
    countyId: 'calaveras',
    countyName: 'Calaveras',
    region: 'Sierra Nevada',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Calaveras County?',
    correctAnswer: 'San Andreas',
    options: shuffle(['San Andreas', 'Angels Camp', 'Murphys', 'Arnold']),
  },
  {
    id: 'calaveras-culture',
    countyId: 'calaveras',
    countyName: 'Calaveras',
    region: 'Sierra Nevada',
    type: 'culture',
    difficulty: 'medium',
    question: 'Calaveras County is famous for Mark Twain\'s story about what?',
    correctAnswer: 'Jumping frogs',
    options: shuffle(['Jumping frogs', 'Gold mining', 'Big trees', 'Cave exploration']),
  },

  // Tuolumne County
  {
    id: 'tuolumne-capital',
    countyId: 'tuolumne',
    countyName: 'Tuolumne',
    region: 'Sierra Nevada',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Tuolumne County?',
    correctAnswer: 'Sonora',
    options: shuffle(['Sonora', 'Jamestown', 'Groveland', 'Twain Harte']),
  },
  {
    id: 'tuolumne-landmark',
    countyId: 'tuolumne',
    countyName: 'Tuolumne',
    region: 'Sierra Nevada',
    type: 'landmark',
    difficulty: 'medium',
    question: 'Which part of Yosemite National Park is in Tuolumne County?',
    correctAnswer: 'Northern part (Tuolumne Meadows)',
    options: shuffle(['Northern part (Tuolumne Meadows)', 'Yosemite Valley', 'Southern entrance', 'Eastern entrance']),
  },

  // Mariposa County
  {
    id: 'mariposa-capital',
    countyId: 'mariposa',
    countyName: 'Mariposa',
    region: 'Sierra Nevada',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Mariposa County?',
    correctAnswer: 'Mariposa',
    options: shuffle(['Mariposa', 'El Portal', 'Coulterville', 'Fish Camp']),
  },
  {
    id: 'mariposa-landmark',
    countyId: 'mariposa',
    countyName: 'Mariposa',
    region: 'Sierra Nevada',
    type: 'landmark',
    difficulty: 'easy',
    question: 'Which iconic Yosemite landmarks are in Mariposa County?',
    correctAnswer: 'Half Dome and El Capitan',
    options: shuffle(['Half Dome and El Capitan', 'Mount Whitney', 'Mono Lake', 'Lake Tahoe']),
  },

  // Sierra County
  {
    id: 'sierra-capital',
    countyId: 'sierra',
    countyName: 'Sierra',
    region: 'Sierra Nevada',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Sierra County?',
    correctAnswer: 'Downieville',
    options: shuffle(['Downieville', 'Loyalton', 'Sierra City', 'Sierraville']),
  },

  // Plumas County
  {
    id: 'plumas-capital',
    countyId: 'plumas',
    countyName: 'Plumas',
    region: 'Sierra Nevada',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Plumas County?',
    correctAnswer: 'Quincy',
    options: shuffle(['Quincy', 'Chester', 'Portola', 'Greenville']),
  },
];

// North Coast Counties Quiz Questions
const northCoastQuestions: QuizQuestion[] = [
  // Humboldt County
  {
    id: 'humboldt-capital',
    countyId: 'humboldt',
    countyName: 'Humboldt',
    region: 'North Coast',
    type: 'capital',
    difficulty: 'medium',
    question: 'What is the county seat of Humboldt County?',
    correctAnswer: 'Eureka',
    options: shuffle(['Eureka', 'Arcata', 'Fortuna', 'Ferndale']),
  },
  {
    id: 'humboldt-nature',
    countyId: 'humboldt',
    countyName: 'Humboldt',
    region: 'North Coast',
    type: 'nature',
    difficulty: 'easy',
    question: 'Humboldt County is famous for having the tallest what?',
    correctAnswer: 'Trees (Redwoods)',
    options: shuffle(['Trees (Redwoods)', 'Mountains', 'Waterfalls', 'Sand dunes']),
  },
  {
    id: 'humboldt-landmark',
    countyId: 'humboldt',
    countyName: 'Humboldt',
    region: 'North Coast',
    type: 'landmark',
    difficulty: 'medium',
    question: 'Which national and state park system protects the redwoods in Humboldt County?',
    correctAnswer: 'Redwood National and State Parks',
    options: shuffle(['Redwood National and State Parks', 'Muir Woods National Monument', 'Big Basin State Park', 'Sequoia National Park']),
  },

  // Mendocino County
  {
    id: 'mendocino-capital',
    countyId: 'mendocino',
    countyName: 'Mendocino',
    region: 'North Coast',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Mendocino County?',
    correctAnswer: 'Ukiah',
    options: shuffle(['Ukiah', 'Fort Bragg', 'Willits', 'Mendocino']),
  },
  {
    id: 'mendocino-geography',
    countyId: 'mendocino',
    countyName: 'Mendocino',
    region: 'North Coast',
    type: 'geography',
    difficulty: 'medium',
    question: 'The picturesque village of Mendocino sits on bluffs overlooking what?',
    correctAnswer: 'Pacific Ocean',
    options: shuffle(['Pacific Ocean', 'Russian River', 'Clear Lake', 'Eel River']),
  },

  // Del Norte County
  {
    id: 'del-norte-capital',
    countyId: 'del-norte',
    countyName: 'Del Norte',
    region: 'North Coast',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Del Norte County?',
    correctAnswer: 'Crescent City',
    options: shuffle(['Crescent City', 'Smith River', 'Klamath', 'Gasquet']),
  },
  {
    id: 'del-norte-geography',
    countyId: 'del-norte',
    countyName: 'Del Norte',
    region: 'North Coast',
    type: 'geography',
    difficulty: 'medium',
    question: 'Del Norte County is in which corner of California?',
    correctAnswer: 'Northwestern',
    options: shuffle(['Northwestern', 'Northeastern', 'Southwestern', 'North-central']),
  },

  // Lake County
  {
    id: 'lake-capital',
    countyId: 'lake',
    countyName: 'Lake',
    region: 'North Coast',
    type: 'capital',
    difficulty: 'hard',
    question: 'What is the county seat of Lake County?',
    correctAnswer: 'Lakeport',
    options: shuffle(['Lakeport', 'Clearlake', 'Middletown', 'Kelseyville']),
  },
  {
    id: 'lake-landmark',
    countyId: 'lake',
    countyName: 'Lake',
    region: 'North Coast',
    type: 'landmark',
    difficulty: 'medium',
    question: 'Which large natural lake gives Lake County its name?',
    correctAnswer: 'Clear Lake',
    options: shuffle(['Clear Lake', 'Lake Tahoe', 'Mono Lake', 'Eagle Lake']),
    explanation: 'Clear Lake is California\'s largest natural freshwater lake entirely within the state.'
  },
];

// Combine all regional questions into a master database
export const californiaQuizDatabase: QuizQuestion[] = [
  ...bayAreaQuestions,
  ...southernCaliforniaQuestions,
  ...centralValleyQuestions,
  ...centralCoastQuestions,
  ...northernCaliforniaQuestions,
  ...sierraQuestions,
  ...northCoastQuestions
];

// Helper function to get questions by region
export function getQuestionsByRegion(region: string): QuizQuestion[] {
  if (region === 'all') {
    return californiaQuizDatabase;
  }
  return californiaQuizDatabase.filter(q => q.region === region);
}

// Helper function to get questions by county
export function getQuestionsByCounty(countyId: string): QuizQuestion[] {
  return californiaQuizDatabase.filter(q => q.countyId === countyId);
}

// Helper function to get questions by type
export function getQuestionsByType(type: QuizQuestion['type']): QuizQuestion[] {
  return californiaQuizDatabase.filter(q => q.type === type);
}

// Helper function to get questions by difficulty
export function getQuestionsByDifficulty(difficulty: QuizQuestion['difficulty']): QuizQuestion[] {
  return californiaQuizDatabase.filter(q => q.difficulty === difficulty);
}

// Helper function to get random questions
export function getRandomQuestions(count: number, filters?: {
  region?: string;
  type?: QuizQuestion['type'];
  difficulty?: QuizQuestion['difficulty'];
  excludeIds?: string[];
}): QuizQuestion[] {
  let pool = californiaQuizDatabase;

  if (filters) {
    if (filters.region && filters.region !== 'all') {
      pool = pool.filter(q => q.region === filters.region);
    }
    if (filters.type) {
      pool = pool.filter(q => q.type === filters.type);
    }
    if (filters.difficulty) {
      pool = pool.filter(q => q.difficulty === filters.difficulty);
    }
    if (filters.excludeIds && filters.excludeIds.length > 0) {
      pool = pool.filter(q => !filters.excludeIds!.includes(q.id));
    }
  }

  const shuffled = shuffle(pool);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Statistics about the database
export const quizDatabaseStats = {
  totalQuestions: californiaQuizDatabase.length,
  byRegion: {
    'Bay Area': bayAreaQuestions.length,
    'Southern California': southernCaliforniaQuestions.length,
    'Central Valley': centralValleyQuestions.length,
    'Central Coast': centralCoastQuestions.length,
    'Northern California': northernCaliforniaQuestions.length,
    'Sierra Nevada': sierraQuestions.length,
    'North Coast': northCoastQuestions.length,
  },
  byType: {
    capital: californiaQuizDatabase.filter(q => q.type === 'capital').length,
    landmark: californiaQuizDatabase.filter(q => q.type === 'landmark').length,
    geography: californiaQuizDatabase.filter(q => q.type === 'geography').length,
    history: californiaQuizDatabase.filter(q => q.type === 'history').length,
    economy: californiaQuizDatabase.filter(q => q.type === 'economy').length,
    demographics: californiaQuizDatabase.filter(q => q.type === 'demographics').length,
    nature: californiaQuizDatabase.filter(q => q.type === 'nature').length,
    culture: californiaQuizDatabase.filter(q => q.type === 'culture').length,
  },
  byDifficulty: {
    easy: californiaQuizDatabase.filter(q => q.difficulty === 'easy').length,
    medium: californiaQuizDatabase.filter(q => q.difficulty === 'medium').length,
    hard: californiaQuizDatabase.filter(q => q.difficulty === 'hard').length,
  }
};