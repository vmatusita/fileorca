// pnpm guias:medir: measures what the ten file guides say (prompt F5b, decision 3) and writes data/guides-measured.json.
//   --check       measures again and compares with the file, writing nothing: Node values must be equal, browser values
//                 within the tolerance fixed before the first measurement (DECISOES § 185); exit 1 on any difference
//   --only <id>   one guide (with --check, only that guide is compared)
// Over dist/ (run pnpm build first): the browser half drives the site's own tool pages in Chromium and WebKit.
// Not part of pnpm verificar, like pnpm fixtures: tests/unit/guides-measured.test.ts checks the file in every run.
import { readFileSync, writeFileSync } from 'node:fs';
import { requireDist } from '../lib/dist.ts';
import { FILE_GUIDE_IDS, type FileGuideId } from '../../src/tools/guides/registry.ts';
import type { Cell, GuideMeasure, MeasuredFile, MeasuredNumber, MeasuredTable } from '../../src/tools/guides/measured-types.ts';
import { BROWSERS, openSession, osName, serve, type BrowserName, type Session } from './lib/browser.ts';
import { PLANS, type Context } from './lib/plans.ts';
import { headCommit, scriptFiles, scriptHash } from './lib/record.ts';

export const OUT = 'data/guides-measured.json';
/** DECISOES § 185: fixed before the first measurement. */
export const TOLERANCE = { bytesRelative: 0.02, psnrDb: 0.5 };

const args = process.argv.slice(2);
const check = args.includes('--check');
const onlyAt = args.indexOf('--only');
const only = onlyAt >= 0 ? (args[onlyAt + 1] as FileGuideId | undefined) : undefined;
if (only !== undefined && !FILE_GUIDE_IDS.includes(only)) throw new Error(`unknown guide ${only}`);

requireDist();
const files = scriptFiles();
const stamp = { date: new Date().toISOString().slice(0, 10), commit: headCommit() };
const sessions = new Map<BrowserName, Promise<Session>>();
const ctx: Context = {
  stamp,
  session(name) {
    let session = sessions.get(name);
    if (!session) {
      session = openSession(name);
      sessions.set(name, session);
    }
    return session;
  },
  log: (message) => console.log(message),
};

const stop = await serve();
const guides: Partial<Record<FileGuideId, GuideMeasure>> = {};
const started = Date.now();
try {
  for (const id of FILE_GUIDE_IDS) {
    if (only && id !== only) continue;
    console.log(`${id}`);
    const at = Date.now();
    guides[id] = await PLANS[id](ctx);
    console.log(`  ${Object.keys(guides[id]?.numbers ?? {}).length} numbers in ${((Date.now() - at) / 1000).toFixed(1)} s`);
  }
} finally {
  for (const session of sessions.values()) await (await session).browser.close();
  stop();
}
const versions: Record<BrowserName, string> = { chromium: '', webkit: '' };
for (const name of BROWSERS) versions[name] = sessions.has(name) ? (await sessions.get(name) as Session).version : '';

// ---- compare ---------------------------------------------------------------------------------------------------

function close(a: number, b: number, unit: string, browser: boolean): boolean {
  if (a === b) return true;
  if (!browser) return false;
  if (unit === 'bytes') return Math.abs(a - b) <= TOLERANCE.bytesRelative * Math.max(Math.abs(a), Math.abs(b));
  if (unit === 'db') return Math.abs(a - b) <= TOLERANCE.psnrDb;
  if (unit === 'ratio') return Math.abs(a - b) <= TOLERANCE.bytesRelative * Math.max(Math.abs(a), Math.abs(b));
  return false;
}

function compareNumbers(id: string, before: Record<string, MeasuredNumber>, after: Record<string, MeasuredNumber>, problems: string[]): void {
  for (const name of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const a = before[name];
    const b = after[name];
    if (!a || !b) {
      problems.push(`${id}.${name}: ${a ? 'not measured now' : 'new number'}`);
      continue;
    }
    if (!close(a.value, b.value, a.unit, a.method.runner === 'playwright')) problems.push(`${id}.${name}: ${a.value} in the file, ${b.value} now (${a.unit}, ${a.method.runner})`);
  }
}

function compareTables(id: string, before: Record<string, MeasuredTable>, after: Record<string, MeasuredTable>, problems: string[]): void {
  for (const name of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const a = before[name];
    const b = after[name];
    if (!a || !b || a.rows.length !== b.rows.length || a.columns.join() !== b.columns.join()) {
      problems.push(`${id} table ${name}: a different shape`);
      continue;
    }
    const browser = a.methods.some((how) => how.runner === 'playwright');
    a.rows.forEach((row, r) =>
      row.forEach((cell: Cell, c) => {
        const other = b.rows[r]?.[c];
        const column = a.columns[c] ?? '';
        const unit = /bytes$/i.test(column) ? 'bytes' : /db$/i.test(column) ? 'db' : 'exact';
        const same = typeof cell === 'number' && typeof other === 'number' ? close(cell, other, unit, browser) : cell === other;
        if (!same) problems.push(`${id} table ${name}, row ${r + 1}, ${column}: ${String(cell)} in the file, ${String(other)} now`);
      }),
    );
  }
}

const hash = scriptHash(files);
if (check) {
  const stored = JSON.parse(readFileSync(OUT, 'utf8')) as MeasuredFile;
  const problems: string[] = [];
  if (stored.script.sha256 !== hash) problems.push(`the script changed since the file was written (${stored.script.sha256.slice(0, 12)} in the file, ${hash.slice(0, 12)} now): measure again`);
  for (const id of FILE_GUIDE_IDS) {
    if (only && id !== only) continue;
    const before = stored.guides[id];
    const after = guides[id];
    if (!before || !after) {
      problems.push(`${id}: missing`);
      continue;
    }
    compareNumbers(id, before.numbers, after.numbers, problems);
    compareTables(id, before.tables, after.tables, problems);
    if (JSON.stringify(before.facts) !== JSON.stringify(after.facts)) problems.push(`${id}: the facts changed (${JSON.stringify(before.facts)} to ${JSON.stringify(after.facts)})`);
  }
  console.log(`\nguias:medir --check: ${problems.length} difference(s) in ${((Date.now() - started) / 1000).toFixed(1)} s`);
  for (const problem of problems) console.log(`  ${problem}`);
  process.exit(problems.length ? 1 : 0);
}

let previous: MeasuredFile | null = null;
try {
  previous = JSON.parse(readFileSync(OUT, 'utf8')) as MeasuredFile;
} catch {
  previous = null;
}
if (only && !previous) throw new Error('--only needs the file to exist: measure every guide first');
const out: MeasuredFile = {
  version: 1,
  script: { files, sha256: hash },
  commit: stamp.commit,
  measuredOn: stamp.date,
  environment: { os: osName(), node: process.version, browsers: { chromium: versions.chromium || previous?.environment.browsers.chromium || '', webkit: versions.webkit || previous?.environment.browsers.webkit || '' } },
  tolerance: TOLERANCE,
  guides: Object.fromEntries(FILE_GUIDE_IDS.map((id) => [id, guides[id] ?? previous?.guides[id]])) as Record<FileGuideId, GuideMeasure>,
};
for (const id of FILE_GUIDE_IDS) if (!out.guides[id]) throw new Error(`${id} has no measurement`);
writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
console.log(`\n${OUT}: ${FILE_GUIDE_IDS.length} guides, ${FILE_GUIDE_IDS.reduce((total, id) => total + Object.keys(out.guides[id].numbers).length, 0)} numbers, in ${((Date.now() - started) / 1000).toFixed(1)} s`);
