// Use VITE_API_URL when set; fall back to relative URLs in production
// (the Vite dev server proxies /api → http://localhost:5000 in dev)
export const API_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
  : import.meta.env.DEV
    ? "http://localhost:5000"
    : "";
