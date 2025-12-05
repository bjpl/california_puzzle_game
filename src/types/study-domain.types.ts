/**
 * Shared Type Definitions for Study Domain Stores
 *
 * This file contains all cross-store interfaces, event types, and shared data structures
 * used across the decomposed study domain stores.
 */

// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

/**
 * Unique identifier for a study session
 */
export type SessionId = string;

/**
 * County code (e.g., "ALA" for Alameda)
 */
export type CountyCode = string;

/**
 * Study mode types
 */
export enum StudyMode {
  FLASHCARDS = 'flashcards',
  MAP_EXPLORATION = 'map-exploration',
  GRID_STUDY = 'grid-study',
  TIMED_CHALLENGE = 'timed-challenge',
}

/**
 * Session state
 */
export enum SessionState {
  IDLE = 'idle',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

/**
 * Goal type classifications
 */
export enum GoalType {
  DAILY_COUNTIES = 'daily-counties',
  WEEKLY_COUNTIES = 'weekly-counties',
  DAILY_SESSIONS = 'daily-sessions',
  MASTERY_STREAK = 'mastery-streak',
  CUSTOM = 'custom',
}

/**
 * Goal status
 */
export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
}

// ============================================================================
// SPACED REPETITION TYPES (SM-2 Algorithm)
// ============================================================================

/**
 * Spaced repetition card state (SuperMemo-2 algorithm)
 */
export interface SpacedRepetitionCard {
  countyCode: CountyCode;
  easeFactor: number; // 1.3 - 2.5+ (difficulty multiplier)
  interval: number; // Days until next review
  repetitions: number; // Successful reviews in a row
  nextReviewDate: Date;
  lastReviewedAt?: Date;
  createdAt: Date;
}

/**
 * Review quality rating (SM-2 algorithm)
 */
export enum ReviewQuality {
  BLACKOUT = 0, // Complete blackout
  INCORRECT_EASY = 1, // Incorrect, but easy to recall
  INCORRECT_HARD = 2, // Incorrect, hard to recall
  CORRECT_HARD = 3, // Correct with difficulty
  CORRECT_HESITATION = 4, // Correct with hesitation
  PERFECT = 5, // Perfect recall
}

/**
 * Review result
 */
export interface ReviewResult {
  countyCode: CountyCode;
  quality: ReviewQuality;
  responseTimeMs: number;
  timestamp: Date;
  sessionId: SessionId;
}

// ============================================================================
// SESSION TYPES
// ============================================================================

/**
 * Active study session
 */
export interface StudySession {
  id: SessionId;
  mode: StudyMode;
  state: SessionState;
  startTime: Date;
  endTime?: Date;
  pausedAt?: Date;
  totalPausedDuration: number; // milliseconds
  settings: SessionSettings;

  // Session metrics
  countiesStudied: CountyCode[];
  correctAnswers: number;
  incorrectAnswers: number;
  totalResponseTimeMs: number;
}

/**
 * Session settings (varies by mode)
 */
export interface SessionSettings {
  mode: StudyMode;
  timerEnabled?: boolean;
  timerDurationSeconds?: number;
  autoAdvance?: boolean;
  shuffleOrder?: boolean;

  // Flashcard-specific
  showHints?: boolean;
  cardCount?: number;

  // Map exploration-specific
  highlightOnHover?: boolean;

  // Grid study-specific
  gridSize?: '3x3' | '4x4' | '5x5';
}

// ============================================================================
// PROGRESS TRACKING TYPES
// ============================================================================

/**
 * County mastery level
 */
export enum MasteryLevel {
  UNKNOWN = 'unknown',
  LEARNING = 'learning',
  FAMILIAR = 'familiar',
  PROFICIENT = 'proficient',
  MASTERED = 'mastered',
}

/**
 * County progress information
 */
export interface CountyProgress {
  countyCode: CountyCode;
  studyCount: number;
  correctCount: number;
  incorrectCount: number;
  averageResponseTimeMs: number;
  masteryLevel: MasteryLevel;
  lastStudiedAt?: Date;
  firstStudiedAt: Date;
}

/**
 * Regional progress (e.g., Bay Area, Southern California)
 */
export interface RegionalProgress {
  regionName: string;
  countyCodes: CountyCode[];
  studiedCount: number;
  totalCount: number;
  masteryPercentage: number;
}

/**
 * Overall study progress
 */
export interface OverallProgress {
  totalCounties: number;
  studiedCounties: number;
  masteredCounties: number;
  currentStreak: number;
  longestStreak: number;
  totalStudySessions: number;
  totalStudyTimeMs: number;
  lastStudyDate?: Date;
}

// ============================================================================
// GOAL TYPES
// ============================================================================

/**
 * Study goal definition
 */
