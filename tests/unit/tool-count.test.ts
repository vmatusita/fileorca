// One count of tools for the whole site, without the presets (F13b, decision 3; Victor's choice, F10 p-17 and F11
// R-E-1; DECISOES § 540). The module reads the registries at build time; this test recounts them on its own, checks the
// 48, 31 and 37 (the 46, 29 and 35 of the brief until the F17 added AVIF to JPG and Convert to WebP), and reads the built
// pages: the home H1, the "FileOrca in numbers" card of the About page, the About text and the Terms say the number of the
// module in the three languages, and the Menu keeps its 14.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { countValues, statsItems, toolCount, toolCounts } from '../../src/components/tool-count.ts';
import { COUNT_SAMPLES } from '../../scripts/gates/lint-texto.ts';
import { sectionCount } from '../../src/components/header-menu.ts';
import { LANGS, QR_ID, pagePath, type Lang } from '../../src/i18n/routes.ts';
import { BR_CALC_IDS, CALC_TOOL_IDS, HEALTH_CALC_IDS, HOUSE_CALC_IDS } from '../../src/tools/calc/registry.ts';
import { IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';

const exists = (ids: readonly string[], lang: Lang) => ids.filter((id) => pagePath(id as never, lang) !== undefined).length;

describe('the count of tools of a language', () => {
  it('is 48 in English, 31 in Portuguese and 37 in Spanish (F17: 46, 29 and 35 plus AVIF to JPG and Convert to WebP)', () => {
    expect(LANGS.map((lang) => toolCount(lang))).toEqual([48, 31, 37]);
  });

  it('adds the categories of the registries, without the presets', () => {
    for (const lang of LANGS) {
      const money = lang === 'pt' ? BR_CALC_IDS : CALC_TOOL_IDS;
      const recount =
        exists(IMAGE_TOOL_IDS, lang) + exists(PDF_TOOL_IDS, lang) + exists(money, lang) + exists(HOUSE_CALC_IDS, lang) +
        exists(HEALTH_CALC_IDS, lang) + (pagePath(QR_ID, lang) === undefined ? 0 : 1);
      expect(toolCount(lang), lang).toBe(recount);
      // The presets have pages but never count.
      expect(exists(IMAGE_PRESET_IDS, lang), lang).toBeGreaterThan(0);
      expect(IMAGE_TOOL_IDS.some((id) => (IMAGE_PRESET_IDS as readonly string[]).includes(id))).toBe(false);
    }
    expect(toolCounts('en')).toMatchObject({ image: 10, pdf: 12, money: 14, house: 6, health: 5, qr: 1, life: 11 });
    expect(toolCounts('pt')).toMatchObject({ image: 10, pdf: 12, money: 8, house: 0, health: 0, qr: 1 });
    expect(toolCounts('es')).toMatchObject({ image: 10, pdf: 12, money: 14, house: 0, health: 0, qr: 1 });
  });

  it('gives the lint:texto the counts it fills the About and Terms with', () => {
    for (const lang of LANGS) {
      const values = countValues(lang);
      for (const [name, value] of Object.entries(COUNT_SAMPLES[lang] ?? {})) expect(value, `${lang} {${name}}`).toBe(values[name]);
    }
  });

  it('gives the card "FileOrca in numbers" its four counts (F13b; DECISOES § 586)', () => {
    expect(statsItems('en')).toEqual([{ kind: 'image', value: 10 }, { kind: 'pdf', value: 12 }, { kind: 'money', value: 14 }, { kind: 'life', value: 11 }]);
    expect(statsItems('pt')).toEqual([{ kind: 'image', value: 10 }, { kind: 'pdf', value: 12 }, { kind: 'money', value: 8 }, { kind: 'languages', value: 3 }]);
    expect(statsItems('es')).toEqual([{ kind: 'image', value: 10 }, { kind: 'pdf', value: 12 }, { kind: 'money', value: 14 }, { kind: 'languages', value: LANGS.length }]);
  });

  it('counts the money calculators as the Menu does (14 in English and Spanish)', () => {
    for (const lang of LANGS) expect(toolCounts(lang).money, lang).toBe(sectionCount('money', lang));
    expect(sectionCount('money', 'en')).toBe(14);
    expect(sectionCount('money', 'es')).toBe(14);
  });
});

const DIST = 'dist';
const BUILT = existsSync(join(DIST, 'index.html'));
const html = (path: string) => readFileSync(join(DIST, ...path.split('/').filter(Boolean), 'index.html'), 'utf8');
/** The text of the page's <main>, without tags (the header's Menu counts and the inline scripts stay out). */
const main = (page: string) => /<main\b[\s\S]*?<\/main>/.exec(page)?.[0] ?? '';
const text = (page: string) => main(page).replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/\s+/g, ' ').trim();

describe.runIf(BUILT)('the built pages say the number of the module', () => {
  it('the About and the Terms of each language carry no placeholder and no count with the presets', () => {
    for (const lang of LANGS) {
      for (const id of ['about', 'terms'] as const) {
        const path = pagePath(id, lang);
        expect(path, `${id} ${lang}`).toBeDefined();
        const page = text(html(path ?? '/'));
        expect(page, `${id} ${lang}`).not.toMatch(/\{(image|pdf|money|life|total|brazil|spanish)\}/);
        expect(page, `${id} ${lang}`).not.toMatch(/\b18 (money calculators|calculadoras de dinero)\b/);
        if (lang !== 'pt') expect(page, `${id} ${lang}`).toMatch(/\b14 (money calculators|calculadoras de dinero)\b/);
      }
    }
  });

  it('the H1 of the home of each language starts with the total of the module', () => {
    for (const lang of LANGS) {
      const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(main(html(pagePath('home', lang) ?? '/')))?.[1] ?? '';
      expect(h1.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), lang).toMatch(new RegExp(`^${toolCount(lang)} \\S`));
    }
  });

  // F13b (decision 8; DECISOES § 586): the card "FileOrca in numbers" of the About page reads the same module
  // (statsItems), whose fourth count is the home and health calculators in English and the languages elsewhere.
  it('the card "FileOrca in numbers" of the About page says the counts of the module (10 · 12 · 14 · 11, 10 · 12 · 8 · 3, 10 · 12 · 14 · 3)', () => {
    const want: Record<Lang, string[]> = { en: ['10', '12', '14', '11', '0'], pt: ['10', '12', '8', '3', '0'], es: ['10', '12', '14', '3', '0'] };
    for (const lang of LANGS) {
      const counts = toolCounts(lang);
      const card = /<section class="fo-stats[\s\S]*?<\/section>/.exec(main(html(pagePath('about', lang) ?? '/')))?.[0] ?? '';
      const numbers = [...card.matchAll(/<span class="fo-stats__num">([^<]*)<\/span>/g)].map((match) => match[1]);
      expect(numbers, lang).toEqual(want[lang]);
      expect(numbers.slice(0, 3), lang).toEqual([counts.image, counts.pdf, counts.money].map(String));
      expect(numbers[3], lang).toBe(String(lang === 'en' ? counts.life : LANGS.length));
    }
  });
});
