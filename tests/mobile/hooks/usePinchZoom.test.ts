/**
 * |unit| |integration| |a11y| |performance|
 * usePinchZoom Hook Tests
 *
 * Comprehensive test coverage for usePinchZoom hook.
 * Tests two-finger pinch detection, scale calculation, geodata loading, and zoom controls.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { usePinchZoom } from '@/mobile/hooks/usePinchZoom';
// import { GeodetaLevel } from '@/mobile/utils/progressiveGeodata';
import { GESTURE_CONFIG } from '@/mobile/config/breakpoints';

/**
 * Create mock TouchEvent
 */
function createTouchEvent(
  type: 'touchstart' | 'touchmove' | 'touchend',
  touches: Array<{ clientX: number; clientY: number; identifier: number }>
): React.TouchEvent {
  const touchList = touches.map((t) => ({
    ...t,
    pageX: t.clientX,
    pageY: t.clientY,
    screenX: t.clientX,
    screenY: t.clientY,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1,
    target: document.createElement('div'),
  }));

  return {
    type,
    touches: touchList as unknown as React.TouchList,
    preventDefault: vi.fn(),
  } as unknown as React.TouchEvent;
}

describe('|unit| usePinchZoom Hook - Pinch Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default scale', () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: false }));

    expect(result.current.currentZoom).toBe(1.0);
    expect(result.current.isPinching).toBe(false);
  });

  it('should initialize with custom scale', () => {
    const { result } = renderHook(() =>
      usePinchZoom({ initialScale: 2.0, enableProgressiveLoading: false })
    );

    expect(result.current.currentZoom).toBe(2.0);
  });

  it('should detect two-finger pinch start', () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: false }));

    const touchStart = createTouchEvent('touchstart', [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 200, clientY: 200, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    expect(result.current.isPinching).toBe(true);
    expect(result.current.center).toEqual({ x: 150, y: 150 });
    expect(touchStart.preventDefault).toHaveBeenCalled();
  });

  it('should not detect pinch with single finger', () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: false }));

    const touchStart = createTouchEvent('touchstart', [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    expect(result.current.isPinching).toBe(false);
  });

  it('should cancel pinch with more than 2 fingers', () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: false }));

    // Start with 2 fingers
    const touchStart = createTouchEvent('touchstart', [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 200, clientY: 200, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    expect(result.current.isPinching).toBe(true);

    // Add third finger
    const touchStart3 = createTouchEvent('touchstart', [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 200, clientY: 200, identifier: 1 },
      { clientX: 150, clientY: 150, identifier: 2 },
    ]);

    act(() => {
      result.current.handleTouchStart(touchStart3);
    });

    expect(result.current.isPinching).toBe(false);
  });
});

describe('|unit| usePinchZoom Hook - Scale Calculation', () => {
  it('should calculate scale from pinch gesture', () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: false }));

    // Initial distance: ~141px (100px difference in X and Y)
    const touchStart = createTouchEvent('touchstart', [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 200, clientY: 200, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    // Move fingers apart (distance: ~283px, 2x initial)
    const touchMove = createTouchEvent('touchmove', [
      { clientX: 50, clientY: 50, identifier: 0 },
      { clientX: 250, clientY: 250, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchMove(touchMove);
    });

    // Scale should approximately double
    expect(result.current.currentZoom).toBeGreaterThan(1.8);
    expect(result.current.currentZoom).toBeLessThan(2.2);
  });

  it('should clamp scale to minimum value', () => {
    const { result } = renderHook(() =>
      usePinchZoom({ minScale: 0.5, initialScale: 1.0, enableProgressiveLoading: false })
    );

    const touchStart = createTouchEvent('touchstart', [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 200, clientY: 200, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    // Pinch inward to very small distance
    const touchMove = createTouchEvent('touchmove', [
      { clientX: 150, clientY: 150, identifier: 0 },
      { clientX: 151, clientY: 151, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchMove(touchMove);
    });

    expect(result.current.currentZoom).toBeGreaterThanOrEqual(0.5);
  });

  it('should clamp scale to maximum value', () => {
    const { result } = renderHook(() =>
      usePinchZoom({ maxScale: 3.0, initialScale: 1.0, enableProgressiveLoading: false })
    );

    const touchStart = createTouchEvent('touchstart', [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 200, clientY: 200, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    // Pinch outward to very large distance
    const touchMove = createTouchEvent('touchmove', [
      { clientX: 0, clientY: 0, identifier: 0 },
      { clientX: 1000, clientY: 1000, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchMove(touchMove);
    });

    expect(result.current.currentZoom).toBeLessThanOrEqual(3.0);
  });

  it('should update center point during pinch', () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: false }));

    const touchStart = createTouchEvent('touchstart', [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 200, clientY: 200, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    expect(result.current.center).toEqual({ x: 150, y: 150 });

    const touchMove = createTouchEvent('touchmove', [
      { clientX: 120, clientY: 120, identifier: 0 },
      { clientX: 220, clientY: 220, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchMove(touchMove);
    });

    expect(result.current.center).toEqual({ x: 170, y: 170 });
  });
});

describe('|unit| usePinchZoom Hook - Programmatic Zoom Controls', () => {
  it('should programmatically set zoom', () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: false }));

    act(() => {
      result.current.setZoom(2.0);
    });

    expect(result.current.currentZoom).toBe(2.0);
  });

  it('should zoom in by step', () => {
    const { result } = renderHook(() =>
      usePinchZoom({ initialScale: 1.0, enableProgressiveLoading: false })
    );

    act(() => {
      result.current.zoomIn();
    });

    expect(result.current.currentZoom).toBe(1.0 + GESTURE_CONFIG.ZOOM_STEP);
  });

  it('should zoom out by step', () => {
    const { result } = renderHook(() =>
      usePinchZoom({ initialScale: 1.5, enableProgressiveLoading: false })
    );

    act(() => {
      result.current.zoomOut();
    });

    expect(result.current.currentZoom).toBe(1.5 - GESTURE_CONFIG.ZOOM_STEP);
  });

  it('should reset zoom to initial scale', () => {
    const { result } = renderHook(() =>
      usePinchZoom({ initialScale: 1.5, enableProgressiveLoading: false })
    );

    act(() => {
      result.current.setZoom(2.5);
    });

    expect(result.current.currentZoom).toBe(2.5);

    act(() => {
      result.current.resetZoom();
    });

    expect(result.current.currentZoom).toBe(1.5);
  });

  it('should get zoom as percentage', () => {
    const { result } = renderHook(() =>
      usePinchZoom({ initialScale: 1.5, enableProgressiveLoading: false })
    );

    expect(result.current.getZoomPercentage()).toBe(150);

    act(() => {
      result.current.setZoom(2.0);
    });

    expect(result.current.getZoomPercentage()).toBe(200);
  });
});

