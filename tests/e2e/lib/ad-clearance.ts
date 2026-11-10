// The 150 px between every AdSlot and what a person uses (PLANO "Molde da página de ferramenta"; DECISOES § 19), shared by
// ads.spec.ts and clearance.spec.ts since the review F13b c-3 (DECISOES § 592): the targets, the boxes (the Oli inflated by
// 12 px), the measure and the small files of the result states. Moved here as they were in ads.spec.ts.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, type Page } from '@playwright/test';
import { ROUTES } from '../../../src/i18n/routes.ts';
import { PDF_PAGES, type PdfToolId } from '../../../src/tools/pdf/registry.ts';
import { jpegBatch, type TestFile } from './page.ts';

export const isPdfTool = (id: string): id is PdfToolId => Object.hasOwn(PDF_PAGES, id);

// 150px between every AdSlot and the Download button, each field, the panel and the Oli
// (PLANO "Molde da página de ferramenta"). Oli selector: [data-oli] (DECISOES § 19).
export const CLEARANCE = 150;
// F12 · o mapa de anúncios (DECISOES § 423): the rail has a 2nd unit, absolute 1,200 px under the 1st, on the pages of 600
// words or more; it starts hidden and only the push script of fileorca.com shows it, so the rail of these tests is the 1st.
export const RAIL = '.fo-ad--rail:not(.fo-ad--rail2)';
// F2: the panel (the slot and the island around it), the queue of files, the number fields (the inputs, their
// frames, labels and help lines), the comparison, the crop editor with its box and corner handles and the
// next-step chips are measured too.
// F13a (UX-04 A, decision 10; DECISOES § 473): the band under the rectangle, the "Adjust" disclosure, the chips (also
// the chip of PNG to JPG in the error of a PNG on HEIC to JPG) and the row of Start over and "Before and after".
export const TARGETS = [
  '.fo-btn--download', 'input:not([type="file"])', 'select', 'textarea', '.fo-seg', 'fieldset',
  '.fo-tool-island', '.fo-slot', '.fo-drop', '.fo-level', '.fo-result', '[data-oli]',
  '.fo-queue', '.fo-filelist', '.fo-file', '.fo-queue__more',
  '.fo-fields', '.fo-field', '.fo-input', '.fo-field__help',
  '.fo-ba', '.fo-crop', '.fo-crop__stage', '.fo-crop__box', '.fo-crop__handle', '.fo-next',
  '.fo-band', '.fo-adjust', '.fo-chip', '.fo-result__more',
  // F13a (UX-14, decision 10; DECISOES § 506): the line under the chips that take the result along (its room in the
  // hidden copy of the band counts, in the same place), the note of where the files came from and the empty box.
  '.fo-carry', '.fo-result__from', '.fo-drop[data-state="lost"]',
  // F13b (UX-13 A, decision 10; DECISOES § 565): the sheet "What we measured" of a file guide and the frame of its tables.
  '[data-content="facts"]', '.fo-guide__frame',
  // F13b (decision 10; DECISOES § 573): the sea of the home, and the sea and the water of the category hubs (their Oli is
  // [data-oli], above); since the ajuste-home-cards (§ 609), the category sections of the home and their cards, in the
  // place of its bands.
  '.fo-section--cat', '.fo-section--cat .fo-grid', '.fo-section--cat .fo-tool', '.fo-home-sea', '.fo-hubband__sea', '.fo-hubband__water',
  // F14 (decision 14; DECISOES § 634): the page view and every control of it (its bars, its buttons, the frame and the
  // pictures), the magnifier of a cell, "View the new PDF" and "View pages of {name}" (the size choice is a .fo-seg).
  // "Enlarged", the page is twice the column inside a frame that scrolls: its box passes the frame, and what is seen of it
  // is the frame (ads.spec.ts measures that part of the picture on its own).
  '.fo-pview', '.fo-pview__top', '.fo-pview .fo-btn', '.fo-pview__frame', '.fo-pview__frame:not([data-zoom]) :is(.fo-pview__sheet, .fo-pview__img, .fo-pview__under)', '.fo-pview__bar',
  '.fo-page__zoom', '.fo-result__view', '.fo-merge__view',
  // F15 (frente L; decision 12; DECISOES § 662): the rows of an image batch, the arrows of Image to PDF and their empty
  // places, the bin outside the card and the line a row leaves with its Undo.
  '.fo-filelist__row', '.fo-filelist__moves', '.fo-filelist__move', '.fo-filelist__none', '.fo-filelist__remove', '.fo-filelist__undo',
  // F15, frente Q (decision 12; DECISOES § 662): the error line of a field (the "Maximum size" of Compress image; the third
  // choice and the field itself are already .fo-seg, .fo-field, .fo-input and input).
  '.fo-field__error',
].join(', ');
/** F13b (DECISOES § 573): what of a category hub stays 150 px from every ad: the cards, the Oli and the sea of the band. */
export const HUB_TARGETS = '.fo-grid, .fo-tool, [data-oli], .fo-hubband__sea, .fo-hubband__water';

/**
 * F13a (UX-04 A): the comparison and the options open only when the person asks. The result states open both (what a
 * person can put on screen), so the 150px are measured against them and not against their absence.
 */
