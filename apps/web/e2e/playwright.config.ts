import path from "path"
import { fileURLToPath } from "url"
import { defineConfig, devices } from "@playwright/test"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = 5173
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Every test authenticates against a single, real API/DB instance (bcrypt
  // hashing is CPU-bound and blocks the event loop), so running many workers
  // in parallel locally causes unrelated tests to time out waiting on a
  // saturated backend. Keep this serial, same as CI.
  workers: 1,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }]]
    : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    locale: "es-ES",
  },
  projects: [
    {
      name: 'e2e',
      testIgnore: '**/*.a11y.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'accessibility',
      testMatch: '**/*.a11y.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter @finora/api start",
      cwd: path.resolve(__dirname, "../../.."),
      url: "http://localhost:3000/health",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: "pnpm dev",
      cwd: path.resolve(__dirname, ".."),
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
})
