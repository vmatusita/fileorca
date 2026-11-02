// Gate: money and health pages carry formula, premises, example, official source, author,
// "Revisado em" and the disclaimer (scripts/lib/ymyl.ts, tested in tests/unit/ymyl.test.ts).
// Since the F4 it fails when it checks zero pages or a number of pages different from the money and health
// routes of the route map (DECISOES § 120). Since the F7 the home and health pages are checked against the official
// sources of their own hub, read from the route map (ymylHubOf).
import { readFileSync } from 'node:fs';
import { Problems, allPages, fileForPath, requireDist } from '../lib/dist.ts';
import { checkYmylPage, countProblems, expectedYmylPages } from '../lib/ymyl.ts';
import { ROUTES, languagesOf, ymylHubOf } from '../../src/i18n/routes.ts';

requireDist();
const problems = new Problems();
let checked = 0;
for (const page of allPages()) {
  // The money pages, and since the F7 the home and the health ones, each with the official sources of its hub.
  const hub = ymylHubOf(page.route.id);
  if (!hub || !page.route.indexable) continue;
  checked += 1;
  for (const problem of checkYmylPage(readFileSync(fileForPath(page.path), 'utf8'), hub)) problems.add(`${page.path}: ${problem}`);
}
const expected = expectedYmylPages(ROUTES.map((route) => ({ ...(route.adArea ? { adArea: route.adArea } : {}), indexable: route.indexable, languages: languagesOf(route).length })));
for (const problem of countProblems(checked, expected)) problems.add(problem);
problems.finish('dinheiro e saúde', `${checked} de ${expected} página(s) desses hubs conferida(s)`);
