/**
 * Store Coordinator Tests
 * Tests cross-store coordination via Zustand subscriptions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initializeStoreCoordination,
  isCoordinationInitialized,
  resetCoordination,
} from '../../../src/stores/storeCoordinator';
import { useCountyPlacementStore } from '../../../src/stores/countyPlacementStore';
import { useAchievementStore } from '../../../src/stores/achievementStore';

// Mock logger
vi.mock('../../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('storeCoordinator', () => {
  beforeEach(() => {
    // Reset all stores before each test
    resetCoordination();
    useCountyPlacementStore.setState({
      placedCounties: [],
      remainingCounties: [],
      lastPlacementResult: null,
    });
    useAchievementStore.getState().resetAchievements();
  });

  afterEach(() => {
    // Clean up subscriptions
    resetCoordination();
    vi.clearAllMocks();
  });

  describe('initializeStoreCoordination', () => {
    it('should initialize coordination and return cleanup function', () => {
      expect(isCoordinationInitialized()).toBe(false);

      const cleanup = initializeStoreCoordination();

      expect(isCoordinationInitialized()).toBe(true);
      expect(typeof cleanup).toBe('function');
    });

    it('should return no-op if already initialized', () => {
      initializeStoreCoordination();
      const secondCleanup = initializeStoreCoordination();

      // Should still be initialized
      expect(isCoordinationInitialized()).toBe(true);
      expect(typeof secondCleanup).toBe('function');
    });

    it('should clean up subscriptions when cleanup is called', () => {
      const cleanup = initializeStoreCoordination();
      expect(isCoordinationInitialized()).toBe(true);

      cleanup();

      expect(isCoordinationInitialized()).toBe(false);
    });
  });

  describe('isCoordinationInitialized', () => {
    it('should return false initially', () => {
      expect(isCoordinationInitialized()).toBe(false);
    });

    it('should return true after initialization', () => {
      initializeStoreCoordination();
      expect(isCoordinationInitialized()).toBe(true);
    });

    it('should return false after reset', () => {
      initializeStoreCoordination();
      resetCoordination();
      expect(isCoordinationInitialized()).toBe(false);
    });
  });

  describe('resetCoordination', () => {
    it('should reset initialization state', () => {
      initializeStoreCoordination();
      expect(isCoordinationInitialized()).toBe(true);

      resetCoordination();

      expect(isCoordinationInitialized()).toBe(false);
    });

    it('should allow re-initialization after reset', () => {
      initializeStoreCoordination();
      resetCoordination();

      const cleanup = initializeStoreCoordination();

      expect(isCoordinationInitialized()).toBe(true);
      expect(typeof cleanup).toBe('function');
    });
  });

  describe('County Placement → Achievement subscription', () => {
    it('should trigger achievement check when county is placed', () => {
      const checkAchievementsSpy = vi.spyOn(
        useAchievementStore.getState(),
        'checkAchievements'
      );

      initializeStoreCoordination();

      // Simulate a county placement
      useCountyPlacementStore.setState({
        lastPlacementResult: {
          county: { name: 'Alameda', id: 'alameda' },
          isCorrect: true,
          attempts: 1,
          timestamp: Date.now(),
        },
        remainingCounties: [],
      });

      expect(checkAchievementsSpy).toHaveBeenCalled();
    });

    it('should not trigger achievement check when lastPlacementResult is null', () => {
      const checkAchievementsSpy = vi.spyOn(
        useAchievementStore.getState(),
        'checkAchievements'
      );

      initializeStoreCoordination();

      // Set null placement result
      useCountyPlacementStore.setState({
        lastPlacementResult: null,
      });

      expect(checkAchievementsSpy).not.toHaveBeenCalled();
    });

    it('should not trigger for same placement result', () => {
      const placementResult = {
        county: { name: 'Alameda', id: 'alameda' },
        isCorrect: true,
        attempts: 1,
        timestamp: Date.now(),
      };

      // Set initial placement before coordination
      useCountyPlacementStore.setState({
        lastPlacementResult: placementResult,
        remainingCounties: [],
      });

      const checkAchievementsSpy = vi.spyOn(
        useAchievementStore.getState(),
        'checkAchievements'
      );

      initializeStoreCoordination();

      // Trigger another state update with same result
      useCountyPlacementStore.setState({
        remainingCounties: ['other'],
      });

      // Should not call because lastPlacementResult didn't change
      expect(checkAchievementsSpy).not.toHaveBeenCalled();
    });

    it('should pass remainingCounties to checkAchievements', () => {
      const checkAchievementsSpy = vi.spyOn(
        useAchievementStore.getState(),
        'checkAchievements'
      );

      initializeStoreCoordination();

      const remainingCounties = ['county1', 'county2'];
      useCountyPlacementStore.setState({
        lastPlacementResult: {
          county: { name: 'Test', id: 'test' },
          isCorrect: true,
          attempts: 1,
          timestamp: Date.now(),
        },
        remainingCounties,
      });

      expect(checkAchievementsSpy).toHaveBeenCalledWith(
        expect.objectContaining({ county: { name: 'Test', id: 'test' } }),
        remainingCounties
      );
    });
  });

  describe('Multiple initializations', () => {
    it('should handle rapid init/cleanup cycles', () => {
      for (let i = 0; i < 5; i++) {
        const cleanup = initializeStoreCoordination();
        expect(isCoordinationInitialized()).toBe(true);
        cleanup();
        expect(isCoordinationInitialized()).toBe(false);
      }
    });
  });
});
