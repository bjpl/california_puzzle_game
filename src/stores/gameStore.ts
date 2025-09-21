import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  GameState,
  GameSettings,
  CountyPiece,
  County,
  PlacementResult,
  Achievement,
  GameStats,
  DifficultyLevel,
  CaliforniaRegion,
  Position,
  ScoreMultiplier,
  AchievementCategory
} from '@/types';

interface GameStore extends GameState {
  // Settings
  settings: GameSettings;
  stats: GameStats;

  // Actions
  startGame: (region?: CaliforniaRegion, difficulty?: DifficultyLevel) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;

  // County placement
  placeCounty: (county: CountyPiece, position: Position) => PlacementResult;
  removeCounty: (countyId: string) => void;
  moveCounty: (countyId: string, position: Position) => void;

  // Scoring
  calculateScore: (placement: PlacementResult) => number;
  updateScore: (points: number) => void;
  updateStreak: (isCorrect: boolean) => void;

  // Achievements
  checkAchievements: (placement?: PlacementResult) => Achievement[];
  unlockAchievement: (achievementId: string) => void;

  // Settings
  updateSettings: (newSettings: Partial<GameSettings>) => void;

  // Timer
  updateTimer: (deltaTime: number) => void;

  // Hints
  getHint: () => County | null;
  useHint: () => void;

  // Statistics
  updateStats: (placement: PlacementResult) => void;
  getPersonalBest: (region: CaliforniaRegion, difficulty: DifficultyLevel) => number;
}

const defaultSettings: GameSettings = {
  difficulty: DifficultyLevel.EASY,
  region: CaliforniaRegion.BAY_AREA,
  showHints: true,
  enableTimer: true,
  soundEnabled: true,
  animationsEnabled: true,
  autoAdvance: false
};

const defaultStats: GameStats = {
  totalGamesPlayed: 0,
  totalScore: 0,
  bestScore: 0,
  averageAccuracy: 0,
  totalPlayTime: 0,
  favoriteDifficulty: DifficultyLevel.EASY,
  favoriteRegion: CaliforniaRegion.BAY_AREA,
  countiesLearned: new Set(),
  perfectPlacements: 0,
  longestStreak: 0
};

const achievements: Achievement[] = [
  {
    id: 'first_county',
    name: 'First Steps',
    description: 'Place your first county correctly',
    icon: '🎯',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.COMPLETION
  },
  {
    id: 'perfect_placement',
    name: 'Bullseye',
    description: 'Place a county with 100% accuracy',
    icon: '🎯',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.ACCURACY
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Place a county in under 3 seconds',
    icon: '⚡',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.SPEED
  },
  {
    id: 'bay_area_master',
    name: 'Bay Area Master',
    description: 'Complete Bay Area on Expert difficulty',
    icon: '🌉',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.COMPLETION
  },
  {
    id: 'streak_10',
    name: 'On Fire',
    description: 'Get a 10-county streak',
    icon: '🔥',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.STREAK
  },
  {
    id: 'california_expert',
    name: 'California Expert',
    description: 'Complete all regions on Expert difficulty',
    icon: '🏆',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.COMPLETION
  }
];

const calculatePlacementAccuracy = (
  targetPosition: Position,
  actualPosition: Position,
  tolerance: number = 50
): number => {
  const distance = Math.sqrt(
    Math.pow(targetPosition.x - actualPosition.x, 2) +
    Math.pow(targetPosition.y - actualPosition.y, 2)
  );

  if (distance <= tolerance) {
    return Math.max(0, 1 - (distance / tolerance));
  }
  return 0;
};

