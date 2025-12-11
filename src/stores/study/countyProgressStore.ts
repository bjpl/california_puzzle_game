/**
 * @fileoverview County Progress Tracking Store
 * @module stores/study/countyProgressStore
 * @description Tracks individual county study progress, mastery levels, and performance metrics.
 * Calculates accuracy, average response time, and region-level progress aggregations.
 * Persists data across sessions using Zustand persistence middleware.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CountyStudyInfo, RegionProgress } from '../../types/study';
import { StudyEventType, MasteryLevel } from '../../types/study-domain.types';
import { storeCoordinator } from '../storeCoordinator';
import { californiaRegions, allCaliforniaCounties } from '../../data/californiaCountiesComplete';

/**
 * County progress state shape
 */
interface CountyProgressState {
  /** Map of county codes to their study information */
  countyProgress: Map<string, CountyStudyInfo>;
  /** Most recently studied county code */
  lastStudiedCounty: string | null;
}

/**
 * County progress actions
 */
interface CountyProgressActions {
  /** Record a county study attempt and update metrics */
  recordStudy: (countyCode: string, correct: boolean, timeMs: number) => void;
  /** Retrieve study info for a specific county */
  getCountyInfo: (countyCode: string) => CountyStudyInfo | undefined;
  /** Calculate aggregate progress for a geographic region */
  getRegionProgress: (regionName: string) => RegionProgress;
  /** Manually update a county's mastery level */
  updateMasteryLevel: (countyCode: string, level: number) => void;
  /** Get all counties that have achieved mastery (level >= 3) */
  getMasteredCounties: () => string[];
  /** Get all counties that have been studied at least once */
  getStudiedCounties: () => string[];
}

/**
 * Creates default study information for a new county
 * @param {string} countyCode - County identifier
 * @returns {CountyStudyInfo} Initial county study data
 */
const createDefaultCountyInfo = (countyCode: string): CountyStudyInfo => ({
  countyId: countyCode,
  studied: false,
  mastered: false,
  timesStudied: 0,
  correctCount: 0,
  incorrectCount: 0,
  lastStudied: null,
  averageTime: 0,
  masteryLevel: 0,
});

