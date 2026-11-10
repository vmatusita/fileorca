// The registry of the image tools (src/tools/image/registry.ts) holds the lists every page reads: the chips under a
// result (next), the related grid (related) and the converter a refused format is sent to (CONVERTER_FOR). F17
// (decision 14; DECISOES § 707 and § 716): with AVIF to JPG and Convert to WebP back, each list leads only to a tool that
// exists in the three languages, the two tools are back in the lists the F2 had them in (3812f49 took them out), and
// CONVERTER_FOR sends each refused format to a tool that takes it.
import { describe, expect, it } from 'vitest';
import type { ImageFormat } from '../../src/engine/image/types.ts';
import { LANGS, languagesOf, routeById } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { chipsFor, panelData } from '../../src/tools/image/page.ts';
import { CONVERTER_FOR, IMAGE_PAGES, IMAGE_TOOL_IDS, type ImagePageDef, type ImagePageId, type ImageToolId } from '../../src/tools/image/registry.ts';
import { IMAGE_PANEL_TEXTS } from '../../src/tools/image/texts.ts';
import { PDF_PAGES } from '../../src/tools/pdf/registry.ts';

const PAGES = Object.keys(IMAGE_PAGES) as ImagePageId[];
const NEW_TOOLS = ['avif-to-jpg', 'convert-to-webp'] as const;

const inEveryLanguage = (id: Parameters<typeof routeById>[0]): boolean => {
  const langs = languagesOf(routeById(id));
  return LANGS.every((lang) => langs.includes(lang));
};
const isImageTool = (id: string): id is ImageToolId => (IMAGE_TOOL_IDS as readonly string[]).includes(id);

/** What is wrong with the next and related lists of one page (empty when nothing is). */
function listProblems(def: ImagePageDef): string[] {
  const problems: string[] = [];
  if (def.next.length < 2 || def.next.length > 4) problems.push(`${def.id}: ${def.next.length} chips (2 to 4)`);
  if (new Set(def.next).size !== def.next.length) problems.push(`${def.id}: a chip twice`);
  for (const target of def.next) {
    if (target === def.id) problems.push(`${def.id}: a chip to itself`);
    if (!isImageTool(target) && !(target in PDF_PAGES)) problems.push(`${def.id}: chip to ${target}, which is no tool`);
    else if (!inEveryLanguage(target)) problems.push(`${def.id}: chip to ${target}, missing in a language`);
  }
  if (def.related.length < 1 || def.related.length > 6) problems.push(`${def.id}: ${def.related.length} related (1 to 6)`);
  if (new Set(def.related).size !== def.related.length) problems.push(`${def.id}: a related card twice`);
  for (const target of def.related) {
    if (target === def.id) problems.push(`${def.id}: related to itself`);
    if (!isImageTool(target)) problems.push(`${def.id}: related ${target}, which is no image tool`);
    else if (!inEveryLanguage(target)) problems.push(`${def.id}: related ${target}, missing in a language`);
  }
  return problems;
}

