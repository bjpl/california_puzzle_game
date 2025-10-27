/**
 * Lazy Loading Wrapper for Large Data Files
 *
 * Purpose: Reduce initial bundle size by loading data on demand
 * Expected Savings: ~440 KB from initial bundle
 *
 * Usage:
 * ```typescript
 * const boundaries = await loadCountyBoundaries();
 * const education = await loadEducationData();
 * ```
 */

/**
 * Load county boundary geodata (208 KB)
 * Use: Map rendering in study mode
 */
export async function loadCountyBoundaries() {
  const module = await import('../californiaCountyBoundaries');
  return (
    (module as { californiaCountyBoundaries?: unknown; default?: unknown })
      .californiaCountyBoundaries || module
  );
}

/**
 * Load complete education data (132 KB)
 * Use: Educational content modals
 */
export async function loadEducationData() {
  const module = await import('../countyEducationComplete');
  return (
    (module as { countyEducationData?: unknown; default?: unknown }).countyEducationData ||
    (module as { default?: unknown }).default ||
    module
  );
}

/**
 * Load quiz questions (56 KB)
 * Use: Quiz game mode
 */
export async function loadQuizQuestions() {
  const module = await import('../californiaQuizQuestions');
  return (
    (module as { quizQuestions?: unknown; californiaQuizQuestions?: unknown }).quizQuestions ||
    (module as { californiaQuizQuestions?: unknown }).californiaQuizQuestions ||
    module
  );
}

/**
 * Load main county data (68 KB)
 * Use: Primary game data
 */
export async function loadCountyData() {
  const module = await import('../californiaCounties');
  return module.californiaCounties;
}

/**
 * Load geographic hints (20 KB)
 * Use: Hint system
 */
export async function loadGeographicHints() {
  const module = await import('../californiaGeographicHints');
  return module.geographicHints;
}

/**
 * Load memory aids (16 KB)
 * Use: Study mode mnemonics
 */
export async function loadMemoryAids() {
  const module = await import('../memoryAids');
  return (module as { memoryAidsData?: unknown; default?: unknown }).memoryAidsData || module;
}

/**
 * Preload critical data in background
 * Call this on user interaction to prepare data before needed
 */
export function preloadCriticalData() {
  // Use requestIdleCallback to load during idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(
      () => {
        loadCountyData(); // Most commonly needed
        loadGeographicHints(); // Frequently accessed
      },
      { timeout: 2000 }
    );
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      loadCountyData();
      loadGeographicHints();
    }, 1000);
  }
}

/**
 * Preload data based on game mode
 */
export async function preloadForGameMode(mode: string) {
  switch (mode) {
    case 'quiz':
      return Promise.all([loadQuizQuestions(), loadEducationData()]);

    case 'study':
      return Promise.all([loadCountyBoundaries(), loadGeographicHints(), loadMemoryAids()]);

    case 'classic':
      return Promise.all([loadCountyData(), loadGeographicHints()]);

    default:
      return loadCountyData();
  }
}

// Export type for data modules
export interface DataModule<T> {
  default?: T;
  [key: string]: unknown;
}
