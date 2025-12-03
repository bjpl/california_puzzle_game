/**
 * Achievement Store
 * Manages achievement definitions, progress, and unlocking
 * Single responsibility: achievement system
 *
 * NOTE: This store does NOT import countyPlacementStore to avoid circular deps.
 * Instead, checkAchievements receives state as parameters from storeCoordinator.ts
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  Achievement,
  PlacementResult,
  AchievementCategory,
  DifficultyLevel,
  CaliforniaRegion,
  CountyPiece,
} from '@/types';
import { playSound, SoundType } from '@/utils/soundManager';
import { useGameLifecycleStore } from './gameLifecycleStore';
import { useScoringStore } from './scoringStore';
// NOTE: useCountyPlacementStore import REMOVED to break circular dependency

export interface AchievementState {
  achievements: Achievement[];
}

interface AchievementActions {
  // Updated: now accepts remainingCounties as param to avoid circular import
  checkAchievements: (placement?: PlacementResult, remainingCounties?: CountyPiece[]) => Achievement[];
  unlockAchievement: (achievementId: string) => void;
  getAchievementProgress: (achievementId: string) => number;
  resetAchievements: () => void;
}

export type AchievementStore = AchievementState & AchievementActions;

const defaultAchievements: Achievement[] = [
  {
    id: 'first_county',
    name: 'First Steps',
    description: 'Place your first county correctly',
    icon: '🎯',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.COMPLETION,
  },
  {
    id: 'perfect_placement',
    name: 'Bullseye',
    description: 'Place a county with 100% accuracy',
    icon: '🎯',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.ACCURACY,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Place a county in under 3 seconds',
    icon: '⚡',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.SPEED,
  },
  {
    id: 'bay_area_master',
    name: 'Bay Area Master',
    description: 'Complete Bay Area on Expert difficulty',
    icon: '🌉',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.COMPLETION,
  },
  {
    id: 'streak_10',
    name: 'On Fire',
    description: 'Get a 10-county streak',
    icon: '🔥',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.STREAK,
  },
  {
    id: 'california_expert',
    name: 'California Expert',
    description: 'Complete all regions on Expert difficulty',
    icon: '🏆',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.COMPLETION,
  },
];

export const useAchievementStore = create<AchievementStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        achievements: defaultAchievements,

        // remainingCounties passed as param to avoid circular dep with countyPlacementStore
        checkAchievements: (placement?: PlacementResult, remainingCounties?: CountyPiece[]): Achievement[] => {
          const state = get();
          const lifecycleState = useGameLifecycleStore.getState();
          const scoringState = useScoringStore.getState();
          // NOTE: No longer importing countyPlacementStore - remainingCounties passed as param
          const newlyUnlocked: Achievement[] = [];

          const updatedAchievements = state.achievements.map((achievement) => {
            if (achievement.isUnlocked) return achievement;

            let shouldUnlock = false;
            let newProgress = achievement.progress;

            switch (achievement.id) {
              case 'first_county':
                if (placement?.isCorrect) {
                  shouldUnlock = true;
                  newProgress = 1;
                }
                break;
              case 'perfect_placement':
                if (placement?.accuracy === 1) {
                  shouldUnlock = true;
                  newProgress = 1;
                }
                break;
              case 'speed_demon':
                if (placement && placement.timeToPlace < 3000) {
                  shouldUnlock = true;
                  newProgress = 1;
                }
                break;
              case 'streak_10':
                newProgress = Math.min(scoringState.streak / 10, 1);
                if (scoringState.streak >= 10) shouldUnlock = true;
                break;
              case 'bay_area_master':
                // remainingCounties now passed as parameter instead of from imported store
                if (
                  lifecycleState.selectedRegion === CaliforniaRegion.BAY_AREA &&
                  lifecycleState.difficulty === DifficultyLevel.EXPERT &&
                  remainingCounties !== undefined &&
                  remainingCounties.length === 0
                ) {
                  shouldUnlock = true;
                  newProgress = 1;
                }
                break;
            }

            const updated = {
              ...achievement,
              progress: newProgress,
              isUnlocked: shouldUnlock,
              unlockedAt: shouldUnlock ? new Date() : achievement.unlockedAt,
            };

            if (shouldUnlock && !achievement.isUnlocked) {
              newlyUnlocked.push(updated);
              playSound(SoundType.ACHIEVEMENT);
            }

            return updated;
          });

          set({ achievements: updatedAchievements });
          return newlyUnlocked;
        },

        unlockAchievement: (achievementId: string) => {
          set((state) => ({
            achievements: state.achievements.map((achievement) =>
              achievement.id === achievementId
                ? { ...achievement, isUnlocked: true, progress: 1, unlockedAt: new Date() }
                : achievement
            ),
          }));
          playSound(SoundType.ACHIEVEMENT);
        },

        getAchievementProgress: (achievementId: string): number => {
          const achievement = get().achievements.find((a) => a.id === achievementId);
          return achievement?.progress || 0;
        },

        resetAchievements: () => {
          set({ achievements: defaultAchievements });
        },
      }),
      {
        name: 'california-puzzle-achievements',
        partialize: (state) => ({
          achievements: state.achievements,
        }),
      }
    ),
    { name: 'Achievements' }
  )
);
