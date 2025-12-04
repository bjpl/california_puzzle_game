/**
 * Scoring Store Unit Tests
 *
 * Purpose: Test scoring calculation, streaks, and statistics management
 * Coverage: Score calculation, streak management, placement stats, edge cases
 *
 * Last updated: 2025-12-03
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useScoringStore } from '../../../src/stores/scoringStore';
import { DifficultyLevel, CaliforniaRegion, PlacementResult } from '../../../src/types';

// Mock localStorage to avoid persistence issues in tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as unknown as Storage;

// Mock county for testing
const mockCounty = {
  id: 'san-francisco',
  name: 'San Francisco',
  fips: '06075',
  region: CaliforniaRegion.BAY_AREA,
  population: 873965,
  area: 46.9,
  geometry: {} as GeoJSON.Geometry,
  centroid: [-122.4194, 37.7749] as [number, number],
  difficulty: DifficultyLevel.MEDIUM,
};

describe('Scoring Store', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    // Reset store to initial state before each test
    useScoringStore.setState({
      score: 0,
      streak: 0,
      mistakes: 0,
      stats: {
        totalGamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
        averageAccuracy: 0,
        totalPlayTime: 0,
        favoriteDifficulty: DifficultyLevel.EASY,
        favoriteRegion: CaliforniaRegion.BAY_AREA,
        countiesLearned: new Set(),
        perfectPlacements: 0,
        longestStreak: 0,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with zero score', () => {
      const state = useScoringStore.getState();
      expect(state.score).toBe(0);
    });

    it('should initialize with zero streak', () => {
      const state = useScoringStore.getState();
      expect(state.streak).toBe(0);
    });

    it('should initialize with zero mistakes', () => {
      const state = useScoringStore.getState();
      expect(state.mistakes).toBe(0);
    });

    it('should initialize stats with default values', () => {
      const state = useScoringStore.getState();
      expect(state.stats.totalGamesPlayed).toBe(0);
      expect(state.stats.totalScore).toBe(0);
      expect(state.stats.bestScore).toBe(0);
      expect(state.stats.averageAccuracy).toBe(0);
      expect(state.stats.totalPlayTime).toBe(0);
      expect(state.stats.perfectPlacements).toBe(0);
      expect(state.stats.longestStreak).toBe(0);
    });

    it('should initialize with empty countiesLearned set', () => {
      const state = useScoringStore.getState();
      expect(state.stats.countiesLearned).toBeInstanceOf(Set);
      expect(state.stats.countiesLearned.size).toBe(0);
    });

    it('should initialize with default difficulty and region', () => {
      const state = useScoringStore.getState();
      expect(state.stats.favoriteDifficulty).toBe(DifficultyLevel.EASY);
      expect(state.stats.favoriteRegion).toBe(CaliforniaRegion.BAY_AREA);
    });
  });

  describe('calculateScore', () => {
    describe('Difficulty Multipliers', () => {
      it('should calculate score with EASY difficulty (1.0x)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 5000);
        // Base: 100, Accuracy: 1.0, Speed: 1.2 (5000ms = NOT < 5000), Difficulty: 1.0, Streak: 1.0
        // Total: 100 * 1.0 * 1.2 * 1.0 * 1.0 = 120
        expect(score).toBe(120);
      });

      it('should calculate score with MEDIUM difficulty (1.5x)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.MEDIUM, 1.0, 5000);
        // Base: 100, Accuracy: 1.0, Speed: 1.2, Difficulty: 1.5, Streak: 1.0
        // Total: 100 * 1.0 * 1.2 * 1.5 * 1.0 = 180
        expect(score).toBe(180);
      });

      it('should calculate score with HARD difficulty (2.0x)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.HARD, 1.0, 5000);
        // Total: 100 * 1.0 * 1.2 * 2.0 * 1.0 = 240
        expect(score).toBe(240);
      });

      it('should calculate score with EXPERT difficulty (3.0x)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EXPERT, 1.0, 5000);
        // Total: 100 * 1.0 * 1.2 * 3.0 * 1.0 = 360
        expect(score).toBe(360);
      });
    });

    describe('Accuracy Multipliers', () => {
      it('should calculate score with perfect accuracy (1.0)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 10000);
        // Base: 100, Accuracy: 1.0, Speed: 1.0 (10000ms = NOT < 10000), Difficulty: 1.0, Streak: 1.0
        expect(score).toBe(100);
      });

      it('should calculate score with 75% accuracy', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 0.75, 10000);
        // Base: 100, Accuracy: 0.75, Speed: 1.0, Difficulty: 1.0, Streak: 1.0
        expect(score).toBe(75);
      });

      it('should calculate score with 50% accuracy', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 0.5, 10000);
        expect(score).toBe(50);
      });

      it('should calculate score with 25% accuracy', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 0.25, 10000);
        expect(score).toBe(25);
      });

      it('should handle zero accuracy', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 0, 10000);
        expect(score).toBe(0);
      });
    });

    describe('Speed Multipliers', () => {
      it('should apply fast speed bonus (<5s = 1.5x)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 4999);
        // Speed multiplier: 1.5
        expect(score).toBe(150);
      });

      it('should apply medium speed bonus (<10s = 1.2x)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 9999);
        // Speed multiplier: 1.2
        expect(score).toBe(120);
      });

      it('should apply no speed bonus (>=10s = 1.0x)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 10000);
        // Speed multiplier: 1.0
        expect(score).toBe(100);
      });

      it('should handle very slow times', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 60000);
        // Speed multiplier: 1.0 (no bonus)
        expect(score).toBe(100);
      });
    });

    describe('Streak Multipliers', () => {
      it('should calculate score with no streak (1.0x)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 10000);
        expect(score).toBe(100);
      });

      it('should calculate score with streak of 1 (1.1x)', () => {
        useScoringStore.setState({ streak: 1 });
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 10000);
        // Streak: 1 + (1 * 0.1) = 1.1
        expect(score).toBe(110);
      });

      it('should calculate score with streak of 5 (1.5x)', () => {
        useScoringStore.setState({ streak: 5 });
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 10000);
        // Streak: 1 + (5 * 0.1) = 1.5
        expect(score).toBe(150);
      });

      it('should calculate score with streak of 10 (2.0x)', () => {
        useScoringStore.setState({ streak: 10 });
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 10000);
        // Streak: 1 + (10 * 0.1) = 2.0
        expect(score).toBe(200);
      });

      it('should cap streak multiplier at 10 (2.0x max)', () => {
        useScoringStore.setState({ streak: 20 });
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 10000);
        // Streak capped: 1 + (10 * 0.1) = 2.0 (not 3.0)
        expect(score).toBe(200);
      });
    });

    describe('Mode Multipliers', () => {
      it('should apply mode multiplier (2x)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 10000, 2.0);
        // Base calculation: 100, then * 2.0 mode multiplier
        expect(score).toBe(200);
      });

      it('should apply mode multiplier (0.5x)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 10000, 0.5);
        expect(score).toBe(50);
      });

      it('should default to 1.0x when mode multiplier not provided', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 10000);
        expect(score).toBe(100);
      });
    });

    describe('Combined Multipliers', () => {
      it('should combine all multipliers correctly', () => {
        useScoringStore.setState({ streak: 5 });
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EXPERT, 1.0, 4000, 2.0);
        // Base: 100, Accuracy: 1.0, Speed: 1.5, Difficulty: 3.0, Streak: 1.5, Mode: 2.0
        // Total: 100 * 1.0 * 1.5 * 3.0 * 1.5 * 2.0 = 1350
        expect(score).toBe(1350);
      });

      it('should round fractional scores correctly', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 0.7, 6000);
        // Should round to nearest integer
        expect(Number.isInteger(score)).toBe(true);
      });
    });
  });

  describe('updateScore', () => {
    it('should add points to current score', () => {
      const { updateScore } = useScoringStore.getState();
      updateScore(100);
      expect(useScoringStore.getState().score).toBe(100);
    });

    it('should accumulate points correctly', () => {
      const { updateScore } = useScoringStore.getState();
      updateScore(100);
      updateScore(50);
      updateScore(25);
      expect(useScoringStore.getState().score).toBe(175);
    });

    it('should handle negative points', () => {
      useScoringStore.setState({ score: 100 });
      const { updateScore } = useScoringStore.getState();
      updateScore(-25);
      expect(useScoringStore.getState().score).toBe(75);
    });

    it('should handle zero points', () => {
      useScoringStore.setState({ score: 100 });
      const { updateScore } = useScoringStore.getState();
      updateScore(0);
      expect(useScoringStore.getState().score).toBe(100);
    });

    it('should handle large point values', () => {
      const { updateScore } = useScoringStore.getState();
      updateScore(999999);
      expect(useScoringStore.getState().score).toBe(999999);
    });
  });

  describe('updateStreak', () => {
    describe('Correct Placements', () => {
      it('should increment streak on correct placement', () => {
        const { updateStreak } = useScoringStore.getState();
        updateStreak(true);
        expect(useScoringStore.getState().streak).toBe(1);
      });

      it('should continue incrementing streak on consecutive correct placements', () => {
        const { updateStreak } = useScoringStore.getState();
        updateStreak(true);
        updateStreak(true);
        updateStreak(true);
        expect(useScoringStore.getState().streak).toBe(3);
      });

      it('should not increment mistakes on correct placement', () => {
        const { updateStreak } = useScoringStore.getState();
        updateStreak(true);
        expect(useScoringStore.getState().mistakes).toBe(0);
      });

      it('should build long streak correctly', () => {
        const { updateStreak } = useScoringStore.getState();
        for (let i = 0; i < 10; i++) {
          updateStreak(true);
        }
        expect(useScoringStore.getState().streak).toBe(10);
      });
    });

    describe('Incorrect Placements', () => {
      it('should reset streak to 0 on incorrect placement', () => {
        useScoringStore.setState({ streak: 5 });
        const { updateStreak } = useScoringStore.getState();
        updateStreak(false);
        expect(useScoringStore.getState().streak).toBe(0);
      });

      it('should increment mistakes on incorrect placement', () => {
        const { updateStreak } = useScoringStore.getState();
        updateStreak(false);
        expect(useScoringStore.getState().mistakes).toBe(1);
      });

      it('should accumulate mistakes correctly', () => {
        const { updateStreak } = useScoringStore.getState();
        updateStreak(false);
        updateStreak(false);
        updateStreak(false);
        expect(useScoringStore.getState().mistakes).toBe(3);
      });

      it('should not affect mistakes count when incorrect', () => {
        useScoringStore.setState({ mistakes: 2 });
        const { updateStreak } = useScoringStore.getState();
        updateStreak(false);
        expect(useScoringStore.getState().mistakes).toBe(3);
      });
    });

    describe('Mixed Sequences', () => {
      it('should handle alternating correct and incorrect placements', () => {
        const { updateStreak } = useScoringStore.getState();
        updateStreak(true); // streak: 1
        updateStreak(false); // streak: 0, mistakes: 1
        updateStreak(true); // streak: 1, mistakes: 1
        const state = useScoringStore.getState();
        expect(state.streak).toBe(1);
        expect(state.mistakes).toBe(1);
      });

      it('should handle streak reset and rebuild', () => {
        const { updateStreak } = useScoringStore.getState();
        updateStreak(true);
        updateStreak(true);
        updateStreak(true); // streak: 3
        updateStreak(false); // streak: 0, mistakes: 1
        updateStreak(true);
        updateStreak(true); // streak: 2, mistakes: 1
        const state = useScoringStore.getState();
        expect(state.streak).toBe(2);
        expect(state.mistakes).toBe(1);
      });
    });
  });

  describe('updatePlacementStats', () => {
    const createPlacementResult = (overrides?: Partial<PlacementResult>): PlacementResult => ({
      county: mockCounty,
      accuracy: 1.0,
      distance: 0,
      isCorrect: true,
      scoreAwarded: 100,
      timeToPlace: 5000,
      ...overrides,
    });

    it('should add county to countiesLearned on correct placement', () => {
      const { updatePlacementStats } = useScoringStore.getState();
      const placement = createPlacementResult();
      updatePlacementStats(placement);
      expect(useScoringStore.getState().stats.countiesLearned.has('san-francisco')).toBe(true);
    });

    it('should not add county to countiesLearned on incorrect placement', () => {
      const { updatePlacementStats } = useScoringStore.getState();
      const placement = createPlacementResult({ isCorrect: false, accuracy: 0.5 });
      updatePlacementStats(placement);
      expect(useScoringStore.getState().stats.countiesLearned.has('san-francisco')).toBe(false);
    });

    it('should increment perfectPlacements on 100% accuracy', () => {
      const { updatePlacementStats } = useScoringStore.getState();
      const placement = createPlacementResult({ accuracy: 1.0 });
      updatePlacementStats(placement);
      expect(useScoringStore.getState().stats.perfectPlacements).toBe(1);
    });

    it('should not increment perfectPlacements on less than 100% accuracy', () => {
      const { updatePlacementStats } = useScoringStore.getState();
      const placement = createPlacementResult({ accuracy: 0.99 });
      updatePlacementStats(placement);
      expect(useScoringStore.getState().stats.perfectPlacements).toBe(0);
    });

    it('should update longestStreak when current streak is higher', () => {
      useScoringStore.setState({
        streak: 5,
        stats: { ...useScoringStore.getState().stats, longestStreak: 3 },
      });
      const { updatePlacementStats } = useScoringStore.getState();
      const placement = createPlacementResult();
      updatePlacementStats(placement);
      expect(useScoringStore.getState().stats.longestStreak).toBe(5);
    });

    it('should not update longestStreak when current streak is lower', () => {
      useScoringStore.setState({
        streak: 2,
        stats: { ...useScoringStore.getState().stats, longestStreak: 10 },
      });
      const { updatePlacementStats } = useScoringStore.getState();
      const placement = createPlacementResult();
      updatePlacementStats(placement);
      expect(useScoringStore.getState().stats.longestStreak).toBe(10);
    });

    it('should update averageAccuracy correctly for first placement', () => {
      const { updatePlacementStats } = useScoringStore.getState();
      const placement = createPlacementResult({ accuracy: 0.8 });
      updatePlacementStats(placement);
      expect(useScoringStore.getState().stats.averageAccuracy).toBe(0.8);
    });

    it('should update averageAccuracy correctly for multiple placements', () => {
      useScoringStore.setState({
        stats: {
          ...useScoringStore.getState().stats,
          totalGamesPlayed: 1,
          averageAccuracy: 0.8,
        },
      });
      const { updatePlacementStats } = useScoringStore.getState();
      const placement = createPlacementResult({ accuracy: 1.0 });
      updatePlacementStats(placement);
      // (0.8 * 9 + 1.0) / 10 = 8.2 / 10 = 0.82
      expect(useScoringStore.getState().stats.averageAccuracy).toBeCloseTo(0.82, 2);
    });

    it('should not duplicate counties in countiesLearned', () => {
      const { updatePlacementStats } = useScoringStore.getState();
      const placement = createPlacementResult();
      updatePlacementStats(placement);
      updatePlacementStats(placement);
      expect(useScoringStore.getState().stats.countiesLearned.size).toBe(1);
    });

    it('should handle multiple different counties', () => {
      const { updatePlacementStats } = useScoringStore.getState();
      const placement1 = createPlacementResult();
      const placement2 = createPlacementResult({
        county: { ...mockCounty, id: 'los-angeles', name: 'Los Angeles' },
      });
      updatePlacementStats(placement1);
      updatePlacementStats(placement2);
      expect(useScoringStore.getState().stats.countiesLearned.size).toBe(2);
    });
  });

  describe('getPersonalBest', () => {
    it('should return current best score', () => {
      useScoringStore.setState({ stats: { ...useScoringStore.getState().stats, bestScore: 1000 } });
      const { getPersonalBest } = useScoringStore.getState();
      const best = getPersonalBest(CaliforniaRegion.BAY_AREA, DifficultyLevel.MEDIUM);
      expect(best).toBe(1000);
    });

    it('should return 0 when no games played', () => {
      const { getPersonalBest } = useScoringStore.getState();
      const best = getPersonalBest(CaliforniaRegion.BAY_AREA, DifficultyLevel.MEDIUM);
      expect(best).toBe(0);
    });

    it('should ignore region and difficulty parameters (returns global best)', () => {
      useScoringStore.setState({ stats: { ...useScoringStore.getState().stats, bestScore: 500 } });
      const { getPersonalBest } = useScoringStore.getState();
      const best1 = getPersonalBest(CaliforniaRegion.NORTHERN, DifficultyLevel.EASY);
      const best2 = getPersonalBest(CaliforniaRegion.SOUTHERN, DifficultyLevel.EXPERT);
      expect(best1).toBe(500);
      expect(best2).toBe(500);
    });
  });

  describe('incrementGamesPlayed', () => {
    it('should increment totalGamesPlayed by 1', () => {
      const { incrementGamesPlayed } = useScoringStore.getState();
      incrementGamesPlayed();
      expect(useScoringStore.getState().stats.totalGamesPlayed).toBe(1);
    });

    it('should accumulate games played correctly', () => {
      const { incrementGamesPlayed } = useScoringStore.getState();
      incrementGamesPlayed();
      incrementGamesPlayed();
      incrementGamesPlayed();
      expect(useScoringStore.getState().stats.totalGamesPlayed).toBe(3);
    });
  });

  describe('finalizeGame', () => {
    it('should update bestScore when current score is higher', () => {
      useScoringStore.setState({
        score: 500,
        stats: { ...useScoringStore.getState().stats, bestScore: 300 },
      });
      const { finalizeGame } = useScoringStore.getState();
      finalizeGame(60000);
      expect(useScoringStore.getState().stats.bestScore).toBe(500);
    });

    it('should not update bestScore when current score is lower', () => {
      useScoringStore.setState({
        score: 200,
        stats: { ...useScoringStore.getState().stats, bestScore: 500 },
      });
      const { finalizeGame } = useScoringStore.getState();
      finalizeGame(60000);
      expect(useScoringStore.getState().stats.bestScore).toBe(500);
    });

    it('should add current score to totalScore', () => {
      useScoringStore.setState({
        score: 300,
        stats: { ...useScoringStore.getState().stats, totalScore: 1000 },
      });
      const { finalizeGame } = useScoringStore.getState();
      finalizeGame(60000);
      expect(useScoringStore.getState().stats.totalScore).toBe(1300);
    });

    it('should add timeElapsed to totalPlayTime', () => {
      useScoringStore.setState({
        stats: { ...useScoringStore.getState().stats, totalPlayTime: 120000 },
      });
      const { finalizeGame } = useScoringStore.getState();
      finalizeGame(60000);
      expect(useScoringStore.getState().stats.totalPlayTime).toBe(180000);
    });

    it('should update longestStreak when current streak is higher', () => {
      useScoringStore.setState({
        streak: 8,
        stats: { ...useScoringStore.getState().stats, longestStreak: 5 },
      });
      const { finalizeGame } = useScoringStore.getState();
      finalizeGame(60000);
      expect(useScoringStore.getState().stats.longestStreak).toBe(8);
    });

    it('should not update longestStreak when current streak is lower', () => {
      useScoringStore.setState({
        streak: 3,
        stats: { ...useScoringStore.getState().stats, longestStreak: 10 },
      });
      const { finalizeGame } = useScoringStore.getState();
      finalizeGame(60000);
      expect(useScoringStore.getState().stats.longestStreak).toBe(10);
    });

    it('should handle zero time elapsed', () => {
      const { finalizeGame } = useScoringStore.getState();
      finalizeGame(0);
      expect(useScoringStore.getState().stats.totalPlayTime).toBe(0);
    });

    it('should update all stats in single finalization', () => {
      useScoringStore.setState({
        score: 1000,
        streak: 15,
        stats: {
          ...useScoringStore.getState().stats,
          bestScore: 800,
          totalScore: 5000,
          totalPlayTime: 300000,
          longestStreak: 10,
        },
      });
      const { finalizeGame } = useScoringStore.getState();
      finalizeGame(60000);
      const stats = useScoringStore.getState().stats;
      expect(stats.bestScore).toBe(1000);
      expect(stats.totalScore).toBe(6000);
      expect(stats.totalPlayTime).toBe(360000);
      expect(stats.longestStreak).toBe(15);
    });
  });

  describe('resetScore', () => {
    it('should reset score to 0', () => {
      useScoringStore.setState({ score: 500 });
      const { resetScore } = useScoringStore.getState();
      resetScore();
      expect(useScoringStore.getState().score).toBe(0);
    });

    it('should reset streak to 0', () => {
      useScoringStore.setState({ streak: 10 });
      const { resetScore } = useScoringStore.getState();
      resetScore();
      expect(useScoringStore.getState().streak).toBe(0);
    });

    it('should reset mistakes to 0', () => {
      useScoringStore.setState({ mistakes: 5 });
      const { resetScore } = useScoringStore.getState();
      resetScore();
      expect(useScoringStore.getState().mistakes).toBe(0);
    });

    it('should reset all scoring state at once', () => {
      useScoringStore.setState({ score: 1000, streak: 10, mistakes: 5 });
      const { resetScore } = useScoringStore.getState();
      resetScore();
      const state = useScoringStore.getState();
      expect(state.score).toBe(0);
      expect(state.streak).toBe(0);
      expect(state.mistakes).toBe(0);
    });

    it('should not affect stats when resetting score', () => {
      const originalStats = {
        totalGamesPlayed: 10,
        totalScore: 5000,
        bestScore: 800,
        averageAccuracy: 0.85,
        totalPlayTime: 600000,
        favoriteDifficulty: DifficultyLevel.HARD,
        favoriteRegion: CaliforniaRegion.CENTRAL,
        countiesLearned: new Set(['san-francisco', 'los-angeles']),
        perfectPlacements: 25,
        longestStreak: 15,
      };
      useScoringStore.setState({ score: 500, streak: 5, mistakes: 2, stats: originalStats });
      const { resetScore } = useScoringStore.getState();
      resetScore();
      expect(useScoringStore.getState().stats).toEqual(originalStats);
    });
  });

  describe('Edge Cases', () => {
    describe('Boundary Values', () => {
      it('should handle accuracy of exactly 1.0', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 10000);
        expect(score).toBeGreaterThan(0);
      });

      it('should handle accuracy of exactly 0.0', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 0.0, 10000);
        expect(score).toBe(0);
      });

      it('should handle time at speed threshold (5000ms)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score1 = calculateScore(DifficultyLevel.EASY, 1.0, 4999);
        const score2 = calculateScore(DifficultyLevel.EASY, 1.0, 5000);
        expect(score1).toBeGreaterThan(score2);
      });

      it('should handle time at speed threshold (10000ms)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score1 = calculateScore(DifficultyLevel.EASY, 1.0, 9999);
        const score2 = calculateScore(DifficultyLevel.EASY, 1.0, 10000);
        expect(score1).toBeGreaterThan(score2);
      });

      it('should handle very large time values', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, Number.MAX_SAFE_INTEGER);
        expect(score).toBeGreaterThan(0);
        expect(Number.isFinite(score)).toBe(true);
      });

      it('should handle maximum streak (10)', () => {
        useScoringStore.setState({ streak: 10 });
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 10000);
        expect(score).toBe(200); // 100 * 1.0 * 1.0 * 1.0 * 2.0
      });

      it('should handle streak beyond cap (15)', () => {
        useScoringStore.setState({ streak: 15 });
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 10000);
        expect(score).toBe(200); // Still capped at 2.0x
      });
    });

    describe('Negative and Invalid Values', () => {
      it('should handle negative time (edge case)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, -1000);
        // Should apply fast speed multiplier (< 5000)
        expect(score).toBeGreaterThan(0);
      });

      it('should handle negative accuracy (invalid input)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, -0.5, 10000);
        expect(score).toBeLessThanOrEqual(0);
      });

      it('should handle accuracy > 1.0 (invalid input)', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.5, 10000);
        expect(score).toBeGreaterThan(100);
      });

      it('should handle negative mode multiplier', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 10000, -1.0);
        expect(score).toBeLessThanOrEqual(0);
      });

      it('should handle zero mode multiplier', () => {
        const { calculateScore } = useScoringStore.getState();
        const score = calculateScore(DifficultyLevel.EASY, 1.0, 10000, 0);
        expect(score).toBe(0);
      });
    });

    describe('State Persistence', () => {
      it('should maintain countiesLearned as Set after operations', () => {
        const { updatePlacementStats } = useScoringStore.getState();
        const placement = {
          county: mockCounty,
          accuracy: 1.0,
          distance: 0,
          isCorrect: true,
          scoreAwarded: 100,
          timeToPlace: 5000,
        };
        updatePlacementStats(placement);
        expect(useScoringStore.getState().stats.countiesLearned).toBeInstanceOf(Set);
      });

      it('should handle very large mistake counts', () => {
        useScoringStore.setState({ mistakes: 9999 });
        const { updateStreak } = useScoringStore.getState();
        updateStreak(false);
        expect(useScoringStore.getState().mistakes).toBe(10000);
      });

      it('should handle very large game counts', () => {
        useScoringStore.setState({
          stats: { ...useScoringStore.getState().stats, totalGamesPlayed: 999999 },
        });
        const { incrementGamesPlayed } = useScoringStore.getState();
        incrementGamesPlayed();
        expect(useScoringStore.getState().stats.totalGamesPlayed).toBe(1000000);
      });
    });
  });
});
