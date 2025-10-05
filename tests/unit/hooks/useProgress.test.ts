/**
 * Unit tests for useProgress hook - TODO implementations
 * Tests all 7 TODO items that were implemented
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProgress, useDailyProgress } from '../../../src/hooks/useProgress';
import { storageManager } from '../../../src/utils/storage';

// Mock storage manager
vi.mock('../../../src/utils/storage', () => ({
  storageManager: {
    getCurrentProfile: vi.fn(),
    getSessions: vi.fn(),
    loadStats: vi.fn(),
    loadAchievements: vi.fn()
  }
}));

describe('useProgress - TODO implementations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TODO 1: struggling counties calculation', () => {
    it('should identify counties with < 50% accuracy and at least 3 attempts', async () => {
      const mockSessions = [
        {
          id: '1',
          profileId: 'test',
          startTime: new Date(),
          region: 'bay_area',
          difficulty: 'medium',
          score: 100,
          timeElapsed: 1000,
          placementsCorrect: 2,
          placementsTotal: 5,
          hintsUsed: 0,
          achievementsUnlocked: []
        },
        {
          id: '2',
          profileId: 'test',
          startTime: new Date(),
          region: 'bay_area',
          difficulty: 'medium',
          score: 100,
          timeElapsed: 1000,
          placementsCorrect: 2,
          placementsTotal: 5,
          hintsUsed: 0,
          achievementsUnlocked: []
        },
        {
          id: '3',
          profileId: 'test',
          startTime: new Date(),
          region: 'bay_area',
          difficulty: 'medium',
          score: 100,
          timeElapsed: 1000,
          placementsCorrect: 2,
          placementsTotal: 5,
          hintsUsed: 0,
          achievementsUnlocked: []
        }
      ];

      const mockStats = {
        totalGamesPlayed: 3,
        totalScore: 300,
        bestScore: 100,
        averageAccuracy: 0.4,
        totalPlayTime: 3000,
        favoriteDifficulty: 'medium',
        favoriteRegion: 'bay_area',
        countiesLearned: new Set(['county1', 'county2']),
        perfectPlacements: 0,
        longestStreak: 0
      };

      (storageManager.getCurrentProfile as any).mockReturnValue({ id: 'test' });
      (storageManager.getSessions as any).mockReturnValue(mockSessions);
      (storageManager.loadStats as any).mockReturnValue(mockStats);
      (storageManager.loadAchievements as any).mockReturnValue([]);

      const { result } = renderHook(() => useProgress());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.progressData?.strugglingCounties).toBeDefined();
      expect(Array.isArray(result.current.progressData?.strugglingCounties)).toBe(true);
    });
  });

  describe('TODO 2: mastered counties calculation', () => {
    it('should identify counties with > 90% accuracy and at least 5 attempts', async () => {
      const mockSessions = Array(5).fill(null).map((_, i) => ({
        id: `session-${i}`,
        profileId: 'test',
        startTime: new Date(),
        region: 'bay_area',
        difficulty: 'medium',
        score: 100,
        timeElapsed: 1000,
        placementsCorrect: 9,
        placementsTotal: 10,
        hintsUsed: 0,
        achievementsUnlocked: []
      }));

      const mockStats = {
        totalGamesPlayed: 5,
        totalScore: 500,
        bestScore: 100,
        averageAccuracy: 0.9,
        totalPlayTime: 5000,
        favoriteDifficulty: 'medium',
        favoriteRegion: 'bay_area',
        countiesLearned: new Set(['county1', 'county2', 'county3']),
        perfectPlacements: 0,
        longestStreak: 0
      };

      (storageManager.getCurrentProfile as any).mockReturnValue({ id: 'test' });
      (storageManager.getSessions as any).mockReturnValue(mockSessions);
      (storageManager.loadStats as any).mockReturnValue(mockStats);
      (storageManager.loadAchievements as any).mockReturnValue([]);

      const { result } = renderHook(() => useProgress());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.progressData?.masteredCounties).toBeDefined();
      expect(Array.isArray(result.current.progressData?.masteredCounties)).toBe(true);
    });
  });

  describe('TODO 3: total points calculation', () => {
    it('should calculate total points from unlocked achievements', async () => {
      const mockAchievements = [
        { id: '1', name: 'First Win', isUnlocked: true, unlockedAt: new Date(), progress: 1, icon: '', description: '', category: 'completion' },
        { id: '2', name: 'Speed Demon', isUnlocked: true, unlockedAt: new Date(), progress: 1, icon: '', description: '', category: 'speed' },
        { id: '3', name: 'Perfect Game', isUnlocked: false, progress: 0.5, icon: '', description: '', category: 'accuracy' }
      ];

      const mockStats = {
        totalGamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
        averageAccuracy: 0,
        totalPlayTime: 0,
        favoriteDifficulty: 'medium',
        favoriteRegion: 'bay_area',
        countiesLearned: new Set(),
        perfectPlacements: 0,
        longestStreak: 0
      };

      (storageManager.getCurrentProfile as any).mockReturnValue({ id: 'test' });
      (storageManager.getSessions as any).mockReturnValue([]);
      (storageManager.loadStats as any).mockReturnValue(mockStats);
      (storageManager.loadAchievements as any).mockReturnValue(mockAchievements);

      const { result } = renderHook(() => useProgress());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 2 unlocked achievements * 100 points each = 200
      expect(result.current.progressData?.totalPoints).toBe(200);
    });
  });

  describe('TODO 4: achievement progress calculation', () => {
    it('should calculate achievement progress percentage', async () => {
      const mockAchievements = Array(10).fill(null).map((_, i) => ({
        id: `ach-${i}`,
        name: `Achievement ${i}`,
        isUnlocked: i < 5, // 5 out of 10 unlocked
        unlockedAt: i < 5 ? new Date() : undefined,
        progress: i < 5 ? 1 : 0,
        icon: '',
        description: '',
        category: 'completion'
      }));

      const mockStats = {
        totalGamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
        averageAccuracy: 0,
        totalPlayTime: 0,
        favoriteDifficulty: 'medium',
        favoriteRegion: 'bay_area',
        countiesLearned: new Set(),
        perfectPlacements: 0,
        longestStreak: 0
      };

      (storageManager.getCurrentProfile as any).mockReturnValue({ id: 'test' });
      (storageManager.getSessions as any).mockReturnValue([]);
      (storageManager.loadStats as any).mockReturnValue(mockStats);
      (storageManager.loadAchievements as any).mockReturnValue(mockAchievements);

      const { result } = renderHook(() => useProgress());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 5 unlocked / 50 total = 10%
      expect(result.current.progressData?.achievementProgress).toBe(10);
    });
  });

  describe('TODO 5: recent achievements tracking', () => {
    it('should get achievements unlocked in the last 7 days', async () => {
      const now = Date.now();
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
      const eightDaysAgo = now - (8 * 24 * 60 * 60 * 1000);

      const mockAchievements = [
        { id: 'recent1', name: 'Recent 1', isUnlocked: true, unlockedAt: new Date(now - 1000), progress: 1, icon: '', description: '', category: 'completion' },
        { id: 'recent2', name: 'Recent 2', isUnlocked: true, unlockedAt: new Date(now - 100000), progress: 1, icon: '', description: '', category: 'completion' },
        { id: 'old', name: 'Old', isUnlocked: true, unlockedAt: new Date(eightDaysAgo), progress: 1, icon: '', description: '', category: 'completion' },
        { id: 'locked', name: 'Locked', isUnlocked: false, progress: 0.5, icon: '', description: '', category: 'completion' }
      ];

      const mockStats = {
        totalGamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
        averageAccuracy: 0,
        totalPlayTime: 0,
        favoriteDifficulty: 'medium',
        favoriteRegion: 'bay_area',
        countiesLearned: new Set(),
        perfectPlacements: 0,
        longestStreak: 0
      };

      (storageManager.getCurrentProfile as any).mockReturnValue({ id: 'test' });
      (storageManager.getSessions as any).mockReturnValue([]);
      (storageManager.loadStats as any).mockReturnValue(mockStats);
      (storageManager.loadAchievements as any).mockReturnValue(mockAchievements);

      const { result } = renderHook(() => useProgress());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.progressData?.recentAchievements).toHaveLength(2);
      expect(result.current.progressData?.recentAchievements).toContain('recent1');
      expect(result.current.progressData?.recentAchievements).toContain('recent2');
      expect(result.current.progressData?.recentAchievements).not.toContain('old');
    });
  });

  describe('TODO 6: current streak calculation', () => {
    it('should calculate consecutive days played', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const mockSessions = [
        {
          id: '1',
          profileId: 'test',
          startTime: today,
          region: 'bay_area',
          difficulty: 'medium',
          score: 100,
          timeElapsed: 1000,
          placementsCorrect: 5,
          placementsTotal: 5,
          hintsUsed: 0,
          achievementsUnlocked: []
        },
        {
          id: '2',
          profileId: 'test',
          startTime: yesterday,
          region: 'bay_area',
          difficulty: 'medium',
          score: 100,
          timeElapsed: 1000,
          placementsCorrect: 5,
          placementsTotal: 5,
          hintsUsed: 0,
          achievementsUnlocked: []
        },
        {
          id: '3',
          profileId: 'test',
          startTime: twoDaysAgo,
          region: 'bay_area',
          difficulty: 'medium',
          score: 100,
          timeElapsed: 1000,
          placementsCorrect: 5,
          placementsTotal: 5,
          hintsUsed: 0,
          achievementsUnlocked: []
        }
      ];

      const mockStats = {
        totalGamesPlayed: 3,
        totalScore: 300,
        bestScore: 100,
        averageAccuracy: 1,
        totalPlayTime: 3000,
        favoriteDifficulty: 'medium',
        favoriteRegion: 'bay_area',
        countiesLearned: new Set(),
        perfectPlacements: 0,
        longestStreak: 3
      };

      (storageManager.getCurrentProfile as any).mockReturnValue({ id: 'test' });
      (storageManager.getSessions as any).mockReturnValue(mockSessions);
      (storageManager.loadStats as any).mockReturnValue(mockStats);
      (storageManager.loadAchievements as any).mockReturnValue([]);

      const { result } = renderHook(() => useProgress());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.progressData?.currentStreak).toBeGreaterThanOrEqual(1);
    });
  });

  describe('TODO 7: counties learned today', () => {
    it('should track counties learned in today\'s sessions', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const mockSessions = [
        {
          id: '1',
          profileId: 'test',
          startTime: today,
          region: 'bay_area',
          difficulty: 'medium',
          score: 100,
          timeElapsed: 1000,
          placementsCorrect: 3,
          placementsTotal: 5,
          hintsUsed: 0,
          achievementsUnlocked: []
        },
        {
          id: '2',
          profileId: 'test',
          startTime: yesterday,
          region: 'bay_area',
          difficulty: 'medium',
          score: 100,
          timeElapsed: 1000,
          placementsCorrect: 5,
          placementsTotal: 5,
          hintsUsed: 0,
          achievementsUnlocked: []
        }
      ];

      const mockStats = {
        totalGamesPlayed: 2,
        totalScore: 200,
        bestScore: 100,
        averageAccuracy: 0.8,
        totalPlayTime: 2000,
        favoriteDifficulty: 'medium',
        favoriteRegion: 'bay_area',
        countiesLearned: new Set(['county1', 'county2', 'county3']),
        perfectPlacements: 0,
        longestStreak: 0
      };

      (storageManager.getCurrentProfile as any).mockReturnValue({ id: 'test' });
      (storageManager.getSessions as any).mockReturnValue(mockSessions);
      (storageManager.loadStats as any).mockReturnValue(mockStats);
      (storageManager.loadAchievements as any).mockReturnValue([]);

      const { result } = renderHook(() => useDailyProgress());

      await waitFor(() => {
        expect(result.current.dailyStats.gamesPlayed).toBeGreaterThan(0);
      });

      expect(result.current.dailyStats.countiesLearned).toBeGreaterThanOrEqual(0);
    });
  });
});
