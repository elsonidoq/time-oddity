import { defineConfig } from 'vite';

export default defineConfig({
  root: 'client',
  plugins: [],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
  build: {
    outDir: '../dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: 'client/src/main.js',
    },
  },
}); 