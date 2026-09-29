import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset URLs relative so the build works from any path or iframe.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    // three.js alone is ~700 kB minified. The real budget is 1.5 MB of gzipped JS + CSS
    // (SCOPE §10), so only warn well past the default 500 kB.
    chunkSizeWarningLimit: 1600,
  },
});
