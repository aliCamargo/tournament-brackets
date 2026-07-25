import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'demo'),
  server: {
    fs: {
      // Allow importing ../src from the demo root
      allow: [resolve(__dirname)],
    },
  },
});
