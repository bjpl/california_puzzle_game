/**
 * Store Index - Unified exports for all domain stores
 *
 * Architecture: Domain-Driven Store Design
 * Each store has a single responsibility following SOLID principles
 *
 * Stores:
 * 1. gameLifecycleStore - Game state transitions (start, pause, end)
 * 2. countyPlacementStore - County piece management
 * 3. scoringStore - Score calculation and statistics
 * 4. achievementStore - Achievement system
 * 5. hintSystemStore - Hint management
 * 6. gestureStore - Map gesture controls
 * 7. gameSettingsStore - User preferences
 *
 * Coordination:
 * - storeCoordinator - Zustand subscriptions for cross-store communication
 *   (avoids circular dependencies)
 */

// Domain stores
export { useGameLifecycleStore, type GameLifecycleStore } from './gameLifecycleStore';
export { useCountyPlacementStore, type CountyPlacementStore } from './countyPlacementStore';
export { useScoringStore, useStatsStore, type ScoringStore } from './scoringStore';
export { useAchievementStore, type AchievementStore } from './achievementStore';
export { useHintStore, type HintStore } from './hintSystemStore';
export { useGestureStore, type GestureStore } from './gestureStore';
export { useSettingsStore, type SettingsStore } from './gameSettingsStore';

// Store coordination (call initializeStoreCoordination() at app startup)
export { initializeStoreCoordination, isCoordinationInitialized } from './storeCoordinator';

// DEPRECATED: Legacy gameStore removed in Phase 1 refactoring (2025-12-03)
// All components now use domain-specific stores:
// - useGameLifecycleStore: Game state transitions
// - useCountyPlacementStore: County piece management
// - useScoringStore: Score calculation
// - useAchievementStore: Achievement system
// - useHintStore: Hint management
// - useGestureStore: Map gestures
// - useSettingsStore: User preferences
