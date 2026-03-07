// Vitest configuration — tells the test runner how to work with our project.
// Think of this as the "settings" for our testing tool.

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom to simulate a browser environment (tests run in Node.js,
    // but our components need things like document, window, etc.)
    environment: "jsdom",
    // Run this setup file before every test
    setupFiles: ["./src/test/setup.ts"],
    // Look for test files in __tests__ folders or files ending in .test.ts/.test.tsx
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    // This makes the "@/" import alias work in tests (same as in the app)
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
