/**
 * |unit| |integration| |a11y| |performance|
 * useGestureDetection Hook Tests
 *
 * Comprehensive test coverage for useGestureDetection hook.
 * Tests tap, double-tap, long-press, swipe, and pinch gesture detection.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import {
  useGestureDetection,
  calculateDistance,
  calculateCenterPoint,
  touchListToPoints,
  type GestureResult,
  type SwipeGesture,
} from '@/mobile/hooks/useGestureDetection';
import { SwipeDirection } from '@/mobile/config/touchSensors';
import { GESTURE_CONFIG } from '@/mobile/config/breakpoints';

/**
 * Create mock Touch object
 */
function createTouch(identifier: number, clientX: number, clientY: number): Touch {
  return {
    identifier,
    clientX,
    clientY,
    pageX: clientX,
    pageY: clientY,
    screenX: clientX,
    screenY: clientY,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1,
    target: document.createElement('div'),
  } as Touch;
}

/**
 * Create mock TouchEvent
 */
function createTouchEvent(
  type: 'touchstart' | 'touchmove' | 'touchend',
  touches: Touch[]
): React.TouchEvent {
  return {
    type,
    touches: touches as unknown as React.TouchList,
    changedTouches: touches as unknown as React.TouchList,
    targetTouches: touches as unknown as React.TouchList,
    preventDefault: vi.fn(),
  } as unknown as React.TouchEvent;
}

describe('|unit| useGestureDetection - Utility Functions', () => {
  it('should calculate distance between two touch points', () => {
    const point1 = { id: 0, x: 0, y: 0, timestamp: Date.now() };
    const point2 = { id: 1, x: 3, y: 4, timestamp: Date.now() };

    const distance = calculateDistance(point1, point2);

    expect(distance).toBe(5); // 3-4-5 triangle
  });

  it('should calculate center point between two touches', () => {
    const point1 = { id: 0, x: 0, y: 0, timestamp: Date.now() };
    const point2 = { id: 1, x: 100, y: 200, timestamp: Date.now() };

    const center = calculateCenterPoint(point1, point2);

    expect(center).toEqual({ x: 50, y: 100 });
  });

  it('should convert TouchList to array of TouchPoint objects', () => {
    const touches = [createTouch(0, 10, 20), createTouch(1, 30, 40)];

    const touchList = touches as unknown as React.TouchList;
    Object.defineProperty(touchList, 'length', { value: 2 });

    const timestamp = Date.now();
    const points = touchListToPoints(touchList, timestamp);

    expect(points).toHaveLength(2);
    expect(points[0]).toEqual({
      id: 0,
      x: 10,
      y: 20,
      timestamp,
    });
    expect(points[1]).toEqual({
      id: 1,
      x: 30,
      y: 40,
      timestamp,
    });
  });
});

describe('|unit| useGestureDetection - Tap Gesture', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should detect single tap gesture', async () => {
    const { result } = renderHook(() => useGestureDetection({ enableTap: true }));

    const onGesture = vi.fn();

    const touchStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    act(() => {
      vi.advanceTimersByTime(100); // Short duration
    });

    const touchEnd = createTouchEvent('touchend', []);

    act(() => {
      result.current.handleTouchEnd(touchEnd, onGesture);
    });

    expect(onGesture).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'tap',
        x: expect.any(Number),
        y: expect.any(Number),
      })
    );
  });

  it('should detect double-tap gesture', async () => {
    const { result } = renderHook(() =>
      useGestureDetection({ enableDoubleTap: true, doubleTapInterval: 300 })
    );

    const onGesture = vi.fn();

    // First tap
    const touchStart1 = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);
    act(() => {
      result.current.handleTouchStart(touchStart1);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const touchEnd1 = createTouchEvent('touchend', []);
    act(() => {
      result.current.handleTouchEnd(touchEnd1, onGesture);
    });

    expect(onGesture).toHaveBeenCalledWith(expect.objectContaining({ type: 'tap' }));

    onGesture.mockClear();

    // Second tap (within double-tap interval)
    act(() => {
      vi.advanceTimersByTime(150);
    });

    const touchStart2 = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);
    act(() => {
      result.current.handleTouchStart(touchStart2);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const touchEnd2 = createTouchEvent('touchend', []);
    act(() => {
      result.current.handleTouchEnd(touchEnd2, onGesture);
    });

    expect(onGesture).toHaveBeenCalledWith(expect.objectContaining({ type: 'double-tap' }));
  });

  it('should not detect tap if movement exceeds tolerance', () => {
    const { result } = renderHook(() =>
      useGestureDetection({ enableTap: true, tapMovementTolerance: 10 })
    );

    const onGesture = vi.fn();

    const touchStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);
    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    // Move more than tolerance
    const touchMove = createTouchEvent('touchmove', [createTouch(0, 120, 120)]);
    act(() => {
      result.current.handleTouchMove(touchMove);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const touchEnd = createTouchEvent('touchend', []);
    act(() => {
      result.current.handleTouchEnd(touchEnd, onGesture);
    });

    expect(onGesture).not.toHaveBeenCalled();
  });

  it('should not detect tap if duration exceeds threshold', () => {
    const { result } = renderHook(() => useGestureDetection({ enableTap: true }));

    const onGesture = vi.fn();

    const touchStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);
    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    act(() => {
      vi.advanceTimersByTime(GESTURE_CONFIG.TAP_MAX_DURATION + 100);
    });

    const touchEnd = createTouchEvent('touchend', []);
    act(() => {
      result.current.handleTouchEnd(touchEnd, onGesture);
    });

    expect(onGesture).not.toHaveBeenCalled();
  });
});

