import { County, HintType, DifficultyLevel } from '@/types';
import { getCountyById } from '@/data/californiaCounties';

// Educational themes that can be applied across counties
export enum EducationalTheme {
  GEOGRAPHY = 'geography',
  HISTORY = 'history',
  ECONOMY = 'economy',
  CULTURE = 'culture',
  ENVIRONMENT = 'environment',
  GOVERNMENT = 'government'
}

// Enhanced educational content structure
export interface EducationalContent {
  theme: EducationalTheme;
  title: string;
  content: string;
  difficulty: DifficultyLevel;
  interactiveElements?: InteractiveElement[];
  relatedCounties?: string[];
  didYouKnow?: string;
  funFact?: string;
}

export interface InteractiveElement {
  type: 'question' | 'comparison' | 'timeline' | 'infographic';
  content: string;
  answer?: string;
  data?: any;
}

// County-specific educational content
const countyEducationalContent: Record<string, EducationalContent[]> = {
  'los_angeles': [
    {
      theme: EducationalTheme.GEOGRAPHY,
      title: 'America\'s Most Populous County',
      content: 'Los Angeles County spans 4,751 square miles and is home to over 10 million people—more than most entire states! It stretches from the Pacific Ocean to the San Gabriel Mountains, encompassing diverse landscapes from beaches to desert.',
      difficulty: DifficultyLevel.EASY,
      didYouKnow: 'If Los Angeles County were a state, it would rank 9th in population in the entire United States!',
      relatedCounties: ['orange', 'ventura', 'kern', 'san_bernardino']
    },
    {
      theme: EducationalTheme.ECONOMY,
      title: 'Entertainment Capital of the World',
      content: 'Hollywood has been the center of the American film industry since the early 1900s. The entertainment industry contributes over $50 billion annually to LA County\'s economy and employs hundreds of thousands of people.',
      difficulty: DifficultyLevel.MEDIUM,
      funFact: 'The Hollywood sign originally read "Hollywoodland" and was an advertisement for a housing development!',
      interactiveElements: [
        {
          type: 'question',
          content: 'What industry is Los Angeles County most famous for?',
          answer: 'Entertainment/Film industry'
        }
      ]
    },
    {
      theme: EducationalTheme.CULTURE,
      title: 'Cultural Diversity Hub',
      content: 'LA County is incredibly diverse, with over 200 languages spoken and representing cultures from around the globe. This diversity is reflected in its neighborhoods, food, arts, and festivals.',
      difficulty: DifficultyLevel.HARD,
      didYouKnow: 'Los Angeles has the largest Korean population outside of South Korea and the second-largest Mexican population outside of Mexico!'
    }
  ],

  'san_francisco': [
    {
      theme: EducationalTheme.GEOGRAPHY,
      title: 'City on Hills',
      content: 'San Francisco is built on more than 50 hills, with the highest being Mount Davidson at 928 feet. The unique topography creates the city\'s famous steep streets and diverse microclimates.',
      difficulty: DifficultyLevel.EASY,
      funFact: 'The steepest street in San Francisco is Filbert Street with a 31.5% grade—that\'s like climbing a mountain!',
      interactiveElements: [
        {
          type: 'comparison',
          content: 'San Francisco covers only 47 square miles—you could fit it into Los Angeles County 101 times!'
        }
      ]
    },
    {
      theme: EducationalTheme.HISTORY,
      title: 'Gold Rush Gateway',
      content: 'San Francisco grew from a small settlement of 200 people to a city of 36,000 during the California Gold Rush of 1849. It served as the main port for people and supplies heading to the gold fields.',
      difficulty: DifficultyLevel.MEDIUM,
      didYouKnow: 'During the Gold Rush, it was faster to ship mail from San Francisco to New York by boat around South America than overland!',
      relatedCounties: ['alameda', 'marin', 'san_mateo']
    },
    {
      theme: EducationalTheme.ECONOMY,
      title: 'Tech Innovation Center',
      content: 'While Silicon Valley is technically in Santa Clara County, San Francisco has become a major tech hub with companies like Twitter, Uber, and Salesforce headquartered here.',
      difficulty: DifficultyLevel.HARD,
      relatedCounties: ['santa_clara', 'san_mateo']
    }
  ],

  'orange': [
    {
      theme: EducationalTheme.HISTORY,
      title: 'From Orange Groves to Suburbs',
      content: 'Orange County was once covered in vast orange groves that gave the county its name. Post-WWII suburban development transformed it into one of America\'s most planned communities.',
      difficulty: DifficultyLevel.EASY,
      funFact: 'The last commercial orange grove in Orange County was removed in 2012, ending over 100 years of citrus farming!',
      interactiveElements: [
        {
          type: 'timeline',
          content: 'Orange County transformation: 1880s - Orange groves planted, 1950s - Suburban development begins, 1955 - Disneyland opens'
        }
      ]
    },
    {
      theme: EducationalTheme.CULTURE,
      title: 'Disneyland\'s Impact',
      content: 'When Disneyland opened in 1955, it transformed Orange County from rural farmland into a major tourist destination. The park has welcomed over 750 million guests and influenced theme park design worldwide.',
      difficulty: DifficultyLevel.MEDIUM,
      didYouKnow: 'Walt Disney bought the Anaheim land for Disneyland at $4,500 per acre—today that land is worth millions per acre!'
    }
  ],

  'san_diego': [
    {
      theme: EducationalTheme.HISTORY,
      title: 'First European Settlement',
      content: 'San Diego was the site of the first European settlement in California when Spanish explorers established a mission here in 1769. This makes it the "birthplace" of California.',
      difficulty: DifficultyLevel.EASY,
      didYouKnow: 'The San Diego mission bell still rings today, over 250 years after it was first installed!',
      relatedCounties: ['orange', 'riverside', 'imperial']
    },
    {
      theme: EducationalTheme.ENVIRONMENT,
      title: 'America\'s Finest Climate',
      content: 'San Diego\'s Mediterranean climate features mild temperatures year-round, with average highs of 72°F and very little rainfall. This climate supports unique ecosystems and year-round outdoor activities.',
      difficulty: DifficultyLevel.MEDIUM,
      funFact: 'San Diego has perfect beach weather over 260 days per year!'
    },
    {
      theme: EducationalTheme.ECONOMY,
      title: 'Military and Biotech Hub',
      content: 'San Diego hosts the largest naval fleet in the world and is a major center for biotechnology research, with over 400 biotech companies calling the region home.',
      difficulty: DifficultyLevel.HARD,
      interactiveElements: [
        {
          type: 'infographic',
          content: 'San Diego\'s economy: 23% Military, 18% Tourism, 15% Biotechnology, 44% Other industries'
        }
      ]
    }
  ],

  'alameda': [
    {
      theme: EducationalTheme.GEOGRAPHY,
      title: 'East Bay Location',
      content: 'Alameda County sits on the eastern shore of San Francisco Bay, connected to the city by the iconic Bay Bridge. Its diverse geography includes urban areas, hills, and agricultural valleys.',
      difficulty: DifficultyLevel.EASY,
      relatedCounties: ['contra_costa', 'santa_clara', 'san_francisco']
    },
    {
      theme: EducationalTheme.ECONOMY,
      title: 'Port of Oakland',
      content: 'The Port of Oakland is the 4th busiest container port in the US and the busiest on the West Coast, handling goods from Asia that are distributed across America.',
      difficulty: DifficultyLevel.MEDIUM,
      didYouKnow: 'The Port of Oakland handles 99% of the containerized goods moving through Northern California!'
    },
    {
      theme: EducationalTheme.CULTURE,
      title: 'UC Berkeley Legacy',
      content: 'The University of California, Berkeley, founded in 1868, is one of the world\'s leading public research universities and birthplace of the Free Speech Movement in the 1960s.',
      difficulty: DifficultyLevel.HARD,
      funFact: 'UC Berkeley has produced more Nobel Prize winners than any other public university!'
    }
  ]
};

