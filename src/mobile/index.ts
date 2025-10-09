/**
 * Mobile Module - Barrel Exports
 *
 * Central export file for all mobile-specific functionality.
 * Import mobile features from this single entry point.
 */

// Components
export { BottomSheet, BottomSheetState } from './components/BottomSheet';
export type { BottomSheetProps } from './components/BottomSheet';

// Hooks
export { useMediaQuery, useMediaQueries } from './hooks/useMediaQuery';
export { useDeviceInfo } from './hooks/useDeviceInfo';
export type { DeviceInfo } from './hooks/useDeviceInfo';
export { useHaptic, HAPTIC_PATTERNS } from './hooks/useHaptic';
export type { HapticSettings } from './hooks/useHaptic';

// Configuration
export {
  BREAKPOINTS,
  MEDIA_QUERIES,
  TOUCH_TARGETS,
  LAYOUT_DIMENSIONS,
  MOBILE_FONT_SIZES,
  MOBILE_ANIMATIONS,
  GESTURE_CONFIG,
  PERFORMANCE_BUDGETS,
  DeviceType,
  Orientation,
  getDeviceType,
  isMobileDevice,
  isTabletDevice,
  getOrientation,
  isTouchDevice,
  prefersReducedMotion,
  prefersDarkMode,
  getOptimalTouchTargetSize,
} from './config/breakpoints';

export {
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
} from './config/touchSensors';
export type { DragCancelConditions } from './config/touchSensors';

// Utilities
export {
  GeodetaLevel,
  ConnectionType,
  getOptimalGeodetaLevel,
  loadGeodata,
  preloadGeodata,
  clearGeodataCache,
  getGeodataCacheStatus,
  canLoadHighResolution,
  AdaptiveGeodataLoader,
} from './utils/progressiveGeodata';
