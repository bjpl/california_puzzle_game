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
  placedCounties: CountyPiece[];
  remainingCounties: CountyPiece[];
  currentHint?: County;
  streak: number;
  achievements: Achievement[];
}

export interface GameSettings {
  difficulty: DifficultyLevel;
  region: CaliforniaRegion;
  showHints: boolean;
  enableTimer: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  autoAdvance: boolean;
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
  PRACTICE = 'practice',
  TIMED = 'timed',
  CHALLENGE = 'challenge',
  MARATHON = 'marathon'
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
  onGameComplete?: (finalScore: number, stats: GameStats) => void;
}

// Utility types
export type CountyFilter = (county: County) => boolean;
export type ScoreCalculator = (placement: PlacementResult, multipliers: ScoreMultiplier) => number;
export type GameEventHandler = (event: GameEvent) => void;

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
  SETTINGS_CHANGED = 'settings_changed'
}