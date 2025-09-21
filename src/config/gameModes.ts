import {
  GameMode,
  GameModeConfiguration,
  GameModeCategory,
  DifficultyLevel,
  UnlockRequirementType,
  CaliforniaRegion,
  DifficultySettings
} from '@/types';
import { getCountiesByRegion, CALIFORNIA_COUNTIES } from '@/utils/californiaData';

// Difficulty Settings Configuration
export const DIFFICULTY_SETTINGS: Record<DifficultyLevel, DifficultySettings> = {
  [DifficultyLevel.EASY]: {
    dropZoneTolerance: 80,
    showCountyOutlines: true,
    showCountyNames: true,
    showInitials: false,
    enableHints: true,
    timeMultiplier: 1.5,
    scoreMultiplier: 1.0,
    rotationEnabled: false
  },
  [DifficultyLevel.MEDIUM]: {
    dropZoneTolerance: 60,
    showCountyOutlines: true,
    showCountyNames: false,
    showInitials: true,
    enableHints: true,
    timeMultiplier: 1.2,
    scoreMultiplier: 1.5,
    rotationEnabled: false
  },
  [DifficultyLevel.HARD]: {
    dropZoneTolerance: 40,
    showCountyOutlines: false,
    showCountyNames: false,
    showInitials: false,
    enableHints: false,
    timeMultiplier: 1.0,
    scoreMultiplier: 2.0,
    rotationEnabled: true
  },
  [DifficultyLevel.EXPERT]: {
    dropZoneTolerance: 25,
    showCountyOutlines: false,
    showCountyNames: false,
    showInitials: false,
    enableHints: false,
    timeMultiplier: 0.8,
    scoreMultiplier: 3.0,
    rotationEnabled: true,
    mapRotation: 15 // Rotate map 15 degrees
  }
};

// Helper function to get county IDs by region
const getCountyIds = (region: CaliforniaRegion): string[] => {
  return getCountiesByRegion(region).map(county => county.id);
};

