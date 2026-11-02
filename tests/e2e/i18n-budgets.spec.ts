import { expect, test, type Page } from '@playwright/test';
import { moneyHubId, routeById, type Lang, type RouteId } from '../../src/i18n/routes.ts';
import { BR_CALC_IDS, CALC_PAGES, ES_CALC_IDS, moneyPage } from '../../src/tools/calc/registry.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../src/tools/image/registry.ts';
import { PDF_HUB_ID, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { expectInitialBudget, expectNextPage, settler } from './lib/budgets.ts';

// The performance budgets of the Portuguese and Spanish pages (F6, decision 4 and criterion 9), with the measures of
// budgets.spec.ts (tests/e2e/lib/budgets.ts): every image tool and preset, PDF tool, calculator, hub and support page in
// pt and es, read from the registries and the route map, held to the budgets and to the number of files of its English
// pair (budgets.spec.ts keeps the two Compress image pages it already had). Then each one loads the very same JS files,
// name and hash, as its English page: a translation adds HTML and data-props, never code. The file is named to sort
// between design.spec.ts and image-matrix.spec.ts, so those two stay in different parts of the WebKit split (DECISOES
// § 108, § 142 and § 233).

const TRANSLATED: readonly Lang[] = ['pt', 'es'];
const pathOf = (id: RouteId, lang: Lang): string => routeById(id).paths[lang] ?? '';
const IMAGE_IDS = Object.keys(IMAGE_PAGES) as ImagePageId[];
const ALREADY = ['/pt/comprimir-imagem/', '/es/comprimir-imagen/'];
const TOOL_PAGES = TRANSLATED.flatMap((lang) => IMAGE_IDS.map((id) => pathOf(id, lang))).filter((path) => !ALREADY.includes(path));
const PDF_PAGES = TRANSLATED.flatMap((lang) => PDF_TOOL_IDS.map((id) => pathOf(id, lang)));
const CALC_PAGES_LIST = [...ES_CALC_IDS.map((id) => moneyPage(id, 'es')?.path ?? ''), ...BR_CALC_IDS.map((id) => moneyPage(id, 'pt')?.path ?? '')];
const PDF_HUBS = TRANSLATED.map((lang) => pathOf(PDF_HUB_ID, lang));
const HUBS = TRANSLATED.flatMap((lang) => [pathOf('image-tools', lang), pathOf(PDF_HUB_ID, lang), pathOf(moneyHubId(lang), lang)]);
const SUPPORT_PAGES = TRANSLATED.map((lang) => pathOf('support', lang));

for (const path of [...TOOL_PAGES, ...PDF_PAGES, ...CALC_PAGES_LIST, ...HUBS, ...SUPPORT_PAGES]) {
  test(`initial JS and requests of ${path} fit the budgets, with no worker and no wasm`, async ({ page, baseURL }) => {
    const isTool = TOOL_PAGES.includes(path);
    const isPdf = PDF_PAGES.includes(path);
    const isCalc = CALC_PAGES_LIST.includes(path);
    await expectInitialBudget(page, new URL(baseURL ?? 'http://127.0.0.1:4173').origin, path, {
      files: isTool || isPdf || isCalc ? 2 : 'at most 2',
      noPdfMaker: isCalc,
      noPdfEngine: isPdf || PDF_HUBS.includes(path),
    });
  });
}

// The steps of budgets.spec.ts in Portuguese and Spanish, and to the Pix of the support page.
for (const [first, second] of [
  [pathOf('merge-pdf', 'es'), pathOf('split-pdf', 'es')],
  [pathOf('compress-image', 'pt'), pathOf('merge-pdf', 'pt')],
  [pathOf('image-tools', 'pt'), pathOf('heic-to-jpg', 'pt')],
  ['/pt/', moneyPage('br-sac-price', 'pt')?.path ?? ''],
  [moneyPage('br-sac-price', 'pt')?.path ?? '', moneyPage('br-vehicle-loan', 'pt')?.path ?? ''],
  [moneyPage('mortgage-calculator', 'es')?.path ?? '', pathOf('compress-pdf', 'es')],
  ['/pt/', '/pt/apoie/'],
] as const) {
  test(`requests: ${first} then ${second}`, async ({ page, baseURL }) => {
    await expectNextPage(page, new URL(baseURL ?? 'http://127.0.0.1:4173').origin, first, second);
  });
}

/** The own-origin scripts the page asks for, by path (name and hash). */
function scriptsOf(page: Page, origin: string): Set<string> {
  const found = new Set<string>();
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin === origin && request.resourceType() === 'script') found.add(url.pathname);
  });
  return found;
}

// A Brazilian calculator has no English pair: it loads the files of the English calculators. The support pages are held to
// the files of /support/ (the Portuguese one carries the Pix's inline script, counted in the budget above).
const SAME_FILES: [string, string][] = [
  ...TRANSLATED.flatMap((lang) => IMAGE_IDS.map((id): [string, string] => [pathOf(id, 'en'), pathOf(id, lang)])),
  ...TRANSLATED.flatMap((lang) => PDF_TOOL_IDS.map((id): [string, string] => [pathOf(id, 'en'), pathOf(id, lang)])),
  ...ES_CALC_IDS.map((id): [string, string] => [CALC_PAGES[id].path, moneyPage(id, 'es')?.path ?? '']),
  ...BR_CALC_IDS.map((id): [string, string] => [CALC_PAGES['mortgage-calculator'].path, moneyPage(id, 'pt')?.path ?? '']),
  ...TRANSLATED.flatMap((lang): [string, string][] => [
    [pathOf('image-tools', 'en'), pathOf('image-tools', lang)],
    [pathOf(PDF_HUB_ID, 'en'), pathOf(PDF_HUB_ID, lang)],
    [pathOf('money-calculators', 'en'), pathOf(moneyHubId(lang), lang)],
    [pathOf('support', 'en'), pathOf('support', lang)],
  ]),
];

for (const [english, translated] of SAME_FILES) {
  test(`${translated} loads the same JS files as ${english}`, async ({ page, baseURL }) => {
    const seen = scriptsOf(page, new URL(baseURL ?? 'http://127.0.0.1:4173').origin);
    const { settled } = settler(page);
    expect((await page.goto(english))?.status(), english).toBe(200);
    await settled();
    const own = [...seen].sort();
    seen.clear();
    expect((await page.goto(translated))?.status(), translated).toBe(200);
    await settled();
    expect([...seen].sort(), `${translated} = ${english}`).toEqual(own);
  });
}
