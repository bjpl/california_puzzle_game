/**
 * Scoring Store
 * Manages score calculation, streaks, and statistics
 * Single responsibility: scoring and statistics
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  DifficultyLevel,
  CaliforniaRegion,
  PlacementResult,
  GameStats,
  ScoreMultiplier,
} from '@/types';

export interface ScoringState {
  score: number;
  streak: number;
  mistakes: number;
  stats: GameStats;
}

interface ScoringActions {
  calculateScore: (
    difficulty: DifficultyLevel,
    accuracy: number,
    timeToPlace: number,
    modeMultiplier?: number
  ) => number;
  updateScore: (points: number) => void;
  updateStreak: (isCorrect: boolean) => void;
  updatePlacementStats: (placement: PlacementResult) => void;
  getPersonalBest: (region: CaliforniaRegion, difficulty: DifficultyLevel) => number;
  incrementGamesPlayed: () => void;
  finalizeGame: (timeElapsed: number) => void;
  resetScore: () => void;
}

export type ScoringStore = ScoringState & ScoringActions;

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
  longestStreak: 0,
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
    [DifficultyLevel.EXPERT]: 3.0,
  }[difficulty];

  const speedMultiplier = timeToPlace < 5000 ? 1.5 : timeToPlace < 10000 ? 1.2 : 1.0;
  const streakMultiplier = 1 + Math.min(streak, 10) * 0.1;

  return {
    base: 100,
    accuracy: accuracy,
    speed: speedMultiplier,
    difficulty: difficultyMultiplier,
    streak: streakMultiplier,
    total: 100 * accuracy * speedMultiplier * difficultyMultiplier * streakMultiplier,
  };
};

export const useScoringStore = create<ScoringStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        score: 0,
        streak: 0,
        mistakes: 0,
        stats: defaultStats,

        calculateScore: (
          difficulty: DifficultyLevel,
          accuracy: number,
          timeToPlace: number,
          modeMultiplier: number = 1.0
        ): number => {
          const state = get();
          const multipliers = calculateScoreMultipliers(
            difficulty,
            accuracy,
            timeToPlace,
            state.streak
          );
          return Math.round(multipliers.total * modeMultiplier);
        },

        updateScore: (points: number) => {
          set((state) => ({ score: state.score + points }));
        },

        updateStreak: (isCorrect: boolean) => {
          set((state) => ({
            streak: isCorrect ? state.streak + 1 : 0,
            mistakes: isCorrect ? state.mistakes : state.mistakes + 1,
          }));
        },

        updatePlacementStats: (placement: PlacementResult) => {
          set((state) => {
            const newCountiesLearned = new Set(state.stats.countiesLearned);
            if (placement.isCorrect) {
              newCountiesLearned.add(placement.county.id);
            }

            const totalPlacements = state.stats.totalGamesPlayed * 10;
            const newAverageAccuracy =
              totalPlacements > 0
                ? (state.stats.averageAccuracy * (totalPlacements - 1) + placement.accuracy) /
                  totalPlacements
                : placement.accuracy;

            return {
              stats: {
                ...state.stats,
                averageAccuracy: newAverageAccuracy,
                countiesLearned: newCountiesLearned,
                perfectPlacements:
                  placement.accuracy === 1
                    ? state.stats.perfectPlacements + 1
                    : state.stats.perfectPlacements,
                longestStreak: Math.max(state.stats.longestStreak, state.streak),
              },
            };
          });
        },

        getPersonalBest: (_region: CaliforniaRegion, _difficulty: DifficultyLevel): number => {
          return get().stats.bestScore;
        },

        incrementGamesPlayed: () => {
          set((state) => ({
            stats: {
              ...state.stats,
              totalGamesPlayed: state.stats.totalGamesPlayed + 1,
            },
          }));
        },

        finalizeGame: (timeElapsed: number) => {
          set((state) => ({
            stats: {
              ...state.stats,
              bestScore: Math.max(state.stats.bestScore, state.score),
              totalScore: state.stats.totalScore + state.score,
              totalPlayTime: state.stats.totalPlayTime + timeElapsed,
              longestStreak: Math.max(state.stats.longestStreak, state.streak),
            },
          }));
        },

        resetScore: () => {
          set({
            score: 0,
            streak: 0,
            mistakes: 0,
          });
        },
      }),
      {
        name: 'california-puzzle-scoring',
        partialize: (state) => ({
          stats: state.stats,
        }),
      }
    ),
    { name: 'Scoring' }
  )
);

// Export alias for backward compatibility
export const useStatsStore = useScoringStore;
