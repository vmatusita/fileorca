// The ad map in every page with ads (F12, decisions 3 and 11; UX-07 A; DECISOES § 419 to § 422), on the test build
// (fake ids in the 37 units, the worst case). The name puts this spec next to the other specs of the test build in the
// parts of the CI (after events.spec.ts, with header-menu.spec.ts; DECISOES § 422).
//   - The 184 pages, in blocks: at 360 × 740, the conservative density of § 351 up to 30 %, 1,110 px or more between two
//     content ads edge to edge, 150 px from every target, nothing above the tool, the first ad after the piece of its mold,
//     no box in a grid, a table, a list, a question, a form, the panel, the schedule or a band, none against a table or a
//     heading; the cookie notice open 150 px or more from the first content box at 360 × 740 and 1280 × 800; at 768 × 1024
//     and 812 × 375 the same density, with the first content ad and the multiplex only; from 1280 px, the rails; at every
//     width only the boxes of that width; and the initial JS of the page with the inline push in the 80 KB of budgets.ts.
//   - On fileorca.com (production.ts, the AdSense loader as an empty stub): one push per box that shows, once; the box of
//     another width leaves the DOM; nothing changes when the window turns or the tool works; the lateral-2 1,200 px under
//     the lateral, only on a page of 600 words or more and only where the column has the room.
//   - The coffee line of the footer 150 px or more from the anchor (a strip of 100 px at the foot of the screen), with the
//     page scrolled to the end.
import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { routeById } from '../../src/i18n/routes.ts';
import { AD_PAGES, contentGaps, densityOf, distance, frames, measureMap, type AdPage, type MapMeasure } from './lib/ad-map.ts';
import { expectInitialBudget } from './lib/budgets.ts';
import { chooseImage, dismissCookies, hydrated } from './lib/page.ts';
import { PRODUCTION_ORIGIN, serveAsProduction } from './lib/production.ts';
import { TEST_BUILD_ORIGIN, useTestBuild } from './lib/test-build.ts';

useTestBuild(test);

const CLEARANCE = 150;
const AD_DISTANCE = 1110;
const DENSITY = 0.3;
const PHONE = { width: 360, height: 740 };
// The widest width with the 2nd content ad on (DECISOES § 445): the 1,110 px between two content ads hold there too.
const WIDEST_PHONE = { width: 459, height: 900 };
const PHONE_MAX = 459;
// A small tablet held upright: from 460 to 767 px the page keeps only the 1st content ad (§ 445).
const SMALL_TABLET = { width: 600, height: 960 };
const TABLET = { width: 768, height: 1024 };
const LANDSCAPE = { width: 812, height: 375 };
const DESKTOP = { width: 1280, height: 800 };
const BLOCK = 6;

test('the map reads the 184 pages with ads of the route map', () => {
  expect(AD_PAGES).toHaveLength(184);
  expect(AD_PAGES.filter((page) => page.mold === 'home').map((page) => page.path)).toEqual(['/', '/pt/', '/es/']);
  expect(AD_PAGES.filter((page) => page.mold === 'guides-hub').map((page) => page.path)).toEqual(['/guides/', '/pt/guias/', '/es/guias/']);
});

