// The 150 px between every AdSlot and the header, the PDF tools and the file guides (ad-clearance, PLANO "Molde da página de
// ferramenta"), on the test build. Review F13b c-3 (DECISOES § 592): these tests were the end of ads.spec.ts, as they are;
// the name puts them after calc-labels.spec.ts, in a lighter part of the CI than the first (the a11y and ads of before), and
// the helpers they share with ads.spec.ts are in tests/e2e/lib/ad-clearance.ts.
import { expect, test, type Page } from '@playwright/test';
import { CALC_PAGES, CALC_PAGE_IDS, guidePathIn, moneyPage } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID } from '../../src/tools/pdf/registry.ts';
import { LANGS, ROUTES, routeById } from '../../src/i18n/routes.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS, type FileGuideId } from '../../src/tools/guides/registry.ts';
import { chooseImages, dismissCookies, hydrated } from './lib/page.ts';
import { PDF_WALKS, walkPdfTool, type PdfState } from './lib/pdf-states.ts';
import { useTestBuild } from './lib/test-build.ts';
import { HUB_TARGETS, RAIL, TARGETS, TRANSLATED, VIEWPORTS, boxes, expectAdsOutsideThePanel, expectClearance, isPdfTool, openOnScreen, smallFiles } from './lib/ad-clearance.ts';

// F12, Mudança 10 (DECISOES § 413 and § 418): with no unit id there is no ad box, so every distance is measured on the test
// build (fake ids in the 37 units of the map, the worst case).
useTestBuild(test);

// F11 (decision 10 and criterion 8; DECISOES § 388 and § 391): the header. Every control of it (logo, search, language,
// theme, Menu) is 150 px or more from every AdSlot, and every open menu (the Menu sheet and the language menu) from every
// AdSlot but the rail's, at 360, 767 and 1280 px, on every page that has AdSlots (the route map: each route with an ad
// area, in each of its languages), in blocks of pages. On the phone the sheet opens at the top of the page and the first
// AdSlot of each mold sits under it (the nearest, Merge PDF and Unlock PDF in English, at y 796).
// Header width adjustment (DECISOES § 409): from 1280 px the header runs over the rail, as the footer does, and the rail
// starts 150 px under the header, so every control stays 150 px or more from its AdSlot. An open menu covers the top of
// the rail: it keeps the 150 px from every other AdSlot, and while it is open the rail takes no pointer (the click that
// closes it lands on the body; review F11 B-2), which the test checks under the open menu, against a control with the
// menus closed.
// Review F11 D-1 (DECISOES § 404): 767 px too. Under 768 px the sheet keeps its height at every width, while the first
// AdSlot rises as the text of the page wraps less (Merge PDF and Unlock PDF in English: y 796 up to 384 px, y 776 from
// 390 px), so 767 px is where the open sheet and the first AdSlot of the phone layout come closest.
const HEADER_CONTROLS = '.fo-header > a, .fo-header > button';
const HEADER_AD_PAGES = ROUTES.filter((route) => route.adArea).flatMap((route) => LANGS.flatMap((lang) => route.paths[lang] ?? []));
const HEADER_AD_BLOCK = 15;
const HEADER_VIEWPORTS = [VIEWPORTS[0], { width: 767, height: 800 }, VIEWPORTS[1]] as const;
/** Whether a click on the AdSlot of the rail reaches it (no rail on screen: no), in its middle, 20 px under its top or
 * under the open menu, whichever is lower: a point under the open sheet would hit the sheet and prove nothing (review of
 * § 409, b-1). With no such point on screen, the test fails rather than pass by default. */
