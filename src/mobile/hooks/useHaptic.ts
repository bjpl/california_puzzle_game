/**
 * useHaptic Hook
 *
 * Provides haptic (vibration) feedback for mobile devices.
 * Implements the Vibration API with graceful degradation.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
 * @see docs/MOBILE_PRD.md - F-9: Haptic Feedback System
 */

import { useCallback, useRef } from 'react';

/**
 * Haptic feedback patterns
 *
 * Different vibration patterns for different game events.
 */
export const HAPTIC_PATTERNS = {
  /** Light tap (10ms) - county select, button press */
  TAP: [10],

  /** Success pattern (50ms, 100ms, 50ms) - correct placement */
  SUCCESS: [50, 50, 100, 50, 50],

  /** Error pattern (200ms) - incorrect placement */
  ERROR: [200],

  /** Warning pattern (100ms, 50ms, 100ms) - hint used, time running out */
  WARNING: [100, 50, 100],

  /** Achievement unlock (custom celebration pattern) */
  ACHIEVEMENT: [50, 50, 50, 50, 100, 50, 200],

  /** Drag start (short tick to confirm drag initiated) */
  DRAG_START: [15],

  /** Snap to grid (quick tick when piece snaps) */
  SNAP: [20],

  /** Selection changed (very light feedback) */
  SELECTION: [5],
} as const;

/**
 * Haptic settings (can be persisted to localStorage)
 */
export interface HapticSettings {
  /** Enable/disable haptic feedback */
  enabled: boolean;

  /** Intensity multiplier (0.0 - 1.0) */
  intensity: number;
}

/**
 * Check if Vibration API is available
 */
function isVibrationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('vibrate' in navigator || 'mozVibrate' in navigator || 'webkitVibrate' in navigator)
  );
}

/**
 * Trigger device vibration
 *
 * @param pattern - Vibration pattern (ms or array of [vibrate, pause, vibrate, ...])
 * @returns True if vibration was triggered, false if not supported
 */
function triggerVibration(pattern: number | number[]): boolean {
  if (!isVibrationSupported()) {
    return false;
  }

  try {
    // Try standard API
    if ('vibrate' in navigator) {
      return navigator.vibrate(pattern);
    }

    // Try Mozilla-prefixed API
    if ('mozVibrate' in navigator) {
      // @ts-expect-error - mozVibrate is a non-standard API
      return navigator.mozVibrate(pattern);
    }

    // Try WebKit-prefixed API
    if ('webkitVibrate' in navigator) {
      // @ts-expect-error - webkitVibrate is a non-standard API
      return navigator.webkitVibrate(pattern);
    }

    return false;
  } catch (error) {
    // Vibration API can throw in some browsers/contexts
    console.warn('Haptic feedback failed:', error);
    return false;
  }
}

/**
 * React hook for haptic feedback
 *
 * Provides convenient methods to trigger haptic feedback
 * with automatic settings management and graceful fallbacks.
 *
 * @param settings - Haptic settings (optional)
 * @returns Object with haptic trigger methods
 *
 * @example
 * ```tsx
 * function CountyDragComponent() {
 *   const haptic = useHaptic({ enabled: true, intensity: 1.0 });
 *
 *   const handleDragStart = () => {
 *     haptic.dragStart();
 *   };
 *
 *   const handleCorrectPlacement = () => {
 *     haptic.success();
 *   };
 *
 *   return <div onDragStart={handleDragStart}>...</div>;
 * }
 * ```
 */
export function useHaptic(settings: HapticSettings = { enabled: true, intensity: 1.0 }) {
  const settingsRef = useRef(settings);

  // Update settings ref when changed
  settingsRef.current = settings;

  /**
   * Trigger haptic with settings applied
   */
  const trigger = useCallback((pattern: number | number[]) => {
    if (!settingsRef.current.enabled) {
      return false;
    }

    // Apply intensity multiplier
    const adjustedPattern = Array.isArray(pattern)
      ? pattern.map((duration) => Math.round(duration * settingsRef.current.intensity))
      : Math.round(pattern * settingsRef.current.intensity);

    return triggerVibration(adjustedPattern);
  }, []);

  /**
   * Haptic feedback methods for common game events
   */
  return {
    /** Check if haptic is supported on this device */
    isSupported: isVibrationSupported(),

    /** Light tap feedback - buttons, county select */
    tap: useCallback(() => trigger(HAPTIC_PATTERNS.TAP), [trigger]),

    /** Success feedback - correct placement */
    success: useCallback(() => trigger(HAPTIC_PATTERNS.SUCCESS), [trigger]),

    /** Error feedback - incorrect placement */
    error: useCallback(() => trigger(HAPTIC_PATTERNS.ERROR), [trigger]),

    /** Warning feedback - hint used, time warning */
    warning: useCallback(() => trigger(HAPTIC_PATTERNS.WARNING), [trigger]),

    /** Achievement feedback - unlock celebration */
    achievement: useCallback(() => trigger(HAPTIC_PATTERNS.ACHIEVEMENT), [trigger]),

    /** Drag start feedback - drag initiated */
    dragStart: useCallback(() => trigger(HAPTIC_PATTERNS.DRAG_START), [trigger]),

    /** Snap feedback - piece snapped to grid */
    snap: useCallback(() => trigger(HAPTIC_PATTERNS.SNAP), [trigger]),

    /** Selection feedback - selection changed */
    selection: useCallback(() => trigger(HAPTIC_PATTERNS.SELECTION), [trigger]),

    /** Custom pattern */
    custom: trigger,

    /** Cancel all vibrations */
    cancel: useCallback(() => triggerVibration(0), []),
  };
}

export default useHaptic;
