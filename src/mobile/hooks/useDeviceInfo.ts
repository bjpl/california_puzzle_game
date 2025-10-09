/**
 * useDeviceInfo Hook
 *
 * Provides comprehensive device and viewport information for mobile optimization.
 * Tracks viewport size, device type, orientation, and capabilities.
 */

import { useState, useEffect } from 'react';
import {
  DeviceType,
  Orientation,
  getDeviceType,
  getOrientation,
  isMobileDevice,
  isTabletDevice,
  isTouchDevice,
  prefersReducedMotion,
  prefersDarkMode,
} from '../config/breakpoints';

export interface DeviceInfo {
  /** Current viewport width */
  width: number;

  /** Current viewport height */
  height: number;

  /** Device type category */
  deviceType: DeviceType;

  /** Current orientation */
  orientation: Orientation;

  /** Is mobile device (phone) */
  isMobile: boolean;

  /** Is tablet device */
  isTablet: boolean;

  /** Is desktop device */
  isDesktop: boolean;

  /** Has touch capability */
  isTouch: boolean;

  /** User prefers reduced motion */
  reducedMotion: boolean;

  /** User prefers dark mode */
  darkMode: boolean;

  /** Device pixel ratio (for retina displays) */
  pixelRatio: number;

  /** Is portrait orientation */
  isPortrait: boolean;

  /** Is landscape orientation */
  isLandscape: boolean;
}

/**
 * Get current device information
 */
function getCurrentDeviceInfo(): DeviceInfo {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const height = typeof window !== 'undefined' ? window.innerHeight : 768;
  const deviceType = getDeviceType(width);
  const orientation = getOrientation(width, height);

  return {
    width,
    height,
    deviceType,
    orientation,
    isMobile: isMobileDevice(width),
    isTablet: isTabletDevice(width),
    isDesktop: !isMobileDevice(width) && !isTabletDevice(width),
    isTouch: typeof window !== 'undefined' ? isTouchDevice() : false,
    reducedMotion: typeof window !== 'undefined' ? prefersReducedMotion() : false,
    darkMode: typeof window !== 'undefined' ? prefersDarkMode() : false,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    isPortrait: orientation === Orientation.PORTRAIT,
    isLandscape: orientation === Orientation.LANDSCAPE,
  };
}

/**
 * React hook to track device information
 *
 * Updates automatically when viewport size changes or
 * when user preferences change (dark mode, reduced motion).
 *
 * @param debounceMs - Debounce delay for resize events (default: 150ms)
 * @returns Current device information
 *
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const device = useDeviceInfo();
 *
 *   if (device.isMobile) {
 *     return <MobileLayout />;
 *   }
 *
 *   return <DesktopLayout />;
 * }
 * ```
 */
export function useDeviceInfo(debounceMs = 150): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getCurrentDeviceInfo);

  useEffect(() => {
    let timeoutId: number;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setDeviceInfo(getCurrentDeviceInfo());
      }, debounceMs);
    };

    const handleOrientationChange = () => {
      setDeviceInfo(getCurrentDeviceInfo());
    };

    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      setDeviceInfo((prev) => ({
        ...prev,
        darkMode: e.matches,
      }));
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setDeviceInfo((prev) => ({
        ...prev,
        reducedMotion: e.matches,
      }));
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Add orientation change listener
    window.addEventListener('orientationchange', handleOrientationChange);

    // Add media query listeners for preferences
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', handleColorSchemeChange);
      reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    }

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);

      if (darkModeQuery.removeEventListener) {
        darkModeQuery.removeEventListener('change', handleColorSchemeChange);
        reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      }
    };
  }, [debounceMs]);

  return deviceInfo;
}

export default useDeviceInfo;