const railTakesPointer = (page: Page) => page.evaluate(() => {
  const ad = document.querySelector('.fo-ad--rail');
  const rect = ad?.getBoundingClientRect();
  if (!ad || !rect || rect.width === 0) return false;
  const menus = [...document.querySelectorAll('#fo-menu, #fo-langmenu')].filter((menu) => menu.matches(':popover-open')).map((menu) => menu.getBoundingClientRect().bottom);
  const y = Math.max(rect.top, ...menus) + 20;
  if (y > Math.min(rect.bottom, innerHeight)) throw new Error(`no point of the rail under the open menu on screen (y ${y})`);
  return ad.contains(document.elementFromPoint(rect.left + rect.width / 2, y));
});
test.describe('the header stays 150px from every AdSlot and its open menus from every one but the rail, which takes no pointer, at 360, 767 and 1280px', () => {
  for (let start = 0; start < HEADER_AD_PAGES.length; start += HEADER_AD_BLOCK) {
    const block = HEADER_AD_PAGES.slice(start, start + HEADER_AD_BLOCK);
    test(`pages ${start + 1} to ${start + block.length} of ${HEADER_AD_PAGES.length} (${block[0]} and on)`, async ({ page }) => {
      // 15 pages, each opened and measured at three widths with the menus opened and closed: a budget of its own, as the
      // long tests of the calculators have, so a loaded runner does not end it at the default 60 s (review F11 D-2).
      test.setTimeout(120_000);
      for (const path of block) {
        expect((await page.goto(path))?.status(), path).toBe(200);
        for (const viewport of HEADER_VIEWPORTS) {
          await page.setViewportSize(viewport);
          await page.evaluate(() => scrollTo(0, 0));
          const label = `${path} ${viewport.width}px`;
          await expectClearance(page, `${label}, o cabeçalho`, HEADER_CONTROLS);
          // The rail is on screen from 1280 px, and with the menus closed a click reaches it (polled: the sheet that holds
          // the page after a menu closes stays 400 ms).
          const rail = viewport.width >= 1280 && (await page.locator('.fo-ad--rail').count()) > 0;
          await expect.poll(() => railTakesPointer(page), `${label}: a lateral recebe o clique com os menus fechados`).toBe(rail);
          await page.locator('.fo-header__menu').click();
          await expect(page.locator('#fo-menu')).toBeVisible();
          await expectClearance(page, `${label}, o Menu aberto`, `#fo-menu, ${HEADER_CONTROLS}`, '.fo-ad:not(.fo-ad--rail)');
          expect(await railTakesPointer(page), `${label}: a lateral recebe o clique com o Menu aberto`).toBe(false);
          await page.keyboard.press('Escape');
          await expect(page.locator('#fo-menu')).toBeHidden();
          // The language menu has its button from 768 px; under it, the languages are in the Menu, measured above.
          if (viewport.width >= 768) {
            await page.locator('.fo-header__lang').click();
            await expect(page.locator('#fo-langmenu')).toBeVisible();
            await expectClearance(page, `${label}, o menu de idioma aberto`, `#fo-langmenu, ${HEADER_CONTROLS}`, '.fo-ad:not(.fo-ad--rail)');
            expect(await railTakesPointer(page), `${label}: a lateral recebe o clique com o menu de idioma aberto`).toBe(false);
            await page.keyboard.press('Escape');
            await expect(page.locator('#fo-langmenu')).toBeHidden();
          }
        }
      }
    });
  }
});

