/**
 * Mobile Responsive Breakpoints Configuration
 *
 * Defines viewport breakpoints and device categorization for mobile-optimized
 * layouts. Based on California Counties Puzzle Mobile PRD v1.0.0.
 *
 * @see docs/MOBILE_PRD.md - Section: Responsive Breakpoints
 */

/**
 * Breakpoint pixel values
 *
 * Following mobile-first design principles with breakpoints
 * optimized for common device viewports.
 */
export const BREAKPOINTS = {
  /** Small phones (iPhone SE 1st gen) */
  SMALL_PHONE: 320,

  /** Medium phones (iPhone 12/13, most Android) */
  MEDIUM_PHONE: 375,

  /** Large phones (iPhone Pro Max, large Android) */
  LARGE_PHONE: 428,

  /** Small tablets and phablets */
  SMALL_TABLET: 768,

  /** Large tablets (iPad Pro) */
  LARGE_TABLET: 1024,

  /** Desktop breakpoint (non-mobile) */
  DESKTOP: 1280,
} as const;

/**
 * Device type categories based on viewport width
 */
export enum DeviceType {
  SMALL_PHONE = 'small-phone',
  MEDIUM_PHONE = 'medium-phone',
  LARGE_PHONE = 'large-phone',
  SMALL_TABLET = 'small-tablet',
  LARGE_TABLET = 'large-tablet',
  DESKTOP = 'desktop',
}

/**
 * Orientation types
 */
export enum Orientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

/**
 * Media query strings for use in CSS-in-JS or matchMedia
 */
export const MEDIA_QUERIES = {
  /** Max-width queries (mobile-first) */
  smallPhone: `(max-width: ${BREAKPOINTS.MEDIUM_PHONE - 1}px)`,
  mediumPhone: `(min-width: ${BREAKPOINTS.MEDIUM_PHONE}px) and (max-width: ${BREAKPOINTS.LARGE_PHONE - 1}px)`,
  largePhone: `(min-width: ${BREAKPOINTS.LARGE_PHONE}px) and (max-width: ${BREAKPOINTS.SMALL_TABLET - 1}px)`,
  smallTablet: `(min-width: ${BREAKPOINTS.SMALL_TABLET}px) and (max-width: ${BREAKPOINTS.LARGE_TABLET - 1}px)`,
  largeTablet: `(min-width: ${BREAKPOINTS.LARGE_TABLET}px) and (max-width: ${BREAKPOINTS.DESKTOP - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.DESKTOP}px)`,

  /** Mobile (all phones) */
  mobile: `(max-width: ${BREAKPOINTS.SMALL_TABLET - 1}px)`,

  /** Tablet (all tablets) */
  tablet: `(min-width: ${BREAKPOINTS.SMALL_TABLET}px) and (max-width: ${BREAKPOINTS.DESKTOP - 1}px)`,

  /** Orientation queries */
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',

  /** Touch device detection */
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)',

  /** High DPI / Retina displays */
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',

  /** Prefer reduced motion (accessibility) */
  reducedMotion: '(prefers-reduced-motion: reduce)',

  /** Dark mode preference */
  darkMode: '(prefers-color-scheme: dark)',
} as const;

/**
 * Touch target minimum sizes (WCAG AAA compliance)
 */
export const TOUCH_TARGETS = {
  /** WCAG AAA minimum (recommended) */
  MIN_SIZE_AAA: 44,

  /** WCAG AA minimum */
  MIN_SIZE_AA: 24,

  /** Optimal size for comfortable touch interaction */
  OPTIMAL_SIZE: 48,

  /** Large size for primary actions */
  LARGE_SIZE: 56,

  /** Extra large for FAB (Floating Action Button) */
  EXTRA_LARGE_SIZE: 64,
} as const;

/**
 * Mobile layout dimensions
 */
export const LAYOUT_DIMENSIONS = {
  /** Header heights */
  MOBILE_HEADER_HEIGHT: 56,
  MOBILE_HEADER_HEIGHT_WITH_TABS: 104,

  /** Bottom navigation heights */
  BOTTOM_NAV_HEIGHT: 56,
  BOTTOM_SHEET_COLLAPSED: 64,
  BOTTOM_SHEET_HALF: '50vh',
  BOTTOM_SHEET_FULL: '90vh',

  /** Map viewport percentages (portrait) */
  MAP_HEIGHT_PORTRAIT_SMALL: '55vh',
  MAP_HEIGHT_PORTRAIT_MEDIUM: '60vh',
  MAP_HEIGHT_PORTRAIT_LARGE: '65vh',

  /** Map viewport percentages (landscape tablet) */
  MAP_WIDTH_LANDSCAPE: '70vw',

  /** County tray heights */
  COUNTY_TRAY_HEIGHT_SMALL: '35vh',
  COUNTY_TRAY_HEIGHT_MEDIUM: '30vh',
  COUNTY_TRAY_HEIGHT_LARGE: '25vh',

  /** Safe area insets (iOS notch, etc.) */
  SAFE_AREA_TOP: 'env(safe-area-inset-top)',
  SAFE_AREA_BOTTOM: 'env(safe-area-inset-bottom)',
  SAFE_AREA_LEFT: 'env(safe-area-inset-left)',
  SAFE_AREA_RIGHT: 'env(safe-area-inset-right)',
} as const;

/**
 * Font size scale for mobile
 *
 * Uses clamp() for fluid typography that scales between breakpoints
 */