export const useCountyProgressStore = create<CountyProgressState & CountyProgressActions>()(
  devtools(
    persist(
      (set, get) => ({
        countyProgress: new Map(),
        lastStudiedCounty: null,

        /**
         * Record a county study attempt and automatically calculate updated metrics
         * Calculates accuracy, mastery level (0-3), and average response time
         * @param {string} countyCode - County identifier
         * @param {boolean} correct - Whether the answer was correct
         * @param {number} timeMs - Response time in milliseconds
         * @example
         * recordStudy('CA-001', true, 2500); // Correct answer in 2.5 seconds
         */
        recordStudy: (countyCode: string, correct: boolean, timeMs: number) => {
          set((state) => {
            const existing =
              state.countyProgress.get(countyCode) || createDefaultCountyInfo(countyCode);
            const newProgress = new Map(state.countyProgress);

            const timesStudied = existing.timesStudied + 1;
            const correctCount = existing.correctCount + (correct ? 1 : 0);
            const incorrectCount = existing.incorrectCount + (correct ? 0 : 1);
            const averageTime =
              (existing.averageTime * existing.timesStudied + timeMs) / timesStudied;
            const accuracy = correctCount / timesStudied;
            const masteryLevel =
              accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : accuracy >= 0.5 ? 1 : 0;

            const updated: CountyStudyInfo = {
              ...existing,
              studied: true,
              timesStudied,
              correctCount,
              incorrectCount,
              lastStudied: new Date(),
              averageTime,
              masteryLevel,
              mastered: masteryLevel >= 3,
            };

            newProgress.set(countyCode, updated);

            return {
              countyProgress: newProgress,
              lastStudiedCounty: countyCode,
            };
          });

          storeCoordinator.publish(
            StudyEventType.COUNTY_STUDIED,
            {
              sessionId: 'standalone', // Not from a session context
              countyCode,
              correct,
              responseTimeMs: timeMs,
              timestamp: new Date(),
            },
            'countyProgressStore'
          );
        },

        /**
         * Get study information for a specific county
         * @param {string} countyCode - County identifier
         * @returns {CountyStudyInfo | undefined} County info or undefined if not studied
         */
        getCountyInfo: (countyCode: string): CountyStudyInfo | undefined => {
          return get().countyProgress.get(countyCode);
        },

        /**
         * Calculate aggregate progress metrics for a geographic region
         * @param {string} regionName - Region name (e.g., 'Bay Area', 'Southern California')
         * @returns {RegionProgress} Counts of total, studied, and mastered counties
         * @example
         * const bayArea = getRegionProgress('Bay Area');
         * // Returns ${bayArea.studied/${bayArea.total} studied`);
         */
        getRegionProgress: (regionName: string): RegionProgress => {
          const regionCountyNames = californiaRegions[regionName as keyof typeof californiaRegions];
          if (!regionCountyNames) {
            return { total: 0, studied: 0, mastered: 0, percentage: 0 };
          }

          const { countyProgress } = get();
          let studied = 0;
          let mastered = 0;

          regionCountyNames.forEach((countyName) => {
            // Find the county ID from the name
            const county = allCaliforniaCounties.find((c) => c.name === countyName);
            if (county) {
              const info = countyProgress.get(county.id);
              if (info?.studied) studied++;
              if (info?.mastered) mastered++;
            }
          });

          return {
            total: regionCountyNames.length,
            studied,
            mastered,
            percentage:
              regionCountyNames.length > 0 ? (studied / regionCountyNames.length) * 100 : 0,
          };
        },

        /**
         * Manually update a county's mastery level
         * Publishes mastery change event if level changes
         * @param {string} countyCode - County identifier
         * @param {number} level - New mastery level (0-3)
         */
        updateMasteryLevel: (countyCode: string, level: number) => {
          const existing = get().countyProgress.get(countyCode);
          const oldLevel = existing?.masteryLevel ?? 0;

          set((state) => {
            const existingState = state.countyProgress.get(countyCode);
            if (!existingState) return state;

            const newProgress = new Map(state.countyProgress);
            newProgress.set(countyCode, {
              ...existingState,
              masteryLevel: level,
              mastered: level >= 3,
            });

            return { countyProgress: newProgress };
          });

          // Publish mastery change event if level increased to mastery
          if (level >= 3 || level !== oldLevel) {
            const levelToMastery = (lvl: number): MasteryLevel => {
              if (lvl >= 3) return MasteryLevel.MASTERED;
              if (lvl >= 2) return MasteryLevel.PROFICIENT;
              if (lvl >= 1) return MasteryLevel.FAMILIAR;
              if (lvl > 0) return MasteryLevel.LEARNING;
              return MasteryLevel.UNKNOWN;
            };
            storeCoordinator.publish(
              StudyEventType.COUNTY_MASTERY_CHANGED,
              {
                countyCode,
                oldLevel: levelToMastery(oldLevel),
                newLevel: levelToMastery(level),
                timestamp: new Date(),
              },
              'countyProgressStore'
            );
          }
        },

        /**
         * Get all counties that have achieved mastery (level >= 3)
         * @returns {string[]} Array of mastered county codes
         */
        getMasteredCounties: (): string[] => {
          const { countyProgress } = get();
          return Array.from(countyProgress.entries())
            .filter(([, info]) => info.mastered)
            .map(([code]) => code);
        },

        /**
         * Get all counties that have been studied at least once
         * @returns {string[]} Array of studied county codes
         */
        getStudiedCounties: (): string[] => {
          const { countyProgress } = get();
          return Array.from(countyProgress.entries())
            .filter(([, info]) => info.studied)
            .map(([code]) => code);
        },
      }),
      {
        name: 'county-progress-storage',
        partialize: (state) => ({
          countyProgress: Array.from(state.countyProgress.entries()),
          lastStudiedCounty: state.lastStudiedCounty,
        }),
        merge: (persistedState: unknown, current) => {
          const persisted = persistedState as
            | { countyProgress?: [string, CountyStudyInfo][]; lastStudiedCounty?: string | null }
            | undefined;
          return {
            ...current,
            countyProgress: new Map(persisted?.countyProgress || []),
            lastStudiedCounty: persisted?.lastStudiedCounty || null,
          };
        },
      }
    ),
    { name: 'CountyProgressStore' }
  )
);
