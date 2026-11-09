// F13a · UX-14, the chip that takes the result to the next tool (decision 7 and criterion 5 of the run; DECISOES § 496
// to § 500): what decides, without a browser, whether a chip takes the files along or only links. The island cannot
// import takes() of src/share/logic.ts (it imports the sniffers of the engines and would leave the island chunk), so it
// has a copy, carries() in src/tools/image/inbox.ts, held equal to takes() on a grid here, as sizeLabel() is held to
// fileSize() in open-with.test.ts. Then the chips the pages build: which destinations carry (the ones that run by themselves
// and take what the page makes), the label of each in the three languages, and the pages each tool believes a file came from.
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
import { LANGS } from '../../src/i18n/routes.ts';

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

  it('Image to PDF makes a PDF, which Compress image does not take: that chip only links', () => {
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

describe('the chips the pages build', () => {
  it('carry from every image page that makes images to every image tool, with the labels of the language', () => {
    for (const lang of LANGS) {
      for (const id of Object.keys(IMAGE_PAGES) as ImagePageId[]) {
        for (const chip of imageChips(id, lang)) {
          if (chip.target === 'home') continue;
          if (IMAGE_PAGES[id].pdf) {
            expect(chip.carry, `${id} to ${chip.target} (${lang}) only links: it makes a PDF`).toBeUndefined();
            continue;
          }
          const label = IMAGE_PANEL_TEXTS[lang].carry.chips[chip.target as keyof (typeof IMAGE_PANEL_TEXTS)['en']['carry']['chips']];
          expect(chip.carry, `${id} to ${chip.target} (${lang})`).toEqual({ accepts: [...IMAGE_PAGES[chip.target as ImageToolId].accepts], single: false, one: label.one, many: label.many });
          // The chip keeps the name of the tool it links to (image-texts.test.ts): the label that carries is its own field.
          expect(chip.name).not.toBe(label.one);
        }
      }
    }
  });

  it('carry the PDFs only to the PDF tools that run by themselves, never the locked PDF of Protect PDF, and the pages of PDF to JPG to the image tools', () => {
    const carried: string[] = [];
    for (const id of PDF_TOOL_IDS) {
      for (const chip of pdfChips(id, 'en')) {
        if (!chip.carry) continue;
        carried.push(`${id}>${chip.target}`);
        if (chip.target in PDF_PAGES) {
          expect(PDF_PAGES[chip.target as PdfToolId].run, `${id} to ${chip.target}`).toBe('auto');
          expect(chip.carry.accepts).toEqual(['pdf']);
        } else {
          expect(id).toBe('pdf-to-jpg');
          expect(chip.carry.accepts).toEqual([...IMAGE_PAGES[chip.target as 'compress-image' | 'image-to-pdf'].accepts]);
        }
      }
    }
    expect(carried.sort()).toEqual(
      [
        'add-page-numbers-to-pdf>compress-pdf', 'delete-pdf-pages>compress-pdf', 'merge-pdf>add-page-numbers-to-pdf', 'merge-pdf>compress-pdf',
        'pdf-to-jpg>compress-image', 'pdf-to-jpg>image-to-pdf', 'reorder-pdf-pages>add-page-numbers-to-pdf', 'reorder-pdf-pages>compress-pdf',
        'rotate-pdf>compress-pdf', 'sign-pdf>compress-pdf', 'split-pdf>compress-pdf', 'unlock-pdf>compress-pdf', 'watermark-pdf>compress-pdf',
      ].sort(),
    );
    expect(pdfChips('protect-pdf', 'en').every((chip) => !chip.carry), 'Protect PDF makes a PDF that needs a password').toBe(true);
    expect(pdfChips('merge-pdf', 'en').find((chip) => chip.target === 'image-to-pdf')?.carry, 'a PDF is no image').toBeUndefined();
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
    expect(Object.keys(pdfPanelData('compress-pdf', 'en').origins).sort()).toEqual(
      ['add-page-numbers-to-pdf', 'delete-pdf-pages', 'merge-pdf', 'reorder-pdf-pages', 'rotate-pdf', 'sign-pdf', 'split-pdf', 'unlock-pdf', 'watermark-pdf'].sort(),
    );
    expect(pdfPanelData('merge-pdf', 'en').origins).toEqual({});
    expect(pdfPanelData('pdf-to-jpg', 'pt').carryLine.one).toBe(IMAGE_PANEL_TEXTS.pt.carry.line);
    expect(pdfPanelData('merge-pdf', 'es').carryLine.many).toBe(PDF_PANEL_TEXTS.es.carry.lineMany);
  });
});
