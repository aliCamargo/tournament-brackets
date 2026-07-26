import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/adapters/react.adapter.tsx'),
      name: 'ReactBrackets',
      formats: ['es', 'umd'],
      fileName: (format) =>
        format === 'es' ? 'react-adapter.js' : 'react-adapter.umd.cjs',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react/jsx-runtime': 'jsxRuntime',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: 'react-adapter.[ext]',
      },
    },
  },
});
