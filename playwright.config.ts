import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: "html",
    use: {
        baseURL: process.env.NEXTAUTH_URL || "http://localhost:3001",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },
    projects: [
        {
            name: "setup",
            testMatch: /global-setup\.ts/,
        },
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                storageState: "./e2e/.auth/admin.json",
            },
            dependencies: ["setup"],
        },
    ],
    webServer: process.env.CI
        ? undefined
        : {
              command: "npx dotenv -e .env.test -- next dev -p 3001",
              url: "http://localhost:3001",
              reuseExistingServer: true,
              timeout: 120000,
          },
});