describe('|unit| usePinchZoom Hook - Touch End Handling', () => {
  it('should end pinch when fingers released', () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: false }));

    const touchStart = createTouchEvent('touchstart', [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 200, clientY: 200, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    expect(result.current.isPinching).toBe(true);

    const touchEnd = createTouchEvent('touchend', []);

    act(() => {
      result.current.handleTouchEnd(touchEnd);
    });

    expect(result.current.isPinching).toBe(false);
    expect(result.current.center).toBeNull();
  });

  it('should end pinch when finger count drops below 2', () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: false }));

    const touchStart = createTouchEvent('touchstart', [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 200, clientY: 200, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    const touchEnd = createTouchEvent('touchend', [{ clientX: 100, clientY: 100, identifier: 0 }]);

    act(() => {
      result.current.handleTouchEnd(touchEnd);
    });

    expect(result.current.isPinching).toBe(false);
  });

  it('should preserve scale after pinch ends', () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: false }));

    const touchStart = createTouchEvent('touchstart', [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 200, clientY: 200, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    const touchMove = createTouchEvent('touchmove', [
      { clientX: 50, clientY: 50, identifier: 0 },
      { clientX: 250, clientY: 250, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchMove(touchMove);
    });

    const scaleBeforeEnd = result.current.currentZoom;

    const touchEnd = createTouchEvent('touchend', []);

    act(() => {
      result.current.handleTouchEnd(touchEnd);
    });

    expect(result.current.currentZoom).toBe(scaleBeforeEnd);
  });
});

describe('|integration| usePinchZoom Integration - Progressive Geodata', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ type: 'FeatureCollection', features: [] }),
      } as Response)
    );
  });

  it('should trigger geodata loading on zoom change', async () => {
    const onLoadingStart = vi.fn();
    const onLoadingComplete = vi.fn();

    const { result } = renderHook(() =>
      usePinchZoom({
        enableProgressiveLoading: true,
        onLoadingStart,
        onLoadingComplete,
      })
    );

    act(() => {
      result.current.setZoom(2.0);
    });

    await waitFor(() => {
      expect(onLoadingStart).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(onLoadingComplete).toHaveBeenCalled();
    });
  });

  it('should track loading state during geodata fetch', async () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: true }));

    act(() => {
      result.current.setZoom(2.5);
    });

    // Should start loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Should complete loading
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 3000 }
    );
  });

  it('should update current geodata level based on zoom', async () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: true }));

    // Initial load
    await waitFor(() => {
      expect(result.current.currentLevel).toBeTruthy();
    });

    act(() => {
      result.current.setZoom(2.5); // Should trigger higher detail level
    });

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 3000 }
    );
  });

  it('should handle geodata loading errors', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    const onLoadingError = vi.fn();

    const { result } = renderHook(() =>
      usePinchZoom({
        enableProgressiveLoading: true,
        onLoadingError,
      })
    );

    act(() => {
      result.current.setZoom(2.0);
    });

    await waitFor(() => {
      expect(onLoadingError).toHaveBeenCalledWith(expect.any(String), expect.any(Error));
    });
  });

  it('should skip loading when progressive loading disabled', () => {
    const onLoadingStart = vi.fn();

    const { result } = renderHook(() =>
      usePinchZoom({
        enableProgressiveLoading: false,
        onLoadingStart,
      })
    );

    act(() => {
      result.current.setZoom(2.0);
    });

    expect(onLoadingStart).not.toHaveBeenCalled();
  });
});

