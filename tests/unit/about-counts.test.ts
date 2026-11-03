// The English About page says what the site has, from the registries (F8, review F4-F7 h-1; DECISOES § 305). The
// sentence stayed from the F2 ("the image compressor in Portuguese and Spanish") while the F4 to F7 added PDF tools,
// calculators in three languages and the QR code generator. Since the review of the languages adjustment (D7; DECISOES
// § 321) the Portuguese and Spanish About pages and the Spanish Terms count from the same registries, and the Spanish
// pages count the money calculators the way the English one does (the 14 and their 4 presets are 18 calculators).
import { describe, expect, it } from 'vitest';
import about from '../../src/i18n/en/about.ts';
import ptAbout from '../../src/i18n/pt/about.ts';
import esAbout from '../../src/i18n/es/about.ts';
import esTerms from '../../src/i18n/es/terms.ts';
import { BR_CALC_IDS, CALC_PAGES, LIFE_CALC_IDS, moneyPage, CALC_PAGE_IDS } from '../../src/tools/calc/registry.ts';
import { IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const count = (n: number): string => (n <= 10 ? (WORDS[n] ?? String(n)) : String(n));
// A count of feminine nouns ("ferramentas", "calculadoras", "herramientas"), in words up to ten as the pages write it.
const PT_WORDS = ['zero', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
const ES_WORDS = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
const ptCount = (n: number): string => (n <= 10 ? (PT_WORDS[n] ?? String(n)) : String(n));
const esCount = (n: number): string => (n <= 10 ? (ES_WORDS[n] ?? String(n)) : String(n));
const spanishMoney = CALC_PAGE_IDS.filter((id) => moneyPage(id, 'es')).length;

describe('the English About page', () => {
  it('counts the tools of the registries, in English and in the other languages', () => {
    const text = about.intro.join(' ');
    const spanish = Object.values(CALC_PAGES).filter((page) => 'es' in page && page.es).length;
    expect(text).toContain(`${count(IMAGE_TOOL_IDS.length)} image tools`);
    expect(text).toContain(`${count(PDF_TOOL_IDS.length)} PDF tools`);
    expect(text).toContain(`${count(Object.keys(CALC_PAGES).length)} money calculators`);
    expect(text).toContain(`${count(LIFE_CALC_IDS.length)} home and health calculators`);
    expect(text).toContain('a QR code generator');
    expect(text).toContain(`${count(BR_CALC_IDS.length)} money calculators made for Brazil`);
    expect(text).toContain(`${count(spanish)} in Spanish`);
    expect(text).not.toContain('image compressor in Portuguese');
  });
});

describe('the Portuguese and Spanish pages that count the tools', () => {
  it('the Portuguese About counts the image and PDF tools and the calculators made for Brazil', () => {
    const text = ptAbout.intro.join(' ');
    expect(text).toContain(`${ptCount(IMAGE_TOOL_IDS.length)} ferramentas de imagem`);
    expect(text).toContain(`${ptCount(PDF_TOOL_IDS.length)} de PDF`);
    expect(text).toContain(`${ptCount(BR_CALC_IDS.length)} calculadoras de dinheiro feitas para o Brasil`);
  });

  it('the Spanish About and Terms count the money calculators as the English About does (presets included)', () => {
    expect(spanishMoney).toBe(Object.keys(CALC_PAGES).length);
    const text = esAbout.intro.join(' ');
    expect(text).toContain(`herramientas de imagen, que son ${esCount(IMAGE_TOOL_IDS.length)}`);
    expect(text).toContain(`las de PDF, que son ${esCount(PDF_TOOL_IDS.length)}`);
    expect(text).toContain(`las ${esCount(spanishMoney)} calculadoras de dinero`);
    const terms = esTerms.sections.flatMap((section) => section.paragraphs).join(' ');
    expect(terms).toContain(`las ${esCount(spanishMoney)} calculadoras de dinero`);
    // No other count of the money calculators on the two pages (the 14 of before, without the presets).
    for (const page of [text, terms]) expect(page.match(/\b(\d+|catorce|dieciocho) calculadoras de dinero/g) ?? []).toEqual([`${esCount(spanishMoney)} calculadoras de dinero`]);
  });
});
