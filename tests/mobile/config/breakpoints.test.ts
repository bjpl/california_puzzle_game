/**
 * |unit| |integration| |accessibility| |performance|
 * Mobile Breakpoints Configuration Tests
 *
 * Tests device type detection, orientation detection, and responsive
 * utility functions for mobile-first design.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  BREAKPOINTS,
  DeviceType,
  Orientation,
  MEDIA_QUERIES,
  TOUCH_TARGETS,
  getDeviceType,
  isMobileDevice,
  isTabletDevice,
  getOrientation,
  isTouchDevice,
  prefersReducedMotion,
  prefersDarkMode,
  getOptimalTouchTargetSize,
} from '@/mobile/config/breakpoints';

// Mock window.matchMedia
const createMockMatchMedia = (matches: boolean) => {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('|unit| Breakpoints - Constants', () => {
  it('defines correct breakpoint values', () => {
    expect(BREAKPOINTS.SMALL_PHONE).toBe(320);
    expect(BREAKPOINTS.MEDIUM_PHONE).toBe(375);
    expect(BREAKPOINTS.LARGE_PHONE).toBe(428);
    expect(BREAKPOINTS.SMALL_TABLET).toBe(768);
    expect(BREAKPOINTS.LARGE_TABLET).toBe(1024);
    expect(BREAKPOINTS.DESKTOP).toBe(1280);
  });

  it('defines touch target sizes for accessibility', () => {
    expect(TOUCH_TARGETS.MIN_SIZE_AAA).toBe(44);
    expect(TOUCH_TARGETS.MIN_SIZE_AA).toBe(24);
    expect(TOUCH_TARGETS.OPTIMAL_SIZE).toBe(48);
    expect(TOUCH_TARGETS.LARGE_SIZE).toBe(56);
    expect(TOUCH_TARGETS.EXTRA_LARGE_SIZE).toBe(64);
  });

  it('defines media queries as strings', () => {
    expect(typeof MEDIA_QUERIES.smallPhone).toBe('string');
    expect(typeof MEDIA_QUERIES.mobile).toBe('string');
    expect(typeof MEDIA_QUERIES.portrait).toBe('string');
    expect(typeof MEDIA_QUERIES.touch).toBe('string');
  });

  it('media queries contain expected keywords', () => {
    expect(MEDIA_QUERIES.portrait).toContain('orientation');
    expect(MEDIA_QUERIES.landscape).toContain('orientation');
    expect(MEDIA_QUERIES.touch).toContain('hover');
    expect(MEDIA_QUERIES.reducedMotion).toContain('prefers-reduced-motion');
    expect(MEDIA_QUERIES.darkMode).toContain('prefers-color-scheme');
  });
});

describe('|unit| Breakpoints - getDeviceType', () => {
  it('returns SMALL_PHONE for width < 375px', () => {
    expect(getDeviceType(320)).toBe(DeviceType.SMALL_PHONE);
    expect(getDeviceType(360)).toBe(DeviceType.SMALL_PHONE);
    expect(getDeviceType(374)).toBe(DeviceType.SMALL_PHONE);
  });

  it('returns MEDIUM_PHONE for width 375-427px', () => {
    expect(getDeviceType(375)).toBe(DeviceType.MEDIUM_PHONE);
    expect(getDeviceType(390)).toBe(DeviceType.MEDIUM_PHONE);
    expect(getDeviceType(414)).toBe(DeviceType.MEDIUM_PHONE);
    expect(getDeviceType(427)).toBe(DeviceType.MEDIUM_PHONE);
  });

  it('returns LARGE_PHONE for width 428-767px', () => {
    expect(getDeviceType(428)).toBe(DeviceType.LARGE_PHONE);
    expect(getDeviceType(500)).toBe(DeviceType.LARGE_PHONE);
    expect(getDeviceType(767)).toBe(DeviceType.LARGE_PHONE);
  });

  it('returns SMALL_TABLET for width 768-1023px', () => {
    expect(getDeviceType(768)).toBe(DeviceType.SMALL_TABLET);
    expect(getDeviceType(800)).toBe(DeviceType.SMALL_TABLET);
    expect(getDeviceType(1023)).toBe(DeviceType.SMALL_TABLET);
  });

  it('returns LARGE_TABLET for width 1024-1279px', () => {
    expect(getDeviceType(1024)).toBe(DeviceType.LARGE_TABLET);
    expect(getDeviceType(1100)).toBe(DeviceType.LARGE_TABLET);
    expect(getDeviceType(1279)).toBe(DeviceType.LARGE_TABLET);
  });

  it('returns DESKTOP for width >= 1280px', () => {
    expect(getDeviceType(1280)).toBe(DeviceType.DESKTOP);
    expect(getDeviceType(1920)).toBe(DeviceType.DESKTOP);
    expect(getDeviceType(3840)).toBe(DeviceType.DESKTOP);
  });

  it('handles edge cases at exact breakpoint values', () => {
    expect(getDeviceType(BREAKPOINTS.MEDIUM_PHONE)).toBe(DeviceType.MEDIUM_PHONE);
    expect(getDeviceType(BREAKPOINTS.SMALL_TABLET)).toBe(DeviceType.SMALL_TABLET);
    expect(getDeviceType(BREAKPOINTS.DESKTOP)).toBe(DeviceType.DESKTOP);
  });

  it('handles very small widths', () => {
    expect(getDeviceType(240)).toBe(DeviceType.SMALL_PHONE);
    expect(getDeviceType(100)).toBe(DeviceType.SMALL_PHONE);
  });

  it('handles very large widths', () => {
    expect(getDeviceType(5000)).toBe(DeviceType.DESKTOP);
    expect(getDeviceType(10000)).toBe(DeviceType.DESKTOP);
  });
});

describe('|unit| Breakpoints - isMobileDevice', () => {
  it('returns true for small phone widths', () => {
    expect(isMobileDevice(320)).toBe(true);
    expect(isMobileDevice(360)).toBe(true);
  });

  it('returns true for medium phone widths', () => {
    expect(isMobileDevice(375)).toBe(true);
    expect(isMobileDevice(414)).toBe(true);
  });

  it('returns true for large phone widths', () => {
    expect(isMobileDevice(428)).toBe(true);
    expect(isMobileDevice(767)).toBe(true);
  });

  it('returns false for tablet widths', () => {
    expect(isMobileDevice(768)).toBe(false);
    expect(isMobileDevice(1024)).toBe(false);
  });

  it('returns false for desktop widths', () => {
    expect(isMobileDevice(1280)).toBe(false);
    expect(isMobileDevice(1920)).toBe(false);
  });

  it('handles edge case at tablet breakpoint', () => {
    expect(isMobileDevice(BREAKPOINTS.SMALL_TABLET - 1)).toBe(true);
    expect(isMobileDevice(BREAKPOINTS.SMALL_TABLET)).toBe(false);
  });
});

describe('|unit| Breakpoints - isTabletDevice', () => {
  it('returns false for mobile widths', () => {
    expect(isTabletDevice(320)).toBe(false);
    expect(isTabletDevice(767)).toBe(false);
  });

  it('returns true for small tablet widths', () => {
    expect(isTabletDevice(768)).toBe(true);
    expect(isTabletDevice(800)).toBe(true);
  });

  it('returns true for large tablet widths', () => {
    expect(isTabletDevice(1024)).toBe(true);
    expect(isTabletDevice(1279)).toBe(true);
  });

  it('returns false for desktop widths', () => {
    expect(isTabletDevice(1280)).toBe(false);
    expect(isTabletDevice(1920)).toBe(false);
  });

  it('handles edge cases at breakpoints', () => {
    expect(isTabletDevice(BREAKPOINTS.SMALL_TABLET - 1)).toBe(false);
    expect(isTabletDevice(BREAKPOINTS.SMALL_TABLET)).toBe(true);
    expect(isTabletDevice(BREAKPOINTS.DESKTOP - 1)).toBe(true);
    expect(isTabletDevice(BREAKPOINTS.DESKTOP)).toBe(false);
  });
});

describe('|unit| Breakpoints - getOrientation', () => {
  it('returns PORTRAIT when height > width', () => {
    expect(getOrientation(375, 667)).toBe(Orientation.PORTRAIT);
    expect(getOrientation(768, 1024)).toBe(Orientation.PORTRAIT);
    expect(getOrientation(100, 200)).toBe(Orientation.PORTRAIT);
  });

  it('returns LANDSCAPE when width > height', () => {
    expect(getOrientation(667, 375)).toBe(Orientation.LANDSCAPE);
    expect(getOrientation(1024, 768)).toBe(Orientation.LANDSCAPE);
    expect(getOrientation(200, 100)).toBe(Orientation.LANDSCAPE);
  });

  it('returns LANDSCAPE when width equals height', () => {
    expect(getOrientation(500, 500)).toBe(Orientation.LANDSCAPE);
    expect(getOrientation(1000, 1000)).toBe(Orientation.LANDSCAPE);
  });

  it('handles typical mobile portrait dimensions', () => {
    expect(getOrientation(375, 812)).toBe(Orientation.PORTRAIT); // iPhone X
    expect(getOrientation(390, 844)).toBe(Orientation.PORTRAIT); // iPhone 12/13
    expect(getOrientation(428, 926)).toBe(Orientation.PORTRAIT); // iPhone 12/13 Pro Max
  });

  it('handles typical mobile landscape dimensions', () => {
    expect(getOrientation(812, 375)).toBe(Orientation.LANDSCAPE); // iPhone X landscape
    expect(getOrientation(844, 390)).toBe(Orientation.LANDSCAPE); // iPhone 12/13 landscape
  });

  it('handles typical tablet dimensions', () => {
    expect(getOrientation(768, 1024)).toBe(Orientation.PORTRAIT); // iPad portrait
    expect(getOrientation(1024, 768)).toBe(Orientation.LANDSCAPE); // iPad landscape
    expect(getOrientation(834, 1194)).toBe(Orientation.PORTRAIT); // iPad Pro portrait
  });
});

describe('|unit| Breakpoints - isTouchDevice', () => {
  let originalWindow: Window & typeof globalThis;
  let originalNavigator: Navigator;

  beforeEach(() => {
    originalWindow = global.window;
    originalNavigator = global.navigator;
  });

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it('returns true when ontouchstart is in window', () => {
    Object.defineProperty(global, 'window', {
      value: { ontouchstart: null },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'navigator', {
      value: { maxTouchPoints: 0 },
      writable: true,
      configurable: true,
    });

    expect(isTouchDevice()).toBe(true);
  });

  it('returns true when maxTouchPoints > 0', () => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'navigator', {
      value: { maxTouchPoints: 5 },
      writable: true,
      configurable: true,
    });

    expect(isTouchDevice()).toBe(true);
  });

  it('returns true when msMaxTouchPoints > 0', () => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'navigator', {
      value: { maxTouchPoints: 0, msMaxTouchPoints: 10 },
      writable: true,
      configurable: true,
    });

    expect(isTouchDevice()).toBe(true);
  });

  it('returns false when no touch support detected', () => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'navigator', {
      value: { maxTouchPoints: 0 },
      writable: true,
      configurable: true,
    });

    expect(isTouchDevice()).toBe(false);
  });
});

describe('|unit| Breakpoints - prefersReducedMotion', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns true when user prefers reduced motion', () => {
    window.matchMedia = createMockMatchMedia(true);

    expect(prefersReducedMotion()).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith(MEDIA_QUERIES.reducedMotion);
  });

  it('returns false when user does not prefer reduced motion', () => {
    window.matchMedia = createMockMatchMedia(false);

    expect(prefersReducedMotion()).toBe(false);
  });

  it('calls matchMedia with correct query', () => {
    window.matchMedia = createMockMatchMedia(false);

    prefersReducedMotion();

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });
});

describe('|unit| Breakpoints - prefersDarkMode', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns true when user prefers dark mode', () => {
    window.matchMedia = createMockMatchMedia(true);

    expect(prefersDarkMode()).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith(MEDIA_QUERIES.darkMode);
  });

  it('returns false when user does not prefer dark mode', () => {
    window.matchMedia = createMockMatchMedia(false);

    expect(prefersDarkMode()).toBe(false);
  });

  it('calls matchMedia with correct query', () => {
    window.matchMedia = createMockMatchMedia(false);

    prefersDarkMode();

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });
});

describe('|unit| Breakpoints - getOptimalTouchTargetSize', () => {
  it('returns OPTIMAL_SIZE for small phones', () => {
    expect(getOptimalTouchTargetSize(DeviceType.SMALL_PHONE)).toBe(TOUCH_TARGETS.OPTIMAL_SIZE);
    expect(getOptimalTouchTargetSize(DeviceType.SMALL_PHONE)).toBe(48);
  });

  it('returns MIN_SIZE_AAA for medium phones', () => {
    expect(getOptimalTouchTargetSize(DeviceType.MEDIUM_PHONE)).toBe(TOUCH_TARGETS.MIN_SIZE_AAA);
    expect(getOptimalTouchTargetSize(DeviceType.MEDIUM_PHONE)).toBe(44);
  });

  it('returns MIN_SIZE_AAA for large phones', () => {
    expect(getOptimalTouchTargetSize(DeviceType.LARGE_PHONE)).toBe(TOUCH_TARGETS.MIN_SIZE_AAA);
    expect(getOptimalTouchTargetSize(DeviceType.LARGE_PHONE)).toBe(44);
  });

  it('returns MIN_SIZE_AA for small tablets', () => {
    expect(getOptimalTouchTargetSize(DeviceType.SMALL_TABLET)).toBe(TOUCH_TARGETS.MIN_SIZE_AA);
    expect(getOptimalTouchTargetSize(DeviceType.SMALL_TABLET)).toBe(24);
  });

  it('returns MIN_SIZE_AA for large tablets', () => {
    expect(getOptimalTouchTargetSize(DeviceType.LARGE_TABLET)).toBe(TOUCH_TARGETS.MIN_SIZE_AA);
    expect(getOptimalTouchTargetSize(DeviceType.LARGE_TABLET)).toBe(24);
  });

  it('returns MIN_SIZE_AA for desktop', () => {
    expect(getOptimalTouchTargetSize(DeviceType.DESKTOP)).toBe(TOUCH_TARGETS.MIN_SIZE_AA);
    expect(getOptimalTouchTargetSize(DeviceType.DESKTOP)).toBe(24);
  });
});

describe('|integration| Breakpoints - Device Classification', () => {
  it('correctly classifies iPhone SE (1st gen)', () => {
    const width = 320;
    const height = 568;

    expect(getDeviceType(width)).toBe(DeviceType.SMALL_PHONE);
    expect(isMobileDevice(width)).toBe(true);
    expect(isTabletDevice(width)).toBe(false);
    expect(getOrientation(width, height)).toBe(Orientation.PORTRAIT);
  });

  it('correctly classifies iPhone 12/13', () => {
    const width = 390;
    const height = 844;

    expect(getDeviceType(width)).toBe(DeviceType.MEDIUM_PHONE);
    expect(isMobileDevice(width)).toBe(true);
    expect(isTabletDevice(width)).toBe(false);
    expect(getOrientation(width, height)).toBe(Orientation.PORTRAIT);
  });

  it('correctly classifies iPhone 12/13 Pro Max', () => {
    const width = 428;
    const height = 926;

    expect(getDeviceType(width)).toBe(DeviceType.LARGE_PHONE);
    expect(isMobileDevice(width)).toBe(true);
    expect(isTabletDevice(width)).toBe(false);
    expect(getOrientation(width, height)).toBe(Orientation.PORTRAIT);
  });

  it('correctly classifies iPad (portrait)', () => {
    const width = 768;
    const height = 1024;

    expect(getDeviceType(width)).toBe(DeviceType.SMALL_TABLET);
    expect(isMobileDevice(width)).toBe(false);
    expect(isTabletDevice(width)).toBe(true);
    expect(getOrientation(width, height)).toBe(Orientation.PORTRAIT);
  });

  it('correctly classifies iPad (landscape)', () => {
    const width = 1024;
    const height = 768;

    expect(getDeviceType(width)).toBe(DeviceType.LARGE_TABLET);
    expect(isMobileDevice(width)).toBe(false);
    expect(isTabletDevice(width)).toBe(true);
    expect(getOrientation(width, height)).toBe(Orientation.LANDSCAPE);
  });

  it('correctly classifies iPad Pro 12.9"', () => {
    const width = 1024;
    const height = 1366;

    expect(getDeviceType(width)).toBe(DeviceType.LARGE_TABLET);
    expect(isMobileDevice(width)).toBe(false);
    expect(isTabletDevice(width)).toBe(true);
    expect(getOrientation(width, height)).toBe(Orientation.PORTRAIT);
  });

  it('correctly classifies desktop', () => {
    const width = 1920;
    const height = 1080;

    expect(getDeviceType(width)).toBe(DeviceType.DESKTOP);
    expect(isMobileDevice(width)).toBe(false);
    expect(isTabletDevice(width)).toBe(false);
    expect(getOrientation(width, height)).toBe(Orientation.LANDSCAPE);
  });
});

describe('|accessibility| Breakpoints - Touch Target Sizes', () => {
  it('all touch target sizes meet WCAG AA minimum', () => {
    const wcagAAMinimum = 24;

    expect(TOUCH_TARGETS.MIN_SIZE_AA).toBeGreaterThanOrEqual(wcagAAMinimum);
    expect(TOUCH_TARGETS.MIN_SIZE_AAA).toBeGreaterThanOrEqual(wcagAAMinimum);
    expect(TOUCH_TARGETS.OPTIMAL_SIZE).toBeGreaterThanOrEqual(wcagAAMinimum);
    expect(TOUCH_TARGETS.LARGE_SIZE).toBeGreaterThanOrEqual(wcagAAMinimum);
    expect(TOUCH_TARGETS.EXTRA_LARGE_SIZE).toBeGreaterThanOrEqual(wcagAAMinimum);
  });

  it('AAA touch target meets WCAG AAA minimum', () => {
    const wcagAAAMinimum = 44;

    expect(TOUCH_TARGETS.MIN_SIZE_AAA).toBeGreaterThanOrEqual(wcagAAAMinimum);
    expect(TOUCH_TARGETS.OPTIMAL_SIZE).toBeGreaterThanOrEqual(wcagAAAMinimum);
  });

  it('small phones get optimal touch targets for accessibility', () => {
    const size = getOptimalTouchTargetSize(DeviceType.SMALL_PHONE);
    expect(size).toBeGreaterThanOrEqual(TOUCH_TARGETS.MIN_SIZE_AAA);
  });

  it('all device types get accessible touch targets', () => {
    const deviceTypes = [
      DeviceType.SMALL_PHONE,
      DeviceType.MEDIUM_PHONE,
      DeviceType.LARGE_PHONE,
      DeviceType.SMALL_TABLET,
      DeviceType.LARGE_TABLET,
      DeviceType.DESKTOP,
    ];

    deviceTypes.forEach((deviceType) => {
      const size = getOptimalTouchTargetSize(deviceType);
      expect(size).toBeGreaterThanOrEqual(TOUCH_TARGETS.MIN_SIZE_AA);
    });
  });
});

describe('|performance| Breakpoints - Performance', () => {
  it('device type detection is fast', () => {
    const iterations = 10000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      getDeviceType(375 + i);
    }

    const duration = performance.now() - start;
    const avgDuration = duration / iterations;

    // Should be less than 0.01ms per call
    expect(avgDuration).toBeLessThan(0.01);
  });

  it('orientation detection is fast', () => {
    const iterations = 10000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      getOrientation(375 + i, 667 + i);
    }

    const duration = performance.now() - start;
    const avgDuration = duration / iterations;

    // Should be less than 0.01ms per call
    expect(avgDuration).toBeLessThan(0.01);
  });

  it('touch target size lookup is fast', () => {
    const deviceTypes = [
      DeviceType.SMALL_PHONE,
      DeviceType.MEDIUM_PHONE,
      DeviceType.LARGE_PHONE,
      DeviceType.SMALL_TABLET,
      DeviceType.LARGE_TABLET,
      DeviceType.DESKTOP,
    ];

    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      deviceTypes.forEach((type) => {
        getOptimalTouchTargetSize(type);
      });
    }

    const duration = performance.now() - start;
    const avgDuration = duration / (iterations * deviceTypes.length);

    // Should be less than 0.01ms per call
    expect(avgDuration).toBeLessThan(0.01);
  });
});
