import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split large vendor chunks for better caching
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router'],
          'vendor-gsap':   ['gsap'],
          'vendor-radix':  ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
});
