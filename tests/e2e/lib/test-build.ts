// The test build in the specs (F12, decision 2; DECISOES § 414): the same code with the test publisher id, fake ids in the
// 37 units of the ad map (the worst case) and the wall in "bloqueio", served by scripts/serve-test-build.ts on FO_PORT
// plus 100. A spec that reads it calls useTestBuild(test) at the top: its beforeAll asks the server for the build (made
// once per run of Playwright, or reused when the commit and the variables are the same and the tree is clean) with a
// timeout of its own, and the spec's baseURL becomes the test server. Pages on fileorca.com go through production.ts.
import type { TestType } from '@playwright/test';

/** The default build (dist/), served by playwright.config.ts on FO_PORT. */
export const DEFAULT_BUILD_ORIGIN = `http://127.0.0.1:${Number(process.env['FO_PORT'] ?? 4173)}`;
export const TEST_BUILD_ORIGIN = `http://127.0.0.1:${Number(process.env['FO_PORT'] ?? 4173) + 100}`;
/** Room for the build in the beforeAll: a cold astro build of the site takes about a minute on the CI. */
const BUILD_TIMEOUT_MS = 600_000;

/** Waits until the test build of this run is ready (the first call of a run makes it). */
export async function testBuildReady(): Promise<void> {
  const response = await fetch(`${TEST_BUILD_ORIGIN}/__test-build?run=${encodeURIComponent(process.env['FO_RUN_ID'] ?? '')}`, {
    signal: AbortSignal.timeout(BUILD_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`build de teste: ${response.status} ${await response.text()}`);
}

/** The spec reads the test build: its pages come from the test server, and the build is ready before the first test. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any fixtures of the caller's test object
export function useTestBuild(test: TestType<any, any>): void {
  test.use({ baseURL: TEST_BUILD_ORIGIN });
  test.beforeAll(async () => {
    test.setTimeout(BUILD_TIMEOUT_MS);
    await testBuildReady();
  });
}
