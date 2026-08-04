import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import react from '@vitejs/plugin-react';
import angular from '@analogjs/vite-plugin-angular';

const repoRoot = __dirname;

function ngcCssFromSrc() {
  const ngcRoot = resolve(repoRoot, '.demo-ngc');
  const srcRoot = resolve(repoRoot, 'src');
  return {
    name: 'demo-ngc-css-from-src',
    resolveId(source, importer) {
      if (!importer?.includes('.demo-ngc') || !source.endsWith('.css')) {
        return null;
      }
      const abs = resolve(dirname(importer), source);
      const rel = abs.slice(ngcRoot.length + 1);
      if (rel.startsWith('src/')) {
        return resolve(repoRoot, rel);
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
    react({
      include: /\.(jsx|tsx)$/,
    }),
    angular({
      tsconfig: resolve(repoRoot, 'tsconfig.demo-ngc.json'),
      include: ['demo/angular-main.ts', 'src/adapters/angular.adapter.ts'],
      transformFilter: (_code, id) => {
        if (/\.(jsx|tsx)(?:\?|$)/.test(id)) {
          return false;
        }
        return (
          id.includes('angular-main') || id.includes('angular.adapter')
        );
      },
    }),
    ...(command === 'build' ? [ngcCssFromSrc(), angularDemoHtmlEntry(command)] : []),
  ],
  root: resolve(repoRoot, 'demo'),
  base: command === 'build' ? '/tournament-brackets/' : '/',
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  build: {
    outDir: resolve(repoRoot, 'demo-dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(repoRoot, 'demo/index.html'),
        jquery: resolve(repoRoot, 'demo/jquery.html'),
        react: resolve(repoRoot, 'demo/react.html'),
        angular: resolve(repoRoot, 'demo/angular.html'),
        vue: resolve(repoRoot, 'demo/vue.html'),
      },
    },
  },
  optimizeDeps: {
    include: [
      'zone.js',
      'rxjs',
      '@angular/compiler',
      '@angular/core',
      '@angular/platform-browser',
      '@angular/common',
      'react',
      'react-dom',
      'vue',
    ],
  },
}));
