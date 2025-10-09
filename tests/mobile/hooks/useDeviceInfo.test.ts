/**
 * |unit| |integration| |a11y| |performance|
 * useDeviceInfo Hook Tests
 *
 * Comprehensive test coverage for useDeviceInfo hook.
 * Tests device detection, orientation changes, viewport resizing, and user preferences.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useDeviceInfo } from '@/mobile/hooks/useDeviceInfo';
import { DeviceType, Orientation, MEDIA_QUERIES } from '@/mobile/config/breakpoints';

/**
 * Mock MediaQueryList for testing
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

  addListener(): void {}
  removeListener(): void {}
}

describe('|unit| useDeviceInfo Hook - Device Type Detection', () => {
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 768 });
    Object.defineProperty(window, 'devicePixelRatio', { writable: true, value: 1 });

    // Mock matchMedia
    window.matchMedia = vi.fn((query: string) => {
      return new MockMediaQueryList(query, false);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should detect small phone (320px)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 320 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 568 });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.deviceType).toBe(DeviceType.SMALL_PHONE);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should detect medium phone (375px)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 667 });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.deviceType).toBe(DeviceType.MEDIUM_PHONE);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.width).toBe(375);
    expect(result.current.height).toBe(667);
  });

  it('should detect large phone (428px)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 428 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 926 });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.deviceType).toBe(DeviceType.LARGE_PHONE);
    expect(result.current.isMobile).toBe(true);
  });

  it('should detect small tablet (768px)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 768 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 1024 });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.deviceType).toBe(DeviceType.SMALL_TABLET);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
  });

  it('should detect large tablet (1024px)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 1366 });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.deviceType).toBe(DeviceType.LARGE_TABLET);
    expect(result.current.isTablet).toBe(true);
  });

  it('should detect desktop (1280px+)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1920 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 1080 });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.deviceType).toBe(DeviceType.DESKTOP);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
  });
});

describe('|unit| useDeviceInfo Hook - Orientation Detection', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn((query: string) => {
      return new MockMediaQueryList(query, false);
    });
  });

  it('should detect portrait orientation (height > width)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 667 });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.orientation).toBe(Orientation.PORTRAIT);
    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isLandscape).toBe(false);
  });

  it('should detect landscape orientation (width > height)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 667 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 375 });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.orientation).toBe(Orientation.LANDSCAPE);
    expect(result.current.isLandscape).toBe(true);
    expect(result.current.isPortrait).toBe(false);
  });

  it('should handle orientation change event', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 667 });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.isPortrait).toBe(true);

    // Simulate orientation change
    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 667 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 375 });
      window.dispatchEvent(new Event('orientationchange'));
    });

    await waitFor(() => {
      expect(result.current.isLandscape).toBe(true);
      expect(result.current.isPortrait).toBe(false);
    });
  });
});

describe('|unit| useDeviceInfo Hook - Viewport Resize', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn((query: string) => {
      return new MockMediaQueryList(query, false);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce resize events (default 150ms)', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 667 });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.width).toBe(375);

    // Trigger multiple rapid resizes
    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 400 });
      window.dispatchEvent(new Event('resize'));

      Object.defineProperty(window, 'innerWidth', { writable: true, value: 450 });
      window.dispatchEvent(new Event('resize'));

      Object.defineProperty(window, 'innerWidth', { writable: true, value: 500 });
      window.dispatchEvent(new Event('resize'));
    });

    // Should not update immediately
    expect(result.current.width).toBe(375);

    // Wait for debounce
    act(() => {
      vi.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(result.current.width).toBe(500);
    });
  });

  it('should respect custom debounce delay', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });

    const { result } = renderHook(() => useDeviceInfo(300)); // 300ms debounce

    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 500 });
      window.dispatchEvent(new Event('resize'));
    });

    // 150ms should not trigger update
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.width).toBe(375);

    // 300ms should trigger update
    act(() => {
      vi.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(result.current.width).toBe(500);
    });
  });

  it('should update device type on resize', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.deviceType).toBe(DeviceType.MEDIUM_PHONE);

    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 768 });
      window.dispatchEvent(new Event('resize'));
      vi.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(result.current.deviceType).toBe(DeviceType.SMALL_TABLET);
    });
  });
});

describe('|unit| useDeviceInfo Hook - User Preferences', () => {
  let darkModeMql: MockMediaQueryList;
  let reducedMotionMql: MockMediaQueryList;

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 667 });

    darkModeMql = new MockMediaQueryList(MEDIA_QUERIES.darkMode, false);
    reducedMotionMql = new MockMediaQueryList(MEDIA_QUERIES.reducedMotion, false);

    window.matchMedia = vi.fn((query: string) => {
      if (query === MEDIA_QUERIES.darkMode) return darkModeMql;
      if (query === MEDIA_QUERIES.reducedMotion) return reducedMotionMql;
      return new MockMediaQueryList(query, false);
    });
  });

  it('should detect dark mode preference', () => {
    darkModeMql.matches = true;

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.darkMode).toBe(true);
  });

  it('should detect reduced motion preference', () => {
    reducedMotionMql.matches = true;

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.reducedMotion).toBe(true);
  });

  it('should respond to dark mode changes', async () => {
    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.darkMode).toBe(false);

    act(() => {
      darkModeMql.triggerChange(true);
    });

    await waitFor(() => {
      expect(result.current.darkMode).toBe(true);
    });
  });

  it('should respond to reduced motion changes', async () => {
    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.reducedMotion).toBe(false);

    act(() => {
      reducedMotionMql.triggerChange(true);
    });

    await waitFor(() => {
      expect(result.current.reducedMotion).toBe(true);
    });
  });

  it('should detect touch capability', () => {
    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', { value: true });
    Object.defineProperty(navigator, 'maxTouchPoints', { writable: true, value: 5 });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.isTouch).toBe(true);
  });

  it('should detect pixel ratio', () => {
    Object.defineProperty(window, 'devicePixelRatio', { writable: true, value: 2 });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.pixelRatio).toBe(2);
  });
});

describe('|integration| useDeviceInfo Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn((query: string) => {
      return new MockMediaQueryList(query, false);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should update all properties on window resize', async () => {
    // Start in portrait phone
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 667 });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.deviceType).toBe(DeviceType.MEDIUM_PHONE);
    expect(result.current.isPortrait).toBe(true);

    // Rotate to landscape
    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 667 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 375 });
      window.dispatchEvent(new Event('resize'));
      vi.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(result.current.deviceType).toBe(DeviceType.LARGE_PHONE);
      expect(result.current.isLandscape).toBe(true);
      expect(result.current.width).toBe(667);
      expect(result.current.height).toBe(375);
    });
  });

  it('should cleanup all listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useDeviceInfo());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));
  });
});

describe('|a11y| useDeviceInfo Accessibility', () => {
  let reducedMotionMql: MockMediaQueryList;

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 667 });

    reducedMotionMql = new MockMediaQueryList(MEDIA_QUERIES.reducedMotion, false);

    window.matchMedia = vi.fn((query: string) => {
      if (query === MEDIA_QUERIES.reducedMotion) return reducedMotionMql;
      return new MockMediaQueryList(query, false);
    });
  });

  it('should respect prefers-reduced-motion for animations', () => {
    reducedMotionMql.matches = true;

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.reducedMotion).toBe(true);
  });

  it('should update when user toggles reduced motion', async () => {
    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.reducedMotion).toBe(false);

    // User enables reduced motion
    act(() => {
      reducedMotionMql.triggerChange(true);
    });

    await waitFor(() => {
      expect(result.current.reducedMotion).toBe(true);
    });
  });

  it('should support touch accessibility features', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', { writable: true, value: 1 });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.isTouch).toBe(true);
  });
});

describe('|performance| useDeviceInfo Performance', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn((query: string) => {
      return new MockMediaQueryList(query, false);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce rapid resize events to prevent excessive re-renders', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });

    const { result } = renderHook(() => useDeviceInfo());

    const initialWidth = result.current.width;

    // Trigger 10 rapid resizes
    act(() => {
      for (let i = 0; i < 10; i++) {
        Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 + i * 10 });
        window.dispatchEvent(new Event('resize'));
      }
    });

    // Should not update immediately
    expect(result.current.width).toBe(initialWidth);

    // Only final value after debounce
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.width).toBe(465); // 375 + 9 * 10
  });

  it('should cleanup timeout on unmount to prevent memory leaks', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });

    const { unmount } = renderHook(() => useDeviceInfo());

    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 500 });
      window.dispatchEvent(new Event('resize'));
    });

    unmount();

    // Advance time after unmount
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // No error should occur
  });

  it('should handle multiple hook instances efficiently', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });

    const { result: result1 } = renderHook(() => useDeviceInfo());
    const { result: result2 } = renderHook(() => useDeviceInfo());
    const { result: result3 } = renderHook(() => useDeviceInfo());

    expect(result1.current.width).toBe(375);
    expect(result2.current.width).toBe(375);
    expect(result3.current.width).toBe(375);

    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 500 });
      window.dispatchEvent(new Event('resize'));
      vi.advanceTimersByTime(150);
    });

    // All instances should update
    expect(result1.current.width).toBe(500);
    expect(result2.current.width).toBe(500);
    expect(result3.current.width).toBe(500);
  });
});
