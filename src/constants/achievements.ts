/**
 * Achievement Constants
 *
 * Achievement definitions and point values
 */

export const ACHIEVEMENT_POINTS = {
  FIRST_GAME: 10,
  PERFECT_SCORE: 50,
  ALL_REGIONS: 100,
  STREAK_7_DAYS: 75,
  SPEED_RUN: 30,
  MASTERED_REGION: 40,
  STREAK_10: 50, // 10+ correct placements in a row
} as const;

export const ACHIEVEMENT_THRESHOLDS = {
  PERFECT_ACCURACY: 1, // 100% accuracy
  MIN_STREAK_FOR_BONUS: 10,
  HIGH_SCORE: 10000,
  STREAK_MASTER: 15,
  MIN_SCORE_LEADERBOARD: 500,
} as const;

export const TOTAL_AVAILABLE_ACHIEVEMENTS = 50; // Update as achievements are added

export const ACHIEVEMENT_TIERS = {
  BRONZE: {
    color: '#CD7F32',
    minPoints: 0,
    label: 'Bronze',
  },
  SILVER: {
    color: '#C0C0C0',
    minPoints: 100,
    label: 'Silver',
  },
  GOLD: {
    color: '#FFD700',
    minPoints: 500,
    label: 'Gold',
  },
  PLATINUM: {
    color: '#E5E4E2',
    minPoints: 1000,
    label: 'Platinum',
  },
} as const;

export const LEADERBOARD_CONFIG = {
  MAX_ENTRIES: 100, // Keep top 100 scores
  DEFAULT_LIMIT: 10,
} as const;