// Game Mode Configurations
export const GAME_MODES: GameModeConfiguration[] = [
  // Learning Modes
  {
    id: 'bay_area_easy',
    name: 'Bay Area Explorer',
    description: 'Learn the 9 Bay Area counties with helpful guides',
    icon: '🌉',
    category: GameModeCategory.LEARNING,
    difficulty: DifficultyLevel.EASY,
    isLocked: false,
    counties: getCountyIds(CaliforniaRegion.BAY_AREA),
    scoreMultiplier: 1.0,
    showCountyNames: true,
    showHints: true,
    allowRotation: false,
    dropZoneTolerance: 80,
    stars: 0,
    isCompleted: false
  },
  {
    id: 'socal_intro',
    name: 'SoCal Introduction',
    description: 'Discover Southern California\'s major counties',
    icon: '🏖️',
    category: GameModeCategory.LEARNING,
    difficulty: DifficultyLevel.EASY,
    isLocked: false,
    counties: ['los_angeles', 'orange', 'san_diego', 'ventura', 'riverside'],
    scoreMultiplier: 1.2,
    showCountyNames: true,
    showHints: true,
    allowRotation: false,
    dropZoneTolerance: 80,
    stars: 0,
    isCompleted: false
  },
  {
    id: 'central_valley_basics',
    name: 'Central Valley Basics',
    description: 'Master the agricultural heart of California',
    icon: '🌾',
    category: GameModeCategory.LEARNING,
    difficulty: DifficultyLevel.MEDIUM,
    isLocked: false,
    counties: getCountyIds(CaliforniaRegion.CENTRAL_VALLEY),
    scoreMultiplier: 1.3,
    showCountyNames: false,
    showHints: true,
    allowRotation: false,
    dropZoneTolerance: 60,
    stars: 0,
    isCompleted: false
  },

  // Regional Modes
  {
    id: 'bay_area_complete',
    name: 'Bay Area Mastery',
    description: 'Complete all Bay Area counties with precision',
    icon: '🏆',
    category: GameModeCategory.MASTERY,
    difficulty: DifficultyLevel.HARD,
    isLocked: true,
    unlockRequirements: [
      { type: UnlockRequirementType.COMPLETE_MODE, target: 'bay_area_easy' }
    ],
    counties: getCountyIds(CaliforniaRegion.BAY_AREA),
    scoreMultiplier: 2.0,
    showCountyNames: false,
    showHints: false,
    allowRotation: true,
    dropZoneTolerance: 40,
    stars: 0,
    isCompleted: false
  },
  {
    id: 'northern_california',
    name: 'Northern California',
    description: 'Explore the vast northern counties',
    icon: '🏔️',
    category: GameModeCategory.CHALLENGE,
    difficulty: DifficultyLevel.MEDIUM,
    isLocked: true,
    unlockRequirements: [
      { type: UnlockRequirementType.TOTAL_GAMES, target: '', threshold: 5 }
    ],
    counties: getCountiesByRegion(CaliforniaRegion.NORTHERN).map(c => c.id),
    scoreMultiplier: 1.8,
    showCountyNames: false,
    showHints: true,
    allowRotation: false,
    dropZoneTolerance: 50,
    stars: 0,
    isCompleted: false
  },
  {
    id: 'southern_california',
    name: 'Southern California Complete',
    description: 'All of SoCal from coast to desert',
    icon: '🌴',
    category: GameModeCategory.CHALLENGE,
    difficulty: DifficultyLevel.HARD,
    isLocked: true,
    unlockRequirements: [
      { type: UnlockRequirementType.COMPLETE_MODE, target: 'socal_intro' }
    ],
    counties: getCountiesByRegion(CaliforniaRegion.SOUTHERN).map(c => c.id),
    scoreMultiplier: 2.2,
    showCountyNames: false,
    showHints: false,
    allowRotation: true,
    dropZoneTolerance: 35,
    stars: 0,
    isCompleted: false
  },

  // Challenge Modes
  {
    id: 'time_trial_bay',
    name: 'Bay Area Speed Run',
    description: 'Complete Bay Area in under 3 minutes',
    icon: '⚡',
    category: GameModeCategory.CHALLENGE,
    difficulty: DifficultyLevel.MEDIUM,
    isLocked: true,
    unlockRequirements: [
      { type: UnlockRequirementType.COMPLETE_MODE, target: 'bay_area_complete' }
    ],
    counties: getCountyIds(CaliforniaRegion.BAY_AREA),
    timeLimit: 180000, // 3 minutes
    scoreMultiplier: 2.5,
    showCountyNames: false,
    showHints: false,
    allowRotation: false,
    dropZoneTolerance: 50,
    stars: 0,
    isCompleted: false
  },
  {
    id: 'accuracy_challenge',
    name: 'Perfect Placement',
    description: 'No mistakes allowed - be precise!',
    icon: '🎯',
    category: GameModeCategory.CHALLENGE,
    difficulty: DifficultyLevel.HARD,
    isLocked: true,
    unlockRequirements: [
      { type: UnlockRequirementType.ACHIEVE_SCORE, target: '', threshold: 5000 }
    ],
    counties: ['alameda', 'contra_costa', 'marin', 'san_francisco', 'san_mateo'],
    maxMistakes: 0,
    scoreMultiplier: 3.0,
    showCountyNames: false,
    showHints: false,
    allowRotation: false,
    dropZoneTolerance: 30,
    stars: 0,
    isCompleted: false
  },
  {
    id: 'study_first_mode',
    name: 'Study & Play',
    description: 'Learn about counties before placing them',
    icon: '📚',
    category: GameModeCategory.LEARNING,
    difficulty: DifficultyLevel.EASY,
    isLocked: false,
    counties: getCountyIds(CaliforniaRegion.BAY_AREA),
    scoreMultiplier: 1.5,
    showCountyNames: true,
    showHints: true,
    allowRotation: false,
    dropZoneTolerance: 70,
    stars: 0,
    isCompleted: false
  },

  // Progressive Mode
  {
    id: 'progressive_california',
    name: 'Progressive California',
    description: 'Start small, grow to the full state',
    icon: '📈',
    category: GameModeCategory.MASTERY,
    difficulty: DifficultyLevel.MEDIUM,
    isLocked: true,
    unlockRequirements: [
      { type: UnlockRequirementType.TOTAL_GAMES, target: '', threshold: 3 }
    ],
    counties: ['san_francisco', 'alameda', 'santa_clara'], // Starts small, grows
    scoreMultiplier: 2.0,
    showCountyNames: false,
    showHints: true,
    allowRotation: false,
    dropZoneTolerance: 50,
    stars: 0,
    isCompleted: false
  },

  // Full State Modes
  {
    id: 'full_state_medium',
    name: 'California Challenge',
    description: 'All 58 counties - the ultimate test',
    icon: '🐻',
    category: GameModeCategory.MASTERY,
    difficulty: DifficultyLevel.MEDIUM,
    isLocked: true,
    unlockRequirements: [
      { type: UnlockRequirementType.COMPLETE_REGION, target: CaliforniaRegion.BAY_AREA },
      { type: UnlockRequirementType.COMPLETE_REGION, target: CaliforniaRegion.SOUTHERN }
    ],
    counties: CALIFORNIA_COUNTIES.map(c => c.id),
    scoreMultiplier: 3.0,
    showCountyNames: false,
    showHints: true,
    allowRotation: false,
    dropZoneTolerance: 45,
    stars: 0,
    isCompleted: false
  },
  {
    id: 'full_state_expert',
    name: 'California Expert',
    description: 'Master mode - rotated map, no hints, perfect precision',
    icon: '👑',
    category: GameModeCategory.MASTERY,
    difficulty: DifficultyLevel.EXPERT,
    isLocked: true,
    unlockRequirements: [
      { type: UnlockRequirementType.COMPLETE_MODE, target: 'full_state_medium' }
    ],
    counties: CALIFORNIA_COUNTIES.map(c => c.id),
    scoreMultiplier: 5.0,
    showCountyNames: false,
    showHints: false,
    allowRotation: true,
    dropZoneTolerance: 25,
    stars: 0,
    isCompleted: false
  },

  // Special Modes
  {
    id: 'daily_challenge',
    name: 'Daily Challenge',
    description: 'New challenge every day with special rewards',
    icon: '📅',
    category: GameModeCategory.SPECIAL,
    difficulty: DifficultyLevel.MEDIUM,
    isLocked: false,
    counties: [], // Populated daily
    scoreMultiplier: 2.0,
    showCountyNames: false,
    showHints: true,
    allowRotation: false,
    dropZoneTolerance: 50,
    stars: 0,
    isCompleted: false
  },
  {
    id: 'marathon_mode',
    name: 'California Marathon',
    description: 'Complete multiple regions in sequence',
    icon: '🏃',
    category: GameModeCategory.SPECIAL,
    difficulty: DifficultyLevel.HARD,
    isLocked: true,
    unlockRequirements: [
      { type: UnlockRequirementType.TOTAL_GAMES, target: '', threshold: 10 }
    ],
    counties: CALIFORNIA_COUNTIES.map(c => c.id),
    timeLimit: 1800000, // 30 minutes
    scoreMultiplier: 4.0,
    showCountyNames: false,
    showHints: false,
    allowRotation: true,
    dropZoneTolerance: 35,
    stars: 0,
    isCompleted: false
  }
];