// Geographic education content that applies to regions
const regionalEducationalContent: Record<string, EducationalContent[]> = {
  'northern': [
    {
      theme: EducationalTheme.GEOGRAPHY,
      title: 'San Francisco Bay Area',
      content: 'The San Francisco Bay Area is a unique geographic feature—the largest estuary on the Pacific Coast of the Americas, supporting diverse ecosystems and urban development.',
      difficulty: DifficultyLevel.MEDIUM,
      didYouKnow: 'The San Francisco Bay was formed by the rising sea level at the end of the last ice age!'
    }
  ],
  'central_valley': [
    {
      theme: EducationalTheme.ECONOMY,
      title: 'America\'s Fruit and Vegetable Basket',
      content: 'California\'s Central Valley produces 25% of America\'s food on just 1% of U.S. farmland. Its Mediterranean climate and fertile soil make it one of the world\'s most productive agricultural regions.',
      difficulty: DifficultyLevel.EASY,
      funFact: 'The Central Valley produces over 230 different crops!'
    }
  ],
  'southern': [
    {
      theme: EducationalTheme.CULTURE,
      title: 'Mexican-American Heritage',
      content: 'Southern California was part of Mexico until 1848, and this heritage is still visible today in architecture, food, place names, and cultural traditions throughout the region.',
      difficulty: DifficultyLevel.MEDIUM,
      didYouKnow: 'Many Southern California city names are Spanish: Los Angeles (The Angels), San Diego (Saint Diego), Santa Barbara (Saint Barbara)!'
    }
  ]
};

