/**
 * Store Integration Module
 *
 * Purpose: Connect Zustand stores to Supabase sync modules for reactive data flow
 * Features: Automatic sync on changes, real-time updates, error boundaries
 *
 * Usage:
 *   import { initializeStoreIntegration } from '@/lib/storeIntegration';
 *   await initializeStoreIntegration(userId);
 *
 * Last updated: 2025-10-11
 */

import { useGameStore } from '../stores/gameStore';
import { useStudyStore } from '../stores/studyStore';
// import { useAuthStore } from '../stores/authStore'; // Available for future auth integration
import { gameSettingsSync } from './sync/gameSettingsSync';
import { gameStatsSync } from './sync/gameStatsSync';
import { achievementSync } from './sync/achievementSync';
import { logger } from '../utils/logger';
import type { GameSettings, GameStats } from '../types';

/**
 * Integration state tracker
 *
 * CONCEPT: Track which integrations are active
 * WHY: Prevent duplicate listeners and enable cleanup
 * PATTERN: Singleton state management
 */
class StoreIntegrationManager {
  private initialized = false;
  private unsubscribers: Array<() => void> = [];
  private userId: string | null = null;

  /**
   * Initialize all store integrations
   *
   * CONCEPT: Wire sync modules to store updates
   * WHY: Enable reactive data flow between local and remote
   * PATTERN: Initialization with cleanup tracking
   */
  async initialize(userId: string): Promise<void> {
    if (this.initialized) {
      logger.warn('[StoreIntegration] Already initialized, skipping');
      return;
    }

    logger.info('[StoreIntegration] Initializing store integrations...', { userId });

    this.userId = userId;

    try {
      // Initialize all sync modules
      await Promise.all([
        gameSettingsSync.initialize(userId),
        gameStatsSync.initialize(userId),
        achievementSync.initialize(userId),
      ]);

      // Setup store listeners
      this.setupGameStoreListeners();
      this.setupStudyStoreListeners();

      this.initialized = true;
      logger.info('[StoreIntegration] All store integrations initialized successfully');
    } catch (error) {
      logger.error('[StoreIntegration] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Shutdown all store integrations
   *
   * CONCEPT: Clean up listeners and sync modules
   * WHY: Prevent memory leaks and orphaned subscriptions
   * PATTERN: Cleanup with unsubscribe tracking
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      logger.warn('[StoreIntegration] Not initialized, nothing to shutdown');
      return;
    }

    logger.info('[StoreIntegration] Shutting down store integrations...');

    try {
      // Unsubscribe all listeners
      this.unsubscribers.forEach((unsubscribe) => unsubscribe());
      this.unsubscribers = [];

      // Shutdown all sync modules
      await Promise.all([
        gameSettingsSync.shutdown(),
        gameStatsSync.shutdown(),
        achievementSync.shutdown(),
      ]);

      this.initialized = false;
      this.userId = null;

      logger.info('[StoreIntegration] Store integrations shut down successfully');
    } catch (error) {
      logger.error('[StoreIntegration] Failed to shutdown:', error);
      throw error;
    }
  }

  /**
   * Setup Game Store listeners
   *
   * CONCEPT: React to gameStore changes and trigger syncs
   * WHY: Keep settings, stats, and achievements in sync
   * PATTERN: Zustand subscriptions with selective updates
   */
  private setupGameStoreListeners(): void {
    logger.info('[StoreIntegration] Setting up gameStore listeners...');

    let previousSettings = useGameStore.getState().settings;
    let previousStats = useGameStore.getState().stats;
    let previousAchievements = useGameStore.getState().achievements;
    let wasGameActive = useGameStore.getState().isGameActive;

    // Listen to all store changes and handle specific updates
    const unsubscribeAll = useGameStore.subscribe((state) => {
      if (!this.initialized) return;

      // Handle settings changes
      if (JSON.stringify(state.settings) !== JSON.stringify(previousSettings)) {
        logger.info('[StoreIntegration] Settings changed, syncing...');
        gameSettingsSync.sync(state.settings).catch((error) => {
          logger.error('[StoreIntegration] Failed to sync settings:', error);
        });
        previousSettings = state.settings;
      }

      // Handle stats changes
      if (JSON.stringify(state.stats) !== JSON.stringify(previousStats)) {
        logger.info('[StoreIntegration] Stats changed, syncing...');
        gameStatsSync.sync(state.stats).catch((error) => {
          logger.error('[StoreIntegration] Failed to sync stats:', error);
        });
        previousStats = state.stats;
      }

      // Handle achievement changes
      const newlyUnlocked = state.achievements.filter((achievement) => {
        const previous = previousAchievements.find((a) => a.id === achievement.id);
        return achievement.isUnlocked && (!previous || !previous.isUnlocked);
      });

      if (newlyUnlocked.length > 0) {
        logger.info('[StoreIntegration] Achievements unlocked, syncing...', {
          count: newlyUnlocked.length,
        });

        newlyUnlocked.forEach((achievement) => {
          achievementSync.syncAchievement(achievement).catch((error) => {
            logger.error('[StoreIntegration] Failed to sync achievement:', error);
          });
        });
      }
      previousAchievements = state.achievements;

      // Handle game end events for session recording
      if (wasGameActive && !state.isGameActive) {
        logger.info('[StoreIntegration] Game ended, recording session...');

        gameStatsSync
          .recordGameSession({
            score: state.score,
            difficulty: state.difficulty,
            region: state.selectedRegion,
            timeElapsed: state.timeElapsed,
            accuracy: state.placedCounties.length > 0 ? 0.8 : 0, // Note: accuracy calculation to be refined
          })
          .catch((error) => {
            logger.error('[StoreIntegration] Failed to record game session:', error);
          });
      }
      wasGameActive = state.isGameActive;
    });

    this.unsubscribers.push(unsubscribeAll);

    logger.info('[StoreIntegration] gameStore listeners ready');
  }

  /**
   * Setup Study Store listeners
   *
   * CONCEPT: React to studyStore changes and trigger syncs
   * WHY: Keep study progress and settings in sync
   * PATTERN: Zustand subscriptions with selective updates
   */
  private setupStudyStoreListeners(): void {
    logger.info('[StoreIntegration] Setting up studyStore listeners...');

    let previousProgress = useStudyStore.getState().progress;
    let wasStudySessionActive = useStudyStore.getState().isStudySessionActive;

    // Listen to all study store changes
    const unsubscribeStudy = useStudyStore.subscribe((state) => {
      if (!this.initialized) return;

      // Handle progress changes
      if (JSON.stringify(state.progress) !== JSON.stringify(previousProgress)) {
        logger.info('[StoreIntegration] Study progress changed (sync pending Phase 3)');
        previousProgress = state.progress;
      }

      // Detect session end (was active, now not active)
      if (wasStudySessionActive && !state.isStudySessionActive) {
        logger.info('[StoreIntegration] Study session ended (sync pending Phase 3)');
        // Note: Study session sync will be implemented in Phase 3
      }
      wasStudySessionActive = state.isStudySessionActive;
    });

    this.unsubscribers.push(unsubscribeStudy);

    logger.info('[StoreIntegration] studyStore listeners ready (Phase 3 pending)');
  }

  /**
   * Manual sync trigger for specific data
   *
   * CONCEPT: Force sync of specific data type
   * WHY: Allow manual refresh or explicit sync calls
   * PATTERN: Public API for controlled syncing
   */
  async syncSettings(settings?: GameSettings): Promise<void> {
    if (!this.initialized) {
      throw new Error('Store integration not initialized');
    }

    logger.info('[StoreIntegration] Manual settings sync requested');
    await gameSettingsSync.sync(settings);
  }

  async syncStats(stats?: GameStats): Promise<void> {
    if (!this.initialized) {
      throw new Error('Store integration not initialized');
    }

    logger.info('[StoreIntegration] Manual stats sync requested');
    await gameStatsSync.sync(stats);
  }

  async syncAchievements(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Store integration not initialized');
    }

    logger.info('[StoreIntegration] Manual achievements sync requested');
    await achievementSync.syncAll();
  }

