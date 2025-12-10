import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: [], // Ensure dependencies are bundled unless strictly using CDN
    },
  },
  server: {
    host: true,
  },
  resolve: {
    alias: {
      '@': '/',
    },
  },
});