/**
 * Gets educational content for a specific county
 */
export function getCountyEducationalContent(countyId: string): EducationalContent[] {
  return countyEducationalContent[countyId] || [];
}

/**
 * Gets educational content for a specific region
 */
export function getRegionalEducationalContent(regionId: string): EducationalContent[] {
  return regionalEducationalContent[regionId] || [];
}

/**
 * Gets educational content by theme across all counties
 */
export function getEducationalContentByTheme(theme: EducationalTheme): EducationalContent[] {
  const allContent: EducationalContent[] = [];

  Object.values(countyEducationalContent).forEach(contentArray => {
    contentArray.forEach(content => {
      if (content.theme === theme) {
        allContent.push(content);
      }
    });
  });

  Object.values(regionalEducationalContent).forEach(contentArray => {
    contentArray.forEach(content => {
      if (content.theme === theme) {
        allContent.push(content);
      }
    });
  });

  return allContent;
}

/**
 * Gets educational content filtered by difficulty level
 */
export function getEducationalContentByDifficulty(difficulty: DifficultyLevel): EducationalContent[] {
  const allContent: EducationalContent[] = [];

  Object.values(countyEducationalContent).forEach(contentArray => {
    contentArray.forEach(content => {
      if (content.difficulty === difficulty) {
        allContent.push(content);
      }
    });
  });

  return allContent;
}

/**
 * Generates a comprehensive educational hint for a county
 */
export function generateEducationalHint(
  county: County,
  progress: number = 0,
  theme?: EducationalTheme
): string {
  const countyData = getCountyById(county.id);
  const educationalData = getCountyEducationalContent(county.id);

  if (educationalData.length === 0) {
    // Fallback to basic county data
    if (!countyData) return 'This county has interesting educational features.';

    const facts = countyData.funFacts || [];
    if (facts.length > 0) {
      const factIndex = Math.min(facts.length - 1, Math.floor(progress * facts.length));
      return facts[factIndex];
    }
    return 'This county plays an important role in California\'s history and development.';
  }

  // Filter by theme if specified
  const relevantContent = theme
    ? educationalData.filter(content => content.theme === theme)
    : educationalData;

  if (relevantContent.length === 0) {
    return educationalData[0].content;
  }

  // Select content based on progress
  const contentIndex = Math.min(relevantContent.length - 1, Math.floor(progress * relevantContent.length));
  const selectedContent = relevantContent[contentIndex];

  let hint = selectedContent.content;

  // Add additional information based on progress
  if (progress > 0.5 && selectedContent.didYouKnow) {
    hint += ` Did you know? ${selectedContent.didYouKnow}`;
  }

  if (progress > 0.8 && selectedContent.funFact) {
    hint += ` Fun fact: ${selectedContent.funFact}`;
  }

  return hint;
}

/**
 * Gets related educational content for a county
 */
export function getRelatedEducationalContent(countyId: string): EducationalContent[] {
  const relatedContent: EducationalContent[] = [];

  Object.entries(countyEducationalContent).forEach(([id, contentArray]) => {
    contentArray.forEach(content => {
      if (content.relatedCounties?.includes(countyId) && id !== countyId) {
        relatedContent.push(content);
      }
    });
  });

  return relatedContent;
}

/**
 * Creates an educational journey across related counties
 */
export function createEducationalJourney(startingCountyId: string): string[] {
  const visited = new Set<string>();
  const journey = [startingCountyId];
  visited.add(startingCountyId);

  let currentCounty = startingCountyId;

  // Build a journey of up to 5 related counties
  while (journey.length < 5) {
    const relatedContent = getCountyEducationalContent(currentCounty);
    let nextCounty: string | null = null;

    // Find an unvisited related county
    for (const content of relatedContent) {
      if (content.relatedCounties) {
        for (const relatedId of content.relatedCounties) {
          if (!visited.has(relatedId)) {
            nextCounty = relatedId;
            break;
          }
        }
      }
      if (nextCounty) break;
    }

    if (!nextCounty) break;

    journey.push(nextCounty);
    visited.add(nextCounty);
    currentCounty = nextCounty;
  }

  return journey;
}

export default {
  getCountyEducationalContent,
  getRegionalEducationalContent,
  getEducationalContentByTheme,
  getEducationalContentByDifficulty,
  generateEducationalHint,
  getRelatedEducationalContent,
  createEducationalJourney
};