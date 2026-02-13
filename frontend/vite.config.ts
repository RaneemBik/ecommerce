import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: {
    // Proxy API requests to the backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: "dist",
  },
});
