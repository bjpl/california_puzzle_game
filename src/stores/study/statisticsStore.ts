import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { StudyStats, StudyModeType } from '../../types/study';

interface SessionRecord {
  sessionId: string;
  mode: StudyModeType;
  duration: number;
  countiesStudied: number;
  correctCount: number;
  accuracy: number;
  timestamp: number;
}

interface StatisticsState extends StudyStats {
  sessionHistory: SessionRecord[];
}

interface StatisticsActions {
  recordSession: (stats: SessionRecord) => void;
  addAchievement: (achievement: string) => void;
  updateWeeklyProgress: (count: number) => void;
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

        addAchievement: (achievement: string) => {
          set((state) => ({
            achievements: [...new Set([...state.achievements, achievement])],
          }));
        },

        updateWeeklyProgress: (count: number) => {
          set((state) => ({
            weeklyProgress: state.weeklyProgress + count,
          }));
        },

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
