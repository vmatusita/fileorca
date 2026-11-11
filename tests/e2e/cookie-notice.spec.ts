import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import enCommon from '../../src/i18n/en/common.ts';
import esCommon from '../../src/i18n/es/common.ts';
import ptCommon from '../../src/i18n/pt/common.ts';
import enImage from '../../src/tools/image/i18n/en.ts';
import esImage from '../../src/tools/image/i18n/es.ts';
import ptImage from '../../src/tools/image/i18n/pt.ts';
import { LANGS, routeById } from '../../src/i18n/routes.ts';
import { hydrated } from './lib/page.ts';

// F13a · o aviso compacto (UX-09; DECISOES § 458). On a first visit (no fo-consent) the card is two lines of the small
// style and the two equal buttons, 128px tall at 360px in the three languages (148px with three lines, pt and es at
// 320px), 360px wide from 768px; it repeats the seal of the page; it never covers the Choose button nor the first field
// (F4-F7 f-1, exit a), nor the "Choose other files" of the error, which keep() moves out from under it when the panel
// changes state under the same focused button (WCAG 2.4.11); and at the end of a page at 1280px it covers at most two
// links of the footer (ajuste-aviso-espaco). Before: 200 and 222px at 360px, and the Choose of the pt covered 32 of 60px.

type Lang = 'en' | 'pt' | 'es';
const COMMON = { en: enCommon, pt: ptCommon, es: esCommon } as const;
const IMAGE = { en: enImage, pt: ptImage, es: esImage } as const;

/** The pages of the criterion and the target the notice must leave free: the Choose of the DropZone or the first field. */
const FIRST_VISIT: { path: string; lang: Lang; target: string }[] = [
  { path: '/compress-image/', lang: 'en', target: '.fo-drop .fo-btn--brand' },
  { path: '/pt/comprimir-imagem/', lang: 'pt', target: '.fo-drop .fo-btn--brand' },
  { path: '/es/comprimir-imagen/', lang: 'es', target: '.fo-drop .fo-btn--brand' },
  { path: '/heic-to-jpg/', lang: 'en', target: '.fo-drop .fo-btn--brand' },
  { path: '/pt/heic-para-jpg/', lang: 'pt', target: '.fo-drop .fo-btn--brand' },
  { path: '/es/heic-a-jpg/', lang: 'es', target: '.fo-drop .fo-btn--brand' },
  { path: '/merge-pdf/', lang: 'en', target: '.fo-drop .fo-btn--brand' },
  { path: '/pt/juntar-pdf/', lang: 'pt', target: '.fo-drop .fo-btn--brand' },
  { path: '/es/unir-pdf/', lang: 'es', target: '.fo-drop .fo-btn--brand' },
  { path: '/mortgage-calculator/', lang: 'en', target: '#fo-tool-root input:not([type="hidden"])' },
  { path: '/es/calculadora-de-hipoteca/', lang: 'es', target: '#fo-tool-root input:not([type="hidden"])' },
  { path: '/pt/simulador-sac-price/', lang: 'pt', target: '#fo-tool-root input:not([type="hidden"])' },
];

/** The notice box and the box of the first element that matches the target, in viewport coordinates. */
async function boxes(page: Page, target: string) {
  return page.evaluate((selector) => {
    const rect = (element: Element | null) => {
      if (!element) return null;
      const r = element.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
    };
    const notice = document.getElementById('fo-cookie');
    return { notice: notice && !notice.hidden ? rect(notice) : null, target: rect(document.querySelector(selector)) };
  }, target);
}

async function open(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status(), path).toBe(200);
  await expect(page.locator('#fo-cookie')).toBeVisible();
}

test.describe('first visit at 360 × 740', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  for (const { path, lang, target } of FIRST_VISIT) {
    test(`${path}: the notice is at most 130px tall and the ${target.startsWith('.fo-drop') ? 'Choose button' : 'first field'} is entirely above it`, async ({ page }) => {
      await open(page, path);
      await expect(page.locator(target).first()).toBeVisible();
      const at = await boxes(page, target);
      expect(at.notice, `${path} (${lang}): the notice`).not.toBeNull();
      expect(at.notice!.height, `${path}: notice height`).toBeLessThanOrEqual(130);
      expect(at.target, `${path}: the target`).not.toBeNull();
      expect(at.target!.bottom, `${path}: the target ends above the notice`).toBeLessThanOrEqual(at.notice!.top);
    });
  }
});

