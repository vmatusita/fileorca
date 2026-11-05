// The About and Terms pages say what the site has, from the registries (F8, review F4-F7 h-1; DECISOES § 305). The
// sentence stayed from the F2 ("the image compressor in Portuguese and Spanish") while the F4 to F7 added PDF tools,
// calculators in three languages and the QR code generator. Since the review of the languages adjustment (D7; DECISOES
// § 321) the Portuguese and Spanish About pages and the Spanish Terms count from the same registries. Since the F13b
// (Victor's choice, F10 p-17 and F11 R-E-1; DECISOES § 540 and § 541) the site counts without the presets: the 14 money
// calculators of the hub, not 18, as the Menu and the hubs say, and the texts take the counts through placeholders that
// the views fill from src/components/tool-count.ts, in digits (G-14).
import { describe, expect, it } from 'vitest';
import about from '../../src/i18n/en/about.ts';
import ptAbout from '../../src/i18n/pt/about.ts';
import esAbout from '../../src/i18n/es/about.ts';
import enTerms from '../../src/i18n/en/terms.ts';
import ptTerms from '../../src/i18n/pt/terms.ts';
import esTerms from '../../src/i18n/es/terms.ts';
import { fmt } from '../../src/i18n/format.ts';
import { countValues, toolCounts } from '../../src/components/tool-count.ts';
import { BR_CALC_IDS, CALC_PAGES, CALC_TOOL_IDS, LIFE_CALC_IDS } from '../../src/tools/calc/registry.ts';
import { IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { LANGS } from '../../src/i18n/routes.ts';

const intro = (texts: { intro: readonly string[] }, lang: 'en' | 'pt' | 'es') => fmt(texts.intro.join(' '), countValues(lang));
const terms = (texts: { sections: readonly { paragraphs: readonly string[] }[] }, lang: 'en' | 'pt' | 'es') =>
  fmt(texts.sections.flatMap((section) => section.paragraphs).join(' '), countValues(lang));
// The presets of the money calculators are pages of CALC_PAGES that the hub does not list.
const MONEY_PRESETS = Object.keys(CALC_PAGES).length - CALC_TOOL_IDS.length;

describe('the English About page', () => {
  it('counts the tools of the registries, without the presets, in English and in the other languages', () => {
    const text = intro(about, 'en');
    expect(text).toContain(`${IMAGE_TOOL_IDS.length} image tools`);
    expect(text).toContain(`${PDF_TOOL_IDS.length} PDF tools`);
    expect(text).toContain(`${CALC_TOOL_IDS.length} money calculators,`);
    expect(text).toContain(`${LIFE_CALC_IDS.length} home and health calculators`);
    expect(text).toContain('a QR code generator');
    expect(text).toContain(`${BR_CALC_IDS.length} money calculators made for Brazil`);
    expect(text).toContain(`all ${CALC_TOOL_IDS.length} in Spanish`);
    expect(text).not.toContain('image compressor in Portuguese');
    // No count in words and none with the presets (the 18 of before).
    expect(MONEY_PRESETS).toBe(4);
    expect(text).not.toMatch(/\b(eight|twelve|eighteen|18)\b/);
    expect(text).not.toMatch(/\{\w+\}/);
  });
});

describe('the Portuguese and Spanish pages that count the tools', () => {
  it('the Portuguese About counts the image and PDF tools and the calculators made for Brazil, in digits', () => {
    const text = intro(ptAbout, 'pt');
    expect(text).toContain(`${IMAGE_TOOL_IDS.length} ferramentas de imagem`);
    expect(text).toContain(`${PDF_TOOL_IDS.length} de PDF`);
    expect(text).toContain(`${BR_CALC_IDS.length} calculadoras de dinheiro feitas para o Brasil`);
    // F13b (G-14; DECISOES § 586): the languages of the site in digits too, from LANGS.
    expect(text).toContain(`nos ${LANGS.length} idiomas do site`);
    expect(text).not.toMatch(/\b(oito|doze|três)\b/);
    expect(text).not.toMatch(/\{\w+\}/);
  });

  it('the Spanish About and Terms count the 14 money calculators of the hub, without the presets', () => {
    const text = intro(esAbout, 'es');
    expect(text).toContain(`herramientas de imagen, que son ${IMAGE_TOOL_IDS.length}`);
    expect(text).toContain(`las de PDF, que son ${PDF_TOOL_IDS.length}`);
    expect(text).toContain(`las ${CALC_TOOL_IDS.length} calculadoras de dinero`);
    const legal = terms(esTerms, 'es');
    expect(legal).toContain(`las ${CALC_TOOL_IDS.length} calculadoras de dinero`);
    // No other count of the money calculators on the two pages (the 18 of before, with the presets).
    for (const page of [text, legal]) expect(page.match(/\b(\d+|catorce|dieciocho) calculadoras de dinero/g) ?? []).toEqual([`${CALC_TOOL_IDS.length} calculadoras de dinero`]);
    expect(legal).not.toMatch(/\{\w+\}/);
  });

  it('the English Terms count the money calculators of Portuguese and Spanish without the presets', () => {
    const legal = terms(enTerms, 'en');
    expect(legal).toContain(`Portuguese has ${BR_CALC_IDS.length} money calculators made for Brazil, and Spanish has all ${CALC_TOOL_IDS.length} money calculators`);
    expect(legal).not.toMatch(/\b18 money calculators\b/);
    expect(legal).not.toMatch(/\{\w+\}/);
  });

  it('the Portuguese Terms still count the 8 calculators made for Brazil (their text did not change)', () => {
    expect(terms(ptTerms, 'pt')).toContain(`são oito calculadoras feitas para o Brasil`);
    expect(toolCounts('pt').money).toBe(8);
  });

  it('the Terms that changed carry the date of the change, and the Portuguese one keeps its own', () => {
    expect(enTerms.updated).toBe('Last updated: November 5, 2026');
    expect(esTerms.updated).toBe('Última actualización: 5 de noviembre de 2026');
    expect(ptTerms.updated).toBe('Última atualização: 3 de novembro de 2026');
  });
});
