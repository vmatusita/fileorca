// Gate: Lighthouse CI over the static build, mobile preset (Lighthouse default), using Playwright's
// Chromium so no installed Chrome is needed; reports stay on disk (never temporary-public-storage).
// Fails when the performance score of the model page is below 90 (lighthouserc.json).
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';
import { requireDist } from '../lib/dist.ts';

requireDist();
const chromePath = chromium.executablePath();
if (!existsSync(chromePath)) {
  console.error(`lighthouse: Chromium do Playwright não encontrado em ${chromePath}; rode pnpm exec playwright install chromium`);
  process.exit(1);
}
const require = createRequire(import.meta.url);
const cli = require.resolve('@lhci/cli/src/cli.js');
const env = { ...process.env, CHROME_PATH: chromePath, LHCI_NO_LIGHTHOUSERC: undefined };
for (const step of [
  ['collect', '--config=lighthouserc.json', `--collect.chromePath=${chromePath}`],
  ['upload', '--config=lighthouserc.json'],
  ['assert', '--config=lighthouserc.json'],
]) {
  const result = spawnSync(process.execPath, [cli, ...step], { stdio: 'inherit', env });
  if (result.status !== 0) {
    console.error(`lighthouse: lhci ${step[0]} falhou`);
    process.exit(1);
  }
}
const manifest = JSON.parse(readFileSync('.lighthouseci/reports/manifest.json', 'utf8')) as {
  url: string;
  isRepresentativeRun: boolean;
  summary: Record<string, number>;
}[];
for (const run of manifest.filter((entry) => entry.isRepresentativeRun)) {
  const scores = Object.entries(run.summary).map(([category, score]) => `${category} ${Math.round(score * 100)}`).join(', ');
  console.log(`lighthouse (celular): ${new URL(run.url).pathname} → ${scores}`);
}
