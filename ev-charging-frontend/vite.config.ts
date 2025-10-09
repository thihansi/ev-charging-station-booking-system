import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Removed proxy configuration - now connecting directly to backend API
  // All API calls go through the configured apiClient with proper base URL
});
