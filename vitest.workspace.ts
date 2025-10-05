/**
 * Vitest Workspace Configuration
 *
 * Purpose: Consolidates all test configurations into a single workspace
 * Used by: Vitest test runner for unit, a11y, integration, and performance tests
 * Documentation: docs/CONFIGURATION_GUIDE.md
 *
 * Last updated: 2025-10-04
 */

import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // Unit tests (default) - Fast, focused tests for individual components
  {
    extends: './vite.config.ts',
    test: {
      name: 'unit',
      include: ['tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        reportsDirectory: './coverage/unit',
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
      }
    }
  },

  // Accessibility tests - WCAG compliance and a11y validation
  {
    extends: './vite.config.ts',
    test: {
      name: 'a11y',
      include: ['tests/accessibility/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts', './tests/a11y-setup.ts'],
      testTimeout: 30000,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        reportsDirectory: './coverage/accessibility'
      }
    }
  },

  // Integration tests - Full component integration and interactions
  {
    extends: './vite.config.ts',
    test: {
      name: 'integration',
      include: ['tests/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      testTimeout: 60000,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        reportsDirectory: './coverage/integration'
      }
    }
  },

  // Performance tests - Benchmarking and performance validation
  {
    extends: './vite.config.ts',
    test: {
      name: 'performance',
      include: ['tests/performance/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      testTimeout: 120000,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        reportsDirectory: './coverage/performance'
      }
    }
  }
])
