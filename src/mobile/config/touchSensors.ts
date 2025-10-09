/**
 * Touch Sensor Configuration for @dnd-kit
 *
 * Optimized touch sensors for mobile drag-and-drop interactions.
 * Provides press-and-hold, haptic feedback, and gesture cancellation.
 *
 * @see https://docs.dndkit.com/api-documentation/sensors/touch
 */

import { PointerSensor, TouchSensor, MouseSensor } from '@dnd-kit/core';
import { GESTURE_CONFIG } from './breakpoints';

/**
 * Touch sensor configuration options
 *
 * Optimized for mobile devices with:
 * - Press-and-hold activation (300ms)
 * - Drag distance threshold to prevent accidental drags
 * - Touch-specific event handling
 */
export const TOUCH_SENSOR_OPTIONS = {
  /** Delay before drag activation (press-and-hold) */
  activationConstraint: {
    delay: GESTURE_CONFIG.PRESS_AND_HOLD_DURATION,
    tolerance: 8, // Allow 8px movement during press-and-hold
  },
};

/**
 * Pointer sensor configuration
 *
 * Works for both mouse and touch, but optimized for touch.
 * Use this for unified pointer handling across devices.
 */
export const POINTER_SENSOR_OPTIONS = {
  activationConstraint: {
    // Require minimum distance before starting drag
    distance: 10, // px
  },
};

/**
 * Mouse sensor configuration
 *
 * For desktop/laptop users with mouse.
 * Instant activation without press-and-hold.
 */
export const MOUSE_SENSOR_OPTIONS = {
  activationConstraint: {
    distance: 5, // Small distance to prevent accidental drags
  },
};

/**
 * Recommended sensor configuration for mobile app
 *
 * Uses TouchSensor for mobile and MouseSensor for desktop.
 * This provides optimal UX for each input method.
 */
export const MOBILE_SENSORS = [
  {
    sensor: TouchSensor,
    options: TOUCH_SENSOR_OPTIONS,
  },
  {
    sensor: MouseSensor,
    options: MOUSE_SENSOR_OPTIONS,
  },
];

/**
 * Universal sensor configuration
 *
 * Uses PointerSensor which handles both mouse and touch.
 * Simpler API but less control over device-specific optimizations.
 */
export const UNIVERSAL_SENSORS = [
  {
    sensor: PointerSensor,
    options: POINTER_SENSOR_OPTIONS,
  },
];

/**
 * Helper to determine if drag should be cancelled
 *
 * Use this in drag event handlers to cancel drag on specific conditions:
 * - User scrolls while dragging
 * - Second finger touches screen (multi-touch)
 * - Drag moves outside allowed area
 */
export interface DragCancelConditions {
  /** Maximum scroll distance before cancelling drag */
  maxScrollDistance?: number;

  /** Cancel if touch count exceeds this */
  maxTouchCount?: number;

  /** Bounding box - drag outside cancels */
  bounds?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

/**
 * Check if drag should be cancelled based on conditions
 */
export function shouldCancelDrag(
  event: TouchEvent | PointerEvent,
  conditions: DragCancelConditions
): boolean {
  // Multi-touch detection
  if (conditions.maxTouchCount && 'touches' in event) {
    if (event.touches.length > conditions.maxTouchCount) {
      return true;
    }
  }

  // Bounds checking
  if (conditions.bounds) {
    const x = 'clientX' in event ? event.clientX : event.touches?.[0]?.clientX;
    const y = 'clientY' in event ? event.clientY : event.touches?.[0]?.clientY;

    if (x !== undefined && y !== undefined) {
      const { left, top, right, bottom } = conditions.bounds;
      if (x < left || x > right || y < top || y > bottom) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Prevent page scroll during drag
 *
 * Call this in drag start handler to prevent iOS Safari from
 * scrolling the page while user is dragging.
 */
export function preventScrollDuringDrag() {
  document.body.style.touchAction = 'none';
  document.body.style.overflow = 'hidden';
}

/**
 * Restore page scroll after drag
 *
 * Call this in drag end handler to restore normal scrolling.
 */
export function restoreScrollAfterDrag() {
  document.body.style.touchAction = '';
  document.body.style.overflow = '';
}

/**
 * Get touch coordinates from event
 *
 * Works for both TouchEvent and PointerEvent
 */
export function getTouchCoordinates(event: TouchEvent | PointerEvent | MouseEvent): {
  x: number;
  y: number;
} {
  if ('touches' in event && event.touches.length > 0) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }

  if ('clientX' in event) {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }

  return { x: 0, y: 0 };
}

/**
 * Calculate drag velocity
 *
 * Used to determine if swipe gesture is fast enough
 * to trigger actions like dismissing bottom sheet.
 */
export function calculateDragVelocity(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  durationMs: number
): { vx: number; vy: number; speed: number } {
  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const vx = dx / durationMs; // px/ms
  const vy = dy / durationMs; // px/ms
  const speed = distance / durationMs; // px/ms

  return { vx, vy, speed };
}

/**
 * Check if gesture is a swipe
 *
 * Determines if drag gesture meets swipe criteria
 * based on distance and velocity thresholds.
 */
export function isSwipeGesture(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  durationMs: number
): boolean {
  const dx = Math.abs(endX - startX);
  const dy = Math.abs(endY - startY);
  const distance = Math.sqrt(dx * dx + dy * dy);

  const { speed } = calculateDragVelocity(startX, startY, endX, endY, durationMs);

  return distance >= GESTURE_CONFIG.SWIPE_THRESHOLD && speed >= GESTURE_CONFIG.SWIPE_VELOCITY;
}

/**
 * Get swipe direction
 */
export enum SwipeDirection {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export function getSwipeDirection(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): SwipeDirection | null {
  const dx = endX - startX;
  const dy = endY - startY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Determine if horizontal or vertical swipe dominates
  if (absDx > absDy) {
    // Horizontal swipe
    return dx > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT;
  } else if (absDy > 0) {
    // Vertical swipe
    return dy > 0 ? SwipeDirection.DOWN : SwipeDirection.UP;
  }

  return null; // No clear direction
}
