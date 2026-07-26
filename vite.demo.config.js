import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'demo'),
  esbuild: {
    jsx: 'automatic',
  },
  server: {
    fs: {
      allow: [resolve(__dirname)],
    },
  },
});
