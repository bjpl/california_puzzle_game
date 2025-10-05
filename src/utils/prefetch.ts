/**
 * Prefetch Utilities
 *
 * Purpose: Prefetch components before user navigates to improve perceived performance
 * Used by: Navigation links and buttons
 *
 * Strategy:
 * - Prefetch on hover (mouse enter)
 * - Prefetch on focus (keyboard navigation)
 * - Cache loaded modules
 *
 * Performance Impact:
 * - Reduces route transition time
 * - Uses idle bandwidth
 * - Improves user experience
 */

// Cache to track prefetched modules
const prefetchCache = new Set<string>();

/**
 * Prefetch the EnhancedStudyMode component
 * Triggered on hover/focus of Study Mode button
 */
export function prefetchStudyMode() {
  if (!prefetchCache.has('study-mode')) {
    prefetchCache.add('study-mode');
    import('../components/study/EnhancedStudyMode').catch((err) => {
      console.warn('Failed to prefetch study mode:', err);
      prefetchCache.delete('study-mode');
    });
  }
}

/**
 * Prefetch the CountyFormationAnimation component
 * Triggered on hover/focus of Formation History button
 */
export function prefetchFormation() {
  if (!prefetchCache.has('formation')) {
    prefetchCache.add('formation');
    import('../components/county/CountyFormationAnimation').catch((err) => {
      console.warn('Failed to prefetch formation animation:', err);
      prefetchCache.delete('formation');
    });
  }
}

/**
 * Prefetch the AchievementGallery component
 * Triggered on hover/focus of Achievements button
 */
export function prefetchAchievements() {
  if (!prefetchCache.has('achievements')) {
    prefetchCache.add('achievements');
    import('../components/game/achievements/AchievementGallery').catch((err) => {
      console.warn('Failed to prefetch achievements:', err);
      prefetchCache.delete('achievements');
    });
  }
}

/**
 * Prefetch heavy game features
 * Triggered on game start
 */
export function prefetchGameFeatures() {
  if (!prefetchCache.has('game-features')) {
    prefetchCache.add('game-features');
    Promise.all([
      import('../components/game/DifficultySystem'),
      import('../components/game/hints/HintSystem'),
      import('../components/game/GameModeSelector'),
    ]).catch((err) => {
      console.warn('Failed to prefetch game features:', err);
      prefetchCache.delete('game-features');
    });
  }
}

/**
 * Prefetch map components
 * Triggered on app initialization
 */
export function prefetchMapComponents() {
  if (!prefetchCache.has('map-components')) {
    prefetchCache.add('map-components');
    Promise.all([
      import('../components/map/CaliforniaMapCanvas'),
      import('../components/map/StudyModeMap'),
    ]).catch((err) => {
      console.warn('Failed to prefetch map components:', err);
      prefetchCache.delete('map-components');
    });
  }
}

/**
 * Clear prefetch cache
 * Used for testing or memory management
 */
export function clearPrefetchCache() {
  prefetchCache.clear();
}

/**
 * Check if a module has been prefetched
 */
export function isPrefetched(key: string): boolean {
  return prefetchCache.has(key);
}
