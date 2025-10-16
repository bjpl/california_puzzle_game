/**
 * useGestureDetection Hook
 *
 * General-purpose gesture detection utilities for mobile touch interactions.
 * Provides helpers for detecting common gestures like tap, swipe, and multi-touch.
 *
 * @see docs/MOBILE_PRD.md - Mobile Phase 2: Advanced Touch Gestures
 * @see src/mobile/config/touchSensors.ts - Touch sensor configuration
 */

import { useCallback, useRef } from 'react';
import { GESTURE_CONFIG } from '../config/breakpoints';
import {
  calculateDragVelocity,
  isSwipeGesture,
  getSwipeDirection,
  SwipeDirection,
  getTouchCoordinates,
} from '../config/touchSensors';

/**
 * Touch point interface for tracking finger positions
 */
export interface TouchPoint {
  /** Unique identifier for this touch */
  id: number;
  /** X coordinate in viewport */
  x: number;
  /** Y coordinate in viewport */
  y: number;
  /** Timestamp when touch started */
  timestamp: number;
}

/**
 * Gesture state interface
 */
export interface GestureState {
  /** Touch points currently active */
  touches: TouchPoint[];
  /** Number of active touches */
  touchCount: number;
  /** Start time of current gesture */
  startTime: number;
  /** Initial touch positions */
  initialTouches: TouchPoint[];
  /** Whether multi-touch was detected during this gesture */
  hadMultiTouch: boolean;
}

/**
 * Tap gesture result
 */
export interface TapGesture {
  /** Type of gesture */
  type: 'tap' | 'double-tap' | 'long-press';
  /** X coordinate of tap */
  x: number;
  /** Y coordinate of tap */
  y: number;
  /** Duration of tap in ms */
  duration: number;
}

/**
 * Swipe gesture result
 */
export interface SwipeGesture {
  /** Type of gesture */
  type: 'swipe';
  /** Direction of swipe */
  direction: SwipeDirection;
  /** Distance of swipe in px */
  distance: number;
  /** Velocity of swipe in px/ms */
  velocity: number;
  /** Start coordinates */
  start: { x: number; y: number };
  /** End coordinates */
  end: { x: number; y: number };
}

/**
 * Pinch gesture result
 */
export interface PinchGesture {
  /** Type of gesture */
  type: 'pinch';
  /** Scale factor (1.0 = no change) */
  scale: number;
  /** Center point of pinch */
  center: { x: number; y: number };
  /** Initial distance between fingers */
  initialDistance: number;
  /** Current distance between fingers */
  currentDistance: number;
}

/**
 * Union type of all gesture results
 */
export type GestureResult = TapGesture | SwipeGesture | PinchGesture;

/**
 * Configuration options for gesture detection
 */
export interface GestureDetectionConfig {
  /** Enable tap detection */
  enableTap?: boolean;
  /** Enable double-tap detection */
  enableDoubleTap?: boolean;
  /** Enable long-press detection */
  enableLongPress?: boolean;
  /** Enable swipe detection */
  enableSwipe?: boolean;
  /** Enable pinch detection */
  enablePinch?: boolean;
  /** Double-tap max interval (ms) */
  doubleTapInterval?: number;
  /** Long-press threshold (ms) */
  longPressThreshold?: number;
  /** Tap max movement tolerance (px) */
  tapMovementTolerance?: number;
}

const DEFAULT_CONFIG: Required<GestureDetectionConfig> = {
  enableTap: true,
  enableDoubleTap: true,
  enableLongPress: true,
  enableSwipe: true,
  enablePinch: true,
  doubleTapInterval: 300,
  longPressThreshold: GESTURE_CONFIG.PRESS_AND_HOLD_DURATION,
  tapMovementTolerance: 10,
};

/**
 * Calculate distance between two touch points
 */
export function calculateDistance(point1: TouchPoint, point2: TouchPoint): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate center point between two touches
 */
export function calculateCenterPoint(
  point1: TouchPoint,
  point2: TouchPoint
): { x: number; y: number } {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
  };
}

