// Simplified California county map data for Study Mode
// Using approximate positions and simplified shapes for interactivity

interface CountyMapData {
  name: string;
  region: string;
  path: string;
  center: [number, number];
}

export const californiaCountyPaths: Record<string, CountyMapData> = {
  // Northern California
  'siskiyou': {
    name: 'Siskiyou',
    region: 'Northern California',
    path: 'M 200 50 L 400 50 L 400 100 L 200 100 Z',
    center: [300, 75]
  },
  'modoc': {
    name: 'Modoc',
    region: 'Northern California',
    path: 'M 400 50 L 550 50 L 550 100 L 400 100 Z',
    center: [475, 75]
  },
  'shasta': {
    name: 'Shasta',
    region: 'Northern California',
    path: 'M 250 100 L 400 100 L 400 150 L 250 150 Z',
    center: [325, 125]
  },
  'lassen': {
    name: 'Lassen',
    region: 'Northern California',
    path: 'M 400 100 L 500 100 L 500 150 L 400 150 Z',
    center: [450, 125]
  },
  'humboldt': {
    name: 'Humboldt',
    region: 'North Coast',
    path: 'M 50 150 L 150 150 L 150 250 L 50 250 Z',
    center: [100, 200]
  },
  'del-norte': {
    name: 'Del Norte',
    region: 'North Coast',
    path: 'M 50 50 L 150 50 L 150 100 L 50 100 Z',
    center: [100, 75]
  },
  'trinity': {
    name: 'Trinity',
    region: 'Northern California',
    path: 'M 150 100 L 250 100 L 250 200 L 150 200 Z',
    center: [200, 150]
  },
  'mendocino': {
    name: 'Mendocino',
    region: 'North Coast',
    path: 'M 50 250 L 150 250 L 150 350 L 50 350 Z',
    center: [100, 300]
  },

  // Bay Area
  'sonoma': {
    name: 'Sonoma',
    region: 'Bay Area',
    path: 'M 100 350 L 200 350 L 200 430 L 100 430 Z',
    center: [150, 390]
  },
  'napa': {
    name: 'Napa',
    region: 'Bay Area',
    path: 'M 200 350 L 250 350 L 250 430 L 200 430 Z',
    center: [225, 390]
  },
  'marin': {
    name: 'Marin',
    region: 'Bay Area',
    path: 'M 100 430 L 150 430 L 150 470 L 100 470 Z',
    center: [125, 450]
  },
  'san-francisco': {
    name: 'San Francisco',
    region: 'Bay Area',
    path: 'M 80 470 L 120 470 L 120 490 L 80 490 Z',
    center: [100, 480]
  },
  'san-mateo': {
    name: 'San Mateo',
    region: 'Bay Area',
    path: 'M 80 490 L 150 490 L 150 530 L 80 530 Z',
    center: [115, 510]
  },
  'alameda': {
    name: 'Alameda',
    region: 'Bay Area',
    path: 'M 150 470 L 250 470 L 250 530 L 150 530 Z',
    center: [200, 500]
  },
  'contra-costa': {
    name: 'Contra Costa',
    region: 'Bay Area',
    path: 'M 150 430 L 250 430 L 250 470 L 150 470 Z',
    center: [200, 450]
  },
  'santa-clara': {
    name: 'Santa Clara',
    region: 'Bay Area',
    path: 'M 150 530 L 250 530 L 250 590 L 150 590 Z',
    center: [200, 560]
  },
  'solano': {
    name: 'Solano',
    region: 'Bay Area',
    path: 'M 250 380 L 350 380 L 350 430 L 250 430 Z',
    center: [300, 405]
  },

  // Central Valley
  'sacramento': {
    name: 'Sacramento',
    region: 'Central Valley',
    path: 'M 350 380 L 450 380 L 450 430 L 350 430 Z',
    center: [400, 405]
  },
  'san-joaquin': {
    name: 'San Joaquin',
    region: 'Central Valley',
    path: 'M 350 430 L 450 430 L 450 480 L 350 480 Z',
    center: [400, 455]
  },
  'stanislaus': {
    name: 'Stanislaus',
    region: 'Central Valley',
    path: 'M 350 480 L 450 480 L 450 530 L 350 530 Z',
    center: [400, 505]
  },
  'merced': {
    name: 'Merced',
    region: 'Central Valley',
    path: 'M 350 530 L 450 530 L 450 580 L 350 580 Z',
    center: [400, 555]
  },
  'fresno': {
    name: 'Fresno',
    region: 'Central Valley',
    path: 'M 350 580 L 500 580 L 500 680 L 350 680 Z',
    center: [425, 630]
  },
  'kings': {
    name: 'Kings',
    region: 'Central Valley',
    path: 'M 300 630 L 350 630 L 350 680 L 300 680 Z',
    center: [325, 655]
  },
  'tulare': {
    name: 'Tulare',
    region: 'Central Valley',
    path: 'M 350 680 L 450 680 L 450 750 L 350 750 Z',
    center: [400, 715]
  },
  'kern': {
    name: 'Kern',
    region: 'Central Valley',
    path: 'M 300 750 L 500 750 L 500 850 L 300 850 Z',
    center: [400, 800]
  },

  // Central Coast
  'santa-cruz': {
    name: 'Santa Cruz',
    region: 'Central Coast',
    path: 'M 80 530 L 150 530 L 150 570 L 80 570 Z',
    center: [115, 550]
  },
  'monterey': {
    name: 'Monterey',
    region: 'Central Coast',
    path: 'M 80 570 L 250 570 L 250 650 L 80 650 Z',
    center: [165, 610]
  },
  'san-benito': {
    name: 'San Benito',
    region: 'Central Coast',
    path: 'M 250 570 L 350 570 L 350 630 L 250 630 Z',
    center: [300, 600]
  },
  'san-luis-obispo': {
    name: 'San Luis Obispo',
    region: 'Central Coast',
    path: 'M 100 650 L 300 650 L 300 750 L 100 750 Z',
    center: [200, 700]
  },
  'santa-barbara': {
    name: 'Santa Barbara',
    region: 'Central Coast',
    path: 'M 100 750 L 300 750 L 300 800 L 100 800 Z',
    center: [200, 775]
  },

  // Southern California
  'ventura': {
    name: 'Ventura',
    region: 'Southern California',
    path: 'M 100 800 L 250 800 L 250 850 L 100 850 Z',
    center: [175, 825]
  },
  'los-angeles': {
    name: 'Los Angeles',
    region: 'Southern California',
    path: 'M 100 850 L 300 850 L 300 950 L 100 950 Z',
    center: [200, 900]
  },
  'orange': {
    name: 'Orange',
    region: 'Southern California',
    path: 'M 200 950 L 300 950 L 300 1000 L 200 1000 Z',
    center: [250, 975]
  },
  'san-bernardino': {
    name: 'San Bernardino',
    region: 'Southern California',
    path: 'M 300 850 L 550 850 L 550 950 L 300 950 Z',
    center: [425, 900]
  },
  'riverside': {
    name: 'Riverside',
    region: 'Southern California',
    path: 'M 300 950 L 500 950 L 500 1050 L 300 1050 Z',
    center: [400, 975]
  },
  'san-diego': {
    name: 'San Diego',
    region: 'Southern California',
    path: 'M 100 950 L 200 950 L 200 1050 L 100 1050 Z',
    center: [150, 1000]
  },
  'imperial': {
    name: 'Imperial',
    region: 'Southern California',
    path: 'M 500 950 L 600 950 L 600 1050 L 500 1050 Z',
    center: [550, 1000]
  },

  // Sierra Nevada / Mountain counties
  'plumas': {
    name: 'Plumas',
    region: 'Northern California',
    path: 'M 500 100 L 600 100 L 600 200 L 500 200 Z',
    center: [550, 150]
  },
  'sierra': {
    name: 'Sierra',
    region: 'Sierra Nevada',
    path: 'M 500 200 L 550 200 L 550 250 L 500 250 Z',
    center: [525, 225]
  },
  'nevada': {
    name: 'Nevada',
    region: 'Sierra Nevada',
    path: 'M 450 250 L 550 250 L 550 300 L 450 300 Z',
    center: [500, 275]
  },
  'placer': {
    name: 'Placer',
    region: 'Sierra Nevada',
    path: 'M 450 300 L 550 300 L 550 380 L 450 380 Z',
    center: [500, 340]
  },
  'el-dorado': {
    name: 'El Dorado',
    region: 'Sierra Nevada',
    path: 'M 450 380 L 550 380 L 550 450 L 450 450 Z',
    center: [500, 415]
  },
  'alpine': {
    name: 'Alpine',
    region: 'Sierra Nevada',
    path: 'M 550 380 L 600 380 L 600 430 L 550 430 Z',
    center: [575, 405]
  },
  'amador': {
    name: 'Amador',
    region: 'Sierra Nevada',
    path: 'M 450 450 L 500 450 L 500 480 L 450 480 Z',
    center: [475, 465]
  },
  'calaveras': {
    name: 'Calaveras',
    region: 'Sierra Nevada',
    path: 'M 500 450 L 550 450 L 550 500 L 500 500 Z',
    center: [525, 475]
  },
  'tuolumne': {
    name: 'Tuolumne',
    region: 'Sierra Nevada',
    path: 'M 450 500 L 550 500 L 550 550 L 450 550 Z',
    center: [500, 525]
  },
  'mono': {
    name: 'Mono',
    region: 'Sierra Nevada',
    path: 'M 550 450 L 650 450 L 650 550 L 550 550 Z',
    center: [600, 500]
  },
  'mariposa': {
    name: 'Mariposa',
    region: 'Sierra Nevada',
    path: 'M 450 550 L 500 550 L 500 600 L 450 600 Z',
    center: [475, 575]
  },
  'madera': {
    name: 'Madera',
    region: 'Central Valley',
    path: 'M 500 550 L 550 550 L 550 630 L 500 630 Z',
    center: [525, 590]
  },
  'inyo': {
    name: 'Inyo',
    region: 'Sierra Nevada',
    path: 'M 550 550 L 650 550 L 650 750 L 550 750 Z',
    center: [600, 650]
  },

  // Additional counties
  'yuba': {
    name: 'Yuba',
    region: 'Central Valley',
    path: 'M 400 330 L 450 330 L 450 380 L 400 380 Z',
    center: [425, 355]
  },
  'sutter': {
    name: 'Sutter',
    region: 'Central Valley',
    path: 'M 350 330 L 400 330 L 400 380 L 350 380 Z',
    center: [375, 355]
  },
  'yolo': {
    name: 'Yolo',
    region: 'Central Valley',
    path: 'M 300 330 L 350 330 L 350 380 L 300 380 Z',
    center: [325, 355]
  },
  'lake': {
    name: 'Lake',
    region: 'North Coast',
    path: 'M 200 280 L 280 280 L 280 350 L 200 350 Z',
    center: [240, 315]
  },
  'colusa': {
    name: 'Colusa',
    region: 'Central Valley',
    path: 'M 280 280 L 350 280 L 350 330 L 280 330 Z',
    center: [315, 305]
  },
  'glenn': {
    name: 'Glenn',
    region: 'Central Valley',
    path: 'M 250 230 L 320 230 L 320 280 L 250 280 Z',
    center: [285, 255]
  },
  'tehama': {
    name: 'Tehama',
    region: 'Northern California',
    path: 'M 250 150 L 350 150 L 350 230 L 250 230 Z',
    center: [300, 190]
  },
  'butte': {
    name: 'Butte',
    region: 'Central Valley',
    path: 'M 350 200 L 450 200 L 450 280 L 350 280 Z',
    center: [400, 240]
  }
};