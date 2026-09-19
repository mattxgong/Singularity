import { defineConfig, devices } from '@playwright/test'

const port = 3100
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`
const suite = process.env.PLAYWRIGHT_SUITE ?? 'e2e'

export default defineConfig({
  testDir: `./tests/${suite}`,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  // Baselines are platform-specific, so the visual suite is a reviewed local gate, not a CI job.
  ignoreSnapshots: suite !== 'visual',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.005,
      scale: 'css',
    },
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: `yarn build && yarn serve --port ${port}`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 300_000,
      },
})