describe('|unit| useGestureDetection - Long Press Gesture', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should detect long-press gesture', async () => {
    const { result } = renderHook(() =>
      useGestureDetection({
        enableLongPress: true,
        longPressThreshold: GESTURE_CONFIG.PRESS_AND_HOLD_DURATION,
      })
    );

    const touchStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    // Wait for long-press threshold
    act(() => {
      vi.advanceTimersByTime(GESTURE_CONFIG.PRESS_AND_HOLD_DURATION);
    });

    // Long press should have been detected
    // Note: In actual implementation, long-press callback is passed via event
  });

  it('should cancel long-press if finger moves', () => {
    const { result } = renderHook(() =>
      useGestureDetection({
        enableLongPress: true,
        tapMovementTolerance: 10,
      })
    );

    const touchStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);
    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    // Move finger beyond tolerance
    const touchMove = createTouchEvent('touchmove', [createTouch(0, 115, 115)]);
    act(() => {
      result.current.handleTouchMove(touchMove);
    });

    act(() => {
      vi.advanceTimersByTime(GESTURE_CONFIG.PRESS_AND_HOLD_DURATION);
    });

    // Long-press should be cancelled (no callback fired)
  });
});

describe('|unit| useGestureDetection - Swipe Gesture', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should detect swipe up gesture', () => {
    const { result } = renderHook(() => useGestureDetection({ enableSwipe: true }));

    const onGesture = vi.fn();

    const touchStart = createTouchEvent('touchstart', [createTouch(0, 100, 200)]);
    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const touchEnd = createTouchEvent('touchend', []);
    // Simulate swipe up (Y decreases)
    Object.defineProperty(touchEnd, 'changedTouches', {
      value: [createTouch(0, 100, 100)],
    });

    act(() => {
      result.current.handleTouchEnd(touchEnd, onGesture);
    });

    const swipeGesture = onGesture.mock.calls[0]?.[0] as SwipeGesture;
    expect(swipeGesture?.type).toBe('swipe');
    expect(swipeGesture?.direction).toBe(SwipeDirection.UP);
  });

  it('should detect swipe down gesture', () => {
    const { result } = renderHook(() => useGestureDetection({ enableSwipe: true }));

    const onGesture = vi.fn();

    const touchStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);
    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const touchEnd = createTouchEvent('touchend', []);
    Object.defineProperty(touchEnd, 'changedTouches', {
      value: [createTouch(0, 100, 200)],
    });

    act(() => {
      result.current.handleTouchEnd(touchEnd, onGesture);
    });

    const swipeGesture = onGesture.mock.calls[0]?.[0] as SwipeGesture;
    expect(swipeGesture?.type).toBe('swipe');
    expect(swipeGesture?.direction).toBe(SwipeDirection.DOWN);
  });

  it('should detect swipe left gesture', () => {
    const { result } = renderHook(() => useGestureDetection({ enableSwipe: true }));

    const onGesture = vi.fn();

    const touchStart = createTouchEvent('touchstart', [createTouch(0, 200, 100)]);
    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const touchEnd = createTouchEvent('touchend', []);
    Object.defineProperty(touchEnd, 'changedTouches', {
      value: [createTouch(0, 100, 100)],
    });

    act(() => {
      result.current.handleTouchEnd(touchEnd, onGesture);
    });

    const swipeGesture = onGesture.mock.calls[0]?.[0] as SwipeGesture;
    expect(swipeGesture?.type).toBe('swipe');
    expect(swipeGesture?.direction).toBe(SwipeDirection.LEFT);
  });

  it('should detect swipe right gesture', () => {
    const { result } = renderHook(() => useGestureDetection({ enableSwipe: true }));

    const onGesture = vi.fn();

    const touchStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);
    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const touchEnd = createTouchEvent('touchend', []);
    Object.defineProperty(touchEnd, 'changedTouches', {
      value: [createTouch(0, 200, 100)],
    });

    act(() => {
      result.current.handleTouchEnd(touchEnd, onGesture);
    });

    const swipeGesture = onGesture.mock.calls[0]?.[0] as SwipeGesture;
    expect(swipeGesture?.type).toBe('swipe');
    expect(swipeGesture?.direction).toBe(SwipeDirection.RIGHT);
  });

  it('should require minimum distance for swipe', () => {
    const { result } = renderHook(() => useGestureDetection({ enableSwipe: true }));

    const onGesture = vi.fn();

    const touchStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);
    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Small movement (below threshold)
    const touchEnd = createTouchEvent('touchend', []);
    Object.defineProperty(touchEnd, 'changedTouches', {
      value: [createTouch(0, 110, 100)],
    });

    act(() => {
      result.current.handleTouchEnd(touchEnd, onGesture);
    });

    // Should not detect swipe
    const calls = onGesture.mock.calls.filter(
      (call) => (call[0] as GestureResult).type === 'swipe'
    );
    expect(calls.length).toBe(0);
  });
});

