/**
 * Vite Configuration
 *
 * Purpose: Main build configuration for production and development
 * Used by: Vite build tool and Vitest test runner
 * Documentation: docs/CONFIGURATION_GUIDE.md, docs/CODE_SPLITTING.md
 *
 * Last updated: 2025-10-04
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // 'sunburst', 'treemap', 'network'
    }),
    // Brotli compression - 20-30% better than gzip
    // Compresses JS/CSS files for smaller transfer sizes
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // Only compress files > 10KB
      deleteOriginFile: false, // Keep original for browsers without Brotli support
    }),
    // Gzip compression - fallback for older browsers
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files > 10KB
      deleteOriginFile: false,
    }),
  ],
  base: '/california_puzzle_game/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    // Disable sourcemaps in production for security and bundle size
    // Saves ~800KB-1MB in production builds
    // Sourcemaps still available in development mode
    sourcemap: false,
    chunkSizeWarningLimit: 500, // Set to 500kb
    rollupOptions: {
      external: [
        '@sentry/react', // Make Sentry optional - only loaded if DSN provided
      ],
      output: {
        manualChunks: {
          // Vendor chunks - Core libraries
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@dnd-kit/core', 'lucide-react', 'framer-motion'],
          'vendor-geo': ['d3', 'd3-geo', 'd3-selection', 'd3-zoom', 'd3-drag'],
          'vendor-storage': ['zustand'],
          'vendor-supabase': ['@supabase/supabase-js'],

          // Feature chunks - Large components
          'map-components': [
            './src/components/map/CaliforniaMapFixed.tsx',
            './src/components/map/CaliforniaMapCanvas.tsx',
            './src/components/map/CaliforniaMapSimple.tsx',
            './src/components/map/StudyModeMap.tsx',
          ],
          'study-mode': [
            './src/components/study/StudyMode.tsx',
            './src/components/study/EnhancedStudyMode.tsx',
            './src/components/study/StudyModeCard.tsx',
          ],
          'achievements': [
            './src/components/game/achievements/AchievementGallery.tsx',
            './src/components/game/achievements/AchievementNotification.tsx',
          ],
          'game-features': [
            './src/components/game/GameModeSelector.tsx',
            './src/components/game/DifficultySystem.tsx',
            './src/components/game/ProgressionSystem.tsx',
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/setup.ts',
        '**/*.d.ts',
        '**/*.config.ts',
        'dist/',
        'public/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache']
  },
})