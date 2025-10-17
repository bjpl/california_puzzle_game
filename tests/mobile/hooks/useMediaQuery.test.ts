/**
 * |unit| |integration| |a11y| |performance|
 * useMediaQuery Hook Tests
 *
 * Comprehensive test coverage for useMediaQuery and useMediaQueries hooks.
 * Tests media query matching, change events, SSR compatibility, and cleanup.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useMediaQuery, useMediaQueries } from '@/mobile/hooks/useMediaQuery';
import { MEDIA_QUERIES } from '@/mobile/config/breakpoints';

/**
 * Mock MediaQueryList implementation
 */
class MockMediaQueryList implements MediaQueryList {
  matches: boolean;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown) | null = null;
  private listeners: Array<(event: MediaQueryListEvent) => void> = [];

  constructor(media: string, matches: boolean) {
    this.media = media;
    this.matches = matches;
  }

  addEventListener(_type: string, callback: (event: MediaQueryListEvent) => void): void {
    this.listeners.push(callback);
  }

  removeEventListener(_type: string, callback: (event: MediaQueryListEvent) => void): void {
    this.listeners = this.listeners.filter((l) => l !== callback);
  }

  // Deprecated API for older browsers
  addListener(callback: (event: MediaQueryListEvent) => void): void {
    // Check if modern API exists, otherwise directly manage listeners
    if (this.addEventListener) {
      this.addEventListener('change', callback);
    } else {
      this.listeners.push(callback);
    }
  }

  removeListener(callback: (event: MediaQueryListEvent) => void): void {
    if (this.removeEventListener) {
      this.removeEventListener('change', callback);
    } else {
      this.listeners = this.listeners.filter((l) => l !== callback);
    }
  }

  // Test helper: trigger change event
  triggerChange(matches: boolean): void {
    this.matches = matches;
    const event = new Event('change') as MediaQueryListEvent;
    Object.defineProperty(event, 'matches', { value: matches });
    Object.defineProperty(event, 'media', { value: this.media });
    this.listeners.forEach((listener) => listener(event));
  }

  dispatchEvent(_event: Event): boolean {
    return true;
  }

  getListenerCount(): number {
    return this.listeners.length;
  }
}

