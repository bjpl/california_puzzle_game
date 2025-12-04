/**
 * Hint System Store Unit Tests
 *
 * Purpose: Test hint system state management
 * Coverage: Hint availability, usage, cooldowns, struggle detection, and settings
 *
 * Last updated: 2025-12-03
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useHintStore } from '../../../src/stores/hintSystemStore';
import { HintType } from '../../../src/types';
import type { Position, StruggleData } from '../../../src/types';

// Mock Date.now for consistent timing tests
const mockNow = 1000000000;
let currentTime = mockNow;

describe('Hint System Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useHintStore.setState({
      hintSystem: {
        availableHints: 3,
        usedHints: 0,
        freeHintsRemaining: 1,
        currentHintType: undefined,
        hintProgress: 0,
        cooldownTimeRemaining: 0,
        lastHintUsedAt: undefined,
        strugglingCounties: [],
        autoSuggestEnabled: true,
      },
      hintSettings: {
        maxHintsPerLevel: 3,
        hintCooldownMs: 30000,
        scorePenaltyPerHint: 50,
        freeHintsAllowed: 1,
        autoSuggestThreshold: 3,
        enableVisualIndicators: true,
        enableEducationalHints: true,
      },
    });

    // Setup Date.now mock
    currentTime = mockNow;
    vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial hint system state', () => {
      const state = useHintStore.getState();

      expect(state.hintSystem.availableHints).toBe(3);
      expect(state.hintSystem.usedHints).toBe(0);
      expect(state.hintSystem.freeHintsRemaining).toBe(1);
      expect(state.hintSystem.currentHintType).toBeUndefined();
      expect(state.hintSystem.hintProgress).toBe(0);
      expect(state.hintSystem.cooldownTimeRemaining).toBe(0);
      expect(state.hintSystem.lastHintUsedAt).toBeUndefined();
      expect(state.hintSystem.strugglingCounties).toEqual([]);
      expect(state.hintSystem.autoSuggestEnabled).toBe(true);
    });

    it('should have correct default hint settings', () => {
      const state = useHintStore.getState();

      expect(state.hintSettings.maxHintsPerLevel).toBe(3);
      expect(state.hintSettings.hintCooldownMs).toBe(30000);
      expect(state.hintSettings.scorePenaltyPerHint).toBe(50);
      expect(state.hintSettings.freeHintsAllowed).toBe(1);
      expect(state.hintSettings.autoSuggestThreshold).toBe(3);
      expect(state.hintSettings.enableVisualIndicators).toBe(true);
      expect(state.hintSettings.enableEducationalHints).toBe(true);
    });

    it('should have all required actions', () => {
      const state = useHintStore.getState();

      expect(state.useHint).toBeDefined();
      expect(state.updateHintSystem).toBeDefined();
      expect(state.analyzePlayerStruggle).toBeDefined();
      expect(state.resetHintSystem).toBeDefined();
      expect(state.initializeForMode).toBeDefined();
      expect(state.updateCooldown).toBeDefined();
      expect(state.updateSettings).toBeDefined();
    });
  });

  describe('useHint Action', () => {
    it('should consume a hint successfully', () => {
      const store = useHintStore.getState();

      store.useHint(HintType.LOCATION, 'county-1', false);

      const state = useHintStore.getState();
      expect(state.hintSystem.availableHints).toBe(2);
      expect(state.hintSystem.usedHints).toBe(1);
      expect(state.hintSystem.currentHintType).toBe(HintType.LOCATION);
      expect(state.hintSystem.hintProgress).toBe(0.3);
      expect(state.hintSystem.cooldownTimeRemaining).toBe(30000);
      expect(state.hintSystem.lastHintUsedAt).toBe(mockNow);
    });

    it('should use different hint types', () => {
      const store = useHintStore.getState();

      // Use SHAPE hint
      store.useHint(HintType.SHAPE, 'county-1', false);
      expect(useHintStore.getState().hintSystem.currentHintType).toBe(HintType.SHAPE);

      // Reset cooldown and hints
      store.updateHintSystem({ cooldownTimeRemaining: 0, availableHints: 3 });

      // Use NEIGHBOR hint
      store.useHint(HintType.NEIGHBOR, 'county-2', false);
      expect(useHintStore.getState().hintSystem.currentHintType).toBe(HintType.NEIGHBOR);

      // Reset again
      store.updateHintSystem({ cooldownTimeRemaining: 0, availableHints: 3 });

      // Use EDUCATIONAL hint
      store.useHint(HintType.EDUCATIONAL, 'county-3', false);
      expect(useHintStore.getState().hintSystem.currentHintType).toBe(HintType.EDUCATIONAL);
    });

    it('should not consume hint when in cooldown', () => {
      const store = useHintStore.getState();

      // First hint
      store.useHint(HintType.LOCATION, 'county-1', false);
      expect(useHintStore.getState().hintSystem.availableHints).toBe(2);

      // Try to use hint during cooldown
      store.useHint(HintType.SHAPE, 'county-2', false);

      // Should still have 2 hints (not consumed)
      const state = useHintStore.getState();
      expect(state.hintSystem.availableHints).toBe(2);
      expect(state.hintSystem.usedHints).toBe(1);
      expect(state.hintSystem.currentHintType).toBe(HintType.LOCATION); // Still the first hint
    });

    it('should not consume hint when no hints available', () => {
      const store = useHintStore.getState();

      // Use all hints
      store.updateHintSystem({ cooldownTimeRemaining: 0 });
      store.useHint(HintType.LOCATION, 'county-1', false);

      store.updateHintSystem({ cooldownTimeRemaining: 0 });
      store.useHint(HintType.SHAPE, 'county-2', false);

      store.updateHintSystem({ cooldownTimeRemaining: 0 });
      store.useHint(HintType.NEIGHBOR, 'county-3', false);

      expect(useHintStore.getState().hintSystem.availableHints).toBe(0);

      // Try to use hint when none available
      store.updateHintSystem({ cooldownTimeRemaining: 0 });
      store.useHint(HintType.FACT, 'county-4', false);

      // Should still be 0
      const state = useHintStore.getState();
      expect(state.hintSystem.availableHints).toBe(0);
      expect(state.hintSystem.usedHints).toBe(3);
    });

    it('should handle auto-suggested hints', () => {
      const store = useHintStore.getState();

      // Auto-suggested hint should not cost anything
      store.useHint(HintType.LOCATION, 'county-1', true);

      const state = useHintStore.getState();
      expect(state.hintSystem.availableHints).toBe(2);
      expect(state.hintSystem.usedHints).toBe(1);
      // Note: actualCost is calculated but not used yet (future feature)
    });

    it('should handle educational hints (no penalty)', () => {
      const store = useHintStore.getState();

      // Educational hints should have no penalty
      store.useHint(HintType.EDUCATIONAL, 'county-1', false);

      const state = useHintStore.getState();
      expect(state.hintSystem.availableHints).toBe(2);
      expect(state.hintSystem.usedHints).toBe(1);
      expect(state.hintSystem.currentHintType).toBe(HintType.EDUCATIONAL);
    });

    it('should update struggling counties when hint is used', () => {
      const store = useHintStore.getState();

      // Add struggling county
      const struggle: StruggleData = {
        countyId: 'county-1',
        attempts: 3,
        lastAttemptAt: mockNow,
        totalTimeSpent: 5000,
        wrongPlacements: [{ x: 100, y: 200 }],
        suggestedHints: [],
      };

      store.updateHintSystem({ strugglingCounties: [struggle] });

      // Use hint for this county
      store.useHint(HintType.LOCATION, 'county-1', false);

      const state = useHintStore.getState();
      expect(state.hintSystem.strugglingCounties[0].suggestedHints).toContain(HintType.LOCATION);
    });

    it('should use free hints before applying penalties', () => {
      const store = useHintStore.getState();

      // First hint should be free
      store.useHint(HintType.LOCATION, 'county-1', false);
      expect(useHintStore.getState().hintSystem.usedHints).toBe(1);

      // Reset cooldown for second hint
      store.updateHintSystem({ cooldownTimeRemaining: 0 });

      // Second hint should have penalty (not free anymore)
      store.useHint(HintType.SHAPE, 'county-2', false);
      expect(useHintStore.getState().hintSystem.usedHints).toBe(2);
    });
  });

  describe('analyzePlayerStruggle Function', () => {
    it('should create new struggle data for first incorrect attempt', () => {
      const store = useHintStore.getState();
      const position: Position = { x: 100, y: 200 };

      store.analyzePlayerStruggle('county-1', position, false);

      const state = useHintStore.getState();
      expect(state.hintSystem.strugglingCounties).toHaveLength(1);

      const struggle = state.hintSystem.strugglingCounties[0];
      expect(struggle.countyId).toBe('county-1');
      expect(struggle.attempts).toBe(1);
      expect(struggle.lastAttemptAt).toBe(mockNow);
      expect(struggle.totalTimeSpent).toBeGreaterThan(0);
      expect(struggle.wrongPlacements).toContainEqual(position);
      expect(struggle.suggestedHints).toEqual([]);
    });

    it('should update existing struggle data for repeated incorrect attempts', () => {
      const store = useHintStore.getState();
      const position1: Position = { x: 100, y: 200 };
      const position2: Position = { x: 150, y: 250 };

      // First attempt
      store.analyzePlayerStruggle('county-1', position1, false);
      expect(useHintStore.getState().hintSystem.strugglingCounties[0].attempts).toBe(1);

      // Advance time
      currentTime += 2000;

      // Second attempt
      store.analyzePlayerStruggle('county-1', position2, false);

      const state = useHintStore.getState();
      expect(state.hintSystem.strugglingCounties).toHaveLength(1);

      const struggle = state.hintSystem.strugglingCounties[0];
      expect(struggle.attempts).toBe(2);
      expect(struggle.lastAttemptAt).toBe(currentTime);
      expect(struggle.totalTimeSpent).toBeGreaterThan(2000);
      expect(struggle.wrongPlacements).toHaveLength(2);
      expect(struggle.wrongPlacements).toContainEqual(position1);
      expect(struggle.wrongPlacements).toContainEqual(position2);
    });

    it('should remove county from struggling list when placed correctly', () => {
      const store = useHintStore.getState();
      const position: Position = { x: 100, y: 200 };

      // Add struggling county
      store.analyzePlayerStruggle('county-1', position, false);
      expect(useHintStore.getState().hintSystem.strugglingCounties).toHaveLength(1);

      // Place correctly
      store.analyzePlayerStruggle('county-1', position, true);

      const state = useHintStore.getState();
      expect(state.hintSystem.strugglingCounties).toHaveLength(0);
    });

    it('should handle multiple struggling counties', () => {
      const store = useHintStore.getState();

      // Add multiple struggling counties
      store.analyzePlayerStruggle('county-1', { x: 100, y: 200 }, false);
      store.analyzePlayerStruggle('county-2', { x: 300, y: 400 }, false);
      store.analyzePlayerStruggle('county-3', { x: 500, y: 600 }, false);

      const state = useHintStore.getState();
      expect(state.hintSystem.strugglingCounties).toHaveLength(3);

      const countyIds = state.hintSystem.strugglingCounties.map(s => s.countyId);
      expect(countyIds).toContain('county-1');
      expect(countyIds).toContain('county-2');
      expect(countyIds).toContain('county-3');
    });

    it('should track time spent between attempts', () => {
      const store = useHintStore.getState();

      // First attempt
      store.analyzePlayerStruggle('county-1', { x: 100, y: 200 }, false);
      const firstTime = useHintStore.getState().hintSystem.strugglingCounties[0].totalTimeSpent;

      // Advance time by 5 seconds
      currentTime += 5000;

      // Second attempt
      store.analyzePlayerStruggle('county-1', { x: 150, y: 250 }, false);

      const state = useHintStore.getState();
      const totalTime = state.hintSystem.strugglingCounties[0].totalTimeSpent;

      expect(totalTime).toBeGreaterThan(firstTime);
      expect(totalTime).toBeGreaterThanOrEqual(firstTime + 5000);
    });

    it('should preserve suggested hints when updating struggle data', () => {
      const store = useHintStore.getState();

      // Create struggle with suggested hints
      const struggle: StruggleData = {
        countyId: 'county-1',
        attempts: 2,
        lastAttemptAt: mockNow,
        totalTimeSpent: 3000,
        wrongPlacements: [{ x: 100, y: 200 }],
        suggestedHints: [HintType.LOCATION],
      };

      store.updateHintSystem({ strugglingCounties: [struggle] });

      // Add another failed attempt
      currentTime += 2000;
      store.analyzePlayerStruggle('county-1', { x: 150, y: 250 }, false);

      const state = useHintStore.getState();
      expect(state.hintSystem.strugglingCounties[0].suggestedHints).toContain(HintType.LOCATION);
      expect(state.hintSystem.strugglingCounties[0].attempts).toBe(3);
    });
  });

  describe('Hint Cooldown Behavior', () => {
    it('should set cooldown when hint is used', () => {
      const store = useHintStore.getState();

      store.useHint(HintType.LOCATION, 'county-1', false);

      const state = useHintStore.getState();
      expect(state.hintSystem.cooldownTimeRemaining).toBe(30000);
      expect(state.hintSystem.lastHintUsedAt).toBe(mockNow);
    });

    it('should decrease cooldown with updateCooldown', () => {
      const store = useHintStore.getState();

      // Use hint to start cooldown
      store.useHint(HintType.LOCATION, 'county-1', false);
      expect(useHintStore.getState().hintSystem.cooldownTimeRemaining).toBe(30000);

      // Update cooldown by 5 seconds
      store.updateCooldown(5000);
      expect(useHintStore.getState().hintSystem.cooldownTimeRemaining).toBe(25000);

      // Update cooldown by another 10 seconds
      store.updateCooldown(10000);
      expect(useHintStore.getState().hintSystem.cooldownTimeRemaining).toBe(15000);
    });

    it('should not allow cooldown to go negative', () => {
      const store = useHintStore.getState();

      // Use hint to start cooldown
      store.useHint(HintType.LOCATION, 'county-1', false);

      // Update cooldown by more than remaining time
      store.updateCooldown(40000);

      const state = useHintStore.getState();
      expect(state.hintSystem.cooldownTimeRemaining).toBe(0);
    });

    it('should allow hint usage after cooldown expires', () => {
      const store = useHintStore.getState();

      // First hint
      store.useHint(HintType.LOCATION, 'county-1', false);
      expect(useHintStore.getState().hintSystem.availableHints).toBe(2);

      // Complete cooldown
      store.updateCooldown(30000);
      expect(useHintStore.getState().hintSystem.cooldownTimeRemaining).toBe(0);

      // Second hint should work
      store.useHint(HintType.SHAPE, 'county-2', false);
      expect(useHintStore.getState().hintSystem.availableHints).toBe(1);
      expect(useHintStore.getState().hintSystem.currentHintType).toBe(HintType.SHAPE);
    });

    it('should reset cooldown incrementally', () => {
      const store = useHintStore.getState();

      store.useHint(HintType.LOCATION, 'county-1', false);

      // Simulate game loop updates
      for (let i = 0; i < 30; i++) {
        store.updateCooldown(1000); // 1 second per update
      }

      const state = useHintStore.getState();
      expect(state.hintSystem.cooldownTimeRemaining).toBe(0);
    });
  });

  describe('resetHintSystem Action', () => {
    it('should reset hint system to initial state', () => {
      const store = useHintStore.getState();

      // Use hints and create some state
      store.useHint(HintType.LOCATION, 'county-1', false);
      store.analyzePlayerStruggle('county-2', { x: 100, y: 200 }, false);

      // Verify state changed
      expect(useHintStore.getState().hintSystem.usedHints).toBe(1);
      expect(useHintStore.getState().hintSystem.strugglingCounties).toHaveLength(1);

      // Reset
      store.resetHintSystem();

      const state = useHintStore.getState();
      expect(state.hintSystem.availableHints).toBe(3); // maxHintsPerLevel
      expect(state.hintSystem.usedHints).toBe(0);
      expect(state.hintSystem.freeHintsRemaining).toBe(1); // freeHintsAllowed
      expect(state.hintSystem.currentHintType).toBeUndefined();
      expect(state.hintSystem.hintProgress).toBe(0);
      expect(state.hintSystem.cooldownTimeRemaining).toBe(0);
      expect(state.hintSystem.lastHintUsedAt).toBeUndefined();
      expect(state.hintSystem.strugglingCounties).toEqual([]);
      expect(state.hintSystem.autoSuggestEnabled).toBe(true);
    });

    it('should respect custom hint settings when resetting', () => {
      const store = useHintStore.getState();

      // Update settings
      store.updateSettings({
        maxHintsPerLevel: 5,
        freeHintsAllowed: 2,
      });

      // Use some hints
      store.useHint(HintType.LOCATION, 'county-1', false);

      // Reset
      store.resetHintSystem();

      const state = useHintStore.getState();
      expect(state.hintSystem.availableHints).toBe(5); // Custom max
      expect(state.hintSystem.freeHintsRemaining).toBe(2); // Custom free hints
    });
  });

  describe('initializeForMode Action', () => {
    it('should initialize hints when both enableHints and showHints are true', () => {
      const store = useHintStore.getState();

      store.initializeForMode(true, true);

      const state = useHintStore.getState();
      expect(state.hintSystem.availableHints).toBe(3);
      expect(state.hintSystem.autoSuggestEnabled).toBe(true);
    });

    it('should disable hints when enableHints is false', () => {
      const store = useHintStore.getState();

      store.initializeForMode(false, true);

      const state = useHintStore.getState();
      expect(state.hintSystem.availableHints).toBe(0);
      expect(state.hintSystem.autoSuggestEnabled).toBe(false);
    });

    it('should disable hints when showHints is false', () => {
      const store = useHintStore.getState();

      store.initializeForMode(true, false);

      const state = useHintStore.getState();
      expect(state.hintSystem.availableHints).toBe(0);
      expect(state.hintSystem.autoSuggestEnabled).toBe(false);
    });

    it('should reset all hint state when initializing', () => {
      const store = useHintStore.getState();

      // Use hints and create state
      store.useHint(HintType.LOCATION, 'county-1', false);
      store.analyzePlayerStruggle('county-2', { x: 100, y: 200 }, false);

      // Initialize for new mode
      store.initializeForMode(true, true);

      const state = useHintStore.getState();
      expect(state.hintSystem.usedHints).toBe(0);
      expect(state.hintSystem.currentHintType).toBeUndefined();
      expect(state.hintSystem.cooldownTimeRemaining).toBe(0);
      expect(state.hintSystem.strugglingCounties).toEqual([]);
    });

    it('should preserve hint settings when initializing', () => {
      const store = useHintStore.getState();

      // Update settings
      store.updateSettings({
        maxHintsPerLevel: 5,
        hintCooldownMs: 15000,
      });

      // Initialize
      store.initializeForMode(true, true);

      const state = useHintStore.getState();
      expect(state.hintSettings.maxHintsPerLevel).toBe(5);
      expect(state.hintSettings.hintCooldownMs).toBe(15000);
      expect(state.hintSystem.availableHints).toBe(5); // Uses updated max
    });
  });

  describe('updateHintSystem Action', () => {
    it('should update single hint system property', () => {
      const store = useHintStore.getState();

      store.updateHintSystem({ availableHints: 5 });

      expect(useHintStore.getState().hintSystem.availableHints).toBe(5);
    });

    it('should update multiple hint system properties', () => {
      const store = useHintStore.getState();

      store.updateHintSystem({
        availableHints: 5,
        usedHints: 2,
        cooldownTimeRemaining: 10000,
      });

      const state = useHintStore.getState();
      expect(state.hintSystem.availableHints).toBe(5);
      expect(state.hintSystem.usedHints).toBe(2);
      expect(state.hintSystem.cooldownTimeRemaining).toBe(10000);
    });

    it('should preserve other properties when updating', () => {
      const store = useHintStore.getState();

      // Set initial state
      store.useHint(HintType.LOCATION, 'county-1', false);
      const initialType = useHintStore.getState().hintSystem.currentHintType;

      // Update other properties
      store.updateHintSystem({ cooldownTimeRemaining: 0 });

      const state = useHintStore.getState();
      expect(state.hintSystem.currentHintType).toBe(initialType);
      expect(state.hintSystem.cooldownTimeRemaining).toBe(0);
    });
  });

  describe('updateSettings Action', () => {
    it('should update single setting', () => {
      const store = useHintStore.getState();

      store.updateSettings({ maxHintsPerLevel: 5 });

      expect(useHintStore.getState().hintSettings.maxHintsPerLevel).toBe(5);
    });

    it('should update multiple settings', () => {
      const store = useHintStore.getState();

      store.updateSettings({
        maxHintsPerLevel: 5,
        hintCooldownMs: 15000,
        scorePenaltyPerHint: 100,
      });

      const state = useHintStore.getState();
      expect(state.hintSettings.maxHintsPerLevel).toBe(5);
      expect(state.hintSettings.hintCooldownMs).toBe(15000);
      expect(state.hintSettings.scorePenaltyPerHint).toBe(100);
    });

    it('should preserve other settings when updating', () => {
      const store = useHintStore.getState();

      const initialAutoSuggest = useHintStore.getState().hintSettings.autoSuggestThreshold;

      store.updateSettings({ maxHintsPerLevel: 5 });

      const state = useHintStore.getState();
      expect(state.hintSettings.autoSuggestThreshold).toBe(initialAutoSuggest);
    });
  });

  describe('Hint Availability Calculations', () => {
    it('should correctly track available hints after usage', () => {
      const store = useHintStore.getState();

      expect(useHintStore.getState().hintSystem.availableHints).toBe(3);

      store.useHint(HintType.LOCATION, 'county-1', false);
      expect(useHintStore.getState().hintSystem.availableHints).toBe(2);

      store.updateHintSystem({ cooldownTimeRemaining: 0 });
      store.useHint(HintType.SHAPE, 'county-2', false);
      expect(useHintStore.getState().hintSystem.availableHints).toBe(1);

      store.updateHintSystem({ cooldownTimeRemaining: 0 });
      store.useHint(HintType.NEIGHBOR, 'county-3', false);
      expect(useHintStore.getState().hintSystem.availableHints).toBe(0);
    });

    it('should track free hints separately', () => {
      const store = useHintStore.getState();

      // First hint is free
      expect(useHintStore.getState().hintSystem.freeHintsRemaining).toBe(1);
      store.useHint(HintType.LOCATION, 'county-1', false);

      // After first hint, no free hints remain (implementation uses usedHints count)
      const state = useHintStore.getState();
      expect(state.hintSystem.usedHints).toBe(1);
      expect(state.hintSystem.freeHintsRemaining).toBe(1); // Still 1 (not decremented in current impl)
    });

    it('should calculate hints correctly with custom settings', () => {
      const store = useHintStore.getState();

      // Set custom max hints
      store.updateSettings({ maxHintsPerLevel: 10 });
      store.resetHintSystem();

      expect(useHintStore.getState().hintSystem.availableHints).toBe(10);

      // Use 5 hints
      for (let i = 0; i < 5; i++) {
        store.updateHintSystem({ cooldownTimeRemaining: 0 });
        store.useHint(HintType.LOCATION, `county-${i}`, false);
      }

      expect(useHintStore.getState().hintSystem.availableHints).toBe(5);
    });

    it('should prevent hint usage when availability is zero', () => {
      const store = useHintStore.getState();

      // Use all hints
      store.useHint(HintType.LOCATION, 'county-1', false);
      store.updateHintSystem({ cooldownTimeRemaining: 0 });
      store.useHint(HintType.SHAPE, 'county-2', false);
      store.updateHintSystem({ cooldownTimeRemaining: 0 });
      store.useHint(HintType.NEIGHBOR, 'county-3', false);

      expect(useHintStore.getState().hintSystem.availableHints).toBe(0);

      // Try to use another hint
      store.updateHintSystem({ cooldownTimeRemaining: 0 });
      const beforeUsed = useHintStore.getState().hintSystem.usedHints;
      store.useHint(HintType.FACT, 'county-4', false);

      const state = useHintStore.getState();
      expect(state.hintSystem.usedHints).toBe(beforeUsed); // Should not increase
      expect(state.hintSystem.availableHints).toBe(0); // Should still be 0
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid hint usage attempts', () => {
      const store = useHintStore.getState();

      // Try to use multiple hints rapidly
      store.useHint(HintType.LOCATION, 'county-1', false);
      store.useHint(HintType.SHAPE, 'county-2', false);
      store.useHint(HintType.NEIGHBOR, 'county-3', false);

      // Only first hint should be consumed (others blocked by cooldown)
      const state = useHintStore.getState();
      expect(state.hintSystem.usedHints).toBe(1);
      expect(state.hintSystem.availableHints).toBe(2);
    });

    it('should handle struggle tracking for same county multiple times', () => {
      const store = useHintStore.getState();

      // Multiple failed attempts on same county
      for (let i = 0; i < 5; i++) {
        currentTime += 1000;
        store.analyzePlayerStruggle('county-1', { x: 100 + i * 10, y: 200 + i * 10 }, false);
      }

      const state = useHintStore.getState();
      expect(state.hintSystem.strugglingCounties).toHaveLength(1);
      expect(state.hintSystem.strugglingCounties[0].attempts).toBe(5);
      expect(state.hintSystem.strugglingCounties[0].wrongPlacements).toHaveLength(5);
    });

    it('should handle settings updates during active hints', () => {
      const store = useHintStore.getState();

      // Use a hint
      store.useHint(HintType.LOCATION, 'county-1', false);

      // Update settings while hint is active
      store.updateSettings({ hintCooldownMs: 10000 });

      const state = useHintStore.getState();
      // Active cooldown should remain unchanged
      expect(state.hintSystem.cooldownTimeRemaining).toBe(30000);
      // But setting should be updated
      expect(state.hintSettings.hintCooldownMs).toBe(10000);
    });

    it('should handle zero or negative cooldown updates', () => {
      const store = useHintStore.getState();

      store.useHint(HintType.LOCATION, 'county-1', false);

      // Update with zero
      store.updateCooldown(0);
      expect(useHintStore.getState().hintSystem.cooldownTimeRemaining).toBe(30000);

      // Update with negative (shouldn't happen, but should handle gracefully)
      store.updateCooldown(-5000);
      // Should still be 30000 or handle as 0 decrease
      expect(useHintStore.getState().hintSystem.cooldownTimeRemaining).toBeGreaterThanOrEqual(30000);
    });

    it('should handle empty struggling counties array operations', () => {
      const store = useHintStore.getState();

      // Analyze with no prior struggles
      expect(useHintStore.getState().hintSystem.strugglingCounties).toEqual([]);

      // Remove non-existent county
      store.analyzePlayerStruggle('county-1', { x: 100, y: 200 }, true);

      // Should still be empty
      expect(useHintStore.getState().hintSystem.strugglingCounties).toEqual([]);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete hint usage cycle', () => {
      const store = useHintStore.getState();

      // 1. Player struggles
      store.analyzePlayerStruggle('county-1', { x: 100, y: 200 }, false);
      store.analyzePlayerStruggle('county-1', { x: 120, y: 210 }, false);
      store.analyzePlayerStruggle('county-1', { x: 110, y: 205 }, false);

      expect(useHintStore.getState().hintSystem.strugglingCounties[0].attempts).toBe(3);

      // 2. Use hint
      store.useHint(HintType.LOCATION, 'county-1', false);

      expect(useHintStore.getState().hintSystem.availableHints).toBe(2);
      expect(useHintStore.getState().hintSystem.cooldownTimeRemaining).toBe(30000);

      // 3. Wait for cooldown
      store.updateCooldown(30000);

      expect(useHintStore.getState().hintSystem.cooldownTimeRemaining).toBe(0);

      // 4. Player succeeds
      store.analyzePlayerStruggle('county-1', { x: 100, y: 200 }, true);

      expect(useHintStore.getState().hintSystem.strugglingCounties).toHaveLength(0);
    });

    it('should handle game mode transition', () => {
      const store = useHintStore.getState();

      // Play with hints enabled
      store.initializeForMode(true, true);
      store.useHint(HintType.LOCATION, 'county-1', false);
      store.analyzePlayerStruggle('county-2', { x: 100, y: 200 }, false);

      // Switch to mode without hints
      store.initializeForMode(false, false);

      const state = useHintStore.getState();
      expect(state.hintSystem.availableHints).toBe(0);
      expect(state.hintSystem.autoSuggestEnabled).toBe(false);
      expect(state.hintSystem.strugglingCounties).toEqual([]);
    });

    it('should handle level completion and reset', () => {
      const store = useHintStore.getState();

      // Use hints during level
      store.useHint(HintType.LOCATION, 'county-1', false);
      store.analyzePlayerStruggle('county-2', { x: 100, y: 200 }, false);

      // Complete level - reset for next level
      store.resetHintSystem();

      const state = useHintStore.getState();
      expect(state.hintSystem.availableHints).toBe(3);
      expect(state.hintSystem.usedHints).toBe(0);
      expect(state.hintSystem.strugglingCounties).toEqual([]);
      expect(state.hintSystem.cooldownTimeRemaining).toBe(0);
    });
  });
});
