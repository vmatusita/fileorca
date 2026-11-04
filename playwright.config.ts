import { defineConfig, devices } from '@playwright/test';

// E2E over the static build, served like the Cloudflare assets handler (scripts/serve-dist.ts).
// Chromium and WebKit, as the plan requires. Build first: pnpm build (pnpm verificar does).
// FO_PORT lets two checkouts run the suite at once (agent worktrees); CI and verificar use 4173.
const PORT = Number(process.env['FO_PORT'] ?? 4173);
// F12 (DECISOES § 414): the test build (the ads with fake ids and the wall) has a server of its own, 100 ports above, that
// builds only when a spec asks for it (tests/e2e/lib/test-build.ts), once per run of Playwright: the run id is set here, in
// the runner, and the workers inherit it.
const TEST_BUILD_PORT = PORT + 100;
process.env['FO_RUN_ID'] ??= `${process.pid}-${Date.now()}`;

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
    // The trace of a failing test keeps the DOM snapshots, the network and the sources, but not the screencast: on the
    // Linux WebKit of the CI the frames of the animated pages piled up in each worker's trace resources until the disk
    // was full (ENOSPC), once the CI ran WebKit alone in its jobs (DECISOES § 90).
    trace: { mode: 'retain-on-failure', screenshots: false },
    // F8: the service worker would answer from its cache what page.route and context.route expect to see, so every
    // spec runs without it; the specs of the service worker turn it on with test.use (DECISOES § 294).
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    {
      command: 'node scripts/serve-dist.ts',
      url: `http://127.0.0.1:${PORT}/`,
      reuseExistingServer: !process.env['CI'],
      env: { PORT: String(PORT) },
    },
    {
      command: 'node scripts/serve-test-build.ts',
      url: `http://127.0.0.1:${TEST_BUILD_PORT}/__health`,
      reuseExistingServer: !process.env['CI'],
      env: { PORT: String(TEST_BUILD_PORT) },
    },
  ],
});