/** Everything one page keeps at one width; what fails is collected, so a block shows every page that breaks. */
function check(problems: string[], page: AdPage, measure: MapMeasure, label: string): void {
  const fail = (what: string): void => void problems.push(`${page.path} ${label}: ${what}`);
  const width = measure.width;
  // The boxes that show at this width: the 2nd content ad on only up to 459 px (§ 445), the multiplex from 768 px, the rails
  // from 1280 px.
  for (const box of measure.boxes) {
    if (box.kind === 'content' && box.unit !== 'conteudo' && width > PHONE_MAX) fail(`${box.unit} aparece a ${width} px`);
    if (box.kind === 'multiplex' && width < 768) fail(`o multiplex aparece a ${width} px`);
    if (box.kind === 'rail' && width < 1280) fail(`${box.unit} aparece a ${width} px`);
    if (box.kind !== 'rail' && !box.inMain) fail(`${box.unit} fora do <main>`);
    if (box.inside) fail(`${box.unit} dentro de ${box.inside}`);
    if (box.kind === 'content' && box.headingBefore) fail(`${box.unit} logo depois de um título (${box.before})`);
    if (box.kind !== 'rail' && (box.tableBefore || box.tableAfter)) fail(`${box.unit} colado numa tabela (${box.before} | ${box.after})`);
    if (box.measuredBeside) fail(`${box.unit} ao lado de "O que medimos"`);
    if (/sticky|fixed/.test(box.position)) fail(`${box.unit} gruda ao rolar (${box.position})`);
    // Nothing above the tool, on a phone or a computer.
    if (box.kind !== 'rail' && measure.tool && box.y < measure.tool.y + measure.tool.h) fail(`${box.unit} acima do fim da ferramenta`);
    for (const target of measure.targets) {
      const gap = distance(box, target);
      if (gap < CLEARANCE) fail(`${box.unit} a ${gap.toFixed(0)} px de ${target.kind}`);
    }
    // The multiplex keeps 150 px from every grid of cards, the related one too.
    if (box.kind === 'multiplex') for (const grid of measure.grids) if (distance(box, grid) < CLEARANCE) fail(`o multiplex a ${distance(box, grid).toFixed(0)} px de uma grade`);
  }
  const content = measure.boxes.filter((box) => box.kind === 'content');
  if (content.length === 0) fail('nenhuma caixa de conteúdo');
  const multiplex = measure.boxes.filter((box) => box.kind === 'multiplex');
  const rails = measure.boxes.filter((box) => box.kind === 'rail');
  if (width >= 768 && multiplex.length !== 1) fail(`${multiplex.length} multiplex a ${width} px`);
  if (width >= 1280 && rails.length < 1) fail('sem a lateral');
  if (width >= 1280 && rails[0] && measure.header && rails[0].y - (measure.header.y + measure.header.h) < CLEARANCE) fail(`a lateral a ${(rails[0].y - (measure.header.y + measure.header.h)).toFixed(0)} px do cabeçalho`);
  for (const gap of contentGaps(measure)) if (gap < AD_DISTANCE) fail(`dois anúncios de conteúdo a ${gap.toFixed(0)} px, de borda a borda`);
  // At 1280 px the multiplex is 1,200 px or more from the first content ad (ad-map.html, "O que o teste da F12 confere", 6).
  if (width >= 1280 && content[0] && multiplex[0] && multiplex[0].y - (content[0].y + content[0].h) < 1200) fail(`o multiplex a ${(multiplex[0].y - (content[0].y + content[0].h)).toFixed(0)} px do conteúdo 1`);
  if (width !== DESKTOP.width) {
    const density = densityOf(measure);
    if (density > DENSITY) fail(`densidade ${(density * 100).toFixed(1)} %`);
  }
}

/** The first content ad after the piece of its mold (decision 3). */
function checkFirst(problems: string[], page: AdPage, phone: MapMeasure, desktop: MapMeasure): void {
  const fail = (what: string): void => void problems.push(`${page.path}: ${what}`);
  const first = phone.first;
  if (!first) return fail('sem o 1º anúncio');
  const before = first.before;
  switch (page.mold) {
    case 'home': {
      if (!before.includes('[aria-labelledby=tools]')) fail(`o 1º da home depois de ${before}`);
      const top = phone.boxes.find((box) => box.unit === 'conteudo');
      const wide = desktop.boxes.find((box) => box.unit === 'conteudo');
      if (!top || top.y < PHONE.height) fail(`o 1º da home na primeira tela do celular (topo ${top?.y.toFixed(0)})`);
      if (!wide || wide.y < DESKTOP.height) fail(`o 1º da home na primeira tela do computador (topo ${wide?.y.toFixed(0)})`);
      break;
    }
    case 'guides-hub':
      if (before !== 'section#image.fo-section[aria-labelledby=image-title]') fail(`o 1º do hub de guias depois de ${before}`);
      break;
    case 'hub-dinheiro':
      if (!before.includes('[aria-labelledby=calcs-credit]')) fail(`o 1º do hub de dinheiro depois de ${before}`);
      break;
    case 'hub-arquivos':
    case 'hub-casa-saude':
      if (before !== phone.firstGridBlock) fail(`o 1º do hub depois de ${before}, e não da 1ª grade (${phone.firstGridBlock})`);
      break;
    case 'tool-image':
    case 'tool-pdf':
    case 'tool-qr':
      if (!before.includes('[data-content=how]')) fail(`o 1º da ferramenta depois de ${before}, e não do "Como usar"`);
      break;
    case 'calc-dinheiro':
    case 'calc-casa-saude':
      if (!before.startsWith('div#fo-tool-root') || !first.after.startsWith('div#fo-calc-schedule')) fail(`o 1º da calculadora entre ${before} e ${first.after}`);
      break;
    case 'guide-arquivos':
    case 'guide-dinheiro':
      if (!first.afterTool || first.textBetweenToolAndIt < 1) fail(`o 1º do guia sem um parágrafo depois da ferramenta (${first.textBetweenToolAndIt})`);
      break;
  }
}

