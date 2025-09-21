// Study Mode Types for California Counties Game

export type StudyModeType = 'flashcard' | 'map-exploration' | 'grid-study';

export interface StudyProgress {
  totalStudied: number;
  totalCounties: number;
  studiedCounties: Set<string>;
  masteredCounties: Set<string>;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date | null;
  studyStartDate: Date | null;
}

export interface CountyStudyInfo {
  countyId: string;
  timesStudied: number;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  lastStudied: Date | null;
  nextReview: Date | null;
  masteryLevel: number; // 0-100
  streakCount: number;
  incorrectCount: number;
  averageTime: number;
}

export interface SpacedRepetitionItem {
  countyId: string;
  interval: number; // days
  repetitions: number;
  easeFactor: number;
  nextReview: Date;
  lastReview: Date | null;
  quality: number; // 0-5 scale
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  mode: StudyModeType;
  countiesStudied: string[];
  totalTime: number;
  accuracy: number;
  completionRate: number;
}

export interface RegionProgress {
  regionName: string;
  total: number;
  studied: number;
  mastered: number;
  averageTime: number;
  lastStudied: Date | null;
}

export interface StudyStats {
  totalSessions: number;
  totalTimeSpent: number; // minutes
  averageSessionTime: number;
  favoriteMode: StudyModeType | null;
  bestStreak: number;
  countiesPerDay: number;
  weeklyGoal: number;
  weeklyProgress: number;
  achievements: string[];
}

export interface StudyGoal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  description: string;
  deadline: Date;
  completed: boolean;
}

export interface FlashcardSettings {
  autoFlip: boolean;
  flipDelay: number;
  showHints: boolean;
  randomOrder: boolean;
  focusOnWeakAreas: boolean;
  repeatIncorrect: boolean;
}

export interface MapExplorationSettings {
  showLabels: boolean;
  highlightStudied: boolean;
  groupByRegion: boolean;
  showDifficulty: boolean;
  interactiveMode: boolean;
}

export interface GridStudySettings {
  sortBy: 'name' | 'region' | 'difficulty' | 'population' | 'area';
  filterBy: {
    region: string | null;
    difficulty: 'easy' | 'medium' | 'hard' | null;
    studied: boolean | null;
    mastered: boolean | null;
  };
  cardsPerPage: number;
  showDetails: boolean;
}

export interface StudyStore {
  // State
  progress: StudyProgress;
  studyInfo: Map<string, CountyStudyInfo>;
  spacedRepetition: Map<string, SpacedRepetitionItem>;
  sessions: StudySession[];
  goals: StudyGoal[];
  stats: StudyStats;

  // Settings
  flashcardSettings: FlashcardSettings;
  mapSettings: MapExplorationSettings;
  gridSettings: GridStudySettings;

  // Current session
  currentSession: StudySession | null;
  isStudySessionActive: boolean;

  // Actions
  startStudySession: (mode: StudyModeType) => void;
  endStudySession: () => void;
  markCountyAsStudied: (countyId: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  updateSpacedRepetition: (countyId: string, quality: number) => void;
  getNextCountyToStudy: (mode: StudyModeType) => string | null;
  getCountyStudyInfo: (countyId: string) => CountyStudyInfo;
  getRegionProgress: (regionName: string) => RegionProgress;
  getSpacedRepetitionStatus: () => SpacedRepetitionItem[];

  // Progress tracking
  updateProgress: () => void;
  resetProgress: () => void;
  exportProgress: () => string;
  importProgress: (data: string) => void;

  // Goals and achievements
  setGoal: (goal: StudyGoal) => void;
  checkGoalProgress: () => void;
  completeGoal: (goalId: string) => void;

  // Settings
  updateFlashcardSettings: (settings: Partial<FlashcardSettings>) => void;
  updateMapSettings: (settings: Partial<MapExplorationSettings>) => void;
  updateGridSettings: (settings: Partial<GridStudySettings>) => void;
}