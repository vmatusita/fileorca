// The English About page says what the site has, from the registries (F8, review F4-F7 h-1; DECISOES § 305). The
// sentence stayed from the F2 ("the image compressor in Portuguese and Spanish") while the F4 to F7 added PDF tools,
// calculators in three languages and the QR code generator.
import { describe, expect, it } from 'vitest';
import about from '../../src/i18n/en/about.ts';
import { BR_CALC_IDS, CALC_PAGES, LIFE_CALC_IDS } from '../../src/tools/calc/registry.ts';
import { IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const count = (n: number): string => (n <= 10 ? (WORDS[n] ?? String(n)) : String(n));

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
