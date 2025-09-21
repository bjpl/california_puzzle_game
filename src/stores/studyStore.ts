import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  StudyStore,
  StudyProgress,
  CountyStudyInfo,
  SpacedRepetitionItem,
  StudySession,
  StudyGoal,
  StudyStats,
  StudyModeType,
  RegionProgress,
  FlashcardSettings,
  MapExplorationSettings,
  GridStudySettings
} from '../types/study';
import { allCaliforniaCounties, californiaRegions } from '../data/californiaCountiesComplete';

// Spaced Repetition Algorithm (SM-2)
const calculateNextReview = (
  interval: number,
  repetitions: number,
  easeFactor: number,
  quality: number
): { newInterval: number; newRepetitions: number; newEaseFactor: number } => {
  let newEaseFactor = easeFactor;
  let newRepetitions = repetitions;
  let newInterval = interval;

  if (quality >= 3) {
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    newRepetitions = 0;
    newInterval = 1;
  }

  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  return { newInterval, newRepetitions, newEaseFactor };
};

const defaultProgress: StudyProgress = {
  totalStudied: 0,
  totalCounties: allCaliforniaCounties.length,
  studiedCounties: new Set(),
  masteredCounties: new Set(),
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  studyStartDate: null
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
  achievements: []
};

const defaultFlashcardSettings: FlashcardSettings = {
  autoFlip: false,
  flipDelay: 3000,
  showHints: true,
  randomOrder: true,
  focusOnWeakAreas: true,
  repeatIncorrect: true
};

const defaultMapSettings: MapExplorationSettings = {
  showLabels: true,
  highlightStudied: true,
  groupByRegion: true,
  showDifficulty: true,
  interactiveMode: true
};

const defaultGridSettings: GridStudySettings = {
  sortBy: 'name',
  filterBy: {
    region: null,
    difficulty: null,
    studied: null,
    mastered: null
  },
  cardsPerPage: 12,
  showDetails: true
};

