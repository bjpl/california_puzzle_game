// Core game types for California Counties Puzzle
export interface County {
  id: string;
  name: string;
  fips: string;
  region: CaliforniaRegion;
  population?: number;
  area?: number;
  geometry: GeoJSON.Geometry;
  centroid: [number, number];
  difficulty: DifficultyLevel;
}

export interface CountyPiece extends County {
  isPlaced: boolean;
  currentPosition: Position;
  targetPosition: Position;
  rotation: number;
  scale: number;
  zIndex: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface PlacementResult {
  county: County;
  accuracy: number; // 0-1, where 1 is perfect placement
  distance: number; // pixels from correct position
  isCorrect: boolean;
  scoreAwarded: number;
  timeToPlace: number; // milliseconds
}

export interface GameState {
  currentLevel: number;
  score: number;
  timeElapsed: number;
  isGameActive: boolean;
  isPaused: boolean;
  difficulty: DifficultyLevel;
  selectedRegion: CaliforniaRegion;
  currentMode: GameModeConfiguration;
  placedCounties: CountyPiece[];
  remainingCounties: CountyPiece[];
  currentHint?: County;
  streak: number;
  mistakes: number;
  achievements: Achievement[];
  hintSystem: HintSystemState;
}

export interface GameSettings {
  difficulty: DifficultyLevel;
  region: CaliforniaRegion;
  showHints: boolean;
  enableTimer: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  autoAdvance: boolean;
  hintSettings: HintConfiguration;
  soundSettings: SoundSettings;
}

export interface SoundSettings {
  masterVolume: number; // 0-1
  effectsVolume: number; // 0-1
  musicVolume: number; // 0-1
  muted: boolean;
  enableBackgroundMusic: boolean;
  enableClickSounds: boolean;
  enableGameSounds: boolean;
  enableAchievementSounds: boolean;
}

export enum DifficultyLevel {
  EASY = 'easy',        // Large counties only, with outlines
  MEDIUM = 'medium',    // All counties, with hints
  HARD = 'hard',        // All counties, no hints
  EXPERT = 'expert'     // All counties, rotated pieces, no hints
}

export enum CaliforniaRegion {
  ALL = 'all',
  NORTHERN = 'northern',
  CENTRAL = 'central',
  SOUTHERN = 'southern',
  BAY_AREA = 'bay_area',
  CENTRAL_VALLEY = 'central_valley',
  COASTAL = 'coastal',
  INLAND = 'inland'
}

export enum GameMode {
  // Core Modes
  FULL_STATE = 'full_state',
  REGIONAL = 'regional',
  PROGRESSIVE = 'progressive',

  // Challenge Modes
  TIME_TRIAL = 'time_trial',
  ACCURACY_CHALLENGE = 'accuracy_challenge',
  STUDY_FIRST = 'study_first',

  // Special Modes
  PRACTICE = 'practice',
  MARATHON = 'marathon',
  DAILY_CHALLENGE = 'daily_challenge'
}

export interface GameModeConfiguration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: GameModeCategory;
  difficulty: DifficultyLevel;
  isLocked: boolean;
  unlockRequirements?: UnlockRequirement[];

  // Game Settings
  counties: string[]; // County IDs to include
  timeLimit?: number; // milliseconds
  maxMistakes?: number;
  scoreMultiplier: number;

  // Visual Settings
  showCountyNames: boolean;
  showHints: boolean;
  allowRotation: boolean;
  dropZoneTolerance: number; // pixels

  // Progression
  stars: number; // 1-3 stars earned
  bestScore?: number;
  completionTime?: number;
  isCompleted: boolean;
}

export enum GameModeCategory {
  LEARNING = 'learning',
  CHALLENGE = 'challenge',
  MASTERY = 'mastery',
  SPECIAL = 'special'
}

export interface UnlockRequirement {
  type: UnlockRequirementType;
  target: string; // mode ID, region, or achievement ID
  threshold?: number; // score, time, or accuracy required
}

export enum UnlockRequirementType {
  COMPLETE_MODE = 'complete_mode',
  ACHIEVE_SCORE = 'achieve_score',
  COMPLETE_REGION = 'complete_region',
  EARN_ACHIEVEMENT = 'earn_achievement',
  TOTAL_GAMES = 'total_games'
}

export interface DifficultySettings {
  dropZoneTolerance: number;
  showCountyOutlines: boolean;
  showCountyNames: boolean;
  showInitials: boolean;
  enableHints: boolean;
  timeMultiplier: number;
  scoreMultiplier: number;
  rotationEnabled: boolean;
  mapRotation?: number; // degrees
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number; // 0-1
  isUnlocked: boolean;
  category: AchievementCategory;
}

export enum AchievementCategory {
  ACCURACY = 'accuracy',
  SPEED = 'speed',
  COMPLETION = 'completion',
  STREAK = 'streak',
  EXPLORATION = 'exploration'
}

export interface ScoreMultiplier {
  base: number;
  accuracy: number;
  speed: number;
  difficulty: number;
  streak: number;
  total: number;
}

