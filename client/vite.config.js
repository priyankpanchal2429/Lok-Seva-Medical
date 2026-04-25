import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://lok-seva-medical.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
