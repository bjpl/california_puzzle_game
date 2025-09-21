import {
  County,
  Hint,
  HintType,
  DifficultyLevel,
  StruggleData,
  Position,
  HintVisualData,
  CaliforniaRegion
} from '@/types';
import { getCountyById, californiaCounties } from '@/data/californiaCounties';

// Educational content for counties
const educationalHints: Record<string, string[]> = {
  'los_angeles': [
    'Los Angeles County is the most populous county in the United States with over 10 million residents.',
    'Hollywood, located in LA County, is known as the entertainment capital of the world.',
    'The county covers 4,751 square miles and includes 88 incorporated cities.',
    'LA County has more than 75 miles of coastline along the Pacific Ocean.'
  ],
  'san_francisco': [
    'San Francisco is the only city-county in California, covering just 47 square miles.',
    'The Golden Gate Bridge, completed in 1937, spans 1.7 miles across the Golden Gate strait.',
    'San Francisco has over 50 hills, with the highest being Mount Davidson at 928 feet.',
    'The city experiences a Mediterranean climate with cool summers due to ocean fog.'
  ],
  'orange': [
    'Orange County was originally named for its extensive orange groves that covered the area.',
    'Disneyland, opened in 1955, was the first Disney theme park and attracts millions of visitors annually.',
    'The county is home to several major universities including UC Irvine and Chapman University.',
    'Orange County has 42 miles of coastline featuring popular beaches like Huntington and Newport.'
  ],
  'san_diego': [
    'San Diego was the site of the first European settlement in California, established in 1769.',
    'The city is home to the world-famous San Diego Zoo and Safari Park.',
    'San Diego Bay is one of the largest natural harbors on the Pacific Coast.',
    'The county has a year-round mild climate, earning it the nickname "America\'s Finest City."'
  ],
  'alameda': [
    'Alameda County is home to UC Berkeley, one of the top public universities in the world.',
    'The Port of Oakland is the busiest container port on the West Coast.',
    'The county name comes from the Spanish word "álamo," meaning poplar tree.',
    'Oakland has more sunny days per year than neighboring San Francisco.'
  ]
};

// Geographic hints for location-based clues
const locationHints: Record<string, string[]> = {
  'northern': [
    'This county is located in Northern California.',
    'Look in the upper portion of the state map.',
    'This area is north of the Central Valley.',
    'You\'ll find this county in the San Francisco Bay Area or further north.'
  ],
  'southern': [
    'This county is in Southern California.',
    'Look in the lower portion of the state.',
    'This area is south of the Central Valley.',
    'Search near Los Angeles or San Diego regions.'
  ],
  'central_valley': [
    'This county is in California\'s Central Valley.',
    'Look in the agricultural heartland of the state.',
    'This area is between the coastal ranges and the Sierra Nevada.',
    'Search in the middle portion of California.'
  ],
  'central_coast': [
    'This county is along California\'s Central Coast.',
    'Look along the Pacific coastline between the Bay Area and Southern California.',
    'This area features scenic coastal landscapes.',
    'Search between Monterey and Santa Barbara.'
  ]
};

// Shape and boundary descriptions
const shapeHints: Record<string, string> = {
  'los_angeles': 'Large county with irregular shape, extending from coast to inland mountains',
  'san_francisco': 'Small square-shaped county at the tip of a peninsula',
  'orange': 'Compact rectangular county along the coast south of Los Angeles',
  'san_diego': 'Large county in the southwest corner with extensive coastline',
  'riverside': 'Very large inland county with irregular eastern boundary',
  'san_bernardino': 'Massive county covering much of southeastern California desert',
  'alameda': 'Medium-sized county on the east side of San Francisco Bay',
  'santa_clara': 'County surrounding the southern tip of San Francisco Bay',
  'sacramento': 'Central valley county containing the state capital',
  'fresno': 'Large Central Valley county extending into the Sierra Nevada'
};

// Neighboring counties information
const neighborHints: Record<string, string[]> = {
  'los_angeles': ['Orange County', 'San Bernardino County', 'Riverside County', 'Kern County', 'Santa Barbara County'],
  'san_francisco': ['Marin County', 'San Mateo County'],
  'orange': ['Los Angeles County', 'Riverside County', 'San Bernardino County'],
  'san_diego': ['Orange County', 'Riverside County', 'Imperial County'],
  'alameda': ['Contra Costa County', 'San Joaquin County', 'Santa Clara County', 'San Francisco County'],
  'santa_clara': ['Alameda County', 'San Mateo County', 'Santa Cruz County', 'San Benito County', 'Stanislaus County'],
  'sacramento': ['Yolo County', 'Solano County', 'San Joaquin County', 'Amador County', 'El Dorado County', 'Placer County', 'Sutter County'],
  'riverside': ['Los Angeles County', 'Orange County', 'San Bernardino County', 'Imperial County'],
  'san_bernardino': ['Los Angeles County', 'Orange County', 'Riverside County', 'Kern County', 'Tulare County', 'Inyo County'],
  'fresno': ['San Benito County', 'Monterey County', 'Kings County', 'Tulare County', 'Inyo County', 'Madera County']
};