export interface GameStats {
  totalGamesPlayed: number;
  totalScore: number;
  bestScore: number;
  averageAccuracy: number;
  totalPlayTime: number; // milliseconds
  favoriteDifficulty: DifficultyLevel;
  favoriteRegion: CaliforniaRegion;
  countiesLearned: Set<string>;
  perfectPlacements: number;
  longestStreak: number;
}

export interface DragState {
  isDragging: boolean;
  draggedCounty?: CountyPiece;
  startPosition: Position;
  currentPosition: Position;
  offset: Position;
}

export interface DropZone {
  id: string;
  bounds: DOMRect;
  targetCounty: County;
  tolerance: number; // pixels
  isActive: boolean;
}

// D3.js specific types
export interface MapProjection {
  california: d3.GeoProjection;
  bounds: [[number, number], [number, number]];
  scale: number;
  center: [number, number];
}

export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
  minScale: number;
  maxScale: number;
}

// Component prop types
export interface CaliforniaMapCanvasProps {
  width: number;
  height: number;
  counties: County[];
  placedCounties: CountyPiece[];
  onCountyDrop: (county: CountyPiece, position: Position) => void;
  showHints: boolean;
  difficulty: DifficultyLevel;
}

export interface CountyTrayProps {
  counties: CountyPiece[];
  onCountyDrag: (county: CountyPiece) => void;
  onCountyDragEnd: (county: CountyPiece, position: Position) => void;
  difficulty: DifficultyLevel;
}

export interface RegionSelectorProps {
  selectedRegion: CaliforniaRegion;
  onRegionChange: (region: CaliforniaRegion) => void;
  disabled?: boolean;
}

export interface GameContainerProps {
  initialSettings?: Partial<GameSettings>;
  initialMode?: GameModeConfiguration;
  onGameComplete?: (finalScore: number, stats: GameStats) => void;
  onModeChange?: (mode: GameModeConfiguration) => void;
}

export interface GameModeSelectorProps {
  availableModes: GameModeConfiguration[];
  onModeSelect: (mode: GameModeConfiguration) => void;
  playerStats: GameStats;
  className?: string;
}

export interface ModeCardProps {
  mode: GameModeConfiguration;
  isSelected?: boolean;
  isLocked?: boolean;
  onSelect: (mode: GameModeConfiguration) => void;
  className?: string;
}

// Hint System Types
export interface HintSystemState {
  availableHints: number;
  usedHints: number;
  currentHintType?: HintType;
  hintProgress: number; // 0-1 for progressive revealing
  cooldownTimeRemaining: number;
  lastHintUsedAt?: number;
  strugglingCounties: StruggleData[];
  autoSuggestEnabled: boolean;
}

export interface HintConfiguration {
  maxHintsPerLevel: number;
  hintCooldownMs: number;
  scorePenaltyPerHint: number;
  freeHintsAllowed: number;
  autoSuggestThreshold: number; // failed attempts before auto-suggest
  enableVisualIndicators: boolean;
  enableEducationalHints: boolean;
}

export enum HintType {
  LOCATION = 'location',
  NAME = 'name',
  SHAPE = 'shape',
  NEIGHBOR = 'neighbor',
  FACT = 'fact',
  EDUCATIONAL = 'educational'
}

export interface Hint {
  id: string;
  type: HintType;
  countyId: string;
  content: string;
  visualData?: HintVisualData;
  educationalValue: number; // 1-5 rating
  difficulty: DifficultyLevel;
  unlockProgress: number; // 0-1 for progressive revealing
}

export interface HintVisualData {
  highlightArea?: {
    center: Position;
    radius: number;
    opacity: number;
  };
  pulseAnimation?: {
    duration: number;
    intensity: number;
  };
  arrow?: {
    from: Position;
    to: Position;
    style: 'curved' | 'straight';
  };
  spotlight?: {
    center: Position;
    radius: number;
    fadeEdge: number;
  };
}

export interface StruggleData {
  countyId: string;
  attempts: number;
  lastAttemptAt: number;
  totalTimeSpent: number;
  wrongPlacements: Position[];
  suggestedHints: HintType[];
}

export interface HintSystemProps {
  gameState: GameState;
  onHintRequested: (type: HintType) => void;
  onHintDismissed: () => void;
  className?: string;
}

// Utility types
export type CountyFilter = (county: County) => boolean;
export type ScoreCalculator = (placement: PlacementResult, multipliers: ScoreMultiplier) => number;
export type GameEventHandler = (event: GameEvent) => void;
export type HintGenerator = (county: County, type: HintType, progress: number) => Hint;
export type StruggleAnalyzer = (county: County, attempts: number, timeSpent: number) => HintType[];

export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  data: any;
}

export enum GameEventType {
  GAME_START = 'game_start',
  GAME_PAUSE = 'game_pause',
  GAME_RESUME = 'game_resume',
  GAME_END = 'game_end',
  COUNTY_PLACED = 'county_placed',
  COUNTY_REMOVED = 'county_removed',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  LEVEL_COMPLETE = 'level_complete',
  HINT_USED = 'hint_used',
  HINT_SUGGESTED = 'hint_suggested',
  HINT_EXHAUSTED = 'hint_exhausted',
  SETTINGS_CHANGED = 'settings_changed'
}