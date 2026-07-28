/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup/angular-vitest.ts'],
    include: ['tests/angular-adapter.test.ts'],
  },
});
