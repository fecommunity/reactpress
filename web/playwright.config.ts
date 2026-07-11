import { defineConfig, devices } from "@playwright/test";

/** Node global when `tsconfig` does not include `@types/node` (pre-commit may lint before lockfile updates). */
declare const process: { env: { CI?: string } };

const ci = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 2 : 0,
  workers: ci ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      "VITE_ENABLE_MOCK=true VITE_AUTH_MODE=mock VITE_DEV_API_PROXY_TARGET=http://localhost:3002 vp dev",
    url: "http://localhost:3000",
    reuseExistingServer: !ci,
  },
});
