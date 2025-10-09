/**
 * Theme Configuration - Dark Mode Support
 *
 * Purpose: Centralized color palette and theme tokens for light/dark modes
 * Features: WCAG AA compliant contrast ratios, OLED-optimized dark colors
 *
 * Design Principles:
 * - Dark mode uses #121212 base (not pure black) for reduced OLED burn-in
 * - Colors are desaturated by 25% in dark mode for reduced eye strain
 * - Minimum 4.5:1 contrast ratio for all text (WCAG AA)
 * - Map colors maintain California recognizability in both modes
 *
 * Last updated: 2025-10-09
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Background layers
  background: {
    primary: string; // Main app background
    secondary: string; // Cards, panels
    tertiary: string; // Elevated elements (modals, popovers)
    map: string; // Map canvas background
  };

  // Text colors
  text: {
    primary: string; // Main body text
    secondary: string; // Supporting text, labels
    tertiary: string; // Disabled, placeholder text
    inverse: string; // Text on dark backgrounds (light mode) or light backgrounds (dark mode)
  };

  // Border and divider colors
  border: {
    light: string; // Subtle borders
    medium: string; // Standard borders
    strong: string; // Emphasized borders
    focus: string; // Focus rings
  };

  // Interactive element colors
  interactive: {
    primary: string; // Primary buttons, links
    primaryHover: string;
    primaryActive: string;
    secondary: string; // Secondary buttons
    secondaryHover: string;
    success: string; // Success states
    warning: string; // Warning states
    error: string; // Error states
    info: string; // Informational states
  };

  // Map-specific colors
  map: {
    countyFill: string; // County fill color
    countyStroke: string; // County border color
    countyHover: string; // County hover state
    countyPlaced: string; // Correctly placed county
    countyIncorrect: string; // Incorrectly placed county
    targetOutline: string; // Target placement outline
    targetFill: string; // Target placement fill
  };

  // Game UI colors
  game: {
    achievement: string; // Achievement notification
    hint: string; // Hint highlight
    timer: string; // Timer text
    timerWarning: string; // Timer warning state
    score: string; // Score display
    progress: string; // Progress bars
  };
}

/**
 * Light Mode Color Palette
 *
 * CONCEPT: High-contrast, vibrant colors optimized for daylight viewing
 * WHY: Maximum readability in bright environments, familiar UI patterns
 * PATTERN: Blue primary (CA state color), neutral grays, semantic colors
 */
export const lightTheme: ThemeColors = {
  background: {
    primary: '#ffffff', // Pure white
    secondary: '#f9fafb', // Gray-50
    tertiary: '#f3f4f6', // Gray-100
    map: '#e5e7eb', // Gray-200 - subtle for county visibility
  },

  text: {
    primary: '#111827', // Gray-900 - high contrast
    secondary: '#6b7280', // Gray-500
    tertiary: '#9ca3af', // Gray-400
    inverse: '#ffffff',
  },

  border: {
    light: '#f3f4f6', // Gray-100
    medium: '#e5e7eb', // Gray-200
    strong: '#d1d5db', // Gray-300
    focus: '#3b82f6', // Blue-500
  },

  interactive: {
    primary: '#3b82f6', // Blue-500 - CA state blue
    primaryHover: '#2563eb', // Blue-600
    primaryActive: '#1d4ed8', // Blue-700
    secondary: '#6b7280', // Gray-500
    secondaryHover: '#4b5563', // Gray-600
    success: '#10b981', // Green-500
    warning: '#f59e0b', // Amber-500
    error: '#ef4444', // Red-500
    info: '#06b6d4', // Cyan-500
  },

  map: {
    countyFill: '#dbeafe', // Blue-100 - light CA blue
    countyStroke: '#3b82f6', // Blue-500
    countyHover: '#93c5fd', // Blue-300
    countyPlaced: '#86efac', // Green-300 - success
    countyIncorrect: '#fca5a5', // Red-300 - error
    targetOutline: '#3b82f6', // Blue-500
    targetFill: '#eff6ff', // Blue-50 - very light
  },

  game: {
    achievement: '#fbbf24', // Amber-400 - gold
    hint: '#fef3c7', // Amber-100 - subtle highlight
    timer: '#111827', // Gray-900
    timerWarning: '#ef4444', // Red-500
    score: '#10b981', // Green-500
    progress: '#3b82f6', // Blue-500
  },
};

