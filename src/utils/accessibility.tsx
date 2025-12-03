/**
 * Accessibility Utilities
 * WCAG 2.1 AAA compliance utilities for the California puzzle game
 */

import { ReactElement } from 'react';

export type TouchTargetSize = 'default' | 'large' | 'extra-large';

export interface TouchTargetConfig {
  minSize: number;
  padding: number;
  fontSize?: string;
}

// WCAG 2.1 AAA touch target sizes
export const TOUCH_TARGET_SIZES: Record<TouchTargetSize, TouchTargetConfig> = {
  default: {
    minSize: 44, // WCAG 2.1 AA minimum
    padding: 12,
    fontSize: '1rem',
  },
  large: {
    minSize: 52, // Enhanced for better accessibility
    padding: 16,
    fontSize: '1.125rem',
  },
  'extra-large': {
    minSize: 64, // AAA level for motor impairments
    padding: 20,
    fontSize: '1.25rem',
  },
};

const TOUCH_TARGET_STORAGE_KEY = 'ca-touch-target-size';

/**
 * Get saved touch target size preference
 */
export function getTouchTargetSize(): TouchTargetSize {
  // eslint-disable-next-line no-restricted-globals -- Required for accessibility preferences persistence
  const saved = localStorage.getItem(TOUCH_TARGET_STORAGE_KEY);
  return (saved as TouchTargetSize) || 'default';
}

/**
 * Save touch target size preference
 */
export function setTouchTargetSize(size: TouchTargetSize): void {
  // eslint-disable-next-line no-restricted-globals -- Required for accessibility preferences persistence
  localStorage.setItem(TOUCH_TARGET_STORAGE_KEY, size);
  applyTouchTargetSize(size);
}

/**
 * Apply touch target size to CSS custom properties
 */
export function applyTouchTargetSize(size: TouchTargetSize): void {
  const config = TOUCH_TARGET_SIZES[size];
  const root = document.documentElement;

  root.style.setProperty('--touch-target-min', `${config.minSize}px`);
  root.style.setProperty('--touch-target-padding', `${config.padding}px`);
  if (config.fontSize) {
    root.style.setProperty('--touch-target-font-size', config.fontSize);
  }

  // Announce to screen readers
  announceToScreenReader(`Touch target size changed to ${size}`);
}

/**
 * Calculate contrast ratio between two colors
 * Used for WCAG AAA compliance (7:1 ratio)
 */
