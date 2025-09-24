/**
 * Color contrast utilities for ensuring accessible text visibility
 * Provides dynamic text color selection based on background luminance
 */

/**
 * Calculate the relative luminance of a color
 * Based on WCAG 2.1 guidelines: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  // Convert RGB values to relative luminance
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a ratio between 1:1 (no contrast) and 21:1 (maximum contrast)
 */
export function getContrastRatio(
  color1: [number, number, number],
  color2: [number, number, number]
): number {
  const lum1 = getRelativeLuminance(...color1);
  const lum2 = getRelativeLuminance(...color2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Parse CSS color string to RGB values
 * Supports hex (#RGB, #RRGGBB), rgb(), rgba(), and named colors
 */
export function parseColor(color: string): [number, number, number] {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16)
      ];
    } else if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16)
      ];
    }
  }

  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1]),
      parseInt(rgbMatch[2]),
      parseInt(rgbMatch[3])
    ];
  }

  // Handle named colors (common ones)
  const namedColors: Record<string, [number, number, number]> = {
    white: [255, 255, 255],
    black: [0, 0, 0],
    red: [255, 0, 0],
    green: [0, 128, 0],
    blue: [0, 0, 255],
    yellow: [255, 255, 0],
    orange: [255, 165, 0],
    purple: [128, 0, 128],
    gray: [128, 128, 128],
    grey: [128, 128, 128]
  };

  return namedColors[color.toLowerCase()] || [128, 128, 128]; // Default to gray
}

/**
 * Get optimal text color (black or white) for maximum contrast against background
 * Returns color that meets WCAG AA standards (4.5:1 ratio) when possible
 */
export function getOptimalTextColor(
  backgroundColor: string,
  options: {
    preferredDark?: string;
    preferredLight?: string;
    fallbackDark?: string;
    fallbackLight?: string;
  } = {}
): string {
  const {
    preferredDark = '#1f2937',    // Tailwind gray-800
    preferredLight = '#ffffff',   // Pure white
    fallbackDark = '#000000',     // Pure black
    fallbackLight = '#ffffff'     // Pure white
  } = options;

  const bgColor = parseColor(backgroundColor);
  const bgLuminance = getRelativeLuminance(...bgColor);

  // Test preferred colors first
  const preferredDarkRgb = parseColor(preferredDark);
  const preferredLightRgb = parseColor(preferredLight);

  const darkContrast = getContrastRatio(bgColor, preferredDarkRgb);
  const lightContrast = getContrastRatio(bgColor, preferredLightRgb);

  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  const minContrast = 4.5;

  // Choose the color with better contrast, preferring the one that meets standards
  if (darkContrast >= minContrast && lightContrast >= minContrast) {
    // Both meet standards, choose the one with higher contrast
    return darkContrast > lightContrast ? preferredDark : preferredLight;
  } else if (darkContrast >= minContrast) {
    return preferredDark;
  } else if (lightContrast >= minContrast) {
    return preferredLight;
  } else {
    // Neither preferred color meets standards, use fallbacks
    const fallbackDarkRgb = parseColor(fallbackDark);
    const fallbackLightRgb = parseColor(fallbackLight);

    const fallbackDarkContrast = getContrastRatio(bgColor, fallbackDarkRgb);
    const fallbackLightContrast = getContrastRatio(bgColor, fallbackLightRgb);

    return fallbackDarkContrast > fallbackLightContrast ? fallbackDark : fallbackLight;
  }
}

/**
 * Get text color for county labels based on region color
 * Specialized function for California puzzle game county rendering
 */
export function getCountyTextColor(regionColor: string): string {
  return getOptimalTextColor(regionColor, {
    preferredDark: '#1f2937',     // Nice dark gray for good readability
    preferredLight: '#ffffff',    // Pure white for dark backgrounds
    fallbackDark: '#000000',      // Pure black if needed
    fallbackLight: '#ffffff'      // Pure white if needed
  });
}

/**
 * Get CSS class for text color based on background
 * Returns appropriate Tailwind classes for common scenarios
 */
export function getTextColorClass(backgroundColor: string): string {
  const optimalColor = getOptimalTextColor(backgroundColor);

  // Map common colors to Tailwind classes
  const colorClassMap: Record<string, string> = {
    '#ffffff': 'text-white',
    '#000000': 'text-black',
    '#1f2937': 'text-gray-800',
    '#374151': 'text-gray-700',
    '#4b5563': 'text-gray-600'
  };

  return colorClassMap[optimalColor] || 'text-gray-800';
}

/**
 * Check if a color combination meets WCAG accessibility standards
 */
export function meetsAccessibilityStandards(
  textColor: string,
  backgroundColor: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText = false
): boolean {
  const textRgb = parseColor(textColor);
  const bgRgb = parseColor(backgroundColor);
  const contrast = getContrastRatio(textRgb, bgRgb);

  if (level === 'AAA') {
    return isLargeText ? contrast >= 4.5 : contrast >= 7;
  } else {
    return isLargeText ? contrast >= 3 : contrast >= 4.5;
  }
}

/**
 * Get SVG fill attribute value for optimal text contrast
 * Specifically for D3/SVG text elements
 */
export function getSvgTextFill(backgroundColor: string): string {
  return getOptimalTextColor(backgroundColor, {
    preferredDark: '#1f2937',
    preferredLight: '#ffffff'
  });
}