// F18 (decision 20, "O registro"; decision 11; DECISOES § 734): the next-step chips and the related grid of every page of
// the two registries, the image one and the PDF one, lead only to pages that exist in the three languages, within the limits
// of the design (2 to 4 chips, 1 to 6 related cards), and the pages build them whole: chipsFor and relatedFor of each side
// slice the lists at 4 and 6 and drop a page missing in the language, so a list over the limit, or with a page that is
// not there, would lose a card in silence. Then the lists of the five pages of the run and the places decision 11 gives
// them in the lists of their sisters. tests/unit/image-registry.test.ts keeps its own checks of the image side (F17).
import { describe, expect, it } from 'vitest';
import { LANGS, ROUTES, languagesOf, pathFor, type RouteId } from '../../src/i18n/routes.ts';
import { chipsFor as imageChips, relatedFor as imageRelated } from '../../src/tools/image/page.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../src/tools/image/registry.ts';
import { chipsFor as pdfChips, relatedFor as pdfRelated } from '../../src/tools/pdf/page.ts';
import { PDF_PAGES, type PdfPageId } from '../../src/tools/pdf/registry.ts';

interface Lists {
  id: string;
  next: readonly string[];
  related: readonly string[];
}

const IMAGE_IDS = Object.keys(IMAGE_PAGES) as ImagePageId[];
const PDF_IDS = Object.keys(PDF_PAGES) as PdfPageId[];
const ALL: Lists[] = [...IMAGE_IDS.map((id) => IMAGE_PAGES[id]), ...PDF_IDS.map((id) => PDF_PAGES[id])];

/** A page of one of the two registries (a tool or a preset, image or PDF). */
const isPage = (id: string): boolean => Object.hasOwn(IMAGE_PAGES, id) || Object.hasOwn(PDF_PAGES, id);
const inEveryLanguage = (id: string): boolean => {
  const route = ROUTES.find((candidate) => candidate.id === id);
  return route !== undefined && LANGS.every((lang) => languagesOf(route).includes(lang));
};

/** What is wrong with the chips and the related grid of one page (empty when nothing is). */
function listProblems(page: Lists): string[] {
  const problems: string[] = [];
  const check = (kind: 'chip' | 'related', list: readonly string[], least: number, most: number): void => {
    if (list.length < least || list.length > most) problems.push(`${page.id}: ${list.length} ${kind} (${least} to ${most})`);
    if (new Set(list).size !== list.length) problems.push(`${page.id}: a ${kind} twice`);
    for (const target of list) {
      if (target === page.id) problems.push(`${page.id}: ${kind} to itself`);
      if (!isPage(target)) problems.push(`${page.id}: ${kind} to ${target}, which is no page of the registries`);
      else if (!inEveryLanguage(target)) problems.push(`${page.id}: ${kind} to ${target}, missing in a language`);
    }
  };
  check('chip', page.next, 2, 4);
  check('related', page.related, 1, 6);
  return problems;
}

