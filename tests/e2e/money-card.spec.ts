// F13b (UX-12 A, decision 4; docs/propostas/ux-v2/calc.html, "Os testes da F13"; DECISOES § C-1 and the next ones): the
// calculator page with the result, the Download PDF and the error in one card. Every calculator page in the languages it has
// (the 18 money pages in English and in Spanish, the 8 of Brazil, the 11 home and health pages): the signature in one line,
// the number above the cookie notice and the Download PDF above the fold at 360 x 740, the card that never changes its height,
// the error said in the card with the last result that worked, the order of the island and its blocks, and the headings.
// The name puts it right after money-calc.spec.ts, among the money specs of the light parts (DECISOES § 142).
import { expect, test, type Page } from '@playwright/test';
import { BR_CALC_IDS, CALC_PAGES, CALC_PAGE_IDS, LIFE_CALC_IDS, LIFE_CALC_PAGES, moneyPage } from '../../src/tools/calc/registry.ts';

/** Every calculator page, in the languages it exists in. */
export const CALC_PATHS: string[] = [
  ...CALC_PAGE_IDS.map((id) => CALC_PAGES[id].path),
  ...CALC_PAGE_IDS.map((id) => moneyPage(id, 'es')?.path ?? `(${id} sem página em es)`),
  ...BR_CALC_IDS.map((id) => moneyPage(id, 'pt')?.path ?? `(${id} sem página em pt)`),
  ...LIFE_CALC_IDS.map((id) => LIFE_CALC_PAGES[id].path),
];
const BLOCK = 14;
/** The pages in blocks, a test each, so a block keeps the room of its time on the WebKit of the CI (DECISOES § 306). */
const blocks = (paths: readonly string[]): { name: string; paths: string[] }[] => {
  const out: { name: string; paths: string[] }[] = [];
  for (let start = 0; start < paths.length; start += BLOCK) out.push({ name: `pages ${start + 1} to ${Math.min(start + BLOCK, paths.length)}`, paths: paths.slice(start, start + BLOCK) });
  return out;
};

/** Opens a page with the choice of cookies stored (the notice closed), at a width. */
async function openAt(page: Page, path: string, width: number, height: number): Promise<void> {
  await page.setViewportSize({ width, height });
  expect((await page.goto(path))?.status(), path).toBe(200);
  await page.evaluate(() => document.fonts.ready);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('fo-consent', 'denied'));
});

// "Revisado" (G-23): the signature of the top takes one line at 360 px (20 px), with the name and the day as <time datetime>;
// the first publication went down to the block of the sources. gate:dinheiro-saude reads the same block.
for (const block of blocks(CALC_PATHS)) {
  test(`the signature takes one line at 360 px, and the first publication is with the sources (${block.name})`, async ({ page }) => {
    test.setTimeout(120_000);
    const wrong: string[] = [];
    for (const path of block.paths) {
      await openAt(page, path, 360, 740);
      const signed = page.locator('.fo-top [data-ymyl="reviewed"]');
      await expect(signed, path).toHaveCount(1);
      const height = await signed.evaluate((node) => node.getBoundingClientRect().height);
      if (height > 20) wrong.push(`${path}: a assinatura tem ${height} px`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test((await signed.locator('time').getAttribute('datetime')) ?? '')) wrong.push(`${path}: sem <time datetime>`);
      if (!/Victor Yuki Matusita · /.test((await signed.textContent()) ?? '')) wrong.push(`${path}: sem o nome e o ponto`);
      if ((await page.locator('[data-ymyl="source"] .fo-reviewed time[datetime]').count()) !== 1) wrong.push(`${path}: a primeira publicação não está nas fontes`);
    }
    expect(wrong).toEqual([]);
  });
}
