/**
 * County Placement Store
 * Manages county placement, removal, and movement
 * Single responsibility: county piece management
 *
 * NOTE: This store does NOT import achievementStore to avoid circular deps.
 * Achievement checking is handled via Zustand subscriptions in storeCoordinator.ts
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CountyPiece, Position, PlacementResult } from '@/types';
import { useScoringStore } from './scoringStore';
import { useHintStore } from './hintSystemStore';
import { useGameLifecycleStore } from './gameLifecycleStore';
import { getDifficultySettings } from '@/config/gameModes';

// Minimal hint type - compatible with both @/types.County and californiaCountiesComplete.County
export interface CountyHint {
  id: string;
  name: string;
  region: string;
}

export interface CountyPlacementState {
  placedCounties: CountyPiece[];
  remainingCounties: CountyPiece[];
  currentHint: CountyHint | undefined;
  // Last placement result for subscribers (achievement checking)
  lastPlacementResult: PlacementResult | null;
}

interface CountyPlacementActions {
  placeCounty: (county: CountyPiece, position: Position) => PlacementResult;
  removeCounty: (countyId: string) => void;
  moveCounty: (countyId: string, position: Position) => void;
  setRemainingCounties: (counties: CountyPiece[]) => void;
  setCurrentHint: (county: CountyHint | undefined) => void;
  resetCounties: () => void;
}

export type CountyPlacementStore = CountyPlacementState & CountyPlacementActions;

const calculatePlacementAccuracy = (
  targetPosition: Position,
  actualPosition: Position,
  tolerance: number = 50
): number => {
  const distance = Math.sqrt(
    Math.pow(targetPosition.x - actualPosition.x, 2) +
      Math.pow(targetPosition.y - actualPosition.y, 2)
  );

  if (distance <= tolerance) {
    return Math.max(0, 1 - distance / tolerance);
  }
  return 0;
};

export const useCountyPlacementStore = create<CountyPlacementStore>()(
  devtools(
    (set) => ({
      // Initial state
      placedCounties: [],
      remainingCounties: [],
      currentHint: undefined,
      lastPlacementResult: null,

      placeCounty: (county: CountyPiece, position: Position): PlacementResult => {
        const lifecycleState = useGameLifecycleStore.getState();
        const difficultySettings = getDifficultySettings(lifecycleState.difficulty);
        const tolerance =
          lifecycleState.currentMode.dropZoneTolerance || difficultySettings.dropZoneTolerance;

        const accuracy = calculatePlacementAccuracy(county.targetPosition, position, tolerance);
        const isCorrect = accuracy > 0.8;
        const timeToPlace = lifecycleState.timeElapsed;

        // Calculate score from scoring store
        const scoringStore = useScoringStore.getState();
        const modeMultiplier = lifecycleState.currentMode.scoreMultiplier || 1.0;
        const scoreAwarded = scoringStore.calculateScore(
          lifecycleState.difficulty,
          accuracy,
          timeToPlace,
          modeMultiplier
        );

        const result: PlacementResult = {
          county,
          accuracy,
          distance: Math.sqrt(
            Math.pow(county.targetPosition.x - position.x, 2) +
              Math.pow(county.targetPosition.y - position.y, 2)
          ),
          isCorrect,
          scoreAwarded,
          timeToPlace,
        };

        // Update placement state and store result for subscribers
        set((prevState) => ({
          placedCounties: [
            ...prevState.placedCounties,
            {
              ...county,
              isPlaced: true,
              currentPosition: position,
            },
          ],
          remainingCounties: prevState.remainingCounties.filter((c) => c.id !== county.id),
          lastPlacementResult: result, // For achievement subscription
        }));

        // Update scoring store (leaf store - no circular dep)
        scoringStore.updateScore(scoreAwarded);
        scoringStore.updateStreak(isCorrect);
        scoringStore.updatePlacementStats(result);

        // Update hint store (leaf store - no circular dep)
        useHintStore.getState().analyzePlayerStruggle(county.id, position, isCorrect);

        // NOTE: Achievement checking removed - handled via subscription in storeCoordinator.ts
        // This breaks the circular dependency: countyPlacement -> achievement -> countyPlacement

        return result;
      },

      removeCounty: (countyId: string) => {
        set((state) => {
          const county = state.placedCounties.find((c) => c.id === countyId);
          if (!county) return state;

          return {
            placedCounties: state.placedCounties.filter((c) => c.id !== countyId),
            remainingCounties: [...state.remainingCounties, { ...county, isPlaced: false }],
          };
        });
      },

      moveCounty: (countyId: string, position: Position) => {
        set((state) => ({
          placedCounties: state.placedCounties.map((county) =>
            county.id === countyId ? { ...county, currentPosition: position } : county
          ),
        }));
      },

      setRemainingCounties: (counties: CountyPiece[]) => {
        set({ remainingCounties: counties });
      },

      setCurrentHint: (county: CountyHint | undefined) => {
        set({ currentHint: county });
      },

      resetCounties: () => {
        set({
          placedCounties: [],
          remainingCounties: [],
          currentHint: undefined,
          lastPlacementResult: null,
        });
      },
    }),
    { name: 'CountyPlacement' }
  )
);
