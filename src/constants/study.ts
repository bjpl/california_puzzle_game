/**
 * Study Mode Constants
 *
 * Study session configuration and progress tracking
 */

export const STUDY_CONFIG = {
  // Session defaults
  DEFAULT_SESSION_LENGTH: 30, // minutes
  DEFAULT_AVERAGE_TIME: 30, // seconds per county
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds

  // Progress thresholds
  MASTERED_THRESHOLD: 0.9, // 90% accuracy
  MASTERED_MIN_ATTEMPTS: 5,

  STRUGGLING_THRESHOLD: 0.5, // 50% accuracy
  STRUGGLING_MIN_ATTEMPTS: 3,

  // Percentage thresholds for recommendations
  STUDIED_HIGH: 80, // 80% studied
  STUDIED_MEDIUM: 50, // 50% studied
  STUDIED_LOW: 25, // 25% studied

  // Spaced repetition (SM-2 algorithm)
  SR_QUALITY_THRESHOLD: 3, // Quality >= 3 is considered passing
  SR_INTERVAL_FIRST: 1, // days
  SR_INTERVAL_SECOND: 6, // days
  SR_EASE_FACTOR_DEFAULT: 2.5,
  SR_EASE_FACTOR_MIN: 1.3,

  // Study modes
  FLASHCARD_CARDS_PER_SESSION: 20,
  GRID_COUNTIES_PER_SESSION: 15,

  // Achievement thresholds
  STREAK_BRONZE: 3,
  STREAK_SILVER: 7,
  STREAK_GOLD: 30,

  COUNTIES_LEARNED_BRONZE: 10,
  COUNTIES_LEARNED_SILVER: 30,
  COUNTIES_LEARNED_GOLD: 58,
} as const;

export type StudyQuality = 0 | 1 | 2 | 3 | 4 | 5;
