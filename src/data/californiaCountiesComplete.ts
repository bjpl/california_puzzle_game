// Complete California Counties Data - All 58 Counties

export interface County {
  id: string;
  name: string;
  region: string;
  capital: string;
  population: number;
  area: number;
  founded: number;
  difficulty: 'easy' | 'medium' | 'hard';
  funFact: string;
}

export const californiaRegions = {
  'Northern California': [
    'Butte', 'Colusa', 'Glenn', 'Lassen', 'Modoc', 'Plumas',
    'Shasta', 'Siskiyou', 'Tehama', 'Trinity'
  ],
  'Bay Area': [
    'Alameda', 'Contra Costa', 'Marin', 'Napa', 'San Francisco',
    'San Mateo', 'Santa Clara', 'Solano', 'Sonoma'
  ],
  'Central Valley': [
    'Fresno', 'Kern', 'Kings', 'Madera', 'Merced', 'Sacramento',
    'San Joaquin', 'Stanislaus', 'Tulare', 'Yolo'
  ],
  'Central Coast': [
    'Monterey', 'San Benito', 'San Luis Obispo', 'Santa Barbara', 'Santa Cruz'
  ],
  'Southern California': [
    'Imperial', 'Los Angeles', 'Orange', 'Riverside', 'San Bernardino',
    'San Diego', 'Ventura'
  ],
  'Sierra Nevada': [
    'Alpine', 'Amador', 'Calaveras', 'El Dorado', 'Inyo', 'Mariposa',
    'Mono', 'Nevada', 'Placer', 'Sierra', 'Tuolumne'
  ],
  'North Coast': [
    'Del Norte', 'Humboldt', 'Lake', 'Mendocino'
  ]
};

