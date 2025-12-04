/**
 * Unit Tests for useHaptic Hook
 *
 * Tests haptic feedback functionality including vibration patterns,
 * settings management, and browser API compatibility.
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useHaptic, HAPTIC_PATTERNS } from '../../../src/mobile/hooks/useHaptic';

// Mock navigator.vibrate
const mockVibrate = vi.fn();

describe('useHaptic', () => {
  beforeEach(() => {
    // Mock vibration API
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
      configurable: true,
    });
    mockVibrate.mockClear();
    mockVibrate.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default settings', () => {
      const { result } = renderHook(() => useHaptic());

      expect(result.current.isSupported).toBe(true);
    });

    it('should detect vibration API support', () => {
      const { result } = renderHook(() => useHaptic());

      expect(result.current.isSupported).toBe(true);
    });

    it('should detect when vibration API is not supported', () => {
      // @ts-expect-error - deleting for test
      delete navigator.vibrate;

      const { result } = renderHook(() => useHaptic());

      expect(result.current.isSupported).toBe(false);
    });
  });

  describe('Haptic Settings', () => {
    it('should respect enabled setting', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: false,
          intensity: 1.0,
        })
      );

      act(() => {
        result.current.tap();
      });

      expect(mockVibrate).not.toHaveBeenCalled();
    });

    it('should trigger haptic when enabled', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      act(() => {
        result.current.tap();
      });

      expect(mockVibrate).toHaveBeenCalled();
    });

    it('should apply intensity multiplier', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 0.5,
        })
      );

      act(() => {
        result.current.tap();
      });

      // Tap pattern is [10], with 0.5 intensity should be [5]
      expect(mockVibrate).toHaveBeenCalledWith([5]);
    });

    it('should handle zero intensity', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 0,
        })
      );

      act(() => {
        result.current.tap();
      });

      expect(mockVibrate).toHaveBeenCalledWith([0]);
    });

    it('should handle maximum intensity', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      act(() => {
        result.current.success();
      });

      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.SUCCESS);
    });
  });

  describe('Haptic Patterns', () => {
    it('should trigger tap pattern', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      act(() => {
        result.current.tap();
      });

      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.TAP);
    });

    it('should trigger success pattern', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      act(() => {
        result.current.success();
      });

      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.SUCCESS);
    });

    it('should trigger error pattern', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      act(() => {
        result.current.error();
      });

      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.ERROR);
    });

    it('should trigger warning pattern', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      act(() => {
        result.current.warning();
      });

      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.WARNING);
    });

    it('should trigger achievement pattern', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      act(() => {
        result.current.achievement();
      });

      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.ACHIEVEMENT);
    });

    it('should trigger drag start pattern', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      act(() => {
        result.current.dragStart();
      });

      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.DRAG_START);
    });

    it('should trigger snap pattern', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      act(() => {
        result.current.snap();
      });

      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.SNAP);
    });

    it('should trigger selection pattern', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      act(() => {
        result.current.selection();
      });

      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.SELECTION);
    });
  });

  describe('Custom Patterns', () => {
    it('should trigger custom single vibration', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      act(() => {
        result.current.custom(100);
      });

      expect(mockVibrate).toHaveBeenCalledWith(100);
    });

    it('should trigger custom pattern array', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      const customPattern = [100, 50, 100, 50, 200];

      act(() => {
        result.current.custom(customPattern);
      });

      expect(mockVibrate).toHaveBeenCalledWith(customPattern);
    });

    it('should apply intensity to custom patterns', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 0.5,
        })
      );

      const customPattern = [100, 50, 100];

      act(() => {
        result.current.custom(customPattern);
      });

      expect(mockVibrate).toHaveBeenCalledWith([50, 25, 50]);
    });
  });

  describe('Vibration Cancellation', () => {
    it('should cancel all vibrations', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      act(() => {
        result.current.cancel();
      });

      expect(mockVibrate).toHaveBeenCalledWith(0);
    });

    it('should cancel vibration even when disabled', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: false,
          intensity: 1.0,
        })
      );

      act(() => {
        result.current.cancel();
      });

      expect(mockVibrate).toHaveBeenCalledWith(0);
    });
  });

  describe('Browser Compatibility', () => {
    it('should handle missing vibration API gracefully', () => {
      // @ts-expect-error - deleting for test
      delete navigator.vibrate;

      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      expect(() => {
        result.current.tap();
      }).not.toThrow();

      expect(result.current.isSupported).toBe(false);
    });

    it('should handle vibration API errors', () => {
      mockVibrate.mockImplementation(() => {
        throw new Error('Vibration failed');
      });

      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() => {
        result.current.tap();
      }).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should support Mozilla-prefixed API', () => {
      // @ts-expect-error - deleting for test
      delete navigator.vibrate;

      const mockMozVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'mozVibrate', {
        value: mockMozVibrate,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      expect(result.current.isSupported).toBe(true);

      act(() => {
        result.current.tap();
      });

      expect(mockMozVibrate).toHaveBeenCalled();
    });

    it.skip('should support WebKit-prefixed API', () => {
      // Remove standard vibrate to force fallback to webkit
      delete (navigator as typeof navigator & { vibrate?: unknown }).vibrate;

      // Verify vibrate is gone
      expect('vibrate' in navigator).toBe(false);

      const mockWebkitVibrate = vi.fn().mockReturnValue(true);

      // Use Object.defineProperty with enumerable to ensure 'in' operator works
      Object.defineProperty(navigator, 'webkitVibrate', {
        value: mockWebkitVibrate,
        writable: true,
        configurable: true,
        enumerable: true,
      });

      // Verify the property exists
      expect('webkitVibrate' in navigator).toBe(true);
      expect(
        typeof (navigator as typeof navigator & { webkitVibrate?: unknown }).webkitVibrate
      ).toBe('function');

      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      expect(result.current.isSupported).toBe(true);

      act(() => {
        result.current.tap();
      });

      expect(mockWebkitVibrate).toHaveBeenCalled();

      // Cleanup
      delete (navigator as typeof navigator & { webkitVibrate?: unknown }).webkitVibrate;
    });
  });

  describe('Settings Updates', () => {
    it('should respect updated settings', () => {
      const { result, rerender } = renderHook(({ settings }) => useHaptic(settings), {
        initialProps: {
          settings: { enabled: true, intensity: 1.0 },
        },
      });

      act(() => {
        result.current.tap();
      });

      expect(mockVibrate).toHaveBeenCalledTimes(1);
      mockVibrate.mockClear();

      // Update settings to disabled
      rerender({
        settings: { enabled: false, intensity: 1.0 },
      });

      act(() => {
        result.current.tap();
      });

      expect(mockVibrate).not.toHaveBeenCalled();
    });

    it('should apply new intensity immediately', () => {
      const { result, rerender } = renderHook(({ settings }) => useHaptic(settings), {
        initialProps: {
          settings: { enabled: true, intensity: 1.0 },
        },
      });

      act(() => {
        result.current.tap();
      });

      expect(mockVibrate).toHaveBeenCalledWith([10]);
      mockVibrate.mockClear();

      // Update intensity
      rerender({
        settings: { enabled: true, intensity: 0.5 },
      });

      act(() => {
        result.current.tap();
      });

      expect(mockVibrate).toHaveBeenCalledWith([5]);
    });
  });

  describe('Pattern Characteristics', () => {
    it('should have appropriate tap pattern duration', () => {
      expect(HAPTIC_PATTERNS.TAP).toEqual([10]);
      expect(HAPTIC_PATTERNS.TAP[0]).toBeLessThan(50);
    });

    it('should have multi-part success pattern', () => {
      expect(HAPTIC_PATTERNS.SUCCESS).toHaveLength(5);
    });

    it('should have distinct error pattern', () => {
      expect(HAPTIC_PATTERNS.ERROR).toEqual([200]);
      expect(HAPTIC_PATTERNS.ERROR[0]).toBeGreaterThan(HAPTIC_PATTERNS.TAP[0]);
    });

    it('should have celebratory achievement pattern', () => {
      expect(HAPTIC_PATTERNS.ACHIEVEMENT.length).toBeGreaterThan(5);
    });

    it('should have subtle selection pattern', () => {
      expect(HAPTIC_PATTERNS.SELECTION).toEqual([5]);
      expect(HAPTIC_PATTERNS.SELECTION[0]).toBeLessThan(HAPTIC_PATTERNS.TAP[0]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive haptic calls', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 1.0,
        })
      );

      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.tap();
        });
      }

      expect(mockVibrate).toHaveBeenCalledTimes(100);
    });

    it('should handle alternating enable/disable', () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => useHaptic({ enabled, intensity: 1.0 }),
        { initialProps: { enabled: true } }
      );

      for (let i = 0; i < 10; i++) {
        rerender({ enabled: i % 2 === 0 });

        act(() => {
          result.current.tap();
        });
      }

      expect(mockVibrate).toHaveBeenCalledTimes(5); // Only when enabled
    });

    it('should round intensity multiplied durations', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 0.33, // Will cause fractional results
        })
      );

      act(() => {
        result.current.tap();
      });

      const callArg = mockVibrate.mock.calls[0][0];
      expect(Number.isInteger(callArg[0])).toBe(true);
    });

    it('should handle intensity greater than 1.0', () => {
      const { result } = renderHook(() =>
        useHaptic({
          enabled: true,
          intensity: 2.0,
        })
      );

      act(() => {
        result.current.tap();
      });

      expect(mockVibrate).toHaveBeenCalledWith([20]); // 10 * 2.0
    });
  });
});
