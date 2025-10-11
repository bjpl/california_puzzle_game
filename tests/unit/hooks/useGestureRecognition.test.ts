import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useGestureRecognition,
  GestureType,
  GestureCallbacks,
} from '../../../src/hooks/useGestureRecognition';

describe('useGestureRecognition', () => {
  let callbacks: GestureCallbacks;

  beforeEach(() => {
    callbacks = {
      onPinch: vi.fn(),
      onRotate: vi.fn(),
      onPan: vi.fn(),
      onThreeFingerSwipe: vi.fn(),
      onDoubleTap: vi.fn(),
      onLongPress: vi.fn(),
      onGestureStart: vi.fn(),
      onGestureEnd: vi.fn(),
    };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default config', () => {
    const { result } = renderHook(() => useGestureRecognition());

    expect(result.current.gestureState.activeGesture).toBe(GestureType.NONE);
    expect(result.current.gestureState.touchCount).toBe(0);
  });

  it('should detect single touch as drag gesture', () => {
    const { result } = renderHook(() => useGestureRecognition(callbacks));

    const touchEvent = {
      touches: [{ identifier: 0, clientX: 100, clientY: 100 }],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchStart(touchEvent);
    });

    expect(callbacks.onGestureStart).toHaveBeenCalledWith(GestureType.DRAG);
  });

  it('should detect two-finger touch as pinch gesture', () => {
    const { result } = renderHook(() => useGestureRecognition(callbacks));

    const touchEvent = {
      touches: [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchStart(touchEvent);
    });

    expect(callbacks.onGestureStart).toHaveBeenCalledWith(GestureType.PINCH);
  });

  it('should trigger pinch callback when distance changes', () => {
    const { result } = renderHook(() =>
      useGestureRecognition(callbacks, { pinchThreshold: 0.01 })
    );

    // Start with two fingers
    const startEvent = {
      touches: [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchStart(startEvent);
    });

    // Move fingers further apart (pinch out / zoom in)
    const moveEvent = {
      touches: [
        { identifier: 0, clientX: 50, clientY: 100 },
        { identifier: 1, clientX: 250, clientY: 100 },
      ],
      preventDefault: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchMove(moveEvent);
    });

    expect(callbacks.onPinch).toHaveBeenCalled();
    expect(moveEvent.preventDefault).toHaveBeenCalled();
  });

  it('should trigger rotation callback when angle changes', () => {
    const { result } = renderHook(() =>
      useGestureRecognition(callbacks, { rotationThreshold: 1 })
    );

    // Start with two fingers horizontal
    const startEvent = {
      touches: [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchStart(startEvent);
    });

    // Rotate to diagonal
    const moveEvent = {
      touches: [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 150 },
      ],
      preventDefault: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchMove(moveEvent);
    });

    expect(callbacks.onRotate).toHaveBeenCalled();
  });

  it('should detect three-finger swipe', () => {
    const { result } = renderHook(() => useGestureRecognition(callbacks));

    const startEvent = {
      touches: [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 150, clientY: 100 },
        { identifier: 2, clientX: 200, clientY: 100 },
      ],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchStart(startEvent);
    });

    expect(callbacks.onGestureStart).toHaveBeenCalledWith(GestureType.THREE_FINGER_SWIPE);

    // Swipe left
    const moveEvent = {
      touches: [
        { identifier: 0, clientX: 40, clientY: 100 },
        { identifier: 1, clientX: 90, clientY: 100 },
        { identifier: 2, clientX: 140, clientY: 100 },
      ],
      preventDefault: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchMove(moveEvent);
    });

    expect(callbacks.onThreeFingerSwipe).toHaveBeenCalledWith('left');
  });

  it('should detect double-tap', () => {
    const { result } = renderHook(() =>
      useGestureRecognition(callbacks, { doubleTapDelay: 300 })
    );

    const touchEvent = {
      touches: [{ identifier: 0, clientX: 100, clientY: 100 }],
    } as unknown as React.TouchEvent;

    const endEvent = {
      touches: [],
    } as unknown as React.TouchEvent;

    // First tap
    act(() => {
      result.current.handlers.onTouchStart(touchEvent);
      result.current.handlers.onTouchEnd(endEvent);
    });

    // Advance time by 100ms (within double-tap delay)
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Second tap
    act(() => {
      result.current.handlers.onTouchStart(touchEvent);
      result.current.handlers.onTouchEnd(endEvent);
    });

    expect(callbacks.onDoubleTap).toHaveBeenCalledWith({ x: 100, y: 100 });
  });

  it('should not detect double-tap if taps are too far apart', () => {
    const { result } = renderHook(() =>
      useGestureRecognition(callbacks, { doubleTapDelay: 300 })
    );

    const touchEvent = {
      touches: [{ identifier: 0, clientX: 100, clientY: 100 }],
    } as unknown as React.TouchEvent;

    const endEvent = {
      touches: [],
    } as unknown as React.TouchEvent;

    // First tap
    act(() => {
      result.current.handlers.onTouchStart(touchEvent);
      result.current.handlers.onTouchEnd(endEvent);
    });

    // Advance time beyond double-tap delay
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Second tap
    act(() => {
      result.current.handlers.onTouchStart(touchEvent);
      result.current.handlers.onTouchEnd(endEvent);
    });

    expect(callbacks.onDoubleTap).not.toHaveBeenCalled();
  });

  it('should trigger long-press after delay', () => {
    const { result } = renderHook(() =>
      useGestureRecognition(callbacks, { longPressDelay: 500 })
    );

    const touchEvent = {
      touches: [{ identifier: 0, clientX: 100, clientY: 100 }],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchStart(touchEvent);
    });

    // Advance time to trigger long-press
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callbacks.onLongPress).toHaveBeenCalledWith({ x: 100, y: 100 });
  });

  it('should cancel long-press if finger moves', () => {
    const { result } = renderHook(() =>
      useGestureRecognition(callbacks, { longPressDelay: 500 })
    );

    const startEvent = {
      touches: [{ identifier: 0, clientX: 100, clientY: 100 }],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchStart(startEvent);
    });

    // Move finger before long-press triggers
    const moveEvent = {
      touches: [{ identifier: 0, clientX: 120, clientY: 120 }],
      preventDefault: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      vi.advanceTimersByTime(200);
      result.current.handlers.onTouchMove(moveEvent);
    });

    // Advance remaining time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callbacks.onLongPress).not.toHaveBeenCalled();
  });

  it('should respect min/max scale constraints', () => {
    const { result } = renderHook(() =>
      useGestureRecognition(callbacks, {
        minScale: 1,
        maxScale: 3,
        pinchThreshold: 0.01,
      })
    );

    const startEvent = {
      touches: [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchStart(startEvent);
    });

    // Try to zoom out below minimum (scale would be 0.5)
    const moveEvent = {
      touches: [
        { identifier: 0, clientX: 125, clientY: 100 },
        { identifier: 1, clientX: 175, clientY: 100 },
      ],
      preventDefault: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchMove(moveEvent);
    });

    // Should be clamped to minScale
    const pinchCalls = (callbacks.onPinch as ReturnType<typeof vi.fn>).mock.calls;
    if (pinchCalls.length > 0) {
      expect(pinchCalls[pinchCalls.length - 1][0]).toBeGreaterThanOrEqual(1);
    }
  });

  it('should update config dynamically', () => {
    const { result } = renderHook(() => useGestureRecognition(callbacks));

    act(() => {
      result.current.updateConfig({ enableRotation: false });
    });

    const startEvent = {
      touches: [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchStart(startEvent);
    });

    const moveEvent = {
      touches: [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 150 },
      ],
      preventDefault: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchMove(moveEvent);
    });

    // Rotation callback should not be called when disabled
    expect(callbacks.onRotate).not.toHaveBeenCalled();
  });

  it('should call onGestureEnd when all touches are released', () => {
    const { result } = renderHook(() => useGestureRecognition(callbacks));

    const startEvent = {
      touches: [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchStart(startEvent);
    });

    const endEvent = {
      touches: [],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchEnd(endEvent);
    });

    expect(callbacks.onGestureEnd).toHaveBeenCalledWith(GestureType.PINCH);
  });

  it('should handle touch cancel events', () => {
    const { result } = renderHook(() => useGestureRecognition(callbacks));

    const startEvent = {
      touches: [{ identifier: 0, clientX: 100, clientY: 100 }],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchStart(startEvent);
    });

    const cancelEvent = {
      touches: [],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchCancel(cancelEvent);
    });

    expect(result.current.gestureState.activeGesture).toBe(GestureType.NONE);
  });

  it('should prevent default on touch move to avoid scroll', () => {
    const { result } = renderHook(() => useGestureRecognition(callbacks));

    const startEvent = {
      touches: [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchStart(startEvent);
    });

    const moveEvent = {
      touches: [
        { identifier: 0, clientX: 110, clientY: 100 },
        { identifier: 1, clientX: 210, clientY: 100 },
      ],
      preventDefault: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.handlers.onTouchMove(moveEvent);
    });

    expect(moveEvent.preventDefault).toHaveBeenCalled();
  });
});
