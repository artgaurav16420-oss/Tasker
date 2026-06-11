import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react', 'recharts'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR !== 'true',
    proxy: {
      '/rest/v1': { target: 'http://10.34.2.206:54421', changeOrigin: true },
      '/auth/v1': { target: 'http://10.34.2.206:54421', changeOrigin: true },
      '/realtime/v1': { target: 'http://10.34.2.206:54421', changeOrigin: true, ws: true },
      '/storage/v1': { target: 'http://10.34.2.206:54421', changeOrigin: true },
    },
  },
});
