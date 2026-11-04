import { existsSync, readFileSync } from 'node:fs';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { LANGS, type Lang } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { fmt, groupDigits } from '../../src/i18n/format.ts';
import { CALC_PAGES, GUIDES, GUIDE_IDS, guidePathIn } from '../../src/tools/calc/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS, GUIDES_HUB_ID, type FileGuideId } from '../../src/tools/guides/registry.ts';
import { guideCardData, measuredFiles } from '../../src/tools/guides/card.ts';
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
};
type Sampled = { sample: { files: string[] } };
/** The same count by the shape of the JSON alone: the files of the numbers and of the tables of the guide, once each. */
const byShape = (id: FileGuideId): number => {
  const guide = (measured as unknown as { guides: Record<string, { numbers: Record<string, Sampled>; tables: Record<string, Sampled> }> }).guides[id];
  return new Set([...Object.values(guide?.numbers ?? {}), ...Object.values(guide?.tables ?? {})].flatMap((entry) => entry.sample.files)).size;
};
const KIND: Record<Lang, string> = { en: 'Guide', pt: 'Guia', es: 'Guía' };

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
    }
    // A file in two samples counts once (the location guide: three JPG and ten HEIC files across its numbers).
    expect(measuredFiles('guides-remove-location-from-photos')).toHaveLength(13);
  });

  it('reads any depth of the JSON, and counts a file twice never', () => {
    const fake = { guides: { 'guides-jpg-vs-png': { numbers: { a: { sample: { files: ['x.jpg', 'y.png'] } } }, tables: { b: { sample: { files: ['y.png'] } } }, deep: [{ more: { sample: { files: ['z.jpg'] } } }] } } };
    expect(measuredFiles('guides-jpg-vs-png', fake as never).sort()).toEqual(['x.jpg', 'y.png', 'z.jpg']);
  });
});

describe('the data of each guide card, in each language of the guide', () => {
  it('has the blurb, the group, the measure in the digits of the language and the tool of each file guide', () => {
    for (const lang of LANGS) {
      const t = TEXTS[lang].guides.card;
      for (const id of FILE_GUIDE_IDS) {
        const card = guideCardData(id, lang);
        const blurb = TEXTS[lang].common.fileGuides?.[id];
        expect([card.href, card.name, card.description], `${lang} ${id}`).toEqual([FILE_GUIDES[id].paths[lang], blurb?.name, blurb?.description]);
        expect(card.category, `${lang} ${id}`).toBe(FILE_GUIDES[id].hub === 'pdf-tools' ? 'pdf' : 'image');
        expect(card.proof, `${lang} ${id}`).toBe(fmt(t.measured, { n: groupDigits(SPEC_N[id], lang) }));
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
      for (const text of [t.kind, t.measured, t.workedOut ?? '', t.tool]) expect(text, lang).not.toMatch(/\d/);
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
        expect(card?.querySelector('.fo-guidecard__proof')?.text.trim(), `${lang} ${id}`).toBe(fmt(TEXTS[lang].guides.card.measured, { n: groupDigits(SPEC_N[id], lang) }));
      }
    });
  }
});
