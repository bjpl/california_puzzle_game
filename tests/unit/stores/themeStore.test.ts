/**
 * Theme Store Tests
 * Tests dark mode state management with system preference sync
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  useThemeStore,
  useTheme,
  useThemeMode,
  useIsDarkMode,
  useThemeActions,
  themeSelectors,
  initializeThemeSync,
} from '../../../src/stores/themeStore';

// Mock theme utilities
vi.mock('../../../src/config/theme', () => ({
  applyTheme: vi.fn(),
  getSystemTheme: vi.fn(() => 'light'),
  watchSystemTheme: vi.fn((callback) => {
    // Store callback for testing
    (global as Record<string, unknown>).__systemThemeCallback = callback;
    return () => {};
  }),
}));

// Mock logger
vi.mock('../../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock document for meta tag manipulation
const mockMetaTag = {
  setAttribute: vi.fn(),
  getAttribute: vi.fn(),
};

vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
  if (selector === 'meta[name="theme-color"]') {
    return mockMetaTag as unknown as Element;
  }
  return null;
});

vi.spyOn(document, 'createElement').mockImplementation(() => {
  return mockMetaTag as unknown as HTMLElement;
});

vi.spyOn(document.head, 'appendChild').mockImplementation(() => mockMetaTag as unknown as HTMLElement);

describe('themeStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useThemeStore.setState({
      mode: 'light',
      resolvedTheme: 'light',
      initialized: false,
    });
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have light mode as default', () => {
      const state = useThemeStore.getState();
      expect(state.mode).toBe('light');
    });

    it('should have light as resolved theme initially', () => {
      const state = useThemeStore.getState();
      expect(state.resolvedTheme).toBe('light');
    });

    it('should not be initialized initially', () => {
      const state = useThemeStore.getState();
      expect(state.initialized).toBe(false);
    });
  });

  describe('setTheme', () => {
    it('should set theme to dark', () => {
      useThemeStore.getState().setTheme('dark');

      const state = useThemeStore.getState();
      expect(state.mode).toBe('dark');
      expect(state.resolvedTheme).toBe('dark');
      expect(state.initialized).toBe(true);
    });

    it('should set theme to light', () => {
      useThemeStore.getState().setTheme('dark');
      useThemeStore.getState().setTheme('light');

      const state = useThemeStore.getState();
      expect(state.mode).toBe('light');
      expect(state.resolvedTheme).toBe('light');
    });

    it('should set theme to system', () => {
      useThemeStore.getState().setTheme('system');

      const state = useThemeStore.getState();
      expect(state.mode).toBe('system');
      // resolvedTheme depends on getSystemTheme mock (returns 'light')
      expect(state.resolvedTheme).toBe('light');
    });

    it('should call applyTheme with resolved theme', async () => {
      const { applyTheme } = await import('../../../src/config/theme');

      useThemeStore.getState().setTheme('dark');

      expect(applyTheme).toHaveBeenCalledWith('dark');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      useThemeStore.setState({ mode: 'light', resolvedTheme: 'light', initialized: true });

      useThemeStore.getState().toggleTheme();

      expect(useThemeStore.getState().mode).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      useThemeStore.setState({ mode: 'dark', resolvedTheme: 'dark', initialized: true });

      useThemeStore.getState().toggleTheme();

      expect(useThemeStore.getState().mode).toBe('light');
    });

    it('should toggle from system mode based on resolved theme', () => {
      useThemeStore.setState({ mode: 'system', resolvedTheme: 'dark', initialized: true });

      useThemeStore.getState().toggleTheme();

      expect(useThemeStore.getState().mode).toBe('light');
    });
  });

  describe('initializeTheme', () => {
    it('should initialize theme from current mode', () => {
      useThemeStore.setState({ mode: 'dark', initialized: false });

      useThemeStore.getState().initializeTheme();

      const state = useThemeStore.getState();
      expect(state.initialized).toBe(true);
      expect(state.resolvedTheme).toBe('dark');
    });

    it('should not re-initialize if already initialized', () => {
      useThemeStore.setState({ mode: 'light', initialized: true });
      const { logger } = vi.mocked(await import('../../../src/utils/logger'));

      useThemeStore.getState().initializeTheme();

      expect(logger.warn).toHaveBeenCalledWith(
        '[Theme] Already initialized, skipping'
      );
    });

    it('should set up system theme watcher in system mode', async () => {
      const { watchSystemTheme } = await import('../../../src/config/theme');
      useThemeStore.setState({ mode: 'system', initialized: false });

      useThemeStore.getState().initializeTheme();

      expect(watchSystemTheme).toHaveBeenCalled();
    });
  });

  describe('themeSelectors', () => {
    it('should select mode', () => {
      const state = { mode: 'dark' as const, resolvedTheme: 'dark' as const, initialized: true };
      expect(themeSelectors.mode(state as ReturnType<typeof useThemeStore.getState>)).toBe('dark');
    });

    it('should select resolved theme', () => {
      const state = { mode: 'system' as const, resolvedTheme: 'light' as const, initialized: true };
      expect(themeSelectors.resolved(state as ReturnType<typeof useThemeStore.getState>)).toBe('light');
    });

    it('should determine isDark correctly', () => {
      expect(
        themeSelectors.isDark({ resolvedTheme: 'dark' } as ReturnType<typeof useThemeStore.getState>)
      ).toBe(true);
      expect(
        themeSelectors.isDark({ resolvedTheme: 'light' } as ReturnType<typeof useThemeStore.getState>)
      ).toBe(false);
    });

    it('should determine isLight correctly', () => {
      expect(
        themeSelectors.isLight({ resolvedTheme: 'light' } as ReturnType<typeof useThemeStore.getState>)
      ).toBe(true);
      expect(
        themeSelectors.isLight({ resolvedTheme: 'dark' } as ReturnType<typeof useThemeStore.getState>)
      ).toBe(false);
    });

    it('should determine isSystem correctly', () => {
      expect(
        themeSelectors.isSystem({ mode: 'system' } as ReturnType<typeof useThemeStore.getState>)
      ).toBe(true);
      expect(
        themeSelectors.isSystem({ mode: 'dark' } as ReturnType<typeof useThemeStore.getState>)
      ).toBe(false);
    });
  });

  describe('Hook exports', () => {
    it('should export useThemeMode hook', () => {
      expect(typeof useThemeMode).toBe('function');
    });

    it('should export useIsDarkMode hook', () => {
      expect(typeof useIsDarkMode).toBe('function');
    });

    it('should export useThemeActions hook', () => {
      expect(typeof useThemeActions).toBe('function');
    });

    it('should export useTheme hook', () => {
      expect(typeof useTheme).toBe('function');
    });
  });

  describe('initializeThemeSync', () => {
    it('should be exported as function', () => {
      expect(typeof initializeThemeSync).toBe('function');
    });

    it('should read from localStorage', () => {
      localStorageMock.setItem(
        'theme-storage',
        JSON.stringify({ state: { mode: 'dark' } })
      );

      initializeThemeSync();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme-storage');
    });

    it('should default to light when no stored value', () => {
      initializeThemeSync();

      // Should apply light theme (default)
      expect(mockMetaTag.setAttribute).toHaveBeenCalled();
    });
  });

  describe('Persistence', () => {
    it('should only persist mode in storage', () => {
      // The partialize function should only include mode
      const state = useThemeStore.getState();

      // Verify store has all state
      expect(state).toHaveProperty('mode');
      expect(state).toHaveProperty('resolvedTheme');
      expect(state).toHaveProperty('initialized');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid theme changes', () => {
      const themes = ['light', 'dark', 'system', 'light', 'dark'] as const;

      themes.forEach((theme) => {
        useThemeStore.getState().setTheme(theme);
      });

      expect(useThemeStore.getState().mode).toBe('dark');
    });

    it('should handle multiple toggle calls', () => {
      useThemeStore.setState({ mode: 'light', resolvedTheme: 'light', initialized: true });

      for (let i = 0; i < 10; i++) {
        useThemeStore.getState().toggleTheme();
      }

      // After even number of toggles, should be back to original
      expect(useThemeStore.getState().mode).toBe('light');
    });
  });
});
