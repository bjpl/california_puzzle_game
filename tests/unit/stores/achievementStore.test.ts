/**
 * Unit tests for achievementStore
 * Tests achievement management, unlocking, progress tracking, and criteria evaluation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAchievementStore } from '../../../src/stores/achievementStore';
import { useGameLifecycleStore } from '../../../src/stores/gameLifecycleStore';
import { useScoringStore } from '../../../src/stores/scoringStore';
import * as soundManager from '../../../src/utils/soundManager';
import type {
  AchievementCategory,
  CaliforniaRegion,
  DifficultyLevel,
  PlacementResult,
  County,
  CountyPiece,
} from '../../../src/types/index';

// Mock the sound manager
vi.mock('../../../src/utils/soundManager', () => ({
  playSound: vi.fn(),
  SoundType: {
    ACHIEVEMENT: 'achievement',
    CORRECT: 'correct',
    INCORRECT: 'incorrect',
    CLICK: 'click',
  },
}));

// Mock the config to prevent import issues
vi.mock('../../../src/config/gameModes', () => ({
  GAME_MODES: {},
  getDifficultySettings: vi.fn(() => ({})),
}));

describe('achievementStore', () => {
  beforeEach(() => {
    // Reset achievementStore using resetAchievements action
    useAchievementStore.getState().resetAchievements();

    // Reset scoringStore to initial state
    useScoringStore.setState({
      score: 0,
      streak: 0,
      bestStreak: 0,
      accuracy: 1,
      totalAttempts: 0,
      correctPlacements: 0,
      totalTimeSpent: 0,
    });

    // Reset gameLifecycleStore to initial state
    useGameLifecycleStore.setState({
      selectedRegion: CaliforniaRegion.BAY_AREA,
      difficulty: DifficultyLevel.EASY,
      isGameActive: false,
      isPaused: false,
    });

    // Clear any mocks
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default achievements', () => {
      const state = useAchievementStore.getState();

      expect(state.achievements).toBeDefined();
      expect(state.achievements.length).toBeGreaterThan(0);
      expect(Array.isArray(state.achievements)).toBe(true);
    });

    it('should have all achievements locked initially', () => {
      const state = useAchievementStore.getState();

      state.achievements.forEach(achievement => {
        expect(achievement.isUnlocked).toBe(false);
        expect(achievement.progress).toBe(0);
        expect(achievement.unlockedAt).toBeUndefined();
      });
    });

    it('should have required properties for each achievement', () => {
      const state = useAchievementStore.getState();

      state.achievements.forEach(achievement => {
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('name');
        expect(achievement).toHaveProperty('description');
        expect(achievement).toHaveProperty('icon');
        expect(achievement).toHaveProperty('progress');
        expect(achievement).toHaveProperty('isUnlocked');
        expect(achievement).toHaveProperty('category');
        expect(typeof achievement.id).toBe('string');
        expect(typeof achievement.name).toBe('string');
        expect(typeof achievement.description).toBe('string');
        expect(typeof achievement.icon).toBe('string');
        expect(typeof achievement.progress).toBe('number');
        expect(typeof achievement.isUnlocked).toBe('boolean');
      });
    });
  });

  describe('Achievement Definitions', () => {
    it('should have first_county achievement', () => {
      const state = useAchievementStore.getState();
      const achievement = state.achievements.find(a => a.id === 'first_county');

      expect(achievement).toBeDefined();
      expect(achievement?.name).toBe('First Steps');
      expect(achievement?.category).toBe(AchievementCategory.COMPLETION);
    });

    it('should have perfect_placement achievement', () => {
      const state = useAchievementStore.getState();
      const achievement = state.achievements.find(a => a.id === 'perfect_placement');

      expect(achievement).toBeDefined();
      expect(achievement?.name).toBe('Bullseye');
      expect(achievement?.category).toBe(AchievementCategory.ACCURACY);
    });

    it('should have speed_demon achievement', () => {
      const state = useAchievementStore.getState();
      const achievement = state.achievements.find(a => a.id === 'speed_demon');

      expect(achievement).toBeDefined();
      expect(achievement?.name).toBe('Speed Demon');
      expect(achievement?.category).toBe(AchievementCategory.SPEED);
    });

    it('should have bay_area_master achievement', () => {
      const state = useAchievementStore.getState();
      const achievement = state.achievements.find(a => a.id === 'bay_area_master');

      expect(achievement).toBeDefined();
      expect(achievement?.name).toBe('Bay Area Master');
      expect(achievement?.category).toBe(AchievementCategory.COMPLETION);
    });

    it('should have streak_10 achievement', () => {
      const state = useAchievementStore.getState();
      const achievement = state.achievements.find(a => a.id === 'streak_10');

      expect(achievement).toBeDefined();
      expect(achievement?.name).toBe('On Fire');
      expect(achievement?.category).toBe(AchievementCategory.STREAK);
    });

    it('should have california_expert achievement', () => {
      const state = useAchievementStore.getState();
      const achievement = state.achievements.find(a => a.id === 'california_expert');

      expect(achievement).toBeDefined();
      expect(achievement?.name).toBe('California Expert');
      expect(achievement?.category).toBe(AchievementCategory.COMPLETION);
    });
  });

  describe('Achievement Categories', () => {
    it('should categorize achievements correctly', () => {
      const state = useAchievementStore.getState();

      const accuracyAchievements = state.achievements.filter(
        a => a.category === AchievementCategory.ACCURACY
      );
      const speedAchievements = state.achievements.filter(
        a => a.category === AchievementCategory.SPEED
      );
      const completionAchievements = state.achievements.filter(
        a => a.category === AchievementCategory.COMPLETION
      );
      const streakAchievements = state.achievements.filter(
        a => a.category === AchievementCategory.STREAK
      );

      expect(accuracyAchievements.length).toBeGreaterThan(0);
      expect(speedAchievements.length).toBeGreaterThan(0);
      expect(completionAchievements.length).toBeGreaterThan(0);
      expect(streakAchievements.length).toBeGreaterThan(0);
    });

    it('should have all valid categories', () => {
      const state = useAchievementStore.getState();
      const validCategories = Object.values(AchievementCategory);

      state.achievements.forEach(achievement => {
        expect(validCategories).toContain(achievement.category);
      });
    });
  });

  describe('unlockAchievement', () => {
    it('should unlock a specific achievement', () => {
      const store = useAchievementStore.getState();

      store.unlockAchievement('first_county');

      const achievement = useAchievementStore.getState().achievements.find(
        a => a.id === 'first_county'
      );

      expect(achievement?.isUnlocked).toBe(true);
      expect(achievement?.progress).toBe(1);
      expect(achievement?.unlockedAt).toBeInstanceOf(Date);
    });

    it('should not affect other achievements', () => {
      const store = useAchievementStore.getState();

      store.unlockAchievement('first_county');

      const otherAchievement = useAchievementStore.getState().achievements.find(
        a => a.id === 'perfect_placement'
      );

      expect(otherAchievement?.isUnlocked).toBe(false);
      expect(otherAchievement?.progress).toBe(0);
    });

    it('should play achievement sound when unlocking', () => {
      const store = useAchievementStore.getState();

      store.unlockAchievement('first_county');

      expect(soundManager.playSound).toHaveBeenCalledWith(soundManager.SoundType.ACHIEVEMENT);
    });

    it('should handle unlocking already unlocked achievement', () => {
      const store = useAchievementStore.getState();

      store.unlockAchievement('first_county');
      const firstUnlock = useAchievementStore.getState().achievements.find(
        a => a.id === 'first_county'
      )?.unlockedAt;

      store.unlockAchievement('first_county');
      const secondUnlock = useAchievementStore.getState().achievements.find(
        a => a.id === 'first_county'
      )?.unlockedAt;

      // Should update the unlocked date
      expect(firstUnlock).toBeDefined();
      expect(secondUnlock).toBeDefined();
    });

    it('should handle non-existent achievement id gracefully', () => {
      const store = useAchievementStore.getState();

      expect(() => {
        store.unlockAchievement('non_existent_achievement');
      }).not.toThrow();

      // All achievements should remain locked
      const state = useAchievementStore.getState();
      const unlockedCount = state.achievements.filter(a => a.isUnlocked).length;
      expect(unlockedCount).toBe(0);
    });
  });

  describe('checkAchievements - first_county', () => {
    it('should unlock first_county when placing first correct county', () => {
      const store = useAchievementStore.getState();

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.8,
        distance: 10,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      const unlocked = store.checkAchievements(mockPlacement);

      expect(unlocked.length).toBe(1);
      expect(unlocked[0].id).toBe('first_county');

      const achievement = useAchievementStore.getState().achievements.find(
        a => a.id === 'first_county'
      );
      expect(achievement?.isUnlocked).toBe(true);
      expect(achievement?.progress).toBe(1);
    });

    it('should not unlock first_county for incorrect placement', () => {
      const store = useAchievementStore.getState();

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.3,
        distance: 100,
        isCorrect: false,
        scoreAwarded: 0,
        timeToPlace: 5000,
      };

      const unlocked = store.checkAchievements(mockPlacement);

      expect(unlocked.length).toBe(0);

      const achievement = useAchievementStore.getState().achievements.find(
        a => a.id === 'first_county'
      );
      expect(achievement?.isUnlocked).toBe(false);
    });

    it('should play achievement sound when unlocking', () => {
      const store = useAchievementStore.getState();

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 1.0,
        distance: 0,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      store.checkAchievements(mockPlacement);

      expect(soundManager.playSound).toHaveBeenCalledWith(soundManager.SoundType.ACHIEVEMENT);
    });
  });

  describe('checkAchievements - perfect_placement', () => {
    it('should unlock perfect_placement for 100% accuracy', () => {
      const store = useAchievementStore.getState();

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 1.0,
        distance: 0,
        isCorrect: true,
        scoreAwarded: 150,
        timeToPlace: 5000,
      };

      const unlocked = store.checkAchievements(mockPlacement);

      const perfectAchievement = unlocked.find(a => a.id === 'perfect_placement');
      expect(perfectAchievement).toBeDefined();

      const achievement = useAchievementStore.getState().achievements.find(
        a => a.id === 'perfect_placement'
      );
      expect(achievement?.isUnlocked).toBe(true);
      expect(achievement?.progress).toBe(1);
    });

    it('should not unlock perfect_placement for less than 100% accuracy', () => {
      const store = useAchievementStore.getState();

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.99,
        distance: 1,
        isCorrect: true,
        scoreAwarded: 149,
        timeToPlace: 5000,
      };

      const unlocked = store.checkAchievements(mockPlacement);

      const perfectAchievement = unlocked.find(a => a.id === 'perfect_placement');
      expect(perfectAchievement).toBeUndefined();

      const achievement = useAchievementStore.getState().achievements.find(
        a => a.id === 'perfect_placement'
      );
      expect(achievement?.isUnlocked).toBe(false);
    });
  });

  describe('checkAchievements - speed_demon', () => {
    it('should unlock speed_demon when placing in under 3 seconds', () => {
      const store = useAchievementStore.getState();

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.8,
        distance: 10,
        isCorrect: true,
        scoreAwarded: 120,
        timeToPlace: 2999,
      };

      const unlocked = store.checkAchievements(mockPlacement);

      const speedAchievement = unlocked.find(a => a.id === 'speed_demon');
      expect(speedAchievement).toBeDefined();

      const achievement = useAchievementStore.getState().achievements.find(
        a => a.id === 'speed_demon'
      );
      expect(achievement?.isUnlocked).toBe(true);
      expect(achievement?.progress).toBe(1);
    });

    it('should not unlock speed_demon at exactly 3 seconds', () => {
      const store = useAchievementStore.getState();

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.8,
        distance: 10,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 3000,
      };

      const unlocked = store.checkAchievements(mockPlacement);

      const speedAchievement = unlocked.find(a => a.id === 'speed_demon');
      expect(speedAchievement).toBeUndefined();
    });

    it('should not unlock speed_demon for slow placements', () => {
      const store = useAchievementStore.getState();

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.8,
        distance: 10,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      const unlocked = store.checkAchievements(mockPlacement);

      const speedAchievement = unlocked.find(a => a.id === 'speed_demon');
      expect(speedAchievement).toBeUndefined();
    });
  });

  describe('checkAchievements - streak_10', () => {
    it('should track progress based on streak', () => {
      const store = useAchievementStore.getState();
      const scoringStore = useScoringStore.getState();

      // Mock a streak of 5
      scoringStore.addPoints(100);
      scoringStore.addPoints(100);
      scoringStore.addPoints(100);
      scoringStore.addPoints(100);
      scoringStore.addPoints(100);

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.8,
        distance: 10,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      store.checkAchievements(mockPlacement);

      const achievement = useAchievementStore.getState().achievements.find(
        a => a.id === 'streak_10'
      );

      // Progress should be 0.5 (5/10)
      expect(achievement?.progress).toBeGreaterThan(0);
      expect(achievement?.progress).toBeLessThanOrEqual(1);
      expect(achievement?.isUnlocked).toBe(false);
    });

    it('should unlock at streak of 10', () => {
      const store = useAchievementStore.getState();
      const scoringStore = useScoringStore.getState();

      // Build up a streak of 10
      for (let i = 0; i < 10; i++) {
        scoringStore.addPoints(100);
      }

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.8,
        distance: 10,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      const unlocked = store.checkAchievements(mockPlacement);

      const streakAchievement = unlocked.find(a => a.id === 'streak_10');
      expect(streakAchievement).toBeDefined();

      const achievement = useAchievementStore.getState().achievements.find(
        a => a.id === 'streak_10'
      );
      expect(achievement?.isUnlocked).toBe(true);
      expect(achievement?.progress).toBe(1);
    });

    it('should cap progress at 1.0 for streaks over 10', () => {
      const store = useAchievementStore.getState();
      const scoringStore = useScoringStore.getState();

      // Build up a streak of 20
      for (let i = 0; i < 20; i++) {
        scoringStore.addPoints(100);
      }

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.8,
        distance: 10,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      store.checkAchievements(mockPlacement);

      const achievement = useAchievementStore.getState().achievements.find(
        a => a.id === 'streak_10'
      );
      expect(achievement?.progress).toBe(1);
    });
  });

  describe('checkAchievements - bay_area_master', () => {
    it('should unlock when completing Bay Area on Expert difficulty', () => {
      const store = useAchievementStore.getState();
      const lifecycleStore = useGameLifecycleStore.getState();

      // Set up Bay Area Expert game
      lifecycleStore.setRegion(CaliforniaRegion.BAY_AREA);
      lifecycleStore.setDifficulty(DifficultyLevel.EXPERT);

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.8,
        distance: 10,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      // Empty remaining counties = game complete
      const remainingCounties: CountyPiece[] = [];

      const unlocked = store.checkAchievements(mockPlacement, remainingCounties);

      const bayAreaAchievement = unlocked.find(a => a.id === 'bay_area_master');
      expect(bayAreaAchievement).toBeDefined();

      const achievement = useAchievementStore.getState().achievements.find(
        a => a.id === 'bay_area_master'
      );
      expect(achievement?.isUnlocked).toBe(true);
      expect(achievement?.progress).toBe(1);
    });

    it('should not unlock for Bay Area on non-Expert difficulty', () => {
      const store = useAchievementStore.getState();
      const lifecycleStore = useGameLifecycleStore.getState();

      lifecycleStore.setRegion(CaliforniaRegion.BAY_AREA);
      lifecycleStore.setDifficulty(DifficultyLevel.MEDIUM);

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.8,
        distance: 10,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      const remainingCounties: CountyPiece[] = [];

      const unlocked = store.checkAchievements(mockPlacement, remainingCounties);

      const bayAreaAchievement = unlocked.find(a => a.id === 'bay_area_master');
      expect(bayAreaAchievement).toBeUndefined();
    });

    it('should not unlock for non-Bay Area region on Expert', () => {
      const store = useAchievementStore.getState();
      const lifecycleStore = useGameLifecycleStore.getState();

      lifecycleStore.setRegion(CaliforniaRegion.NORTHERN);
      lifecycleStore.setDifficulty(DifficultyLevel.EXPERT);

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.8,
        distance: 10,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      const remainingCounties: CountyPiece[] = [];

      const unlocked = store.checkAchievements(mockPlacement, remainingCounties);

      const bayAreaAchievement = unlocked.find(a => a.id === 'bay_area_master');
      expect(bayAreaAchievement).toBeUndefined();
    });

    it('should not unlock if counties remain', () => {
      const store = useAchievementStore.getState();
      const lifecycleStore = useGameLifecycleStore.getState();

      lifecycleStore.setRegion(CaliforniaRegion.BAY_AREA);
      lifecycleStore.setDifficulty(DifficultyLevel.EXPERT);

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.8,
        distance: 10,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      const remainingCounties: CountyPiece[] = [
        { id: 'san_francisco', name: 'San Francisco' } as CountyPiece,
      ];

      const unlocked = store.checkAchievements(mockPlacement, remainingCounties);

      const bayAreaAchievement = unlocked.find(a => a.id === 'bay_area_master');
      expect(bayAreaAchievement).toBeUndefined();
    });

    it('should handle undefined remainingCounties', () => {
      const store = useAchievementStore.getState();
      const lifecycleStore = useGameLifecycleStore.getState();

      lifecycleStore.setRegion(CaliforniaRegion.BAY_AREA);
      lifecycleStore.setDifficulty(DifficultyLevel.EXPERT);

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.8,
        distance: 10,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      // Don't pass remainingCounties
      const unlocked = store.checkAchievements(mockPlacement);

      const bayAreaAchievement = unlocked.find(a => a.id === 'bay_area_master');
      expect(bayAreaAchievement).toBeUndefined();
    });
  });

  describe('checkAchievements - multiple achievements', () => {
    it('should unlock multiple achievements simultaneously', () => {
      const store = useAchievementStore.getState();

      // Perfect placement in under 3 seconds - should unlock 3 achievements
      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 1.0,
        distance: 0,
        isCorrect: true,
        scoreAwarded: 200,
        timeToPlace: 2500,
      };

      const unlocked = store.checkAchievements(mockPlacement);

      // Should unlock: first_county, perfect_placement, speed_demon
      expect(unlocked.length).toBe(3);
      expect(unlocked.find(a => a.id === 'first_county')).toBeDefined();
      expect(unlocked.find(a => a.id === 'perfect_placement')).toBeDefined();
      expect(unlocked.find(a => a.id === 'speed_demon')).toBeDefined();
    });

    it('should play sound for each unlocked achievement', () => {
      const store = useAchievementStore.getState();

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 1.0,
        distance: 0,
        isCorrect: true,
        scoreAwarded: 200,
        timeToPlace: 2500,
      };

      store.checkAchievements(mockPlacement);

      // Should play sound 3 times (one for each achievement)
      expect(soundManager.playSound).toHaveBeenCalledTimes(3);
    });
  });

  describe('checkAchievements - already unlocked', () => {
    it('should not return already unlocked achievements', () => {
      const store = useAchievementStore.getState();

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 1.0,
        distance: 0,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      // First check - should unlock achievements
      const firstUnlock = store.checkAchievements(mockPlacement);
      expect(firstUnlock.length).toBeGreaterThan(0);

      // Second check - should not return already unlocked
      const secondUnlock = store.checkAchievements(mockPlacement);
      expect(secondUnlock.length).toBe(0);
    });

    it('should not play sound for already unlocked achievements', () => {
      const store = useAchievementStore.getState();

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 1.0,
        distance: 0,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      store.checkAchievements(mockPlacement);
      vi.clearAllMocks();

      store.checkAchievements(mockPlacement);
      expect(soundManager.playSound).not.toHaveBeenCalled();
    });
  });

  describe('getAchievementProgress', () => {
    it('should return 0 for locked achievement with no progress', () => {
      const store = useAchievementStore.getState();

      const progress = store.getAchievementProgress('first_county');

      expect(progress).toBe(0);
    });

    it('should return current progress for partially completed achievement', () => {
      const store = useAchievementStore.getState();
      const scoringStore = useScoringStore.getState();

      // Build streak to 5
      for (let i = 0; i < 5; i++) {
        scoringStore.addPoints(100);
      }

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.8,
        distance: 10,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      store.checkAchievements(mockPlacement);

      const progress = store.getAchievementProgress('streak_10');

      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(1);
    });

    it('should return 1 for unlocked achievement', () => {
      const store = useAchievementStore.getState();

      store.unlockAchievement('first_county');

      const progress = store.getAchievementProgress('first_county');

      expect(progress).toBe(1);
    });

    it('should return 0 for non-existent achievement', () => {
      const store = useAchievementStore.getState();

      const progress = store.getAchievementProgress('non_existent_achievement');

      expect(progress).toBe(0);
    });
  });

  describe('resetAchievements', () => {
    it('should reset all achievements to initial state', () => {
      const store = useAchievementStore.getState();

      // Unlock some achievements
      store.unlockAchievement('first_county');
      store.unlockAchievement('perfect_placement');

      // Reset
      store.resetAchievements();

      const state = useAchievementStore.getState();

      state.achievements.forEach(achievement => {
        expect(achievement.isUnlocked).toBe(false);
        expect(achievement.progress).toBe(0);
        expect(achievement.unlockedAt).toBeUndefined();
      });
    });

    it('should preserve achievement definitions', () => {
      const store = useAchievementStore.getState();
      const initialCount = store.achievements.length;
      const initialIds = store.achievements.map(a => a.id);

      // Make some changes
      store.unlockAchievement('first_county');

      // Reset
      store.resetAchievements();

      const state = useAchievementStore.getState();

      expect(state.achievements.length).toBe(initialCount);
      state.achievements.forEach((achievement, index) => {
        expect(achievement.id).toBe(initialIds[index]);
      });
    });

    it('should reset partial progress', () => {
      const store = useAchievementStore.getState();
      const scoringStore = useScoringStore.getState();

      // Build partial streak
      for (let i = 0; i < 5; i++) {
        scoringStore.addPoints(100);
      }

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 0.8,
        distance: 10,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      store.checkAchievements(mockPlacement);

      // Verify progress exists
      let streakAchievement = useAchievementStore.getState().achievements.find(
        a => a.id === 'streak_10'
      );
      expect(streakAchievement?.progress).toBeGreaterThan(0);

      // Reset
      store.resetAchievements();

      // Verify progress reset
      streakAchievement = useAchievementStore.getState().achievements.find(
        a => a.id === 'streak_10'
      );
      expect(streakAchievement?.progress).toBe(0);
    });
  });

  describe('Achievement Notification Behavior', () => {
    it('should include unlockedAt timestamp when achievement is unlocked', () => {
      const store = useAchievementStore.getState();

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 1.0,
        distance: 0,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      const unlocked = store.checkAchievements(mockPlacement);

      unlocked.forEach(achievement => {
        expect(achievement.unlockedAt).toBeInstanceOf(Date);
      });
    });

    it('should return newly unlocked achievements in correct format', () => {
      const store = useAchievementStore.getState();

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 1.0,
        distance: 0,
        isCorrect: true,
        scoreAwarded: 200,
        timeToPlace: 2500,
      };

      const unlocked = store.checkAchievements(mockPlacement);

      unlocked.forEach(achievement => {
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('name');
        expect(achievement).toHaveProperty('description');
        expect(achievement).toHaveProperty('icon');
        expect(achievement).toHaveProperty('progress');
        expect(achievement).toHaveProperty('isUnlocked');
        expect(achievement).toHaveProperty('category');
        expect(achievement).toHaveProperty('unlockedAt');
        expect(achievement.isUnlocked).toBe(true);
        expect(achievement.progress).toBe(1);
      });
    });

    it('should allow notification system to access achievement details', () => {
      const store = useAchievementStore.getState();

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 1.0,
        distance: 0,
        isCorrect: true,
        scoreAwarded: 100,
        timeToPlace: 5000,
      };

      const unlocked = store.checkAchievements(mockPlacement);

      // Simulate notification system accessing achievement details
      unlocked.forEach(achievement => {
        const notificationData = {
          title: achievement.name,
          message: achievement.description,
          icon: achievement.icon,
          timestamp: achievement.unlockedAt,
        };

        expect(notificationData.title).toBeTruthy();
        expect(notificationData.message).toBeTruthy();
        expect(notificationData.icon).toBeTruthy();
        expect(notificationData.timestamp).toBeInstanceOf(Date);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle checkAchievements without placement argument', () => {
      const store = useAchievementStore.getState();

      expect(() => {
        store.checkAchievements();
      }).not.toThrow();

      const unlocked = store.checkAchievements();
      expect(Array.isArray(unlocked)).toBe(true);
    });

    it('should handle checkAchievements with only remainingCounties', () => {
      const store = useAchievementStore.getState();
      const remainingCounties: CountyPiece[] = [];

      expect(() => {
        store.checkAchievements(undefined, remainingCounties);
      }).not.toThrow();
    });

    it('should maintain achievement state consistency', () => {
      const store = useAchievementStore.getState();

      // Perform multiple operations
      store.unlockAchievement('first_county');

      const mockPlacement: PlacementResult = {
        county: { id: 'alameda', name: 'Alameda' } as County,
        accuracy: 1.0,
        distance: 0,
        isCorrect: true,
        scoreAwarded: 200,
        timeToPlace: 2500,
      };

      store.checkAchievements(mockPlacement);

      // Verify state consistency
      const state = useAchievementStore.getState();
      const unlockedCount = state.achievements.filter(a => a.isUnlocked).length;
      const fullyProgressedCount = state.achievements.filter(a => a.progress === 1).length;

      expect(unlockedCount).toBe(fullyProgressedCount);
    });
  });
});
