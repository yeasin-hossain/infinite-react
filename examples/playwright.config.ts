// playwright.config.ts
import { PlaywrightTestConfig, devices } from '@playwright/test';

const width = 1400;
const height = 1200;

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 5 : 1,

  // Limit the number of failures on CI to save resources
  // maxFailures: process.env.CI ? 10 : undefined,
  timeout: process.env.CI ? 10000 : 5000,

  // Limit the number of workers on CI, use 4 locally
  // workers: process.env.CI ? 1 : 4,
  workers: 4,
  fullyParallel: true,

  use: {
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    // video: 'on-first-retry',
    // video: 'retain-on-failure',
    headless: true,

    viewport: { width, height },
    ignoreHTTPSErrors: true,
    // launchOptions: {
    //   slowMo: 500000, // uncomment this and also add headless: false, so you can easily debug
    // },

    baseURL: 'http://localhost:3000/',
  },
  projects: [
    {
      name: 'chromium',
      testMatch: /.*.spec.ts/,

      use: { ...devices['Desktop Chrome'] },
    },
  ],
};
export default config;
