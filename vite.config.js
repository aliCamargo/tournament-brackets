import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Brackets',
      formats: ['es', 'umd'],
      fileName: (format) =>
        format === 'es' ? 'brackets.js' : 'brackets.umd.cjs',
    },
    rollupOptions: {
      output: {
        assetFileNames: 'brackets.[ext]',
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
});
