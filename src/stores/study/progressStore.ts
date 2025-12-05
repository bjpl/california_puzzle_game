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

          storeCoordinator.publish(
            StudyEventType.PROGRESS_UPDATED,
            { countyCode, totalStudied: get().totalStudied },
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
            { type: 'mastery', countyCode },
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

          storeCoordinator.publish(
            StudyEventType.STREAK_UPDATED,
            { currentStreak: newStreak },
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
