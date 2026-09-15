import { defineConfig, devices } from '@playwright/test'

const frontendUrl = process.env.E2E_FRONTEND_URL ?? 'http://127.0.0.1:3100'
const backendUrl = process.env.BACKEND_API_URL ?? 'http://127.0.0.1:8000'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 45_000,

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  use: {
    baseURL: frontendUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  webServer: {
    command: 'npm run dev -- --port 3100',
    url: frontendUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      BACKEND_API_URL: backendUrl,
    },
  },
})