test.describe('first visit at 320 × 640', () => {
  test.use({ viewport: { width: 320, height: 640 } });

  for (const path of ['/compress-image/', '/pt/comprimir-imagem/', '/es/comprimir-imagen/']) {
    test(`${path}: the notice is at most 130px tall in en and 150px in pt and es`, async ({ page }) => {
      await open(page, path);
      const at = await boxes(page, 'body');
      expect(at.notice!.height).toBeLessThanOrEqual(path.startsWith('/compress') ? 130 : 150);
    });
  }
});

test('from 768px the card is 360px wide, and the full width less 16px on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await open(page, '/pt/comprimir-imagem/');
  const notice = page.locator('#fo-cookie');
  expect((await notice.boundingBox())!.width).toBe(344);
  for (const size of [{ width: 768, height: 1024 }, { width: 1280, height: 800 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(size);
    expect(Math.round((await notice.boundingBox())!.width), `${size.width}px`).toBe(360);
    expect(Math.round((await notice.boundingBox())!.height), `${size.width}px`).toBeLessThanOrEqual(130);
  }
});

test.describe('the notice repeats the seal of the page', () => {
  const PAGES: { path: string; seal: (lang: Lang) => string | null; lang: Lang }[] = [
    { path: '/', lang: 'en', seal: (lang) => COMMON[lang].seal },
    { path: '/pt/', lang: 'pt', seal: (lang) => COMMON[lang].seal },
    { path: '/es/', lang: 'es', seal: (lang) => COMMON[lang].seal },
    { path: '/compress-image/', lang: 'en', seal: () => null },
    { path: '/pt/juntar-pdf/', lang: 'pt', seal: () => null },
    { path: '/mortgage-calculator/', lang: 'en', seal: () => null },
    { path: '/pt/simulador-sac-price/', lang: 'pt', seal: () => null },
    { path: '/es/calculadora-de-hipoteca/', lang: 'es', seal: () => null },
    { path: '/money-calculators/', lang: 'en', seal: (lang) => COMMON[lang].calcSeal ?? null },
    { path: '/qr-code-generator/', lang: 'en', seal: () => null },
    { path: '/pt/gerador-de-qr-code/', lang: 'pt', seal: () => null },
  ];
  for (const { path, lang, seal } of PAGES) {
    test(`${path}: the seal of the page, then the Privacy link`, async ({ page }) => {
      await open(page, path);
      // The page's own seal is the PrivacySeal under the H1; a page without one (home, hubs) says the seal of the files,
      // or of the numbers on the money hub.
      const own = (await page.locator('.fo-seal').count()) ? (await page.locator('.fo-seal').first().innerText()).trim() : seal(lang);
      expect(own, `${path}: a seal to repeat`).toBeTruthy();
      const text = (await page.locator('#fo-cookie-text').innerText()).replace(/\s+/g, ' ').trim();
      expect(text).toContain(`${own!}.`);
      expect(text.startsWith(`${COMMON[lang].cookie.title} ${COMMON[lang].cookie.body}`), text).toBe(true);
      expect(text.endsWith(COMMON[lang].cookie.privacyLink)).toBe(true);
      // Before, the notice said the files never leave the device on every page, numbers and text included.
      if (/calcul|simulador|qr/.test(path)) expect(text).not.toContain(COMMON[lang].seal);
    });
  }
});

test.describe('the error of the DropZone: its way out is never under the notice', () => {
  const bytes = readFileSync('fixtures/images/gen-texto-extensao-png.png');
  const SIZES = [
    { width: 360, height: 740 },
    { width: 320, height: 640 },
  ];
  const PAGES: { path: string; lang: Lang }[] = [
    { path: '/compress-image/', lang: 'en' },
    { path: '/pt/comprimir-imagem/', lang: 'pt' },
    { path: '/es/comprimir-imagen/', lang: 'es' },
    { path: '/heic-to-jpg/', lang: 'en' },
    { path: '/pt/heic-para-jpg/', lang: 'pt' },
    { path: '/es/heic-a-jpg/', lang: 'es' },
  ];
  for (const size of SIZES) {
    for (const { path, lang } of PAGES) {
      test(`${size.width} × ${size.height} ${path}: the focused "Choose other files" ends 8px or more above the notice`, async ({ page }) => {
        await page.setViewportSize(size);
        await open(page, path);
        await hydrated(page);
        // The person taps the Choose button, so the focus is on it when the file comes back as an error (the same
        // <button> turns into "Choose other files": the focus never moves, and only keep() can lift it).
        await page.locator('.fo-drop .fo-btn--brand').focus();
        await page.setInputFiles('input[type="file"]', { name: 'notes.png', mimeType: 'image/png', buffer: bytes });
        await expect(page.locator('.fo-drop[data-state="error"]')).toBeVisible();
        const label = IMAGE[lang].errors.chooseAnother;
        await expect(page.locator(':focus')).toHaveText(label);
        await expect
          .poll(async () => {
            const at = await page.evaluate(() => {
              const focused = document.activeElement!.getBoundingClientRect();
              return { bottom: focused.bottom, top: document.getElementById('fo-cookie')!.getBoundingClientRect().top };
            });
            return Math.round(at.top - at.bottom);
          }, { message: `${path}: the notice top less the bottom of "${label}"` })
          .toBeGreaterThanOrEqual(8);
      });
    }
  }
});

test.describe('at the end of a page at 1280px', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  for (const path of ['/', '/pt/', '/es/', '/compress-image/', '/pt/comprimir-imagem/', '/es/comprimir-imagen/']) {
    test(`${path}: the open card covers at most two links of the footer`, async ({ page }) => {
      await open(page, path);
      const covered = await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
        const notice = document.getElementById('fo-cookie')!.getBoundingClientRect();
        return [...document.querySelectorAll('footer a')].filter((link) => {
          const r = link.getBoundingClientRect();
          return r.width > 0 && r.right > notice.left && r.left < notice.right && r.bottom > notice.top && r.top < notice.bottom;
        }).length;
      });
      expect(covered, path).toBeLessThanOrEqual(2);
    });
  }
});

