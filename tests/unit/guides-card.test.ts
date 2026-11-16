import { existsSync, readFileSync } from 'node:fs';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { LANGS, type Lang } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { fmt, groupDigits } from '../../src/i18n/format.ts';
import { CALC_PAGES, GUIDES, GUIDE_IDS, guidePathIn } from '../../src/tools/calc/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS, GUIDES_HUB_ID, type FileGuideId } from '../../src/tools/guides/registry.ts';
import { fileProof, guideCardData, measuredFiles, measuredTexts } from '../../src/tools/guides/card.ts';
import { hubGuides } from '../../src/tools/guides/hub.ts';
import { toolInfo } from '../../src/tools/guides/page.ts';
import { routeById } from '../../src/i18n/routes.ts';
import { fileForPath } from '../../scripts/lib/dist.ts';
import measured from '../../data/guides-measured.json' with { type: 'json' };

// The guide card of the F11 (decision 6; DECISOES § 395): what it says of each guide, read from the registries and from
// data/guides-measured.json, and how the hub draws it in dist/ (run `pnpm build` first, as for guides-hub-route.test.ts).

/**
 * N by the specification (docs/propostas/ux-v2/guides-hub.html, "Os guias de cada idioma"), which counted the distinct test
 * files of each guide by hand in the F10: an oracle apart from the code that counts them.
 */
const SPEC_N: Record<FileGuideId, number> = {
  'guides-heic-to-jpg-on-windows': 10,
  'guides-why-is-my-pdf-so-large': 10,
  'guides-social-media-image-sizes': 3,
  'guides-open-webp-save-as-jpg': 5,
  'guides-jpg-vs-png': 4,
  'guides-remove-location-from-photos': 13,
  'guides-pdf-to-jpg-resolution': 5,
  'guides-split-pdf-file-size': 5,
  'guides-combine-pdfs-on-phone': 7,
  'guides-photos-to-one-pdf': 3,
  // F19b (front M1), counted from the plans of the run (docs/relatorios/fase-19b-plano.md, section 3): the three phone
  // photos; the photos and the PNG with transparent corners; three PDFs and the PNG uploaded as the signature; three PDFs
  // and the one locked by restrictions alone.
  'guides-compress-photo-for-online-form': 3,
  'guides-webp-vs-avif-vs-jpg': 4,
  'guides-sign-pdf-without-printing': 4,
  'guides-what-a-pdf-password-protects': 4,
  // F19b (front M5): the QR code guide measured no file, only texts (SPEC_TEXTS).
  'guides-qr-code-size': 0,
};
/**
 * F19b (DECISOES § 786 and § 796): the distinct test texts of a guide that measured texts instead of files (the QR code
 * guide; a sample of the kind 'texts'), counted by hand like SPEC_N; a guide absent here measured no text.
 */
const SPEC_TEXTS: Partial<Record<FileGuideId, number>> = {};
/** The hub of each guide's group on the guides hub, by hand (F19b: Utilities for the QR code guides). */
const GROUP_OF_HUB = { 'image-tools': 'image', 'pdf-tools': 'pdf', utilities: 'util' } as const;
type Sampled = { sample: { kind?: string; files?: string[]; texts?: string[] } };
/**
 * The same count by the shape of the JSON alone: the files (or, with `texts`, the texts) of the numbers and of the tables
 * of the guide, once each.
 */
const byShape = (id: FileGuideId, key: 'files' | 'texts' = 'files'): number => {
  const guide = (measured as unknown as { guides: Record<string, { numbers: Record<string, Sampled>; tables: Record<string, Sampled> }> }).guides[id];
  return new Set([...Object.values(guide?.numbers ?? {}), ...Object.values(guide?.tables ?? {})].flatMap((entry) => entry.sample[key] ?? [])).size;
};
const KIND: Record<Lang, string> = { en: 'Guide', pt: 'Guia', es: 'Guía' };
/** The measure a card shows, by the hand counts: "Measured on N test files", or N test texts for a guide of texts. */
const proofOf = (id: FileGuideId, lang: Lang): string => {
  const t = TEXTS[lang].guides.card;
  const texts = SPEC_TEXTS[id];
  return texts === undefined ? fmt(t.measured, { n: groupDigits(SPEC_N[id], lang) }) : fmt(t.measuredTexts, { n: groupDigits(texts, lang) });
};

const html = (path: string): HTMLElement => {
  const file = fileForPath(path);
  expect(existsSync(file), `${path} não existe no dist/: rode pnpm build antes do Vitest`).toBe(true);
  return parse(readFileSync(file, 'utf8'));
};

