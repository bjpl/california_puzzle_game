import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MOCK_SCORING_CONFIG } from '../../fixtures';

// Mock scoring system
interface GameScoreConfig {
  baseScore: number;
  timeBonus: number;
  accuracyBonus: number;
  hintsUsedPenalty: number;
  mistakesPenalty: number;
  perfectGameBonus: number;
  difficultyMultipliers: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface GameStats {
  correctAnswers: number;
  totalQuestions: number;
  timeElapsed: number; // in seconds
  hintsUsed: number;
  mistakes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isPerfectGame: boolean;
}

class ScoringAlgorithm {
  private config: GameScoreConfig;

  constructor(config: GameScoreConfig = MOCK_SCORING_CONFIG) {
    this.config = config;
  }

  calculateScore(stats: GameStats): {
    totalScore: number;
    breakdown: {
      baseScore: number;
      timeBonus: number;
      accuracyBonus: number;
      hintsUsedPenalty: number;
      mistakesPenalty: number;
      perfectGameBonus: number;
      difficultyMultiplier: number;
    };
  } {
    const accuracy = stats.totalQuestions > 0 ? stats.correctAnswers / stats.totalQuestions : 0;
    const difficultyMultiplier = this.config.difficultyMultipliers[stats.difficulty];

    // Base score calculation
    const baseScore = this.config.baseScore * stats.correctAnswers;

    // Time bonus (faster completion = higher bonus)
    const averageTimePerQuestion = stats.timeElapsed / Math.max(stats.totalQuestions, 1);
    const timeBonus = Math.max(0, this.config.timeBonus - averageTimePerQuestion);

    // Accuracy bonus
    const accuracyBonus = accuracy * this.config.accuracyBonus * stats.correctAnswers;

    // Penalties
    const hintsUsedPenalty = stats.hintsUsed * this.config.hintsUsedPenalty;
    const mistakesPenalty = stats.mistakes * this.config.mistakesPenalty;

    // Perfect game bonus
    const perfectGameBonus = stats.isPerfectGame ? this.config.perfectGameBonus : 0;

    // Calculate subtotal before difficulty multiplier
    const subtotal = Math.max(0,
      baseScore + timeBonus + accuracyBonus + perfectGameBonus - hintsUsedPenalty - mistakesPenalty
    );

    // Apply difficulty multiplier
    const totalScore = Math.round(subtotal * difficultyMultiplier);

    return {
      totalScore,
      breakdown: {
        baseScore,
        timeBonus: Math.round(timeBonus),
        accuracyBonus: Math.round(accuracyBonus),
        hintsUsedPenalty,
        mistakesPenalty,
        perfectGameBonus,
        difficultyMultiplier
      }
    };
  }