// Mode Categories for Organization
export const MODE_CATEGORIES = {
  [GameModeCategory.LEARNING]: {
    name: 'Learning',
    description: 'Perfect for beginners and skill building',
    icon: '🎓',
    color: '#10B981'
  },
  [GameModeCategory.CHALLENGE]: {
    name: 'Challenge',
    description: 'Test your skills with special constraints',
    icon: '⚡',
    color: '#F59E0B'
  },
  [GameModeCategory.MASTERY]: {
    name: 'Mastery',
    description: 'Advanced modes for geography experts',
    icon: '👑',
    color: '#8B5CF6'
  },
  [GameModeCategory.SPECIAL]: {
    name: 'Special',
    description: 'Unique game modes and daily challenges',
    icon: '✨',
    color: '#EF4444'
  }
};

// Star Requirements for Modes
export const STAR_REQUIREMENTS = {
  1: { scoreThreshold: 0.6, accuracyThreshold: 0.7, timeBonus: false },
  2: { scoreThreshold: 0.8, accuracyThreshold: 0.85, timeBonus: false },
  3: { scoreThreshold: 0.95, accuracyThreshold: 0.95, timeBonus: true }
};

// Helper Functions
export const getModeById = (id: string): GameModeConfiguration | undefined => {
  return GAME_MODES.find(mode => mode.id === id);
};

