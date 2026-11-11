// Gate: the site is ready for the AdSense request (prompt F3, decision 5; DECISOES § 95). It checks the real
// dist/ (the build of today, with no AdSense id) and two extra builds of the same code:
// one with only PUBLIC_ADSENSE_CLIENT set to the test id (what the AdSense review will see) and one with the
// three variables (the loader only on tool pages). The extra builds never touch dist/, which the Playwright
// and Lighthouse steps use, and the bundle record that gate:licencas reads is put back as it was.
// F12 (DECISOES § 414): the two extra builds come from scripts/lib/test-build.ts, the one helper of the extra builds (the
// test build of the Playwright specs too), under .cache/builds/, reused when the commit and the variables are the same and
// the tree is clean; "all" has the fake ids of the 37 units of the ad map and the wall off.
// The checks are in scripts/lib/prontidao.ts, proven in tests/unit/prontidao.test.ts. From the F5a the cards of the
// home and of the PDF hub and the search come from the PDF registry as well, and the 13 PDF tools and the hub each have
// rows of their own (page, H1/title/description, 60 words and 150 per AdSlot). From the F7 (decision 11), the home in
// English lists the home and health calculators and the QR code generator, the two new hubs list their calculators in
// the order of the registry, and the search offers the 11 calculators and the QR code generator, all read from the registry.
import { DIST, requireDist } from '../lib/dist.ts';
import { buildVariant, type Variant } from '../lib/test-build.ts';
import {
  checkAllBuild,
  checkClientBuild,
  checkContent,
  checkCrawlable,
  checkNothingUnfinished,
  checkPdfPages,
  checkRequiredPages,
  checkTodayBuild,
  formatTable,
  realSite,
  type Row,
} from '../lib/prontidao.ts';

requireDist();
/** The extra build of the same code under .cache/builds/<name> (scripts/lib/test-build.ts). */
async function build(name: Variant): Promise<string> {
  try {
    const result = await buildVariant(name);
    console.log(`prontidão: build ${name} ${result.built ? `em ${result.seconds.toFixed(1)} s` : 'reaproveitado (mesmo commit e mesmas variáveis)'} (${result.dir})`);
    return result.dir;
  } catch (error) {
    console.error(String(error));
    console.error(`prontidão: o build ${name} falhou`);
    process.exit(1);
  }
}

const client = await build('client');
const all = await build('all');

const today = realSite(DIST);
const rows: Row[] = [
  ...checkClientBuild(realSite(client)),
  ...checkAllBuild(realSite(all)),
  ...checkTodayBuild(today),
  ...checkRequiredPages(today),
  ...checkNothingUnfinished(today),
  // F12, Mudança 10 (DECISOES § 418): the AdSlots exist only in the build with the unit ids, so the words for each one are
  // counted there (the text of the pages is the same in both builds).
  ...checkContent(realSite(all)),
  ...checkPdfPages(realSite(all)),
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
