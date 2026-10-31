// pnpm screenshots: one PNG per component and theme for the report (DECISOES § 51), over dist/ (build
// first), at 360px (Header, Footer and the tool page also at 1280px), cropped to the element, with
// deviceScaleFactor 1. States come from the real flow (drag over, a broken file, a slowed engine, a real
// photo, a third use with the cookies accepted); the FileCard and the OliMessage, which no page uses
// yet, come from their design-system markup with the CSS of the build. Not part of pnpm verificar:
// screenshots differ between Windows and Ubuntu.
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Browser, type Locator, type Page } from '@playwright/test';
import { requireDist } from './lib/dist.ts';

const ORIGIN = 'http://127.0.0.1:4173';
const OUT = 'docs/relatorios/fase-01b';
const PHOTO = 'fixtures/images/jpg-02-iphone6-paisagem-gps.jpg';
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
  const page = await browser.newPage({ viewport: { width, height: width < 768 ? 740 : 800 }, deviceScaleFactor: 1, colorScheme: theme, reducedMotion: 'reduce' });
  await page.addInitScript(
    ([choice, uses]) => {
      if (choice) localStorage.setItem('fo-consent', choice);
      if (uses) localStorage.setItem('fo-coffee', JSON.stringify({ uses }));
    },
    [consent, coffeeUses] as const,
  );
  await page.goto(`${ORIGIN}${path}`);
  await page.evaluate(() => document.fonts.ready);
  if (path.includes('compress') || path.includes('comprimir')) await page.locator('#fo-tool-root[data-hydrated="true"]').waitFor();
  return page;
}

/** Crops to the element, with room around it (the Oli sits above the DropZone; the wave above the footer). */
async function shot(locator: Locator, name: string, pad: { top?: number; side?: number } = {}): Promise<void> {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error(`${name}: element not visible`);
  const top = pad.top ?? 8;
  const side = pad.side ?? 8;
  await locator.page().screenshot({
    path: join(OUT, `${name}.png`),
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
        const page = await open(browser, theme, width, '/compress-image/', null);
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

      page = await open(browser, theme, 360, '/');
      await shot(page.locator('.fo-hero'), `home-hero-${theme}-360`);
      await shot(page.locator('.fo-tool'), `tool-card-${theme}-360`, { top: 8 });
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

      page = await isolated(browser, theme, css, `<div style="max-width:328px">${previewMarkup('FileCard')}</div>`);
      await shot(page.locator('.fo-filelist').first(), `file-card-${theme}-360`);
      await page.close();

      page = await isolated(browser, theme, css, `<div style="display:grid;gap:16px;max-width:328px">${previewMarkup('OliMessage')}</div>`);
      await shot(page.locator('.fo-says').first(), `oli-message-${theme}-360`, { top: 8 });
      await page.close();
    }
  } finally {
    await browser.close();
    server?.kill();
  }
}

await main();
