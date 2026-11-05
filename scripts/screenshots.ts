// pnpm screenshots: one PNG per component and theme for the report of the current run (DECISOES § 51), over
// dist/ (build first), at 360px (Header, Footer, the tool page and the image hub also at 1280px), cropped to the
// element, with deviceScaleFactor 1. States come from the real flow (drag over, a broken file, a slowed engine, a
// real photo, a batch with a file that is not an image, a third use with the cookies accepted); the FileCard and
// the OliMessage previews come from their design-system markup with the CSS of the build. F2: the queue while it
// works and when it is done with an error row, the batch ResultCard, the BeforeAfter, the crop editor, the Resize
// fields (also with an error) and the hub. F3: the end of the page with the cookie notice open, at 360 and 1280px.
// F4: the calculator components and the money pages (a calculator, the hub, a guide and the debt list).
// F5a: the PDF pieces in the states the PDF tools reach (DECISOES § 152 and § 170, walked by tests/e2e/lib/pdf-states.ts,
// the same walk ads.spec.ts and a11y.spec.ts look at), some PDF pages whole, the PDF hub, the home's PDF section and the
// four new icons beside their neighbours (§ 149), drawn in currentColor as the site draws them (src/icons/svg.ts).
// F5b: two file guides whole (an image one and a PDF one), at rest and with the embedded tool's result, and the guides list
// of the image hub.
// The languages adjustment: the QR code in pt and es with a code made from a text with accents, a Spanish calculator with
// long labels (Home affordability and Rent vs buy), a Spanish preset, a Spanish money guide, a Portuguese image file guide
// and a Spanish PDF file guide, whole, at both widths.
// F6: the Portuguese and Spanish pages whole, at both widths: an image tool and a PDF tool with their result, a calculator
// of each language, the Brazilian money hub, and the support page with its Pix (and the Pix block alone at 360px).
// F8: the offline page in the three languages, the "Open with" page with files and empty, and the offline line of a
// tool kept without its engine, at both widths.
// Not part of pnpm verificar: screenshots differ between Windows and Ubuntu.
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Browser, type Locator, type Page } from '@playwright/test';
import { requireDist } from './lib/dist.ts';
import { PDF_WALKS, walkPdfTool, type PdfState } from '../tests/e2e/lib/pdf-states.ts';

const ORIGIN = 'http://127.0.0.1:4173';
// F3 had a folder of its own under fase-03/, which keeps the before and after shots of the cookie notice; F4 wrote
// under fase-04/, F5a under fase-05a/, F5b under fase-05b/, F6 under fase-06/, F7 under fase-07/ and F8 writes under fase-08/,
// leaving the older shots as they were.
const OUT = 'docs/relatorios/ajuste-idiomas/componentes';
const PHOTO = 'fixtures/images/jpg-02-iphone6-paisagem-gps.jpg';
// The 12 MP portrait photo: the last file of a batch, so the queue is caught with rows ready, one working and one error.
const BIG_PHOTO = 'fixtures/images/jpg-01-pixel2-retrato-gps.jpg';

