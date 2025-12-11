/**
 * @fileoverview Aggregate Statistics Store
 * @module stores/study/statisticsStore
 * @description Tracks aggregate study statistics across all sessions including
 * total time spent, session counts, favorite modes, and achievements.
 * Maintains session history for trend analysis and recalculates aggregates automatically.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { StudyStats, StudyModeType } from '../../types/study';

/**
 * Record of a completed study session for history tracking
 */
interface SessionRecord {
  /** Unique session identifier */
  sessionId: string;
  /** Study mode used during session */
  mode: StudyModeType;
  /** Session duration in milliseconds */
  duration: number;
  /** Number of counties studied */
  countiesStudied: number;
  /** Number of correct answers */
  correctCount: number;
  /** Accuracy percentage (0-1) */
  accuracy: number;
  /** Unix timestamp of session completion */
  timestamp: number;
}

/**
 * Statistics state extending base StudyStats
 */
interface StatisticsState extends StudyStats {
  /** History of all completed sessions */
  sessionHistory: SessionRecord[];
}

/**
 * Statistics management actions
 */
interface StatisticsActions {
  /** Record a completed session and update aggregates */
  recordSession: (stats: SessionRecord) => void;
  /** Add a new achievement badge */
  addAchievement: (achievement: string) => void;
  /** Update weekly progress counter */
  updateWeeklyProgress: (count: number) => void;
  /** Recalculate aggregate statistics from session history */
  recalculateAggregates: () => void;
}

const defaultStats: StudyStats = {
  totalSessions: 0,
  totalTimeSpent: 0,
  averageSessionTime: 0,
  favoriteMode: null,
  bestStreak: 0,
  countiesPerDay: 0,
  weeklyGoal: 10,
  weeklyProgress: 0,
  achievements: [],
};

export const useStatisticsStore = create<StatisticsState & StatisticsActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultStats,
        sessionHistory: [],

        /**
         * Record a completed session and update aggregate statistics
         * Automatically recalculates favorite mode and counties per day
         * @param {SessionRecord} stats - Session statistics to record
         * @example
         * recordSession({
         *   sessionId: 'session-123',
         *   mode: 'flashcard',
         *   duration: 300000, // 5 minutes
         *   countiesStudied: 10,
         *   correctCount: 8,
         *   accuracy: 0.8,
         *   timestamp: Date.now()
         * });
         */
        recordSession: (stats: SessionRecord) => {
          set((state) => {
            const newHistory = [...state.sessionHistory, stats];
            const totalSessions = state.totalSessions + 1;
            const totalTimeSpent = state.totalTimeSpent + stats.duration;

            return {
              sessionHistory: newHistory,
              totalSessions,
              totalTimeSpent,
              averageSessionTime: totalTimeSpent / totalSessions,
            };
          });

          get().recalculateAggregates();
        },

        /**
         * Add a new achievement badge (ensures uniqueness)
         * @param {string} achievement - Achievement name or description
         */
        addAchievement: (achievement: string) => {
          set((state) => ({
            achievements: [...new Set([...state.achievements, achievement])],
          }));
        },

        /**
         * Increment the weekly progress counter
         * @param {number} count - Number of items to add to weekly progress
         */
        updateWeeklyProgress: (count: number) => {
          set((state) => ({
            weeklyProgress: state.weeklyProgress + count,
          }));
        },

        /**
         * Recalculate aggregate statistics from session history
         * Computes favorite study mode and average counties per day
         */
        recalculateAggregates: () => {
          const { sessionHistory } = get();
          if (sessionHistory.length === 0) return;

          // Calculate favorite mode
          const modeCount = sessionHistory.reduce(
            (acc, s) => {
              acc[s.mode] = (acc[s.mode] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          );

          const favoriteMode = Object.entries(modeCount).sort(
            ([, a], [, b]) => b - a
          )[0]?.[0] as StudyModeType | null;

          // Calculate counties per day
          const days = new Set(sessionHistory.map((s) => new Date(s.timestamp).toDateString()))
            .size;
          const totalCounties = sessionHistory.reduce((sum, s) => sum + s.countiesStudied, 0);

          set({
            favoriteMode,
            countiesPerDay: days > 0 ? totalCounties / days : 0,
          });
        },
      }),
      {
        name: 'statistics-storage',
      }
    ),
    { name: 'StatisticsStore' }
  )
);