describe('the lists of the image registry (F17)', () => {
  it('lead, from every image page, the two new tools and their sisters included, only to tools that exist in the three languages', () => {
    for (const id of NEW_TOOLS) expect(PAGES, id).toContain(id);
    for (const id of PAGES) {
      expect(inEveryLanguage(id), id).toBe(true);
      expect(listProblems(IMAGE_PAGES[id]), id).toEqual([]);
    }
  });

  it('catch a list that leads nowhere (control)', () => {
    const base = IMAGE_PAGES['avif-to-jpg'];
    expect(listProblems({ ...base, next: ['compress-image'] })).toEqual(['avif-to-jpg: 1 chips (2 to 4)']);
    expect(listProblems({ ...base, related: [...base.related.slice(0, 5), 'avif-to-jpg'] })).toEqual(['avif-to-jpg: related to itself']);
    expect(listProblems({ ...base, related: ['compress-image-to-1mb' as ImageToolId] })).toEqual(['avif-to-jpg: related compress-image-to-1mb, which is no image tool']);
    expect(listProblems({ ...base, next: ['compress-image', 'no-such-tool' as ImageToolId] })).toEqual(['avif-to-jpg: chip to no-such-tool, which is no tool']);
  });

  it('send AVIF to JPG to the tools that open its JPG, and Convert to WebP to the ones that open its WebP, never to one that takes an AVIF', () => {
    expect(IMAGE_PAGES['avif-to-jpg'].next).toEqual(['compress-image', 'resize-image', 'image-to-pdf']);
    expect(IMAGE_PAGES['convert-to-webp'].next).toEqual(['resize-image', 'compress-image']);
    for (const target of IMAGE_PAGES['avif-to-jpg'].next) expect(IMAGE_PAGES[target as ImageToolId].accepts, target).toContain('jpeg');
    for (const target of IMAGE_PAGES['convert-to-webp'].next) {
      expect(IMAGE_PAGES[target as ImageToolId].accepts, target).toContain('webp');
      // An AVIF out of Convert to WebP is taken by no chip: it only opens the page (decision 5; § 497).
      expect(IMAGE_PAGES[target as ImageToolId].accepts, target).not.toContain('avif');
    }
  });

  it('bring Convert to WebP and AVIF to JPG back into the lists the F2 had them in (3812f49), and keep the PDF chips of Image to PDF (F15)', () => {
    // The chips: Convert to WebP after Compress image and its 1 MB preset, as the third chip.
    for (const id of ['compress-image', 'compress-image-to-1mb'] as const) expect(IMAGE_PAGES[id].next, id).toEqual(['resize-image', 'image-to-pdf', 'convert-to-webp']);
    // The related grids of the sisters.
    for (const id of ['compress-image', 'resize-image', 'webp-to-jpg', 'png-to-jpg', 'avif-to-jpg'] as const) expect(IMAGE_PAGES[id].related, id).toContain('convert-to-webp');
    for (const id of ['heic-to-jpg', 'webp-to-jpg', 'png-to-jpg', 'convert-to-webp'] as const) expect(IMAGE_PAGES[id].related, id).toContain('avif-to-jpg');
    // F15 (DECISOES § 653): after Image to PDF, the PDF tools, never an image one.
    expect(IMAGE_PAGES['image-to-pdf'].next).toEqual(['compress-pdf', 'merge-pdf', 'add-page-numbers-to-pdf']);
  });

  it('build the chips of the two tools and the chip to Convert to WebP with the label that takes the result along, in each language', () => {
    for (const lang of LANGS) {
      const labels = IMAGE_PANEL_TEXTS[lang].carry.chips;
      // Compress image takes a JPG or a PNG result to Convert to WebP, with the label of the language.
      const toWebp = chipsFor('compress-image', lang).find((chip) => chip.target === 'convert-to-webp');
      expect(toWebp?.href, lang).toBe(routeById('convert-to-webp').paths[lang]);
      expect(toWebp?.name, lang).toBe(TEXTS[lang].common.tools['convert-to-webp'].name);
      expect(toWebp?.carry, lang).toEqual({ accepts: ['jpeg', 'png'], single: false, ...labels['convert-to-webp'] });
      // The chips of the two tools lead to the pages of the language and take along what the target takes.
      for (const id of NEW_TOOLS) {
        const chips = chipsFor(id, lang);
        expect(chips.map((chip) => chip.target), `${id} ${lang}`).toEqual([...IMAGE_PAGES[id].next]);
        for (const chip of chips) {
          expect(chip.href, `${id} ${lang} ${chip.target}`).toBe(routeById(chip.target as ImageToolId).paths[lang]);
          expect(chip.carry?.accepts, `${id} ${lang} ${chip.target}`).toEqual([...IMAGE_PAGES[chip.target as ImageToolId].accepts]);
        }
      }
    }
  });
});

describe('CONVERTER_FOR (F17, decision 7)', () => {
  it('sends each refused format to a tool that takes it, in the three languages', () => {
    const entries = Object.entries(CONVERTER_FOR) as [ImageFormat, ImageToolId][];
    expect(entries.length).toBeGreaterThan(0);
    for (const [format, tool] of entries) {
      expect(IMAGE_PAGES[tool].accepts, `${format} → ${tool}`).toContain(format);
      expect(inEveryLanguage(tool), tool).toBe(true);
    }
  });

  it('has a converter for every format some tool takes and the general tools refuse: HEIC and, since the F17, AVIF', () => {
    const general = IMAGE_PAGES['compress-image'].accepts;
    const taken = [...new Set(PAGES.flatMap((id) => IMAGE_PAGES[id].accepts))];
    const refused = taken.filter((format) => !general.includes(format));
    expect(refused.sort()).toEqual(['avif', 'heic']);
    for (const format of refused) expect(CONVERTER_FOR[format], format).toBeDefined();
    expect(CONVERTER_FOR).toEqual({ heic: 'heic-to-jpg', avif: 'avif-to-jpg' });
  });

  it('gives every image page the link of the converter in the language of the page', () => {
    for (const lang of LANGS) {
      for (const id of PAGES) {
        const converters = panelData(id, lang).converters;
        for (const [format, tool] of Object.entries(CONVERTER_FOR) as [ImageFormat, ImageToolId][]) {
          expect(converters[format as 'heic' | 'avif'], `${id} ${lang} ${format}`).toEqual({ href: routeById(tool).paths[lang], name: TEXTS[lang].common.tools[tool].name });
        }
      }
    }
  });
});
