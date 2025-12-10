import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Prevent 'process is not defined' error in browser
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env': {} 
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'lucide-react', '@google/genai'],
          },
        },
      },
    },
    server: {
      host: true,
      historyApiFallback: true,
    },
    resolve: {
      alias: {
        '@': '/',
      },
    },
  };
});