/** The cookie notice of the first visit, open at scroll 0, 150 px or more from the first content box that shows. */
function checkNotice(problems: string[], page: AdPage, measure: MapMeasure): void {
  const first = measure.boxes.filter((box) => box.kind === 'content').sort((a, b) => a.y - b.y)[0];
  if (!measure.notice) problems.push(`${page.path} a ${measure.width} px: o aviso de cookies não está aberto`);
  else if (first && distance(first, measure.notice) < CLEARANCE) problems.push(`${page.path} a ${measure.width} px: o aviso de cookies a ${distance(first, measure.notice).toFixed(0)} px do 1º anúncio`);
}

interface Row {
  path: string;
  mold: string;
  lang: string;
  phone: { boxes: number; density: number; gaps: number[]; firstTop: number };
  tablet: number;
  landscape: number;
  desktop: { boxes: string[]; multiplexFromFirst: number | null };
  shortest: Record<string, number | null>;
  notice: Record<number, number | null>;
}

function shortestTo(measure: MapMeasure, group: string): number | null {
  const rects = measure.groups[group] ?? [];
  let min: number | null = null;
  for (const box of measure.boxes) for (const rect of rects) min = Math.min(min ?? Infinity, distance(box, rect));
  return min === null ? null : Math.round(min);
}