describe('the measure of a file guide: the distinct test files of all its samples', () => {
  it('counts the files of every guide as the specification did, and as the numbers and tables of the JSON give them', () => {
    for (const id of FILE_GUIDE_IDS) {
      const files = measuredFiles(id);
      expect(files.length, id).toBe(SPEC_N[id]);
      expect(new Set(files).size, `${id}: each file once`).toBe(files.length);
      expect(files.length, id).toBe(byShape(id));
      // F19b: and the texts of a guide that measured texts (none but the QR code guide).
      const texts = measuredTexts(id);
      expect(texts.length, `${id} texts`).toBe(SPEC_TEXTS[id] ?? 0);
      expect(texts.length, `${id} texts`).toBe(byShape(id, 'texts'));
    }
    // A file in two samples counts once (the location guide: three JPG and ten HEIC files across its numbers).
    expect(measuredFiles('guides-remove-location-from-photos')).toHaveLength(13);
  });

  it('reads any depth of the JSON, and counts a file twice never', () => {
    const fake = { guides: { 'guides-jpg-vs-png': { numbers: { a: { sample: { files: ['x.jpg', 'y.png'] } } }, tables: { b: { sample: { files: ['y.png'] } } }, deep: [{ more: { sample: { files: ['z.jpg'] } } }] } } };
    expect(measuredFiles('guides-jpg-vs-png', fake as never).sort()).toEqual(['x.jpg', 'y.png', 'z.jpg']);
  });

  // F19b (DECISOES § 786): a sample of texts is counted as texts, never as files, and the card says which it measured.
  it('counts the texts of a sample of texts apart from the files, and says "test texts" on the card of such a guide', () => {
    const texts = { guides: { 'guides-jpg-vs-png': { numbers: { a: { sample: { kind: 'texts', texts: ['short', 'long'], count: 2 } } }, tables: { b: { sample: { kind: 'texts', texts: ['long', 'café'], count: 2 } } } } } };
    expect(measuredTexts('guides-jpg-vs-png', texts as never).sort()).toEqual(['café', 'long', 'short']);
    expect(measuredFiles('guides-jpg-vs-png', texts as never)).toEqual([]);
    for (const lang of LANGS) {
      expect(fileProof('guides-jpg-vs-png', lang, texts as never), lang).toBe(fmt(TEXTS[lang].guides.card.measuredTexts, { n: groupDigits(3, lang) }));
    }
    expect(fileProof('guides-jpg-vs-png', 'en', texts as never)).toBe('Measured on 3 test texts');
    // A guide that measured both, or neither, has no single count to show: the build stops.
    const both = { guides: { 'guides-jpg-vs-png': { numbers: { a: { sample: { files: ['x.jpg'], count: 1 } }, b: { sample: { kind: 'texts', texts: ['t'], count: 1 } } }, tables: {} } } };
    expect(() => fileProof('guides-jpg-vs-png', 'en', both as never)).toThrow(/a sample of files and one of texts/);
    expect(() => fileProof('guides-jpg-vs-png', 'en', { guides: { 'guides-jpg-vs-png': { numbers: {}, tables: {} } } } as never)).toThrow(/no measured file/);
  });
});

