/**
 * Game Configuration Constants
 *
 * Core game mechanics, scoring, and difficulty settings
 */

export const GAME_CONFIG = {
  // Map rendering
  MAP_SCALE: 2400,
  MAP_CENTER: [-119.4179, 36.7783] as [number, number],
  MAP_WIDTH: 800,
  MAP_HEIGHT: 600,
  MAP_VIEW_BOX: '0 0 800 600' as const,

  // Timing
  DEFAULT_TIMER_SECONDS: 300, // 5 minutes
  TIMER_WARNING_THRESHOLD: 60, // Show warning at 1 minute

  // Scoring
  PERFECT_SCORE_THRESHOLD: 95,
  GOOD_SCORE_THRESHOLD: 80,
  PASSING_SCORE_THRESHOLD: 60,

  POINTS_PER_CORRECT: 10,
  BASE_POINTS: 100,
  BONUS_PERFECT_PLACEMENT: 5,
  TIME_BONUS_MULTIPLIER: 0.1,

  // Difficulty thresholds
  MISTAKE_THRESHOLD_EXCELLENT: 3,
  MISTAKE_THRESHOLD_GOOD: 6,

  // Game completion
  TOTAL_COUNTIES: 58, // California has 58 counties

  // Difficulty
  EASY_COUNTIES: 30,
  MEDIUM_COUNTIES: 50,
  HARD_COUNTIES: 58, // All counties

  // Hints
  MAX_HINTS_PER_GAME: 3,
  HINT_COST_POINTS: 5,
  HINT_LEVEL_2_ATTEMPTS: 2,
  HINT_LEVEL_3_ATTEMPTS: 3,

  // Formation Animation
  FORMATION_ANIMATION_DURATION: 3000, // ms
  FORMATION_START_YEAR: 1850,
  FORMATION_END_YEAR: 1907,
  FORMATION_FRAME_INTERVAL: 50, // ms
  FORMATION_YEARS_SPAN: 57, // 1907 - 1850
  FORMATION_ORIGINAL_COUNTIES: 27, // Original counties in 1850

  // County identification
  STROKE_WIDTH_DEFAULT: 0.5,
  STROKE_WIDTH_HIGHLIGHTED: 3,
  STROKE_WIDTH_RECENT: 2,
  STROKE_WIDTH_VISIBLE: 1,

  // Drag and drop
  DRAG_ACTIVATION_DISTANCE: 8, // pixels

  // Container sizing
  GAME_CONTAINER_HEIGHT: 520, // pixels
} as const;

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export const GAME_GRADES = {
  PERFECT: {
    label: 'Perfect!',
    emoji: '🏆',
    color: 'text-yellow-500',
    mistakeThreshold: 0,
  },
  EXCELLENT: {
    label: 'Excellent!',
    emoji: '⭐',
    color: 'text-blue-500',
    mistakeThreshold: 3,
  },
  GOOD: {
    label: 'Good Job!',
    emoji: '👍',
    color: 'text-green-500',
    mistakeThreshold: 6,
  },
  COMPLETE: {
    label: 'Complete!',
    emoji: '✅',
    color: 'text-gray-500',
    mistakeThreshold: Infinity,
  },
} as const;
