import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server config. Proxy /api -> Express so the frontend
// doesn't need to care about CORS during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
