import { useState, useCallback, useRef, useEffect } from 'react';
import { Position } from '@/types';

// Gesture types
export enum GestureType {
  NONE = 'none',
  PINCH = 'pinch',
  ROTATE = 'rotate',
  PAN = 'pan',
  DRAG = 'drag',
  THREE_FINGER_SWIPE = 'three_finger_swipe',
  DOUBLE_TAP = 'double_tap',
  LONG_PRESS = 'long_press',
}

// Gesture event data
export interface GestureEvent {
  type: GestureType;
  scale?: number;
  rotation?: number;
  delta?: Position;
  center?: Position;
  velocity?: Position;
  timestamp: number;
}

// Gesture configuration
export interface GestureConfig {
  enableRotation: boolean;
  enablePinchZoom: boolean;
  enableThreeFingerSwipe: boolean;
  enableDoubleTap: boolean;
  enableLongPress: boolean;
  minScale: number;
  maxScale: number;
  doubleTapDelay: number;
  longPressDelay: number;
  rotationThreshold: number;
  pinchThreshold: number;
}

// Touch point tracking
interface TouchPoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

// Gesture state
interface GestureState {
  activeGesture: GestureType;
  touches: TouchPoint[];
  initialDistance: number;
  initialAngle: number;
  initialCenter: Position;
  lastCenter: Position;
  lastScale: number;
  lastRotation: number;
  tapCount: number;
  lastTapTime: number;
  longPressTimer: NodeJS.Timeout | null;
  longPressStartPos: Position | null;
}

// Default configuration
const DEFAULT_CONFIG: GestureConfig = {
  enableRotation: true,
  enablePinchZoom: true,
  enableThreeFingerSwipe: true,
  enableDoubleTap: true,
  enableLongPress: true,
  minScale: 1,
  maxScale: 3,
  doubleTapDelay: 300,
  longPressDelay: 500,
  rotationThreshold: 5, // degrees
  pinchThreshold: 0.05, // 5% scale change
};

// Gesture callbacks
export interface GestureCallbacks {
  onPinch?: (scale: number, center: Position) => void;
  onRotate?: (rotation: number, center: Position) => void;
  onPan?: (delta: Position) => void;
  onThreeFingerSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onDoubleTap?: (position: Position) => void;
  onLongPress?: (position: Position) => void;
  onGestureStart?: (type: GestureType) => void;
  onGestureEnd?: (type: GestureType) => void;
}

export interface UseGestureRecognitionReturn {
  handlers: {
    onTouchStart: (event: React.TouchEvent) => void;
    onTouchMove: (event: React.TouchEvent) => void;
    onTouchEnd: (event: React.TouchEvent) => void;
    onTouchCancel: (event: React.TouchEvent) => void;
  };
  gestureState: {
    activeGesture: GestureType;
    touchCount: number;
  };
  updateConfig: (config: Partial<GestureConfig>) => void;
}

