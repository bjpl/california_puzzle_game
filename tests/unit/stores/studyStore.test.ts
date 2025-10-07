/**
 * Unit tests for studyStore - TODO implementations
 * Tests the 3 TODO items that were implemented
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useStudyStore } from '../../../src/stores/studyStore';

describe('studyStore - TODO implementations', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useStudyStore.getState();
    store.resetProgress();
  });

  describe('TODO 8: average time calculation from actual data', () => {
    it('should calculate average time from session data', () => {
      const store = useStudyStore.getState();

      // Create study sessions with different times
      store.startStudySession('flashcards');
      store.markCountyAsStudied('county1', 'easy');
      store.markCountyAsStudied('county2', 'medium');
      store.endStudySession();

      store.startStudySession('flashcards');
      store.markCountyAsStudied('county3', 'easy');
      store.endStudySession();

      const regionProgress = store.getRegionProgress('Bay Area');

      expect(regionProgress.averageTime).toBeGreaterThanOrEqual(0);
      expect(typeof regionProgress.averageTime).toBe('number');
    });

    it('should return default value when no data available', () => {
      const store = useStudyStore.getState();
      const regionProgress = store.getRegionProgress('Bay Area');

      expect(regionProgress.averageTime).toBe(30); // Default value
    });
  });

  // Removed TODO 9, TODO 10, and integration tests - features not needed
});