describe('|unit| useMediaQuery Hook', () => {
  let matchMediaMock: Map<string, MockMediaQueryList>;

  beforeEach(() => {
    matchMediaMock = new Map();

    // Mock window.matchMedia
    window.matchMedia = vi.fn((query: string) => {
      if (!matchMediaMock.has(query)) {
        matchMediaMock.set(query, new MockMediaQueryList(query, false));
      }
      return matchMediaMock.get(query)!;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return false by default when media query does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('should return true when media query matches', () => {
    const query = '(max-width: 768px)';
    matchMediaMock.set(query, new MockMediaQueryList(query, true));

    const { result } = renderHook(() => useMediaQuery(query));
    expect(result.current).toBe(true);
  });

  it('should update when media query match changes', async () => {
    const query = '(max-width: 768px)';
    const mockMql = new MockMediaQueryList(query, false);
    matchMediaMock.set(query, mockMql);

    const { result } = renderHook(() => useMediaQuery(query));

    expect(result.current).toBe(false);

    // Trigger media query change
    act(() => {
      mockMql.triggerChange(true);
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should use default value when matchMedia is not available', () => {
    // Temporarily remove matchMedia
    const originalMatchMedia = window.matchMedia;
    // @ts-expect-error - Testing SSR scenario
    delete window.matchMedia;

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)', true));
    expect(result.current).toBe(true);

    // Restore matchMedia
    window.matchMedia = originalMatchMedia;
  });

  it('should cleanup event listeners on unmount', () => {
    const query = '(max-width: 768px)';
    const mockMql = new MockMediaQueryList(query, false);
    matchMediaMock.set(query, mockMql);

    const { unmount } = renderHook(() => useMediaQuery(query));

    expect(mockMql.getListenerCount()).toBe(1);

    unmount();

    expect(mockMql.getListenerCount()).toBe(0);
  });

  it('should work with MEDIA_QUERIES constants', () => {
    const query = MEDIA_QUERIES.mobile;
    matchMediaMock.set(query, new MockMediaQueryList(query, true));

    const { result } = renderHook(() => useMediaQuery(MEDIA_QUERIES.mobile));
    expect(result.current).toBe(true);
  });

  it('should handle rapid media query changes', async () => {
    const query = '(max-width: 768px)';
    const mockMql = new MockMediaQueryList(query, false);
    matchMediaMock.set(query, mockMql);

    const { result } = renderHook(() => useMediaQuery(query));

    // Rapidly toggle matches
    act(() => {
      mockMql.triggerChange(true);
      mockMql.triggerChange(false);
      mockMql.triggerChange(true);
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should use deprecated addListener/removeListener for old browsers', () => {
    const query = '(max-width: 768px)';
    const mockMql = new MockMediaQueryList(query, false);

    // Remove modern API to simulate old browser
    // @ts-expect-error - Testing legacy API
    mockMql.addEventListener = undefined;
    // @ts-expect-error - Testing legacy API
    mockMql.removeEventListener = undefined;

    matchMediaMock.set(query, mockMql);

    const { unmount } = renderHook(() => useMediaQuery(query));

    expect(mockMql.getListenerCount()).toBe(1);

    unmount();

    expect(mockMql.getListenerCount()).toBe(0);
  });
});

describe('|unit| useMediaQueries Hook', () => {
  let matchMediaMock: Map<string, MockMediaQueryList>;

  beforeEach(() => {
    matchMediaMock = new Map();

    window.matchMedia = vi.fn((query: string) => {
      if (!matchMediaMock.has(query)) {
        matchMediaMock.set(query, new MockMediaQueryList(query, false));
      }
      return matchMediaMock.get(query)!;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return false for all queries by default', () => {
    const queries = {
      isMobile: MEDIA_QUERIES.mobile,
      isTablet: MEDIA_QUERIES.tablet,
      isTouch: MEDIA_QUERIES.touch,
    };

    const { result } = renderHook(() => useMediaQueries(queries));

    expect(result.current).toEqual({
      isMobile: false,
      isTablet: false,
      isTouch: false,
    });
  });

  it('should return correct match state for multiple queries', () => {
    const queries = {
      isMobile: MEDIA_QUERIES.mobile,
      isTablet: MEDIA_QUERIES.tablet,
    };

    matchMediaMock.set(queries.isMobile, new MockMediaQueryList(queries.isMobile, true));
    matchMediaMock.set(queries.isTablet, new MockMediaQueryList(queries.isTablet, false));

    const { result } = renderHook(() => useMediaQueries(queries));

    expect(result.current).toEqual({
      isMobile: true,
      isTablet: false,
    });
  });

  it('should update when any query changes', async () => {
    const queries = {
      isMobile: MEDIA_QUERIES.mobile,
      isTablet: MEDIA_QUERIES.tablet,
    };

    const mobileMql = new MockMediaQueryList(queries.isMobile, false);
    const tabletMql = new MockMediaQueryList(queries.isTablet, false);

    matchMediaMock.set(queries.isMobile, mobileMql);
    matchMediaMock.set(queries.isTablet, tabletMql);

    const { result } = renderHook(() => useMediaQueries(queries));

    expect(result.current.isMobile).toBe(false);

    act(() => {
      mobileMql.triggerChange(true);
    });

    await waitFor(() => {
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
    });

    act(() => {
      tabletMql.triggerChange(true);
    });

    await waitFor(() => {
      expect(result.current.isTablet).toBe(true);
    });
  });

  it('should cleanup all listeners on unmount', () => {
    const queries = {
      isMobile: MEDIA_QUERIES.mobile,
      isTablet: MEDIA_QUERIES.tablet,
      isTouch: MEDIA_QUERIES.touch,
    };

    const mobileMql = new MockMediaQueryList(queries.isMobile, false);
    const tabletMql = new MockMediaQueryList(queries.isTablet, false);
    const touchMql = new MockMediaQueryList(queries.isTouch, false);

    matchMediaMock.set(queries.isMobile, mobileMql);
    matchMediaMock.set(queries.isTablet, tabletMql);
    matchMediaMock.set(queries.isTouch, touchMql);

    const { unmount } = renderHook(() => useMediaQueries(queries));

    expect(mobileMql.getListenerCount()).toBe(1);
    expect(tabletMql.getListenerCount()).toBe(1);
    expect(touchMql.getListenerCount()).toBe(1);

    unmount();

    expect(mobileMql.getListenerCount()).toBe(0);
    expect(tabletMql.getListenerCount()).toBe(0);
    expect(touchMql.getListenerCount()).toBe(0);
  });

  it('should handle empty queries object', () => {
    const { result } = renderHook(() => useMediaQueries({}));
    expect(result.current).toEqual({});
  });

  it('should work with deprecated API for old browsers', () => {
    const queries = {
      isMobile: MEDIA_QUERIES.mobile,
    };

    const mockMql = new MockMediaQueryList(queries.isMobile, false);
    // @ts-expect-error - Testing legacy API
    mockMql.addEventListener = undefined;
    // @ts-expect-error - Testing legacy API
    mockMql.removeEventListener = undefined;

    matchMediaMock.set(queries.isMobile, mockMql);

    const { unmount } = renderHook(() => useMediaQueries(queries));

    expect(mockMql.getListenerCount()).toBe(1);

    unmount();

    expect(mockMql.getListenerCount()).toBe(0);
  });
});

describe('|integration| useMediaQuery Integration', () => {
  let matchMediaMock: Map<string, MockMediaQueryList>;

  beforeEach(() => {
    matchMediaMock = new Map();
    window.matchMedia = vi.fn((query: string) => {
      if (!matchMediaMock.has(query)) {
        matchMediaMock.set(query, new MockMediaQueryList(query, false));
      }
      return matchMediaMock.get(query)!;
    });
  });

  it('should work with all MEDIA_QUERIES constants', () => {
    const allQueries = {
      smallPhone: MEDIA_QUERIES.smallPhone,
      mobile: MEDIA_QUERIES.mobile,
      tablet: MEDIA_QUERIES.tablet,
      desktop: MEDIA_QUERIES.desktop,
      portrait: MEDIA_QUERIES.portrait,
      landscape: MEDIA_QUERIES.landscape,
      touch: MEDIA_QUERIES.touch,
      retina: MEDIA_QUERIES.retina,
      reducedMotion: MEDIA_QUERIES.reducedMotion,
      darkMode: MEDIA_QUERIES.darkMode,
    };

    Object.values(allQueries).forEach((query) => {
      matchMediaMock.set(query, new MockMediaQueryList(query, false));
    });

    const { result } = renderHook(() => useMediaQueries(allQueries));

    expect(Object.keys(result.current)).toHaveLength(10);
  });

  it('should handle orientation changes in real-world scenario', async () => {
    const orientationQueries = {
      portrait: MEDIA_QUERIES.portrait,
      landscape: MEDIA_QUERIES.landscape,
    };

    const portraitMql = new MockMediaQueryList(orientationQueries.portrait, true);
    const landscapeMql = new MockMediaQueryList(orientationQueries.landscape, false);

    matchMediaMock.set(orientationQueries.portrait, portraitMql);
    matchMediaMock.set(orientationQueries.landscape, landscapeMql);

    const { result } = renderHook(() => useMediaQueries(orientationQueries));

    expect(result.current.portrait).toBe(true);
    expect(result.current.landscape).toBe(false);

    // Simulate device rotation
    act(() => {
      portraitMql.triggerChange(false);
      landscapeMql.triggerChange(true);
    });

    await waitFor(() => {
      expect(result.current.portrait).toBe(false);
      expect(result.current.landscape).toBe(true);
    });
  });
});

describe('|a11y| useMediaQuery Accessibility', () => {
  let matchMediaMock: Map<string, MockMediaQueryList>;

  beforeEach(() => {
    matchMediaMock = new Map();
    window.matchMedia = vi.fn((query: string) => {
      if (!matchMediaMock.has(query)) {
        matchMediaMock.set(query, new MockMediaQueryList(query, false));
      }
      return matchMediaMock.get(query)!;
    });
  });

  it('should detect prefers-reduced-motion preference', () => {
    const query = MEDIA_QUERIES.reducedMotion;
    matchMediaMock.set(query, new MockMediaQueryList(query, true));

    const { result } = renderHook(() => useMediaQuery(MEDIA_QUERIES.reducedMotion));
    expect(result.current).toBe(true);
  });

  it('should detect dark mode preference', () => {
    const query = MEDIA_QUERIES.darkMode;
    matchMediaMock.set(query, new MockMediaQueryList(query, true));

    const { result } = renderHook(() => useMediaQuery(MEDIA_QUERIES.darkMode));
    expect(result.current).toBe(true);
  });

  it('should respond to user preference changes', async () => {
    const query = MEDIA_QUERIES.reducedMotion;
    const mockMql = new MockMediaQueryList(query, false);
    matchMediaMock.set(query, mockMql);

    const { result } = renderHook(() => useMediaQuery(query));

    expect(result.current).toBe(false);

    // User enables reduced motion
    act(() => {
      mockMql.triggerChange(true);
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});

describe('|performance| useMediaQuery Performance', () => {
  let matchMediaMock: Map<string, MockMediaQueryList>;

  beforeEach(() => {
    matchMediaMock = new Map();
    window.matchMedia = vi.fn((query: string) => {
      if (!matchMediaMock.has(query)) {
        matchMediaMock.set(query, new MockMediaQueryList(query, false));
      }
      return matchMediaMock.get(query)!;
    });
  });

  it('should not create excessive listeners with multiple hook instances', () => {
    const query = MEDIA_QUERIES.mobile;
    const mockMql = new MockMediaQueryList(query, false);
    matchMediaMock.set(query, mockMql);

    const { unmount: unmount1 } = renderHook(() => useMediaQuery(query));
    const { unmount: unmount2 } = renderHook(() => useMediaQuery(query));
    const { unmount: unmount3 } = renderHook(() => useMediaQuery(query));

    expect(mockMql.getListenerCount()).toBe(3);

    unmount1();
    expect(mockMql.getListenerCount()).toBe(2);

    unmount2();
    expect(mockMql.getListenerCount()).toBe(1);

    unmount3();
    expect(mockMql.getListenerCount()).toBe(0);
  });

  it('should handle rapid hook mounting/unmounting', () => {
    const query = MEDIA_QUERIES.mobile;
    const mockMql = new MockMediaQueryList(query, false);
    matchMediaMock.set(query, mockMql);

    for (let i = 0; i < 10; i++) {
      const { unmount } = renderHook(() => useMediaQuery(query));
      expect(mockMql.getListenerCount()).toBe(1);
      unmount();
      expect(mockMql.getListenerCount()).toBe(0);
    }
  });

  it('should efficiently handle multiple queries without redundant listeners', () => {
    const queries = {
      q1: '(max-width: 320px)',
      q2: '(max-width: 768px)',
      q3: '(max-width: 1024px)',
    };

    Object.values(queries).forEach((query) => {
      matchMediaMock.set(query, new MockMediaQueryList(query, false));
    });

    const { unmount } = renderHook(() => useMediaQueries(queries));

    // Each query should have exactly 1 listener
    expect(matchMediaMock.get(queries.q1)!.getListenerCount()).toBe(1);
    expect(matchMediaMock.get(queries.q2)!.getListenerCount()).toBe(1);
    expect(matchMediaMock.get(queries.q3)!.getListenerCount()).toBe(1);

    unmount();

    // All listeners should be removed
    expect(matchMediaMock.get(queries.q1)!.getListenerCount()).toBe(0);
    expect(matchMediaMock.get(queries.q2)!.getListenerCount()).toBe(0);
    expect(matchMediaMock.get(queries.q3)!.getListenerCount()).toBe(0);
  });
});