for (let start = 0; start < AD_PAGES.length; start += BLOCK) {
  const block = AD_PAGES.slice(start, start + BLOCK);
  test(`the map at 360, 459, 600, 768, 812 and 1280 px, the notice and the budget: pages ${start + 1} to ${start + block.length} of ${AD_PAGES.length} (${block[0]?.path} and on)`, async ({ context, browserName }) => {
    test.setTimeout(180_000);
    const problems: string[] = [];
    const rows: Row[] = [];
    for (const adPage of block) {
      const page = await context.newPage();
      await page.setViewportSize(PHONE);
      // A first visit: the cookie notice is open. In Chromium the initial JS (with the inline push) is held to the 80 KB of
      // budgets.ts: its bytes are the same in WebKit, which budgets.spec.ts and i18n-budgets.spec.ts measure on the default
      // build with the same files and requests (DECISOES § 422).
      if (browserName === 'chromium') await expectInitialBudget(page, TEST_BUILD_ORIGIN, adPage.path, { files: 'at most 2' });
      else expect((await page.goto(adPage.path))?.status(), adPage.path).toBe(200);
      if (await page.locator('#fo-tool-root').count()) await hydrated(page);
      const notice: Record<number, number | null> = {};
      for (const viewport of [PHONE, DESKTOP]) {
        await page.setViewportSize(viewport);
        await frames(page);
        const measure = await measureMap(page);
        checkNotice(problems, adPage, measure);
        const first = measure.boxes.filter((box) => box.kind === 'content').sort((a, b) => a.y - b.y)[0];
        notice[viewport.width] = first && measure.notice ? Math.round(distance(first, measure.notice)) : null;
      }
      await dismissCookies(page);
      const at: Record<string, MapMeasure> = {};
      for (const viewport of [PHONE, WIDEST_PHONE, SMALL_TABLET, TABLET, LANDSCAPE, DESKTOP]) {
        await page.setViewportSize(viewport);
        await frames(page);
        const measure = await measureMap(page);
        at[viewport.width] = measure;
        check(problems, adPage, measure, `a ${viewport.width}×${viewport.height}`);
      }
      const phone = at[PHONE.width] as MapMeasure;
      const desktop = at[DESKTOP.width] as MapMeasure;
      checkFirst(problems, adPage, phone, desktop);
      const content = desktop.boxes.find((box) => box.unit === 'conteudo');
      const multiplex = desktop.boxes.find((box) => box.kind === 'multiplex');
      rows.push({
        path: adPage.path,
        mold: adPage.mold,
        lang: adPage.lang,
        phone: { boxes: phone.boxes.length, density: densityOf(phone), gaps: contentGaps(phone).map(Math.round), firstTop: Math.round(phone.boxes[0]?.y ?? 0) },
        tablet: densityOf(at[TABLET.width] as MapMeasure),
        landscape: densityOf(at[LANDSCAPE.width] as MapMeasure),
        desktop: { boxes: desktop.boxes.map((box) => box.unit), multiplexFromFirst: content && multiplex ? Math.round(multiplex.y - (content.y + content.h)) : null },
        shortest: Object.fromEntries(Object.keys(phone.groups).map((group) => [group, Math.min(shortestTo(phone, group) ?? Infinity, shortestTo(desktop, group) ?? Infinity)])),
        notice,
      });
      // The next page is a first visit again. This one stays open until the end of the test: a script the page asks for
      // after the budget's quiet second would otherwise lose its body under expectInitialBudget.
      await page.evaluate(() => localStorage.removeItem('fo-consent'));
    }
    mkdirSync(`test-results/ad-map/${browserName}`, { recursive: true });
    writeFileSync(`test-results/ad-map/${browserName}/block-${String(start).padStart(3, '0')}.json`, `${JSON.stringify(rows, null, 1)}\n`);
    console.log(rows.map((row) => `${row.path} ${row.phone.boxes} caixas, ${(row.phone.density * 100).toFixed(1)} % a 360, ${(row.tablet * 100).toFixed(1)} % a 768, ${(row.landscape * 100).toFixed(1)} % a 812×375, vãos ${row.phone.gaps.join('/') || '-'}`).join('\n'));
    expect(problems, problems.join('\n')).toEqual([]);
  });
}

// ---- On fileorca.com: the one push script --------------------------------------------------------------------------

/** The first page of each mold (English), and the home and a tool in Portuguese and Spanish. */
const PRODUCTION_PAGES = [
  ...AD_PAGES.filter((page, index) => AD_PAGES.findIndex((other) => other.mold === page.mold) === index),
  ...AD_PAGES.filter((page) => page.lang !== 'en' && (page.id === 'home' || page.id === 'compress-image')),
];

interface Pushed {
  ins: { unit: string; format: string | null; slot: string | null; client: string | null; responsive: string | null; style: string }[];
  pushes: number;
  boxes: { unit: string; media: string | null; shown: boolean; y: number; h: number }[];
  rail: number;
}

async function pushed(page: Page): Promise<Pushed> {
  return page.evaluate(() => {
    const boxes = [...document.querySelectorAll('.fo-ad')];
    return {
      ins: boxes.flatMap((box) => [...box.querySelectorAll('ins.adsbygoogle')].map((ins) => ({
        unit: box.getAttribute('data-ad-unit') ?? '',
        format: ins.getAttribute('data-ad-format'),
        slot: ins.getAttribute('data-ad-slot'),
        client: ins.getAttribute('data-ad-client'),
        responsive: ins.getAttribute('data-full-width-responsive'),
        style: ins.getAttribute('style') ?? '',
      }))),
      pushes: ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ?? []).length,
      boxes: boxes.map((box) => {
        const rect = box.getBoundingClientRect();
        return { unit: box.getAttribute('data-ad-unit') ?? '', media: box.getAttribute('data-ad-media'), shown: rect.width > 0 && rect.height > 0, y: rect.top + scrollY, h: rect.height };
      }),
      rail: document.querySelector('aside.fo-rail')?.getBoundingClientRect().height ?? 0,
    };
  });
}

