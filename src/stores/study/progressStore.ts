/**
 * @fileoverview Overall Progress and Streaks Store
 * @module stores/study/progressStore
 * @description Tracks overall study progress, daily streaks, and aggregate statistics.
 * Maintains sets of studied and mastered counties, calculates streaks, and publishes milestones.
 * Persists data across sessions.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { StudyProgress } from '../../types/study';
import { StudyEventType } from '../../types/study-domain.types';
import { storeCoordinator } from '../storeCoordinator';
import { allCaliforniaCounties } from '../../data/californiaCountiesComplete';

/**
 * Progress state shape (extends StudyProgress interface)
 */
interface ProgressState extends StudyProgress {}

/**
 * Progress tracking actions
 */
interface ProgressActions {
  /** Add a county to the studied set */
  incrementStudied: (countyCode: string) => void;
  /** Mark a county as mastered */
  markMastered: (countyCode: string) => void;
  /** Update the current study streak */
  updateStreak: () => void;
  /** Reset all progress data to defaults */
  resetProgress: () => void;
}

/**
 * Default progress values
 */
const defaultProgress: StudyProgress = {
  totalStudied: 0,
  totalCounties: allCaliforniaCounties.length,
  studiedCounties: new Set(),
  masteredCounties: new Set(),
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  studyStartDate: null,
};

export const useProgressStore = create<ProgressState & ProgressActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultProgress,

        /**
         * Add a county to the studied set and update timestamps
         * @param {string} countyCode - County identifier
         */
        incrementStudied: (countyCode: string) => {
          set((state) => {
            const newStudied = new Set(state.studiedCounties);
            newStudied.add(countyCode);
            const today = new Date().toISOString().split('T')[0];

            return {
              totalStudied: newStudied.size,
              studiedCounties: newStudied,
              lastStudyDate: today,
              studyStartDate: state.studyStartDate || today,
            };
          });

          const state = get();
          storeCoordinator.publish(
            StudyEventType.PROGRESS_UPDATED,
            {
              overallProgress: {
                totalCounties: state.totalCounties,
                studiedCounties: state.totalStudied,
                masteredCounties: state.masteredCounties.size,
                currentStreak: state.currentStreak,
                longestStreak: state.longestStreak,
                totalStudySessions: 0, // Not tracked in progressStore
                totalStudyTimeMs: 0, // Not tracked in progressStore
                lastStudyDate: state.lastStudyDate ? new Date(state.lastStudyDate) : undefined,
              },
              changedCounties: [countyCode],
            },
            'progressStore'
          );
        },

        /**
         * Mark a county as mastered and publish milestone event
         * @param {string} countyCode - County identifier
         */
        markMastered: (countyCode: string) => {
          set((state) => {
            const newMastered = new Set(state.masteredCounties);
            newMastered.add(countyCode);
            return { masteredCounties: newMastered };
          });

          storeCoordinator.publish(
            StudyEventType.MILESTONE_REACHED,
            {
              milestoneType: 'mastery_level',
              threshold: 1,
              actualValue: get().masteredCounties.size,
              timestamp: new Date(),
            },
            'progressStore'
          );
        },

        /**
         * Update the current study streak based on last study date
         * Increments streak if studied yesterday, resets to 1 if gap exists
         * @example
         * updateStreak(); // Call when user studies each day
         */
        updateStreak: () => {
          const today = new Date().toISOString().split('T')[0];
          const { lastStudyDate, currentStreak, longestStreak } = get();

          if (lastStudyDate === today) return;

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          const newStreak = lastStudyDate === yesterdayStr ? currentStreak + 1 : 1;

          set({
            currentStreak: newStreak,
            longestStreak: Math.max(longestStreak, newStreak),
            lastStudyDate: today,
          });

          const streakBroken = lastStudyDate !== yesterdayStr && lastStudyDate !== null;
          const updatedLongestStreak = get().longestStreak;
          storeCoordinator.publish(
            StudyEventType.STREAK_UPDATED,
            {
              currentStreak: newStreak,
              longestStreak: updatedLongestStreak,
              streakBroken,
            },
            'progressStore'
          );
        },

        /**
         * Reset all progress data to default values
         * Use with caution - this is irreversible
         */
        resetProgress: () => {
          set(defaultProgress);
        },
      }),
      {
        name: 'progress-storage',
        partialize: (state) => ({
          totalStudied: state.totalStudied,
          studiedCounties: Array.from(state.studiedCounties),
          masteredCounties: Array.from(state.masteredCounties),
          currentStreak: state.currentStreak,
          longestStreak: state.longestStreak,
          lastStudyDate: state.lastStudyDate,
          studyStartDate: state.studyStartDate,
        }),
        merge: (persistedState: unknown, current) => {
          const persisted = persistedState as
            | {
                totalStudied?: number;
                studiedCounties?: string[];
                masteredCounties?: string[];
                currentStreak?: number;
                longestStreak?: number;
                lastStudyDate?: string | null;
                studyStartDate?: string | null;
              }
            | undefined;
          return {
            ...current,
            totalStudied: persisted?.totalStudied ?? current.totalStudied,
            studiedCounties: new Set(persisted?.studiedCounties || []),
            masteredCounties: new Set(persisted?.masteredCounties || []),
            currentStreak: persisted?.currentStreak ?? current.currentStreak,
            longestStreak: persisted?.longestStreak ?? current.longestStreak,
            lastStudyDate: persisted?.lastStudyDate ?? current.lastStudyDate,
            studyStartDate: persisted?.studyStartDate ?? current.studyStartDate,
          };
        },
      }
    ),
    { name: 'ProgressStore' }
  )
);
