/**
 * Unit Tests for usePinchZoom Hook
 *
 * Tests pinch-to-zoom functionality including scale calculations,
 * progressive geodata loading, and gesture coordination.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePinchZoom } from '../../../src/mobile/hooks/usePinchZoom';
import { GeodetaLevel } from '../../../src/mobile/utils/progressiveGeodata';

// Mock AdaptiveGeodataLoader
vi.mock('../../../src/mobile/utils/progressiveGeodata', () => ({
  GeodetaLevel: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    ULTRA: 'ultra',
  },
  AdaptiveGeodataLoader: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockResolvedValue({}),
    preloadNext: vi.fn().mockResolvedValue({}),
    getCurrentLevel: vi.fn().mockReturnValue('medium'),
    isLoading: vi.fn().mockReturnValue(false),
  })),
}));

// Mock touch event helpers
function createTouch(id: number, x: number, y: number): Touch {
  return {
    identifier: id,
    clientX: x,
    clientY: y,
    target: document.body,
    screenX: x,
    screenY: y,
    pageX: x,
    pageY: y,
    radiusX: 10,
    radiusY: 10,
    rotationAngle: 0,
    force: 1,
  } as Touch;
}

function createTouchList(...touches: Touch[]): TouchList {
  const list = touches as unknown as TouchList;
  Object.defineProperty(list, 'length', { value: touches.length });
  return list;
}

function createTouchEvent(
  type: 'touchstart' | 'touchmove' | 'touchend',
  touches: Touch[]
): TouchEvent {
  const event = new Event(type) as TouchEvent;
  Object.defineProperty(event, 'touches', { value: createTouchList(...touches) });
  Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
  return event;
}

describe('usePinchZoom', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const { result } = renderHook(() => usePinchZoom());

      expect(result.current.currentZoom).toBe(1.0);
      expect(result.current.previousZoom).toBe(1.0);
      expect(result.current.isPinching).toBe(false);
      expect(result.current.center).toBeNull();
    });

    it('should initialize with custom initial scale', () => {
      const { result } = renderHook(() =>
        usePinchZoom({
          initialScale: 1.5,
        })
      );

      expect(result.current.currentZoom).toBe(1.5);
    });

    it('should initialize with custom min/max scale', () => {
      const { result } = renderHook(() =>
        usePinchZoom({
          minScale: 0.5,
          maxScale: 4.0,
        })
      );

      expect(result.current.config.minScale).toBe(0.5);
      expect(result.current.config.maxScale).toBe(4.0);
    });

    it('should load initial geodata if progressive loading enabled', async () => {
      const { result } = renderHook(() =>
        usePinchZoom({
          enableProgressiveLoading: true,
        })
      );

      await waitFor(() => {
        expect(result.current.currentLevel).toBeDefined();
      });
    });
  });

  describe('Pinch Gesture Detection', () => {
    it('should detect two-finger pinch start', () => {
      const { result } = renderHook(() => usePinchZoom());

      const touch1 = createTouch(1, 100, 100);
      const touch2 = createTouch(2, 200, 200);
      const event = createTouchEvent('touchstart', [touch1, touch2]);

      act(() => {
        result.current.handleTouchStart(event);
      });

      expect(result.current.isPinching).toBe(true);
      expect(result.current.center).toEqual({ x: 150, y: 150 });
    });

    it('should not detect pinch with single finger', () => {
      const { result } = renderHook(() => usePinchZoom());

      const touch = createTouch(1, 100, 100);
      const event = createTouchEvent('touchstart', [touch]);

      act(() => {
        result.current.handleTouchStart(event);
      });

      expect(result.current.isPinching).toBe(false);
    });

    it('should cancel pinch with more than two fingers', () => {
      const { result } = renderHook(() => usePinchZoom());

      // Start pinch with two fingers
      const touch1 = createTouch(1, 100, 100);
      const touch2 = createTouch(2, 200, 200);
      const startEvent = createTouchEvent('touchstart', [touch1, touch2]);

      act(() => {
        result.current.handleTouchStart(startEvent);
      });

      expect(result.current.isPinching).toBe(true);

      // Add third finger
      const touch3 = createTouch(3, 150, 150);
      const moveEvent = createTouchEvent('touchstart', [touch1, touch2, touch3]);

      act(() => {
        result.current.handleTouchStart(moveEvent);
      });

      expect(result.current.isPinching).toBe(false);
    });

    it('should prevent default browser zoom behavior', () => {
      const { result } = renderHook(() => usePinchZoom());

      const touch1 = createTouch(1, 100, 100);
      const touch2 = createTouch(2, 200, 200);
      const event = createTouchEvent('touchstart', [touch1, touch2]);

      act(() => {
        result.current.handleTouchStart(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Zoom Scale Calculation', () => {
    it('should calculate zoom scale based on pinch distance', () => {
      const { result } = renderHook(() => usePinchZoom());

      // Start pinch (distance = ~141 pixels)
      const touch1 = createTouch(1, 100, 100);
      const touch2 = createTouch(2, 200, 200);
      const startEvent = createTouchEvent('touchstart', [touch1, touch2]);

      act(() => {
        result.current.handleTouchStart(startEvent);
      });

      const initialZoom = result.current.currentZoom;

      // Move fingers apart (distance = ~283 pixels, 2x initial)
      const moveTouchCloses1 = createTouch(1, 0, 0);
      const moveTouchClose2 = createTouch(2, 300, 300);
      const moveEvent = createTouchEvent('touchmove', [moveTouchCloses1, moveTouchClose2]);

      act(() => {
        result.current.handleTouchMove(moveEvent);
      });

      // Zoom should have increased (approximately doubled)
      expect(result.current.currentZoom).toBeGreaterThan(initialZoom);
    });

    it('should zoom in when fingers move apart', () => {
      const { result } = renderHook(() => usePinchZoom());

      // Start pinch
      const touch1 = createTouch(1, 150, 150);
      const touch2 = createTouch(2, 200, 200);
      const startEvent = createTouchEvent('touchstart', [touch1, touch2]);

      act(() => {
        result.current.handleTouchStart(startEvent);
      });

      const initialZoom = result.current.currentZoom;

      // Move fingers further apart
      const moveTouch1 = createTouch(1, 100, 100);
      const moveTouch2 = createTouch(2, 250, 250);
      const moveEvent = createTouchEvent('touchmove', [moveTouch1, moveTouch2]);

      act(() => {
        result.current.handleTouchMove(moveEvent);
      });

      expect(result.current.currentZoom).toBeGreaterThan(initialZoom);
    });

    it('should zoom out when fingers move together', () => {
      const { result } = renderHook(() =>
        usePinchZoom({
          initialScale: 2.0,
        })
      );

      // Start pinch
      const touch1 = createTouch(1, 100, 100);
      const touch2 = createTouch(2, 300, 300);
      const startEvent = createTouchEvent('touchstart', [touch1, touch2]);

      act(() => {
        result.current.handleTouchStart(startEvent);
      });

      const initialZoom = result.current.currentZoom;

      // Move fingers closer together
      const moveTouch1 = createTouch(1, 150, 150);
      const moveTouch2 = createTouch(2, 250, 250);
      const moveEvent = createTouchEvent('touchmove', [moveTouch1, moveTouch2]);

      act(() => {
        result.current.handleTouchMove(moveEvent);
      });

      expect(result.current.currentZoom).toBeLessThan(initialZoom);
    });
  });

  describe('Scale Constraints', () => {
    it('should clamp zoom to minimum scale', () => {
      const { result } = renderHook(() =>
        usePinchZoom({
          minScale: 0.5,
          initialScale: 1.0,
        })
      );

      act(() => {
        result.current.setZoom(0.1); // Below minimum
      });

      expect(result.current.currentZoom).toBe(0.5);
    });

    it('should clamp zoom to maximum scale', () => {
      const { result } = renderHook(() =>
        usePinchZoom({
          maxScale: 3.0,
          initialScale: 1.0,
        })
      );

      act(() => {
        result.current.setZoom(5.0); // Above maximum
      });

      expect(result.current.currentZoom).toBe(3.0);
    });

    it('should handle scale changes during pinch within bounds', () => {
      const { result } = renderHook(() =>
        usePinchZoom({
          minScale: 0.5,
          maxScale: 3.0,
        })
      );

      // Start pinch
      const touch1 = createTouch(1, 150, 150);
      const touch2 = createTouch(2, 160, 160);
      const startEvent = createTouchEvent('touchstart', [touch1, touch2]);

      act(() => {
        result.current.handleTouchStart(startEvent);
      });

      // Try to zoom way in
      const moveTouch1 = createTouch(1, 0, 0);
      const moveTouch2 = createTouch(2, 400, 400);
      const moveEvent = createTouchEvent('touchmove', [moveTouch1, moveTouch2]);

      act(() => {
        result.current.handleTouchMove(moveEvent);
      });

      expect(result.current.currentZoom).toBeLessThanOrEqual(3.0);
      expect(result.current.currentZoom).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('Pinch Center Tracking', () => {
    it('should track center point during pinch', () => {
      const { result } = renderHook(() => usePinchZoom());

      const touch1 = createTouch(1, 100, 100);
      const touch2 = createTouch(2, 200, 200);
      const event = createTouchEvent('touchstart', [touch1, touch2]);

      act(() => {
        result.current.handleTouchStart(event);
      });

      expect(result.current.center).toEqual({ x: 150, y: 150 });
    });

    it('should update center point during pinch movement', () => {
      const { result } = renderHook(() => usePinchZoom());

      // Start pinch
      const touch1 = createTouch(1, 100, 100);
      const touch2 = createTouch(2, 200, 200);
      const startEvent = createTouchEvent('touchstart', [touch1, touch2]);

      act(() => {
        result.current.handleTouchStart(startEvent);
      });

      // Move fingers (maintaining pinch)
      const moveTouch1 = createTouch(1, 150, 150);
      const moveTouch2 = createTouch(2, 250, 250);
      const moveEvent = createTouchEvent('touchmove', [moveTouch1, moveTouch2]);

      act(() => {
        result.current.handleTouchMove(moveEvent);
      });

      expect(result.current.center).toEqual({ x: 200, y: 200 });
    });

    it('should clear center when pinch ends', () => {
      const { result } = renderHook(() => usePinchZoom());

      // Start pinch
      const touch1 = createTouch(1, 100, 100);
      const touch2 = createTouch(2, 200, 200);
      const startEvent = createTouchEvent('touchstart', [touch1, touch2]);

      act(() => {
        result.current.handleTouchStart(startEvent);
      });

      expect(result.current.center).not.toBeNull();

      // End pinch
      const endEvent = createTouchEvent('touchend', []);

      act(() => {
        result.current.handleTouchEnd(endEvent);
      });

      expect(result.current.center).toBeNull();
    });
  });

  describe('Touch End Handling', () => {
    it('should end pinch when fingers are released', () => {
      const { result } = renderHook(() => usePinchZoom());

      // Start pinch
      const touch1 = createTouch(1, 100, 100);
      const touch2 = createTouch(2, 200, 200);
      const startEvent = createTouchEvent('touchstart', [touch1, touch2]);

      act(() => {
        result.current.handleTouchStart(startEvent);
      });

      expect(result.current.isPinching).toBe(true);

      // Release fingers
      const endEvent = createTouchEvent('touchend', []);

      act(() => {
        result.current.handleTouchEnd(endEvent);
      });

      expect(result.current.isPinching).toBe(false);
    });

    it('should end pinch when one finger is released', () => {
      const { result } = renderHook(() => usePinchZoom());

      // Start pinch
      const touch1 = createTouch(1, 100, 100);
      const touch2 = createTouch(2, 200, 200);
      const startEvent = createTouchEvent('touchstart', [touch1, touch2]);

      act(() => {
        result.current.handleTouchStart(startEvent);
      });

      expect(result.current.isPinching).toBe(true);

      // Release one finger
      const endEvent = createTouchEvent('touchend', [touch1]);

      act(() => {
        result.current.handleTouchEnd(endEvent);
      });

      expect(result.current.isPinching).toBe(false);
    });

    it('should maintain zoom scale after pinch ends', () => {
      const { result } = renderHook(() => usePinchZoom());

      // Start pinch and zoom
      const touch1 = createTouch(1, 150, 150);
      const touch2 = createTouch(2, 160, 160);
      const startEvent = createTouchEvent('touchstart', [touch1, touch2]);

      act(() => {
        result.current.handleTouchStart(startEvent);
      });

      const moveTouch1 = createTouch(1, 100, 100);
      const moveTouch2 = createTouch(2, 200, 200);
      const moveEvent = createTouchEvent('touchmove', [moveTouch1, moveTouch2]);

      act(() => {
        result.current.handleTouchMove(moveEvent);
      });

      const zoomAfterPinch = result.current.currentZoom;

      // End pinch
      const endEvent = createTouchEvent('touchend', []);

      act(() => {
        result.current.handleTouchEnd(endEvent);
      });

      expect(result.current.currentZoom).toBe(zoomAfterPinch);
    });
  });

  describe('Programmatic Zoom Controls', () => {
    it('should set zoom programmatically', () => {
      const { result } = renderHook(() => usePinchZoom());

      act(() => {
        result.current.setZoom(2.0);
      });

      expect(result.current.currentZoom).toBe(2.0);
    });

    it('should zoom in by step', () => {
      const { result } = renderHook(() =>
        usePinchZoom({
          initialScale: 1.0,
        })
      );

      const initialZoom = result.current.currentZoom;

      act(() => {
        result.current.zoomIn();
      });

      expect(result.current.currentZoom).toBeGreaterThan(initialZoom);
    });

    it('should zoom out by step', () => {
      const { result } = renderHook(() =>
        usePinchZoom({
          initialScale: 2.0,
        })
      );

      const initialZoom = result.current.currentZoom;

      act(() => {
        result.current.zoomOut();
      });

      expect(result.current.currentZoom).toBeLessThan(initialZoom);
    });

    it('should reset zoom to initial scale', () => {
      const { result } = renderHook(() =>
        usePinchZoom({
          initialScale: 1.5,
        })
      );

      act(() => {
        result.current.setZoom(3.0);
      });

      expect(result.current.currentZoom).toBe(3.0);

      act(() => {
        result.current.resetZoom();
      });

      expect(result.current.currentZoom).toBe(1.5);
    });

    it('should get zoom percentage correctly', () => {
      const { result } = renderHook(() => usePinchZoom());

      act(() => {
        result.current.setZoom(1.5);
      });

      expect(result.current.getZoomPercentage()).toBe(150);

      act(() => {
        result.current.setZoom(0.5);
      });

      expect(result.current.getZoomPercentage()).toBe(50);
    });
  });

  describe('Callbacks', () => {
    it('should call onZoomChange when zoom changes', () => {
      const onZoomChange = vi.fn();
      const { result } = renderHook(() =>
        usePinchZoom({
          onZoomChange,
        })
      );

      act(() => {
        result.current.setZoom(2.0);
      });

      expect(onZoomChange).toHaveBeenCalledWith(2.0, expect.any(String));
    });

    it('should call onLoadingStart when geodata loading begins', async () => {
      const onLoadingStart = vi.fn();
      renderHook(() =>
        usePinchZoom({
          enableProgressiveLoading: true,
          onLoadingStart,
        })
      );

      await waitFor(() => {
        expect(onLoadingStart).toHaveBeenCalled();
      });
    });

    it('should call onLoadingComplete when geodata loading finishes', async () => {
      const onLoadingComplete = vi.fn();
      renderHook(() =>
        usePinchZoom({
          enableProgressiveLoading: true,
          onLoadingComplete,
        })
      );

      await waitFor(() => {
        expect(onLoadingComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Progressive Geodata Loading', () => {
    it('should show loading state during geodata fetch', async () => {
      const { result } = renderHook(() =>
        usePinchZoom({
          enableProgressiveLoading: true,
        })
      );

      // Trigger zoom change to load new geodata
      act(() => {
        result.current.setZoom(2.0);
      });

      // Should eventually complete loading
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );
    });

    it('should update loading progress during fetch', async () => {
      const { result } = renderHook(() =>
        usePinchZoom({
          enableProgressiveLoading: true,
        })
      );

      act(() => {
        result.current.setZoom(2.5);
      });

      await waitFor(() => {
        expect(result.current.loadingProgress).toBeGreaterThanOrEqual(0);
      });
    });

    it('should not load geodata when progressive loading disabled', () => {
      const { result } = renderHook(() =>
        usePinchZoom({
          enableProgressiveLoading: false,
        })
      );

      act(() => {
        result.current.setZoom(2.0);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle finger count changes during pinch', () => {
      const { result } = renderHook(() => usePinchZoom());

      // Start pinch
      const touch1 = createTouch(1, 100, 100);
      const touch2 = createTouch(2, 200, 200);
      const startEvent = createTouchEvent('touchstart', [touch1, touch2]);

      act(() => {
        result.current.handleTouchStart(startEvent);
      });

      expect(result.current.isPinching).toBe(true);

      // Remove one finger during pinch
      const moveEvent = createTouchEvent('touchmove', [touch1]);

      act(() => {
        result.current.handleTouchMove(moveEvent);
      });

      expect(result.current.isPinching).toBe(false);
    });

    it('should handle rapid zoom changes', () => {
      const { result } = renderHook(() => usePinchZoom());

      for (let i = 1; i <= 10; i++) {
        act(() => {
          result.current.setZoom(i / 5);
        });
      }

      // Should handle without crashing
      expect(result.current.currentZoom).toBeGreaterThan(0);
    });

    it('should handle concurrent pinch gestures gracefully', () => {
      const { result } = renderHook(() => usePinchZoom());

      // Start first pinch
      const touch1 = createTouch(1, 100, 100);
      const touch2 = createTouch(2, 200, 200);
      const event1 = createTouchEvent('touchstart', [touch1, touch2]);

      act(() => {
        result.current.handleTouchStart(event1);
      });

      // Try to start another pinch without ending first
      const touch3 = createTouch(3, 300, 300);
      const touch4 = createTouch(4, 400, 400);
      const event2 = createTouchEvent('touchstart', [touch3, touch4]);

      act(() => {
        result.current.handleTouchStart(event2);
      });

      // Should maintain valid state
      expect(result.current.currentZoom).toBeGreaterThan(0);
    });

    it('should track previous zoom correctly', () => {
      const { result } = renderHook(() => usePinchZoom());

      act(() => {
        result.current.setZoom(1.5);
      });

      expect(result.current.previousZoom).toBe(1.0);

      act(() => {
        result.current.setZoom(2.0);
      });

      expect(result.current.previousZoom).toBe(1.5);
      expect(result.current.currentZoom).toBe(2.0);
    });
  });
});
