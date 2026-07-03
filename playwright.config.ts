import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      // Validates that prerendered (RSC) pages render with JavaScript
      // completely disabled.
      name: "no-js",
      testMatch: /no-js\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], javaScriptEnabled: false },
    },
    {
      // Validates hydration, client islands, and client-side navigation
      // between RSC pages and normal pages.
      name: "js",
      testMatch: /with-js\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Serves the prerendered output in build/client. Run `npm run build`
    // first (or use `npm test`, which builds automatically).
    command: "node server.mjs",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