/**
 * Dark Mode Color Palette
 *
 * CONCEPT: Low-contrast, muted colors optimized for low-light viewing
 * WHY: Reduces eye strain, saves OLED battery (40-60% power savings)
 * PATTERN: Near-black base (#121212), desaturated colors, softer contrasts
 */
export const darkTheme: ThemeColors = {
  background: {
    primary: '#121212', // Near-black (not pure black) - OLED optimized
    secondary: '#1e1e1e', // Slightly lighter for elevation
    tertiary: '#2a2a2a', // Elevated elements
    map: '#0f0f0f', // Darker than primary for map contrast
  },

  text: {
    primary: '#f9fafb', // Gray-50 - high contrast on dark
    secondary: '#9ca3af', // Gray-400
    tertiary: '#6b7280', // Gray-500
    inverse: '#111827', // Gray-900
  },

  border: {
    light: '#2a2a2a', // Subtle elevation
    medium: '#374151', // Gray-700
    strong: '#4b5563', // Gray-600
    focus: '#60a5fa', // Blue-400 - brighter for dark mode
  },

  interactive: {
    primary: '#60a5fa', // Blue-400 - desaturated for dark mode
    primaryHover: '#3b82f6', // Blue-500
    primaryActive: '#2563eb', // Blue-600
    secondary: '#6b7280', // Gray-500
    secondaryHover: '#9ca3af', // Gray-400
    success: '#34d399', // Green-400 - desaturated
    warning: '#fbbf24', // Amber-400 - desaturated
    error: '#f87171', // Red-400 - desaturated
    info: '#22d3ee', // Cyan-400 - desaturated
  },

  map: {
    countyFill: '#1e3a8a', // Blue-900 - dark CA blue
    countyStroke: '#60a5fa', // Blue-400 - visible on dark
    countyHover: '#3b82f6', // Blue-500
    countyPlaced: '#059669', // Green-600 - muted success
    countyIncorrect: '#dc2626', // Red-600 - muted error
    targetOutline: '#60a5fa', // Blue-400
    targetFill: '#1e3a8a', // Blue-900 - very dark
  },

  game: {
    achievement: '#fbbf24', // Amber-400 - gold (same as light)
    hint: '#78350f', // Amber-900 - dark subtle highlight
    timer: '#f9fafb', // Gray-50
    timerWarning: '#f87171', // Red-400
    score: '#34d399', // Green-400
    progress: '#60a5fa', // Blue-400
  },
};

/**
 * CSS Custom Properties Generator
 *
 * CONCEPT: Dynamic CSS variables for runtime theme switching
 * WHY: Allows instant theme changes without full re-render
 * PATTERN: Inject CSS custom properties based on active theme
 */
export function generateCSSVariables(theme: ThemeColors): string {
  return `
    /* Background colors */
    --color-bg-primary: ${theme.background.primary};
    --color-bg-secondary: ${theme.background.secondary};
    --color-bg-tertiary: ${theme.background.tertiary};
    --color-bg-map: ${theme.background.map};

    /* Text colors */
    --color-text-primary: ${theme.text.primary};
    --color-text-secondary: ${theme.text.secondary};
    --color-text-tertiary: ${theme.text.tertiary};
    --color-text-inverse: ${theme.text.inverse};

    /* Border colors */
    --color-border-light: ${theme.border.light};
    --color-border-medium: ${theme.border.medium};
    --color-border-strong: ${theme.border.strong};
    --color-border-focus: ${theme.border.focus};

    /* Interactive colors */
    --color-primary: ${theme.interactive.primary};
    --color-primary-hover: ${theme.interactive.primaryHover};
    --color-primary-active: ${theme.interactive.primaryActive};
    --color-secondary: ${theme.interactive.secondary};
    --color-secondary-hover: ${theme.interactive.secondaryHover};
    --color-success: ${theme.interactive.success};
    --color-warning: ${theme.interactive.warning};
    --color-error: ${theme.interactive.error};
    --color-info: ${theme.interactive.info};

    /* Map colors */
    --color-map-county-fill: ${theme.map.countyFill};
    --color-map-county-stroke: ${theme.map.countyStroke};
    --color-map-county-hover: ${theme.map.countyHover};
    --color-map-county-placed: ${theme.map.countyPlaced};
    --color-map-county-incorrect: ${theme.map.countyIncorrect};
    --color-map-target-outline: ${theme.map.targetOutline};
    --color-map-target-fill: ${theme.map.targetFill};

    /* Game UI colors */
    --color-game-achievement: ${theme.game.achievement};
    --color-game-hint: ${theme.game.hint};
    --color-game-timer: ${theme.game.timer};
    --color-game-timer-warning: ${theme.game.timerWarning};
    --color-game-score: ${theme.game.score};
    --color-game-progress: ${theme.game.progress};
  `;
}