// panel is the WaterLevel), with the options and the page grid open, the Merge list, the password field or the signature
// area, and with the result. Measured on top of TARGETS: the page grid with its cells and bar, the password field with its
// toggle and error, the signature area (pad, file field, preview of the page, box and notice), the Merge list with its
// move buttons, the ready card and the stack of options. No AdSlot above the tool on a phone, none inside the island or
// added or removed by a state, and 150px from every target in every state.
const PDF_TARGETS = [
  TARGETS,
  '.fo-pdf-island', '.fo-ready', '.fo-options-stack', '.fo-fields--stack',
  '.fo-pages', '.fo-pages__bar', '.fo-pages__count', '.fo-pages__grid', '.fo-page', '.fo-page__main', '.fo-page__moves',
  '.fo-pass', '.fo-pass__toggle', '.fo-field__error',
  '.fo-sign', '.fo-sign__pad', '.fo-sign__file', '.fo-sign__place', '.fo-sign__page', '.fo-sign__box',
  '.fo-merge', '.fo-merge__moves',
  // F13a (UX-04 A and UX-11 A; DECISOES § 488): the Merge list in the rectangle (its Undo, its remove buttons and its
  // "Add more PDFs"), the band under the rectangle with the "Order" and the "Adjust" of the result, and the note.
  '.fo-merge-panel', '.fo-merge__undo', '.fo-merge__remove', '.fo-merge__add', '.fo-band', '.fo-merge__order', '.fo-adjust', '.fo-note',
  // F14 (decision 14; DECISOES § 634): the magnifier of each cell, "View the new PDF", "View pages of {name}" and the page
  // view with every control of it (TARGETS has them too; the open view is measured by ads.spec.ts).
  '.fo-page__zoom', '.fo-result__view', '.fo-merge__view', '.fo-pview', '.fo-pview .fo-btn', '.fo-pview__frame', '.fo-pview__frame:not([data-zoom]) .fo-pview__img',
].join(', ');
// What a state must put on screen besides the card, so the clearance is measured against it and not against its absence.
const PDF_ON_SCREEN: Record<PdfState, string[]> = {
  rest: ['.fo-drop'],
  processing: ['.fo-level'],
  ready: ['.fo-ready'],
  list: ['.fo-merge-panel', '.fo-merge', '.fo-merge__move', '.fo-merge__remove', '.fo-merge__add'],
  removed: ['.fo-merge-panel', '.fo-merge__undo'],
  grid: ['.fo-pages', '.fo-pages__grid', '.fo-page', '.fo-page[data-selected="true"], .fo-page__moves, .fo-page__badge'],
  password: ['.fo-pass', '.fo-pass__toggle', '.fo-pass .fo-field__error'],
  // F13a (UX-11 A, F-10): the honest line of Sign PDF is the note of the design system.
  signature: ['.fo-sign', '.fo-sign__place', '.fo-sign__page', '.fo-sign .fo-note'],
  result: ['.fo-result', '.fo-btn--download'],
};

// F6: the same walk on the Portuguese and Spanish pages, with the labels of the language.
const PDF_WALKS_ALL = [...PDF_WALKS.map((walk) => ({ ...walk, lang: 'en' as const })), ...TRANSLATED.flatMap((lang) => PDF_WALKS.map(({ id }) => ({ id, path: routeById(id).paths[lang] ?? '', lang })))];

test.describe('distância dos anúncios nas ferramentas de PDF, a 360×740 e a 1280×800', () => {
  for (const { id, path, lang } of PDF_WALKS_ALL) {
    test(`${path}: at rest, while reading, with the options and the result`, async ({ page }) => {
      const gaps: string[] = [];
      let adCount = 0;
      let flip = false;
      await page.setViewportSize(VIEWPORTS[0]);
      await walkPdfTool(
        page,
        id,
        async (state, note) => {
          if (state === 'rest') {
            adCount = await page.locator('.fo-ad').count();
            expect(adCount, 'AdSlots da página').toBeGreaterThan(0);
          }
          const smallest: string[] = [];
          // The order alternates, so the window is resized once per state.
          for (const viewport of flip ? [...VIEWPORTS].reverse() : VIEWPORTS) {
            await page.setViewportSize(viewport);
            await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
            const label = `${state} (${note}) a ${viewport.width}px`;
            const tool = (await boxes(page, '#fo-tool-root'))[0];
            expect(tool, `${label}: a ferramenta na tela`).toBeDefined();
            // No content AdSlot above the tool, on a phone or a computer, in any state.
            for (const ad of await boxes(page, '.fo-ad--content')) expect(ad.y, `${label}: AdSlot acima da ferramenta`).toBeGreaterThan((tool?.y ?? 0) + (tool?.h ?? 0));
            if (viewport.width >= 1280) await expect(page.locator(RAIL)).toBeVisible();
            for (const selector of PDF_ON_SCREEN[state]) expect((await boxes(page, selector)).length, `${label}: ${selector} na tela`).toBeGreaterThan(0);
            await expectAdsOutsideThePanel(page, label, adCount);
            smallest.push(`${viewport.width}px ${(await expectClearance(page, label, PDF_TARGETS)).toFixed(0)}`);
          }
          flip = !flip;
          gaps.push(`${state}: ${smallest.join(', ')}`);
        },
        { hold: true, lang },
      );
      console.log(`${path} menor vão: ${gaps.join(' | ')}`);
    });
  }
});

