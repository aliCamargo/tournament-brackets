import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';

function ngcCssFromSrc() {
  const ngcRoot = resolve(__dirname, '.ngc-out');
  const srcRoot = resolve(__dirname, 'src');
  return {
    name: 'ngc-css-from-src',
    resolveId(source, importer) {
      if (!importer?.includes('.ngc-out') || !source.endsWith('.css')) {
        return null;
      }
      const abs = resolve(dirname(importer), source);
      const rel = abs.slice(ngcRoot.length + 1);
      return resolve(srcRoot, rel);
    },
  };
}

export default defineConfig({
  plugins: [ngcCssFromSrc()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, '.ngc-out/adapters/angular.adapter.js'),
      name: 'AngularBrackets',
      formats: ['es', 'umd'],
      fileName: (format) =>
        format === 'es' ? 'angular-adapter.js' : 'angular-adapter.umd.cjs',
    },
    rollupOptions: {
      external: [/^@angular\//],
      output: {
        globals: {
          '@angular/core': 'ng.core',
          '@angular/common': 'ng.common',
        },
        assetFileNames: 'angular-adapter.[ext]',
      },
    },
  },
});
