/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  // Section to be updated
  resolve: {
    // Your existing aliases are kept
    alias: {
      '@backend': path.resolve(__dirname, './src/backend'),
      '@ui': path.resolve(__dirname, './src/ui'),
    },
    // These new fields are added for proper Node.js module handling
    conditions: ['node'],
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },

  // This is the new section to add for hot reloading
  plugins: [
    {
      name: 'restart-electron',
      closeBundle() {
        // Emits the 'rs' command to trigger a restart
        process.stdin.emit('data', 'rs');
      },
    },
  ],

  // Your existing build and test configurations remain unchanged below
  build: {
    rollupOptions: {
      external: ['better-sqlite3'],
    },
  },
  test: {
    silent: true, // suppress all console logs from tests
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          setupFiles: ['./src/ui/setup-tests.ts'],
          include: ['src/ui/**/*.test.{ts,tsx}'],
          name: {
            label: 'browser',
            color: 'yellow',
          },
          environment: 'jsdom',
        },
      },
      {
        extends: true,
        test: {
          setupFiles: ['./src/backend/setup-tests.ts'],
          include: ['src/backend/**/*test.{ts,tsx}'],
          name: {
            label: 'node',
            color: 'green',
          },
          environment: 'node',
        },
      },
    ],
  },
});
