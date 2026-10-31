import { defineConfig, devices } from '@playwright/test';

// E2E over the static build, served like the Cloudflare assets handler (scripts/serve-dist.ts).
// Chromium and WebKit, as the plan requires. Build first: pnpm build (pnpm verificar does).
// FO_PORT lets two checkouts run the suite at once (agent worktrees); CI and verificar use 4173.
const PORT = Number(process.env['FO_PORT'] ?? 4173);

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  ...(process.env['CI'] ? { workers: 2 } : {}),
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : [['list']],
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'node scripts/serve-dist.ts',
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env['CI'],
    env: { PORT: String(PORT) },
  },
});