export const getModesByCategory = (category: GameModeCategory): GameModeConfiguration[] => {
  return GAME_MODES.filter(mode => mode.category === category);
};

export const getUnlockedModes = (playerStats: any): GameModeConfiguration[] => {
  return GAME_MODES.filter(mode => {
    if (!mode.isLocked) return true;

    return mode.unlockRequirements?.every(req => {
      switch (req.type) {
        case UnlockRequirementType.COMPLETE_MODE:
          const targetMode = getModeById(req.target);
          return targetMode?.isCompleted || false;

        case UnlockRequirementType.TOTAL_GAMES:
          return playerStats.totalGamesPlayed >= (req.threshold || 0);

        case UnlockRequirementType.ACHIEVE_SCORE:
          return playerStats.bestScore >= (req.threshold || 0);

        case UnlockRequirementType.COMPLETE_REGION:
          // Check if all modes in a region are completed
          return getModesByCategory(GameModeCategory.LEARNING)
            .filter(mode => mode.counties.some(county =>
              getCountiesByRegion(req.target as CaliforniaRegion)
                .map(c => c.id).includes(county)
            ))
            .every(mode => mode.isCompleted);

        default:
          return false;
      }
    }) || false;
  });
};

export const calculateModeStars = (
  mode: GameModeConfiguration,
  score: number,
  accuracy: number,
  completionTime?: number
): number => {
  const maxScore = mode.counties.length * 100 * mode.scoreMultiplier;
  const scoreRatio = score / maxScore;

  let stars = 0;

  // Check for 1 star
  if (scoreRatio >= STAR_REQUIREMENTS[1].scoreThreshold &&
      accuracy >= STAR_REQUIREMENTS[1].accuracyThreshold) {
    stars = 1;
  }

  // Check for 2 stars
  if (scoreRatio >= STAR_REQUIREMENTS[2].scoreThreshold &&
      accuracy >= STAR_REQUIREMENTS[2].accuracyThreshold) {
    stars = 2;
  }

  // Check for 3 stars (includes time bonus consideration)
  if (scoreRatio >= STAR_REQUIREMENTS[3].scoreThreshold &&
      accuracy >= STAR_REQUIREMENTS[3].accuracyThreshold) {
    if (STAR_REQUIREMENTS[3].timeBonus && mode.timeLimit && completionTime) {
      // Must complete in under 80% of time limit for 3 stars
      if (completionTime < mode.timeLimit * 0.8) {
        stars = 3;
      }
    } else {
      stars = 3;
    }
  }

  return stars;
};

export const getDifficultySettings = (difficulty: DifficultyLevel): DifficultySettings => {
  return DIFFICULTY_SETTINGS[difficulty];
};

// Daily Challenge Generator
export const generateDailyChallenge = (date: Date): GameModeConfiguration => {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const seed = dayOfYear % CALIFORNIA_COUNTIES.length;

  // Select 5-8 counties based on the day
  const selectedCounties = CALIFORNIA_COUNTIES
    .slice(seed, seed + 5 + (dayOfYear % 4))
    .map(c => c.id);

  const dailyMode = { ...getModeById('daily_challenge')! };
  dailyMode.counties = selectedCounties;
  dailyMode.description = `Today's challenge: ${selectedCounties.length} counties`;

  return dailyMode;
};