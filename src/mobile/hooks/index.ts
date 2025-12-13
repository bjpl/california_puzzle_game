/**
 * Mobile Hooks - Barrel Exports
 */

export { useMediaQuery, useMediaQueries } from './useMediaQuery';
export { useDeviceInfo } from './useDeviceInfo';
export type { DeviceInfo } from './useDeviceInfo';
export { useHaptic, HAPTIC_PATTERNS } from './useHaptic';
export type { HapticSettings } from './useHaptic';
export {
  useGestureDetection,
  calculateDistance,
  calculateCenterPoint,
  touchListToPoints,
} from './useGestureDetection';
export type {
  TouchPoint,
  GestureState,
  TapGesture,
  SwipeGesture,
  PinchGesture,
  GestureResult,
  GestureDetectionConfig,
} from './useGestureDetection';
export { usePinchZoom } from './usePinchZoom';
export type { PinchZoomState, PinchZoomConfig } from './usePinchZoom';
