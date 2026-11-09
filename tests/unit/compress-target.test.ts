import { describe, expect, it } from 'vitest';
import { LANGS } from '../../src/i18n/routes.ts';
import en from '../../src/tools/compress-image/i18n/en.ts';
import es from '../../src/tools/compress-image/i18n/es.ts';
import pt from '../../src/tools/compress-image/i18n/pt.ts';
import { TOOL } from '../../src/tools/compress-image/Panel.tsx';
import { CHOICES, MAX_KB, MIN_KB, START_KB, helpOf, labelOf, maxInvalidOf, nowOf, operationOf } from '../../src/tools/compress-image/size.ts';
import { parseWhole } from '../../src/tools/image/NumberField.tsx';
import type { FileInfo } from '../../src/tools/image/types.ts';

// F15 · Comprimir "até um tamanho" (item 5; PLANO-UX-QV, section D; DECISOES § 656, § 657 and § 660): the third choice of
// Compress image, its field and its words, without a browser. The engine's target is proven by engine-target.test.ts and
// image-presets.spec.ts; the page by tests/e2e/image-target.spec.ts.

const TEXTS = { en: en.panel.options, pt: pt.panel.options, es: es.panel.options } as const;
const file: FileInfo = { id: 1, name: 'photo.jpg', size: 4_300_000, width: 3024, height: 4032 };

describe('Compress image, the operation of each choice', () => {
  it('starts on Recommended with 200 KB kept for "Up to a size"', () => {
    expect(TOOL.initial).toEqual({ level: 'recommended', kb: 200 });
    expect(START_KB).toBe(200);
    expect(TOOL.operation(TOOL.initial, file)).toEqual({ kind: 'compress', level: 'recommended' });
  });

  it('keeps the two levels of the engine as they were', () => {
    expect(operationOf({ level: 'recommended', kb: 500 })).toEqual({ kind: 'compress', level: 'recommended' });
    expect(operationOf({ level: 'strong', kb: 500 })).toEqual({ kind: 'compress', level: 'strong' });
  });

  it('"Up to a size" is the target of the size presets, with 1 KB = 1,000 bytes', () => {
    expect(operationOf({ level: 'size', kb: 200 })).toEqual({ kind: 'target', maxBytes: 200_000 });
    expect(operationOf({ level: 'size', kb: 100 })).toEqual({ kind: 'target', maxBytes: 100_000 }); // the 100 KB preset
    expect(operationOf({ level: 'size', kb: 1000 })).toEqual({ kind: 'target', maxBytes: 1_000_000 }); // the 1 MB preset
    expect(TOOL.operation({ level: 'size', kb: MIN_KB }, file)).toEqual({ kind: 'target', maxBytes: 20_000 });
    expect(TOOL.operation({ level: 'size', kb: MAX_KB }, file)).toEqual({ kind: 'target', maxBytes: 10_000_000 });
  });

  it('offers the three choices in the order of section D, each with its label and short help', () => {
    expect(CHOICES).toEqual(['recommended', 'strong', 'size']);
    expect(CHOICES.map((value) => labelOf(TEXTS.pt, value))).toEqual(['Recomendada', 'Forte', 'Até um tamanho']);
    expect(CHOICES.map((value) => helpOf(TEXTS.pt, value))).toEqual(['melhor equilíbrio', 'menor tamanho', 'limite em KB']);
    expect(CHOICES.map((value) => labelOf(TEXTS.en, value))).toEqual(['Recommended', 'Strong', 'Up to a size']);
    expect(CHOICES.map((value) => labelOf(TEXTS.es, value))).toEqual(['Recomendada', 'Fuerte', 'Hasta un tamaño']);
  });
});

describe('Compress image, the field "Maximum size"', () => {
  it('takes a whole number from 20 to 10,000, without a thousands separator (as Resize)', () => {
    expect([MIN_KB, MAX_KB]).toEqual([20, 10_000]);
    expect(parseWhole('20', MIN_KB, MAX_KB)).toBe(20);
    expect(parseWhole(' 200 ', MIN_KB, MAX_KB)).toBe(200);
    expect(parseWhole('10000', MIN_KB, MAX_KB)).toBe(10_000);
    for (const wrong of ['19', '0', '10001', '10.000', '10,000', '1.5', '-50', '', 'abc', '200 KB']) expect(parseWhole(wrong, MIN_KB, MAX_KB), wrong).toBeNull();
  });

  it('says the range in the format of each language when the number is wrong', () => {
    expect(maxInvalidOf(TEXTS.en, 'en')).toBe('Type a whole number from 20 to 10,000.');
    expect(maxInvalidOf(TEXTS.pt, 'pt')).toBe('Digite um número inteiro de 20 a 10.000.');
    expect(maxInvalidOf(TEXTS.es, 'es')).toBe('Escribe un número entero de 20 a 10,000.');
  });

  it('has the same keys in the three languages, the suffix KB and a help that says JPG and the white of the transparency', () => {
    for (const lang of LANGS) {
      const texts = TEXTS[lang];
      expect(Object.keys(texts).sort(), lang).toEqual(Object.keys(TEXTS.en).sort());
      expect(texts.kb, lang).toBe('KB');
      expect(texts.maxHelp, lang).toContain('JPG');
      expect(texts.maxInvalid, lang).toContain('{min}');
      expect(texts.maxInvalid, lang).toContain('{max}');
      expect(texts.upTo, lang).toContain('{n} KB');
    }
    expect(TEXTS.pt.maxLabel).toBe('Tamanho máximo');
    expect(TEXTS.pt.maxHelp).toContain('a transparência fica branca');
  });
});

describe('Compress image, what "Adjust ·" says', () => {
  it('names the level, as before', () => {
    expect(nowOf({ level: 'recommended', kb: 200 }, TEXTS.en, 'en')).toBe('Recommended');
    expect(nowOf({ level: 'strong', kb: 200 }, TEXTS.pt, 'pt')).toBe('Forte');
    expect(TOOL.now?.({ level: 'strong', kb: 200 }, TEXTS.es, 'es')).toBe('Fuerte');
  });

  it('says "Up to {n} KB" with the number in the format of the language', () => {
    expect(nowOf({ level: 'size', kb: 200 }, TEXTS.en, 'en')).toBe('Up to 200 KB');
    expect(nowOf({ level: 'size', kb: 200 }, TEXTS.pt, 'pt')).toBe('Até 200 KB');
    expect(nowOf({ level: 'size', kb: 200 }, TEXTS.es, 'es')).toBe('Hasta 200 KB');
    expect(nowOf({ level: 'size', kb: 1500 }, TEXTS.en, 'en')).toBe('Up to 1,500 KB');
    expect(nowOf({ level: 'size', kb: 1500 }, TEXTS.pt, 'pt')).toBe('Até 1.500 KB');
    expect(nowOf({ level: 'size', kb: 10_000 }, TEXTS.es, 'es')).toBe('Hasta 10,000 KB');
  });
});