/** A batch for the queue: copies of the photo under their own names, a text file among them, and the big photo last. */
function batch(): { name: string; mimeType: string; buffer: Buffer }[] {
  const photo = readFileSync(PHOTO);
  return [
    { name: 'beach-day.jpg', mimeType: 'image/jpeg', buffer: photo },
    { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') },
    { name: 'harbour.jpg', mimeType: 'image/jpeg', buffer: photo },
    { name: 'portrait.jpg', mimeType: 'image/jpeg', buffer: readFileSync(BIG_PHOTO) },
  ];
}
/** The PDF pages shot whole (the others show the same mold), and the tools whose pieces are shot at 1280px too. */
const PDF_WHOLE = ['/merge-pdf/', '/compress-pdf/', '/protect-pdf/', '/sign-pdf/'];
const PDF_WIDE = new Set(['merge-pdf', 'split-pdf', 'protect-pdf', 'sign-pdf']);
/** The new icons of F5a and the neighbours they sit beside in the PDF pages. */
const PDF_ICONS = ['merge', 'split', 'sign', 'watermark', 'page-number', 'reorder', 'lock', 'unlock'];
const THEMES = ['light', 'dark'] as const;
type Theme = (typeof THEMES)[number];

async function up(): Promise<boolean> {
  try {
    return (await fetch(`${ORIGIN}/`)).ok;
  } catch {
    return false;
  }
}

async function serve(): Promise<ChildProcess | null> {
  if (await up()) return null;
  const server = spawn(process.execPath, ['scripts/serve-dist.ts'], { stdio: 'ignore' });
  for (let i = 0; i < 50 && !(await up()); i++) await new Promise((resolve) => setTimeout(resolve, 100));
  return server;
}

async function open(browser: Browser, theme: Theme, width: number, path: string, consent: 'granted' | 'denied' | null = 'denied', coffeeUses = 0): Promise<Page> {
  // No service worker, as in the tests (DECISOES § 294): once it controls the page, page.route no longer sees what it
  // answers, and the shots that hold a file back (the water level) would never catch the state.
  const page = await browser.newPage({ viewport: { width, height: width < 768 ? 740 : 800 }, deviceScaleFactor: 1, colorScheme: theme, reducedMotion: 'reduce', serviceWorkers: 'block' });
  await page.addInitScript(
    ([choice, uses]) => {
      if (choice) localStorage.setItem('fo-consent', choice);
      if (uses) localStorage.setItem('fo-coffee', JSON.stringify({ uses }));
    },
    [consent, coffeeUses] as const,
  );
  await page.goto(`${ORIGIN}${path}`);
  await page.evaluate(() => document.fonts.ready);
  // Any tool or preset page has the island root; the others (home, legal, 404) do not.
  if ((await page.locator('#fo-tool-root').count()) > 0) await page.locator('#fo-tool-root[data-hydrated="true"]').waitFor();
  return page;
}

/**
 * Crops to the element, with room around it (the Oli sits above the DropZone; the wave above the footer). The clip
 * is in page coordinates over a full-page capture, so an element taller than the window (the crop editor under its
 * result card) comes out whole.
 */
async function shot(locator: Locator, name: string, pad: { top?: number; side?: number } = {}): Promise<void> {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return { x: rect.left + scrollX, y: rect.top + scrollY, width: rect.width, height: rect.height };
  });
  if (box.width === 0 || box.height === 0) throw new Error(`${name}: element not visible`);
  const top = pad.top ?? 8;
  const side = pad.side ?? 8;
  await locator.page().screenshot({
    path: join(OUT, `${name}.png`),
    fullPage: true,
    clip: { x: Math.max(0, box.x - side), y: Math.max(0, box.y - top), width: box.width + 2 * side, height: box.height + top + 8 },
  });
  console.log(`  ${name}.png`);
}

async function drop(page: Page, file: string): Promise<void> {
  await page.setInputFiles('input[type="file"]', file);
}

async function dragOver(page: Page): Promise<void> {
  const transfer = await page.evaluateHandle(() => {
    const data = new DataTransfer();
    data.items.add(new File(['x'], 'photo.jpg', { type: 'image/jpeg' }));
    return data;
  });
  await page.locator('.fo-drop').dispatchEvent('dragenter', { dataTransfer: transfer });
}

async function isolated(browser: Browser, theme: Theme, css: string, body: string): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 1, colorScheme: theme, reducedMotion: 'reduce' });
  await page.goto(`${ORIGIN}/404.html`);
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="${ORIGIN}${css}"></head><body style="padding:16px">${body}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

/** The design-system markup of a component (its preview.html body), images swapped for plain boxes. */
function previewMarkup(component: string): string {
  const html = readFileSync(`docs/design/components/${component}/preview.html`, 'utf8');
  const body = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
  return body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<img class="fo-file__thumb"[^>]*>/g, '<div class="fo-file__thumb"></div>');
}

