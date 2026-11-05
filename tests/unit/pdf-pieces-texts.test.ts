import { describe, expect, it } from 'vitest';
import { PDF_PANEL_TEXTS, PDF_TOOL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { IMAGE_PANEL_TEXTS } from '../../src/tools/image/texts.ts';
import type { MergeTexts, NumbersTexts, ReorderTexts, RotatePdfTexts } from '../../src/tools/pdf/option-texts.ts';

// F13a (UX-11 A and UX-04 A; DECISOES § 485 and § 486): the texts of the PDF pieces in the three languages. The
// D-10 half of the table "Testes da F13" of pdf-pieces: the lines of Rotate PDF say what turned and which way, and the one of
// Reverse order says what happened. The rest are the new keys of the slice, with the same placeholders in the three.

const LANGS = ['en', 'pt', 'es'] as const;
const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe('D-10: what Rotate PDF and Reverse order say', () => {
  for (const lang of LANGS) {
    it(`Rotate PDF: every success line says the pages or the PDFs and the turn (${lang})`, () => {
      const panel = PDF_TOOL_TEXTS[lang]['rotate-pdf'].panel;
      const options = panel.options as unknown as RotatePdfTexts;
      expect(placeholders(panel.done)).toEqual(['pages', 'turn']);
      expect(placeholders(panel.doneMany)).toEqual(['count', 'turn']);
      expect(placeholders(options.doneOne)).toEqual(['turn']);
      expect(placeholders(options.donePicked)).toEqual(['count', 'pages']);
      for (const word of [options.rightTurn, options.halfTurn, options.leftTurn]) expect(word).toMatch(/°/);
      expect(new Set([options.rightTurn, options.halfTurn, options.leftTurn]).size).toBe(3);
    });

    it(`Reverse order says that the pages were reversed, not its own name (${lang})`, () => {
      const options = PDF_TOOL_TEXTS[lang]['reorder-pdf-pages'].panel.options as unknown as ReorderTexts;
      expect(options.reversed).toBeTruthy();
      expect(options.reversed).not.toBe(options.reverse);
      expect(options.reversed.endsWith('.')).toBe(true);
    });
  }
});

describe('the new keys of the PDF pieces and of the Merge list', () => {
  for (const lang of LANGS) {
    it(`have the placeholders of English (${lang})`, () => {
      const t = PDF_PANEL_TEXTS[lang];
      const en = PDF_PANEL_TEXTS.en;
      for (const key of ['readingCount', 'readingOne', 'out', 'undo'] as const) expect(placeholders(t.queue[key]), key).toEqual(placeholders(en.queue[key]));
      for (const key of ['filesCount', 'adjust', 'adjustHelp'] as const) expect(placeholders(t.result[key]), key).toEqual(placeholders(en.result[key]));
      expect(t.grid.helpKeys).toBeTruthy();
      expect('helpOrder' in t.grid, 'the help of the order mode left with F-14').toBe(false);
      const merge = PDF_TOOL_TEXTS[lang]['merge-pdf'].panel.options as unknown as MergeTexts;
      expect(placeholders(merge.order)).toEqual(['count']);
      for (const key of ['help', 'listLabel', 'orderHelp', 'needMore'] as const) expect(merge[key], key).toBeTruthy();
      const numbers = PDF_TOOL_TEXTS[lang]['add-page-numbers-to-pdf'].panel.options as unknown as NumbersTexts & { skipFirst?: string };
      for (const key of ['firstLegend', 'numberIt', 'skipIt'] as const) expect(numbers[key], key).toBeTruthy();
      expect(numbers.skipFirst, 'the label of the check box left with F-11').toBeUndefined();
    });
  }
});

// F13a, revisão e-1 (DECISOES § F13A-R-11): the help inside "Adjust" of the PDF tools said "makes the file again", a calque
// of the Portuguese; it says what the image island says, and pt and es keep theirs ("refaz", "rehace").
describe('e-1: the help inside "Adjust" of the PDF tools', () => {
  it('says that a change redoes the file, the words of the image island', () => {
    expect(PDF_PANEL_TEXTS.en.result.adjustHelp).toBe(IMAGE_PANEL_TEXTS.en.adjust.help);
    expect(PDF_PANEL_TEXTS.pt.result.adjustHelp).toMatch(/refaz o arquivo/);
    expect(PDF_PANEL_TEXTS.es.result.adjustHelp).toMatch(/rehace el archivo/);
  });
});

// F13a, revisão e-5 (DECISOES § F13A-R-12): the handle that picked a row up with Space and moved it with the arrow keys left
// with the F13a (§ 479); the step and the question of Merge PDF still offered the keyboard as a third way. The arrow buttons
// are the keyboard way now, and the texts say so.
describe('e-5: the step and the question of Merge PDF', () => {
  const OLD = /move it with the keyboard|You can also move a row with the keyboard|mova a linha pelo teclado|mover a linha pelo teclado|muévela con el teclado|mover una fila con el teclado/;
  const NOW: Record<(typeof LANGS)[number], RegExp> = { en: /they work with the keyboard too/, pt: /funcionam pelo teclado também/, es: /también funcionan con el teclado/ };
  for (const lang of LANGS) {
    it(`say that the arrow buttons work with the keyboard, with no keyboard of their own (${lang})`, () => {
      const texts = PDF_TOOL_TEXTS[lang]['merge-pdf'] as unknown as { howSteps: string[]; faq: { a: string }[] };
      const all = [...texts.howSteps, ...texts.faq.map((item) => item.a)].join(' | ');
      expect(all).not.toMatch(OLD);
      expect(texts.howSteps.join(' ')).toMatch(NOW[lang]);
    });
  }
});