/**
 * Generates a hint for a specific county and hint type
 */
export function generateHint(
  county: County,
  type: HintType,
  progress: number = 0
): Hint {
  const countyData = getCountyById(county.id);
  let content = '';
  let visualData: HintVisualData | undefined;
  let educationalValue = 1;

  switch (type) {
    case HintType.LOCATION:
      content = generateLocationHint(county, progress);
      visualData = generateLocationVisual(county);
      educationalValue = 2;
      break;

    case HintType.NAME:
      content = generateNameHint(county, progress);
      educationalValue = 1;
      break;

    case HintType.SHAPE:
      content = generateShapeHint(county);
      visualData = generateShapeVisual(county);
      educationalValue = 3;
      break;

    case HintType.NEIGHBOR:
      content = generateNeighborHint(county, progress);
      visualData = generateNeighborVisual(county);
      educationalValue = 4;
      break;

    case HintType.FACT:
      content = generateFactHint(county, progress);
      educationalValue = 3;
      break;

    case HintType.EDUCATIONAL:
      content = generateEducationalHint(county, progress);
      educationalValue = 5;
      break;
  }

  return {
    id: `${county.id}-${type}-${Date.now()}`,
    type,
    countyId: county.id,
    content,
    visualData,
    educationalValue,
    difficulty: county.difficulty,
    unlockProgress: progress
  };
}

/**
 * Analyzes player struggle patterns and suggests helpful hints
 */
export function analyzeStruggle(struggle: StruggleData): HintType[] {
  const suggestedHints: HintType[] = [];

  // If player has made many attempts, suggest location hint first
  if (struggle.attempts >= 3 && !struggle.suggestedHints.includes(HintType.LOCATION)) {
    suggestedHints.push(HintType.LOCATION);
  }

  // If player spent a long time, suggest shape or neighbor hints
  if (struggle.totalTimeSpent > 30000 && !struggle.suggestedHints.includes(HintType.SHAPE)) {
    suggestedHints.push(HintType.SHAPE);
  }

  // If player has wrong placements clustered in wrong area, suggest neighbors
  if (struggle.wrongPlacements.length >= 2 && !struggle.suggestedHints.includes(HintType.NEIGHBOR)) {
    const avgX = struggle.wrongPlacements.reduce((sum, pos) => sum + pos.x, 0) / struggle.wrongPlacements.length;
    const avgY = struggle.wrongPlacements.reduce((sum, pos) => sum + pos.y, 0) / struggle.wrongPlacements.length;

    // If placements are scattered, suggest neighbor hint
    const variance = struggle.wrongPlacements.reduce((sum, pos) =>
      sum + Math.pow(pos.x - avgX, 2) + Math.pow(pos.y - avgY, 2), 0
    ) / struggle.wrongPlacements.length;

    if (variance > 10000) { // High variance indicates scattered attempts
      suggestedHints.push(HintType.NEIGHBOR);
    }
  }

  // After many failed attempts, suggest educational content to help learning
  if (struggle.attempts >= 5 && !struggle.suggestedHints.includes(HintType.EDUCATIONAL)) {
    suggestedHints.push(HintType.EDUCATIONAL);
  }

  // As last resort, suggest name hint
  if (struggle.attempts >= 7 && !struggle.suggestedHints.includes(HintType.NAME)) {
    suggestedHints.push(HintType.NAME);
  }

  return suggestedHints;
}

/**
 * Calculates the educational value of a hint combination
 */
export function calculateEducationalValue(hints: Hint[]): number {
  const uniqueTypes = new Set(hints.map(h => h.type));
  const diversityBonus = uniqueTypes.size * 0.2;
  const avgEducationalValue = hints.reduce((sum, h) => sum + h.educationalValue, 0) / hints.length;

  return Math.min(5, avgEducationalValue + diversityBonus);
}

/**
 * Determines optimal hint sequence for a county based on difficulty
 */
export function getOptimalHintSequence(county: County): HintType[] {
  switch (county.difficulty) {
    case DifficultyLevel.EASY:
      return [HintType.FACT, HintType.LOCATION, HintType.NEIGHBOR, HintType.SHAPE, HintType.NAME];

    case DifficultyLevel.MEDIUM:
      return [HintType.LOCATION, HintType.FACT, HintType.NEIGHBOR, HintType.EDUCATIONAL, HintType.SHAPE, HintType.NAME];

    case DifficultyLevel.HARD:
      return [HintType.EDUCATIONAL, HintType.FACT, HintType.NEIGHBOR, HintType.LOCATION, HintType.SHAPE, HintType.NAME];

    case DifficultyLevel.EXPERT:
      return [HintType.EDUCATIONAL, HintType.NEIGHBOR, HintType.FACT, HintType.LOCATION, HintType.SHAPE, HintType.NAME];

    default:
      return [HintType.LOCATION, HintType.FACT, HintType.NEIGHBOR, HintType.SHAPE, HintType.NAME];
  }
}