export const allCaliforniaCounties: County[] = [
  // Bay Area (9 counties) - Easy
  { id: 'alameda', name: 'Alameda', region: 'Bay Area', capital: 'Oakland', population: 1671000, area: 738, founded: 1853, difficulty: 'easy', funFact: 'Home to UC Berkeley and the Port of Oakland' },
  { id: 'contra-costa', name: 'Contra Costa', region: 'Bay Area', capital: 'Martinez', population: 1154000, area: 716, founded: 1850, difficulty: 'easy', funFact: 'Name means "opposite coast" in Spanish' },
  { id: 'marin', name: 'Marin', region: 'Bay Area', capital: 'San Rafael', population: 258000, area: 520, founded: 1850, difficulty: 'medium', funFact: 'Has the highest income per capita in California' },
  { id: 'napa', name: 'Napa', region: 'Bay Area', capital: 'Napa', population: 137000, area: 748, founded: 1850, difficulty: 'medium', funFact: 'World-famous wine country' },
  { id: 'san-francisco', name: 'San Francisco', region: 'Bay Area', capital: 'San Francisco', population: 874000, area: 47, founded: 1850, difficulty: 'easy', funFact: 'Only consolidated city-county in California' },
  { id: 'san-mateo', name: 'San Mateo', region: 'Bay Area', capital: 'Redwood City', population: 766000, area: 449, founded: 1856, difficulty: 'easy', funFact: 'Home to Silicon Valley tech giants' },
  { id: 'santa-clara', name: 'Santa Clara', region: 'Bay Area', capital: 'San Jose', population: 1928000, area: 1291, founded: 1850, difficulty: 'easy', funFact: 'Heart of Silicon Valley' },
  { id: 'solano', name: 'Solano', region: 'Bay Area', capital: 'Fairfield', population: 447000, area: 822, founded: 1850, difficulty: 'medium', funFact: 'Home to Travis Air Force Base' },
  { id: 'sonoma', name: 'Sonoma', region: 'Bay Area', capital: 'Santa Rosa', population: 488000, area: 1576, founded: 1850, difficulty: 'medium', funFact: 'California wine country and redwood forests' },

  // Southern California (7 counties) - Easy to Medium
  { id: 'imperial', name: 'Imperial', region: 'Southern California', capital: 'El Centro', population: 180000, area: 4175, founded: 1907, difficulty: 'hard', funFact: 'Lowest elevation county in California' },
  { id: 'los-angeles', name: 'Los Angeles', region: 'Southern California', capital: 'Los Angeles', population: 10040000, area: 4058, founded: 1850, difficulty: 'easy', funFact: 'Most populous US county' },
  { id: 'orange', name: 'Orange', region: 'Southern California', capital: 'Santa Ana', population: 3176000, area: 790, founded: 1889, difficulty: 'easy', funFact: 'Home to Disneyland' },
  { id: 'riverside', name: 'Riverside', region: 'Southern California', capital: 'Riverside', population: 2471000, area: 7207, founded: 1893, difficulty: 'easy', funFact: 'Birthplace of California citrus industry' },
  { id: 'san-bernardino', name: 'San Bernardino', region: 'Southern California', capital: 'San Bernardino', population: 2181000, area: 20105, founded: 1853, difficulty: 'easy', funFact: 'Largest county by area in the US' },
  { id: 'san-diego', name: 'San Diego', region: 'Southern California', capital: 'San Diego', population: 3338000, area: 4204, founded: 1850, difficulty: 'easy', funFact: 'Birthplace of California' },
  { id: 'ventura', name: 'Ventura', region: 'Southern California', capital: 'Ventura', population: 846000, area: 1845, founded: 1872, difficulty: 'medium', funFact: 'Channel Islands National Park headquarters' },

  // Central Valley (10 counties) - Medium
  { id: 'fresno', name: 'Fresno', region: 'Central Valley', capital: 'Fresno', population: 999000, area: 5963, founded: 1856, difficulty: 'medium', funFact: 'Agricultural capital of the world' },
  { id: 'kern', name: 'Kern', region: 'Central Valley', capital: 'Bakersfield', population: 900000, area: 8141, founded: 1866, difficulty: 'medium', funFact: 'Produces most of US oil outside Alaska and Texas' },
  { id: 'kings', name: 'Kings', region: 'Central Valley', capital: 'Hanford', population: 152000, area: 1390, founded: 1893, difficulty: 'hard', funFact: 'Home to Naval Air Station Lemoore' },
  { id: 'madera', name: 'Madera', region: 'Central Valley', capital: 'Madera', population: 157000, area: 2138, founded: 1893, difficulty: 'hard', funFact: 'Geographic center of California' },
  { id: 'merced', name: 'Merced', region: 'Central Valley', capital: 'Merced', population: 277000, area: 1929, founded: 1855, difficulty: 'hard', funFact: 'Home to UC Merced, newest UC campus' },
  { id: 'sacramento', name: 'Sacramento', region: 'Central Valley', capital: 'Sacramento', population: 1553000, area: 966, founded: 1850, difficulty: 'easy', funFact: 'State capital of California' },
  { id: 'san-joaquin', name: 'San Joaquin', region: 'Central Valley', capital: 'Stockton', population: 762000, area: 1399, founded: 1850, difficulty: 'medium', funFact: 'Delta waterways called "California\'s Holland"' },
  { id: 'stanislaus', name: 'Stanislaus', region: 'Central Valley', capital: 'Modesto', population: 550000, area: 1495, founded: 1854, difficulty: 'medium', funFact: 'George Lucas hometown' },
  { id: 'tulare', name: 'Tulare', region: 'Central Valley', capital: 'Visalia', population: 466000, area: 4824, founded: 1852, difficulty: 'hard', funFact: 'Dairy capital of California' },
  { id: 'yolo', name: 'Yolo', region: 'Central Valley', capital: 'Woodland', population: 220000, area: 1012, founded: 1850, difficulty: 'hard', funFact: 'Name comes from Native American word for "rushes"' },

  // Central Coast (5 counties) - Medium
  { id: 'monterey', name: 'Monterey', region: 'Central Coast', capital: 'Salinas', population: 434000, area: 3322, founded: 1850, difficulty: 'medium', funFact: 'Steinbeck country and Pebble Beach' },
  { id: 'san-benito', name: 'San Benito', region: 'Central Coast', capital: 'Hollister', population: 62000, area: 1389, founded: 1874, difficulty: 'hard', funFact: 'Pinnacles National Park' },
  { id: 'san-luis-obispo', name: 'San Luis Obispo', region: 'Central Coast', capital: 'San Luis Obispo', population: 283000, area: 3304, founded: 1850, difficulty: 'medium', funFact: 'Hearst Castle location' },
  { id: 'santa-barbara', name: 'Santa Barbara', region: 'Central Coast', capital: 'Santa Barbara', population: 446000, area: 2738, founded: 1850, difficulty: 'medium', funFact: 'American Riviera' },
  { id: 'santa-cruz', name: 'Santa Cruz', region: 'Central Coast', capital: 'Santa Cruz', population: 274000, area: 445, founded: 1850, difficulty: 'medium', funFact: 'Surfing capital of California' },

  // Northern California (10 counties) - Hard
  { id: 'butte', name: 'Butte', region: 'Northern California', capital: 'Oroville', population: 219000, area: 1640, founded: 1850, difficulty: 'hard', funFact: 'Home to Oroville Dam, tallest in US' },
  { id: 'colusa', name: 'Colusa', region: 'Northern California', capital: 'Colusa', population: 21000, area: 1151, founded: 1850, difficulty: 'hard', funFact: 'One of the original 27 California counties' },
  { id: 'glenn', name: 'Glenn', region: 'Northern California', capital: 'Willows', population: 28000, area: 1315, founded: 1891, difficulty: 'hard', funFact: 'Named after Dr. Hugh J. Glenn' },
  { id: 'lassen', name: 'Lassen', region: 'Northern California', capital: 'Susanville', population: 30000, area: 4720, founded: 1864, difficulty: 'hard', funFact: 'Lassen Volcanic National Park' },
  { id: 'modoc', name: 'Modoc', region: 'Northern California', capital: 'Alturas', population: 8800, area: 3944, founded: 1874, difficulty: 'hard', funFact: 'California\'s "last frontier"' },
  { id: 'plumas', name: 'Plumas', region: 'Northern California', capital: 'Quincy', population: 19000, area: 2554, founded: 1854, difficulty: 'hard', funFact: 'Name means "feathers" in Spanish' },
  { id: 'shasta', name: 'Shasta', region: 'Northern California', capital: 'Redding', population: 180000, area: 3786, founded: 1850, difficulty: 'medium', funFact: 'Mount Shasta and Lake Shasta' },
  { id: 'siskiyou', name: 'Siskiyou', region: 'Northern California', capital: 'Yreka', population: 43000, area: 6287, founded: 1852, difficulty: 'hard', funFact: 'Proposed State of Jefferson capital' },
  { id: 'tehama', name: 'Tehama', region: 'Northern California', capital: 'Red Bluff', population: 65000, area: 2951, founded: 1856, difficulty: 'hard', funFact: 'Olive capital of California' },
  { id: 'trinity', name: 'Trinity', region: 'Northern California', capital: 'Weaverville', population: 12000, area: 3208, founded: 1850, difficulty: 'hard', funFact: 'No incorporated cities' },

  // Sierra Nevada (11 counties) - Hard
  { id: 'alpine', name: 'Alpine', region: 'Sierra Nevada', capital: 'Markleeville', population: 1200, area: 739, founded: 1864, difficulty: 'hard', funFact: 'Least populous California county' },
  { id: 'amador', name: 'Amador', region: 'Sierra Nevada', capital: 'Jackson', population: 38000, area: 593, founded: 1854, difficulty: 'hard', funFact: 'Gold Rush wine country' },
  { id: 'calaveras', name: 'Calaveras', region: 'Sierra Nevada', capital: 'San Andreas', population: 45000, area: 1020, founded: 1850, difficulty: 'hard', funFact: 'Mark Twain\'s jumping frog' },
  { id: 'el-dorado', name: 'El Dorado', region: 'Sierra Nevada', capital: 'Placerville', population: 192000, area: 1712, founded: 1850, difficulty: 'medium', funFact: 'Lake Tahoe and gold discovery site' },
  { id: 'inyo', name: 'Inyo', region: 'Sierra Nevada', capital: 'Independence', population: 18000, area: 10192, founded: 1866, difficulty: 'hard', funFact: 'Mount Whitney and Death Valley' },
  { id: 'mariposa', name: 'Mariposa', region: 'Sierra Nevada', capital: 'Mariposa', population: 17000, area: 1448, founded: 1850, difficulty: 'hard', funFact: 'Gateway to Yosemite' },
  { id: 'mono', name: 'Mono', region: 'Sierra Nevada', capital: 'Bridgeport', population: 14000, area: 3049, founded: 1861, difficulty: 'hard', funFact: 'Mono Lake and Bodie Ghost Town' },
  { id: 'nevada', name: 'Nevada', region: 'Sierra Nevada', capital: 'Nevada City', population: 98000, area: 958, founded: 1851, difficulty: 'hard', funFact: 'Named before the state of Nevada' },
  { id: 'placer', name: 'Placer', region: 'Sierra Nevada', capital: 'Auburn', population: 398000, area: 1407, founded: 1851, difficulty: 'medium', funFact: 'Lake Tahoe and gold mining' },
  { id: 'sierra', name: 'Sierra', region: 'Sierra Nevada', capital: 'Downieville', population: 3000, area: 953, founded: 1852, difficulty: 'hard', funFact: 'Second-least populous county' },
  { id: 'tuolumne', name: 'Tuolumne', region: 'Sierra Nevada', capital: 'Sonora', population: 54000, area: 2236, founded: 1850, difficulty: 'hard', funFact: 'Yosemite high country' },

  // North Coast (4 counties) - Hard
  { id: 'del-norte', name: 'Del Norte', region: 'North Coast', capital: 'Crescent City', population: 27000, area: 1008, founded: 1857, difficulty: 'hard', funFact: 'Redwood National Park' },
  { id: 'humboldt', name: 'Humboldt', region: 'North Coast', capital: 'Eureka', population: 135000, area: 3573, founded: 1853, difficulty: 'medium', funFact: 'Lost Coast and redwood forests' },
  { id: 'lake', name: 'Lake', region: 'North Coast', capital: 'Lakeport', population: 64000, area: 1258, founded: 1861, difficulty: 'hard', funFact: 'Clear Lake, California\'s largest natural lake' },
  { id: 'mendocino', name: 'Mendocino', region: 'North Coast', capital: 'Ukiah', population: 86000, area: 3509, founded: 1850, difficulty: 'hard', funFact: 'Mendocino Coast and wine country' },
];

// Helper functions
export function getCountiesByRegion(region: string): County[] {
  return allCaliforniaCounties.filter(county => county.region === region);
}

export function getCountiesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): County[] {
  return allCaliforniaCounties.filter(county => county.difficulty === difficulty);
}

export function getCountyById(id: string): County | undefined {
  return allCaliforniaCounties.find(county => county.id === id);
}