import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
      '@/lib': resolve(__dirname, '../../src/lib'),
      '@/services': resolve(__dirname, '../../src/services'),
      '@/components': resolve(__dirname, '../../src/components'),
      '@/stores': resolve(__dirname, '../../src/stores'),
      '@/utils': resolve(__dirname, '../../src/utils'),
      '@/config': resolve(__dirname, '../../src/config'),
      '@/types': resolve(__dirname, '../../src/types'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['../setup.ts'],
    include: ['*.test.ts'],
    testTimeout: 30000,
  },
});
