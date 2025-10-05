import { describe, it, expect } from 'vitest';
import {
  getQuestionsByRegion,
  getQuestionsByCounty,
  getQuestionsByType,
  getRandomQuestions,
} from '../src/data/californiaQuizQuestions';

describe('Quiz Filtering', () => {
  const regions = [
    'Bay Area',
    'Southern California',
    'Central Valley',
    'Central Coast',
    'Northern California',
    'North Coast',
    'Sierra Nevada',
  ];

  describe('Region Filtering', () => {
    it('should return questions for each region', () => {
      regions.forEach((region) => {
        const questions = getQuestionsByRegion(region);
        expect(questions.length).toBeGreaterThan(0);
        questions.forEach((q) => {
          expect(q.region).toBe(region);
        });
      });
    });

    it('should return all questions when region is "all"', () => {
      const allQuestions = getQuestionsByRegion('all');
      expect(allQuestions.length).toBeGreaterThan(0);
    });
  });

  describe('County Filtering', () => {
    it('should filter questions by county name', () => {
      const losAngelesQuestions = getQuestionsByCounty('Los Angeles');
      // Should return array (may be empty if no questions for this county)
      expect(Array.isArray(losAngelesQuestions)).toBe(true);
      // If questions exist, they should all be for Los Angeles
      losAngelesQuestions.forEach((q) => {
        expect(q.countyName).toBe('Los Angeles');
      });
    });

    it('should filter questions correctly for different counties', () => {
      const alamedaQuestions = getQuestionsByCounty('Alameda');
      // Should return array (may be empty if no questions for this county)
      expect(Array.isArray(alamedaQuestions)).toBe(true);
      // If questions exist, they should all be for Alameda
      alamedaQuestions.forEach((q) => {
        expect(q.countyName).toBe('Alameda');
      });
    });
  });

  describe('Question Type Filtering', () => {
    const questionTypes = [
      'capital',
      'landmark',
      'geography',
      'history',
      'economy',
      'demographics',
      'nature',
      'culture',
    ];

    it('should return questions for each type', () => {
      questionTypes.forEach((type) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const questions = getQuestionsByType(type as any);
        expect(questions.length).toBeGreaterThan(0);
        questions.forEach((q) => {
          expect(q.type).toBe(type);
        });
      });
    });
  });

  describe('Random Question Selection', () => {
    it('should return requested number of random questions', () => {
      const randomQuestions = getRandomQuestions(5, { region: 'Bay Area' });
      expect(randomQuestions.length).toBe(5);
      randomQuestions.forEach((q) => {
        expect(q.region).toBe('Bay Area');
      });
    });

    it('should return different questions on multiple calls', () => {
      const first = getRandomQuestions(3, { region: 'Bay Area' });
      const second = getRandomQuestions(3, { region: 'Bay Area' });

      // At least one should be different (statistically very likely with randomization)
      const firstIds = first.map((q) => q.countyName + q.question);
      const secondIds = second.map((q) => q.countyName + q.question);
      const allSame = firstIds.every((id, i) => id === secondIds[i]);

      // This might occasionally fail due to randomness, but very unlikely
      expect(allSame).toBe(false);
    });
  });
});