// The PDF hub, like the image and the money hubs: one content AdSlot under the grid of tools (never above them on a
// phone), the rail from 1280px, and 150px from the grid and from every Oli on screen.
// F12 (decision 3; DECISOES § 423): the first content AdSlot right after the grid, every one on screen under it.
test('the PDF hub keeps its first content AdSlot right after the grid of tools and every one under it, at 360 and 1280px', async ({ page }) => {
  // F6: in the three languages.
  for (const path of (['en', ...TRANSLATED] as const).map((lang) => routeById(PDF_HUB_ID).paths[lang] ?? '')) {
    expect((await page.goto(path))?.status(), path).toBe(200);
    await expect(page.locator('main > section:has(.fo-grid) + .fo-ad--content[data-ad-unit="conteudo"]')).toHaveCount(1);
    await expect(page.locator(RAIL)).toHaveCount(1);
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      const grid = await page.locator('main .fo-grid').boundingBox();
      const ads = await boxes(page, '.fo-ad--content');
      expect(grid && ads.length > 0, `${path} ${viewport.width}px: a grade e o AdSlot na tela`).toBeTruthy();
      for (const ad of ads) expect(ad.y, `${path} ${viewport.width}px: AdSlot acima da grade`).toBeGreaterThanOrEqual(grid!.y + grid!.height);
      await expectClearance(page, `${path} a ${viewport.width}px`, HUB_TARGETS);
    }
  }
});

// F5b (prompt decision 7): every file guide, at 360x740 and 1280x800 on one load, with the embedded tool at rest and with
// a result. The guide is the tool page's island with text around it, so the targets are the tool's own (TARGETS, and the
// PDF ones for a PDF guide). No AdSlot above the tool on a phone or a computer, none inside the island, and 150px from
// every target. A PDF guide walks the tool through the same states as its own page (tests/e2e/lib/pdf-states.ts).
const GUIDE_ON_SCREEN: Partial<Record<FileGuideId, string[]>> = {
  'guides-heic-to-jpg-on-windows': ['.fo-ba'],
  'guides-open-webp-save-as-jpg': ['.fo-ba'],
  'guides-social-media-image-sizes': ['#rz-width', '#rz-height', '.fo-input'],
  // The location guide starts Resize image at By percentage, 100 (DECISOES § 186).
  'guides-remove-location-from-photos': ['#rz-percent', '.fo-input'],
};

async function guideSpots(page: Page, label: string, adCount: number, selector: string): Promise<number> {
  let min = Infinity;
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
    const at = `${label} a ${viewport.width}px`;
    const tool = (await boxes(page, '#fo-tool-root'))[0];
    expect(tool, `${at}: a ferramenta na tela`).toBeDefined();
    for (const ad of await boxes(page, '.fo-ad--content')) expect(ad.y, `${at}: AdSlot acima da ferramenta`).toBeGreaterThan((tool?.y ?? 0) + (tool?.h ?? 0));
    if (viewport.width >= 1280) await expect(page.locator(RAIL)).toBeVisible();
    await expectAdsOutsideThePanel(page, at, adCount);
    min = Math.min(min, await expectClearance(page, at, selector));
  }
  return min;
}