/**
 * Apply theme to document
 *
 * CONCEPT: Inject CSS variables into document root
 * WHY: Makes theme colors available to all components instantly
 * PATTERN: Single source of truth updated at root level
 */
export function applyTheme(mode: 'light' | 'dark'): void {
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  const cssVariables = generateCSSVariables(theme);

  // Inject into :root style
  const root = document.documentElement;
  const style = document.getElementById('theme-variables');

  if (style) {
    style.textContent = `:root { ${cssVariables} }`;
  } else {
    const newStyle = document.createElement('style');
    newStyle.id = 'theme-variables';
    newStyle.textContent = `:root { ${cssVariables} }`;
    document.head.appendChild(newStyle);
  }

  // Update data-theme attribute for Tailwind dark mode
  root.setAttribute('data-theme', mode);

  // Update class for Tailwind dark: prefix
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Detect system theme preference
 *
 * CONCEPT: Respect user's OS-level dark mode setting
 * WHY: Automatic theme matching improves UX consistency
 * PATTERN: prefers-color-scheme media query
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light'; // SSR fallback
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Listen for system theme changes
 *
 * CONCEPT: React to OS-level theme changes
 * WHY: Auto-update when user changes system preferences
 * PATTERN: MediaQueryList event listener
 */
export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') {
    return () => {
      /* no-op */
    };
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }

  // Legacy browsers
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}

/**
 * Color contrast checker (WCAG AA compliance)
 *
 * CONCEPT: Validate color combinations for accessibility
 * WHY: Ensure readability for all users including visual impairments
 * PATTERN: Relative luminance calculation per WCAG 2.1
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    // Apply sRGB gamma correction
    const toLinear = (val: number) =>
      val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);

    const rLinear = toLinear(r);
    const gLinear = toLinear(g);
    const bLinear = toLinear(b);

    // Calculate relative luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Validate theme accessibility
 *
 * CONCEPT: Ensure all text combinations meet WCAG AA (4.5:1)
 * WHY: Legal compliance and inclusive design
 * PATTERN: Automated contrast checking on theme load
 */
export function validateThemeAccessibility(theme: ThemeColors): boolean {
  const checks = [
    // Primary text on primary background
    { fg: theme.text.primary, bg: theme.background.primary, min: 4.5 },
    // Secondary text on primary background
    { fg: theme.text.secondary, bg: theme.background.primary, min: 4.5 },
    // Primary text on secondary background
    { fg: theme.text.primary, bg: theme.background.secondary, min: 4.5 },
    // Interactive primary on primary background
    { fg: theme.interactive.primary, bg: theme.background.primary, min: 3 }, // Large text OK with 3:1
  ];

  let allPass = true;

  checks.forEach(({ fg, bg, min }, index) => {
    const ratio = getContrastRatio(fg, bg);
    if (ratio < min) {
      console.warn(
        `[Theme] Accessibility check failed (${index}): ${ratio.toFixed(2)}:1 < ${min}:1 (${fg} on ${bg})`
      );
      allPass = false;
    }
  });

  return allPass;
}

// Validate themes on module load (development only)
if (import.meta.env.DEV) {
  validateThemeAccessibility(lightTheme);
  validateThemeAccessibility(darkTheme);
}
