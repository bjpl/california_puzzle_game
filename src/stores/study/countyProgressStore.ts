import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CountyStudyInfo, RegionProgress } from '../../types/study';
import { StudyEventType } from '../../types/study-domain.types';
import { storeCoordinator } from '../storeCoordinator';
import { californiaRegions } from '../../data/californiaCountiesComplete';

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
            { countyCode, correct, timeMs },
            'countyProgressStore'
          );
        },

        getCountyInfo: (countyCode: string): CountyStudyInfo | undefined => {
          return get().countyProgress.get(countyCode);
        },

        getRegionProgress: (regionName: string): RegionProgress => {
          const region = californiaRegions.find((r) => r.name === regionName);
          if (!region) {
            return { total: 0, studied: 0, mastered: 0, percentage: 0 };
          }

          const { countyProgress } = get();
          let studied = 0;
          let mastered = 0;

          region.counties.forEach((county) => {
            const info = countyProgress.get(county.id);
            if (info?.studied) studied++;
            if (info?.mastered) mastered++;
          });

          return {
            total: region.counties.length,
            studied,
            mastered,
            percentage: (studied / region.counties.length) * 100,
          };
        },

        updateMasteryLevel: (countyCode: string, level: number) => {
          set((state) => {
            const existing = state.countyProgress.get(countyCode);
            if (!existing) return state;

            const newProgress = new Map(state.countyProgress);
            newProgress.set(countyCode, {
              ...existing,
              masteryLevel: level,
              mastered: level >= 3,
            });

            return { countyProgress: newProgress };
          });

          if (level >= 3) {
            storeCoordinator.publish(
              StudyEventType.COUNTY_MASTERY_CHANGED,
              { countyCode, level },
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
        merge: (
          persisted:
            | { countyProgress?: [string, CountyStudyInfo][]; lastStudiedCounty?: string | null }
            | undefined,
          current
        ) => ({
          ...current,
          countyProgress: new Map(persisted?.countyProgress || []),
          lastStudiedCounty: persisted?.lastStudiedCounty || null,
        }),
      }
    ),
    { name: 'CountyProgressStore' }
  )
);
