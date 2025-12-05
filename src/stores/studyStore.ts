/**
 * Study Store Facade
 *
 * This facade provides backward compatibility with the original studyStore API
 * while delegating to the new domain-specific stores. This allows gradual
 * migration of consumers to use the domain stores directly.
 *
 * Domain Stores:
 * - sessionStore: Study session lifecycle management
 * - countyProgressStore: Per-county mastery tracking
 * - spacedRepetitionStore: SM-2 algorithm implementation
 * - progressStore: Overall progress and streaks
 * - goalsStore: Learning objectives
 * - statisticsStore: Analytics and metrics
 * - studySettingsStore: User preferences
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { logger } from '../utils/logger';
import {
  StudyStore,
  StudyProgress,
  CountyStudyInfo,
  SpacedRepetitionItem,
  StudyGoal,
  StudyStats,
  StudyModeType,
  RegionProgress,
  FlashcardSettings,
  MapExplorationSettings,
  GridStudySettings,
} from '../types/study';
import { allCaliforniaCounties, californiaRegions } from '../data/californiaCountiesComplete';

// Import domain stores
import { useSessionStore } from './study/sessionStore';
import { useCountyProgressStore } from './study/countyProgressStore';
import { useSpacedRepetitionStore } from './study/spacedRepetitionStore';
import { useProgressStore } from './study/progressStore';
import { useGoalsStore } from './study/goalsStore';
import { useStatisticsStore } from './study/statisticsStore';
import { useStudySettingsStore } from './study/studySettingsStore';

// Default values for facade state
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

/**
 * Study Store Facade - Maintains backward compatibility while delegating to domain stores
 */
