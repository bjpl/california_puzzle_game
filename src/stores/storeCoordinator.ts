/**
 * Store Coordinator
 * Wires up Zustand subscriptions between stores to avoid circular dependencies.
 * This file is the ONLY place where cross-store coordination happens.
 *
 * Pattern: Mediator/Event-Driven via Zustand subscribeWithSelector
 */
import { useCountyPlacementStore } from './countyPlacementStore';
import { useAchievementStore } from './achievementStore';
import { logger } from '../utils/logger';

// Track if coordinator has been initialized
let isInitialized = false;
// Store cleanup function for proper teardown
let cleanupFunction: (() => void) | null = null;

/**
 * Initialize store coordination subscriptions.
 * Call this once at app startup (e.g., in main.tsx or App.tsx).
 */
export function initializeStoreCoordination(): () => void {
  if (isInitialized) {
    logger.warn('Store coordination already initialized');
    return () => {};
  }

  const unsubscribers: (() => void)[] = [];

  // SUBSCRIPTION 1: County Placement → Achievement Checking
  // When a county is placed, check for achievements
  // Using manual state comparison since subscribeWithSelector requires middleware
  let prevPlacementResult = useCountyPlacementStore.getState().lastPlacementResult;
  const unsubPlacement = useCountyPlacementStore.subscribe((state) => {
    const lastPlacementResult = state.lastPlacementResult;
    // Only trigger when there's a new placement (not null and different from previous)
    if (lastPlacementResult && lastPlacementResult !== prevPlacementResult) {
      prevPlacementResult = lastPlacementResult;
      // Pass remainingCounties as parameter to avoid circular import in achievementStore
      useAchievementStore
        .getState()
        .checkAchievements(lastPlacementResult, state.remainingCounties);
    }
  });
  unsubscribers.push(unsubPlacement);

  isInitialized = true;
  logger.info('[StoreCoordinator] Subscriptions initialized');

  // Return cleanup function and store it for resetCoordination
  cleanupFunction = () => {
    unsubscribers.forEach((unsub) => unsub());
    isInitialized = false;
    cleanupFunction = null;
    logger.info('[StoreCoordinator] Subscriptions cleaned up');
  };

  return cleanupFunction;
}

/**
 * Check if coordination is initialized (for debugging)
 */
export function isCoordinationInitialized(): boolean {
  return isInitialized;
}

/**
 * Reset coordination state (for testing)
 * Calls cleanup if coordination is active
 */
export function resetCoordination(): void {
  if (cleanupFunction) {
    cleanupFunction();
  } else {
    isInitialized = false;
    cleanupFunction = null;
  }
}