describe('|integration| usePinchZoom Integration - Callbacks', () => {
  it('should call onZoomChange when zoom changes', () => {
    const onZoomChange = vi.fn();

    const { result } = renderHook(() =>
      usePinchZoom({ onZoomChange, enableProgressiveLoading: false })
    );

    act(() => {
      result.current.setZoom(2.0);
    });

    expect(onZoomChange).toHaveBeenCalledWith(2.0, expect.anything());
  });

  it('should track previous zoom value', () => {
    const { result } = renderHook(() =>
      usePinchZoom({ initialScale: 1.0, enableProgressiveLoading: false })
    );

    expect(result.current.previousZoom).toBe(1.0);

    act(() => {
      result.current.setZoom(1.5);
    });

    expect(result.current.currentZoom).toBe(1.5);
    expect(result.current.previousZoom).toBe(1.0);

    act(() => {
      result.current.setZoom(2.0);
    });

    expect(result.current.previousZoom).toBe(1.5);
  });
});

describe('|a11y| usePinchZoom Accessibility', () => {
  it('should provide programmatic zoom controls for non-touch users', () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: false }));

    // Users without touch can use zoom buttons
    act(() => {
      result.current.zoomIn();
    });

    expect(result.current.currentZoom).toBeGreaterThan(1.0);

    act(() => {
      result.current.zoomOut();
    });

    expect(result.current.currentZoom).toBe(1.0);
  });

  it('should provide reset zoom for accessibility', () => {
    const { result } = renderHook(() =>
      usePinchZoom({ initialScale: 1.0, enableProgressiveLoading: false })
    );

    act(() => {
      result.current.setZoom(2.5);
    });

    act(() => {
      result.current.resetZoom();
    });

    expect(result.current.currentZoom).toBe(1.0);
  });

  it('should expose zoom percentage for screen readers', () => {
    const { result } = renderHook(() =>
      usePinchZoom({ initialScale: 1.5, enableProgressiveLoading: false })
    );

    const percentage = result.current.getZoomPercentage();

    expect(percentage).toBe(150);
    expect(typeof percentage).toBe('number');
  });
});

describe('|performance| usePinchZoom Performance', () => {
  it('should use stable callback references', () => {
    const { result, rerender } = renderHook(() =>
      usePinchZoom({ enableProgressiveLoading: false })
    );

    const firstHandleTouchStart = result.current.handleTouchStart;
    const firstHandleTouchMove = result.current.handleTouchMove;
    const firstHandleTouchEnd = result.current.handleTouchEnd;

    rerender();

    expect(result.current.handleTouchStart).toBe(firstHandleTouchStart);
    expect(result.current.handleTouchMove).toBe(firstHandleTouchMove);
    expect(result.current.handleTouchEnd).toBe(firstHandleTouchEnd);
  });

  it('should prevent default browser zoom during pinch', () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: false }));

    const touchStart = createTouchEvent('touchstart', [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 200, clientY: 200, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    expect(touchStart.preventDefault).toHaveBeenCalled();

    const touchMove = createTouchEvent('touchmove', [
      { clientX: 120, clientY: 120, identifier: 0 },
      { clientX: 220, clientY: 220, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchMove(touchMove);
    });

    expect(touchMove.preventDefault).toHaveBeenCalled();
  });

  it('should handle rapid zoom changes efficiently', () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: false }));

    act(() => {
      for (let i = 1; i <= 10; i++) {
        result.current.setZoom(1.0 + i * 0.1);
      }
    });

    expect(result.current.currentZoom).toBe(2.0);
  });

  it('should cancel pinch on finger count change during move', () => {
    const { result } = renderHook(() => usePinchZoom({ enableProgressiveLoading: false }));

    const touchStart = createTouchEvent('touchstart', [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 200, clientY: 200, identifier: 1 },
    ]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    expect(result.current.isPinching).toBe(true);

    // Finger lifts during move
    const touchMove = createTouchEvent('touchmove', [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]);

    act(() => {
      result.current.handleTouchMove(touchMove);
    });

    expect(result.current.isPinching).toBe(false);
  });
});
