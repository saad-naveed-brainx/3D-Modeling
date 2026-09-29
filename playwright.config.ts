import { defineConfig, devices } from '@playwright/test';

const PORT = 5199;
const desktopViewport = { width: 1440, height: 900 };

// Headless Chromium defaults to software WebGL (SwiftShader, ~6 fps). On macOS, ANGLE's Metal
// backend gives real GPU rendering (60 fps). SwiftShader stays allowed as the fallback elsewhere.
const chromiumGpu = {
  launchOptions: {
    args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
  },
};

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  timeout: 90_000,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: desktopViewport, ...chromiumGpu },
    },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'], viewport: desktopViewport } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'], ...chromiumGpu } },
    { name: 'webkit-mobile', use: { ...devices['iPhone 15'] } },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
