/**
 * UI/UX Constants
 *
 * Animation, timing, and visual constants
 */

export const UI_CONFIG = {
  // Animations
  TOAST_DURATION: 3000, // ms
  FADE_IN_DURATION: 300,
  FADE_OUT_DURATION: 200,

  // Transitions
  MODAL_TRANSITION: 200,
  DRAWER_TRANSITION: 300,

  // Sound effects
  SOUND_VOLUME_DEFAULT: 0.7,
  SOUND_VOLUME_PICKUP: 0.3,
  SOUND_CORRECT_PLACEMENT: 'success',
  SOUND_INCORRECT_PLACEMENT: 'error',
  SOUND_ACHIEVEMENT_UNLOCK: 'achievement',

  // County tray
  COUNTY_PILL_HEIGHT: 40,
  COUNTY_PILLS_PER_ROW: 3,
  COUNTY_TRAY_MAX_HEIGHT: 400,

  // Progress bar
  PROGRESS_BAR_HEIGHT: 8,
  PROGRESS_ANIMATION_DURATION: 500,

  // Formation animation timeouts
  FORMATION_CONTINUE_BUTTON_DELAY: 2500, // ms
  FORMATION_HIGHLIGHT_DURATION: 2000, // ms
  FORMATION_COMPLETION_DISPLAY: 5000, // ms

  // Zoom controls
  ZOOM_MIN: 0.5,
  ZOOM_MAX: 3,
  ZOOM_STEP: 0.25,
  ZOOM_WHEEL_SENSITIVITY: 0.001,

  // Pan detection
  PAN_MIN_MOVEMENT: 2, // pixels
  PAN_RESET_DELAY: 100, // ms

  // Navigation controls
  YEAR_SKIP_AMOUNT: 5, // years

  // Typography sizes
  FONT_SIZE_SMALL: 10,
  FONT_SIZE_MEDIUM: 14,
  FONT_SIZE_LARGE: 24,

  // Map projection bounds (California)
  CA_LON_MIN: -124.5,
  CA_LON_MAX: -114,
  CA_LAT_MIN: 32.5,
  CA_LAT_MAX: 42,
  CA_LON_RANGE: 10.5,
  CA_LAT_RANGE: 9.5,
  CA_MAP_PADDING: 0.8, // 80% of width/height
  CA_MAP_OFFSET: 0.1, // 10% offset
} as const;

export const COUNTY_FILL_COLORS = {
  DEFAULT: '#e5e7eb', // gray
  PLACED: '#10b981', // green
  CORRECT_HOVER: '#86efac', // light green
  WRONG_HOVER: '#fca5a5', // light red
  ACTIVE: '#fef3c7', // yellow
  FORMATION_UNFORMED: '#E5E7EB', // gray
} as const;

export const STROKE_COLORS = {
  DEFAULT: '#374151',
  HIGHLIGHTED: '#FFD700',
  RECENT: '#FFFFFF',
  VISIBLE: '#D1D5DB',
  UNFORMED: '#E5E7EB',
} as const;

export const OPACITY_VALUES = {
  HIGHLIGHTED: 0.98,
  RECENT: 0.85,
  YOUNG: 0.75, // < 5 years since formation
  DEFAULT: 0.65,
  UNFORMED: 0.2,
} as const;

export const POPULATION_THRESHOLDS = {
  LARGE: 1000000, // 1M+
  MEDIUM: 1000, // 1K+
} as const;
