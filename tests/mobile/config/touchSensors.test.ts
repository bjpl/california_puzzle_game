/**
 * |unit| |integration| |accessibility| |performance|
 * Touch Sensors Configuration Tests
 *
 * Tests touch event handling, gesture detection, and drag utilities
 * for mobile drag-and-drop interactions.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  TOUCH_SENSOR_OPTIONS,
  POINTER_SENSOR_OPTIONS,
  MOUSE_SENSOR_OPTIONS,
  MOBILE_SENSORS,
  UNIVERSAL_SENSORS,
  shouldCancelDrag,
  preventScrollDuringDrag,
  restoreScrollAfterDrag,
  getTouchCoordinates,
  calculateDragVelocity,
  isSwipeGesture,
  getSwipeDirection,
  SwipeDirection,
  type DragCancelConditions,
} from '@/mobile/config/touchSensors';
import { GESTURE_CONFIG } from '@/mobile/config/breakpoints';
import { TouchSensor, PointerSensor, MouseSensor } from '@dnd-kit/core';

describe('|unit| Touch Sensors - Configuration Objects', () => {
  it('defines touch sensor options with activation constraint', () => {
    expect(TOUCH_SENSOR_OPTIONS).toHaveProperty('activationConstraint');
    expect(TOUCH_SENSOR_OPTIONS.activationConstraint).toHaveProperty('delay');
    expect(TOUCH_SENSOR_OPTIONS.activationConstraint).toHaveProperty('tolerance');
  });

  it('touch sensor uses gesture config delay', () => {
    expect(TOUCH_SENSOR_OPTIONS.activationConstraint.delay).toBe(
      GESTURE_CONFIG.PRESS_AND_HOLD_DURATION
    );
  });

  it('touch sensor has reasonable tolerance', () => {
    expect(TOUCH_SENSOR_OPTIONS.activationConstraint.tolerance).toBe(8);
  });

  it('pointer sensor uses distance constraint', () => {
    expect(POINTER_SENSOR_OPTIONS).toHaveProperty('activationConstraint');
    expect(POINTER_SENSOR_OPTIONS.activationConstraint).toHaveProperty('distance');
    expect(POINTER_SENSOR_OPTIONS.activationConstraint.distance).toBe(10);
  });

  it('mouse sensor has smaller distance constraint', () => {
    expect(MOUSE_SENSOR_OPTIONS).toHaveProperty('activationConstraint');
    expect(MOUSE_SENSOR_OPTIONS.activationConstraint).toHaveProperty('distance');
    expect(MOUSE_SENSOR_OPTIONS.activationConstraint.distance).toBe(5);
  });
});

describe('|unit| Touch Sensors - Sensor Arrays', () => {
  it('mobile sensors include touch and mouse', () => {
    expect(MOBILE_SENSORS).toHaveLength(2);
    expect(MOBILE_SENSORS[0].sensor).toBe(TouchSensor);
    expect(MOBILE_SENSORS[1].sensor).toBe(MouseSensor);
  });

  it('mobile sensors have correct options', () => {
    expect(MOBILE_SENSORS[0].options).toBe(TOUCH_SENSOR_OPTIONS);
    expect(MOBILE_SENSORS[1].options).toBe(MOUSE_SENSOR_OPTIONS);
  });

  it('universal sensors use pointer sensor', () => {
    expect(UNIVERSAL_SENSORS).toHaveLength(1);
    expect(UNIVERSAL_SENSORS[0].sensor).toBe(PointerSensor);
    expect(UNIVERSAL_SENSORS[0].options).toBe(POINTER_SENSOR_OPTIONS);
  });
});

describe('|unit| Touch Sensors - getTouchCoordinates', () => {
  it('extracts coordinates from TouchEvent', () => {
    const touchEvent = {
      touches: [{ clientX: 100, clientY: 200 }],
    } as unknown as TouchEvent;

    const coords = getTouchCoordinates(touchEvent);

    expect(coords).toEqual({ x: 100, y: 200 });
  });

  it('extracts coordinates from PointerEvent', () => {
    const pointerEvent = {
      clientX: 150,
      clientY: 250,
    } as PointerEvent;

    const coords = getTouchCoordinates(pointerEvent);

    expect(coords).toEqual({ x: 150, y: 250 });
  });

  it('extracts coordinates from MouseEvent', () => {
    const mouseEvent = {
      clientX: 300,
      clientY: 400,
    } as MouseEvent;

    const coords = getTouchCoordinates(mouseEvent);

    expect(coords).toEqual({ x: 300, y: 400 });
  });

  it('handles TouchEvent with multiple touches', () => {
    const touchEvent = {
      touches: [
        { clientX: 100, clientY: 200 },
        { clientX: 150, clientY: 250 },
      ],
    } as unknown as TouchEvent;

    const coords = getTouchCoordinates(touchEvent);

    // Should return first touch
    expect(coords).toEqual({ x: 100, y: 200 });
  });

  it('returns zero coordinates for empty TouchEvent', () => {
    const touchEvent = {
      touches: [],
    } as unknown as TouchEvent;

    const coords = getTouchCoordinates(touchEvent);

    expect(coords).toEqual({ x: 0, y: 0 });
  });

  it('returns zero coordinates for invalid event', () => {
    const invalidEvent = {} as TouchEvent;

    const coords = getTouchCoordinates(invalidEvent);

    expect(coords).toEqual({ x: 0, y: 0 });
  });
});

describe('|unit| Touch Sensors - calculateDragVelocity', () => {
  it('calculates velocity for horizontal drag', () => {
    const result = calculateDragVelocity(0, 0, 100, 0, 200);

    expect(result.vx).toBe(0.5); // 100px / 200ms
    expect(result.vy).toBe(0);
    expect(result.speed).toBeCloseTo(0.5, 2);
  });

  it('calculates velocity for vertical drag', () => {
    const result = calculateDragVelocity(0, 0, 0, 150, 300);

    expect(result.vx).toBe(0);
    expect(result.vy).toBe(0.5); // 150px / 300ms
    expect(result.speed).toBeCloseTo(0.5, 2);
  });

  it('calculates velocity for diagonal drag', () => {
    const result = calculateDragVelocity(0, 0, 100, 100, 200);

    expect(result.vx).toBe(0.5);
    expect(result.vy).toBe(0.5);
    // Distance = sqrt(100^2 + 100^2) = ~141.42
    // Speed = 141.42 / 200 = ~0.707
    expect(result.speed).toBeCloseTo(0.707, 2);
  });

  it('calculates negative velocity for backward drag', () => {
    const result = calculateDragVelocity(100, 100, 50, 50, 100);

    expect(result.vx).toBe(-0.5);
    expect(result.vy).toBe(-0.5);
    expect(result.speed).toBeCloseTo(0.707, 2);
  });

  it('handles zero duration edge case', () => {
    const result = calculateDragVelocity(0, 0, 100, 100, 1);

    expect(result.vx).toBe(100);
    expect(result.vy).toBe(100);
    expect(result.speed).toBeGreaterThan(100);
  });

  it('handles zero distance', () => {
    const result = calculateDragVelocity(100, 100, 100, 100, 200);

    expect(result.vx).toBe(0);
    expect(result.vy).toBe(0);
    expect(result.speed).toBe(0);
  });

  it('calculates correct speed for fast swipe', () => {
    const result = calculateDragVelocity(0, 0, 200, 0, 100);

    expect(result.speed).toBe(2); // 200px / 100ms = 2 px/ms
  });

  it('calculates correct speed for slow drag', () => {
    const result = calculateDragVelocity(0, 0, 100, 0, 1000);

    expect(result.speed).toBe(0.1); // 100px / 1000ms = 0.1 px/ms
  });
});

describe('|unit| Touch Sensors - isSwipeGesture', () => {
  it('returns true for fast horizontal swipe', () => {
    const result = isSwipeGesture(0, 0, 100, 0, 200);

    expect(result).toBe(true);
  });

  it('returns true for fast vertical swipe', () => {
    const result = isSwipeGesture(0, 0, 0, 100, 200);

    expect(result).toBe(true);
  });

  it('returns false for slow drag', () => {
    const result = isSwipeGesture(0, 0, 100, 0, 1000);

    expect(result).toBe(false);
  });

  it('returns false for short distance', () => {
    const result = isSwipeGesture(0, 0, 20, 0, 50);

    expect(result).toBe(false);
  });

  it('respects SWIPE_THRESHOLD', () => {
    const threshold = GESTURE_CONFIG.SWIPE_THRESHOLD;

    // Just below threshold - should be false
    const belowThreshold = isSwipeGesture(0, 0, threshold - 1, 0, 100);
    expect(belowThreshold).toBe(false);

    // At threshold with good velocity - should be true
    const atThreshold = isSwipeGesture(0, 0, threshold, 0, 100);
    expect(atThreshold).toBe(true);
  });

  it('respects SWIPE_VELOCITY', () => {
    const velocity = GESTURE_CONFIG.SWIPE_VELOCITY;
    const distance = 100;

    // Calculate duration that gives velocity below threshold
    const slowDuration = distance / (velocity - 0.1);
    const slowSwipe = isSwipeGesture(0, 0, distance, 0, slowDuration);
    expect(slowSwipe).toBe(false);

    // Calculate duration that gives velocity above threshold
    const fastDuration = distance / (velocity + 0.1);
    const fastSwipe = isSwipeGesture(0, 0, distance, 0, fastDuration);
    expect(fastSwipe).toBe(true);
  });

  it('handles diagonal swipes', () => {
    const result = isSwipeGesture(0, 0, 100, 100, 200);

    expect(result).toBe(true);
  });
});

describe('|unit| Touch Sensors - getSwipeDirection', () => {
  it('returns RIGHT for rightward swipe', () => {
    const direction = getSwipeDirection(0, 0, 100, 0);

    expect(direction).toBe(SwipeDirection.RIGHT);
  });

  it('returns LEFT for leftward swipe', () => {
    const direction = getSwipeDirection(100, 0, 0, 0);

    expect(direction).toBe(SwipeDirection.LEFT);
  });

  it('returns DOWN for downward swipe', () => {
    const direction = getSwipeDirection(0, 0, 0, 100);

    expect(direction).toBe(SwipeDirection.DOWN);
  });

  it('returns UP for upward swipe', () => {
    const direction = getSwipeDirection(0, 100, 0, 0);

    expect(direction).toBe(SwipeDirection.UP);
  });

  it('returns null for no movement', () => {
    const direction = getSwipeDirection(100, 100, 100, 100);

    expect(direction).toBe(null);
  });

  it('prioritizes horizontal when dx > dy', () => {
    const direction = getSwipeDirection(0, 0, 100, 50);

    expect(direction).toBe(SwipeDirection.RIGHT);
  });

  it('prioritizes vertical when dy > dx', () => {
    const direction = getSwipeDirection(0, 0, 50, 100);

    expect(direction).toBe(SwipeDirection.DOWN);
  });

  it('handles diagonal swipe (more horizontal)', () => {
    const direction = getSwipeDirection(0, 0, 100, 30);

    expect(direction).toBe(SwipeDirection.RIGHT);
  });

  it('handles diagonal swipe (more vertical)', () => {
    const direction = getSwipeDirection(0, 0, 30, 100);

    expect(direction).toBe(SwipeDirection.DOWN);
  });

  it('handles negative horizontal movement', () => {
    const direction = getSwipeDirection(100, 50, 20, 40);

    expect(direction).toBe(SwipeDirection.LEFT);
  });

  it('handles negative vertical movement', () => {
    const direction = getSwipeDirection(50, 100, 40, 20);

    expect(direction).toBe(SwipeDirection.UP);
  });
});

describe('|unit| Touch Sensors - shouldCancelDrag', () => {
  it('returns true when touch count exceeds max', () => {
    const touchEvent = {
      touches: [
        { clientX: 100, clientY: 100 },
        { clientX: 150, clientY: 150 },
      ],
    } as unknown as TouchEvent;

    const conditions: DragCancelConditions = {
      maxTouchCount: 1,
    };

    expect(shouldCancelDrag(touchEvent, conditions)).toBe(true);
  });

  it('returns false when touch count is within limit', () => {
    const touchEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as unknown as TouchEvent;

    const conditions: DragCancelConditions = {
      maxTouchCount: 1,
    };

    expect(shouldCancelDrag(touchEvent, conditions)).toBe(false);
  });

  it('returns true when drag moves outside bounds', () => {
    const pointerEvent = {
      clientX: 500,
      clientY: 500,
    } as PointerEvent;

    const conditions: DragCancelConditions = {
      bounds: { left: 0, top: 0, right: 400, bottom: 400 },
    };

    expect(shouldCancelDrag(pointerEvent, conditions)).toBe(true);
  });

  it('returns false when drag stays within bounds', () => {
    const pointerEvent = {
      clientX: 200,
      clientY: 200,
    } as PointerEvent;

    const conditions: DragCancelConditions = {
      bounds: { left: 0, top: 0, right: 400, bottom: 400 },
    };

    expect(shouldCancelDrag(pointerEvent, conditions)).toBe(false);
  });

  it('handles touch event bounds checking', () => {
    const touchEvent = {
      touches: [{ clientX: 500, clientY: 500 }],
    } as unknown as TouchEvent;

    const conditions: DragCancelConditions = {
      bounds: { left: 0, top: 0, right: 400, bottom: 400 },
    };

    expect(shouldCancelDrag(touchEvent, conditions)).toBe(true);
  });

  it('returns false when no conditions match', () => {
    const pointerEvent = {
      clientX: 200,
      clientY: 200,
    } as PointerEvent;

    const conditions: DragCancelConditions = {};

    expect(shouldCancelDrag(pointerEvent, conditions)).toBe(false);
  });

  it('checks bounds at edges', () => {
    const conditions: DragCancelConditions = {
      bounds: { left: 0, top: 0, right: 400, bottom: 400 },
    };

    // Left edge - outside
    expect(shouldCancelDrag({ clientX: -1, clientY: 200 } as PointerEvent, conditions)).toBe(true);

    // Right edge - outside
    expect(shouldCancelDrag({ clientX: 401, clientY: 200 } as PointerEvent, conditions)).toBe(true);

    // Top edge - outside
    expect(shouldCancelDrag({ clientX: 200, clientY: -1 } as PointerEvent, conditions)).toBe(true);

    // Bottom edge - outside
    expect(shouldCancelDrag({ clientX: 200, clientY: 401 } as PointerEvent, conditions)).toBe(true);

    // Exactly on bounds - inside
    expect(shouldCancelDrag({ clientX: 0, clientY: 0 } as PointerEvent, conditions)).toBe(false);
    expect(shouldCancelDrag({ clientX: 400, clientY: 400 } as PointerEvent, conditions)).toBe(
      false
    );
  });

  it('handles multiple conditions simultaneously', () => {
    const touchEvent = {
      touches: [
        { clientX: 500, clientY: 500 },
        { clientX: 510, clientY: 510 },
      ],
    } as unknown as TouchEvent;

    const conditions: DragCancelConditions = {
      maxTouchCount: 1,
      bounds: { left: 0, top: 0, right: 400, bottom: 400 },
    };

    expect(shouldCancelDrag(touchEvent, conditions)).toBe(true);
  });
});

describe('|unit| Touch Sensors - preventScrollDuringDrag / restoreScrollAfterDrag', () => {
  let originalTouchAction: string;
  let originalOverflow: string;

  beforeEach(() => {
    originalTouchAction = document.body.style.touchAction;
    originalOverflow = document.body.style.overflow;
    document.body.style.touchAction = '';
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.touchAction = originalTouchAction;
    document.body.style.overflow = originalOverflow;
  });

  it('preventScrollDuringDrag sets touch-action and overflow', () => {
    preventScrollDuringDrag();

    expect(document.body.style.touchAction).toBe('none');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restoreScrollAfterDrag resets touch-action and overflow', () => {
    document.body.style.touchAction = 'none';
    document.body.style.overflow = 'hidden';

    restoreScrollAfterDrag();

    expect(document.body.style.touchAction).toBe('');
    expect(document.body.style.overflow).toBe('');
  });

  it('preventScrollDuringDrag and restoreScrollAfterDrag work together', () => {
    preventScrollDuringDrag();
    expect(document.body.style.touchAction).toBe('none');
    expect(document.body.style.overflow).toBe('hidden');

    restoreScrollAfterDrag();
    expect(document.body.style.touchAction).toBe('');
    expect(document.body.style.overflow).toBe('');
  });
});

describe('|integration| Touch Sensors - Gesture Recognition', () => {
  it('recognizes fast swipe right', () => {
    const startX = 100;
    const startY = 200;
    const endX = 300;
    const endY = 200;
    const duration = 150;

    expect(isSwipeGesture(startX, startY, endX, endY, duration)).toBe(true);
    expect(getSwipeDirection(startX, startY, endX, endY)).toBe(SwipeDirection.RIGHT);
  });

  it('recognizes fast swipe up', () => {
    const startX = 200;
    const startY = 400;
    const endX = 200;
    const endY = 200;
    const duration = 150;

    expect(isSwipeGesture(startX, startY, endX, endY, duration)).toBe(true);
    expect(getSwipeDirection(startX, startY, endX, endY)).toBe(SwipeDirection.UP);
  });

  it('rejects slow drag as swipe', () => {
    const startX = 100;
    const startY = 200;
    const endX = 300;
    const endY = 200;
    const duration = 1000;

    expect(isSwipeGesture(startX, startY, endX, endY, duration)).toBe(false);
  });

  it('calculates velocity for swipe gesture', () => {
    const startX = 100;
    const startY = 200;
    const endX = 300;
    const endY = 200;
    const duration = 150;

    const velocity = calculateDragVelocity(startX, startY, endX, endY, duration);

    expect(velocity.vx).toBeCloseTo(1.33, 2);
    expect(velocity.speed).toBeGreaterThan(GESTURE_CONFIG.SWIPE_VELOCITY);
  });

  it('handles diagonal swipe with direction priority', () => {
    const startX = 100;
    const startY = 100;
    const endX = 250;
    const endY = 180;
    const duration = 150;

    expect(isSwipeGesture(startX, startY, endX, endY, duration)).toBe(true);
    expect(getSwipeDirection(startX, startY, endX, endY)).toBe(SwipeDirection.RIGHT);
  });
});

describe('|integration| Touch Sensors - Multi-touch Handling', () => {
  it('cancels drag on second finger touch', () => {
    const singleTouchEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as unknown as TouchEvent;

    const multiTouchEvent = {
      touches: [
        { clientX: 100, clientY: 100 },
        { clientX: 150, clientY: 150 },
      ],
    } as unknown as TouchEvent;

    const conditions: DragCancelConditions = { maxTouchCount: 1 };

    expect(shouldCancelDrag(singleTouchEvent, conditions)).toBe(false);
    expect(shouldCancelDrag(multiTouchEvent, conditions)).toBe(true);
  });

  it('allows pinch gesture with higher touch count', () => {
    const pinchEvent = {
      touches: [
        { clientX: 100, clientY: 100 },
        { clientX: 200, clientY: 200 },
      ],
    } as unknown as TouchEvent;

    const conditions: DragCancelConditions = { maxTouchCount: 2 };

    expect(shouldCancelDrag(pinchEvent, conditions)).toBe(false);
  });
});

describe('|accessibility| Touch Sensors - Activation Constraints', () => {
  it('touch sensor delay meets accessibility guidelines', () => {
    // Press-and-hold should be long enough to prevent accidental activation
    // but not so long it frustrates users
    expect(TOUCH_SENSOR_OPTIONS.activationConstraint.delay).toBeGreaterThanOrEqual(200);
    expect(TOUCH_SENSOR_OPTIONS.activationConstraint.delay).toBeLessThanOrEqual(500);
  });

  it('touch sensor tolerance allows small movements during press', () => {
    // Users may have hand tremors or imprecise touch
    expect(TOUCH_SENSOR_OPTIONS.activationConstraint.tolerance).toBeGreaterThanOrEqual(5);
  });

  it('mouse sensor has low activation threshold for precision', () => {
    // Mouse users have precise control, so low threshold is OK
    expect(MOUSE_SENSOR_OPTIONS.activationConstraint.distance).toBeLessThanOrEqual(10);
  });

  it('pointer sensor balances touch and mouse needs', () => {
    // Should be between mouse and touch thresholds
    const mouseDistance = MOUSE_SENSOR_OPTIONS.activationConstraint.distance || 0;
    const pointerDistance = POINTER_SENSOR_OPTIONS.activationConstraint.distance || 0;

    expect(pointerDistance).toBeGreaterThanOrEqual(mouseDistance);
  });
});

describe('|performance| Touch Sensors - Performance', () => {
  it('getTouchCoordinates is fast', () => {
    const iterations = 10000;
    const event = {
      clientX: 100,
      clientY: 200,
    } as PointerEvent;

    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      getTouchCoordinates(event);
    }

    const duration = performance.now() - start;
    const avgDuration = duration / iterations;

    expect(avgDuration).toBeLessThan(0.01);
  });

  it('calculateDragVelocity is fast', () => {
    const iterations = 10000;

    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      calculateDragVelocity(0, 0, 100, 100, 200);
    }

    const duration = performance.now() - start;
    const avgDuration = duration / iterations;

    expect(avgDuration).toBeLessThan(0.01);
  });

  it('isSwipeGesture is fast', () => {
    const iterations = 10000;

    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      isSwipeGesture(0, 0, 100, 100, 200);
    }

    const duration = performance.now() - start;
    const avgDuration = duration / iterations;

    expect(avgDuration).toBeLessThan(0.01);
  });

  it('getSwipeDirection is fast', () => {
    const iterations = 10000;

    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      getSwipeDirection(0, 0, 100, 100);
    }

    const duration = performance.now() - start;
    const avgDuration = duration / iterations;

    expect(avgDuration).toBeLessThan(0.01);
  });

  it('shouldCancelDrag is fast', () => {
    const iterations = 10000;
    const event = {
      clientX: 200,
      clientY: 200,
    } as PointerEvent;
    const conditions: DragCancelConditions = {
      bounds: { left: 0, top: 0, right: 400, bottom: 400 },
    };

    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      shouldCancelDrag(event, conditions);
    }

    const duration = performance.now() - start;
    const avgDuration = duration / iterations;

    expect(avgDuration).toBeLessThan(0.01);
  });
});
