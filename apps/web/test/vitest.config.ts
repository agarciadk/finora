import path from "path"
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  root: path.resolve(import.meta.dirname, ".."),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "../src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: [path.resolve(import.meta.dirname, "./setup.ts")],
    include: ["test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["lcov", "text"],
      reportsDirectory: path.resolve(import.meta.dirname, "./coverage"),
      all: false,
    },
  },
})