export interface StudyGoal {
  id: string;
  type: GoalType;
  status: GoalStatus;
  targetValue: number;
  currentValue: number;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  completedAt?: Date;

  // Custom goal fields
  customDescription?: string;
  customCriteria?: Record<string, unknown>;
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

/**
 * Session statistics summary
 */
export interface SessionStatistics {
  sessionId: SessionId;
  mode: StudyMode;
  duration: number; // milliseconds
  countiesStudied: number;
  accuracy: number; // 0-100
  averageResponseTimeMs: number;
  perfectRecalls: number;
  difficultRecalls: number;
  incorrectRecalls: number;
}

/**
 * Aggregate statistics (all-time)
 */
export interface AggregateStatistics {
  totalSessions: number;
  totalStudyTimeMs: number;
  totalCountiesStudied: number;
  overallAccuracy: number;
  averageSessionDuration: number;

  // Per-mode breakdown
  modeBreakdown: Record<
    StudyMode,
    {
      sessions: number;
      accuracy: number;
      totalTimeMs: number;
    }
  >;

  // Time-series data for charts
  dailyStudyTime: Array<{ date: string; durationMs: number }>;
  weeklyAccuracy: Array<{ week: string; accuracy: number }>;
}

// ============================================================================
// EVENT TYPES (Event-Driven Coordination)
// ============================================================================

/**
 * All event types for cross-store communication
 */
export enum StudyEventType {
  // Session events
  SESSION_STARTED = 'session:started',
  SESSION_PAUSED = 'session:paused',
  SESSION_RESUMED = 'session:resumed',
  SESSION_COMPLETED = 'session:completed',

  // County study events
  COUNTY_STUDIED = 'county:studied',
  COUNTY_MASTERY_CHANGED = 'county:mastery-changed',

  // Review events (spaced repetition)
  REVIEW_COMPLETED = 'review:completed',
  REVIEW_DUE = 'review:due',

  // Progress events
  PROGRESS_UPDATED = 'progress:updated',
  STREAK_UPDATED = 'streak:updated',
  MILESTONE_REACHED = 'milestone:reached',

  // Goal events
  GOAL_CREATED = 'goal:created',
  GOAL_PROGRESS = 'goal:progress',
  GOAL_COMPLETED = 'goal:completed',
  GOAL_FAILED = 'goal:failed',

  // Statistics events
  STATISTICS_CALCULATED = 'statistics:calculated',
}

/**
 * Event payload interfaces
 */
export interface SessionStartedPayload {
  sessionId: SessionId;
  mode: StudyMode;
  settings: SessionSettings;
  timestamp: Date;
}

export interface SessionPausedPayload {
  sessionId: SessionId;
  timestamp: Date;
}

export interface SessionResumedPayload {
  sessionId: SessionId;
  timestamp: Date;
}

export interface SessionCompletedPayload {
  sessionId: SessionId;
  duration: number;
  countiesStudied: number;
  accuracy: number;
  timestamp: Date;
}

export interface CountyStudiedPayload {
  sessionId: SessionId;
  countyCode: CountyCode;
  correct: boolean;
  responseTimeMs: number;
  timestamp: Date;
}

export interface CountyMasteryChangedPayload {
  countyCode: CountyCode;
  oldLevel: MasteryLevel;
  newLevel: MasteryLevel;
  timestamp: Date;
}

export interface ReviewCompletedPayload {
  review: ReviewResult;
  updatedCard: SpacedRepetitionCard;
}

export interface ReviewDuePayload {
  dueCards: SpacedRepetitionCard[];
  count: number;
}

export interface ProgressUpdatedPayload {
  overallProgress: OverallProgress;
  changedCounties: CountyCode[];
}

export interface StreakUpdatedPayload {
  currentStreak: number;
  longestStreak: number;
  streakBroken: boolean;
}

export interface MilestoneReachedPayload {
  milestoneType: 'counties_studied' | 'mastery_level' | 'study_time' | 'accuracy';
  threshold: number;
  actualValue: number;
  timestamp: Date;
}

export interface GoalCreatedPayload {
  goal: StudyGoal;
}

export interface GoalProgressPayload {
  goalId: string;
  currentValue: number;
  targetValue: number;
  percentComplete: number;
}

export interface GoalCompletedPayload {
  goal: StudyGoal;
  completedAt: Date;
}

export interface GoalFailedPayload {
  goal: StudyGoal;
  reason: string;
}

export interface StatisticsCalculatedPayload {
  sessionStatistics?: SessionStatistics;
  aggregateStatistics?: AggregateStatistics;
}

/**
 * Event payload union type
 */
export type StudyEventPayload =
  | SessionStartedPayload
  | SessionPausedPayload
  | SessionResumedPayload
  | SessionCompletedPayload
  | CountyStudiedPayload
  | CountyMasteryChangedPayload
  | ReviewCompletedPayload
  | ReviewDuePayload
  | ProgressUpdatedPayload
  | StreakUpdatedPayload
  | MilestoneReachedPayload
  | GoalCreatedPayload
  | GoalProgressPayload
  | GoalCompletedPayload
  | GoalFailedPayload
  | StatisticsCalculatedPayload;

/**
 * Type-safe event structure
 */
export interface StudyEvent<T extends StudyEventPayload = StudyEventPayload> {
  type: StudyEventType;
  payload: T;
  timestamp: Date;
  sourceStore: string;
}

// ============================================================================
// PERSISTENCE TYPES
// ============================================================================

/**
 * Serializable snapshot for persistence
 */
export interface StudyStoreSnapshot {
  version: string;
  timestamp: Date;

