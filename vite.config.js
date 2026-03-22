import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // correct for custom domain (shipforge.dev)
  server: {
    allowedHosts: ['config.shipforge.local', '127.0.0.1', 'localhost', 'shipforge.dev', 'www.shipforge.dev'],
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});