// Languages adjustment (decision 5): the 30 guides, each at its path in its language (FILE_GUIDES[id].paths), with the tool
// of the language: the PDF walk reads the labels of the language, and the small file of an image tool is the one of its
// English page (SMALL_OF is keyed by the English path).
test.describe('distância dos anúncios nos guias de arquivo, a 360×740 e a 1280×800', () => {
  for (const lang of LANGS) {
    for (const id of FILE_GUIDE_IDS) {
      const guide = FILE_GUIDES[id];
      const path = guide.paths[lang];
      test(`${path}: with the tool at rest and with a result`, async ({ page }) => {
        await page.setViewportSize(VIEWPORTS[0]);
        const gaps: string[] = [];
        if (isPdfTool(guide.tool)) {
          let adCount = 0;
          await walkPdfTool(
            page,
            guide.tool,
            async (state, note) => {
              if (state === 'rest') adCount = await page.locator('.fo-ad').count();
              gaps.push(`${state}: ${(await guideSpots(page, `${state} (${note})`, adCount, PDF_TARGETS)).toFixed(0)}`);
            },
            { hold: false, path, lang },
          );
          expect(gaps.some((gap) => gap.startsWith('result')), 'o passeio chegou ao resultado').toBe(true);
        } else {
          expect((await page.goto(path))?.status()).toBe(200);
          await hydrated(page);
          await dismissCookies(page);
          const adCount = await page.locator('.fo-ad').count();
          expect(adCount).toBeGreaterThan(0);
          gaps.push(`repouso: ${(await guideSpots(page, 'repouso', adCount, TARGETS)).toFixed(0)}`);
          const toolPath = routeById(guide.tool).paths.en ?? '/';
          await chooseImages(page, await smallFiles(page, toolPath, 1));
          await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
          await openOnScreen(page);
          for (const selector of GUIDE_ON_SCREEN[id] ?? []) expect((await boxes(page, selector)).length, `${selector} na tela com o resultado`).toBeGreaterThan(0);
          gaps.push(`resultado: ${(await guideSpots(page, 'resultado', adCount, TARGETS)).toFixed(0)}`);
        }
        console.log(`${path} menor vão: ${gaps.join(' | ')}`);
      });
    }
  }
});

// The link from a tool to its guide sits outside the panel and 150px from both AdSlots (prompt decision 6). Languages
// adjustment: the tool pages of pt and es link to the guides of their language too, one test per language. F11 (decision 7;
// DECISOES § 396 and § 400): the link is the GuideCard (--here) at the end of the "How to" block, and the calculators that a
// guide embeds have it too (en and es), so the card is the target, on the tools and on those calculators.
for (const lang of LANGS) {
  const title = 'the guide card of each tool and calculator a guide embeds stays 150px from every AdSlot, at 360 and 1280px';
  test(lang === 'en' ? title : `${title} (${lang})`, async ({ page }) => {
    const tools = [...new Set(FILE_GUIDE_IDS.map((id) => FILE_GUIDES[id].tool))].map((tool) => routeById(tool).paths[lang] ?? '/');
    const calcs = CALC_PAGE_IDS.flatMap((id) => {
      const guide = CALC_PAGES[id].guide;
      const page = moneyPage(id, lang);
      return guide && page && guidePathIn(guide, lang) !== null ? [page.path] : [];
    });
    expect(calcs.length, `${lang}: as calculadoras com guia`).toBe(lang === 'pt' ? 0 : 6);
    for (const path of [...tools, ...calcs]) {
      expect((await page.goto(path))?.status(), path).toBe(200);
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await expect(page.locator('section[data-content="how"] .fo-guidecard').first(), `${path}: o cartão do guia`).toBeVisible();
        expect(await page.locator('#fo-tool-root .fo-guidecard').count(), `${path}: o cartão dentro do painel`).toBe(0);
        await expectClearance(page, `${path} a ${viewport.width}px`, '.fo-guidecard');
      }
    }
  });
}