/**
 * Convert TouchList to array of TouchPoint objects
 */
export function touchListToPoints(
  touchList: TouchList | React.TouchList,
  timestamp: number
): TouchPoint[] {
  const points: TouchPoint[] = [];

  for (let i = 0; i < touchList.length; i++) {
    const touch = touchList[i];
    if (touch) {
      points.push({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        timestamp,
      });
    }
  }

  return points;
}

/**
 * React hook for general gesture detection
 *
 * Provides comprehensive touch gesture detection including tap, swipe,
 * and multi-touch gestures. Can be used as a foundation for specialized
 * gesture hooks like pinch-to-zoom.
 *
 * @param config - Configuration options for gesture detection
 * @returns Object with gesture detection handlers and state
 *
 * @example
 * ```tsx
 * function InteractiveMap() {
 *   const gesture = useGestureDetection({
 *     enableSwipe: true,
 *     enablePinch: true,
 *   });
 *
 *   const handleGesture = (result: GestureResult) => {
 *     if (result.type === 'swipe') {
 *       // Handle swipe in the detected direction
 *     }
 *   };
 *
 *   return (
 *     <div
 *       onTouchStart={gesture.handleTouchStart}
 *       onTouchMove={gesture.handleTouchMove}
 *       onTouchEnd={(e) => gesture.handleTouchEnd(e, handleGesture)}
 *     >
 *       Map content
 *     </div>
 *   );
 * }
 * ```
 */
