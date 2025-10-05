/**
 * Constants Index
 *
 * Central export for all application constants
 */

export * from './game';
export * from './study';
export * from './regions';
export * from './ui';
export * from './achievements';

// Re-export common constants for convenience
export { GAME_CONFIG, GAME_GRADES, type GameDifficulty } from './game';
export { STUDY_CONFIG, type StudyQuality } from './study';
export { CALIFORNIA_REGIONS, REGION_COLORS, REGION_COUNTY_COUNTS, TOTAL_REGIONS } from './regions';
export { UI_CONFIG, COUNTY_FILL_COLORS, STROKE_COLORS, OPACITY_VALUES, POPULATION_THRESHOLDS } from './ui';
export { ACHIEVEMENT_POINTS, ACHIEVEMENT_THRESHOLDS, ACHIEVEMENT_TIERS, LEADERBOARD_CONFIG } from './achievements';