export function useGestureRecognition(
  callbacks: GestureCallbacks = {},
  initialConfig: Partial<GestureConfig> = {}
): UseGestureRecognitionReturn {
  const [config, setConfig] = useState<GestureConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  const stateRef = useRef<GestureState>({
    activeGesture: GestureType.NONE,
    touches: [],
    initialDistance: 0,
    initialAngle: 0,
    initialCenter: { x: 0, y: 0 },
    lastCenter: { x: 0, y: 0 },
    lastScale: 1,
    lastRotation: 0,
    tapCount: 0,
    lastTapTime: 0,
    longPressTimer: null,
    longPressStartPos: null,
  });

  // Utility functions
  const getTouchPoints = useCallback((touches: React.TouchList): TouchPoint[] => {
    return Array.from(touches).map((touch) => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    }));
  }, []);

  const getDistance = useCallback((p1: TouchPoint, p2: TouchPoint): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getAngle = useCallback((p1: TouchPoint, p2: TouchPoint): number => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
  }, []);

  const getCenter = useCallback((points: TouchPoint[]): Position => {
    const sum = points.reduce(
      (acc, point) => ({
        x: acc.x + point.x,
        y: acc.y + point.y,
      }),
      { x: 0, y: 0 }
    );
    return {
      x: sum.x / points.length,
      y: sum.y / points.length,
    };
  }, []);

  const clearLongPressTimer = useCallback(() => {
    if (stateRef.current.longPressTimer) {
      clearTimeout(stateRef.current.longPressTimer);
      stateRef.current.longPressTimer = null;
    }
  }, []);

  // Gesture detection
  const detectGestureType = useCallback(
    (touchCount: number): GestureType => {
      if (touchCount === 1) {
        return GestureType.DRAG;
      } else if (touchCount === 2) {
        // Could be pinch, rotate, or pan
        return GestureType.PINCH; // Default to pinch, will differentiate in move
      } else if (touchCount === 3 && config.enableThreeFingerSwipe) {
        return GestureType.THREE_FINGER_SWIPE;
      }
      return GestureType.NONE;
    },
    [config.enableThreeFingerSwipe]
  );

  // Touch start handler
  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      const touches = getTouchPoints(event.touches);
      const state = stateRef.current;

      state.touches = touches;
      const touchCount = touches.length;

      // Clear any existing long press timer
      clearLongPressTimer();

      // Detect gesture type
      const gestureType = detectGestureType(touchCount);
      state.activeGesture = gestureType;

      if (callbacks.onGestureStart) {
        callbacks.onGestureStart(gestureType);
      }

      // Initialize two-finger gesture data
      if (touchCount === 2) {
        state.initialDistance = getDistance(touches[0], touches[1]);
        state.initialAngle = getAngle(touches[0], touches[1]);
        state.initialCenter = getCenter(touches);
        state.lastCenter = state.initialCenter;
        state.lastScale = 1;
        state.lastRotation = 0;
      }

      // Handle single tap for double-tap detection
      if (touchCount === 1 && config.enableDoubleTap) {
        const now = Date.now();
        const timeSinceLastTap = now - state.lastTapTime;

        if (timeSinceLastTap < config.doubleTapDelay) {
          state.tapCount += 1;
          if (state.tapCount === 2) {
            // Double tap detected
            if (callbacks.onDoubleTap) {
              callbacks.onDoubleTap({ x: touches[0].x, y: touches[0].y });
            }
            state.tapCount = 0;
          }
        } else {
          state.tapCount = 1;
        }
        state.lastTapTime = now;

        // Start long press timer
        if (config.enableLongPress) {
          state.longPressStartPos = { x: touches[0].x, y: touches[0].y };
          state.longPressTimer = setTimeout(() => {
            if (
              state.activeGesture === GestureType.DRAG &&
              state.longPressStartPos &&
              callbacks.onLongPress
            ) {
              callbacks.onLongPress(state.longPressStartPos);
              state.activeGesture = GestureType.LONG_PRESS;
            }
          }, config.longPressDelay);
        }
      }
    },
    [
      getTouchPoints,
      detectGestureType,
      getDistance,
      getAngle,
      getCenter,
      clearLongPressTimer,
      config.enableDoubleTap,
      config.enableLongPress,
      config.doubleTapDelay,
      config.longPressDelay,
      callbacks,
    ]
  );

  // Touch move handler
  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      event.preventDefault(); // Prevent default touch behavior
      const touches = getTouchPoints(event.touches);
      const state = stateRef.current;
      const touchCount = touches.length;

      state.touches = touches;

      // Cancel long press if finger moves
      if (state.longPressTimer) {
        const moveThreshold = 10; // pixels
        const touch = touches[0];
        if (
          state.longPressStartPos &&
          (Math.abs(touch.x - state.longPressStartPos.x) > moveThreshold ||
            Math.abs(touch.y - state.longPressStartPos.y) > moveThreshold)
        ) {
          clearLongPressTimer();
        }
      }

      // Handle two-finger gestures
      if (touchCount === 2 && (config.enablePinchZoom || config.enableRotation)) {
        const currentDistance = getDistance(touches[0], touches[1]);
        const currentAngle = getAngle(touches[0], touches[1]);
        const currentCenter = getCenter(touches);

        // Calculate pinch scale
        if (config.enablePinchZoom && state.initialDistance > 0) {
          const scale = currentDistance / state.initialDistance;
          const deltaScale = Math.abs(scale - state.lastScale);

          if (deltaScale > config.pinchThreshold) {
            // Constrain scale to min/max
            const constrainedScale = Math.max(
              config.minScale,
              Math.min(config.maxScale, scale)
            );

            if (callbacks.onPinch) {
              callbacks.onPinch(constrainedScale, currentCenter);
            }
            state.lastScale = scale;
            state.activeGesture = GestureType.PINCH;
          }
        }

        // Calculate rotation
        if (config.enableRotation && state.initialAngle !== 0) {
          let rotation = currentAngle - state.initialAngle;
          const deltaRotation = Math.abs(rotation - state.lastRotation);

          if (deltaRotation > config.rotationThreshold) {
            // Normalize rotation to -180 to 180
            if (rotation > 180) rotation -= 360;
            if (rotation < -180) rotation += 360;

            if (callbacks.onRotate) {
              callbacks.onRotate(rotation, currentCenter);
            }
            state.lastRotation = rotation;
            state.activeGesture = GestureType.ROTATE;
          }
        }

        // Calculate pan (for two-finger pan)
        const delta = {
          x: currentCenter.x - state.lastCenter.x,
          y: currentCenter.y - state.lastCenter.y,
        };

        if (Math.abs(delta.x) > 1 || Math.abs(delta.y) > 1) {
          if (callbacks.onPan) {
            callbacks.onPan(delta);
          }
        }

        state.lastCenter = currentCenter;
      }

      // Handle three-finger swipe
      if (touchCount === 3 && config.enableThreeFingerSwipe) {
        const center = getCenter(touches);
        const delta = {
          x: center.x - state.initialCenter.x,
          y: center.y - state.initialCenter.y,
        };

        const swipeThreshold = 50; // pixels
        if (Math.abs(delta.x) > swipeThreshold || Math.abs(delta.y) > swipeThreshold) {
          let direction: 'left' | 'right' | 'up' | 'down';
          if (Math.abs(delta.x) > Math.abs(delta.y)) {
            direction = delta.x > 0 ? 'right' : 'left';
          } else {
            direction = delta.y > 0 ? 'down' : 'up';
          }

          if (callbacks.onThreeFingerSwipe) {
            callbacks.onThreeFingerSwipe(direction);
          }
          state.activeGesture = GestureType.THREE_FINGER_SWIPE;
        }
      }
    },
    [
      getTouchPoints,
      getDistance,
      getAngle,
      getCenter,
      clearLongPressTimer,
      config,
      callbacks,
    ]
  );

  // Touch end handler
  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      const state = stateRef.current;
      const previousGesture = state.activeGesture;

      // Update touches
      state.touches = getTouchPoints(event.touches);

      // Clear long press timer
      clearLongPressTimer();

      // If no more touches, reset gesture
      if (event.touches.length === 0) {
        if (callbacks.onGestureEnd && previousGesture !== GestureType.NONE) {
          callbacks.onGestureEnd(previousGesture);
        }

        state.activeGesture = GestureType.NONE;
        state.initialDistance = 0;
        state.initialAngle = 0;
        state.initialCenter = { x: 0, y: 0 };
        state.lastCenter = { x: 0, y: 0 };
        state.lastScale = 1;
        state.lastRotation = 0;
        state.longPressStartPos = null;
      } else {
        // Re-initialize for remaining touches
        const touchCount = event.touches.length;
        const gestureType = detectGestureType(touchCount);
        state.activeGesture = gestureType;

        if (touchCount === 2) {
          const touches = getTouchPoints(event.touches);
          state.initialDistance = getDistance(touches[0], touches[1]);
          state.initialAngle = getAngle(touches[0], touches[1]);
          state.initialCenter = getCenter(touches);
          state.lastCenter = state.initialCenter;
        }
      }
    },
    [
      getTouchPoints,
      clearLongPressTimer,
      detectGestureType,
      getDistance,
      getAngle,
      getCenter,
      callbacks,
    ]
  );

  // Touch cancel handler
  const handleTouchCancel = useCallback(
    (event: React.TouchEvent) => {
      clearLongPressTimer();
      handleTouchEnd(event);
    },
    [clearLongPressTimer, handleTouchEnd]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  // Update config function
  const updateConfig = useCallback((newConfig: Partial<GestureConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
    gestureState: {
      activeGesture: stateRef.current.activeGesture,
      touchCount: stateRef.current.touches.length,
    },
    updateConfig,
  };
}