async function main(): Promise<void> {
  requireDist();
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  const css = readdirSync('dist/_astro').filter((file) => file.endsWith('.css')).map((file) => `/_astro/${file}`)[0];
  if (!css) throw new Error('no CSS in dist/_astro');
  const server = await serve();
  const browser = await chromium.launch();
  try {
    for (const theme of THEMES) {
      console.log(`tema ${theme}`);
      for (const width of [360, 1280]) {
        const page = await open(browser, theme, width, '/compress-image/');
        await shot(page.locator('.fo-header'), `header-${theme}-${width}`, { top: 0, side: 0 });
        await page.screenshot({ path: join(OUT, `tool-page-${theme}-${width}.png`), fullPage: true });
        console.log(`  tool-page-${theme}-${width}.png`);
        await shot(page.locator('.fo-footer'), `footer-${theme}-${width}`, { top: 20, side: 0 });
        await page.close();
      }

      let page = await open(browser, theme, 360, '/compress-image/');
      await shot(page.locator('.fo-crumbs'), `breadcrumb-${theme}-360`);
      await shot(page.locator('.fo-seal'), `privacy-seal-${theme}-360`);
      await shot(page.locator('.fo-drop'), `dropzone-idle-${theme}-360`, { top: 92 });
      await shot(page.locator('.fo-options'), `option-group-${theme}-360`);
      await shot(page.locator('.fo-ad--content'), `ad-slot-${theme}-360`);
      await shot(page.locator('.fo-faq'), `faq-${theme}-360`);
      await dragOver(page);
      await page.locator('.fo-drop[data-state="over"]').waitFor();
      await shot(page.locator('.fo-drop'), `dropzone-over-${theme}-360`, { top: 92 });
      await page.locator('.fo-drop').dispatchEvent('dragleave');
      await drop(page, 'package.json');
      await page.locator('.fo-drop[data-state="error"]').waitFor();
      await shot(page.locator('.fo-drop'), `dropzone-error-${theme}-360`, { top: 92 });
      await page.close();

      // WaterLevel: the engine module is held back, so the progress (shown after 400ms) stays on screen.
      page = await open(browser, theme, 360, '/compress-image/');
      let release = (): void => {};
      const held = new Promise<void>((resolve) => (release = resolve));
      await page.route('**/_astro/engine-client*.js', async (route) => {
        await held;
        await route.continue();
      });
      await drop(page, PHOTO);
      await page.locator('.fo-level').waitFor();
      await shot(page.locator('.fo-level'), `water-level-${theme}-360`);
      // The engine is too fast to catch half-way, so the real component is set to 55% for one more shot.
      await page.locator('.fo-level').evaluate((level) => {
        (level as HTMLElement).style.setProperty('--level', '55%');
        const pct = level.querySelector('.fo-level__pct');
        if (pct) pct.textContent = '55%';
      });
      await shot(page.locator('.fo-level'), `water-level-55-${theme}-360`);
      release();
      await page.locator('.fo-result').waitFor();
      await shot(page.locator('.fo-result'), `result-card-${theme}-360`);
      await shot(page.locator('.fo-next'), `next-step-chips-${theme}-360`);
      await page.close();

      page = await open(browser, theme, 1280, '/compress-image/');
      await drop(page, PHOTO);
      await page.locator('.fo-placard').waitFor();
      await shot(page.locator('.fo-result'), `result-card-placard-${theme}-1280`, { top: 16 });
      await shot(page.locator('.fo-ad--rail'), `ad-slot-rail-${theme}-1280`);
      await page.close();

      // Third successful use in this browser, with the cookies accepted: the coffee line appears.
      page = await open(browser, theme, 360, '/compress-image/', 'granted', 2);
      await drop(page, PHOTO);
      await page.locator('.fo-result__support').waitFor();
      await shot(page.locator('.fo-result'), `result-card-coffee-${theme}-360`);
      await page.close();

      page = await open(browser, theme, 360, '/compress-image/', null);
      await shot(page.locator('.fo-cookie'), `cookie-notice-${theme}-360`);
      await page.close();

      // F3: the end of the page with the notice still open, where the light band of DECISOES § 91 showed.
      for (const width of [360, 1280]) {
        page = await open(browser, theme, width, '/', null);
        await page.locator('#fo-cookie').waitFor();
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await page.screenshot({ path: join(OUT, `footer-cookie-open-${theme}-${width}.png`) });
        console.log(`  footer-cookie-open-${theme}-${width}.png`);
        await page.close();
      }

      // F13b (UX-03 B; DECISOES § 567): the top of the home is .fo-home-top, and its tools are chips; the ToolCard is the
      // first card of the image hub.
      page = await open(browser, theme, 360, '/image-tools/');
      await shot(page.locator('.fo-tool').first(), `tool-card-${theme}-360`, { top: 8 });
      await page.close();
      page = await open(browser, theme, 360, '/');
      await shot(page.locator('.fo-home-top'), `home-hero-${theme}-360`);
      await page.getByRole('button', { name: /Search tools/ }).click();
      await page.locator('#fo-search-dialog input').fill('compress');
      await page.locator('#fo-search-dialog [role="option"]').first().waitFor();
      await shot(page.locator('#fo-search-dialog .fo-search'), `search-results-${theme}-360`);
      await page.locator('#fo-search-dialog input').fill('youtube downloader');
      await page.locator('#fo-search-dialog .fo-search__peek').waitFor();
      await shot(page.locator('#fo-search-dialog .fo-search'), `search-empty-${theme}-360`);
      await page.close();

      page = await open(browser, theme, 360, '/404.html');
      await shot(page.locator('.fo-hero'), `not-found-hero-${theme}-360`);
      await page.close();

      page = await open(browser, theme, 360, '/support/');
      await shot(page.locator('.fo-support'), `support-card-${theme}-360`);
      await page.close();

      // F2: the queue. The worker module is held back first, so every row waits with the WaterLevel on screen.
      page = await open(browser, theme, 360, '/compress-image/');
      let releaseWorker = (): void => {};
      const workerHeld = new Promise<void>((resolve) => (releaseWorker = resolve));
      await page.route(/\/_astro\/worker-[\w-]+\.js$/, async (route) => {
        await workerHeld;
        await route.continue();
      });
      await page.setInputFiles('input[type="file"]', batch());
      await page.locator('.fo-filelist .fo-file').nth(3).waitFor();
      await page.locator('.fo-level').waitFor();
      await shot(page.locator('#fo-tool-root'), `queue-waiting-${theme}-360`);
      releaseWorker();
      // The big photo takes a while: rows ready, the error row and the one still working, on one screen.
      await page.locator('.fo-file[data-state="error"]').waitFor();
      try {
        await page.locator('.fo-filelist [role="progressbar"]').waitFor({ timeout: 5_000 });
        await shot(page.locator('.fo-filelist'), `queue-working-${theme}-360`);
      } catch {
        console.log('  queue-working: the batch finished before the shot (skipped)');
      }
      await page.locator('.fo-result').waitFor({ timeout: 60_000 });
      await shot(page.locator('.fo-filelist'), `queue-done-${theme}-360`);
      await shot(page.locator('.fo-result'), `result-card-batch-${theme}-360`);
      await shot(page.locator('.fo-ba'), `before-after-${theme}-360`);
      await page.close();

      page = await open(browser, theme, 1280, '/compress-image/');
      await page.setInputFiles('input[type="file"]', batch());
      await page.locator('.fo-result').waitFor({ timeout: 60_000 });
      await page.locator('.fo-ba').waitFor();
      await shot(page.locator('#fo-tool-root'), `result-card-batch-${theme}-1280`, { top: 16 });
      await page.close();

      page = await open(browser, theme, 360, '/crop-image/');
      await drop(page, PHOTO);
      await page.locator('.fo-crop__box').waitFor();
      await shot(page.locator('#fo-tool-root'), `crop-editor-${theme}-360`);
      await page.close();

      page = await open(browser, theme, 360, '/resize-image/');
      await drop(page, PHOTO);
      await page.locator('.fo-result').waitFor();
      await shot(page.locator('.fo-fields').first(), `resize-fields-${theme}-360`);
      await page.locator('#rz-width').fill('0');
      await page.locator('#rz-width').blur();
      await page.locator('.fo-fields [role="alert"]').first().waitFor();
      await shot(page.locator('.fo-fields').first(), `resize-fields-error-${theme}-360`);
      await page.close();

      for (const width of [360, 1280]) {
        page = await open(browser, theme, width, '/image-tools/');
        await shot(page.locator('.fo-hubband'), `hub-band-${theme}-${width}`);
        await page.screenshot({ path: join(OUT, `hub-page-${theme}-${width}.png`), fullPage: true });
        console.log(`  hub-page-${theme}-${width}.png`);
        await page.close();
      }

      // F4: the calculator components from the real page (fields, ResultHero with the SplitChart, ExportBar with
      // Link copied, a field in error, ScenarioCompare, the schedule open by year) and the money pages whole.
      for (const width of [360, 1280]) {
        for (const path of ['/mortgage-calculator/', '/money-calculators/', '/guides/15-vs-30-year-mortgage/', '/debt-payoff-calculator/']) {
          page = await open(browser, theme, width, path);
          const name = path.split('/').filter(Boolean).at(-1) ?? 'page';
          await page.screenshot({ path: join(OUT, `money-${name}-${theme}-${width}.png`), fullPage: true });
          console.log(`  money-${name}-${theme}-${width}.png`);
          await page.close();
        }
      }
      page = await open(browser, theme, 360, '/mortgage-calculator/');
      await page.evaluate(() => {
        const clipboard = navigator.clipboard;
        if (clipboard) clipboard.writeText = async () => undefined;
      });
      await shot(page.locator('.fo-calc__main'), `number-fields-${theme}-360`);
      await shot(page.locator('.fo-rhero'), `result-hero-${theme}-360`);
      await page.locator('.fo-export .fo-btn').nth(2).click();
      await page.locator('.fo-copied').waitFor();
      await shot(page.locator('.fo-export-wrap'), `export-bar-copied-${theme}-360`);
      await page.locator('#fo-calc-r').fill('99');
      await page.locator('#fo-calc-r-error').waitFor();
      await shot(page.locator('.fo-calc__main'), `number-fields-error-${theme}-360`);
      await page.locator('#fo-calc-r').fill('6.5');
      await page.getByRole('button', { name: 'Show the full schedule' }).click();
      await page.locator('.fo-amort').waitFor();
      await shot(page.locator('#fo-calc-schedule'), `amort-table-${theme}-360`);
      await page.close();
      page = await open(browser, theme, 360, '/mortgage-calculator/15-vs-30-year/');
      await shot(page.locator('.fo-compare'), `scenario-compare-${theme}-360`);
      await page.close();

      // F5a: each PDF tool walked through its states on one load; the panel is shot in each state but the rest and the
      // reading (the drop zone and the WaterLevel are the image ones), once per state.
      for (const width of [360, 1280]) {
        for (const { id } of PDF_WALKS) {
          if (width === 1280 && !PDF_WIDE.has(id)) continue;
          page = await browser.newPage({ baseURL: ORIGIN, viewport: { width, height: width < 768 ? 740 : 800 }, deviceScaleFactor: 1, colorScheme: theme, reducedMotion: 'reduce' });
          await page.addInitScript(() => localStorage.setItem('fo-consent', 'denied'));
          const taken = new Map<PdfState, number>();
          await walkPdfTool(
            page,
            id,
            async (state) => {
              if (state === 'rest' || state === 'processing') return;
              const n = (taken.get(state) ?? 0) + 1;
              taken.set(state, n);
              // The thumbnails of the page grid are drawn in the PDF worker only while their cell is on screen: the grid
              // comes into view and the shot waits for the pictures of the cells in sight.
              const grid = page.locator('.fo-pages__grid');
              if ((await grid.count()) > 0) {
                await grid.scrollIntoViewIfNeeded();
                await page.waitForFunction(
                  () =>
                    [...document.querySelectorAll('.fo-pages__grid .fo-page')]
                      .filter((cell) => cell.getBoundingClientRect().top < innerHeight)
                      .every((cell) => cell.querySelector('img')?.complete),
                  null,
                  { timeout: 30_000 },
                );
              }
              await shot(page.locator('#fo-tool-root'), `pdf-${id}-${state}${n > 1 ? `-${n}` : ''}-${theme}-${width}`);
            },
            { hold: false },
          );
          await page.close();
        }
        for (const path of PDF_WHOLE) {
          page = await open(browser, theme, width, path);
          const name = path.split('/').filter(Boolean).at(-1) ?? 'page';
          await page.screenshot({ path: join(OUT, `pdf-page-${name}-${theme}-${width}.png`), fullPage: true });
          console.log(`  pdf-page-${name}-${theme}-${width}.png`);
          await page.close();
        }
        page = await open(browser, theme, width, '/pdf-tools/');
        await shot(page.locator('.fo-hubband'), `pdf-hub-band-${theme}-${width}`);
        await page.screenshot({ path: join(OUT, `pdf-hub-page-${theme}-${width}.png`), fullPage: true });
        console.log(`  pdf-hub-page-${theme}-${width}.png`);
        await page.close();
        page = await open(browser, theme, width, '/');
        await shot(page.locator('section[aria-labelledby="pdf-home"]'), `home-pdf-section-${theme}-${width}`);
        await shot(page.locator('.fo-footer'), `footer-home-${theme}-${width}`, { top: 20, side: 0 });
        await page.close();
      }
      const icons = PDF_ICONS.map((name) => {
        const svg = readFileSync(`docs/design/assets/Icons/${name}.svg`, 'utf8').replace('stroke="#0F1B2D"', 'stroke="currentColor"');
        return `<figure style="margin:0;display:grid;justify-items:center;gap:6px;color:var(--ink)"><span style="display:flex;gap:12px;align-items:end"><span style="width:24px;height:24px;display:block">${svg}</span><span style="width:48px;height:48px;display:block">${svg}</span></span><figcaption style="font:12px/1.2 sans-serif;color:var(--ink-muted)">${name}</figcaption></figure>`;
      }).join('');
      page = await isolated(browser, theme, css, `<div id="shot" style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;max-width:328px;background:var(--bg)">${icons.replaceAll('<svg', '<svg width="100%" height="100%"')}</div>`);
      await shot(page.locator('#shot'), `pdf-icons-${theme}-360`);
      await page.close();

      // F5b: the file guides, whole, at both widths: the HEIC guide at rest and with a result, the PDF guide at rest; and
      // the guides list of the image hub.
      for (const width of [360, 1280]) {
        page = await open(browser, theme, width, '/guides/heic-to-jpg-on-windows/');
        await shot(page.locator('main'), `guide-heic-${theme}-${width}`, { top: 0, side: 0 });
        await drop(page, 'fixtures/images/heic-08-iphone13pro-paisagem-hdr-ios17.heic');
        await page.locator('.fo-btn--download').waitFor({ timeout: 120_000 });
        await shot(page.locator('#fo-tool-root'), `guide-heic-result-${theme}-${width}`);
        await page.close();
        page = await open(browser, theme, width, '/guides/why-is-my-pdf-so-large/');
        await shot(page.locator('main'), `guide-pdf-${theme}-${width}`, { top: 0, side: 0 });
        await page.close();
      }
      page = await open(browser, theme, 360, '/image-tools/');
      await shot(page.locator('section[aria-labelledby="guides"]'), `image-hub-guides-${theme}-360`);
      await page.close();

      page = await isolated(browser, theme, css, `<div style="max-width:328px">${previewMarkup('FileCard')}</div>`);
      await shot(page.locator('.fo-filelist').first(), `file-card-${theme}-360`);
      await page.close();

      page = await isolated(browser, theme, css, `<div id="shot" style="display:grid;gap:16px;max-width:328px">${previewMarkup('OliMessage')}</div>`);
      await shot(page.locator('#shot'), `oli-message-${theme}-360`, { top: 8 });
      await page.close();

      page = await isolated(browser, theme, css, `<div id="shot" style="display:grid;gap:12px;justify-items:start;max-width:328px">${previewMarkup('Button')}</div>`);
      await shot(page.locator('#shot'), `button-${theme}-360`);
      await page.close();

      // F6: Portuguese and Spanish. An image tool and a PDF tool with their result, the calculators and the Pix, whole.
      for (const width of [360, 1280]) {
        for (const [lang, path] of [['pt', '/pt/comprimir-imagem/'], ['es', '/es/comprimir-imagen/']] as const) {
          page = await open(browser, theme, width, path);
          await drop(page, PHOTO);
          await page.locator('.fo-btn--download').waitFor({ timeout: 120_000 });
          await page.screenshot({ path: join(OUT, `i18n-image-${lang}-${theme}-${width}.png`), fullPage: true });
          console.log(`  i18n-image-${lang}-${theme}-${width}.png`);
          await page.close();
        }
        for (const lang of ['pt', 'es'] as const) {
          page = await browser.newPage({ baseURL: ORIGIN, viewport: { width, height: width < 768 ? 740 : 800 }, deviceScaleFactor: 1, colorScheme: theme, reducedMotion: 'reduce' });
          await page.addInitScript(() => localStorage.setItem('fo-consent', 'denied'));
          await walkPdfTool(
            page,
            'merge-pdf',
            async (state) => {
              if (state !== 'result') return;
              await page.screenshot({ path: join(OUT, `i18n-pdf-merge-${lang}-${theme}-${width}.png`), fullPage: true });
              console.log(`  i18n-pdf-merge-${lang}-${theme}-${width}.png`);
            },
            { hold: false, lang },
          );
          await page.close();
        }
        for (const [name, path] of [['sac-price-pt', '/pt/simulador-sac-price/'], ['card-pt', '/pt/calculadora-cartao-de-credito/'], ['hub-pt', '/pt/calculadoras-financeiras/'], ['mortgage-es', '/es/calculadora-de-hipoteca/'], ['support-pt', '/pt/apoie/']] as const) {
          page = await open(browser, theme, width, path);
          await page.screenshot({ path: join(OUT, `i18n-${name}-${theme}-${width}.png`), fullPage: true });
          console.log(`  i18n-${name}-${theme}-${width}.png`);
          if (name === 'support-pt' && width === 360) await shot(page.locator('#pix'), `pix-${theme}-360`);
          await page.close();
        }
      }

      // F7: a home calculator, a health one in both units, the due date, the QR code with a code made and both hubs.
      for (const width of [360, 1280]) {
        const pages = [
          ['concrete', '/concrete-calculator/'],
          ['square-footage', '/square-footage-calculator/'],
          ['bmi-us', '/bmi-calculator/'],
          ['bmi-metric', '/bmi-calculator/#v=1&u=metric'],
          ['due-date', '/due-date-calculator/'],
          ['home-hub', '/home-calculators/'],
          ['health-hub', '/health-calculators/'],
        ] as const;
        for (const [name, path] of pages) {
          page = await open(browser, theme, width, path);
          await page.screenshot({ path: join(OUT, `f7-${name}-${theme}-${width}.png`), fullPage: true });
          console.log(`  f7-${name}-${theme}-${width}.png`);
          await page.close();
        }
        page = await open(browser, theme, width, '/qr-code-generator/');
        const box = page.locator('textarea').first();
        if (await box.count()) {
          await box.fill('https://fileorca.com/qr-code-generator/');
          await page.locator('.fo-qr svg, [data-qr-preview] svg').first().waitFor({ timeout: 10_000 }).catch(() => undefined);
        }
        await page.screenshot({ path: join(OUT, `f7-qr-code-${theme}-${width}.png`), fullPage: true });
        console.log(`  f7-qr-code-${theme}-${width}.png`);
        await page.close();
      }

      // F8: the offline page in the three languages with the kept pages listed, the "Open with" page with an image and a
      // PDF shared and empty, and the offline line of a tool kept without its engine. A context of its own each, with the
      // service worker on (it keeps the pages first, then the network goes away for the tool).
      for (const width of [360, 1280]) {
        const viewport = { width, height: width < 768 ? 740 : 800 };
        const fresh = async () => {
          const context = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: theme, reducedMotion: 'reduce', serviceWorkers: 'allow' });
          await context.addInitScript(() => localStorage.setItem('fo-consent', 'denied'));
          return context;
        };
        const controlled = async (target: Page) => {
          await target.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 20_000 });
          await target.waitForTimeout(1500);
        };
        for (const [lang, path, home] of [['en', '/offline/', '/'], ['pt', '/pt/offline/', '/pt/'], ['es', '/es/sin-conexion/', '/es/']] as const) {
          const context = await fresh();
          const tab = await context.newPage();
          await tab.goto(`${ORIGIN}${home}`);
          await controlled(tab);
          await tab.goto(`${ORIGIN}${lang === 'en' ? '/compress-image/' : lang === 'pt' ? '/pt/juntar-pdf/' : '/es/calculadora-de-hipoteca/'}`);
          await tab.waitForTimeout(1500);
          await tab.goto(`${ORIGIN}${path}`);
          await tab.locator('[data-saved] li').first().waitFor({ timeout: 10_000 });
          await tab.evaluate(() => document.fonts.ready);
          await tab.screenshot({ path: join(OUT, `f8-offline-${lang}-${theme}-${width}.png`), fullPage: true });
          console.log(`  f8-offline-${lang}-${theme}-${width}.png`);
          await context.close();
        }
        {
          const context = await fresh();
          const tab = await context.newPage();
          await tab.goto(`${ORIGIN}/open-with/`);
          await tab.evaluate(() => document.fonts.ready);
          await tab.screenshot({ path: join(OUT, `f8-open-with-empty-${theme}-${width}.png`), fullPage: true });
          console.log(`  f8-open-with-empty-${theme}-${width}.png`);
          await controlled(tab);
          await tab.evaluate(() => {
            const form = document.createElement('form');
            form.id = 'fo-shot-share';
            form.method = 'post';
            form.enctype = 'multipart/form-data';
            form.action = '/open-with/';
            const input = document.createElement('input');
            input.type = 'file';
            input.name = 'files';
            input.multiple = true;
            form.append(input);
            document.body.append(form);
          });
          await tab.setInputFiles('#fo-shot-share input', [
            { name: 'beach-day.jpg', mimeType: 'image/jpeg', buffer: readFileSync(PHOTO) },
            { name: 'contract.pdf', mimeType: 'application/pdf', buffer: readFileSync('fixtures/pdf/gen-paginas-mistas.pdf') },
          ]);
          await Promise.all([tab.waitForURL('**/open-with/'), tab.evaluate(() => (document.getElementById('fo-shot-share') as HTMLFormElement).submit())]);
          await tab.locator('[data-shared]').waitFor({ state: 'visible', timeout: 10_000 });
          await tab.evaluate(() => document.fonts.ready);
          await tab.screenshot({ path: join(OUT, `f8-open-with-files-${theme}-${width}.png`), fullPage: true });
          console.log(`  f8-open-with-files-${theme}-${width}.png`);
          await context.close();
        }
        {
          const context = await fresh();
          const tab = await context.newPage();
          await tab.goto(`${ORIGIN}/rotate-image/`);
          await tab.locator('#fo-tool-root[data-hydrated="true"]').waitFor();
          await controlled(tab);
          await context.setOffline(true);
          await tab.reload();
          await tab.locator('#fo-tool-root[data-hydrated="true"]').waitFor();
          await tab.setInputFiles('input[type="file"]', PHOTO);
          await tab.locator('.fo-drop[data-state="offline"]').waitFor({ timeout: 20_000 });
          await tab.evaluate(() => document.fonts.ready);
          await shot(tab.locator('.fo-drop'), `f8-tool-offline-${theme}-${width}`, { top: 92 });
          await tab.screenshot({ path: join(OUT, `f8-tool-offline-page-${theme}-${width}.png`), fullPage: true });
          console.log(`  f8-tool-offline-page-${theme}-${width}.png`);
          await context.close();
        }
      }

      // The languages adjustment: the new pages of pt and es, whole, at both widths.
      for (const width of [360, 1280]) {
        for (const [lang, path, text] of [['pt', '/pt/gerador-de-qr-code/', 'Ação de graças na praça'], ['es', '/es/generador-de-codigo-qr/', 'Año nuevo con el ñandú']] as const) {
          page = await open(browser, theme, width, path);
          const box = page.locator('textarea').first();
          await box.fill(text);
          await page.locator('.fo-qr svg, [data-qr-preview] svg').first().waitFor({ timeout: 10_000 }).catch(() => undefined);
          await page.screenshot({ path: join(OUT, `idiomas-qr-code-${lang}-${theme}-${width}.png`), fullPage: true });
          console.log(`  idiomas-qr-code-${lang}-${theme}-${width}.png`);
          await page.close();
        }
        const pages = [
          ['home-affordability-es', '/es/calculadora-de-cuanta-casa-puedo-pagar/'],
          ['rent-vs-buy-es', '/es/calculadora-de-alquilar-o-comprar/'],
          ['preset-15-vs-30-es', '/es/calculadora-de-hipoteca/15-o-30-anos/'],
          ['money-guide-es', '/es/guias/bola-de-nieve-o-avalancha/'],
          ['file-guide-image-pt', '/pt/guias/jpg-ou-png/'],
          ['file-guide-pdf-es', '/es/guias/por-que-mi-pdf-pesa-tanto/'],
          ['money-hub-es', '/es/calculadoras-financieras/'],
        ] as const;
        for (const [name, path] of pages) {
          page = await open(browser, theme, width, path);
          await page.screenshot({ path: join(OUT, `idiomas-${name}-${theme}-${width}.png`), fullPage: true });
          console.log(`  idiomas-${name}-${theme}-${width}.png`);
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
    server?.kill();
  }
}

await main();
