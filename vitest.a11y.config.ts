import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts', './tests/a11y-setup.ts'],
    include: ['tests/accessibility/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/accessibility'
    }
  }
});