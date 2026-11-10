// F13a · UX-14, the chip that takes the result to the next tool (decision 7 and criterion 5 of the run; DECISOES § 496
// to § 500): what decides, without a browser, whether a chip takes the files along or only links. The island cannot
// import takes() of src/share/logic.ts (it imports the sniffers of the engines and would leave the island chunk), so it
// has a copy, carries() in src/tools/image/inbox.ts, held equal to takes() on a grid here, as sizeLabel() is held to
// fileSize() in open-with.test.ts. Then the chips the pages build: which destinations carry (the ones that take what the page
// makes: running by themselves, and since the F15 waiting for their action too, DECISOES § 654), the label of each in the
// three languages, and the pages each tool believes a file came from.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkSprite } from '../../scripts/lib/design-checks.ts';
import { FILE_PANEL_POSES } from '../../src/tools/image/Oli.tsx';
import { takes } from '../../src/share/logic.ts';
import { carries, plainClick, readChoice } from '../../src/tools/image/inbox.ts';
import { chipsFor as imageChips, originsOf, panelData as imagePanelData } from '../../src/tools/image/page.ts';
import { IMAGE_PAGES, type ImagePageId, type ImageToolId } from '../../src/tools/image/registry.ts';
import { IMAGE_PANEL_TEXTS } from '../../src/tools/image/texts.ts';
import { chipsFor as pdfChips, panelData as pdfPanelData } from '../../src/tools/pdf/page.ts';
import { PDF_PAGES, PDF_TOOL_IDS, type PdfToolId } from '../../src/tools/pdf/registry.ts';
import { PDF_PANEL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { LANGS, languagesOf, pathFor, routeById } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { ICONS } from '../../src/icons/icons.ts';

const FORMATS = ['jpeg', 'png', 'webp', 'gif', 'heic', 'avif', 'pdf'];
const ACCEPTS = [[], ['pdf'], ['jpeg'], ['jpeg', 'png', 'webp'], ['png', 'jpeg'], ['heic'], [...FORMATS]];

/** Every list of formats of length 0 to 3 over FORMATS (343 + 49 + 7 + 1). */
function formatLists(): string[][] {
  const lists: string[][] = [[]];
  for (let length = 1; length <= 3; length += 1) {
    const grow = (prefix: string[]): void => {
      if (prefix.length === length) lists.push(prefix);
      else for (const format of FORMATS) grow([...prefix, format]);
    };
    grow([]);
  }
  return lists;
}

describe('the copy of takes() in the island', () => {
  it('says the same as takes() of src/share/logic.ts on a grid of what a tool takes and what came out', () => {
    let cases = 0;
    for (const accepts of ACCEPTS) {
      for (const single of [false, true]) {
        for (const formats of formatLists()) {
          expect(carries(accepts, single, formats), `${accepts.join('+')} ${single} ${formats.join('+')}`).toBe(takes(accepts, single, formats));
          cases += 1;
        }
      }
    }
    expect(cases).toBe(ACCEPTS.length * 2 * 400);
  });

  it('a PDF is no image: no image tool takes it (Merge PDF to Image to PDF only links)', () => {
    expect(carries(IMAGE_PAGES['compress-image'].accepts, false, ['pdf'])).toBe(0);
    expect(carries(IMAGE_PAGES['resize-image'].accepts, false, ['pdf'])).toBe(0);
    expect(carries(IMAGE_PAGES['resize-image'].accepts, false, ['jpeg', 'png'])).toBe(2);
    expect(carries(['pdf'], true, ['pdf', 'pdf'])).toBe(1);
  });
});

describe('the click that takes the files along', () => {
  const click = { button: 0, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, defaultPrevented: false };
  it('is a plain click of the main button; a key held, the middle button or a prevented click only links', () => {
    expect(plainClick(click)).toBe(true);
    for (const key of ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'] as const) expect(plainClick({ ...click, [key]: true }), key).toBe(false);
    expect(plainClick({ ...click, button: 1 }), 'middle button').toBe(false);
    expect(plainClick({ ...click, defaultPrevented: true }), 'prevented').toBe(false);
  });

  it('reads the page the files came from as an id, never as anything else, and leaves the choice of "Open with" as it was', () => {
    expect(readChoice(JSON.stringify({ tool: 'resize-image', order: [0, 1], from: 'compress-image' }))).toEqual({ tool: 'resize-image', order: [0, 1], from: 'compress-image' });
    expect(readChoice(JSON.stringify({ tool: 'resize-image', order: [0] }))).toEqual({ tool: 'resize-image', order: [0] });
    for (const from of ['photo.jpg', '/compress-image/', 'Compress image', '', 42, null, 'a'.repeat(65)]) {
      expect(readChoice(JSON.stringify({ tool: 'resize-image', order: [0], from })), String(from)).toEqual({ tool: 'resize-image', order: [0] });
    }
  });
});

/**
 * F15 (DECISOES § 653, § 654 and § 655): every chip of a page that makes a PDF or the pages of PDF to JPG, by its source and
 * target, and what it does: takes the PDF along ('pdf'), to a tool that takes one file at a time ('pdf one'), takes the
 * images along ('images'), or only links. The tools that wait for an action take the PDF too now (the § 497 said "only
 * link"); Protect PDF never takes its PDF anywhere (it needs a password); a PDF is no image. Every chip of these pages is
 * here, so a pair more or a pair less fails the test.
 */
const PAIRS: Record<string, 'pdf' | 'pdf one' | 'images' | 'link'> = {
  'merge-pdf>add-page-numbers-to-pdf': 'pdf',
  'merge-pdf>compress-pdf': 'pdf',
  'merge-pdf>image-to-pdf': 'link',
  'split-pdf>compress-pdf': 'pdf',
  'split-pdf>merge-pdf': 'pdf',
  'pdf-to-jpg>compress-image': 'images',
  'pdf-to-jpg>image-to-pdf': 'images',
  'compress-pdf>protect-pdf': 'pdf',
  'compress-pdf>merge-pdf': 'pdf',
  'rotate-pdf>compress-pdf': 'pdf',
  'rotate-pdf>merge-pdf': 'pdf',
  'delete-pdf-pages>reorder-pdf-pages': 'pdf one',
  'delete-pdf-pages>compress-pdf': 'pdf',
  'add-page-numbers-to-pdf>compress-pdf': 'pdf',
  'add-page-numbers-to-pdf>protect-pdf': 'pdf',
  'sign-pdf>protect-pdf': 'pdf',
  'sign-pdf>compress-pdf': 'pdf',
  'protect-pdf>compress-pdf': 'link',
  'protect-pdf>merge-pdf': 'link',
  'unlock-pdf>compress-pdf': 'pdf',
  'unlock-pdf>merge-pdf': 'pdf',
  'unlock-pdf>split-pdf': 'pdf one',
  'reorder-pdf-pages>add-page-numbers-to-pdf': 'pdf',
  'reorder-pdf-pages>compress-pdf': 'pdf',
  'watermark-pdf>protect-pdf': 'pdf',
  'watermark-pdf>compress-pdf': 'pdf',
  'image-to-pdf>compress-pdf': 'pdf',
  'image-to-pdf>merge-pdf': 'pdf',
  'image-to-pdf>add-page-numbers-to-pdf': 'pdf',
};

/** The pairs that take a file to a tool that waits for its action (D11 and decision 6 of the F15): none more, none fewer. */
const TO_AN_ACTION = [
  'split-pdf>merge-pdf', 'compress-pdf>merge-pdf', 'rotate-pdf>merge-pdf', 'unlock-pdf>merge-pdf', 'image-to-pdf>merge-pdf',
  'unlock-pdf>split-pdf', 'delete-pdf-pages>reorder-pdf-pages',
  'compress-pdf>protect-pdf', 'add-page-numbers-to-pdf>protect-pdf', 'sign-pdf>protect-pdf', 'watermark-pdf>protect-pdf',
];

describe('the chips the pages build', () => {
  it('carry from every image page that makes images to every image tool, and from Image to PDF the PDF to the PDF tools, with the labels of the language', () => {
    for (const lang of LANGS) {
      for (const id of Object.keys(IMAGE_PAGES) as ImagePageId[]) {
        for (const chip of imageChips(id, lang)) {
          if (chip.target === 'home') continue;
          const label = IMAGE_PANEL_TEXTS[lang].carry.chips[chip.target as keyof (typeof IMAGE_PANEL_TEXTS)['en']['carry']['chips']];
          if (IMAGE_PAGES[id].pdf) {
            // F15 (DECISOES § 653): a PDF goes to the PDF tools, and only there; the label is the image island's own.
            expect(chip.target in PDF_PAGES, `${id} to ${chip.target} (${lang}): a PDF tool`).toBe(true);
            expect(chip.carry, `${id} to ${chip.target} (${lang})`).toEqual({ accepts: ['pdf'], single: PDF_PAGES[chip.target as PdfToolId].files === 'single', one: label.one, many: label.many });
          } else {
            expect(chip.target in PDF_PAGES, `${id} to ${chip.target} (${lang}): an image is no PDF`).toBe(false);
            expect(chip.carry, `${id} to ${chip.target} (${lang})`).toEqual({ accepts: [...IMAGE_PAGES[chip.target as ImageToolId].accepts], single: false, one: label.one, many: label.many });
          }
          // The chip keeps the name of the tool it links to (image-texts.test.ts): the label that carries is its own field.
          expect(chip.name).not.toBe(label.one);
        }
      }
    }
  });

  it('carry by the table of pairs: the PDF to every PDF tool that takes it, running by itself or waiting for its action, one file to a one-file tool, never the locked PDF of Protect PDF, and the pages of PDF to JPG to the image tools', () => {
    for (const lang of LANGS) {
      const seen: Record<string, string> = {};
      const chips = [
        ...PDF_TOOL_IDS.flatMap((id) => pdfChips(id, lang).map((chip) => ({ id: id as string, chip }))),
        ...imageChips('image-to-pdf', lang).map((chip) => ({ id: 'image-to-pdf', chip })),
      ];
      for (const { id, chip } of chips) {
        const pair = `${id}>${chip.target}`;
        const carry = chip.carry;
        const kind = !carry ? 'link' : carry.accepts.includes('pdf') ? (carry.single ? 'pdf one' : 'pdf') : 'images';
        seen[pair] = kind;
        if (!carry) continue;
        const labels = id === 'image-to-pdf' || kind === 'images' ? IMAGE_PANEL_TEXTS[lang].carry.chips : PDF_PANEL_TEXTS[lang].carry.chips;
        const label = labels[chip.target as keyof typeof labels];
        expect({ one: carry.one, many: carry.many }, `${pair} (${lang})`).toEqual({ one: label.one, many: label.many });
        if (kind === 'images') expect(carry.accepts, pair).toEqual([...IMAGE_PAGES[chip.target as 'compress-image' | 'image-to-pdf'].accepts]);
        else expect(carry.accepts, pair).toEqual(['pdf']);
      }
      expect(seen, lang).toEqual(PAIRS);
    }
    const toAnAction = Object.keys(PAIRS).filter((pair) => PAIRS[pair] !== 'link' && PDF_PAGES[pair.split('>')[1] as PdfToolId]?.run === 'action');
    expect(toAnAction.sort(), 'the tools with an action that take the file now').toEqual([...TO_AN_ACTION].sort());
    expect(pdfChips('protect-pdf', 'en').every((chip) => !chip.carry), 'Protect PDF makes a PDF that needs a password').toBe(true);
    expect(pdfChips('merge-pdf', 'en').find((chip) => chip.target === 'image-to-pdf')?.carry, 'a PDF is no image').toBeUndefined();
  });

  it('lead from Image to PDF to PDF tools that exist in the three languages, with the name of the tool in each (criterion 3 of the F15)', () => {
    const targets = imageChips('image-to-pdf', 'en').map((chip) => chip.target);
    expect(targets, 'Compress PDF, Merge PDF and Add page numbers, in this order').toEqual(['compress-pdf', 'merge-pdf', 'add-page-numbers-to-pdf']);
    for (const lang of LANGS) {
      const chips = imageChips('image-to-pdf', lang);
      expect(chips.map((chip) => chip.target), lang).toEqual(targets);
      for (const chip of chips) {
        const target = chip.target as PdfToolId;
        expect(PDF_TOOL_IDS, `${target} is a PDF tool`).toContain(target);
        expect(languagesOf(routeById(target)), `${target} exists in ${lang}`).toContain(lang);
        expect(chip.href, `${target} (${lang})`).toBe(routeById(target).paths[lang]);
        expect(chip.href, `${target} (${lang})`).toBe(pathFor(target, lang));
        expect(chip.name, `${target} (${lang})`).toBe(TEXTS[lang].common.pdf[target].name);
        expect(chip.category, `${target} (${lang})`).toBe('pdf');
        expect(chip.icon, `${target} (${lang})`).toBe(ICONS[PDF_PAGES[target].icon]);
      }
    }
    expect(imageChips('image-to-pdf', 'pt').map((chip) => chip.name)).toEqual(['Comprimir PDF', 'Juntar PDF', 'Numerar páginas do PDF']);
  });

  it('the chip of a PNG refused by HEIC to JPG takes it to PNG to JPG and keeps its name (D-17)', () => {
    for (const lang of LANGS) {
      const chip = imagePanelData('heic-to-jpg', lang).elsewhere?.chip;
      expect(chip?.carry, lang).toEqual({ accepts: ['png', 'jpeg'], single: false, one: chip?.name, many: chip?.name });
    }
  });

  it('every label that carries has the {count} of a batch, in the three languages', () => {
    for (const lang of LANGS) {
      const labels = [...Object.values(IMAGE_PANEL_TEXTS[lang].carry.chips), ...Object.values(PDF_PANEL_TEXTS[lang].carry.chips)];
      for (const label of labels) {
        expect(label.many, `${lang}: ${label.many}`).toContain('{count}');
        expect(label.one, `${lang}: ${label.one}`).not.toContain('{');
      }
      for (const words of [IMAGE_PANEL_TEXTS[lang].carry, PDF_PANEL_TEXTS[lang].carry]) {
        expect(words.from).toContain('{tool}');
        expect(words.fromMany).toContain('{count}');
        expect(words.lostHelp).toContain('{tool}');
        expect(words.back).toContain('{tool}');
      }
    }
  });
});

// The pose of the empty box (DECISOES § 499): the page has to have its symbol before the island needs it, so the
// sprite of every page with a drop zone (tools, presets, guides with the tool) carries it, and the gate:design asks for it
// next to the buoy (scripts/gates/design.ts). Read from dist/ (run `pnpm build` first, as `pnpm verificar` does).
const BUILT = existsSync(join('dist', 'index.html'));
describe.runIf(BUILT)('the Oli of the empty box is in the sprite', () => {
  it('of every page with a drop zone, image and PDF, in the three languages, and the gate asks for it', () => {
    expect(FILE_PANEL_POSES).toContain('lost');
    expect(readFileSync('scripts/gates/design.ts', 'utf8')).toMatch(/class="fo-drop"'\) \? \['buoy', 'lost'\]/);
    const paths = ['compress-image', 'compress-image/to-100kb', 'pt/redimensionar-imagem', 'es/unir-pdf', 'merge-pdf', 'guides/heic-to-jpg-on-windows'];
    for (const path of paths) {
      const html = readFileSync(join('dist', path, 'index.html'), 'utf8');
      expect(html, path).toContain('class="fo-drop"');
      expect(checkSprite(html, { requiredPoses: ['peek', 'wave', 'gulp', 'swim', 'cheer', 'oops', 'buoy', 'lost'] }), path).toEqual([]);
    }
  });
});

describe('where a file may come from', () => {
  it('each tool believes only the pages whose chip takes their result to it, with their name in the language', () => {
    expect(originsOf('resize-image', 'en')).toMatchObject({ 'compress-image': 'Compress image', 'crop-image': 'Crop image', 'heic-to-jpg': 'HEIC to JPG' });
    expect(originsOf('resize-image', 'en')).not.toHaveProperty('image-to-pdf');
    expect(originsOf('compress-image', 'pt')).toMatchObject({ 'resize-image': 'Redimensionar imagem', 'pdf-to-jpg': 'PDF para JPG' });
    expect(originsOf('compress-image', 'en')).not.toHaveProperty('image-to-pdf');
    expect(originsOf('png-to-jpg', 'es')).toEqual({ 'heic-to-jpg': 'HEIC a JPG' });
    expect(pdfPanelData('pdf-to-jpg', 'pt').carryLine.one).toBe(IMAGE_PANEL_TEXTS.pt.carry.line);
    expect(pdfPanelData('merge-pdf', 'es').carryLine.many).toBe(PDF_PANEL_TEXTS.es.carry.lineMany);
  });

  // F15 (DECISOES § 653 and § 655): the PDF tools believe the PDF tools whose chip takes the PDF to them, the tools with an
  // action too now, and Image to PDF (to Compress PDF, Merge PDF and Add page numbers), with the name of the page in the
  // language; no tool believes Protect PDF, and the image tools still do not believe Image to PDF.
  it('the PDF tools, with an action or not, believe the pages of the table, Image to PDF among them, in the three languages', () => {
    const expected: Partial<Record<PdfToolId, string[]>> = {
      'compress-pdf': ['add-page-numbers-to-pdf', 'delete-pdf-pages', 'image-to-pdf', 'merge-pdf', 'reorder-pdf-pages', 'rotate-pdf', 'sign-pdf', 'split-pdf', 'unlock-pdf', 'watermark-pdf'],
      'merge-pdf': ['compress-pdf', 'image-to-pdf', 'rotate-pdf', 'split-pdf', 'unlock-pdf'],
      'split-pdf': ['unlock-pdf'],
      'reorder-pdf-pages': ['delete-pdf-pages'],
      'protect-pdf': ['add-page-numbers-to-pdf', 'compress-pdf', 'sign-pdf', 'watermark-pdf'],
      'add-page-numbers-to-pdf': ['image-to-pdf', 'merge-pdf', 'reorder-pdf-pages'],
    };
    for (const lang of LANGS) {
      for (const id of PDF_TOOL_IDS) {
        const origins = pdfPanelData(id, lang).origins;
        expect(Object.keys(origins).sort(), `${id} (${lang})`).toEqual([...(expected[id] ?? [])].sort());
        expect(origins, `${id} (${lang})`).not.toHaveProperty('protect-pdf');
        for (const [source, name] of Object.entries(origins)) {
          const common = TEXTS[lang].common;
          expect(name, `${source} in ${id} (${lang})`).toBe(source in PDF_PAGES ? common.pdf[source as PdfToolId].name : common.tools[source as ImagePageId].name);
        }
      }
    }
    expect(pdfPanelData('merge-pdf', 'pt').origins['image-to-pdf']).toBe('Imagem para PDF');
    expect(pdfPanelData('compress-pdf', 'es').origins['image-to-pdf']).toBe(TEXTS.es.common.tools['image-to-pdf'].name);
    for (const id of Object.keys(IMAGE_PAGES) as ImagePageId[]) expect(originsOf(id, 'en'), id).not.toHaveProperty('image-to-pdf');
  });
});
