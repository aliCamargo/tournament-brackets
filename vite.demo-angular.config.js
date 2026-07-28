import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import angular from '@analogjs/vite-plugin-angular';

function ngcCssFromSrc() {
  const ngcRoot = resolve(__dirname, '.demo-ngc');
  const srcRoot = resolve(__dirname, 'src');
  return {
    name: 'demo-ngc-css-from-src',
    resolveId(source, importer) {
      if (!importer?.includes('.demo-ngc') || !source.endsWith('.css')) {
        return null;
      }
      const abs = resolve(dirname(importer), source);
      const rel = abs.slice(ngcRoot.length + 1);
      if (rel.startsWith('src/')) {
        return resolve(__dirname, rel);
      }
      return resolve(srcRoot, rel.replace(/^demo\//, ''));
    },
  };
}

function angularDemoHtmlEntry(command) {
  return {
    name: 'angular-demo-html-entry',
    transformIndexHtml(html) {
      if (command === 'build') {
        return html.replace(
          './angular-main.ts',
          '../.demo-ngc/demo/angular-main.js',
        );
      }
      return html;
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: [
    ...(command === 'serve'
      ? [
          angular({
            tsconfig: resolve(__dirname, 'tsconfig.demo-ngc.json'),
          }),
        ]
      : [ngcCssFromSrc()]),
    angularDemoHtmlEntry(command),
  ],
  root: resolve(__dirname, 'demo'),
  base: command === 'build' ? '/tournament-brackets/' : '/',
  server: {
    fs: {
      allow: [resolve(__dirname)],
    },
  },
  build: {
    outDir: resolve(__dirname, 'demo-dist'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        angular: resolve(__dirname, 'demo/angular.html'),
      },
    },
  },
  optimizeDeps: {
    include: [
      '@angular/compiler',
      '@angular/core',
      '@angular/platform-browser',
      '@angular/common',
    ],
  },
}));
