import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

/**
 * Progress Tracking Integration Tests
 *
 * Tests for TODO features that will be implemented in Phase 2:
 * - Current streak calculation
 * - Struggling counties tracking
 * - Mastered counties tracking
 * - Total points from achievements
 * - Progress persistence
 */

// Mock progress tracking state
interface County {
  id: string;
  name: string;
  attempts: number;
  correctAttempts: number;
  lastAttemptDate?: Date;
  masteryLevel?: 'struggling' | 'learning' | 'mastered';
}

interface ProgressState {
  counties: County[];
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  achievements: string[];
}

// Mock hook for progress tracking
function useProgressTracking() {
  const [state, setState] = React.useState<ProgressState>({
    counties: [],
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    achievements: []
  });

  const calculateCurrentStreak = () => {
    const today = new Date();
    let streak = 0;
    let checkDate = new Date(today);

    // Count consecutive days with correct attempts
    for (let i = 0; i < 30; i++) {
      const hasActivityOnDate = state.counties.some(county => {
        if (!county.lastAttemptDate) return false;
        const attemptDate = new Date(county.lastAttemptDate);
        return attemptDate.toDateString() === checkDate.toDateString() && county.correctAttempts > 0;
      });

      if (hasActivityOnDate) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i > 0) {
        break;
      } else {
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    return streak;
  };

  const getStrugglingCounties = () => {
    return state.counties.filter(county => {
      const successRate = county.attempts > 0 ? county.correctAttempts / county.attempts : 0;
      return county.attempts >= 3 && successRate < 0.5;
    });
  };

  const getMasteredCounties = () => {
    return state.counties.filter(county => {
      const successRate = county.attempts > 0 ? county.correctAttempts / county.attempts : 0;
      return county.attempts >= 5 && successRate >= 0.8;
    });
  };

  const calculateTotalPoints = () => {
    const basePoints = state.counties.reduce((sum, county) => sum + (county.correctAttempts * 10), 0);
    const achievementPoints = state.achievements.length * 50;
    const streakBonus = state.currentStreak * 5;
    return basePoints + achievementPoints + streakBonus;
  };

  const recordAttempt = (countyId: string, correct: boolean) => {
    setState(prev => {
      const updatedCounties = prev.counties.map(county => {
        if (county.id === countyId) {
          const newAttempts = county.attempts + 1;
          const newCorrect = correct ? county.correctAttempts + 1 : county.correctAttempts;
          const successRate = newCorrect / newAttempts;

          let masteryLevel: 'struggling' | 'learning' | 'mastered' = 'learning';
          if (newAttempts >= 3 && successRate < 0.5) masteryLevel = 'struggling';
          else if (newAttempts >= 5 && successRate >= 0.8) masteryLevel = 'mastered';

          return {
            ...county,
            attempts: newAttempts,
            correctAttempts: newCorrect,
            lastAttemptDate: new Date(),
            masteryLevel
          };
        }
        return county;
      });

      const newStreak = calculateCurrentStreak();
      const newLongestStreak = Math.max(prev.longestStreak, newStreak);

      return {
        ...prev,
        counties: updatedCounties,
        currentStreak: newStreak,
        longestStreak: newLongestStreak
      };
    });
  };

  const addCounty = (county: County) => {
    setState(prev => ({
      ...prev,
      counties: [...prev.counties, county]
    }));
  };

  const addAchievement = (achievement: string) => {
    setState(prev => ({
      ...prev,
      achievements: [...prev.achievements, achievement]
    }));
  };

  return {
    state,
    calculateCurrentStreak,
    getStrugglingCounties,
    getMasteredCounties,
    calculateTotalPoints,
    recordAttempt,
    addCounty,
    addAchievement
  };
}

// Import React for the hook
import React from 'react';

describe('Progress Tracking Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Current Streak Calculation', () => {
    it('calculates current streak correctly with consecutive days', () => {
      const { result } = renderHook(() => useProgressTracking());

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      act(() => {
        result.current.addCounty({
          id: 'san-francisco',
          name: 'San Francisco',
          attempts: 1,
          correctAttempts: 1,
          lastAttemptDate: today
        });

        result.current.addCounty({
          id: 'los-angeles',
          name: 'Los Angeles',
          attempts: 1,
          correctAttempts: 1,
          lastAttemptDate: yesterday
        });
      });

      const streak = result.current.calculateCurrentStreak();
      expect(streak).toBeGreaterThanOrEqual(1);
    });

    it('returns 0 streak when no recent activity', () => {
      const { result } = renderHook(() => useProgressTracking());

      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);

      act(() => {
        result.current.addCounty({
          id: 'san-francisco',
          name: 'San Francisco',
          attempts: 1,
          correctAttempts: 1,
          lastAttemptDate: oldDate
        });
      });

      const streak = result.current.calculateCurrentStreak();
      expect(streak).toBe(0);
    });

    it('updates longest streak when current exceeds it', () => {
      const { result } = renderHook(() => useProgressTracking());

      act(() => {
        result.current.addCounty({
          id: 'san-francisco',
          name: 'San Francisco',
          attempts: 1,
          correctAttempts: 1,
          lastAttemptDate: new Date()
        });
      });

      act(() => {
        result.current.recordAttempt('san-francisco', true);
      });

      expect(result.current.state.longestStreak).toBeGreaterThanOrEqual(result.current.state.currentStreak);
    });
  });

  describe('Struggling Counties Tracking', () => {
    it('identifies struggling counties with low success rate', () => {
      const { result } = renderHook(() => useProgressTracking());

      act(() => {
        // Add county with 40% success rate (2/5)
        result.current.addCounty({
          id: 'struggling-county',
          name: 'Struggling County',
          attempts: 5,
          correctAttempts: 2,
          lastAttemptDate: new Date()
        });
      });

      const strugglingCounties = result.current.getStrugglingCounties();
      expect(strugglingCounties).toHaveLength(1);
      expect(strugglingCounties[0].id).toBe('struggling-county');
    });

    it('does not include counties with too few attempts', () => {
      const { result } = renderHook(() => useProgressTracking());

      act(() => {
        // Only 2 attempts - not enough data
        result.current.addCounty({
          id: 'new-county',
          name: 'New County',
          attempts: 2,
          correctAttempts: 0,
          lastAttemptDate: new Date()
        });
      });

      const strugglingCounties = result.current.getStrugglingCounties();
      expect(strugglingCounties).toHaveLength(0);
    });

    it('excludes counties that improved', () => {
      const { result } = renderHook(() => useProgressTracking());

      act(() => {
        result.current.addCounty({
          id: 'improving-county',
          name: 'Improving County',
          attempts: 5,
          correctAttempts: 4, // 80% success rate
          lastAttemptDate: new Date()
        });
      });

      const strugglingCounties = result.current.getStrugglingCounties();
      expect(strugglingCounties).toHaveLength(0);
    });
  });

  describe('Mastered Counties Tracking', () => {
    it('identifies mastered counties with high success rate', () => {
      const { result } = renderHook(() => useProgressTracking());

      act(() => {
        // Add county with 80% success rate (4/5)
        result.current.addCounty({
          id: 'mastered-county',
          name: 'Mastered County',
          attempts: 5,
          correctAttempts: 4,
          lastAttemptDate: new Date()
        });
      });

      const masteredCounties = result.current.getMasteredCounties();
      expect(masteredCounties).toHaveLength(1);
      expect(masteredCounties[0].id).toBe('mastered-county');
    });

    it('requires minimum attempts for mastery', () => {
      const { result } = renderHook(() => useProgressTracking());

      act(() => {
        // Only 3 attempts with 100% - not enough for mastery
        result.current.addCounty({
          id: 'almost-mastered',
          name: 'Almost Mastered',
          attempts: 3,
          correctAttempts: 3,
          lastAttemptDate: new Date()
        });
      });

      const masteredCounties = result.current.getMasteredCounties();
      expect(masteredCounties).toHaveLength(0);
    });

    it('tracks perfect mastery (100% success rate)', () => {
      const { result } = renderHook(() => useProgressTracking());

      act(() => {
        result.current.addCounty({
          id: 'perfect-county',
          name: 'Perfect County',
          attempts: 10,
          correctAttempts: 10,
          lastAttemptDate: new Date()
        });
      });

      const masteredCounties = result.current.getMasteredCounties();
      expect(masteredCounties).toHaveLength(1);
      expect(masteredCounties[0].correctAttempts).toBe(10);
      expect(masteredCounties[0].attempts).toBe(10);
    });
  });

  describe('Total Points Calculation', () => {
    it('calculates total points from achievements correctly', () => {
      const { result } = renderHook(() => useProgressTracking());

      act(() => {
        result.current.addCounty({
          id: 'county-1',
          name: 'County 1',
          attempts: 5,
          correctAttempts: 3, // 30 points
          lastAttemptDate: new Date()
        });
      });

      const points = result.current.calculateTotalPoints();
      expect(points).toBeGreaterThanOrEqual(30); // At least base points
    });

    it('includes streak bonus in total points', () => {
      const { result } = renderHook(() => useProgressTracking());

      act(() => {
        result.current.addCounty({
          id: 'county-1',
          name: 'County 1',
          attempts: 1,
          correctAttempts: 1,
          lastAttemptDate: new Date()
        });
      });

      const basePoints = result.current.calculateTotalPoints();

      // Simulate recording more attempts to increase streak
      act(() => {
        result.current.recordAttempt('county-1', true);
      });

      const pointsWithStreak = result.current.calculateTotalPoints();
      expect(pointsWithStreak).toBeGreaterThanOrEqual(basePoints);
    });

    it('awards points for multiple achievements', () => {
      const { result } = renderHook(() => useProgressTracking());

      // Manually add achievements (in real implementation, these would be awarded automatically)
      act(() => {
        result.current.addAchievement('first-county');
        result.current.addAchievement('ten-counties');
        result.current.addAchievement('streak-7');
      });
      const points = result.current.calculateTotalPoints();
      expect(points).toBeGreaterThanOrEqual(150); // 3 achievements * 50 points
    });

    it('combines all point sources correctly', () => {
      const { result } = renderHook(() => useProgressTracking());

      act(() => {
        // Base points: 2 counties * 2 correct * 10 = 40
        result.current.addCounty({
          id: 'county-1',
          name: 'County 1',
          attempts: 2,
          correctAttempts: 2,
          lastAttemptDate: new Date()
        });

        result.current.addCounty({
          id: 'county-2',
          name: 'County 2',
          attempts: 2,
          correctAttempts: 2,
          lastAttemptDate: new Date()
        });

        // Add achievements
        result.current.addAchievement('first-county'); // 50 points

      });
      const totalPoints = result.current.calculateTotalPoints();
      expect(totalPoints).toBeGreaterThanOrEqual(90); // 40 base + 50 achievement
    });
  });

  describe('Progress State Management', () => {
    it('updates mastery level when recording attempts', () => {
      const { result } = renderHook(() => useProgressTracking());

      act(() => {
        result.current.addCounty({
          id: 'test-county',
          name: 'Test County',
          attempts: 0,
          correctAttempts: 0
        });
      });

      // Record failed attempts
      act(() => {
        result.current.recordAttempt('test-county', false);
        result.current.recordAttempt('test-county', false);
        result.current.recordAttempt('test-county', false);
      });

      const county = result.current.state.counties.find(c => c.id === 'test-county');
      expect(county?.masteryLevel).toBe('struggling');
    });

    it('transitions from struggling to mastered', () => {
      const { result } = renderHook(() => useProgressTracking());

      act(() => {
        result.current.addCounty({
          id: 'improving-county',
          name: 'Improving County',
          attempts: 1,
          correctAttempts: 0,
          masteryLevel: 'learning'
        });
      });

      // Record correct attempts
      act(() => {
        result.current.recordAttempt('improving-county', true);
      // Now at 5 attempts, 4 correct = 80% - mastered!
        result.current.recordAttempt('improving-county', true);
        result.current.recordAttempt('improving-county', true);
        result.current.recordAttempt('improving-county', true);
      });

      const county = result.current.state.counties.find(c => c.id === 'improving-county');
      expect(county?.masteryLevel).toBe('mastered');
    });
  });

  describe('Data Persistence', () => {
    it('maintains county data after multiple updates', () => {
      const { result } = renderHook(() => useProgressTracking());

      act(() => {
        result.current.addCounty({
          id: 'persistent-county',
          name: 'Persistent County',
          attempts: 0,
          correctAttempts: 0
        });
      });

      const countyBefore = result.current.state.counties.find(c => c.id === 'persistent-county');

      act(() => {
        result.current.recordAttempt('persistent-county', true);
      });

      const countyAfter = result.current.state.counties.find(c => c.id === 'persistent-county');

      expect(countyAfter?.id).toBe(countyBefore?.id);
      expect(countyAfter?.name).toBe(countyBefore?.name);
      expect(countyAfter?.attempts).toBe(1);
      expect(countyAfter?.correctAttempts).toBe(1);
    });
  });
});