// The nine texts (three languages × the seals of files, numbers and text) stay two lines at 360 px and in the 360 px card of
// a computer, in Figtree and in the fallback a slow first visit keeps (the notice uses Figtree Steady, font-display optional),
// so the card is as tall with either font and the notice adds no layout shift when Figtree arrives (§ 305).
test.describe('two lines in Figtree and in its fallback', () => {
  const NINE = [
    '/compress-image/', '/pt/comprimir-imagem/', '/es/comprimir-imagen/',
    '/mortgage-calculator/', '/pt/simulador-sac-price/', '/es/calculadora-de-hipoteca/',
    '/qr-code-generator/', '/pt/gerador-de-qr-code/', '/es/generador-de-codigo-qr/',
  ];
  for (const path of NINE) {
    test(`${path}: the same height with either font, at 360 and at 1280 px`, async ({ browser }) => {
      const heights: Record<string, number> = {};
      for (const font of ['fallback', 'Figtree'] as const) {
        for (const viewport of [{ width: 360, height: 740 }, { width: 1280, height: 800 }]) {
          const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
          const page = await context.newPage();
          if (font === 'fallback') await page.route(/figtree[^/]*\.woff2$/, (route) => route.abort());
          const response = await page.goto(path);
          expect(response?.status(), path).toBe(200);
          // An optional face settles at the first paint: with Figtree in the cache, a second load paints with it.
          if (font === 'Figtree') {
            await page.evaluate(() => document.fonts.ready);
            await page.reload();
            expect(await page.evaluate(() => document.fonts.check('14px "Figtree Steady"')), `${path}: Figtree Steady in use`).toBe(true);
          }
          await expect(page.locator('#fo-cookie')).toBeVisible();
          heights[`${font} ${viewport.width}`] = Math.round((await page.locator('#fo-cookie').boundingBox())!.height);
          await context.close();
        }
      }
      for (const [at, height] of Object.entries(heights)) expect(height, `${path} ${at}`).toBeLessThanOrEqual(130);
      expect(heights['fallback 360'], `${path} at 360`).toBe(heights['Figtree 360']);
      expect(heights['fallback 1280'], `${path} at 1280`).toBe(heights['Figtree 1280']);
    });
  }
});