async function production(context: BrowserContext): Promise<void> {
  await serveAsProduction(context, { loader: 'stub' });
}

test.describe('on fileorca.com, the one push script', () => {
  test.beforeEach(async ({ context }) => {
    await production(context);
  });

  for (const adPage of PRODUCTION_PAGES) {
    test(`${adPage.path}: one push per box of the width, once, and nothing changes when the window turns`, async ({ page }) => {
      const html = await (await page.request.get(`${TEST_BUILD_ORIGIN}${adPage.path}`)).text();
      const inHtml = [...html.matchAll(/data-ad-unit="([a-z0-9-]+)"/g)].map((match) => match[1]);
      expect(html, 'nenhum <ins> no HTML (plano B)').not.toContain('class="adsbygoogle"');
      for (const viewport of [PHONE, TABLET, DESKTOP]) {
        await page.setViewportSize(viewport);
        expect((await page.goto(`${PRODUCTION_ORIGIN}${adPage.path}`))?.status()).toBe(200);
        const state = await pushed(page);
        const want = inHtml.filter((unit) => {
          if (unit === 'conteudo') return true;
          if (unit === 'multiplex') return viewport.width >= 768;
          if (unit === 'lateral') return viewport.width >= 1280;
          if (unit === 'lateral-2') return viewport.width >= 1280 && state.rail >= 2638;
          return viewport.width <= PHONE_MAX;
        });
        const label = `${adPage.path} a ${viewport.width} px`;
        expect(state.ins.map((ins) => ins.unit), `${label}: as unidades com <ins>`).toEqual(want);
        expect(state.boxes.map((box) => box.unit), `${label}: as caixas da largura ficam, as outras saem do DOM`).toEqual(want);
        expect(state.pushes, `${label}: um push por caixa`).toBe(want.length);
        for (const box of state.boxes) {
          expect(box.media, `${label}: ${box.unit} perdeu a regra de largura`).toBeNull();
          expect(box.shown, `${label}: ${box.unit} à vista`).toBe(true);
        }
        for (const ins of state.ins) {
          expect(ins.client, label).toBe('ca-pub-0000000000000000');
          expect(ins.slot, label).toMatch(/^9\d{9}$/);
          if (ins.unit.startsWith('conteudo')) expect([ins.format, ins.responsive], label).toEqual(['auto', 'true']);
          else if (ins.unit === 'multiplex') expect([ins.format, ins.responsive], label).toEqual(['autorelaxed', null]);
          else expect([ins.format, ins.style.replaceAll(' ', '')], label).toEqual([null, 'display:inline-block;width:300px;height:600px;']);
        }
        // The lateral-2, where it shows, starts 1,200 px under the lateral, edge to edge.
        const rails = state.boxes.filter((box) => box.unit.startsWith('lateral'));
        if (rails.length === 2) expect(Math.round((rails[1]?.y ?? 0) - ((rails[0]?.y ?? 0) + (rails[0]?.h ?? 0))), `${label}: a lateral-2 a 1.200 px da 1ª`).toBe(1200);
        // Turning the phone or resizing the window: no ad made or taken, nothing pushed again, every box still on screen.
        const other = viewport.width < 768 ? DESKTOP : PHONE;
        await page.setViewportSize(other);
        await frames(page);
        const after = await pushed(page);
        expect(after.pushes, `${label} → ${other.width} px: nenhum push novo`).toBe(want.length);
        expect(after.ins.map((ins) => ins.unit), `${label} → ${other.width} px: as mesmas unidades`).toEqual(want);
        for (const box of after.boxes.filter((one) => !one.unit.startsWith('lateral'))) expect(box.shown, `${label} → ${other.width} px: ${box.unit} continua à vista`).toBe(true);
      }
    });
  }

  test('the same boxes and pushes in every state of a tool', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto(`${PRODUCTION_ORIGIN}/compress-image/`);
    await hydrated(page);
    await dismissCookies(page);
    const atRest = await pushed(page);
    expect(atRest.pushes).toBeGreaterThan(1);
    await chooseImage(page);
    await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
    const withResult = await pushed(page);
    expect(withResult.pushes).toBe(atRest.pushes);
    expect(withResult.ins.map((ins) => ins.unit)).toEqual(atRest.ins.map((ins) => ins.unit));
    expect(await page.locator('#fo-tool-root .fo-ad').count()).toBe(0);
  });

  test('the lateral-2: only on a page with 600 words or more, and only where the column has the room', async ({ page, context }) => {
    await page.setViewportSize(DESKTOP);
    // The image hub has under 600 words in English: no lateral-2 in its HTML, so none on screen.
    const hub = routeById('image-tools').paths.en ?? '';
    const hubHtml = await (await page.request.get(`${TEST_BUILD_ORIGIN}${hub}`)).text();
    expect(hubHtml).not.toContain('data-ad-unit="lateral-2"');
    await page.goto(`${PRODUCTION_ORIGIN}${hub}`);
    expect((await pushed(page)).boxes.map((box) => box.unit)).toEqual(['conteudo', 'multiplex', 'lateral']);
    // A long page has it, 1,200 px under the lateral, absolute in the column, which does not stick.
    await page.goto(`${PRODUCTION_ORIGIN}/compress-image/`);
    const long = await pushed(page);
    expect(long.boxes.map((box) => box.unit)).toContain('lateral-2');
    expect(await page.locator('.fo-ad--rail2').evaluate((box) => getComputedStyle(box).position)).toBe('absolute');
    expect(await page.locator('aside.fo-rail').evaluate((rail) => getComputedStyle(rail).position)).not.toMatch(/sticky|fixed/);
    // The same page with a column too short for both rails (control): the lateral-2 leaves, with no push.
    await context.route(`${PRODUCTION_ORIGIN}/merge-pdf/`, async (route) => {
      const response = await route.fetch({ url: `${TEST_BUILD_ORIGIN}/merge-pdf/` });
      const body = (await response.text()).replace('</head>', '<style>main{max-height:1800px;overflow:hidden}</style></head>');
      await route.fulfill({ response, body });
    });
    await page.goto(`${PRODUCTION_ORIGIN}/merge-pdf/`);
    const short = await pushed(page);
    expect(short.rail).toBeLessThan(2638);
    expect(short.boxes.map((box) => box.unit)).not.toContain('lateral-2');
    expect(short.pushes).toBe(short.ins.length);
  });
});

