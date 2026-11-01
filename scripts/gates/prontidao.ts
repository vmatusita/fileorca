// Gate: the site is ready for the AdSense request (prompt F3, decision 5; DECISOES § 95). It checks the real
// dist/ (the build of today, with no AdSense id) and two extra builds of the same code under .cache/prontidao/:
// one with only PUBLIC_ADSENSE_CLIENT set to the test id (what the AdSense review will see) and one with the
// three variables (the loader only on tool pages). The extra builds never touch dist/, which the Playwright
// and Lighthouse steps use, and the bundle record that gate:licencas reads is put back as it was.
// The checks are in scripts/lib/prontidao.ts, proven in tests/unit/prontidao.test.ts.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, requireDist } from '../lib/dist.ts';
import { CACHE } from '../lib/tools.ts';
import {
  TEST_CLIENT,
  checkAllBuild,
  checkClientBuild,
  checkContent,
  checkCrawlable,
  checkNothingUnfinished,
  checkRequiredPages,
  checkTodayBuild,
  formatTable,
  realSite,
  type Row,
} from '../lib/prontidao.ts';
import { BUNDLE_RECORD } from '../../src/platform/bundle-record.ts';

requireDist();
const ROOT = join(CACHE, 'prontidao');
// The money pages of the F4 get test units too, so the hostname lock of their AdSlots is checked as well.
const TEST_SLOTS = JSON.stringify({ arquivos: { conteudo: '1111111111', lateral: '2222222222' }, dinheiro: { conteudo: '3333333333', lateral: '4444444444' } });

/** astro build of the same code into .cache/prontidao/<name>, with the AdSense variables given. */
function build(name: string, ads: Record<string, string>): string {
  const out = join(ROOT, name);
  rmSync(out, { recursive: true, force: true });
  const record = existsSync(BUNDLE_RECORD) ? readFileSync(BUNDLE_RECORD) : null;
  const begin = Date.now();
  const result = spawnSync(`pnpm exec astro build --outDir ${out.split('\\').join('/')}`, {
    shell: true,
    encoding: 'utf8',
    env: { ...process.env, PUBLIC_ADSENSE_CLIENT: '', PUBLIC_ADSENSE_SLOTS: '', PUBLIC_ADS_ENABLED: 'false', ...ads, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  if (record) writeFileSync(BUNDLE_RECORD, record);
  if (result.status !== 0) {
    console.error(result.stdout, result.stderr);
    console.error(`prontidão: o build ${name} falhou`);
    process.exit(1);
  }
  console.log(`prontidão: build ${name} em ${((Date.now() - begin) / 1000).toFixed(1)} s (${out})`);
  return out;
}

const client = build('client', { PUBLIC_ADSENSE_CLIENT: TEST_CLIENT });
const all = build('all', { PUBLIC_ADSENSE_CLIENT: TEST_CLIENT, PUBLIC_ADSENSE_SLOTS: TEST_SLOTS, PUBLIC_ADS_ENABLED: 'true' });

const today = realSite(DIST);
const rows: Row[] = [
  ...checkClientBuild(realSite(client)),
  ...checkAllBuild(realSite(all)),
  ...checkTodayBuild(today),
  ...checkRequiredPages(today),
  ...checkNothingUnfinished(today),
  ...checkContent(today),
  ...checkCrawlable(today),
];
console.log(`\n${formatTable(rows)}\n`);
const failed = rows.filter((entry) => !entry.ok);
if (failed.length) {
  console.error(`prontidão: ${failed.length} item(ns) falhando`);
  for (const entry of failed) for (const problem of entry.problems) console.error(`  - ${entry.item}: ${problem}`);
  process.exit(1);
}
console.log(`prontidão: ok, ${rows.length} itens`);
