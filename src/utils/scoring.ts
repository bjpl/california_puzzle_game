/**
 * Advanced Scoring System for California Puzzle Game
 * Calculates scores based on accuracy, speed, streaks, and difficulty
 */

export interface ScoreModifiers {
  timeBonus: number;
  accuracyMultiplier: number;
  streakBonus: number;
  difficultyMultiplier: number;
  regionalBonus: number;
  perfectPlacementBonus: number;
}

export interface ScoreCalculation {
  basePoints: number;
  timeBonus: number;
  accuracyPoints: number;
  streakPoints: number;
  difficultyPoints: number;
  regionalPoints: number;
  totalPoints: number;
  modifiers: ScoreModifiers;
}

export interface GameMetrics {
  totalTime: number;
  averageTimePerCounty: number;
  accuracy: number;
  currentStreak: number;
  maxStreak: number;
  perfectPlacements: number;
  totalPlacements: number;
  regionsCompleted: Set<string>;
}

export interface DifficultyConfig {
  name: string;
  basePointMultiplier: number;
  timeThresholds: {
    excellent: number; // Under this time = max bonus
    good: number;      // Under this time = good bonus
    average: number;   // Under this time = average bonus
  };
  maxTimeBonus: number;
}

// Difficulty configurations
export const DIFFICULTY_CONFIGS: Record<string, DifficultyConfig> = {
  easy: {
    name: 'Easy',
    basePointMultiplier: 1.0,
    timeThresholds: {
      excellent: 3000,  // 3 seconds
      good: 5000,       // 5 seconds
      average: 8000     // 8 seconds
    },
    maxTimeBonus: 50
  },
  medium: {
    name: 'Medium',
    basePointMultiplier: 1.5,
    timeThresholds: {
      excellent: 2000,  // 2 seconds
      good: 3500,       // 3.5 seconds
      average: 6000     // 6 seconds
    },
    maxTimeBonus: 75
  },
  hard: {
    name: 'Hard',
    basePointMultiplier: 2.0,
    timeThresholds: {
      excellent: 1500,  // 1.5 seconds
      good: 2500,       // 2.5 seconds
      average: 4000     // 4 seconds
    },
    maxTimeBonus: 100
  },
  expert: {
    name: 'Expert',
    basePointMultiplier: 3.0,
    timeThresholds: {
      excellent: 1000,  // 1 second
      good: 1800,       // 1.8 seconds
      average: 3000     // 3 seconds
    },
    maxTimeBonus: 150
  }
};

// Base scoring constants
export const SCORING_CONSTANTS = {
  BASE_POINTS: 100,
  ACCURACY_BONUS_MULTIPLIER: 2.0,
  STREAK_BONUS_BASE: 25,
  STREAK_MULTIPLIER: 1.2,
  REGIONAL_COMPLETION_BONUS: 500,
  PERFECT_PLACEMENT_BONUS: 50,
  MISTAKE_PENALTY: 25,
  MAX_STREAK_MULTIPLIER: 5.0,
  COMBO_THRESHOLD: 3, // Minimum streak for combo bonus
};

/**
 * Calculate time bonus based on placement speed
 */
export function calculateTimeBonus(
  placementTime: number,
  difficulty: DifficultyConfig
): number {
  const { timeThresholds, maxTimeBonus } = difficulty;

  if (placementTime <= timeThresholds.excellent) {
    return maxTimeBonus;
  } else if (placementTime <= timeThresholds.good) {
    return Math.round(maxTimeBonus * 0.7);
  } else if (placementTime <= timeThresholds.average) {
    return Math.round(maxTimeBonus * 0.4);
  } else {
    // Diminishing returns for slower placements
    const overtime = placementTime - timeThresholds.average;
    const penalty = Math.min(overtime / 1000, maxTimeBonus * 0.3);
    return Math.max(0, Math.round(maxTimeBonus * 0.1 - penalty));
  }
}

/**
 * Calculate accuracy multiplier based on placement precision
 */
export function calculateAccuracyMultiplier(
  isCorrectPlacement: boolean,
  placementAccuracy: number = 1.0
): number {
  if (!isCorrectPlacement) {
    return 0;
  }

  // Accuracy should be between 0 and 1, where 1 is perfect placement
  const accuracyBonus = placementAccuracy * SCORING_CONSTANTS.ACCURACY_BONUS_MULTIPLIER;
  return Math.max(1.0, accuracyBonus);
}

/**
 * Calculate streak bonus points
 */
export function calculateStreakBonus(currentStreak: number): number {
  if (currentStreak < SCORING_CONSTANTS.COMBO_THRESHOLD) {
    return 0;
  }

  const baseBonus = SCORING_CONSTANTS.STREAK_BONUS_BASE;
  const streakMultiplier = Math.min(
    Math.pow(SCORING_CONSTANTS.STREAK_MULTIPLIER, currentStreak - SCORING_CONSTANTS.COMBO_THRESHOLD),
    SCORING_CONSTANTS.MAX_STREAK_MULTIPLIER
  );

  return Math.round(baseBonus * streakMultiplier);
}

/**
 * Calculate regional completion bonus
 */
export function calculateRegionalBonus(
  regionName: string,
  completedRegions: Set<string>,
  totalRegionsInGame: number
): number {
  if (!completedRegions.has(regionName)) {
    return 0;
  }

  const baseBonus = SCORING_CONSTANTS.REGIONAL_COMPLETION_BONUS;
  const completionRatio = completedRegions.size / totalRegionsInGame;

  // Bonus increases as you complete more regions
  return Math.round(baseBonus * (1 + completionRatio));
}

