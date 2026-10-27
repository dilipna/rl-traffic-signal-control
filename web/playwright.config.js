import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  expect: { timeout: 10000 },
  forbidOnly: true,
  retries: 0,
  workers: 2,
  reporter: [
    ["list"],
    ["json", { outputFile: "browser-evidence/results.json" }],
  ],
  use: {
    baseURL: process.env.TEST_ORIGIN || "http://127.0.0.1:3276",
    trace: "retain-on-failure",
  },
  webServer: process.env.TEST_ORIGIN
    ? undefined
    : {
        command: "npm run preview -- --port 3276",
        url: "http://127.0.0.1:3276",
        reuseExistingServer: false,
      },
});