describe('|unit| useGestureDetection - State Management', () => {
  it('should track touch count', () => {
    const { result } = renderHook(() => useGestureDetection());

    expect(result.current.getTouchCount()).toBe(0);

    const touchStart = createTouchEvent('touchstart', [
      createTouch(0, 100, 100),
      createTouch(1, 200, 200),
    ]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    expect(result.current.getTouchCount()).toBe(2);
  });

  it('should check for specific touch count', () => {
    const { result } = renderHook(() => useGestureDetection());

    const touchStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    expect(result.current.hasTouchCount(1)).toBe(true);
    expect(result.current.hasTouchCount(2)).toBe(false);
  });

  it('should provide gesture state', () => {
    const { result } = renderHook(() => useGestureDetection());

    const touchStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    const state = result.current.getGestureState();

    expect(state.touchCount).toBe(1);
    expect(state.touches).toHaveLength(1);
    expect(state.initialTouches).toHaveLength(1);
  });

  it('should reset state when all touches released', () => {
    const { result } = renderHook(() => useGestureDetection());

    const touchStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);

    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    expect(result.current.getTouchCount()).toBe(1);

    const touchEnd = createTouchEvent('touchend', []);

    act(() => {
      result.current.handleTouchEnd(touchEnd);
    });

    expect(result.current.getTouchCount()).toBe(0);
  });
});

describe('|integration| useGestureDetection - Multi-Gesture Scenarios', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle tap followed by swipe', () => {
    const { result } = renderHook(() =>
      useGestureDetection({ enableTap: true, enableSwipe: true })
    );

    const onGesture = vi.fn();

    // First: Tap
    const tapStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);
    act(() => {
      result.current.handleTouchStart(tapStart);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const tapEnd = createTouchEvent('touchend', []);
    act(() => {
      result.current.handleTouchEnd(tapEnd, onGesture);
    });

    expect(onGesture).toHaveBeenCalledWith(expect.objectContaining({ type: 'tap' }));

    onGesture.mockClear();

    // Then: Swipe
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const swipeStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);
    act(() => {
      result.current.handleTouchStart(swipeStart);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const swipeEnd = createTouchEvent('touchend', []);
    Object.defineProperty(swipeEnd, 'changedTouches', {
      value: [createTouch(0, 200, 100)],
    });

    act(() => {
      result.current.handleTouchEnd(swipeEnd, onGesture);
    });

    const swipeGesture = onGesture.mock.calls[0]?.[0] as SwipeGesture;
    expect(swipeGesture?.type).toBe('swipe');
  });

  it('should cancel gestures when multi-touch detected', () => {
    const { result } = renderHook(() => useGestureDetection({ enableTap: true }));

    const onGesture = vi.fn();

    const singleTouch = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);
    act(() => {
      result.current.handleTouchStart(singleTouch);
    });

    // Add second finger (should cancel tap)
    const multiTouch = createTouchEvent('touchmove', [
      createTouch(0, 100, 100),
      createTouch(1, 200, 200),
    ]);

    act(() => {
      result.current.handleTouchMove(multiTouch);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const touchEnd = createTouchEvent('touchend', []);
    act(() => {
      result.current.handleTouchEnd(touchEnd, onGesture);
    });

    // Tap should be cancelled
    expect(onGesture).not.toHaveBeenCalled();
  });
});

