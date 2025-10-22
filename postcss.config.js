/**
 * PostCSS Configuration
 *
 * Purpose: Configures PostCSS processing pipeline for CSS
 * Used by: Vite build process
 * Documentation: docs/CONFIGURATION_GUIDE.md
 *
 * Last updated: 2025-10-04
 */

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      // Remove deprecated vendor prefixes
      remove: true,
      // Don't add -moz- prefixes for column-gap and column-break-inside
      // These are supported natively in modern Firefox
      overrideBrowserslist: [
        'last 2 versions',
        'Firefox ESR',
        'not dead',
        'not IE 11',
        'not op_mini all',
      ],
    },
  },
};
