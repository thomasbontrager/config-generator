import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // correct for custom domain (shipforge.dev)
  
  // Build configuration
  build: {
    outDir: "dist",
    sourcemap: false, // Set to true if you want source maps in production
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          react: ["react", "react-dom"],
          vendor: ["jszip", "file-saver"],
        },
      },
    },
  },
  
  // Environment variables
  // All VITE_* env vars are automatically exposed to the client
  // Set these in Cloudflare Pages → Settings → Environment Variables
  envPrefix: "VITE_",
});