export const MOBILE_FONT_SIZES = {
  /** Small phones: 14px, Medium phones: 16px */
  base: 'clamp(14px, 4vw, 16px)',

  /** Small phones: 12px, Medium phones: 14px */
  small: 'clamp(12px, 3.5vw, 14px)',

  /** Small phones: 10px, Medium phones: 12px */
  extraSmall: 'clamp(10px, 3vw, 12px)',

  /** Small phones: 18px, Medium phones: 20px */
  large: 'clamp(18px, 5vw, 20px)',

  /** Small phones: 22px, Medium phones: 24px */
  title: 'clamp(22px, 6vw, 24px)',

  /** Small phones: 26px, Medium phones: 32px */
  heading: 'clamp(26px, 8vw, 32px)',
} as const;

/**
 * Animation durations for mobile
 *
 * Adjusted for mobile performance (slightly faster than desktop)
 */
export const MOBILE_ANIMATIONS = {
  /** Quick state changes */
  FAST: 150,

  /** Standard transitions */
  NORMAL: 250,

  /** Smooth page transitions */
  SLOW: 350,

  /** Bottom sheet swipe gesture */
  BOTTOM_SHEET: 300,

  /** Touch feedback (very quick) */
  TOUCH_FEEDBACK: 100,

  /** Haptic timing delays */
  HAPTIC_SHORT: 10,
  HAPTIC_MEDIUM: 50,
  HAPTIC_LONG: 200,
} as const;

/**
 * Gesture thresholds and sensitivity
 */
export const GESTURE_CONFIG = {
  /** Minimum swipe distance to trigger (px) */
  SWIPE_THRESHOLD: 50,

  /** Minimum swipe velocity (px/ms) */
  SWIPE_VELOCITY: 0.3,

  /** Press and hold duration to start drag (ms) */
  PRESS_AND_HOLD_DURATION: 300,

  /** Maximum time for tap gesture (ms) */
  TAP_MAX_DURATION: 300,

  /** Pinch zoom min/max scale */
  ZOOM_MIN_SCALE: 0.5,
  ZOOM_MAX_SCALE: 3.0,
  ZOOM_STEP: 0.1,

  /** Snap distance threshold (px) */
  SNAP_THRESHOLD: 50,

  /** Drag offset from touch point (px) */
  DRAG_PREVIEW_OFFSET: 20,
} as const;

/**
 * Performance budgets for mobile
 */
export const PERFORMANCE_BUDGETS = {
  /** Target metrics */
  TARGET_FCP: 1500, // First Contentful Paint (ms)
  TARGET_TTI: 3000, // Time to Interactive (ms)
  TARGET_TBT: 150, // Total Blocking Time (ms)
  TARGET_CLS: 0.05, // Cumulative Layout Shift
  TARGET_LCP: 2000, // Largest Contentful Paint (ms)

  /** Budget limits (fail if exceeded) */
  BUDGET_FCP: 1800,
  BUDGET_TTI: 3800,
  BUDGET_TBT: 300,
  BUDGET_CLS: 0.1,
  BUDGET_LCP: 2500,

  /** Touch response latency */
  TOUCH_RESPONSE_TARGET: 50,
  TOUCH_RESPONSE_BUDGET: 100,

  /** Frame rate */
  TARGET_FPS: 60,
  MIN_FPS: 50,
} as const;

/**
 * Helper function to get device type from viewport width
 */
export function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.MEDIUM_PHONE) return DeviceType.SMALL_PHONE;
  if (width < BREAKPOINTS.LARGE_PHONE) return DeviceType.MEDIUM_PHONE;
  if (width < BREAKPOINTS.SMALL_TABLET) return DeviceType.LARGE_PHONE;
  if (width < BREAKPOINTS.LARGE_TABLET) return DeviceType.SMALL_TABLET;
  if (width < BREAKPOINTS.DESKTOP) return DeviceType.LARGE_TABLET;
  return DeviceType.DESKTOP;
}

/**
 * Helper function to check if device is mobile
 */
export function isMobileDevice(width: number): boolean {
  return width < BREAKPOINTS.SMALL_TABLET;
}

/**
 * Helper function to check if device is tablet
 */
export function isTabletDevice(width: number): boolean {
  return width >= BREAKPOINTS.SMALL_TABLET && width < BREAKPOINTS.DESKTOP;
}

/**
 * Helper function to get orientation
 */
export function getOrientation(width: number, height: number): Orientation {
  return height > width ? Orientation.PORTRAIT : Orientation.LANDSCAPE;
}

/**
 * Helper to check if touch device
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - Legacy IE/Edge property
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Helper to check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia(MEDIA_QUERIES.reducedMotion).matches;
}

/**
 * Helper to check if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia(MEDIA_QUERIES.darkMode).matches;
}

/**
 * Get optimal touch target size for device
 */
export function getOptimalTouchTargetSize(deviceType: DeviceType): number {
  switch (deviceType) {
    case DeviceType.SMALL_PHONE:
      return TOUCH_TARGETS.OPTIMAL_SIZE;
    case DeviceType.MEDIUM_PHONE:
    case DeviceType.LARGE_PHONE:
      return TOUCH_TARGETS.MIN_SIZE_AAA;
    case DeviceType.SMALL_TABLET:
    case DeviceType.LARGE_TABLET:
      return TOUCH_TARGETS.MIN_SIZE_AA;
    default:
      return TOUCH_TARGETS.MIN_SIZE_AA;
  }
}
