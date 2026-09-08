import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration with Tailwind CSS dark mode support
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});