// Helper functions for generating specific hint types

function generateLocationHint(county: County, progress: number): string {
  const countyData = getCountyById(county.id);
  if (!countyData) return 'This county is located somewhere in California.';

  const regionHints = locationHints[countyData.region] || locationHints['northern'];

  if (progress < 0.3) {
    return regionHints[0] || 'This county is in a specific region of California.';
  } else if (progress < 0.6) {
    return regionHints[1] || 'Look more carefully in this region.';
  } else if (progress < 0.9) {
    return regionHints[2] || 'This county has distinct geographic features.';
  } else {
    return regionHints[3] || 'The county is located in a well-known area.';
  }
}

function generateNameHint(county: County, progress: number): string {
  return county.name; // The component will handle progressive revealing
}

function generateShapeHint(county: County): string {
  return shapeHints[county.id] || 'This county has a distinctive shape that makes it recognizable.';
}

function generateNeighborHint(county: County, progress: number): string {
  const neighbors = neighborHints[county.id] || [];

  if (neighbors.length === 0) {
    return 'This county borders several other counties.';
  }

  if (progress < 0.5) {
    return `This county borders ${neighbors[0]}.`;
  } else if (progress < 0.8) {
    const first = neighbors.slice(0, 2).join(' and ');
    return `This county borders ${first}.`;
  } else {
    const all = neighbors.length > 3
      ? neighbors.slice(0, 3).join(', ') + ', and others'
      : neighbors.join(', ');
    return `This county borders ${all}.`;
  }
}

function generateFactHint(county: County, progress: number): string {
  const countyData = getCountyById(county.id);
  if (!countyData) return 'This county has interesting features.';

  const facts = countyData.funFacts || [];
  if (facts.length === 0) return 'This county has unique characteristics.';

  const factIndex = Math.min(facts.length - 1, Math.floor(progress * facts.length));
  return facts[factIndex];
}

function generateEducationalHint(county: County, progress: number): string {
  const hints = educationalHints[county.id] || [
    'This county has a rich history and important cultural significance.',
    'Learning about this county helps understand California\'s development.',
    'This area played a significant role in California\'s growth.'
  ];

  const hintIndex = Math.min(hints.length - 1, Math.floor(progress * hints.length));
  return hints[hintIndex];
}

// Visual hint generators

function generateLocationVisual(county: County): HintVisualData {
  // This would typically use actual coordinate data
  // For now, we'll provide placeholder visual data
  return {
    highlightArea: {
      center: county.centroid ? { x: county.centroid[0], y: county.centroid[1] } : { x: 0, y: 0 },
      radius: 100,
      opacity: 0.3
    },
    pulseAnimation: {
      duration: 2000,
      intensity: 0.5
    }
  };
}

function generateShapeVisual(county: County): HintVisualData {
  return {
    highlightArea: {
      center: county.centroid ? { x: county.centroid[0], y: county.centroid[1] } : { x: 0, y: 0 },
      radius: 80,
      opacity: 0.2
    }
  };
}

function generateNeighborVisual(county: County): HintVisualData {
  return {
    highlightArea: {
      center: county.centroid ? { x: county.centroid[0], y: county.centroid[1] } : { x: 0, y: 0 },
      radius: 150,
      opacity: 0.15
    },
    pulseAnimation: {
      duration: 3000,
      intensity: 0.3
    }
  };
}

/**
 * Adaptive hint difficulty based on player performance
 */
export function adaptHintDifficulty(
  baseHint: Hint,
  playerAccuracy: number,
  attempts: number
): Hint {
  let adjustedContent = baseHint.content;
  let adjustedEducationalValue = baseHint.educationalValue;

  // Make hints more helpful for struggling players
  if (playerAccuracy < 0.3 || attempts > 5) {
    // Provide more detailed hints
    if (baseHint.type === HintType.LOCATION) {
      adjustedContent += ' Focus on the highlighted area on the map.';
    } else if (baseHint.type === HintType.NEIGHBOR) {
      adjustedContent += ' Look for counties that share borders with the mentioned ones.';
    }
    adjustedEducationalValue += 1;
  }

  // Make hints more challenging for advanced players
  if (playerAccuracy > 0.8 && attempts < 3) {
    // Provide more subtle hints
    if (baseHint.type === HintType.NAME) {
      // Show fewer letters initially
    }
    adjustedEducationalValue = Math.max(1, adjustedEducationalValue - 1);
  }

  return {
    ...baseHint,
    content: adjustedContent,
    educationalValue: Math.min(5, adjustedEducationalValue)
  };
}

export default {
  generateHint,
  analyzeStruggle,
  calculateEducationalValue,
  getOptimalHintSequence,
  adaptHintDifficulty
};