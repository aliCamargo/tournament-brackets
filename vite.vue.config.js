import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/adapters/vue.adapter.ts'),
      name: 'VueBrackets',
      formats: ['es', 'umd'],
      fileName: (format) =>
        format === 'es' ? 'vue-adapter.js' : 'vue-adapter.umd.cjs',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
        assetFileNames: 'vue-adapter.[ext]',
      },
    },
  },
});
