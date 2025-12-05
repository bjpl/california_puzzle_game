import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CountyStudyInfo, RegionProgress } from '../../types/study';
import { StudyEventType, MasteryLevel } from '../../types/study-domain.types';
import { storeCoordinator } from '../storeCoordinator';
import { californiaRegions, allCaliforniaCounties } from '../../data/californiaCountiesComplete';

interface CountyProgressState {
  countyProgress: Map<string, CountyStudyInfo>;
  lastStudiedCounty: string | null;
}

interface CountyProgressActions {
  recordStudy: (countyCode: string, correct: boolean, timeMs: number) => void;
  getCountyInfo: (countyCode: string) => CountyStudyInfo | undefined;
  getRegionProgress: (regionName: string) => RegionProgress;
  updateMasteryLevel: (countyCode: string, level: number) => void;
  getMasteredCounties: () => string[];
  getStudiedCounties: () => string[];
}

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

        getCountyInfo: (countyCode: string): CountyStudyInfo | undefined => {
          return get().countyProgress.get(countyCode);
        },

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

        getMasteredCounties: (): string[] => {
          const { countyProgress } = get();
          return Array.from(countyProgress.entries())
            .filter(([, info]) => info.mastered)
            .map(([code]) => code);
        },

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