export function getContrastRatio(fg: string, bg: string): number {
  const getLuminance = (color: string): number => {
    // Parse color string (supports hex, rgb, rgba)
    let r = 0, g = 0, b = 0;

    if (color.startsWith('#')) {
      // Hex color
      const hex = color.replace('#', '');
      r = parseInt(hex.substr(0, 2), 16) / 255;
      g = parseInt(hex.substr(2, 2), 16) / 255;
      b = parseInt(hex.substr(4, 2), 16) / 255;
    } else if (color.startsWith('rgb')) {
      // RGB/RGBA color
      const matches = color.match(/\d+/g);
      if (matches) {
        r = parseInt(matches[0]) / 255;
        g = parseInt(matches[1]) / 255;
        b = parseInt(matches[2]) / 255;
      }
    }

    // Calculate relative luminance
    const sRGB = [r, g, b].map(val => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AAA standards (7:1)
 */
export function meetsWCAGAAA(fg: string, bg: string): boolean {
  return getContrastRatio(fg, bg) >= 7;
}

/**
 * Check if contrast ratio meets WCAG AA standards (4.5:1)
 */
export function meetsWCAGAA(fg: string, bg: string): boolean {
  return getContrastRatio(fg, bg) >= 4.5;
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}

/**
 * Create descriptive ARIA label for game state
 */
export function createGameStateAriaLabel(
  totalCounties: number,
  placedCounties: number,
  currentCounty?: string
): string {
  const remaining = totalCounties - placedCounties;
  let label = `${placedCounties} of ${totalCounties} counties placed. ${remaining} remaining.`;

  if (currentCounty) {
    label += ` Currently selecting ${currentCounty}.`;
  }

  return label;
}

/**
 * Create descriptive ARIA label for county placement
 */
export function createCountyPlacementAriaLabel(
  countyName: string,
  region: string,
  isCorrect?: boolean
): string {
  let label = `${countyName} county in ${region} region.`;

  if (isCorrect !== undefined) {
    label += isCorrect ? ' Correctly placed!' : ' Incorrect placement. Try again.';
  }

  return label;
}

/**
 * Create descriptive ARIA label for map interaction
 */
export function createMapAriaLabel(
  zoomLevel: number,
  panX: number,
  panY: number
): string {
  return `California map. Zoom level ${Math.round(zoomLevel * 100)}%. Pan position: ${Math.round(panX)}, ${Math.round(panY)}.`;
}

/**
 * Keyboard navigation helper
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

export function handleKeyboardShortcut(
  event: KeyboardEvent,
  shortcuts: KeyboardShortcut[]
): boolean {
  for (const shortcut of shortcuts) {
    const ctrlMatch = !shortcut.ctrl || event.ctrlKey || event.metaKey;
    const altMatch = !shortcut.alt || event.altKey;
    const shiftMatch = !shortcut.shift || event.shiftKey;
    const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

    if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
      event.preventDefault();
      shortcut.action();
      return true;
    }
  }

  return false;
}

/**
 * Focus management utilities
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstFocusable?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Get readable color name for screen readers
 */
export function getColorName(hex: string): string {
  const colorNames: Record<string, string> = {
    '#FFD700': 'gold',
    '#0077BE': 'blue',
    '#FF6B35': 'orange',
    '#8B4513': 'brown',
    '#FF1744': 'red',
    '#87CEEB': 'sky blue',
    '#F4A460': 'sandy brown',
    '#800020': 'burgundy',
    '#4299E1': 'light blue',
    '#2D3748': 'dark gray',
    '#FFFFFF': 'white',
    '#000000': 'black',
  };

  return colorNames[hex.toUpperCase()] || 'color';
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Initialize accessibility features
 */
export function initializeAccessibility(): void {
  // Apply saved touch target size
  const touchTargetSize = getTouchTargetSize();
  applyTouchTargetSize(touchTargetSize);

  // Add accessibility classes to body
  if (prefersReducedMotion()) {
    document.body.classList.add('prefers-reduced-motion');
  }

  if (prefersHighContrast()) {
    document.body.classList.add('prefers-high-contrast');
  }

  // Set up mutation observer for dynamic content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          // Add touch target classes to buttons
          if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
            element.classList.add('touch-target');
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * Test all colors for WCAG AAA compliance
 */
export function testColorCompliance(): Record<string, { ratio: number; passes: boolean }> {
  const colors = {
    'Background/Text': ['#FFFFFF', '#000000'],
    'Primary/Background': ['#0077BE', '#FFFFFF'],
    'Accent/Background': ['#FFD700', '#FFFFFF'],
    'Error/Background': ['#D00000', '#FFFFFF'],
    'Success/Background': ['#005A00', '#FFFFFF'],
  };

  const results: Record<string, { ratio: number; passes: boolean }> = {};

  Object.entries(colors).forEach(([name, [fg, bg]]) => {
    const ratio = getContrastRatio(fg, bg);
    results[name] = {
      ratio,
      passes: ratio >= 7,
    };
  });

  return results;
}

/**
 * Wraps decorative emojis with proper ARIA attributes
 *
 * Decorative emojis should be hidden from screen readers as they
 * don't provide meaningful information to users.
 *
 * @param emoji - The emoji character(s) to wrap
 * @returns React element with aria-hidden attribute
 *
 * @example
 * ```tsx
 * <h2>
 *   {decorativeEmoji('🎯')} Target County
 * </h2>
 * ```
 */
export function decorativeEmoji(emoji: string): ReactElement {
  return (
    <span aria-hidden="true" role="presentation">
      {emoji}
    </span>
  );
}