describe('the data of each guide card, in each language of the guide', () => {
  it('has the blurb, the group, the measure in the digits of the language and the tool of each file guide', () => {
    for (const lang of LANGS) {
      for (const id of FILE_GUIDE_IDS) {
        const card = guideCardData(id, lang);
        const blurb = TEXTS[lang].common.fileGuides?.[id];
        expect([card.href, card.name, card.description], `${lang} ${id}`).toEqual([FILE_GUIDES[id].paths[lang], blurb?.name, blurb?.description]);
        expect(card.category, `${lang} ${id}`).toBe(GROUP_OF_HUB[FILE_GUIDES[id].hub]);
        expect(card.proof, `${lang} ${id}`).toBe(proofOf(id, lang));
        // The tool at the foot: the one the guide embeds, with its name, icon and the colour of its own category.
        const tool = toolInfo(FILE_GUIDES[id].tool, lang);
        expect(card.tool, `${lang} ${id}`).toEqual({ name: tool.name, icon: tool.icon, category: tool.category });
      }
    }
    // Image to PDF is a PDF tool inside a guide of the image group: a coral circle on a turquoise card.
    const photos = guideCardData('guides-photos-to-one-pdf');
    expect([photos.category, photos.tool.category]).toEqual(['image', 'pdf']);
  });

  it('says "Numbers worked out" of a money guide, with the calculator it embeds, and only where the guide exists', () => {
    for (const lang of LANGS) {
      for (const id of GUIDE_IDS) {
        if (guidePathIn(id, lang) === null) {
          expect(() => guideCardData(id, lang), `${lang} ${id}`).toThrow(/no page/);
          continue;
        }
        const card = guideCardData(id, lang);
        expect(card.href, `${lang} ${id}`).toBe(guidePathIn(id, lang));
        expect([card.category, card.proof], `${lang} ${id}`).toEqual(['money', TEXTS[lang].guides.card.workedOut]);
        const calc = GUIDES[id].calc;
        expect(card.tool, `${lang} ${id}`).toEqual({ name: TEXTS[lang].common.calcs[calc]?.name, icon: CALC_PAGES[calc].icon, category: 'money' });
      }
    }
    expect([TEXTS.en.guides.card.workedOut, TEXTS.es.guides.card.workedOut, TEXTS.pt.guides.card.workedOut]).toEqual(['Numbers worked out', 'Números calculados', undefined]);
  });

  it('opens with the kind of the language, and never writes a digit by hand in its texts', () => {
    for (const lang of LANGS) {
      const t = TEXTS[lang].guides.card;
      expect(t.kind, lang).toBe(KIND[lang]);
      expect(t.measured, lang).toContain('{n}');
      expect(t.measuredTexts, lang).toContain('{n}');
      for (const text of [t.kind, t.measured, t.measuredTexts, t.workedOut ?? '', t.tool]) expect(text, lang).not.toMatch(/\d/);
    }
  });
});

describe('the guide cards of the hub in dist/', () => {
  for (const lang of LANGS) {
    const path = routeById(GUIDES_HUB_ID).paths[lang] ?? '';
    it(`${path}: one card per guide, each one link that starts with "${KIND[lang]}", an H3 under the H2 of its group, the measure and the tool`, () => {
      const root = html(path);
      const cards = root.querySelectorAll('main a.fo-guidecard');
      const guides = hubGuides(lang);
      expect(cards.map((card) => card.getAttribute('href'))).toEqual(guides.map((guide) => guide.path));
      for (const [index, card] of cards.entries()) {
        const data = guideCardData(guides[index]?.id ?? 'guides-jpg-vs-png', lang);
        const where = `${lang} ${data.id}`;
        // One link, no tool card class, the fold in the colour of the group.
        expect(card.querySelectorAll('a'), where).toHaveLength(0);
        expect(card.classList.contains('fo-tool'), where).toBe(false);
        expect(card.classList.value, where).toEqual(['fo-guidecard', 'fo-dogear', `fo-cat--${data.category}`]);
        // The accessible name (the text of the link, in order) starts with the kind: "Guide", "Guia", "Guía".
        expect(card.structuredText.replace(/\s+/g, ' ').trim().startsWith(`${KIND[lang]} ${data.name}`), where).toBe(true);
        expect(card.querySelector('.fo-guidecard__kind strong')?.text, where).toBe(KIND[lang]);
        expect(card.querySelector('h3.fo-guidecard__name')?.text, where).toBe(data.name);
        expect(card.querySelector('h3')?.parentNode.closest('section')?.querySelector('h2'), where).not.toBeNull();
        expect(card.querySelector('p.fo-guidecard__desc')?.text, where).toBe(data.description);
        expect(card.querySelector('.fo-guidecard__proof > span')?.text, where).toBe(data.proof);
        expect(card.querySelector('.fo-guidecard__label')?.text, where).toBe(TEXTS[lang].guides.card.tool);
        expect(card.querySelector('.fo-guidecard__tool > span:last-child > span:last-child')?.text, where).toBe(data.tool.name);
        expect(card.querySelector('.fo-guidecard__tool .fo-chip__dot')?.classList.contains(`fo-cat--${data.tool.category}`), where).toBe(true);
        // Every icon of the card is decorative.
        for (const icon of card.querySelectorAll('svg')) expect(icon.getAttribute('aria-hidden'), where).toBe('true');
      }
      // The measure of every file guide in the digits of the language, read from the JSON (no other number on the card).
      for (const id of FILE_GUIDE_IDS) {
        const card = cards.find((candidate) => candidate.getAttribute('href') === FILE_GUIDES[id].paths[lang]);
        expect(card?.querySelector('.fo-guidecard__proof')?.text.trim(), `${lang} ${id}`).toBe(proofOf(id, lang));
      }
    });
  }
});