/**
 * Main scoring calculation function
 */
export function calculateScore(
  isCorrectPlacement: boolean,
  placementTime: number,
  currentStreak: number,
  difficulty: string = 'medium',
  regionName: string = '',
  completedRegions: Set<string> = new Set(),
  totalRegions: number = 5,
  placementAccuracy: number = 1.0
): ScoreCalculation {
  const difficultyConfig = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.medium;

  // Base points
  const basePoints = SCORING_CONSTANTS.BASE_POINTS * difficultyConfig.basePointMultiplier;

  // Calculate individual components
  const timeBonus = isCorrectPlacement ? calculateTimeBonus(placementTime, difficultyConfig) : 0;
  const accuracyMultiplier = calculateAccuracyMultiplier(isCorrectPlacement, placementAccuracy);
  const streakBonus = calculateStreakBonus(currentStreak);
  const regionalBonus = calculateRegionalBonus(regionName, completedRegions, totalRegions);

  // Perfect placement bonus
  const perfectBonus = (isCorrectPlacement && placementAccuracy >= 0.95)
    ? SCORING_CONSTANTS.PERFECT_PLACEMENT_BONUS : 0;

  // Calculate final components
  const accuracyPoints = Math.round(basePoints * accuracyMultiplier);
  const streakPoints = streakBonus;
  const difficultyPoints = Math.round(basePoints * (difficultyConfig.basePointMultiplier - 1));
  const regionalPoints = regionalBonus;

  // Calculate total
  let totalPoints = 0;
  if (isCorrectPlacement) {
    totalPoints = accuracyPoints + timeBonus + streakPoints + difficultyPoints + regionalPoints + perfectBonus;
  } else {
    // Penalty for incorrect placement
    totalPoints = -SCORING_CONSTANTS.MISTAKE_PENALTY;
  }

  const modifiers: ScoreModifiers = {
    timeBonus: timeBonus,
    accuracyMultiplier: accuracyMultiplier,
    streakBonus: streakBonus,
    difficultyMultiplier: difficultyConfig.basePointMultiplier,
    regionalBonus: regionalBonus,
    perfectPlacementBonus: perfectBonus
  };

  return {
    basePoints: Math.round(basePoints),
    timeBonus,
    accuracyPoints,
    streakPoints,
    difficultyPoints,
    regionalPoints,
    totalPoints,
    modifiers
  };
}

/**
 * Calculate comprehensive game metrics
 */
export function calculateGameMetrics(
  placements: Array<{
    isCorrect: boolean;
    time: number;
    region: string;
  }>,
  totalGameTime: number
): GameMetrics {
  const correctPlacements = placements.filter(p => p.isCorrect);
  const totalPlacements = placements.length;

  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  // Calculate streaks
  for (const placement of placements) {
    if (placement.isCorrect) {
      tempStreak++;
      maxStreak = Math.max(maxStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Current streak is the streak at the end
  for (let i = placements.length - 1; i >= 0; i--) {
    if (placements[i].isCorrect) {
      currentStreak++;
    } else {
      break;
    }
  }

  const accuracy = totalPlacements > 0 ? correctPlacements.length / totalPlacements : 0;
  const averageTimePerCounty = correctPlacements.length > 0
    ? correctPlacements.reduce((sum, p) => sum + p.time, 0) / correctPlacements.length
    : 0;

  const regionsCompleted = new Set(correctPlacements.map(p => p.region));
  const perfectPlacements = correctPlacements.length; // Assuming all correct placements are perfect for now

  return {
    totalTime: totalGameTime,
    averageTimePerCounty,
    accuracy,
    currentStreak,
    maxStreak,
    perfectPlacements,
    totalPlacements,
    regionsCompleted
  };
}

/**
 * Format score for display
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Get score tier based on total score
 */
export function getScoreTier(score: number): { tier: string; color: string; threshold: number } {
  const tiers = [
    { tier: 'Bronze', color: '#CD7F32', threshold: 0 },
    { tier: 'Silver', color: '#C0C0C0', threshold: 5000 },
    { tier: 'Gold', color: '#FFD700', threshold: 15000 },
    { tier: 'Platinum', color: '#E5E4E2', threshold: 30000 },
    { tier: 'Diamond', color: '#B9F2FF', threshold: 50000 },
    { tier: 'Master', color: '#8A2BE2', threshold: 75000 },
    { tier: 'Grandmaster', color: '#FF1493', threshold: 100000 }
  ];

  for (let i = tiers.length - 1; i >= 0; i--) {
    if (score >= tiers[i].threshold) {
      return tiers[i];
    }
  }

  return tiers[0];
}

/**
 * Calculate leaderboard score (normalized score for comparison)
 */
export function calculateLeaderboardScore(
  totalScore: number,
  totalTime: number,
  accuracy: number,
  difficulty: string
): number {
  const difficultyConfig = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.medium;
  const timeWeight = 0.3;
  const accuracyWeight = 0.4;
  const scoreWeight = 0.3;

  // Normalize components (0-1000 each)
  const normalizedScore = Math.min(totalScore / 100, 1000); // Assuming max reasonable score of 10000
  const normalizedTime = Math.max(0, 1000 - (totalTime / 1000)); // Better time = higher score
  const normalizedAccuracy = accuracy * 1000;

  const leaderboardScore = (
    normalizedScore * scoreWeight +
    normalizedTime * timeWeight +
    normalizedAccuracy * accuracyWeight
  ) * difficultyConfig.basePointMultiplier;

  return Math.round(leaderboardScore);
}