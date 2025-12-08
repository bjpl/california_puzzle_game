import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { StudyProgress } from '../../types/study';
import { StudyEventType } from '../../types/study-domain.types';
import { storeCoordinator } from '../storeCoordinator';
import { allCaliforniaCounties } from '../../data/californiaCountiesComplete';

interface ProgressState extends StudyProgress {}

interface ProgressActions {
  incrementStudied: (countyCode: string) => void;
  markMastered: (countyCode: string) => void;
  updateStreak: () => void;
  resetProgress: () => void;
}

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
      }
    ),
    { name: 'ProgressStore' }
  )
);
