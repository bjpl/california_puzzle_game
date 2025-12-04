/**
 * County Placement Store Unit Tests
 *
 * Purpose: Test county placement state management and actions
 * Coverage: Initial state, place/remove/move counties, hints, reset
 *
 * Last updated: 2025-12-03
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import {
  useCountyPlacementStore,
  type CountyHint
} from '../../../src/stores/countyPlacementStore';
import { useScoringStore } from '../../../src/stores/scoringStore';
import { useHintStore } from '../../../src/stores/hintSystemStore';
import { useGameLifecycleStore } from '../../../src/stores/gameLifecycleStore';
import type { CountyPiece, Position, PlacementResult } from '../../../src/types';
import { DifficultyLevel, CaliforniaRegion } from '../../../src/types';

// Mock dependencies
vi.mock('../../../src/stores/scoringStore', () => ({
  useScoringStore: {
    getState: vi.fn(() => ({
      calculateScore: vi.fn(() => 100),
      updateScore: vi.fn(),
      updateStreak: vi.fn(),
      updatePlacementStats: vi.fn(),
    })),
  },
}));

vi.mock('../../../src/stores/hintSystemStore', () => ({
  useHintStore: {
    getState: vi.fn(() => ({
      analyzePlayerStruggle: vi.fn(),
    })),
  },
}));

vi.mock('../../../src/stores/gameLifecycleStore', () => ({
  useGameLifecycleStore: {
    getState: vi.fn(() => ({
      difficulty: 'medium',
      timeElapsed: 5000,
      currentMode: {
        dropZoneTolerance: 60,
        scoreMultiplier: 1.5,
      },
    })),
  },
}));

vi.mock('../../../src/config/gameModes', () => ({
  getDifficultySettings: vi.fn(() => ({
    dropZoneTolerance: 60,
    showCountyOutlines: true,
    showCountyNames: false,
    showInitials: true,
    enableHints: true,
    timeMultiplier: 1.2,
    scoreMultiplier: 1.5,
    rotationEnabled: false,
  })),
}));

describe('County Placement Store', () => {
  // Test data
  const mockCounty: CountyPiece = {
    id: 'los-angeles',
    name: 'Los Angeles',
    fips: '06037',
    region: CaliforniaRegion.SOUTHERN,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-118.2437, 34.0522],
    difficulty: DifficultyLevel.EASY,
    isPlaced: false,
    currentPosition: { x: 0, y: 0 },
    targetPosition: { x: 500, y: 400 },
    rotation: 0,
    scale: 1,
    zIndex: 0,
  };

  const mockCounty2: CountyPiece = {
    id: 'san-francisco',
    name: 'San Francisco',
    fips: '06075',
    region: CaliforniaRegion.BAY_AREA,
    geometry: {} as GeoJSON.Geometry,
    centroid: [-122.4194, 37.7749],
    difficulty: DifficultyLevel.MEDIUM,
    isPlaced: false,
    currentPosition: { x: 0, y: 0 },
    targetPosition: { x: 200, y: 150 },
    rotation: 0,
    scale: 1,
    zIndex: 0,
  };

  const mockHint: CountyHint = {
    id: 'los-angeles',
    name: 'Los Angeles',
    region: 'southern',
  };

  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useCountyPlacementStore.setState({
        placedCounties: [],
        remainingCounties: [],
        currentHint: undefined,
        lastPlacementResult: null,
      });
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useCountyPlacementStore.getState();

      expect(state.placedCounties).toEqual([]);
      expect(state.remainingCounties).toEqual([]);
      expect(state.currentHint).toBeUndefined();
      expect(state.lastPlacementResult).toBeNull();
    });

    it('should have all required actions', () => {
      const state = useCountyPlacementStore.getState();

      expect(state.placeCounty).toBeDefined();
      expect(state.removeCounty).toBeDefined();
      expect(state.moveCounty).toBeDefined();
      expect(state.setRemainingCounties).toBeDefined();
      expect(state.setCurrentHint).toBeDefined();
      expect(state.resetCounties).toBeDefined();
    });
  });

  describe('placeCounty Action', () => {
    it('should place county correctly with high accuracy', () => {
      const placedPosition: Position = { x: 505, y: 402 }; // Very close to target (500, 400)

      act(() => {
        useCountyPlacementStore.setState({
          remainingCounties: [mockCounty],
        });
      });

      let result: PlacementResult;
      act(() => {
        const { placeCounty } = useCountyPlacementStore.getState();
        result = placeCounty(mockCounty, placedPosition);
      });

      const state = useCountyPlacementStore.getState();

      // Check placement result
      expect(result!.county).toEqual(mockCounty);
      expect(result!.isCorrect).toBe(true);
      expect(result!.accuracy).toBeGreaterThan(0.8);
      expect(result!.scoreAwarded).toBe(100);

      // Check state updates
      expect(state.placedCounties).toHaveLength(1);
      expect(state.placedCounties[0].id).toBe('los-angeles');
      expect(state.placedCounties[0].isPlaced).toBe(true);
      expect(state.placedCounties[0].currentPosition).toEqual(placedPosition);
      expect(state.remainingCounties).toHaveLength(0);
      expect(state.lastPlacementResult).toEqual(result);
    });

    it('should place county incorrectly with low accuracy', () => {
      const placedPosition: Position = { x: 600, y: 500 }; // Far from target (500, 400)

      act(() => {
        useCountyPlacementStore.setState({
          remainingCounties: [mockCounty],
        });
      });

      let result: PlacementResult;
      act(() => {
        const { placeCounty } = useCountyPlacementStore.getState();
        result = placeCounty(mockCounty, placedPosition);
      });

      const state = useCountyPlacementStore.getState();

      // Check placement result
      expect(result!.isCorrect).toBe(false);
      expect(result!.accuracy).toBeLessThanOrEqual(0.8);
      expect(result!.distance).toBeGreaterThan(60); // Outside tolerance

      // County should still be placed (not removed)
      expect(state.placedCounties).toHaveLength(1);
      expect(state.remainingCounties).toHaveLength(0);
    });

    it('should calculate accuracy correctly at boundary', () => {
      const placedPosition: Position = { x: 548, y: 400 }; // At tolerance boundary (48px from 500, 400)

      act(() => {
        useCountyPlacementStore.setState({
          remainingCounties: [mockCounty],
        });
      });

      let result: PlacementResult;
      act(() => {
        const { placeCounty } = useCountyPlacementStore.getState();
        result = placeCounty(mockCounty, placedPosition);
      });

      // At 48px distance with 60px tolerance, accuracy should be ~0.2 (within tolerance but low)
      expect(result!.accuracy).toBeGreaterThan(0);
      expect(result!.accuracy).toBeLessThan(0.8);
      expect(result!.isCorrect).toBe(false);
    });

    it('should update scoring store correctly', () => {
      const placedPosition: Position = { x: 505, y: 402 };

      act(() => {
        useCountyPlacementStore.setState({
          remainingCounties: [mockCounty],
        });
      });

      const scoringStore = useScoringStore.getState();

      act(() => {
        const { placeCounty } = useCountyPlacementStore.getState();
        placeCounty(mockCounty, placedPosition);
      });

      expect(scoringStore.calculateScore).toHaveBeenCalled();
      expect(scoringStore.updateScore).toHaveBeenCalledWith(100);
      expect(scoringStore.updateStreak).toHaveBeenCalled();
      expect(scoringStore.updatePlacementStats).toHaveBeenCalled();
    });

    it('should update hint store with struggle analysis', () => {
      const placedPosition: Position = { x: 600, y: 500 };

      act(() => {
        useCountyPlacementStore.setState({
          remainingCounties: [mockCounty],
        });
      });

      const hintStore = useHintStore.getState();

      act(() => {
        const { placeCounty } = useCountyPlacementStore.getState();
        placeCounty(mockCounty, placedPosition);
      });

      expect(hintStore.analyzePlayerStruggle).toHaveBeenCalledWith(
        'los-angeles',
        placedPosition,
        false
      );
    });

    it('should handle multiple consecutive placements', () => {
      act(() => {
        useCountyPlacementStore.setState({
          remainingCounties: [mockCounty, mockCounty2],
        });
      });

      act(() => {
        const { placeCounty } = useCountyPlacementStore.getState();
        placeCounty(mockCounty, { x: 505, y: 402 });
      });

      let state = useCountyPlacementStore.getState();
      expect(state.placedCounties).toHaveLength(1);
      expect(state.remainingCounties).toHaveLength(1);

      act(() => {
        const { placeCounty } = useCountyPlacementStore.getState();
        placeCounty(mockCounty2, { x: 202, y: 152 });
      });

      state = useCountyPlacementStore.getState();
      expect(state.placedCounties).toHaveLength(2);
      expect(state.remainingCounties).toHaveLength(0);
    });
  });

  describe('removeCounty Action', () => {
    it('should remove placed county and return to remaining', () => {
      act(() => {
        useCountyPlacementStore.setState({
          placedCounties: [{ ...mockCounty, isPlaced: true }],
          remainingCounties: [],
        });
      });

      act(() => {
        const { removeCounty } = useCountyPlacementStore.getState();
        removeCounty('los-angeles');
      });

      const state = useCountyPlacementStore.getState();

      expect(state.placedCounties).toHaveLength(0);
      expect(state.remainingCounties).toHaveLength(1);
      expect(state.remainingCounties[0].id).toBe('los-angeles');
      expect(state.remainingCounties[0].isPlaced).toBe(false);
    });

    it('should handle removing non-existent county gracefully', () => {
      act(() => {
        useCountyPlacementStore.setState({
          placedCounties: [{ ...mockCounty, isPlaced: true }],
          remainingCounties: [],
        });
      });

      act(() => {
        const { removeCounty } = useCountyPlacementStore.getState();
        removeCounty('non-existent-county');
      });

      const state = useCountyPlacementStore.getState();

      // State should remain unchanged
      expect(state.placedCounties).toHaveLength(1);
      expect(state.remainingCounties).toHaveLength(0);
    });

    it('should preserve county properties when removing', () => {
      const placedCounty = {
        ...mockCounty,
        isPlaced: true,
        currentPosition: { x: 505, y: 402 },
        rotation: 45,
      };

      act(() => {
        useCountyPlacementStore.setState({
          placedCounties: [placedCounty],
          remainingCounties: [],
        });
      });

      act(() => {
        const { removeCounty } = useCountyPlacementStore.getState();
        removeCounty('los-angeles');
      });

      const state = useCountyPlacementStore.getState();

      expect(state.remainingCounties[0].rotation).toBe(45);
      expect(state.remainingCounties[0].currentPosition).toEqual({ x: 505, y: 402 });
    });

    it('should handle removing from multiple placed counties', () => {
      act(() => {
        useCountyPlacementStore.setState({
          placedCounties: [
            { ...mockCounty, isPlaced: true },
            { ...mockCounty2, isPlaced: true },
          ],
          remainingCounties: [],
        });
      });

      act(() => {
        const { removeCounty } = useCountyPlacementStore.getState();
        removeCounty('san-francisco');
      });

      const state = useCountyPlacementStore.getState();

      expect(state.placedCounties).toHaveLength(1);
      expect(state.placedCounties[0].id).toBe('los-angeles');
      expect(state.remainingCounties).toHaveLength(1);
      expect(state.remainingCounties[0].id).toBe('san-francisco');
    });
  });

  describe('moveCounty Action', () => {
    it('should move placed county to new position', () => {
      const initialPosition: Position = { x: 100, y: 100 };
      const newPosition: Position = { x: 200, y: 200 };

      act(() => {
        useCountyPlacementStore.setState({
          placedCounties: [
            { ...mockCounty, isPlaced: true, currentPosition: initialPosition },
          ],
        });
      });

      act(() => {
        const { moveCounty } = useCountyPlacementStore.getState();
        moveCounty('los-angeles', newPosition);
      });

      const state = useCountyPlacementStore.getState();

      expect(state.placedCounties[0].currentPosition).toEqual(newPosition);
    });

    it('should only move specified county', () => {
      act(() => {
        useCountyPlacementStore.setState({
          placedCounties: [
            { ...mockCounty, isPlaced: true, currentPosition: { x: 100, y: 100 } },
            { ...mockCounty2, isPlaced: true, currentPosition: { x: 300, y: 300 } },
          ],
        });
      });

      act(() => {
        const { moveCounty } = useCountyPlacementStore.getState();
        moveCounty('los-angeles', { x: 200, y: 200 });
      });

      const state = useCountyPlacementStore.getState();

      expect(state.placedCounties[0].currentPosition).toEqual({ x: 200, y: 200 });
      expect(state.placedCounties[1].currentPosition).toEqual({ x: 300, y: 300 });
    });

    it('should handle moving non-existent county gracefully', () => {
      const initialState = {
        placedCounties: [
          { ...mockCounty, isPlaced: true, currentPosition: { x: 100, y: 100 } },
        ],
      };

      act(() => {
        useCountyPlacementStore.setState(initialState);
      });

      act(() => {
        const { moveCounty } = useCountyPlacementStore.getState();
        moveCounty('non-existent-county', { x: 200, y: 200 });
      });

      const state = useCountyPlacementStore.getState();

      // State should remain unchanged
      expect(state.placedCounties[0].currentPosition).toEqual({ x: 100, y: 100 });
    });

    it('should preserve other county properties when moving', () => {
      act(() => {
        useCountyPlacementStore.setState({
          placedCounties: [
            {
              ...mockCounty,
              isPlaced: true,
              currentPosition: { x: 100, y: 100 },
              rotation: 45,
              scale: 1.2,
            },
          ],
        });
      });

      act(() => {
        const { moveCounty } = useCountyPlacementStore.getState();
        moveCounty('los-angeles', { x: 200, y: 200 });
      });

      const state = useCountyPlacementStore.getState();

      expect(state.placedCounties[0].rotation).toBe(45);
      expect(state.placedCounties[0].scale).toBe(1.2);
      expect(state.placedCounties[0].isPlaced).toBe(true);
    });
  });

  describe('setRemainingCounties Action', () => {
    it('should set remaining counties', () => {
      const counties: CountyPiece[] = [mockCounty, mockCounty2];

      act(() => {
        const { setRemainingCounties } = useCountyPlacementStore.getState();
        setRemainingCounties(counties);
      });

      const state = useCountyPlacementStore.getState();

      expect(state.remainingCounties).toEqual(counties);
      expect(state.remainingCounties).toHaveLength(2);
    });

    it('should replace existing remaining counties', () => {
      act(() => {
        useCountyPlacementStore.setState({
          remainingCounties: [mockCounty],
        });
      });

      const newCounties: CountyPiece[] = [mockCounty2];

      act(() => {
        const { setRemainingCounties } = useCountyPlacementStore.getState();
        setRemainingCounties(newCounties);
      });

      const state = useCountyPlacementStore.getState();

      expect(state.remainingCounties).toEqual(newCounties);
      expect(state.remainingCounties).toHaveLength(1);
      expect(state.remainingCounties[0].id).toBe('san-francisco');
    });

    it('should handle empty array', () => {
      act(() => {
        useCountyPlacementStore.setState({
          remainingCounties: [mockCounty],
        });
      });

      act(() => {
        const { setRemainingCounties } = useCountyPlacementStore.getState();
        setRemainingCounties([]);
      });

      const state = useCountyPlacementStore.getState();

      expect(state.remainingCounties).toEqual([]);
    });
  });

  describe('setCurrentHint Action', () => {
    it('should set current hint', () => {
      act(() => {
        const { setCurrentHint } = useCountyPlacementStore.getState();
        setCurrentHint(mockHint);
      });

      const state = useCountyPlacementStore.getState();

      expect(state.currentHint).toEqual(mockHint);
    });

    it('should clear hint when undefined', () => {
      act(() => {
        useCountyPlacementStore.setState({
          currentHint: mockHint,
        });
      });

      act(() => {
        const { setCurrentHint } = useCountyPlacementStore.getState();
        setCurrentHint(undefined);
      });

      const state = useCountyPlacementStore.getState();

      expect(state.currentHint).toBeUndefined();
    });

    it('should replace existing hint', () => {
      const newHint: CountyHint = {
        id: 'san-francisco',
        name: 'San Francisco',
        region: 'bay_area',
      };

      act(() => {
        useCountyPlacementStore.setState({
          currentHint: mockHint,
        });
      });

      act(() => {
        const { setCurrentHint } = useCountyPlacementStore.getState();
        setCurrentHint(newHint);
      });

      const state = useCountyPlacementStore.getState();

      expect(state.currentHint).toEqual(newHint);
      expect(state.currentHint?.id).toBe('san-francisco');
    });
  });

  describe('resetCounties Action', () => {
    it('should reset all state to initial values', () => {
      act(() => {
        useCountyPlacementStore.setState({
          placedCounties: [{ ...mockCounty, isPlaced: true }],
          remainingCounties: [mockCounty2],
          currentHint: mockHint,
          lastPlacementResult: {
            county: mockCounty,
            accuracy: 0.95,
            distance: 10,
            isCorrect: true,
            scoreAwarded: 100,
            timeToPlace: 5000,
          },
        });
      });

      act(() => {
        const { resetCounties } = useCountyPlacementStore.getState();
        resetCounties();
      });

      const state = useCountyPlacementStore.getState();

      expect(state.placedCounties).toEqual([]);
      expect(state.remainingCounties).toEqual([]);
      expect(state.currentHint).toBeUndefined();
      expect(state.lastPlacementResult).toBeNull();
    });

    it('should handle reset when already at initial state', () => {
      act(() => {
        const { resetCounties } = useCountyPlacementStore.getState();
        resetCounties();
      });

      const state = useCountyPlacementStore.getState();

      expect(state.placedCounties).toEqual([]);
      expect(state.remainingCounties).toEqual([]);
      expect(state.currentHint).toBeUndefined();
      expect(state.lastPlacementResult).toBeNull();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle placement with zero tolerance', () => {
      // Mock zero tolerance setting
      vi.mocked(useGameLifecycleStore.getState).mockReturnValueOnce({
        difficulty: DifficultyLevel.EXPERT,
        timeElapsed: 5000,
        currentMode: {
          dropZoneTolerance: 0,
          scoreMultiplier: 3.0,
        },
      } as ReturnType<typeof useGameLifecycleStore.getState>);

      const exactPosition: Position = { x: 500, y: 400 };

      act(() => {
        useCountyPlacementStore.setState({
          remainingCounties: [mockCounty],
        });
      });

      let result: PlacementResult;
      act(() => {
        const { placeCounty } = useCountyPlacementStore.getState();
        result = placeCounty(mockCounty, exactPosition);
      });

      // With zero tolerance, only exact placement is correct
      expect(result!.isCorrect).toBe(true);
      expect(result!.accuracy).toBe(1);
    });

    it('should handle very large distances', () => {
      const farPosition: Position = { x: 10000, y: 10000 };

      act(() => {
        useCountyPlacementStore.setState({
          remainingCounties: [mockCounty],
        });
      });

      let result: PlacementResult;
      act(() => {
        const { placeCounty } = useCountyPlacementStore.getState();
        result = placeCounty(mockCounty, farPosition);
      });

      expect(result!.isCorrect).toBe(false);
      expect(result!.accuracy).toBe(0);
      expect(result!.distance).toBeGreaterThan(1000);
    });

    it('should handle negative coordinates', () => {
      const negativePosition: Position = { x: -100, y: -100 };

      act(() => {
        useCountyPlacementStore.setState({
          remainingCounties: [mockCounty],
        });
      });

      let result: PlacementResult;
      act(() => {
        const { placeCounty } = useCountyPlacementStore.getState();
        result = placeCounty(mockCounty, negativePosition);
      });

      expect(result).toBeDefined();
      expect(result!.distance).toBeGreaterThan(0);
    });

    it('should handle placing same county twice (edge case)', () => {
      act(() => {
        useCountyPlacementStore.setState({
          remainingCounties: [mockCounty],
        });
      });

      // First placement
      act(() => {
        const { placeCounty } = useCountyPlacementStore.getState();
        placeCounty(mockCounty, { x: 505, y: 402 });
      });

      let state = useCountyPlacementStore.getState();
      expect(state.placedCounties).toHaveLength(1);
      expect(state.remainingCounties).toHaveLength(0);

      // Attempt second placement (county no longer in remaining)
      act(() => {
        const { placeCounty } = useCountyPlacementStore.getState();
        placeCounty(mockCounty, { x: 510, y: 405 });
      });

      state = useCountyPlacementStore.getState();
      // Should add duplicate to placed (no validation in store)
      expect(state.placedCounties).toHaveLength(2);
    });

    it('should handle concurrent operations', () => {
      act(() => {
        useCountyPlacementStore.setState({
          remainingCounties: [mockCounty, mockCounty2],
        });
      });

      // Simulate concurrent placement and hint update
      act(() => {
        const store = useCountyPlacementStore.getState();
        store.placeCounty(mockCounty, { x: 505, y: 402 });
        store.setCurrentHint(mockHint);
      });

      const state = useCountyPlacementStore.getState();

      expect(state.placedCounties).toHaveLength(1);
      expect(state.currentHint).toEqual(mockHint);
    });

    it('should handle lastPlacementResult updates correctly', () => {
      act(() => {
        useCountyPlacementStore.setState({
          remainingCounties: [mockCounty, mockCounty2],
        });
      });

      // First placement
      act(() => {
        const { placeCounty } = useCountyPlacementStore.getState();
        placeCounty(mockCounty, { x: 505, y: 402 });
      });

      let state = useCountyPlacementStore.getState();
      const firstResult = state.lastPlacementResult;
      expect(firstResult?.county.id).toBe('los-angeles');

      // Second placement
      act(() => {
        const { placeCounty } = useCountyPlacementStore.getState();
        placeCounty(mockCounty2, { x: 202, y: 152 });
      });

      state = useCountyPlacementStore.getState();
      const secondResult = state.lastPlacementResult;
      expect(secondResult?.county.id).toBe('san-francisco');
      expect(secondResult).not.toEqual(firstResult);
    });
  });
});
