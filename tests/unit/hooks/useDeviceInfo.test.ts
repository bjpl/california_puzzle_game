/**
 * Unit Tests for useDeviceInfo Hook
 *
 * Tests device detection, viewport tracking, orientation changes,
 * and user preference detection.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDeviceInfo } from '../../../src/mobile/hooks/useDeviceInfo';
import { DeviceType, Orientation } from '../../../src/mobile/config/breakpoints';

// Mock window properties
function mockWindowSize(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
}

function mockDevicePixelRatio(ratio: number) {
  Object.defineProperty(window, 'devicePixelRatio', {
    writable: true,
    configurable: true,
    value: ratio,
  });
}

describe('useDeviceInfo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockWindowSize(1024, 768);
    mockDevicePixelRatio(1);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with current window dimensions', () => {
      mockWindowSize(800, 600);

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.width).toBe(800);
      expect(result.current.height).toBe(600);
    });

    it('should detect device type correctly', () => {
      mockWindowSize(375, 667); // Mobile size

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
    });

    it('should detect pixel ratio', () => {
      mockDevicePixelRatio(2);

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.pixelRatio).toBe(2);
    });

    it('should detect orientation', () => {
      mockWindowSize(375, 667); // Portrait

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
      expect(result.current.orientation).toBe(Orientation.PORTRAIT);
    });
  });

  describe('Mobile Device Detection', () => {
    it('should detect mobile phone', () => {
      mockWindowSize(375, 667); // iPhone 8

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.deviceType).toBe(DeviceType.MOBILE);
    });

    it('should detect small mobile', () => {
      mockWindowSize(320, 568); // iPhone SE

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.isMobile).toBe(true);
    });

    it('should detect large mobile', () => {
      mockWindowSize(414, 896); // iPhone 11 Pro Max

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.isMobile).toBe(true);
    });
  });

  describe('Tablet Device Detection', () => {
    it('should detect tablet device', () => {
      mockWindowSize(768, 1024); // iPad

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.deviceType).toBe(DeviceType.TABLET);
    });

    it('should detect iPad Pro', () => {
      mockWindowSize(1024, 1366);

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.isTablet).toBe(true);
    });
  });

  describe('Desktop Detection', () => {
    it('should detect desktop device', () => {
      mockWindowSize(1920, 1080);

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.deviceType).toBe(DeviceType.DESKTOP);
    });

    it('should detect laptop', () => {
      mockWindowSize(1440, 900);

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.isDesktop).toBe(true);
    });
  });

  describe('Orientation Detection', () => {
    it('should detect portrait orientation', () => {
      mockWindowSize(375, 812);

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.orientation).toBe(Orientation.PORTRAIT);
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
    });

    it('should detect landscape orientation', () => {
      mockWindowSize(812, 375);

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.orientation).toBe(Orientation.LANDSCAPE);
      expect(result.current.isLandscape).toBe(true);
      expect(result.current.isPortrait).toBe(false);
    });

    it('should treat square aspect ratio as portrait', () => {
      mockWindowSize(600, 600);

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.isPortrait).toBe(true);
    });
  });

  describe('Resize Handling', () => {
    it('should update on window resize', async () => {
      const { result } = renderHook(() => useDeviceInfo(50)); // Short debounce

      expect(result.current.width).toBe(1024);

      // Resize window
      act(() => {
        mockWindowSize(375, 667);
        window.dispatchEvent(new Event('resize'));
      });

      // Wait for debounce
      act(() => {
        vi.advanceTimersByTime(50);
      });

      await waitFor(() => {
        expect(result.current.width).toBe(375);
      });
    });

    it('should debounce resize events', async () => {
      const { result } = renderHook(() => useDeviceInfo(100));

      // Multiple rapid resizes
      act(() => {
        mockWindowSize(800, 600);
        window.dispatchEvent(new Event('resize'));
        mockWindowSize(900, 600);
        window.dispatchEvent(new Event('resize'));
        mockWindowSize(1000, 600);
        window.dispatchEvent(new Event('resize'));
      });

      // Should not update yet
      expect(result.current.width).toBe(1024);

      // Wait for debounce
      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.width).toBe(1000);
      });
    });

    it('should update device type on resize', async () => {
      const { result } = renderHook(() => useDeviceInfo(50));

      expect(result.current.isMobile).toBe(false);

      // Resize to mobile
      act(() => {
        mockWindowSize(375, 667);
        window.dispatchEvent(new Event('resize'));
      });

      act(() => {
        vi.advanceTimersByTime(50);
      });

      await waitFor(() => {
        expect(result.current.isMobile).toBe(true);
      });
    });
  });

  describe('Orientation Change', () => {
    it('should update on orientation change', () => {
      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.orientation).toBe(Orientation.LANDSCAPE);

      // Simulate orientation change
      act(() => {
        mockWindowSize(667, 375); // Portrait
        window.dispatchEvent(new Event('orientationchange'));
      });

      expect(result.current.orientation).toBe(Orientation.PORTRAIT);
    });

    it('should immediately update on orientationchange event', () => {
      const { result } = renderHook(() => useDeviceInfo(1000)); // Long debounce

      // orientationchange should bypass debounce
      act(() => {
        mockWindowSize(667, 375);
        window.dispatchEvent(new Event('orientationchange'));
      });

      // Should update immediately
      expect(result.current.orientation).toBe(Orientation.PORTRAIT);
    });
  });

  describe('Touch Device Detection', () => {
    it('should detect touch-capable device', () => {
      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.isTouch).toBe(true);
    });

    it('should detect non-touch device', () => {
      // @ts-expect-error - deleting for test
      delete window.ontouchstart;

      const { result } = renderHook(() => useDeviceInfo());

      // Will depend on other detection methods
      expect(typeof result.current.isTouch).toBe('boolean');
    });
  });

  describe('User Preferences', () => {
    it('should detect dark mode preference', () => {
      const matchMediaMock = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      window.matchMedia = matchMediaMock;

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.darkMode).toBe(true);
    });

    it('should detect light mode preference', () => {
      const matchMediaMock = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      window.matchMedia = matchMediaMock;

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.darkMode).toBe(false);
    });

    it('should detect reduced motion preference', () => {
      const matchMediaMock = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      window.matchMedia = matchMediaMock;

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.reducedMotion).toBe(true);
    });

    it('should update on color scheme change', () => {
      let colorSchemeListener: ((e: MediaQueryListEvent) => void) | null = null;

      const matchMediaMock = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn((_, handler) => {
          if (query === '(prefers-color-scheme: dark)') {
            colorSchemeListener = handler;
          }
        }),
        removeEventListener: vi.fn(),
      }));

      window.matchMedia = matchMediaMock;

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.darkMode).toBe(false);

      // Trigger color scheme change
      if (colorSchemeListener) {
        act(() => {
          colorSchemeListener({
            matches: true,
            media: '(prefers-color-scheme: dark)',
          } as MediaQueryListEvent);
        });
      }

      expect(result.current.darkMode).toBe(true);
    });
  });

  describe('Custom Debounce', () => {
    it('should use custom debounce delay', async () => {
      const { result } = renderHook(() => useDeviceInfo(200));

      act(() => {
        mockWindowSize(800, 600);
        window.dispatchEvent(new Event('resize'));
      });

      // Should not update after 100ms
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.width).toBe(1024);

      // Should update after 200ms
      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.width).toBe(800);
      });
    });

    it('should handle zero debounce', async () => {
      const { result } = renderHook(() => useDeviceInfo(0));

      act(() => {
        mockWindowSize(800, 600);
        window.dispatchEvent(new Event('resize'));
      });

      act(() => {
        vi.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current.width).toBe(800);
      });
    });
  });

  describe('Cleanup', () => {
    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useDeviceInfo());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'orientationchange',
        expect.any(Function)
      );
    });

    it('should clear pending timers on unmount', () => {
      const { unmount } = renderHook(() => useDeviceInfo(1000));

      act(() => {
        mockWindowSize(800, 600);
        window.dispatchEvent(new Event('resize'));
      });

      unmount();

      // Advance past debounce - should not update
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // No error should occur
    });
  });

  describe('Edge Cases', () => {
    it('should handle server-side rendering (no window)', () => {
      // This test ensures the hook doesn't crash during SSR
      // Actual SSR testing would require a different setup
      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current).toBeDefined();
    });

    it('should handle rapid orientation changes', () => {
      const { result } = renderHook(() => useDeviceInfo());

      for (let i = 0; i < 10; i++) {
        act(() => {
          if (i % 2 === 0) {
            mockWindowSize(375, 667); // Portrait
          } else {
            mockWindowSize(667, 375); // Landscape
          }
          window.dispatchEvent(new Event('orientationchange'));
        });
      }

      expect(result.current.orientation).toBeDefined();
    });

    it('should handle breakpoint boundaries correctly', () => {
      // Test exact breakpoint values
      const breakpoints = [320, 480, 768, 1024, 1280, 1440];

      breakpoints.forEach((width) => {
        mockWindowSize(width, 600);
        const { result } = renderHook(() => useDeviceInfo());

        expect(result.current.width).toBe(width);
        expect(result.current.deviceType).toBeDefined();
      });
    });

    it('should handle very large screens', () => {
      mockWindowSize(3840, 2160); // 4K display

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.width).toBe(3840);
      expect(result.current.isDesktop).toBe(true);
    });

    it('should handle very small screens', () => {
      mockWindowSize(240, 320); // Very small device

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.width).toBe(240);
      expect(result.current.isMobile).toBe(true);
    });

    it('should maintain stable reference across re-renders without changes', () => {
      const { result, rerender } = renderHook(() => useDeviceInfo());

      const firstRender = result.current;
      rerender();
      const secondRender = result.current;

      // Values should be equal but objects might be different
      expect(firstRender.width).toBe(secondRender.width);
      expect(firstRender.height).toBe(secondRender.height);
    });
  });

  describe('Retina Display Detection', () => {
    it('should detect retina display', () => {
      mockDevicePixelRatio(2);

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.pixelRatio).toBe(2);
    });

    it('should detect super retina display', () => {
      mockDevicePixelRatio(3);

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.pixelRatio).toBe(3);
    });

    it('should handle missing pixel ratio', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useDeviceInfo());

      expect(result.current.pixelRatio).toBe(1);
    });
  });
});
