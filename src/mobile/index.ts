/**
 * Mobile Module - Barrel Exports
 *
 * Central export file for all mobile-specific functionality.
 * Import mobile features from this single entry point.
 */

// ========================================
// COMPONENTS
// ========================================

// Bottom Sheet
export { BottomSheet, BottomSheetState } from './components/BottomSheet';
export type { BottomSheetProps } from './components/BottomSheet';

// Layout Components
export { MobilePortraitLayout } from './components/MobilePortraitLayout';
export type { MobilePortraitLayoutProps, CountyItem } from './components/MobilePortraitLayout';

export { MobileLandscapeLayout } from './components/MobileLandscapeLayout';
export type { MobileLandscapeLayoutProps } from './components/MobileLandscapeLayout';

export { MobileLayoutWrapper, LayoutMode } from './components/MobileLayoutWrapper';
export type { MobileLayoutWrapperProps } from './components/MobileLayoutWrapper';

// Touch Interaction Components
export { TouchCountyDrag } from './components/TouchCountyDrag';
export type { TouchCountyDragProps } from './components/TouchCountyDrag';

// Touch Feedback Components
export { TouchFeedback, useTouchFeedback } from './components/TouchFeedback';
export type { TouchFeedbackProps } from './components/TouchFeedback';
// Note: RippleOptions interface not exported from TouchFeedback

export { DragPreview, useDragPreview } from './components/DragPreview';
export type { DragPreviewProps, DragPreviewState } from './components/DragPreview';

export { SnapGuides, useSnapGuides } from './components/SnapGuides';
export type { SnapGuidesProps } from './components/SnapGuides';
// Note: SnapTarget and SnapState interfaces not exported from SnapGuides

// Tutorial Component
export { GestureTutorial, TutorialStep } from './components/GestureTutorial';
export type { GestureTutorialProps } from './components/GestureTutorial';

// ========================================
// HOOKS
// ========================================

export { useMediaQuery, useMediaQueries } from './hooks/useMediaQuery';
export { useDeviceInfo } from './hooks/useDeviceInfo';
export type { DeviceInfo } from './hooks/useDeviceInfo';
export { useHaptic, HAPTIC_PATTERNS } from './hooks/useHaptic';
export type { HapticSettings } from './hooks/useHaptic';

// Gesture Detection Hooks
export {
  useGestureDetection,
  calculateDistance,
  calculateCenterPoint,
  touchListToPoints,
} from './hooks/useGestureDetection';
export type {
  TouchPoint,
  GestureState,
  TapGesture,
  SwipeGesture,
  PinchGesture,
  GestureResult,
  GestureDetectionConfig,
} from './hooks/useGestureDetection';

export { usePinchZoom } from './hooks/usePinchZoom';
export type { PinchZoomState, PinchZoomConfig } from './hooks/usePinchZoom';

// ========================================
// CONFIGURATION
// ========================================

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

// ========================================
// UTILITIES
// ========================================

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