// F13b (group 22, F13a R-c-3; DECISOES § 582). At 320 × 640 on a first visit, the Choose button of the image presets went
// up to 25px under the notice (35px with the fallback font), and 1px in three PDF tools in Spanish. Under 360 px the
// trail of a preset leaves out its hub, so it takes two rows: with Figtree the Choose of every preset is now entirely
// above the notice. What is left, fixed here: 1px at most under it in those three PDF tools in Spanish, and in the
// presets of pt with the fallback font (the notice in three lines). The button stays clickable, and the page scrolls.
test.describe('first visit at 320 × 640: the Choose button of the presets', () => {
  // F18 (junction; DECISOES § 742 and § 743): Extract pages in Spanish is a PDF page with the layout of the three PDF tools
  // in Spanish below, measured at 320 × 640 in both browsers: the trail in two rows (54 px), the H1 in two lines, the PDF
  // island, and the Choose button ending at 484.59 px, where the Spanish notice (148 px, a line more than in en and pt)
  // starts at 484 px: 0.59 px under it, as /es/eliminar-paginas-pdf/. The name is the one of decision 4, and the drop zone
  // and the notice are the site's; so it has the 1px those three have since the F13b (§ 582), not a tolerance of its own.
  const EXTRACT_ES = routeById('split-pdf-extract-pages').paths.es ?? '(split-pdf-extract-pages sem página em es)';
  const PRESETS = [
    '/compress-image/to-100kb/', '/pt/comprimir-imagem/para-100kb/', '/es/comprimir-imagen/a-100kb/',
    '/compress-image/to-1mb/', '/pt/comprimir-imagem/para-1mb/', '/es/comprimir-imagen/a-1mb/',
    '/resize-image/youtube-thumbnail/', '/pt/redimensionar-imagem/miniatura-youtube/', '/es/redimensionar-imagen/miniatura-youtube/',
    // F18 (decision 19; DECISOES § 743): the presets of the run, with the trail of four steps that leaves out its hub under
    // 360 px (§ 582): the image one and the two PDF ones (the first of the site, with the same trail since the F18).
    ...(['rotate-image-flip', 'split-pdf-extract-pages', 'pdf-to-jpg-to-png'] as const).flatMap((id) => LANGS.map((lang) => routeById(id).paths[lang] ?? `(${id} sem página em ${lang})`)).filter((path) => path !== EXTRACT_ES),
  ];
  const LEFT = ['/es/eliminar-paginas-pdf/', '/es/numerar-paginas-pdf/', '/es/ordenar-paginas-pdf/', EXTRACT_ES];
  for (const font of ['Figtree', 'fallback'] as const) {
    for (const path of [...PRESETS, ...LEFT]) {
      test(`${font}: ${path}`, async ({ browser }) => {
        const context = await browser.newContext({ viewport: { width: 320, height: 640 }, serviceWorkers: 'block' });
        const page = await context.newPage();
        if (font === 'fallback') await page.route(/figtree[^/]*\.woff2$/, (route) => route.abort());
        expect((await page.goto(path))?.status(), path).toBe(200);
        // An optional face settles at the first paint: with Figtree in the cache, a second load paints with it.
        if (font === 'Figtree') {
          await page.evaluate(() => document.fonts.ready);
          await page.reload();
        }
        await expect(page.locator('#fo-cookie')).toBeVisible();
        const { notice, target } = await boxes(page, '.fo-drop .fo-btn--brand');
        expect(notice && target, path).toBeTruthy();
        const under = Math.max(0, (target?.bottom ?? 0) - (notice?.top ?? 0));
        const most = font === 'Figtree' && PRESETS.includes(path) ? 0 : 1;
        expect(under, `${path}: px of the Choose button under the notice`).toBeLessThanOrEqual(most);
        await context.close();
      });
    }
  }
});