  sessions: Record<SessionId, StudySession>;
  countyProgress: Record<CountyCode, CountyProgress>;
  spacedRepetitionCards: Record<CountyCode, SpacedRepetitionCard>;
  overallProgress: OverallProgress;
  goals: Record<string, StudyGoal>;
  settings: StudySettingsState;
  statistics: AggregateStatistics;
}

/**
 * Study settings state
 */
export interface StudySettingsState {
  defaultMode: StudyMode;
  defaultSessionSettings: SessionSettings;

  // Spaced repetition configuration
  spacedRepetition: {
    enabled: boolean;
    initialInterval: number; // days
    minEaseFactor: number;
    maxEaseFactor: number;
    easeFactorModifier: number;
  };

  // Notification preferences
  notifications: {
    reviewReminders: boolean;
    goalReminders: boolean;
    milestoneAlerts: boolean;
  };

  // Display preferences
  display: {
    showStatistics: boolean;
    showProgress: boolean;
    theme: 'light' | 'dark' | 'system';
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Store event subscriber function
 */
export type EventSubscriber<T extends StudyEventPayload = StudyEventPayload> = (
  event: StudyEvent<T>
) => void | Promise<void>;

/**
 * Unsubscribe function
 */
export type UnsubscribeFn = () => void;

/**
 * Store persistence adapter
 */
export interface PersistenceAdapter {
  save<T>(key: string, data: T): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// ============================================================================
// DOMAIN STORE INTERFACES (7 Stores)
// ============================================================================

// ============= SESSION STORE =============

/**
 * Session store state interface
 */
export interface SessionStoreState {
  currentSession: StudySession | null;
  isActive: boolean;
  isPaused: boolean;
  pausedDuration: number;
  sessionStartTime: number | null;
}

/**
 * Session store actions interface
 */
export interface SessionStoreActions {
  startSession: (mode: StudyMode, settings?: Partial<SessionSettings>) => string;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => SessionStatistics;
  recordCountyStudied: (countyCode: string, correct: boolean, timeMs: number) => void;
  getNextCounty: () => string | null;
}

/**
 * Complete session store interface
 */
export type SessionStore = SessionStoreState & SessionStoreActions;

// ============= COUNTY PROGRESS STORE =============

/**
 * County-specific study information
 */
export interface CountyStudyInfo {
  countyCode: CountyCode;
  studyCount: number;
  correctCount: number;
  incorrectCount: number;
  averageResponseTimeMs: number;
  masteryLevel: MasteryLevel;
  lastStudiedAt?: Date;
  firstStudiedAt: Date;
}

/**
 * Regional progress summary
 */
export interface RegionProgress {
  regionName: string;
  countyCodes: CountyCode[];
  studiedCount: number;
  totalCount: number;
  masteryPercentage: number;
}

/**
 * County progress store state interface
 */
export interface CountyProgressStoreState {
  countyProgress: Map<string, CountyStudyInfo>;
  lastStudiedCounty: string | null;
}

/**
 * County progress store actions interface
 */
export interface CountyProgressStoreActions {
  recordStudy: (countyCode: string, correct: boolean, timeMs: number) => void;
  getCountyInfo: (countyCode: string) => CountyStudyInfo | undefined;
  getRegionProgress: (regionName: string) => RegionProgress;
  updateMasteryLevel: (countyCode: string, level: number) => void;
  getMasteredCounties: () => string[];
  getStudiedCounties: () => string[];
}

/**
 * Complete county progress store interface
 */
export type CountyProgressStore = CountyProgressStoreState & CountyProgressStoreActions;

// ============= SPACED REPETITION STORE =============

/**
 * Spaced repetition item (SuperMemo-2 algorithm)
 */
export interface SpacedRepetitionItem {
  countyCode: CountyCode;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  lastReviewedAt?: Date;
  createdAt: Date;
}

/**
 * Spaced repetition store state interface
 */
export interface SpacedRepetitionStoreState {
  cards: Map<string, SpacedRepetitionItem>;
  reviewQueue: string[];
}

/**
 * Spaced repetition store actions interface
 */
export interface SpacedRepetitionStoreActions {
  recordReview: (countyCode: string, quality: number) => SpacedRepetitionItem;
  getDueCards: () => SpacedRepetitionItem[];
  getNextReviewDate: (countyCode: string) => Date | null;
  calculateNextInterval: (item: SpacedRepetitionItem, quality: number) => number;
  getCard: (countyCode: string) => SpacedRepetitionItem | undefined;
}

/**
 * Complete spaced repetition store interface
 */
export type SpacedRepetitionStore = SpacedRepetitionStoreState & SpacedRepetitionStoreActions;

// ============= PROGRESS STORE =============

/**
 * Overall study progress
 */
export interface StudyProgress {
  totalStudied: number;
  totalCounties: number;
  studiedCounties: Set<string>;
  masteredCounties: Set<string>;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  studyStartDate: string | null;
}

/**
 * Progress store state interface
 */
export interface ProgressStoreState {
  totalStudied: number;
  totalCounties: number;
  studiedCounties: Set<string>;
  masteredCounties: Set<string>;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  studyStartDate: string | null;
}

/**
 * Progress store actions interface
 */
export interface ProgressStoreActions {
  incrementStudied: (countyCode: string) => void;
  markMastered: (countyCode: string) => void;
  updateStreak: () => void;
  checkMilestones: () => string[];
  resetProgress: () => void;
  getProgress: () => StudyProgress;
}

/**
 * Complete progress store interface
 */
export type ProgressStore = ProgressStoreState & ProgressStoreActions;

// ============= GOALS STORE =============

/**
 * Goals store state interface
 */
export interface GoalsStoreState {
  goals: Map<string, StudyGoal>;
  activeGoalIds: string[];
  completedGoalIds: string[];
}

/**
 * Goals store actions interface
 */
export interface GoalsStoreActions {
  createGoal: (goal: Omit<StudyGoal, 'id' | 'createdAt'>) => string;
  updateGoalProgress: (goalId: string, progress: number) => void;
  completeGoal: (goalId: string) => void;
  deleteGoal: (goalId: string) => void;
  checkAllGoals: () => string[];
  getActiveGoals: () => StudyGoal[];
}

/**
 * Complete goals store interface
 */
export type GoalsStore = GoalsStoreState & GoalsStoreActions;

// ============= STATISTICS STORE =============

/**
 * Chart data point for time-series data
 */
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

/**
 * Statistics store state interface
 */
export interface StatisticsStoreState {
  totalSessions: number;
  totalTimeSpent: number;
  averageSessionTime: number;
  favoriteMode: StudyMode | null;
  bestStreak: number;
  countiesPerDay: number;
  weeklyGoal: number;
  weeklyProgress: number;
  achievements: string[];
  sessionHistory: SessionStatistics[];
}

/**
 * Statistics store actions interface
 */
export interface StatisticsStoreActions {
  recordSession: (stats: SessionStatistics) => void;
  addAchievement: (achievement: string) => void;
  updateWeeklyProgress: (count: number) => void;
  getTimeSeriesData: (period: 'day' | 'week' | 'month') => ChartDataPoint[];
  recalculateAggregates: () => void;
}

/**
 * Complete statistics store interface
 */
export type StatisticsStore = StatisticsStoreState & StatisticsStoreActions;

// ============= SETTINGS STORE =============

/**
 * Flashcard settings
 */
export interface FlashcardSettings {
  showHints: boolean;
  autoAdvance: boolean;
  cardCount: number;
  shuffleOrder: boolean;
}

/**
 * Map exploration settings
 */
export interface MapExplorationSettings {
  highlightOnHover: boolean;
  showLabels: boolean;
  enableZoom: boolean;
}

/**
 * Grid study settings
 */
export interface GridStudySettings {
  gridSize: '3x3' | '4x4' | '5x5';
  randomizePositions: boolean;
  showProgress: boolean;
}

/**
 * Settings store state interface
 */
export interface SettingsStoreState {
  flashcard: FlashcardSettings;
  mapExploration: MapExplorationSettings;
  gridStudy: GridStudySettings;
}

/**
 * Settings store actions interface
 */
export interface SettingsStoreActions {
  updateFlashcardSettings: (settings: Partial<FlashcardSettings>) => void;
  updateMapSettings: (settings: Partial<MapExplorationSettings>) => void;
  updateGridSettings: (settings: Partial<GridStudySettings>) => void;
  resetToDefaults: () => void;
}

/**
 * Complete settings store interface
 */
export type SettingsStore = SettingsStoreState & SettingsStoreActions;
