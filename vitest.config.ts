import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    /**
     * Integration tests share one MySQL database, so running files in parallel
     * lets one suite mutate stock or truncate orders while another is asserting
     * on them. The whole suite runs in about two seconds, so serialising costs
     * nothing and removes that class of flake entirely.
     */
    fileParallelism: false,
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/features/**/server/**'],
    },
  },
  resolve: {
    alias: {
      '@db': fileURLToPath(new URL('./db', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)),
    },
  },
});
