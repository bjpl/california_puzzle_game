/**
 * Theme Store - Dark Mode State Management
 *
 * Purpose: Manage theme mode with persistence and system preference sync
 * Features: localStorage persistence, system theme detection, auto-apply on load
 *
 * Usage:
 *   const { theme, setTheme, toggleTheme } = useThemeStore();
 *
 * Last updated: 2025-10-09
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type ThemeMode, applyTheme, getSystemTheme, watchSystemTheme } from '../config/theme';
import { logger } from '../utils/logger';

interface ThemeState {
  // Current theme mode setting
  mode: ThemeMode; // 'light' | 'dark' | 'system'

  // Resolved theme (what's actually displayed)
  // If mode is 'system', resolvedTheme will be 'light' or 'dark'
  resolvedTheme: 'light' | 'dark';

  // Whether theme has been initialized
  initialized: boolean;

  // Actions
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

/**
 * Theme Store with Zustand
 *
 * CONCEPT: Global theme state with localStorage persistence
 * WHY: Persist user preference across sessions, sync with system
 * PATTERN: Zustand store with persist middleware
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Initial state
      mode: 'light', // Default to light mode (user can change to dark/system)
      resolvedTheme: 'light', // Will be updated by initializeTheme
      initialized: false,

      /**
       * Set theme mode
       *
       * CONCEPT: Update theme preference and apply immediately
       * WHY: Instant visual feedback for user action
       * PATTERN: State update + side effect (DOM manipulation)
       */
      setTheme: (mode: ThemeMode) => {
        logger.info('[Theme] Setting theme mode:', mode);

        // Calculate resolved theme
        const resolvedTheme = mode === 'system' ? getSystemTheme() : mode;

        // Apply theme to DOM
        applyTheme(resolvedTheme);

        // Update manifest theme-color for mobile browser chrome
        updateManifestThemeColor(resolvedTheme);

        // Update state
        set({ mode, resolvedTheme, initialized: true });

        logger.info('[Theme] Theme applied:', { mode, resolvedTheme });
      },

      /**
       * Toggle between light and dark
       *
       * CONCEPT: Quick theme switch without system mode
       * WHY: Common use case - manual toggle button
       * PATTERN: State-based conditional toggle
       */
      toggleTheme: () => {
        const currentMode = get().mode;
        const currentResolved = get().resolvedTheme;

        // If in system mode, toggle to opposite of current system theme
        // Otherwise toggle between light and dark
        const newMode: ThemeMode =
          currentMode === 'system'
            ? currentResolved === 'dark'
              ? 'light'
              : 'dark'
            : currentResolved === 'dark'
              ? 'light'
              : 'dark';

        get().setTheme(newMode);
      },

      /**
       * Initialize theme on app load
       *
       * CONCEPT: Bootstrap theme from persisted state or system
       * WHY: Restore user preference on page load
       * PATTERN: Initialization hook with side effects
       */
      initializeTheme: () => {
        if (get().initialized) {
          logger.warn('[Theme] Already initialized, skipping');
          return;
        }

        logger.info('[Theme] Initializing theme system...');

        const { mode } = get();

        // Calculate resolved theme
        const resolvedTheme = mode === 'system' ? getSystemTheme() : mode;

        // Apply theme
        applyTheme(resolvedTheme);
        updateManifestThemeColor(resolvedTheme);

        // Set up system theme watcher if in system mode
        if (mode === 'system') {
          watchSystemTheme((systemTheme) => {
            logger.info('[Theme] System theme changed to:', systemTheme);
            get().setTheme('system'); // Re-trigger to update resolved theme
          });
        }

        // Update state
        set({ resolvedTheme, initialized: true });

        logger.info('[Theme] Theme initialized:', { mode, resolvedTheme });
      },
    }),
    {
      name: 'theme-storage', // localStorage key
      // eslint-disable-next-line no-restricted-globals
      storage: createJSONStorage(() => localStorage),

      // Only persist mode, not resolvedTheme or initialized
      partialize: (state) => ({ mode: state.mode }),

      // Handle hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          logger.info('[Theme] Hydrated from localStorage:', state.mode);
        }
      },
    }
  )
);