export function useGestureDetection(config: GestureDetectionConfig = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const gestureStateRef = useRef<GestureState>({
    touches: [],
    touchCount: 0,
    startTime: 0,
    initialTouches: [],
    hadMultiTouch: false,
  });

  const lastTapTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear long-press timer if active
   */
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  /**
   * Handle touch start event
   */
  const handleTouchStart = useCallback(
    (event: React.TouchEvent | TouchEvent) => {
      const timestamp = Date.now();
      const touches = touchListToPoints(event.touches, timestamp);

      gestureStateRef.current = {
        touches,
        touchCount: touches.length,
        startTime: timestamp,
        initialTouches: touches,
        hadMultiTouch: touches.length > 1,
      };

      // Start long-press detection for single touch
      if (mergedConfig.enableLongPress && touches.length === 1) {
        clearLongPressTimer();
        longPressTimerRef.current = setTimeout(() => {
          // Long press detected
          const touch = touches[0];
          const onLongPress = (event as unknown as { onLongPress?: (gesture: TapGesture) => void })
            .onLongPress;

          if (onLongPress) {
            onLongPress({
              type: 'long-press',
              x: touch.x,
              y: touch.y,
              duration: Date.now() - timestamp,
            });
          }
        }, mergedConfig.longPressThreshold);
      }
    },
    [mergedConfig.enableLongPress, mergedConfig.longPressThreshold, clearLongPressTimer]
  );

  /**
   * Handle touch move event
   */
  const handleTouchMove = useCallback(
    (event: React.TouchEvent | TouchEvent) => {
      const timestamp = Date.now();
      const touches = touchListToPoints(event.touches, timestamp);

      gestureStateRef.current.touches = touches;
      gestureStateRef.current.touchCount = touches.length;

      // Track if multi-touch occurred
      if (touches.length > 1) {
        gestureStateRef.current.hadMultiTouch = true;
      }

      // Cancel long-press if finger moved too much
      if (longPressTimerRef.current && touches.length === 1) {
        const initial = gestureStateRef.current.initialTouches[0];
        const current = touches[0];
        const distance = calculateDistance(initial, current);

        if (distance > mergedConfig.tapMovementTolerance) {
          clearLongPressTimer();
        }
      }
    },
    [mergedConfig.tapMovementTolerance, clearLongPressTimer]
  );

  /**
   * Handle touch end event and detect completed gestures
   */
  const handleTouchEnd = useCallback(
    (event: React.TouchEvent | TouchEvent, onGesture?: (gesture: GestureResult) => void) => {
      clearLongPressTimer();

      const endTime = Date.now();
      const duration = endTime - gestureStateRef.current.startTime;
      const initialTouches = gestureStateRef.current.initialTouches;
      const remainingTouches = event.touches;

      // Detect tap gestures (single touch, short duration, minimal movement, no multi-touch)
      if (
        mergedConfig.enableTap &&
        initialTouches.length === 1 &&
        remainingTouches.length === 0 &&
        duration <= GESTURE_CONFIG.TAP_MAX_DURATION &&
        !gestureStateRef.current.hadMultiTouch
      ) {
        const startTouch = initialTouches[0];
        const endCoords = getTouchCoordinates(event as unknown as TouchEvent);
        const movement = Math.sqrt(
          Math.pow(endCoords.x - startTouch.x, 2) + Math.pow(endCoords.y - startTouch.y, 2)
        );

        if (movement <= mergedConfig.tapMovementTolerance) {
          // Check for double-tap
          const timeSinceLastTap = endTime - lastTapTimeRef.current;

          if (mergedConfig.enableDoubleTap && timeSinceLastTap <= mergedConfig.doubleTapInterval) {
            onGesture?.({
              type: 'double-tap',
              x: endCoords.x,
              y: endCoords.y,
              duration,
            });
            lastTapTimeRef.current = 0; // Reset to prevent triple-tap
          } else {
            onGesture?.({
              type: 'tap',
              x: endCoords.x,
              y: endCoords.y,
              duration,
            });
            lastTapTimeRef.current = endTime;
          }
        }
      }

      // Detect swipe gestures (single touch, fast movement)
      if (
        mergedConfig.enableSwipe &&
        initialTouches.length === 1 &&
        remainingTouches.length === 0
      ) {
        const startTouch = initialTouches[0];
        const endCoords = getTouchCoordinates(event as unknown as TouchEvent);

        if (isSwipeGesture(startTouch.x, startTouch.y, endCoords.x, endCoords.y, duration)) {
          const direction = getSwipeDirection(startTouch.x, startTouch.y, endCoords.x, endCoords.y);
          const { speed } = calculateDragVelocity(
            startTouch.x,
            startTouch.y,
            endCoords.x,
            endCoords.y,
            duration
          );
          const distance = Math.sqrt(
            Math.pow(endCoords.x - startTouch.x, 2) + Math.pow(endCoords.y - startTouch.y, 2)
          );

          if (direction) {
            onGesture?.({
              type: 'swipe',
              direction,
              distance,
              velocity: speed,
              start: { x: startTouch.x, y: startTouch.y },
              end: { x: endCoords.x, y: endCoords.y },
            });
          }
        }
      }

      // Reset state when all touches are released
      if (remainingTouches.length === 0) {
        gestureStateRef.current = {
          touches: [],
          touchCount: 0,
          startTime: 0,
          initialTouches: [],
          hadMultiTouch: false,
        };
      }
    },
    [
      mergedConfig.enableTap,
      mergedConfig.enableDoubleTap,
      mergedConfig.enableSwipe,
      mergedConfig.tapMovementTolerance,
      mergedConfig.doubleTapInterval,
      clearLongPressTimer,
    ]
  );

  /**
   * Get current gesture state
   */
  const getGestureState = useCallback((): GestureState => {
    return { ...gestureStateRef.current };
  }, []);

  /**
   * Check if a specific number of touches are active
   */
  const hasTouchCount = useCallback((count: number): boolean => {
    return gestureStateRef.current.touchCount === count;
  }, []);

  /**
   * Get current touch count
   */
  const getTouchCount = useCallback((): number => {
    return gestureStateRef.current.touchCount;
  }, []);

  return {
    /** Handle touch start event */
    handleTouchStart,

    /** Handle touch move event */
    handleTouchMove,

    /** Handle touch end event */
    handleTouchEnd,

    /** Get current gesture state */
    getGestureState,

    /** Check if specific touch count is active */
    hasTouchCount,

    /** Get current touch count */
    getTouchCount,

    /** Configuration being used */
    config: mergedConfig,
  };
}

export default useGestureDetection;
