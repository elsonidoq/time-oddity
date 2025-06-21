import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // By default, Vite uses the project root and serves 'public' dir at '/'
  // We don't need to specify root or publicDir if using defaults.

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // The input is implicitly public/index.html, so we can remove this for now
    // to ensure it's not interfering with the dev server.
  },
  server: {
    port: 5173,
    open: true,
    host: true,
    proxy: {
      // Proxy API requests to the backend server
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      // Proxy Socket.IO connections
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@client': path.resolve(__dirname, 'src/client'),
      '@server': path.resolve(__dirname, 'src/server'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@assets': path.resolve(__dirname, 'src/client/assets')
    }
  }
}); 