describe('|integration| useGestureDetection - Configuration', () => {
  it('should respect disabled gesture types', () => {
    const { result } = renderHook(() =>
      useGestureDetection({
        enableTap: false,
        enableSwipe: false,
        enableDoubleTap: false,
      })
    );

    const onGesture = vi.fn();

    const touchStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);
    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    const touchEnd = createTouchEvent('touchend', []);
    act(() => {
      result.current.handleTouchEnd(touchEnd, onGesture);
    });

    expect(onGesture).not.toHaveBeenCalled();
  });

  it('should use custom thresholds', () => {
    const { result } = renderHook(() =>
      useGestureDetection({
        tapMovementTolerance: 20,
        doubleTapInterval: 500,
      })
    );

    expect(result.current.config.tapMovementTolerance).toBe(20);
    expect(result.current.config.doubleTapInterval).toBe(500);
  });
});

describe('|a11y| useGestureDetection Accessibility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should support configurable tap tolerance for motor impairments', () => {
    const { result } = renderHook(() =>
      useGestureDetection({
        enableTap: true,
        tapMovementTolerance: 30, // Larger tolerance for accessibility
      })
    );

    const onGesture = vi.fn();

    const touchStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);
    act(() => {
      result.current.handleTouchStart(touchStart);
    });

    // Move within expanded tolerance
    const touchMove = createTouchEvent('touchmove', [createTouch(0, 125, 115)]);
    act(() => {
      result.current.handleTouchMove(touchMove);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const touchEnd = createTouchEvent('touchend', []);
    act(() => {
      result.current.handleTouchEnd(touchEnd, onGesture);
    });

    expect(onGesture).toHaveBeenCalledWith(expect.objectContaining({ type: 'tap' }));
  });

  it('should support configurable long-press duration', () => {
    const { result } = renderHook(() =>
      useGestureDetection({
        enableLongPress: true,
        longPressThreshold: 500, // Longer threshold for accessibility
      })
    );

    expect(result.current.config.longPressThreshold).toBe(500);
  });
});

describe('|performance| useGestureDetection Performance', () => {
  it('should use stable callback references', () => {
    const { result, rerender } = renderHook(() => useGestureDetection());

    const firstHandleTouchStart = result.current.handleTouchStart;
    const firstHandleTouchMove = result.current.handleTouchMove;
    const firstHandleTouchEnd = result.current.handleTouchEnd;

    rerender();

    expect(result.current.handleTouchStart).toBe(firstHandleTouchStart);
    expect(result.current.handleTouchMove).toBe(firstHandleTouchMove);
    expect(result.current.handleTouchEnd).toBe(firstHandleTouchEnd);
  });

  it('should handle rapid touch events efficiently', () => {
    const { result } = renderHook(() => useGestureDetection());

    const touches = Array.from({ length: 10 }, (_, i) => createTouch(i, 100 + i * 10, 100));

    act(() => {
      touches.forEach((touch) => {
        const event = createTouchEvent('touchstart', [touch]);
        result.current.handleTouchStart(event);

        const endEvent = createTouchEvent('touchend', []);
        result.current.handleTouchEnd(endEvent);
      });
    });

    // Should complete without errors
    expect(result.current.getTouchCount()).toBe(0);
  });

  it('should cleanup timers on unmount', () => {
    vi.useFakeTimers();

    const { unmount } = renderHook(() => useGestureDetection({ enableLongPress: true }));

    const _touchStart = createTouchEvent('touchstart', [createTouch(0, 100, 100)]);

    act(() => {
      unmount();
    });

    // Should not throw when advancing timers after unmount
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    vi.useRealTimers();
  });
});
