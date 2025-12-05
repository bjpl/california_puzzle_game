import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { StudyGoal } from '../../types/study';
import { StudyEventType } from '../../types/study-domain.types';
import { storeCoordinator } from '../storeCoordinator';

interface GoalsState {
  goals: Map<string, StudyGoal>;
  activeGoalIds: string[];
  completedGoalIds: string[];
}

interface GoalsActions {
  createGoal: (goal: Omit<StudyGoal, 'id' | 'createdAt'>) => string;
  updateGoalProgress: (goalId: string, progress: number) => void;
  completeGoal: (goalId: string) => void;
  deleteGoal: (goalId: string) => void;
  getActiveGoals: () => StudyGoal[];
}

const generateGoalId = () => `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useGoalsStore = create<GoalsState & GoalsActions>()(
  devtools(
    persist(
      (set, get) => ({
        goals: new Map(),
        activeGoalIds: [],
        completedGoalIds: [],

        createGoal: (goalData): string => {
          const id = generateGoalId();
          const goal: StudyGoal = {
            ...goalData,
            id,
            createdAt: new Date(),
          };

          set((state) => {
            const newGoals = new Map(state.goals);
            newGoals.set(id, goal);
            return {
              goals: newGoals,
              activeGoalIds: [...state.activeGoalIds, id],
            };
          });

          return id;
        },

        updateGoalProgress: (goalId: string, progress: number) => {
          set((state) => {
            const goal = state.goals.get(goalId);
            if (!goal) return state;

            const newGoals = new Map(state.goals);
            newGoals.set(goalId, { ...goal, progress });
            return { goals: newGoals };
          });
        },

        completeGoal: (goalId: string) => {
          set((state) => ({
            activeGoalIds: state.activeGoalIds.filter((id) => id !== goalId),
            completedGoalIds: [...state.completedGoalIds, goalId],
          }));

          storeCoordinator.publish(StudyEventType.GOAL_COMPLETED, { goalId }, 'goalsStore');
        },

        deleteGoal: (goalId: string) => {
          set((state) => {
            const newGoals = new Map(state.goals);
            newGoals.delete(goalId);
            return {
              goals: newGoals,
              activeGoalIds: state.activeGoalIds.filter((id) => id !== goalId),
            };
          });
        },

        getActiveGoals: (): StudyGoal[] => {
          const { goals, activeGoalIds } = get();
          return activeGoalIds.map((id) => goals.get(id)).filter(Boolean) as StudyGoal[];
        },
      }),
      {
        name: 'goals-storage',
        partialize: (state) => ({
          goals: Array.from(state.goals.entries()),
          activeGoalIds: state.activeGoalIds,
          completedGoalIds: state.completedGoalIds,
        }),
      }
    ),
    { name: 'GoalsStore' }
  )
);