describe('the lists of the two registries (F18, decision 20)', () => {
  it('lead, from every image and PDF page, only to pages that exist in the three languages, within 2 to 4 chips and 6 related', () => {
    expect(ALL.length).toBe(IMAGE_IDS.length + PDF_IDS.length);
    for (const page of ALL) {
      expect(inEveryLanguage(page.id), page.id).toBe(true);
      expect(listProblems(page), page.id).toEqual([]);
    }
  });

  it('are built whole on each page of each language: no slice and no missing page drops a chip or a card', () => {
    for (const lang of LANGS) {
      for (const id of IMAGE_IDS) {
        expect(imageChips(id, lang).map((chip) => chip.target), `${id} ${lang}`).toEqual([...IMAGE_PAGES[id].next]);
        expect(imageRelated(id, lang).map((card) => card.href), `${id} ${lang}`).toEqual(IMAGE_PAGES[id].related.map((target) => pathFor(target, lang)));
      }
      for (const id of PDF_IDS) {
        expect(pdfChips(id, lang).map((chip) => chip.target), `${id} ${lang}`).toEqual([...PDF_PAGES[id].next]);
        expect(pdfRelated(id, lang).map((card) => card.href), `${id} ${lang}`).toEqual(PDF_PAGES[id].related.map((target) => pathFor(target as RouteId, lang)));
      }
    }
  });

  it('give the five pages of the run their own lists, with the parent first in the grid of a preset', () => {
    expect(IMAGE_PAGES['remove-exif-data'].next).toEqual(['compress-image', 'resize-image', 'image-to-pdf']);
    expect(IMAGE_PAGES['remove-exif-data'].related).toEqual(['compress-image', 'resize-image', 'heic-to-jpg', 'crop-image', 'rotate-image', 'image-to-pdf']);
    expect(IMAGE_PAGES['rotate-image-flip'].next).toEqual(IMAGE_PAGES['rotate-image'].next);
    expect(IMAGE_PAGES['rotate-image-flip'].related[0]).toBe('rotate-image');
    expect(PDF_PAGES['organize-pdf'].next).toEqual(PDF_PAGES['reorder-pdf-pages'].next);
    expect(PDF_PAGES['organize-pdf'].related).toEqual(['reorder-pdf-pages', 'delete-pdf-pages', 'rotate-pdf', 'merge-pdf', 'split-pdf', 'split-pdf-extract-pages']);
    expect(PDF_PAGES['split-pdf-extract-pages'].next).toEqual(PDF_PAGES['split-pdf'].next);
    expect(PDF_PAGES['split-pdf-extract-pages'].related[0]).toBe('split-pdf');
    expect(PDF_PAGES['pdf-to-jpg-to-png'].next).toEqual(PDF_PAGES['pdf-to-jpg'].next);
    expect(PDF_PAGES['pdf-to-jpg-to-png'].related[0]).toBe('pdf-to-jpg');
  });

  it('put each new page in the grid of the sisters of decision 11, and lead Merge PDF to Organize PDF and Unlock PDF to Extract pages', () => {
    const sisters: [string, string[]][] = [
      ['organize-pdf', ['reorder-pdf-pages', 'delete-pdf-pages', 'rotate-pdf', 'merge-pdf']],
      ['split-pdf-extract-pages', ['split-pdf', 'delete-pdf-pages']],
      ['pdf-to-jpg-to-png', ['pdf-to-jpg']],
      ['rotate-image-flip', ['rotate-image', 'crop-image']],
      ['remove-exif-data', ['compress-image', 'resize-image', 'heic-to-jpg']],
    ];
    const relatedOf = (id: string): readonly string[] => (Object.hasOwn(IMAGE_PAGES, id) ? IMAGE_PAGES[id as ImagePageId].related : PDF_PAGES[id as PdfPageId].related);
    for (const [page, holders] of sisters) for (const holder of holders) expect(relatedOf(holder), `${page} in the grid of ${holder}`).toContain(page);
    // The chips that make Organize PDF and Extract pages destinations that wait for their action (§ 654).
    expect(PDF_PAGES['merge-pdf'].next).toContain('organize-pdf');
    expect(PDF_PAGES['unlock-pdf'].next).toContain('split-pdf-extract-pages');
  });

  it('catch a list over the limit, a page missing in a language, a page that is none, a repeat and a page to itself (control)', () => {
    const base = PDF_PAGES['organize-pdf'];
    expect(listProblems({ ...base, related: [...base.related, 'compress-pdf'] })).toEqual(['organize-pdf: 7 related (1 to 6)']);
    expect(listProblems({ ...base, next: ['compress-pdf'] })).toEqual(['organize-pdf: 1 chip (2 to 4)']);
    expect(listProblems({ ...base, next: ['compress-pdf', 'merge-pdf', 'split-pdf', 'sign-pdf', 'protect-pdf'] })).toEqual(['organize-pdf: 5 chip (2 to 4)']);
    // An English-only page (home and health, F7) is a route, not a page of the registries; a calculator is neither.
    expect(listProblems({ ...base, related: ['bmi-calculator'] })).toEqual(['organize-pdf: related to bmi-calculator, which is no page of the registries']);
    expect(listProblems({ ...base, next: ['compress-pdf', 'no-such-page'] })).toEqual(['organize-pdf: chip to no-such-page, which is no page of the registries']);
    expect(listProblems({ ...base, related: ['merge-pdf', 'merge-pdf'] })).toEqual(['organize-pdf: a related twice']);
    expect(listProblems({ ...base, related: ['organize-pdf'] })).toEqual(['organize-pdf: related to itself']);
    expect(inEveryLanguage('bmi-calculator')).toBe(false);
    expect(inEveryLanguage('rotate-image-flip')).toBe(true);
  });
});
