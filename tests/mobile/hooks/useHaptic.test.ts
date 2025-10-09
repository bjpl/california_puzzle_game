/**
 * |unit| |integration| |a11y| |performance|
 * useHaptic Hook Tests
 *
 * Comprehensive test coverage for useHaptic hook and haptic feedback system.
 * Tests all 8 haptic patterns, intensity multiplier, enable/disable, and API support.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useHaptic, HAPTIC_PATTERNS } from '@/mobile/hooks/useHaptic';

describe('|unit| useHaptic Hook - Pattern Tests', () => {
  beforeEach(() => {
    // Mock navigator.vibrate
    navigator.vibrate = vi.fn(() => true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should support tap pattern (10ms)', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      result.current.tap();
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.TAP);
  });

  it('should support success pattern (50ms, 100ms, 50ms)', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      result.current.success();
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.SUCCESS);
  });

  it('should support error pattern (200ms)', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      result.current.error();
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.ERROR);
  });

  it('should support warning pattern (100ms, 50ms, 100ms)', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      result.current.warning();
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.WARNING);
  });

  it('should support achievement pattern', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      result.current.achievement();
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.ACHIEVEMENT);
  });

  it('should support drag start pattern (15ms)', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      result.current.dragStart();
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.DRAG_START);
  });

  it('should support snap pattern (20ms)', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      result.current.snap();
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.SNAP);
  });

  it('should support selection pattern (5ms)', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      result.current.selection();
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.SELECTION);
  });
});

describe('|unit| useHaptic Hook - Intensity Multiplier', () => {
  beforeEach(() => {
    navigator.vibrate = vi.fn(() => true);
  });

  it('should apply 0.5x intensity multiplier', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 0.5 }));

    act(() => {
      result.current.tap(); // 10ms * 0.5 = 5ms
    });

    expect(navigator.vibrate).toHaveBeenCalledWith([5]);
  });

  it('should apply 1.0x intensity multiplier (normal)', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      result.current.error(); // 200ms * 1.0 = 200ms
    });

    expect(navigator.vibrate).toHaveBeenCalledWith([200]);
  });

  it('should apply 1.5x intensity multiplier', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.5 }));

    act(() => {
      result.current.error(); // 200ms * 1.5 = 300ms
    });

    expect(navigator.vibrate).toHaveBeenCalledWith([300]);
  });

  it('should apply intensity to pattern arrays', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 0.5 }));

    act(() => {
      result.current.success(); // [50, 50, 100, 50, 50] * 0.5 = [25, 25, 50, 25, 25]
    });

    expect(navigator.vibrate).toHaveBeenCalledWith([25, 25, 50, 25, 25]);
  });

  it('should round intensity-adjusted values', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 0.7 }));

    act(() => {
      result.current.tap(); // 10ms * 0.7 = 7ms (rounded)
    });

    expect(navigator.vibrate).toHaveBeenCalledWith([7]);
  });
});

describe('|unit| useHaptic Hook - Enable/Disable', () => {
  beforeEach(() => {
    navigator.vibrate = vi.fn(() => true);
  });

  it('should not vibrate when disabled', () => {
    const { result } = renderHook(() => useHaptic({ enabled: false, intensity: 1.0 }));

    act(() => {
      result.current.tap();
      result.current.success();
      result.current.error();
    });

    expect(navigator.vibrate).not.toHaveBeenCalled();
  });

  it('should vibrate when enabled', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      result.current.tap();
    });

    expect(navigator.vibrate).toHaveBeenCalledTimes(1);
  });

  it('should use default settings (enabled: true, intensity: 1.0)', () => {
    const { result } = renderHook(() => useHaptic());

    act(() => {
      result.current.tap();
    });

    expect(navigator.vibrate).toHaveBeenCalledWith([10]);
  });

  it('should update settings dynamically', () => {
    const { result, rerender } = renderHook(({ settings }) => useHaptic(settings), {
      initialProps: { settings: { enabled: true, intensity: 1.0 } },
    });

    act(() => {
      result.current.tap();
    });

    expect(navigator.vibrate).toHaveBeenCalledTimes(1);

    // Update to disabled
    rerender({ settings: { enabled: false, intensity: 1.0 } });

    act(() => {
      result.current.tap();
    });

    // Should still be called only once (second call was disabled)
    expect(navigator.vibrate).toHaveBeenCalledTimes(1);
  });
});

describe('|unit| useHaptic Hook - Custom Patterns', () => {
  beforeEach(() => {
    navigator.vibrate = vi.fn(() => true);
  });

  it('should support custom single vibration', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      result.current.custom(50);
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(50);
  });

  it('should support custom pattern array', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    const customPattern = [100, 50, 100, 50, 200];

    act(() => {
      result.current.custom(customPattern);
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(customPattern);
  });

  it('should apply intensity to custom patterns', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 0.5 }));

    act(() => {
      result.current.custom([100, 50, 100]); // * 0.5 = [50, 25, 50]
    });

    expect(navigator.vibrate).toHaveBeenCalledWith([50, 25, 50]);
  });
});

describe('|unit| useHaptic Hook - Cancel Vibrations', () => {
  beforeEach(() => {
    navigator.vibrate = vi.fn(() => true);
  });

  it('should cancel all vibrations', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      result.current.cancel();
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(0);
  });

  it('should cancel even when disabled', () => {
    const { result } = renderHook(() => useHaptic({ enabled: false, intensity: 1.0 }));

    act(() => {
      result.current.cancel();
    });

    // Cancel should work regardless of enabled state
    expect(navigator.vibrate).toHaveBeenCalledWith(0);
  });
});

describe('|unit| useHaptic Hook - API Support Detection', () => {
  it('should detect standard vibrate API', () => {
    navigator.vibrate = vi.fn(() => true);

    const { result } = renderHook(() => useHaptic());

    expect(result.current.isSupported).toBe(true);
  });

  it('should detect mozVibrate API', () => {
    // @ts-expect-error - Testing vendor-prefixed API
    delete navigator.vibrate;
    // @ts-expect-error - Testing vendor-prefixed API
    navigator.mozVibrate = vi.fn(() => true);

    const { result } = renderHook(() => useHaptic());

    expect(result.current.isSupported).toBe(true);
  });

  it('should detect webkitVibrate API', () => {
    // @ts-expect-error - Testing vendor-prefixed API
    delete navigator.vibrate;
    // @ts-expect-error - Testing vendor-prefixed API
    navigator.webkitVibrate = vi.fn(() => true);

    const { result } = renderHook(() => useHaptic());

    expect(result.current.isSupported).toBe(true);
  });

  it('should return false when no vibrate API is available', () => {
    // @ts-expect-error - Testing unsupported environment
    delete navigator.vibrate;

    const { result } = renderHook(() => useHaptic());

    expect(result.current.isSupported).toBe(false);
  });
});

describe('|integration| useHaptic Integration', () => {
  beforeEach(() => {
    navigator.vibrate = vi.fn(() => true);
  });

  it('should handle game interaction workflow', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    // User selects county
    act(() => {
      result.current.selection();
    });

    // User starts dragging
    act(() => {
      result.current.dragStart();
    });

    // County snaps to correct position
    act(() => {
      result.current.snap();
    });

    // Correct placement confirmed
    act(() => {
      result.current.success();
    });

    expect(navigator.vibrate).toHaveBeenCalledTimes(4);
  });

  it('should handle error and retry workflow', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    // Incorrect placement
    act(() => {
      result.current.error();
    });

    // User tries again
    act(() => {
      result.current.tap();
    });

    // Correct this time
    act(() => {
      result.current.success();
    });

    expect(navigator.vibrate).toHaveBeenCalledTimes(3);
  });

  it('should use vendor-prefixed APIs as fallback', () => {
    // @ts-expect-error - Testing fallback
    delete navigator.vibrate;
    // @ts-expect-error - Testing fallback
    navigator.mozVibrate = vi.fn(() => true);

    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      result.current.tap();
    });

    // @ts-expect-error - Testing fallback
    expect(navigator.mozVibrate).toHaveBeenCalledWith([10]);
  });

  it('should handle vibrate API errors gracefully', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    navigator.vibrate = vi.fn(() => {
      throw new Error('Vibration API error');
    });

    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      result.current.tap();
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith('Haptic feedback failed:', expect.any(Error));

    consoleWarnSpy.mockRestore();
  });
});

describe('|a11y| useHaptic Accessibility', () => {
  beforeEach(() => {
    navigator.vibrate = vi.fn(() => true);
  });

  it('should allow users to disable haptic feedback', () => {
    const { result } = renderHook(() => useHaptic({ enabled: false, intensity: 1.0 }));

    act(() => {
      result.current.tap();
      result.current.success();
      result.current.error();
    });

    expect(navigator.vibrate).not.toHaveBeenCalled();
  });

  it('should allow users to reduce haptic intensity', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 0.3 }));

    act(() => {
      result.current.error(); // 200ms * 0.3 = 60ms (reduced)
    });

    expect(navigator.vibrate).toHaveBeenCalledWith([60]);
  });

  it('should provide distinct patterns for different feedback types', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      result.current.success();
    });

    const successCall = (navigator.vibrate as ReturnType<typeof vi.fn>).mock.calls[0][0];

    act(() => {
      result.current.error();
    });

    const errorCall = (navigator.vibrate as ReturnType<typeof vi.fn>).mock.calls[1][0];

    // Success and error should have distinct patterns
    expect(successCall).not.toEqual(errorCall);
  });

  it('should handle unsupported devices gracefully', () => {
    // @ts-expect-error - Testing unsupported environment
    delete navigator.vibrate;

    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    expect(result.current.isSupported).toBe(false);

    // Should not throw errors
    act(() => {
      result.current.tap();
      result.current.success();
      result.current.error();
    });
  });
});

describe('|performance| useHaptic Performance', () => {
  beforeEach(() => {
    navigator.vibrate = vi.fn(() => true);
  });

  it('should use stable callback references', () => {
    const { result, rerender } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    const firstTap = result.current.tap;
    const firstSuccess = result.current.success;

    rerender();

    expect(result.current.tap).toBe(firstTap);
    expect(result.current.success).toBe(firstSuccess);
  });

  it('should handle rapid successive calls efficiently', () => {
    const { result } = renderHook(() => useHaptic({ enabled: true, intensity: 1.0 }));

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.tap();
      }
    });

    expect(navigator.vibrate).toHaveBeenCalledTimes(10);
  });

  it('should minimize overhead for disabled haptics', () => {
    const { result } = renderHook(() => useHaptic({ enabled: false, intensity: 1.0 }));

    act(() => {
      for (let i = 0; i < 100; i++) {
        result.current.tap();
      }
    });

    expect(navigator.vibrate).not.toHaveBeenCalled();
  });

  it('should update settings ref without recreating callbacks', () => {
    const { result, rerender } = renderHook(({ settings }) => useHaptic(settings), {
      initialProps: { settings: { enabled: true, intensity: 1.0 } },
    });

    const originalTap = result.current.tap;

    // Update intensity
    rerender({ settings: { enabled: true, intensity: 1.5 } });

    // Callback reference should remain stable
    expect(result.current.tap).toBe(originalTap);

    // But should use new settings
    act(() => {
      result.current.tap();
    });

    expect(navigator.vibrate).toHaveBeenCalledWith([15]); // 10ms * 1.5
  });
});