const calculateScoreMultipliers = (
  difficulty: DifficultyLevel,
  accuracy: number,
  timeToPlace: number,
  streak: number
): ScoreMultiplier => {
  const difficultyMultiplier = {
    [DifficultyLevel.EASY]: 1.0,
    [DifficultyLevel.MEDIUM]: 1.5,
    [DifficultyLevel.HARD]: 2.0,
    [DifficultyLevel.EXPERT]: 3.0
  }[difficulty];

  const speedMultiplier = timeToPlace < 5000 ? 1.5 :
                         timeToPlace < 10000 ? 1.2 : 1.0;

  const streakMultiplier = 1 + (Math.min(streak, 10) * 0.1);

  return {
    base: 100,
    accuracy: accuracy,
    speed: speedMultiplier,
    difficulty: difficultyMultiplier,
    streak: streakMultiplier,
    total: 100 * accuracy * speedMultiplier * difficultyMultiplier * streakMultiplier
  };
};

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentLevel: 1,
        score: 0,
        timeElapsed: 0,
        isGameActive: false,
        isPaused: false,
        difficulty: DifficultyLevel.EASY,
        selectedRegion: CaliforniaRegion.BAY_AREA,
        placedCounties: [],
        remainingCounties: [],
        currentHint: undefined,
        streak: 0,
        achievements: achievements,
        settings: defaultSettings,
        stats: defaultStats,

        // Game control actions
        startGame: (region = CaliforniaRegion.BAY_AREA, difficulty = DifficultyLevel.EASY) => {
          set((state) => ({
            isGameActive: true,
            isPaused: false,
            selectedRegion: region,
            difficulty: difficulty,
            score: 0,
            timeElapsed: 0,
            streak: 0,
            placedCounties: [],
            currentHint: undefined,
            stats: {
              ...state.stats,
              totalGamesPlayed: state.stats.totalGamesPlayed + 1
            }
          }));
        },

        pauseGame: () => {
          set({ isPaused: true });
        },

        resumeGame: () => {
          set({ isPaused: false });
        },

        endGame: () => {
          const state = get();
          set({
            isGameActive: false,
            isPaused: false,
            stats: {
              ...state.stats,
              bestScore: Math.max(state.stats.bestScore, state.score),
              totalScore: state.stats.totalScore + state.score,
              totalPlayTime: state.stats.totalPlayTime + state.timeElapsed,
              longestStreak: Math.max(state.stats.longestStreak, state.streak)
            }
          });
        },

        resetGame: () => {
          set({
            currentLevel: 1,
            score: 0,
            timeElapsed: 0,
            isGameActive: false,
            isPaused: false,
            placedCounties: [],
            remainingCounties: [],
            currentHint: undefined,
            streak: 0
          });
        },

        // County placement actions
        placeCounty: (county: CountyPiece, position: Position): PlacementResult => {
          const state = get();
          const accuracy = calculatePlacementAccuracy(county.targetPosition, position);
          const isCorrect = accuracy > 0.8; // 80% accuracy threshold
          const timeToPlace = state.timeElapsed; // This would need proper timing logic

          const multipliers = calculateScoreMultipliers(
            state.difficulty,
            accuracy,
            timeToPlace,
            state.streak
          );

          const scoreAwarded = Math.round(multipliers.total);

          const result: PlacementResult = {
            county: county,
            accuracy,
            distance: Math.sqrt(
              Math.pow(county.targetPosition.x - position.x, 2) +
              Math.pow(county.targetPosition.y - position.y, 2)
            ),
            isCorrect,
            scoreAwarded,
            timeToPlace
          };

          // Update game state
          set((prevState) => ({
            placedCounties: [...prevState.placedCounties, {
              ...county,
              isPlaced: true,
              currentPosition: position
            }],
            remainingCounties: prevState.remainingCounties.filter(c => c.id !== county.id),
            score: prevState.score + scoreAwarded,
            streak: isCorrect ? prevState.streak + 1 : 0
          }));

          // Update stats and check achievements
          get().updateStats(result);
          get().checkAchievements(result);

          return result;
        },

        removeCounty: (countyId: string) => {
          set((state) => {
            const county = state.placedCounties.find(c => c.id === countyId);
            if (!county) return state;

            return {
              placedCounties: state.placedCounties.filter(c => c.id !== countyId),
              remainingCounties: [...state.remainingCounties, {
                ...county,
                isPlaced: false
              }]
            };
          });
        },

        moveCounty: (countyId: string, position: Position) => {
          set((state) => ({
            placedCounties: state.placedCounties.map(county =>
              county.id === countyId
                ? { ...county, currentPosition: position }
                : county
            )
          }));
        },

        // Scoring actions
        calculateScore: (placement: PlacementResult): number => {
          const state = get();
          const multipliers = calculateScoreMultipliers(
            state.difficulty,
            placement.accuracy,
            placement.timeToPlace,
            state.streak
          );
          return Math.round(multipliers.total);
        },

        updateScore: (points: number) => {
          set((state) => ({ score: state.score + points }));
        },

        updateStreak: (isCorrect: boolean) => {
          set((state) => ({
            streak: isCorrect ? state.streak + 1 : 0
          }));
        },

        // Achievement system
        checkAchievements: (placement?: PlacementResult): Achievement[] => {
          const state = get();
          const newlyUnlocked: Achievement[] = [];

          const updatedAchievements = state.achievements.map(achievement => {
            if (achievement.isUnlocked) return achievement;

            let shouldUnlock = false;
            let newProgress = achievement.progress;

            switch (achievement.id) {
              case 'first_county':
                if (placement?.isCorrect) {
                  shouldUnlock = true;
                  newProgress = 1;
                }
                break;
              case 'perfect_placement':
                if (placement?.accuracy === 1) {
                  shouldUnlock = true;
                  newProgress = 1;
                }
                break;
              case 'speed_demon':
                if (placement && placement.timeToPlace < 3000) {
                  shouldUnlock = true;
                  newProgress = 1;
                }
                break;
              case 'streak_10':
                newProgress = Math.min(state.streak / 10, 1);
                if (state.streak >= 10) shouldUnlock = true;
                break;
              case 'bay_area_master':
                if (state.selectedRegion === CaliforniaRegion.BAY_AREA &&
                    state.difficulty === DifficultyLevel.EXPERT &&
                    state.remainingCounties.length === 0) {
                  shouldUnlock = true;
                  newProgress = 1;
                }
                break;
            }

            const updated = {
              ...achievement,
              progress: newProgress,
              isUnlocked: shouldUnlock,
              unlockedAt: shouldUnlock ? new Date() : achievement.unlockedAt
            };

            if (shouldUnlock && !achievement.isUnlocked) {
              newlyUnlocked.push(updated);
            }

            return updated;
          });

          set({ achievements: updatedAchievements });
          return newlyUnlocked;
        },

        unlockAchievement: (achievementId: string) => {
          set((state) => ({
            achievements: state.achievements.map(achievement =>
              achievement.id === achievementId
                ? { ...achievement, isUnlocked: true, progress: 1, unlockedAt: new Date() }
                : achievement
            )
          }));
        },

        // Settings management
        updateSettings: (newSettings: Partial<GameSettings>) => {
          set((state) => ({
            settings: { ...state.settings, ...newSettings }
          }));
        },

        // Timer
        updateTimer: (deltaTime: number) => {
          set((state) => ({
            timeElapsed: state.timeElapsed + deltaTime
          }));
        },

        // Hint system
        getHint: (): County | null => {
          const state = get();
          if (!state.settings.showHints || state.remainingCounties.length === 0) {
            return null;
          }
          return state.remainingCounties[0];
        },

        useHint: () => {
          const hint = get().getHint();
          if (hint) {
            set({ currentHint: hint });
          }
        },

        // Statistics
        updateStats: (placement: PlacementResult) => {
          set((state) => {
            const newCountiesLearned = new Set(state.stats.countiesLearned);
            if (placement.isCorrect) {
              newCountiesLearned.add(placement.county.id);
            }

            const totalPlacements = state.stats.totalGamesPlayed * 10; // Rough estimate
            const newAverageAccuracy = totalPlacements > 0
              ? (state.stats.averageAccuracy * (totalPlacements - 1) + placement.accuracy) / totalPlacements
              : placement.accuracy;

            return {
              stats: {
                ...state.stats,
                averageAccuracy: newAverageAccuracy,
                countiesLearned: newCountiesLearned,
                perfectPlacements: placement.accuracy === 1
                  ? state.stats.perfectPlacements + 1
                  : state.stats.perfectPlacements
              }
            };
          });
        },

        getPersonalBest: (region: CaliforniaRegion, difficulty: DifficultyLevel): number => {
          // This would typically be stored in more detailed stats
          // For now, return the overall best score
          return get().stats.bestScore;
        }
      }),
      {
        name: 'california-puzzle-game',
        partialize: (state) => ({
          settings: state.settings,
          stats: state.stats,
          achievements: state.achievements
        })
      }
    ),
    { name: 'CaliforniaPuzzleGame' }
  )
);