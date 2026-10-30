// Gate: money and health pages carry formula, premises, example, official source, author,
// "Revisado em" and the disclaimer (scripts/lib/ymyl.ts, tested in tests/unit/ymyl.test.ts).
// The F1a has no page in those hubs yet, so it checks zero pages; the checker itself is tested.
import { readFileSync } from 'node:fs';
import { Problems, allPages, fileForPath, requireDist } from '../lib/dist.ts';
import { checkYmylPage, type YmylHub } from '../lib/ymyl.ts';
import type { AdArea } from '../../src/i18n/routes.ts';

requireDist();
const problems = new Problems();
const HUBS: Partial<Record<AdArea, YmylHub>> = { dinheiro: 'money', 'casa-saude': 'health' };
let checked = 0;
for (const page of allPages()) {
  const hub = page.route.adArea ? HUBS[page.route.adArea] : undefined;
  if (!hub || !page.route.indexable) continue;
  checked += 1;
  for (const problem of checkYmylPage(readFileSync(fileForPath(page.path), 'utf8'), hub)) problems.add(`${page.path}: ${problem}`);
}
problems.finish('dinheiro e saúde', `${checked} página(s) desses hubs conferida(s)`);
