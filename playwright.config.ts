import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL, trace: 'on-first-retry' },

  // These specs sweep their own viewports, so they run in one project only.
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      testIgnore: ['**/responsive.spec.ts', '**/home-deck.spec.ts', '**/bundle-budget.spec.ts'],
    },
    // Short viewports broke the demo's 100dvh panels; they are a first-class target.
    {
      name: 'short-viewport',
      use: { ...devices['Desktop Chrome'], viewport: { width: 740, height: 360 } },
      testIgnore: ['**/responsive.spec.ts', '**/home-deck.spec.ts', '**/bundle-budget.spec.ts'],
    },
  ],

  webServer: {
    command: 'npm run start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
