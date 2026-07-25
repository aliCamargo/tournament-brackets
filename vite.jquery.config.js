import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/adapters/jquery.adapter.ts'),
      name: 'jQueryBrackets',
      formats: ['es', 'umd'],
      fileName: (format) =>
        format === 'es' ? 'jquery-adapter.js' : 'jquery-adapter.umd.cjs',
    },
    rollupOptions: {
      external: ['jquery'],
      output: {
        globals: { jquery: 'jQuery' },
        assetFileNames: 'jquery-adapter.[ext]',
      },
    },
  },
});
