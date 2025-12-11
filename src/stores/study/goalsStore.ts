/**
 * @fileoverview Study Goals Management Store
 * @module stores/study/goalsStore
 * @description Manages user-defined study goals including creation, tracking, and completion.
 * Maintains separate lists of active and completed goals, publishes completion events.
 * Persists data across sessions.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { StudyGoal, StudyEventType } from '../../types/study-domain.types';
import { storeCoordinator } from '../storeCoordinator';

/**
 * Goals state shape
 */
interface GoalsState {
  /** Map of goal IDs to goal objects */
  goals: Map<string, StudyGoal>;
  /** Array of active goal IDs */
  activeGoalIds: string[];
  /** Array of completed goal IDs */
  completedGoalIds: string[];
}

/**
 * Goal management actions
 */
interface GoalsActions {
  /** Create a new study goal */
  createGoal: (goal: Omit<StudyGoal, 'id' | 'createdAt'>) => string;
  /** Update the current progress value of a goal */
  updateGoalProgress: (goalId: string, progress: number) => void;
  /** Mark a goal as completed and move to completed list */
  completeGoal: (goalId: string) => void;
  /** Delete a goal from the store */
  deleteGoal: (goalId: string) => void;
  /** Get all currently active goals */
  getActiveGoals: () => StudyGoal[];
}

/**
 * Generates a unique goal identifier
 * @returns {string} Goal ID in format: goal-{timestamp}-{random}
 */
const generateGoalId = () => `goal-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const useGoalsStore = create<GoalsState & GoalsActions>()(
  devtools(
    persist(
      (set, get) => ({
        goals: new Map(),
        activeGoalIds: [],
        completedGoalIds: [],

        /**
         * Create a new study goal and add to active goals list
         * @param {Omit<StudyGoal, 'id' | 'createdAt'>} goalData - Goal data without id and createdAt
         * @returns {string} The generated goal ID
         * @example
         * const goalId = createGoal({
         *   type: 'county_count',
         *   targetValue: 10,
         *   currentValue: 0,
         *   description: 'Master 10 counties this week'
         * });
         */
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

        /**
         * Update the current progress value of a goal
         * @param {string} goalId - Goal identifier
         * @param {number} progress - New progress value
         */
        updateGoalProgress: (goalId: string, progress: number) => {
          set((state) => {
            const goal = state.goals.get(goalId);
            if (!goal) return state;

            const newGoals = new Map(state.goals);
            newGoals.set(goalId, { ...goal, currentValue: progress });
            return { goals: newGoals };
          });
        },

        /**
         * Mark a goal as completed and move to completed list
         * Publishes GOAL_COMPLETED event
         * @param {string} goalId - Goal identifier
         */
        completeGoal: (goalId: string) => {
          const goal = get().goals.get(goalId);
          if (!goal) return;

          set((state) => ({
            activeGoalIds: state.activeGoalIds.filter((id) => id !== goalId),
            completedGoalIds: [...state.completedGoalIds, goalId],
          }));

          storeCoordinator.publish(
            StudyEventType.GOAL_COMPLETED,
            { goal, completedAt: new Date() },
            'goalsStore'
          );
        },

        /**
         * Delete a goal from the store
         * @param {string} goalId - Goal identifier
         */
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

        /**
         * Get all currently active goals
         * @returns {StudyGoal[]} Array of active goals
         */
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
        merge: (persistedState: unknown, current) => {
          const persisted = persistedState as
            | {
                goals?: [string, StudyGoal][];
                activeGoalIds?: string[];
                completedGoalIds?: string[];
              }
            | undefined;
          return {
            ...current,
            goals: new Map(persisted?.goals || []),
            activeGoalIds: persisted?.activeGoalIds || [],
            completedGoalIds: persisted?.completedGoalIds || [],
          };
        },
      }
    ),
    { name: 'GoalsStore' }
  )
);