  /**
   * Check if integration is ready
   *
   * CONCEPT: Query initialization state
   * WHY: Allow components to check before using
   * PATTERN: Simple getter
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get current user ID
   *
   * CONCEPT: Access user context
   * WHY: Debugging and validation
   * PATTERN: Simple getter
   */
  getUserId(): string | null {
    return this.userId;
  }
}

// Export singleton instance
export const storeIntegration = new StoreIntegrationManager();

/**
 * Convenience function for initialization
 *
 * CONCEPT: Simple API for app initialization
 * WHY: Clean initialization in auth flow
 * PATTERN: Wrapper function
 */
export async function initializeStoreIntegration(userId: string): Promise<void> {
  await storeIntegration.initialize(userId);
}

/**
 * Convenience function for shutdown
 *
 * CONCEPT: Simple API for cleanup
 * WHY: Clean shutdown in sign-out flow
 * PATTERN: Wrapper function
 */
export async function shutdownStoreIntegration(): Promise<void> {
  await storeIntegration.shutdown();
}

/**
 * React hook for store integration status
 *
 * CONCEPT: React integration for UI feedback
 * WHY: Show sync status in components
 * PATTERN: Custom React hook
 */
export function useStoreIntegrationStatus(): {
  initialized: boolean;
  userId: string | null;
} {
  return {
    initialized: storeIntegration.isInitialized(),
    userId: storeIntegration.getUserId(),
  };
}