export const useStudyStore = create<StudyStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ============================================================
        // STATE - Synced from domain stores
        // ============================================================
        progress: defaultProgress,
        studyInfo: new Map(),
        spacedRepetition: new Map(),
        sessions: [],
        goals: [],
        stats: defaultStats,
        flashcardSettings: useStudySettingsStore.getState().flashcard,
        mapSettings: useStudySettingsStore.getState().mapExploration,
        gridSettings: useStudySettingsStore.getState().gridStudy,
        currentSession: null,
        isStudySessionActive: false,

        // ============================================================
        // SESSION MANAGEMENT - Delegates to sessionStore
        // ============================================================
        startStudySession: (mode: StudyModeType) => {
          const sessionId = useSessionStore.getState().startSession(mode);
          const session = useSessionStore.getState().currentSession;
          set({ currentSession: session, isStudySessionActive: true });
          logger.info(`[StudyFacade] Session started: ${sessionId}`);
        },

        endStudySession: () => {
          const stats = useSessionStore.getState().endSession();
          if (stats) {
            useStatisticsStore.getState().recordSession({
              sessionId: stats.sessionId,
              mode: stats.mode,
              duration: stats.duration,
              countiesStudied: stats.countiesStudied,
              correctCount: stats.correctCount,
              accuracy: stats.accuracy,
              timestamp: Date.now(),
            });
          }
          set({ currentSession: null, isStudySessionActive: false });
          get().updateProgress();
        },

        // ============================================================
        // COUNTY STUDY TRACKING - Delegates to countyProgressStore
        // ============================================================
        markCountyAsStudied: (countyId: string, difficulty: 'easy' | 'medium' | 'hard') => {
          const correct = difficulty !== 'hard';
          const timeMs = difficulty === 'easy' ? 5000 : difficulty === 'medium' ? 10000 : 15000;

          // Delegate to domain stores
          useCountyProgressStore.getState().recordStudy(countyId, correct, timeMs);
          useProgressStore.getState().incrementStudied(countyId);

          // Update spaced repetition
          const quality = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 3 : 1;
          useSpacedRepetitionStore.getState().recordReview(countyId, quality);

          // Record in session if active
          if (useSessionStore.getState().isActive) {
            useSessionStore.getState().recordCountyStudied(countyId, correct, timeMs);
          }

          // Sync state
          get().syncFromDomainStores();
        },

        updateSpacedRepetition: (countyId: string, quality: number) => {
          useSpacedRepetitionStore.getState().recordReview(countyId, quality);
          get().syncFromDomainStores();
        },

        getNextCountyToStudy: (_mode: StudyModeType): string | null => {
          // Prioritize counties due for review
          const dueCards = useSpacedRepetitionStore.getState().getDueCards();
          if (dueCards.length > 0) {
            return dueCards.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime())[0]
              .countyId;
          }

          // Return unstudied counties
          const studiedIds = useCountyProgressStore.getState().getStudiedCounties();
          const unstudied = allCaliforniaCounties.filter((c) => !studiedIds.includes(c.id));
          if (unstudied.length === 0) return null;

          const settings = useStudySettingsStore.getState().flashcard;
          if (settings.focusOnWeakAreas) {
            return unstudied.sort((a, b) => {
              const aInfo = useCountyProgressStore.getState().getCountyInfo(a.id);
              const bInfo = useCountyProgressStore.getState().getCountyInfo(b.id);
              return (aInfo?.masteryLevel || 0) - (bInfo?.masteryLevel || 0);
            })[0].id;
          }

          return unstudied[Math.floor(Math.random() * unstudied.length)].id;
        },

        getCountyStudyInfo: (countyId: string): CountyStudyInfo => {
          const info = useCountyProgressStore.getState().getCountyInfo(countyId);
          return (
            info || {
              countyId,
              timesStudied: 0,
              difficulty: null,
              lastStudied: null,
              nextReview: null,
              masteryLevel: 0,
              streakCount: 0,
              incorrectCount: 0,
              averageTime: 0,
            }
          );
        },

        getRegionProgress: (regionName: string): RegionProgress => {
          const regionCounties =
            californiaRegions[regionName as keyof typeof californiaRegions] || [];
          const progressState = useProgressStore.getState();

          const studied = regionCounties.filter((name) => {
            const county = allCaliforniaCounties.find((c) => c.name === name);
            return county && progressState.studiedCounties.has(county.id);
          }).length;

          const mastered = regionCounties.filter((name) => {
            const county = allCaliforniaCounties.find((c) => c.name === name);
            return county && progressState.masteredCounties.has(county.id);
          }).length;

          return {
            regionName,
            total: regionCounties.length,
            studied,
            mastered,
            averageTime: 30,
            lastStudied: null,
          };
        },

        getSpacedRepetitionStatus: (): SpacedRepetitionItem[] => {
          return Array.from(useSpacedRepetitionStore.getState().cards.values());
        },

        // ============================================================
        // PROGRESS MANAGEMENT
        // ============================================================
        updateProgress: () => {
          useProgressStore.getState().updateStreak();
          get().syncFromDomainStores();
        },

        resetProgress: () => {
          useProgressStore.getState().resetProgress();
          set({
            progress: defaultProgress,
            studyInfo: new Map(),
            spacedRepetition: new Map(),
            sessions: [],
            currentSession: null,
            isStudySessionActive: false,
          });
        },

        exportProgress: (): string => {
          const state = get();
          return JSON.stringify({
            progress: {
              ...state.progress,
              studiedCounties: Array.from(state.progress.studiedCounties),
              masteredCounties: Array.from(state.progress.masteredCounties),
            },
            studyInfo: Array.from(state.studyInfo.entries()),
            spacedRepetition: Array.from(state.spacedRepetition.entries()),
            sessions: state.sessions,
            stats: state.stats,
          });
        },

        importProgress: (data: string) => {
          try {
            const parsed = JSON.parse(data);
            set({
              progress: {
                ...parsed.progress,
                studiedCounties: new Set(parsed.progress.studiedCounties),
                masteredCounties: new Set(parsed.progress.masteredCounties),
              },
              studyInfo: new Map(parsed.studyInfo),
              spacedRepetition: new Map(parsed.spacedRepetition),
              sessions: parsed.sessions,
              stats: parsed.stats,
            });
          } catch (error) {
            logger.error('Failed to import progress:', error);
          }
        },

        // ============================================================
        // GOALS - Delegates to goalsStore
        // ============================================================
        setGoal: (goal: StudyGoal) => {
          useGoalsStore.getState().createGoal(goal);
          get().syncFromDomainStores();
        },

        checkGoalProgress: () => {
          // Goals are auto-updated via event subscriptions
          get().syncFromDomainStores();
        },

        completeGoal: (goalId: string) => {
          useGoalsStore.getState().completeGoal(goalId);
          get().syncFromDomainStores();
        },

        // ============================================================
        // SETTINGS - Delegates to studySettingsStore
        // ============================================================
        updateFlashcardSettings: (settings: Partial<FlashcardSettings>) => {
          useStudySettingsStore.getState().updateFlashcardSettings(settings);
          set((state) => ({
            flashcardSettings: { ...state.flashcardSettings, ...settings },
          }));
        },

        updateMapSettings: (settings: Partial<MapExplorationSettings>) => {
          useStudySettingsStore.getState().updateMapSettings(settings);
          set((state) => ({
            mapSettings: { ...state.mapSettings, ...settings },
          }));
        },

        updateGridSettings: (settings: Partial<GridStudySettings>) => {
          useStudySettingsStore.getState().updateGridSettings(settings);
          set((state) => ({
            gridSettings: { ...state.gridSettings, ...settings },
          }));
        },

        // ============================================================
        // INTERNAL: Sync state from domain stores
        // ============================================================
        syncFromDomainStores: () => {
          const progressState = useProgressStore.getState();
          const statsState = useStatisticsStore.getState();

          set({
            progress: {
              totalStudied: progressState.totalStudied,
              totalCounties: progressState.totalCounties,
              studiedCounties: progressState.studiedCounties,
              masteredCounties: progressState.masteredCounties,
              currentStreak: progressState.currentStreak,
              longestStreak: progressState.longestStreak,
              lastStudyDate: progressState.lastStudyDate,
              studyStartDate: progressState.studyStartDate,
            },
            stats: {
              totalSessions: statsState.totalSessions,
              totalTimeSpent: statsState.totalTimeSpent,
              averageSessionTime: statsState.averageSessionTime,
              favoriteMode: statsState.favoriteMode,
              bestStreak: statsState.bestStreak,
              countiesPerDay: statsState.countiesPerDay,
              weeklyGoal: statsState.weeklyGoal,
              weeklyProgress: statsState.weeklyProgress,
              achievements: statsState.achievements,
            },
          });
        },
      }),
      {
        name: 'california-study-store',
        partialize: (state) => ({
          progress: {
            ...state.progress,
            studiedCounties: Array.from(state.progress.studiedCounties),
            masteredCounties: Array.from(state.progress.masteredCounties),
          },
          studyInfo: Array.from(state.studyInfo.entries()),
          spacedRepetition: Array.from(state.spacedRepetition.entries()),
          sessions: state.sessions,
          goals: state.goals,
          stats: state.stats,
          flashcardSettings: state.flashcardSettings,
          mapSettings: state.mapSettings,
          gridSettings: state.gridSettings,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.progress.studiedCounties = new Set(
              state.progress.studiedCounties as unknown as string[]
            );
            state.progress.masteredCounties = new Set(
              state.progress.masteredCounties as unknown as string[]
            );
            state.studyInfo = new Map(state.studyInfo as unknown as [string, CountyStudyInfo][]);
            state.spacedRepetition = new Map(
              state.spacedRepetition as unknown as [string, SpacedRepetitionItem][]
            );
          }
        },
      }
    ),
    { name: 'CaliforniaStudyStore' }
  )
);

// Type augmentation for syncFromDomainStores
declare module '../types/study' {
  interface StudyStore {
    syncFromDomainStores: () => void;
  }
}