/**
 * Update manifest theme-color meta tag
 *
 * CONCEPT: Sync mobile browser chrome color with app theme
 * WHY: Seamless visual experience on mobile devices
 * PATTERN: DOM meta tag manipulation
 */
function updateManifestThemeColor(theme: 'light' | 'dark'): void {
  const themeColor = theme === 'dark' ? '#121212' : '#3b82f6';

  // Update meta tag
  let metaTag = document.querySelector('meta[name="theme-color"]');

  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('name', 'theme-color');
    document.head.appendChild(metaTag);
  }

  metaTag.setAttribute('content', themeColor);

  logger.info('[Theme] Updated theme-color meta tag:', themeColor);
}

/**
 * React Hook: Use theme with initialization
 *
 * CONCEPT: Auto-initialize theme on first component mount
 * WHY: Ensures theme is ready before app renders
 * PATTERN: Custom hook with useEffect-like initialization
 *
 * Usage:
 *   const { mode, resolvedTheme, setTheme, toggleTheme } = useTheme();
 */
export function useTheme() {
  const store = useThemeStore();

  // Auto-initialize on first use
  if (!store.initialized) {
    store.initializeTheme();
  }

  return store;
}

/**
 * Initialize theme immediately (for use in main.tsx)
 *
 * CONCEPT: Synchronous theme init before React mount
 * WHY: Prevents flash of unstyled content (FOUC)
 * PATTERN: Immediate invocation before render
 *
 * Usage in main.tsx:
 *   initializeThemeSync();
 *   ReactDOM.createRoot(...).render(<App />);
 */
export function initializeThemeSync(): void {
  // Read from localStorage directly (before Zustand hydrates)
  // eslint-disable-next-line no-restricted-globals
  const stored = localStorage.getItem('theme-storage');
  const mode: ThemeMode = stored ? JSON.parse(stored).state?.mode || 'light' : 'light';

  const resolvedTheme = mode === 'system' ? getSystemTheme() : mode;

  logger.info('[Theme] Sync initialization:', { mode, resolvedTheme });

  // Apply theme immediately
  applyTheme(resolvedTheme);
  updateManifestThemeColor(resolvedTheme);

  // Set up system watcher if in system mode
  if (mode === 'system') {
    watchSystemTheme((systemTheme) => {
      logger.info('[Theme] System theme changed (sync mode):', systemTheme);
      applyTheme(systemTheme);
      updateManifestThemeColor(systemTheme);
    });
  }
}

/**
 * Export store selectors for performance optimization
 *
 * CONCEPT: Granular state selection to prevent unnecessary re-renders
 * WHY: Components only re-render when their specific slice changes
 * PATTERN: Selector functions for common access patterns
 */
export const themeSelectors = {
  // Get current mode
  mode: (state: ThemeState) => state.mode,

  // Get resolved theme (actual displayed theme)
  resolved: (state: ThemeState) => state.resolvedTheme,

  // Get whether dark mode is active
  isDark: (state: ThemeState) => state.resolvedTheme === 'dark',

  // Get whether light mode is active
  isLight: (state: ThemeState) => state.resolvedTheme === 'light',

  // Get whether system mode is enabled
  isSystem: (state: ThemeState) => state.mode === 'system',

  // Get full state
  all: (state: ThemeState) => state,
};

/**
 * Hook: Use theme mode (optimized selector)
 *
 * Usage:
 *   const mode = useThemeMode(); // Only re-renders when mode changes
 */
export function useThemeMode() {
  return useThemeStore(themeSelectors.mode);
}

/**
 * Hook: Use resolved theme (optimized selector)
 *
 * Usage:
 *   const isDark = useIsDarkMode(); // Only re-renders when resolved theme changes
 */
export function useIsDarkMode() {
  return useThemeStore(themeSelectors.isDark);
}

/**
 * Hook: Use theme actions only (no state subscription)
 *
 * CONCEPT: Access actions without subscribing to state
 * WHY: Prevents re-renders when only calling actions
 * PATTERN: Shallow equality check on returned object
 *
 * Usage:
 *   const { setTheme, toggleTheme } = useThemeActions();
 *   // Component won't re-render when theme changes
 */
export function useThemeActions() {
  return useThemeStore((state) => ({
    setTheme: state.setTheme,
    toggleTheme: state.toggleTheme,
  }));
}

// Re-export types for convenience
export type { ThemeMode };