// ---- The coffee line of the footer and the anchor ----------------------------------------------------------------

/** The coffee line of the footer of a page of each mold, in the three languages. */
const FOOTER_PAGES = AD_PAGES.filter((page) => page.lang === 'en' || page.id === 'home' || page.id === 'compress-image').filter((page, index, all) => all.findIndex((other) => other.mold === page.mold && other.lang === page.lang) === index);

test('the coffee line of the footer keeps 150 px from the anchor, a strip of 100 px at the foot of the screen, with the page at its end', async ({ page }) => {
  test.setTimeout(120_000);
  const problems: string[] = [];
  for (const { path } of FOOTER_PAGES) {
    for (const viewport of [PHONE, DESKTOP]) {
      await page.setViewportSize(viewport);
      expect((await page.goto(path))?.status(), path).toBe(200);
      await dismissCookies(page);
      const gap = await page.evaluate(() => {
        scrollTo(0, document.documentElement.scrollHeight);
        const line = document.querySelector('.fo-footer__coffee')?.getBoundingClientRect();
        return line ? innerHeight - 100 - line.bottom : null;
      });
      if (gap === null) problems.push(`${path} a ${viewport.width} px: sem a linha do café no rodapé`);
      else if (gap < CLEARANCE) problems.push(`${path} a ${viewport.width} px: a linha do café a ${gap.toFixed(0)} px da âncora`);
    }
  }
  expect(problems, problems.join('\n')).toEqual([]);
});