export async function openOnScreen(page: Page): Promise<void> {
  const compare = page.locator('.fo-result__more button[aria-controls="fo-compare"][aria-expanded="false"]');
  if (await compare.count()) {
    await compare.click();
    await expect(page.locator('#fo-compare .fo-ba')).toBeVisible();
  }
  const adjust = page.locator('details.fo-adjust:not([open]) > summary');
  if (await adjust.count()) {
    await adjust.click();
    await expect(page.locator('details.fo-adjust .fo-adjust__body')).toBeVisible();
  }
}

// F6 (decision 9): the Portuguese and Spanish pages, read from the route map, with the same states and the same targets as
// the English page (SMALL_OF and the ON_SCREEN of ads.spec.ts are read through the English path of each one).
export const TRANSLATED = ['pt', 'es'] as const;
export const ENGLISH_OF = new Map(ROUTES.flatMap((route) => TRANSLATED.flatMap((lang) => (route.paths[lang] ? [[route.paths[lang], route.paths.en ?? '']] : []))));
export const english = (path: string): string => ENGLISH_OF.get(path) ?? path;
export const VIEWPORTS = [
  { width: 360, height: 740 },
  { width: 1280, height: 800 },
] as const;
// The result states use small inputs (the clearance does not depend on the size of the photo): the 640 × 480 JPEG
// drawn in the page for the tools that take a JPG, and the smallest fixture of the format for the converters, which
// take one format each (a JPG would be refused and no result would show).
export const SMALL_OF: Record<string, { fixture: string; mimeType: string }> = {
  // Over 1 MB, so the preset has something to shrink and the comparison shows (the 128 KB JPEG already fits).
  '/compress-image/to-1mb/': { fixture: 'gen-png-transparente.png', mimeType: 'image/png' }, // 800 × 600, 1.1 MB
  '/heic-to-jpg/': { fixture: 'heic-08-iphone13pro-paisagem-hdr-ios17.heic', mimeType: 'image/heic' }, // 1512 × 850, 239 KB
  '/webp-to-jpg/': { fixture: 'gen-webp-exif-gps.webp', mimeType: 'image/webp' }, // 1600 × 1200, 262 KB
};

/** `count` small files this page accepts, with names of their own (a batch of two or more shows the queue). */
export async function smallFiles(page: Page, path: string, count: number): Promise<TestFile[]> {
  const own = SMALL_OF[english(path)];
  if (!own) return jpegBatch(page, count);
  const buffer = readFileSync(resolve('fixtures/images', own.fixture));
  const extension = own.fixture.split('.').pop() ?? '';
  return Array.from({ length: count }, (_, index) => ({ name: `photo-${index + 1}.${extension}`, mimeType: own.mimeType, buffer }));
}

export interface Box { kind: string; x: number; y: number; w: number; h: number }

// F13a, revisão a-2 (decision 4 of the run; DECISOES § 513): the box of the Oli counts inflated by 12 px on every
// side (x - 12, y - 12, w + 24, h + 24), the room of her moves (8 px and 6°), so the 150 px hold while she waves.
export const OLI_GROWTH = 12;

export async function boxes(page: Page, selector: string): Promise<Box[]> {
  return page.locator(selector).evaluateAll((nodes, grow) =>
    nodes
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const box = { kind: node.className || node.tagName, x: rect.left + scrollX, y: rect.top + scrollY, w: rect.width, h: rect.height };
        if (box.w <= 0 || box.h <= 0 || !node.matches('[data-oli]')) return box;
        return { ...box, x: box.x - grow, y: box.y - grow, w: box.w + 2 * grow, h: box.h + 2 * grow };
      })
      .filter((box) => box.w > 0 && box.h > 0),
  OLI_GROWTH);
}

export function distance(a: Box, b: Box): number {
  const dx = Math.max(0, b.x - (a.x + a.w), a.x - (b.x + b.w));
  const dy = Math.max(0, b.y - (a.y + a.h), a.y - (b.y + b.h));
  return Math.hypot(dx, dy);
}

export async function expectClearance(page: Page, label: string, selector = TARGETS, adSelector = '.fo-ad'): Promise<number> {
  const ads = await boxes(page, adSelector);
  const targets = await boxes(page, selector);
  expect(ads.length, `${label}: nenhum AdSlot visível`).toBeGreaterThan(0);
  expect(targets.length).toBeGreaterThan(0);
  let min = Infinity;
  for (const ad of ads) {
    for (const target of targets) {
      const gap = distance(ad, target);
      min = Math.min(min, gap);
      expect(gap, `${label}: AdSlot a ${gap.toFixed(0)}px de ${target.kind}`).toBeGreaterThanOrEqual(CLEARANCE);
    }
  }
  return min;
}

/** No AdSlot inside the tool island (the panel, the options, the queue, the chips) and none added or removed by a state. */
export async function expectAdsOutsideThePanel(page: Page, label: string, adCount: number): Promise<void> {
  expect(await page.locator('#fo-tool-root .fo-ad').count(), `${label}: AdSlot dentro do painel`).toBe(0);
  expect(await page.locator('.fo-ad').count(), `${label}: o número de AdSlots mudou`).toBe(adCount);
}
