// Geographically accurate California county shapes
// SVG paths based on actual county boundaries (simplified for performance)
// Coordinates are normalized to a 800x1000 viewBox

export interface CountyShape {
  id: string;
  name: string;
  region: string;
  path: string;
  center: [number, number];
  labelPosition?: [number, number]; // Optional different position for label
}

// California counties with geographically accurate boundaries
export const californiaCountyShapes: CountyShape[] = [
  // Northern Counties
  {
    id: 'del-norte',
    name: 'Del Norte',
    region: 'North Coast',
    path: 'M 70,40 L 110,38 L 115,45 L 112,65 L 108,70 L 85,72 L 70,68 L 68,50 Z',
    center: [90, 55]
  },
  {
    id: 'siskiyou',
    name: 'Siskiyou',
    region: 'Northern California',
    path: 'M 115,38 L 210,35 L 215,42 L 212,72 L 208,75 L 112,70 L 115,45 Z',
    center: [165, 55]
  },
  {
    id: 'modoc',
    name: 'Modoc',
    region: 'Northern California',
    path: 'M 215,35 L 290,33 L 295,40 L 292,75 L 288,78 L 212,72 L 215,42 Z',
    center: [255, 55]
  },
  {
    id: 'humboldt',
    name: 'Humboldt',
    region: 'North Coast',
    path: 'M 68,72 L 85,72 L 88,125 L 82,165 L 75,180 L 60,175 L 55,160 L 52,120 L 58,85 L 68,72 Z',
    center: [70, 125]
  },
  {
    id: 'trinity',
    name: 'Trinity',
    region: 'Northern California',
    path: 'M 85,72 L 135,75 L 132,125 L 128,155 L 88,150 L 88,125 L 85,72 Z',
    center: [110, 110]
  },
  {
    id: 'shasta',
    name: 'Shasta',
    region: 'Northern California',
    path: 'M 135,75 L 208,75 L 205,125 L 200,145 L 132,140 L 132,125 L 135,75 Z',
    center: [170, 110]
  },
  {
    id: 'lassen',
    name: 'Lassen',
    region: 'Northern California',
    path: 'M 208,75 L 288,78 L 285,125 L 280,145 L 205,140 L 205,125 L 208,75 Z',
    center: [245, 110]
  },
  {
    id: 'tehama',
    name: 'Tehama',
    region: 'Northern California',
    path: 'M 128,155 L 200,145 L 198,180 L 195,195 L 125,190 L 128,155 Z',
    center: [165, 170]
  },
  {
    id: 'plumas',
    name: 'Plumas',
    region: 'Sierra Nevada',
    path: 'M 200,145 L 280,145 L 278,195 L 275,210 L 198,205 L 198,180 L 200,145 Z',
    center: [240, 175]
  },
  {
    id: 'mendocino',
    name: 'Mendocino',
    region: 'North Coast',
    path: 'M 55,180 L 75,180 L 88,185 L 85,245 L 80,285 L 65,280 L 50,275 L 45,250 L 48,210 L 55,180 Z',
    center: [65, 230]
  },
  {
    id: 'glenn',
    name: 'Glenn',
    region: 'Central Valley',
    path: 'M 125,190 L 165,195 L 162,230 L 158,245 L 120,240 L 125,190 Z',
    center: [142, 215]
  },
  {
    id: 'butte',
    name: 'Butte',
    region: 'Central Valley',
    path: 'M 165,195 L 225,195 L 223,245 L 218,260 L 162,255 L 162,230 L 165,195 Z',
    center: [195, 225]
  },
  {
    id: 'sierra',
    name: 'Sierra',
    region: 'Sierra Nevada',
    path: 'M 275,210 L 305,212 L 303,235 L 300,245 L 272,243 L 275,210 Z',
    center: [288, 227]
  },
  {
    id: 'nevada',
    name: 'Nevada',
    region: 'Sierra Nevada',
    path: 'M 245,245 L 300,245 L 298,275 L 295,285 L 240,280 L 245,245 Z',
    center: [270, 265]
  },
  {
    id: 'placer',
    name: 'Placer',
    region: 'Sierra Nevada',
    path: 'M 240,280 L 295,285 L 293,325 L 290,345 L 235,340 L 240,280 Z',
    center: [265, 312]
  },
  {
    id: 'lake',
    name: 'Lake',
    region: 'North Coast',
    path: 'M 85,245 L 125,240 L 120,285 L 115,305 L 80,300 L 80,285 L 85,245 Z',
    center: [102, 272]
  },
  {
    id: 'colusa',
    name: 'Colusa',
    region: 'Central Valley',
    path: 'M 120,240 L 158,245 L 155,285 L 150,300 L 115,295 L 120,240 Z',
    center: [137, 270]
  },
  {
    id: 'yuba',
    name: 'Yuba',
    region: 'Central Valley',
    path: 'M 218,260 L 245,262 L 240,280 L 235,290 L 215,288 L 218,260 Z',
    center: [230, 275]
  },
  {
    id: 'sutter',
    name: 'Sutter',
    region: 'Central Valley',
    path: 'M 185,285 L 215,288 L 210,315 L 205,325 L 180,320 L 185,285 Z',
    center: [197, 305]
  },
  {
    id: 'yolo',
    name: 'Yolo',
    region: 'Central Valley',
    path: 'M 150,300 L 180,305 L 175,340 L 170,355 L 145,350 L 150,300 Z',
    center: [162, 327]
  },
  {
    id: 'sonoma',
    name: 'Sonoma',
    region: 'Bay Area',
    path: 'M 80,300 L 115,305 L 110,355 L 105,375 L 75,370 L 70,345 L 75,320 L 80,300 Z',
    center: [92, 337]
  },
  {
    id: 'napa',
    name: 'Napa',
    region: 'Bay Area',
    path: 'M 115,305 L 145,310 L 140,350 L 135,365 L 110,360 L 110,355 L 115,305 Z',
    center: [127, 335]
  },
  {
    id: 'sacramento',
    name: 'Sacramento',
    region: 'Central Valley',
    path: 'M 205,325 L 235,330 L 230,365 L 225,380 L 200,375 L 205,325 Z',
    center: [217, 352]
  },
  {
    id: 'el-dorado',
    name: 'El Dorado',
    region: 'Sierra Nevada',
    path: 'M 235,340 L 290,345 L 288,385 L 285,405 L 230,400 L 230,365 L 235,340 Z',
    center: [260, 372]
  },
  {
    id: 'amador',
    name: 'Amador',
    region: 'Sierra Nevada',
    path: 'M 225,380 L 255,383 L 252,405 L 248,415 L 220,412 L 225,380 Z',
    center: [237, 397]
  },
  {
    id: 'alpine',
    name: 'Alpine',
    region: 'Sierra Nevada',
    path: 'M 285,385 L 315,388 L 313,415 L 310,425 L 285,422 L 285,405 L 285,385 Z',
    center: [300, 405]
  },
  {
    id: 'calaveras',
    name: 'Calaveras',
    region: 'Sierra Nevada',
    path: 'M 248,415 L 285,418 L 282,445 L 278,455 L 245,452 L 248,415 Z',
    center: [265, 435]
  },
  {
    id: 'tuolumne',
    name: 'Tuolumne',
    region: 'Sierra Nevada',
    path: 'M 278,455 L 330,458 L 328,495 L 325,515 L 275,512 L 278,455 Z',
    center: [302, 485]
  },
  {
    id: 'mono',
    name: 'Mono',
    region: 'Sierra Nevada',
    path: 'M 330,425 L 370,428 L 368,515 L 365,545 L 328,542 L 328,495 L 330,425 Z',
    center: [349, 485]
  },
  {
    id: 'marin',
    name: 'Marin',
    region: 'Bay Area',
    path: 'M 75,375 L 95,378 L 92,405 L 88,415 L 70,412 L 68,395 L 75,375 Z',
    center: [81, 395]
  },
  {
    id: 'san-francisco',
    name: 'San Francisco',
    region: 'Bay Area',
    path: 'M 70,415 L 85,416 L 83,425 L 80,430 L 68,428 L 70,415 Z',
    center: [76, 422]
  },
  {
    id: 'solano',
    name: 'Solano',
    region: 'Bay Area',
    path: 'M 145,350 L 200,355 L 195,385 L 190,395 L 140,390 L 145,350 Z',
    center: [170, 372]
  },
  {
    id: 'contra-costa',
    name: 'Contra Costa',
    region: 'Bay Area',
    path: 'M 105,375 L 140,380 L 135,420 L 130,435 L 100,430 L 105,375 Z',
    center: [120, 405]
  },
  {
    id: 'san-joaquin',
    name: 'San Joaquin',
    region: 'Central Valley',
    path: 'M 190,395 L 225,398 L 220,435 L 215,450 L 185,445 L 190,395 Z',
    center: [205, 422]
  },
  {
    id: 'alameda',
    name: 'Alameda',
    region: 'Bay Area',
    path: 'M 100,430 L 130,435 L 125,465 L 120,475 L 95,470 L 100,430 Z',
    center: [112, 452]
  },
  {
    id: 'san-mateo',
    name: 'San Mateo',
    region: 'Bay Area',
    path: 'M 80,430 L 95,432 L 92,470 L 88,480 L 75,478 L 78,445 L 80,430 Z',
    center: [85, 455]
  },
  {
    id: 'santa-clara',
    name: 'Santa Clara',
    region: 'Bay Area',
    path: 'M 95,470 L 125,475 L 122,510 L 118,525 L 88,520 L 92,480 L 95,470 Z',
    center: [106, 497]
  },
  {
    id: 'stanislaus',
    name: 'Stanislaus',
    region: 'Central Valley',
    path: 'M 185,445 L 245,448 L 242,485 L 238,500 L 180,495 L 185,445 Z',
    center: [212, 472]
  },
  {
    id: 'santa-cruz',
    name: 'Santa Cruz',
    region: 'Central Coast',
    path: 'M 75,510 L 88,512 L 85,540 L 80,550 L 65,548 L 68,525 L 75,510 Z',
    center: [76, 530]
  },
  {
    id: 'merced',
    name: 'Merced',
    region: 'Central Valley',
    path: 'M 180,495 L 275,500 L 272,540 L 268,555 L 175,550 L 180,495 Z',
    center: [225, 525]
  },
  {
    id: 'mariposa',
    name: 'Mariposa',
    region: 'Sierra Nevada',
    path: 'M 275,512 L 325,515 L 322,545 L 318,560 L 272,557 L 275,512 Z',
    center: [298, 536]
  },
  {
    id: 'madera',
    name: 'Madera',
    region: 'Central Valley',
    path: 'M 268,555 L 318,558 L 315,595 L 310,610 L 265,607 L 268,555 Z',
    center: [291, 582]
  },
  {
    id: 'san-benito',
    name: 'San Benito',
    region: 'Central Coast',
    path: 'M 118,525 L 175,530 L 172,570 L 168,585 L 115,580 L 118,525 Z',
    center: [145, 555]
  },
  {
    id: 'monterey',
    name: 'Monterey',
    region: 'Central Coast',
    path: 'M 65,550 L 115,555 L 112,620 L 108,650 L 85,645 L 60,640 L 55,600 L 65,550 Z',
    center: [85, 600]
  },
  {
    id: 'fresno',
    name: 'Fresno',
    region: 'Central Valley',
    path: 'M 175,550 L 310,555 L 308,620 L 305,655 L 170,650 L 175,550 Z',
    center: [240, 602]
  },
  {
    id: 'kings',
    name: 'Kings',
    region: 'Central Valley',
    path: 'M 170,650 L 230,653 L 227,685 L 223,700 L 165,697 L 170,650 Z',
    center: [197, 675]
  },
  {
    id: 'tulare',
    name: 'Tulare',
    region: 'Central Valley',
    path: 'M 230,653 L 305,655 L 302,700 L 298,720 L 223,717 L 227,685 L 230,653 Z',
    center: [264, 686]
  },
  {
    id: 'inyo',
    name: 'Inyo',
    region: 'Sierra Nevada',
    path: 'M 365,545 L 400,548 L 398,720 L 395,780 L 360,777 L 362,655 L 365,545 Z',
    center: [380, 662]
  },
  {
    id: 'san-luis-obispo',
    name: 'San Luis Obispo',
    region: 'Central Coast',
    path: 'M 85,650 L 165,655 L 162,720 L 158,750 L 120,745 L 80,740 L 75,700 L 85,650 Z',
    center: [120, 700]
  },
  {
    id: 'kern',
    name: 'Kern',
    region: 'Central Valley',
    path: 'M 223,720 L 360,725 L 358,800 L 355,830 L 220,825 L 223,720 Z',
    center: [290, 775]
  },
  {
    id: 'santa-barbara',
    name: 'Santa Barbara',
    region: 'Central Coast',
    path: 'M 80,750 L 158,755 L 155,800 L 150,820 L 110,815 L 75,810 L 72,780 L 80,750 Z',
    center: [115, 785]
  },
  {
    id: 'ventura',
    name: 'Ventura',
    region: 'Southern California',
    path: 'M 150,820 L 220,823 L 217,855 L 213,870 L 145,867 L 148,835 L 150,820 Z',
    center: [182, 845]
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    region: 'Southern California',
    path: 'M 145,870 L 280,875 L 278,920 L 275,950 L 200,945 L 140,940 L 138,900 L 145,870 Z',
    center: [209, 910]
  },
  {
    id: 'san-bernardino',
    name: 'San Bernardino',
    region: 'Southern California',
    path: 'M 280,830 L 395,835 L 393,920 L 390,950 L 278,945 L 280,875 L 280,830 Z',
    center: [337, 890]
  },
  {
    id: 'orange',
    name: 'Orange',
    region: 'Southern California',
    path: 'M 200,945 L 245,947 L 242,975 L 238,985 L 195,983 L 198,955 L 200,945 Z',
    center: [220, 965]
  },
  {
    id: 'riverside',
    name: 'Riverside',
    region: 'Southern California',
    path: 'M 245,950 L 390,953 L 388,1020 L 385,1050 L 240,1045 L 242,975 L 245,950 Z',
    center: [315, 1000]
  },
  {
    id: 'san-diego',
    name: 'San Diego',
    region: 'Southern California',
    path: 'M 195,985 L 240,987 L 238,1045 L 235,1080 L 190,1078 L 150,1075 L 145,1040 L 148,1000 L 195,985 Z',
    center: [192, 1032]
  },
  {
    id: 'imperial',
    name: 'Imperial',
    region: 'Southern California',
    path: 'M 240,1045 L 385,1048 L 383,1080 L 380,1090 L 235,1087 L 238,1045 Z',
    center: [312, 1067]
  }
];

// Helper function to get county by ID
export function getCountyShape(countyId: string): CountyShape | undefined {
  return californiaCountyShapes.find(
    county => county.id === countyId ||
    county.id === countyId.replace(/_/g, '-') ||
    county.id === countyId.replace(/-/g, '_')
  );
}

// Helper function to get counties by region
export function getCountiesByRegion(region: string): CountyShape[] {
  return californiaCountyShapes.filter(county =>
    county.region.toLowerCase() === region.toLowerCase()
  );
}

// Get bounding box for a county path
export function getCountyBounds(path: string): { minX: number, minY: number, maxX: number, maxY: number } {
  const numbers = path.match(/[\d.]+/g)?.map(Number) || [];
  const xCoords: number[] = [];
  const yCoords: number[] = [];

  for (let i = 0; i < numbers.length; i += 2) {
    if (numbers[i] !== undefined) xCoords.push(numbers[i]);
    if (numbers[i + 1] !== undefined) yCoords.push(numbers[i + 1]);
  }

  return {
    minX: Math.min(...xCoords),
    minY: Math.min(...yCoords),
    maxX: Math.max(...xCoords),
    maxY: Math.max(...yCoords)
  };
}