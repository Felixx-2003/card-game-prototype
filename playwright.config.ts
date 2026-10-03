import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 45000,
  use: { baseURL: 'http://127.0.0.1:5173', viewport: { width: 1280, height: 800 }, channel: 'chrome', screenshot: 'only-on-failure' },
  webServer: { command: 'npm.cmd run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: true, timeout: 30000 },
});
