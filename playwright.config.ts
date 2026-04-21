import { defineConfig, devices } from "@playwright/test";

// Test-only credentials — never used in production.
// In CI, override via workflow env vars: AEGIS_OPERATOR_PIN, AEGIS_AUTH_SECRET.
const TEST_PIN = process.env.AEGIS_OPERATOR_PIN ?? "aegis-e2e-test";
const TEST_SECRET = process.env.AEGIS_AUTH_SECRET ?? "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    // Phase 1: authenticate once, save session state
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },
    // Phase 2: run all specs with the saved session
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/session.json",
      },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...(process.env as Record<string, string>),
      AEGIS_OPERATOR_PIN: TEST_PIN,
      AEGIS_AUTH_SECRET: TEST_SECRET,
    },
  },
});
