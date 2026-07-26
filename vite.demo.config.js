import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command }) => ({
  root: resolve(__dirname, 'demo'),
  base: command === 'build' ? '/tournament-brackets/' : '/',
  esbuild: {
    jsx: 'automatic',
  },
  server: {
    fs: {
      allow: [resolve(__dirname)],
    },
  },
  build: {
    outDir: resolve(__dirname, 'demo-dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'demo/index.html'),
        jquery: resolve(__dirname, 'demo/jquery.html'),
        react: resolve(__dirname, 'demo/react.html'),
      },
    },
  },
}));
