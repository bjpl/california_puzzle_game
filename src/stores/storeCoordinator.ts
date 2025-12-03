/**
 * Store Coordinator
 * Wires up Zustand subscriptions between stores to avoid circular dependencies.
 * This file is the ONLY place where cross-store coordination happens.
 *
 * Pattern: Mediator/Event-Driven via Zustand subscribeWithSelector
 */
import { useCountyPlacementStore } from './countyPlacementStore';
import { useAchievementStore } from './achievementStore';

// Track if coordinator has been initialized
let isInitialized = false;

/**
 * Initialize store coordination subscriptions.
 * Call this once at app startup (e.g., in main.tsx or App.tsx).
 */
export function initializeStoreCoordination(): () => void {
  if (isInitialized) {
    console.warn('Store coordination already initialized');
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
      useAchievementStore.getState().checkAchievements(
        lastPlacementResult,
        state.remainingCounties
      );
    }
  });
  unsubscribers.push(unsubPlacement);

  isInitialized = true;
  console.log('[StoreCoordinator] Subscriptions initialized');

  // Return cleanup function
  return () => {
    unsubscribers.forEach((unsub) => unsub());
    isInitialized = false;
    console.log('[StoreCoordinator] Subscriptions cleaned up');
  };
}

/**
 * Check if coordination is initialized (for debugging)
 */
export function isCoordinationInitialized(): boolean {
  return isInitialized;
}

/**
 * Reset coordination state (for testing)
 */
export function resetCoordination(): void {
  isInitialized = false;
}