export const useStudyStore = create<StudyStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        progress: defaultProgress,
        studyInfo: new Map(),
        spacedRepetition: new Map(),
        sessions: [],
        goals: [],
        stats: defaultStats,
        flashcardSettings: defaultFlashcardSettings,
        mapSettings: defaultMapSettings,
        gridSettings: defaultGridSettings,
        currentSession: null,
        isStudySessionActive: false,

        // Session management
        startStudySession: (mode: StudyModeType) => {
          const session: StudySession = {
            id: `session-${Date.now()}`,
            startTime: new Date(),
            endTime: null,
            mode,
            countiesStudied: [],
            totalTime: 0,
            accuracy: 0,
            completionRate: 0
          };

          set((state) => ({
            currentSession: session,
            isStudySessionActive: true,
            progress: {
              ...state.progress,
              studyStartDate: state.progress.studyStartDate || new Date()
            }
          }));
        },

        endStudySession: () => {
          const state = get();
          if (!state.currentSession) return;

          const endTime = new Date();
          const totalTime = endTime.getTime() - state.currentSession.startTime.getTime();

          const completedSession: StudySession = {
            ...state.currentSession,
            endTime,
            totalTime: Math.round(totalTime / 1000), // seconds
            completionRate: state.currentSession.countiesStudied.length / allCaliforniaCounties.length * 100
          };

          set((state) => ({
            currentSession: null,
            isStudySessionActive: false,
            sessions: [...state.sessions, completedSession],
            stats: {
              ...state.stats,
              totalSessions: state.stats.totalSessions + 1,
              totalTimeSpent: state.stats.totalTimeSpent + Math.round(totalTime / 60000), // minutes
              averageSessionTime: (state.stats.totalTimeSpent + Math.round(totalTime / 60000)) / (state.stats.totalSessions + 1)
            }
          }));

          get().updateProgress();
        },

        // County study tracking
        markCountyAsStudied: (countyId: string, difficulty: 'easy' | 'medium' | 'hard') => {
          const state = get();
          const now = new Date();

          // Update study info
          const existingInfo = state.studyInfo.get(countyId);
          const newInfo: CountyStudyInfo = {
            countyId,
            timesStudied: (existingInfo?.timesStudied || 0) + 1,
            difficulty,
            lastStudied: now,
            nextReview: null,
            masteryLevel: Math.min(100, (existingInfo?.masteryLevel || 0) + (difficulty === 'easy' ? 25 : difficulty === 'medium' ? 15 : 10)),
            streakCount: (existingInfo?.streakCount || 0) + 1,
            incorrectCount: difficulty === 'hard' ? (existingInfo?.incorrectCount || 0) + 1 : existingInfo?.incorrectCount || 0,
            averageTime: existingInfo?.averageTime || 30
          };

          // Update spaced repetition
          const quality = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 3 : 1;
          get().updateSpacedRepetition(countyId, quality);

          // Update current session
          const updatedSession = state.currentSession ? {
            ...state.currentSession,
            countiesStudied: [...state.currentSession.countiesStudied, countyId]
          } : null;

          // Check for streak
          const isConsecutiveDay = state.progress.lastStudyDate &&
            Math.abs(now.getTime() - state.progress.lastStudyDate.getTime()) < 48 * 60 * 60 * 1000;

          const newStreak = isConsecutiveDay ? state.progress.currentStreak + 1 : 1;

          set((prevState) => ({
            studyInfo: new Map(prevState.studyInfo).set(countyId, newInfo),
            currentSession: updatedSession,
            progress: {
              ...prevState.progress,
              studiedCounties: new Set([...prevState.progress.studiedCounties, countyId]),
              totalStudied: new Set([...prevState.progress.studiedCounties, countyId]).size,
              masteredCounties: newInfo.masteryLevel >= 80 ?
                new Set([...prevState.progress.masteredCounties, countyId]) :
                prevState.progress.masteredCounties,
              currentStreak: newStreak,
              longestStreak: Math.max(prevState.progress.longestStreak, newStreak),
              lastStudyDate: now
            }
          }));
        },

        updateSpacedRepetition: (countyId: string, quality: number) => {
          const state = get();
          const existing = state.spacedRepetition.get(countyId);

          const currentInterval = existing?.interval || 0;
          const currentRepetitions = existing?.repetitions || 0;
          const currentEaseFactor = existing?.easeFactor || 2.5;

          const { newInterval, newRepetitions, newEaseFactor } = calculateNextReview(
            currentInterval,
            currentRepetitions,
            currentEaseFactor,
            quality
          );

          const nextReview = new Date();
          nextReview.setDate(nextReview.getDate() + newInterval);

          const newItem: SpacedRepetitionItem = {
            countyId,
            interval: newInterval,
            repetitions: newRepetitions,
            easeFactor: newEaseFactor,
            nextReview,
            lastReview: new Date(),
            quality
          };

          set((state) => ({
            spacedRepetition: new Map(state.spacedRepetition).set(countyId, newItem)
          }));
        },

        getNextCountyToStudy: (mode: StudyModeType): string | null => {
          const state = get();

          // For spaced repetition, prioritize counties due for review
          const dueForReview = Array.from(state.spacedRepetition.values())
            .filter(item => item.nextReview <= new Date())
            .sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());

          if (dueForReview.length > 0) {
            return dueForReview[0].countyId;
          }

          // Otherwise, return unstudied counties
          const unstudied = allCaliforniaCounties.filter(
            county => !state.progress.studiedCounties.has(county.id)
          );

          if (unstudied.length === 0) return null;

          // Sort by difficulty preference or random
          if (state.flashcardSettings.focusOnWeakAreas) {
            return unstudied.sort((a, b) => {
              const aInfo = state.studyInfo.get(a.id);
              const bInfo = state.studyInfo.get(b.id);
              return (aInfo?.masteryLevel || 0) - (bInfo?.masteryLevel || 0);
            })[0].id;
          }

          return unstudied[Math.floor(Math.random() * unstudied.length)].id;
        },

        getCountyStudyInfo: (countyId: string): CountyStudyInfo => {
          const state = get();
          return state.studyInfo.get(countyId) || {
            countyId,
            timesStudied: 0,
            difficulty: null,
            lastStudied: null,
            nextReview: null,
            masteryLevel: 0,
            streakCount: 0,
            incorrectCount: 0,
            averageTime: 0
          };
        },

        getRegionProgress: (regionName: string): RegionProgress => {
          const state = get();
          const regionCounties = californiaRegions[regionName as keyof typeof californiaRegions] || [];

          const studied = regionCounties.filter(countyName => {
            const county = allCaliforniaCounties.find(c => c.name === countyName);
            return county && state.progress.studiedCounties.has(county.id);
          }).length;

          const mastered = regionCounties.filter(countyName => {
            const county = allCaliforniaCounties.find(c => c.name === countyName);
            return county && state.progress.masteredCounties.has(county.id);
          }).length;

          const lastStudiedDates = regionCounties
            .map(countyName => {
              const county = allCaliforniaCounties.find(c => c.name === countyName);
              if (!county) return null;
              const info = state.studyInfo.get(county.id);
              return info?.lastStudied;
            })
            .filter(Boolean) as Date[];

          const lastStudied = lastStudiedDates.length > 0 ?
            new Date(Math.max(...lastStudiedDates.map(d => d.getTime()))) : null;

          return {
            regionName,
            total: regionCounties.length,
            studied,
            mastered,
            averageTime: 30, // TODO: Calculate from actual data
            lastStudied
          };
        },

        getSpacedRepetitionStatus: (): SpacedRepetitionItem[] => {
          return Array.from(get().spacedRepetition.values());
        },

        // Progress management
        updateProgress: () => {
          const state = get();
          const today = new Date();
          const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());

          const weeklyStudied = state.sessions
            .filter(session => session.startTime >= weekStart)
            .reduce((total, session) => total + session.countiesStudied.length, 0);

          set((state) => ({
            stats: {
              ...state.stats,
              weeklyProgress: (weeklyStudied / state.stats.weeklyGoal) * 100,
              countiesPerDay: state.progress.totalStudied / Math.max(1,
                Math.ceil((today.getTime() - (state.progress.studyStartDate?.getTime() || today.getTime())) / (24 * 60 * 60 * 1000))
              )
            }
          }));
        },

        resetProgress: () => {
          set({
            progress: defaultProgress,
            studyInfo: new Map(),
            spacedRepetition: new Map(),
            sessions: [],
            currentSession: null,
            isStudySessionActive: false
          });
        },

        exportProgress: (): string => {
          const state = get();
          return JSON.stringify({
            progress: {
              ...state.progress,
              studiedCounties: Array.from(state.progress.studiedCounties),
              masteredCounties: Array.from(state.progress.masteredCounties)
            },
            studyInfo: Array.from(state.studyInfo.entries()),
            spacedRepetition: Array.from(state.spacedRepetition.entries()),
            sessions: state.sessions,
            stats: state.stats
          });
        },

        importProgress: (data: string) => {
          try {
            const parsed = JSON.parse(data);
            set({
              progress: {
                ...parsed.progress,
                studiedCounties: new Set(parsed.progress.studiedCounties),
                masteredCounties: new Set(parsed.progress.masteredCounties)
              },
              studyInfo: new Map(parsed.studyInfo),
              spacedRepetition: new Map(parsed.spacedRepetition),
              sessions: parsed.sessions,
              stats: parsed.stats
            });
          } catch (error) {
            console.error('Failed to import progress:', error);
          }
        },

        // Goals and achievements
        setGoal: (goal: StudyGoal) => {
          set((state) => ({
            goals: [...state.goals.filter(g => g.id !== goal.id), goal]
          }));
        },

        checkGoalProgress: () => {
          // TODO: Implement goal checking logic
        },

        completeGoal: (goalId: string) => {
          set((state) => ({
            goals: state.goals.map(goal =>
              goal.id === goalId ? { ...goal, completed: true } : goal
            )
          }));
        },

        // Settings
        updateFlashcardSettings: (settings: Partial<FlashcardSettings>) => {
          set((state) => ({
            flashcardSettings: { ...state.flashcardSettings, ...settings }
          }));
        },

        updateMapSettings: (settings: Partial<MapExplorationSettings>) => {
          set((state) => ({
            mapSettings: { ...state.mapSettings, ...settings }
          }));
        },

        updateGridSettings: (settings: Partial<GridStudySettings>) => {
          set((state) => ({
            gridSettings: { ...state.gridSettings, ...settings }
          }));
        }
      }),
      {
        name: 'california-study-store',
        partialize: (state) => ({
          progress: {
            ...state.progress,
            studiedCounties: Array.from(state.progress.studiedCounties),
            masteredCounties: Array.from(state.progress.masteredCounties)
          },
          studyInfo: Array.from(state.studyInfo.entries()),
          spacedRepetition: Array.from(state.spacedRepetition.entries()),
          sessions: state.sessions,
          goals: state.goals,
          stats: state.stats,
          flashcardSettings: state.flashcardSettings,
          mapSettings: state.mapSettings,
          gridSettings: state.gridSettings
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Convert arrays back to Sets and Maps
            state.progress.studiedCounties = new Set(state.progress.studiedCounties as any);
            state.progress.masteredCounties = new Set(state.progress.masteredCounties as any);
            state.studyInfo = new Map(state.studyInfo as any);
            state.spacedRepetition = new Map(state.spacedRepetition as any);
          }
        }
      }
    ),
    { name: 'CaliforniaStudyStore' }
  )
);