  calculateAccuracy(correctAnswers: number, totalQuestions: number): number {
    if (totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
  }

  determineGrade(accuracy: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (accuracy >= 97) return 'A+';
    if (accuracy >= 93) return 'A';
    if (accuracy >= 90) return 'B+';
    if (accuracy >= 87) return 'B';
    if (accuracy >= 83) return 'C+';
    if (accuracy >= 80) return 'C';
    if (accuracy >= 70) return 'D';
    return 'F';
  }

  calculateTimeBonus(timeElapsed: number, totalQuestions: number): number {
    const averageTimePerQuestion = timeElapsed / Math.max(totalQuestions, 1);
    return Math.max(0, this.config.timeBonus - averageTimePerQuestion);
  }

  isPerfectGame(mistakes: number, hintsUsed: number, accuracy: number): boolean {
    return mistakes === 0 && hintsUsed === 0 && accuracy === 100;
  }

  getMaxPossibleScore(totalQuestions: number, difficulty: 'easy' | 'medium' | 'hard'): number {
    const baseScore = this.config.baseScore * totalQuestions;
    const maxTimeBonus = this.config.timeBonus * totalQuestions;
    const maxAccuracyBonus = this.config.accuracyBonus * totalQuestions;
    const perfectGameBonus = this.config.perfectGameBonus;
    const difficultyMultiplier = this.config.difficultyMultipliers[difficulty];

    return Math.round((baseScore + maxTimeBonus + maxAccuracyBonus + perfectGameBonus) * difficultyMultiplier);
  }
}

describe('Scoring Algorithms', () => {
  let scoringAlgorithm: ScoringAlgorithm;

  beforeEach(() => {
    scoringAlgorithm = new ScoringAlgorithm();
  });

  describe('Basic Score Calculation', () => {
    it('should calculate correct base score', () => {
      const stats: GameStats = {
        correctAnswers: 5,
        totalQuestions: 10,
        timeElapsed: 60,
        hintsUsed: 0,
        mistakes: 0,
        difficulty: 'medium',
        isPerfectGame: false
      };

      const result = scoringAlgorithm.calculateScore(stats);

      expect(result.breakdown.baseScore).toBe(MOCK_SCORING_CONFIG.baseScore * 5);
      expect(result.totalScore).toBeGreaterThan(0);
    });

    it('should handle zero correct answers', () => {
      const stats: GameStats = {
        correctAnswers: 0,
        totalQuestions: 10,
        timeElapsed: 60,
        hintsUsed: 0,
        mistakes: 5,
        difficulty: 'medium',
        isPerfectGame: false
      };

      const result = scoringAlgorithm.calculateScore(stats);

      expect(result.breakdown.baseScore).toBe(0);
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });

    it('should never return negative scores', () => {
      const stats: GameStats = {
        correctAnswers: 1,
        totalQuestions: 10,
        timeElapsed: 1000,
        hintsUsed: 10,
        mistakes: 10,
        difficulty: 'medium',
        isPerfectGame: false
      };

      const result = scoringAlgorithm.calculateScore(stats);

      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Time Bonus Calculation', () => {
    it('should award time bonus for fast completion', () => {
      const fastStats: GameStats = {
        correctAnswers: 10,
        totalQuestions: 10,
        timeElapsed: 30, // 3 seconds per question
        hintsUsed: 0,
        mistakes: 0,
        difficulty: 'medium',
        isPerfectGame: true
      };

      const result = scoringAlgorithm.calculateScore(fastStats);

      expect(result.breakdown.timeBonus).toBeGreaterThan(0);
    });

    it('should reduce time bonus for slow completion', () => {
      const slowStats: GameStats = {
        correctAnswers: 10,
        totalQuestions: 10,
        timeElapsed: 600, // 60 seconds per question
        hintsUsed: 0,
        mistakes: 0,
        difficulty: 'medium',
        isPerfectGame: true
      };

      const result = scoringAlgorithm.calculateScore(slowStats);

      expect(result.breakdown.timeBonus).toBe(0);
    });

    it('should calculate time bonus correctly', () => {
      const timeBonus = scoringAlgorithm.calculateTimeBonus(60, 10); // 6 sec per question
      const expectedBonus = Math.max(0, MOCK_SCORING_CONFIG.timeBonus - 6);

      expect(timeBonus).toBe(expectedBonus);
    });
  });

  describe('Accuracy Bonus Calculation', () => {
    it('should award accuracy bonus for perfect accuracy', () => {
      const perfectStats: GameStats = {
        correctAnswers: 10,
        totalQuestions: 10,
        timeElapsed: 60,
        hintsUsed: 0,
        mistakes: 0,
        difficulty: 'medium',
        isPerfectGame: true
      };

      const result = scoringAlgorithm.calculateScore(perfectStats);

      expect(result.breakdown.accuracyBonus).toBe(MOCK_SCORING_CONFIG.accuracyBonus * 10);
    });

    it('should calculate partial accuracy bonus', () => {
      const partialStats: GameStats = {
        correctAnswers: 7,
        totalQuestions: 10,
        timeElapsed: 60,
        hintsUsed: 0,
        mistakes: 3,
        difficulty: 'medium',
        isPerfectGame: false
      };

      const result = scoringAlgorithm.calculateScore(partialStats);
      const expectedAccuracyBonus = 0.7 * MOCK_SCORING_CONFIG.accuracyBonus * 7;

      expect(result.breakdown.accuracyBonus).toBe(Math.round(expectedAccuracyBonus));
    });

    it('should calculate accuracy percentage correctly', () => {
      expect(scoringAlgorithm.calculateAccuracy(8, 10)).toBe(80);
      expect(scoringAlgorithm.calculateAccuracy(10, 10)).toBe(100);
      expect(scoringAlgorithm.calculateAccuracy(0, 10)).toBe(0);
      expect(scoringAlgorithm.calculateAccuracy(5, 0)).toBe(0);
    });
  });

  describe('Penalty System', () => {
    it('should apply hints used penalty', () => {
      const stats: GameStats = {
        correctAnswers: 10,
        totalQuestions: 10,
        timeElapsed: 60,
        hintsUsed: 3,
        mistakes: 0,
        difficulty: 'medium',
        isPerfectGame: false
      };

      const result = scoringAlgorithm.calculateScore(stats);

      expect(result.breakdown.hintsUsedPenalty).toBe(3 * MOCK_SCORING_CONFIG.hintsUsedPenalty);
    });

    it('should apply mistakes penalty', () => {
      const stats: GameStats = {
        correctAnswers: 7,
        totalQuestions: 10,
        timeElapsed: 60,
        hintsUsed: 0,
        mistakes: 3,
        difficulty: 'medium',
        isPerfectGame: false
      };

      const result = scoringAlgorithm.calculateScore(stats);

      expect(result.breakdown.mistakesPenalty).toBe(3 * MOCK_SCORING_CONFIG.mistakesPenalty);
    });

    it('should handle multiple penalties', () => {
      const stats: GameStats = {
        correctAnswers: 5,
        totalQuestions: 10,
        timeElapsed: 120,
        hintsUsed: 2,
        mistakes: 5,
        difficulty: 'medium',
        isPerfectGame: false
      };

      const result = scoringAlgorithm.calculateScore(stats);

      expect(result.breakdown.hintsUsedPenalty).toBe(2 * MOCK_SCORING_CONFIG.hintsUsedPenalty);
      expect(result.breakdown.mistakesPenalty).toBe(5 * MOCK_SCORING_CONFIG.mistakesPenalty);
    });
  });

  describe('Perfect Game Bonus', () => {
    it('should award perfect game bonus', () => {
      const perfectStats: GameStats = {
        correctAnswers: 10,
        totalQuestions: 10,
        timeElapsed: 60,
        hintsUsed: 0,
        mistakes: 0,
        difficulty: 'medium',
        isPerfectGame: true
      };

      const result = scoringAlgorithm.calculateScore(perfectStats);

      expect(result.breakdown.perfectGameBonus).toBe(MOCK_SCORING_CONFIG.perfectGameBonus);
    });

    it('should not award perfect game bonus for imperfect games', () => {
      const imperfectStats: GameStats = {
        correctAnswers: 9,
        totalQuestions: 10,
        timeElapsed: 60,
        hintsUsed: 0,
        mistakes: 1,
        difficulty: 'medium',
        isPerfectGame: false
      };

      const result = scoringAlgorithm.calculateScore(imperfectStats);

      expect(result.breakdown.perfectGameBonus).toBe(0);
    });

    it('should correctly identify perfect games', () => {
      expect(scoringAlgorithm.isPerfectGame(0, 0, 100)).toBe(true);
      expect(scoringAlgorithm.isPerfectGame(1, 0, 100)).toBe(false);
      expect(scoringAlgorithm.isPerfectGame(0, 1, 100)).toBe(false);
      expect(scoringAlgorithm.isPerfectGame(0, 0, 90)).toBe(false);
    });
  });

  describe('Difficulty Multipliers', () => {
    it('should apply easy difficulty multiplier', () => {
      const stats: GameStats = {
        correctAnswers: 10,
        totalQuestions: 10,
        timeElapsed: 60,
        hintsUsed: 0,
        mistakes: 0,
        difficulty: 'easy',
        isPerfectGame: true
      };

      const result = scoringAlgorithm.calculateScore(stats);

      expect(result.breakdown.difficultyMultiplier).toBe(MOCK_SCORING_CONFIG.difficultyMultipliers.easy);
    });

    it('should apply medium difficulty multiplier', () => {
      const stats: GameStats = {
        correctAnswers: 10,
        totalQuestions: 10,
        timeElapsed: 60,
        hintsUsed: 0,
        mistakes: 0,
        difficulty: 'medium',
        isPerfectGame: true
      };

      const result = scoringAlgorithm.calculateScore(stats);

      expect(result.breakdown.difficultyMultiplier).toBe(MOCK_SCORING_CONFIG.difficultyMultipliers.medium);
    });

    it('should apply hard difficulty multiplier', () => {
      const stats: GameStats = {
        correctAnswers: 10,
        totalQuestions: 10,
        timeElapsed: 60,
        hintsUsed: 0,
        mistakes: 0,
        difficulty: 'hard',
        isPerfectGame: true
      };

      const result = scoringAlgorithm.calculateScore(stats);

      expect(result.breakdown.difficultyMultiplier).toBe(MOCK_SCORING_CONFIG.difficultyMultipliers.hard);
    });

    it('should show higher scores for harder difficulties', () => {
      const baseStats = {
        correctAnswers: 10,
        totalQuestions: 10,
        timeElapsed: 60,
        hintsUsed: 0,
        mistakes: 0,
        isPerfectGame: true
      };

      const easyResult = scoringAlgorithm.calculateScore({ ...baseStats, difficulty: 'easy' });
      const mediumResult = scoringAlgorithm.calculateScore({ ...baseStats, difficulty: 'medium' });
      const hardResult = scoringAlgorithm.calculateScore({ ...baseStats, difficulty: 'hard' });

      expect(hardResult.totalScore).toBeGreaterThan(mediumResult.totalScore);
      expect(mediumResult.totalScore).toBeGreaterThan(easyResult.totalScore);
    });
  });

  describe('Grade System', () => {
    it('should assign correct grades', () => {
      expect(scoringAlgorithm.determineGrade(100)).toBe('A+');
      expect(scoringAlgorithm.determineGrade(97)).toBe('A+');
      expect(scoringAlgorithm.determineGrade(95)).toBe('A');
      expect(scoringAlgorithm.determineGrade(90)).toBe('B+');
      expect(scoringAlgorithm.determineGrade(85)).toBe('B');
      expect(scoringAlgorithm.determineGrade(80)).toBe('C+');
      expect(scoringAlgorithm.determineGrade(75)).toBe('C');
      expect(scoringAlgorithm.determineGrade(65)).toBe('F');
    });

    it('should handle edge cases for grades', () => {
      expect(scoringAlgorithm.determineGrade(0)).toBe('F');
      expect(scoringAlgorithm.determineGrade(70)).toBe('D');
      expect(scoringAlgorithm.determineGrade(93)).toBe('A');
    });
  });

  describe('Maximum Score Calculation', () => {
    it('should calculate maximum possible score correctly', () => {
      const maxScore = scoringAlgorithm.getMaxPossibleScore(10, 'medium');

      const expectedMax = Math.round((
        MOCK_SCORING_CONFIG.baseScore * 10 +
        MOCK_SCORING_CONFIG.timeBonus * 10 +
        MOCK_SCORING_CONFIG.accuracyBonus * 10 +
        MOCK_SCORING_CONFIG.perfectGameBonus
      ) * MOCK_SCORING_CONFIG.difficultyMultipliers.medium);

      expect(maxScore).toBe(expectedMax);
    });

    it('should vary max score by difficulty', () => {
      const easyMax = scoringAlgorithm.getMaxPossibleScore(10, 'easy');
      const mediumMax = scoringAlgorithm.getMaxPossibleScore(10, 'medium');
      const hardMax = scoringAlgorithm.getMaxPossibleScore(10, 'hard');

      expect(hardMax).toBeGreaterThan(mediumMax);
      expect(mediumMax).toBeGreaterThan(easyMax);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle division by zero gracefully', () => {
      const stats: GameStats = {
        correctAnswers: 0,
        totalQuestions: 0,
        timeElapsed: 0,
        hintsUsed: 0,
        mistakes: 0,
        difficulty: 'medium',
        isPerfectGame: false
      };

      expect(() => {
        scoringAlgorithm.calculateScore(stats);
      }).not.toThrow();
    });

    it('should handle negative inputs gracefully', () => {
      const stats: GameStats = {
        correctAnswers: -1,
        totalQuestions: 10,
        timeElapsed: -10,
        hintsUsed: -1,
        mistakes: -1,
        difficulty: 'medium',
        isPerfectGame: false
      };

      const result = scoringAlgorithm.calculateScore(stats);
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle very large numbers', () => {
      const stats: GameStats = {
        correctAnswers: 1000000,
        totalQuestions: 1000000,
        timeElapsed: 1000000,
        hintsUsed: 0,
        mistakes: 0,
        difficulty: 'medium',
        isPerfectGame: true
      };

      expect(() => {
        const result = scoringAlgorithm.calculateScore(stats);
        expect(result.totalScore).toBeGreaterThan(0);
        expect(Number.isFinite(result.totalScore)).toBe(true);
      }).not.toThrow();
    });
  });

  describe('Scoring Consistency', () => {
    it('should return consistent scores for identical inputs', () => {
      const stats: GameStats = {
        correctAnswers: 8,
        totalQuestions: 10,
        timeElapsed: 90,
        hintsUsed: 1,
        mistakes: 2,
        difficulty: 'medium',
        isPerfectGame: false
      };

      const result1 = scoringAlgorithm.calculateScore(stats);
      const result2 = scoringAlgorithm.calculateScore(stats);

      expect(result1.totalScore).toBe(result2.totalScore);
      expect(result1.breakdown).toEqual(result2.breakdown);
    });

    it('should validate scoring formula integrity', () => {
      const stats: GameStats = {
        correctAnswers: 5,
        totalQuestions: 10,
        timeElapsed: 60,
        hintsUsed: 1,
        mistakes: 1,
        difficulty: 'medium',
        isPerfectGame: false
      };

      const result = scoringAlgorithm.calculateScore(stats);
      const breakdown = result.breakdown;

      // Manually calculate expected total
      const subtotal = Math.max(0,
        breakdown.baseScore +
        breakdown.timeBonus +
        breakdown.accuracyBonus +
        breakdown.perfectGameBonus -
        breakdown.hintsUsedPenalty -
        breakdown.mistakesPenalty
      );

      const expectedTotal = Math.round(subtotal * breakdown.difficultyMultiplier);

      expect(result.totalScore).toBe(expectedTotal);
    });
  });
});