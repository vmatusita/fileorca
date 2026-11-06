// The home (F13b, decision 6; UX-03 B; DECISOES § 567 and § 570; ajuste-home-cards, § 602 to § 613), read in the built
// home of each language: the H1 says the count of the site (46, 29 and 35, without the presets; § 540); under the top,
// each category is a section with one ToolCard per tool of its list in src/components/home-bands.ts (the name in an H3,
// the description and the icon of the registries) and the link to its hub, as in the F13a; nothing of the bands of the
// F13b (the band, its chips, its number) is left in <main>; no digit is typed in the texts of the home; and the sentence of
// the money section says only what every money calculator does (§ 591). Until the ajuste-home-cards this file was
// home-numbers.test.ts, which also held each number of the bands against its source (§ 568) and the words of the 3 ads by
// width (§ 571); both left with the bands (§ 612).
// Run `pnpm build` first; FO_HOME_DIST=<folder> reads another build (the proof against the starting point).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { ICONS } from '../../src/icons/icons.ts';
import { LANGS, routeById, type Lang } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { HOME_BAND_MONEY_IDS, homeBands, homeCardPaths } from '../../src/components/home-bands.ts';
import { BR_CALC_IDS, HOME_MONEY_IDS, HEALTH_CALC_IDS, HOUSE_CALC_IDS, HUB_MONEY_IDS, moneyPage } from '../../src/tools/calc/registry.ts';
import { IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';

const DIST = process.env['FO_HOME_DIST'] ?? 'dist';
const BUILT = existsSync(join(DIST, 'index.html'));
const HOME: Record<Lang, string> = { en: 'index.html', pt: 'pt/index.html', es: 'es/index.html' };
const page = (lang: Lang) => parse(readFileSync(join(DIST, HOME[lang]), 'utf8'));
/** The text a person reads, with the no-break spaces as spaces. */
const plain = (text: string) => text.replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
const read = (element: HTMLElement | null | undefined) => plain(element?.text ?? '');
/**
 * The name of an icon by its drawing (the inner markup of the <svg>), as tests/unit/hub-icons.test.ts reads it; both sides
 * go through the parser, which writes the built `<path/>` and the source alike.
 */
const drawing = (inner: string) => parse(inner).toString().trim();
const NAME_OF = new Map(Object.entries(ICONS).map(([name, inner]) => [drawing(inner), name]));
const iconOf = (card: HTMLElement) => NAME_OF.get(drawing(card.querySelector('.fo-tool__icon svg')?.innerHTML ?? '')) ?? '';

describe('the lists and the texts of the home', () => {
  it('leave no digit typed in the texts of the home: every number is a placeholder (the promise "0 uploads" aside)', () => {
    const strings = (value: unknown, path: string, out: [string, string][] = []): [string, string][] => {
      if (typeof value === 'string') out.push([path, value]);
      else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) strings(item, `${path}.${key}`, out);
      return out;
    };
    for (const lang of LANGS) {
      const { h1Promise, title, description, ...rest } = TEXTS[lang].home;
      expect(h1Promise, lang).toMatch(/^0 /);
      for (const [path, text] of strings(rest, `${lang}.home`)) expect(text.replace(/\{\w+\}/g, ''), path).not.toMatch(/\d/);
      void title;
      void description;
    }
  });

  it('give the sections the registries: 8 image, 12 PDF, the 6 credit calculators of the specification in en and es, the 8 of Brazil in pt, 11 home and health, 1 QR', () => {
    expect(HOME_BAND_MONEY_IDS.en).toEqual([...HOME_MONEY_IDS.en, 'credit-card-payoff-calculator']);
    expect(HOME_BAND_MONEY_IDS.es).toEqual(HOME_BAND_MONEY_IDS.en);
    expect(HOME_BAND_MONEY_IDS.pt).toEqual(BR_CALC_IDS);
    const sizes = (lang: Lang) => Object.fromEntries(homeBands(lang).map((band) => [band.id, band.cards.length]));
    expect(sizes('en')).toEqual({ image: IMAGE_TOOL_IDS.length, pdf: PDF_TOOL_IDS.length, money: 6, life: HOUSE_CALC_IDS.length + HEALTH_CALC_IDS.length, qr: 1 });
    expect(sizes('pt')).toEqual({ image: 8, pdf: 12, money: 8, qr: 1 });
    expect(sizes('es')).toEqual({ image: 8, pdf: 12, money: 6, qr: 1 });
    // With the texts of the language every card has its words; without them (gate:prontidao) the same paths.
    for (const lang of LANGS) {
      const named = homeBands(lang, TEXTS[lang].common);
      expect(named.map((band) => band.cards.map((card) => card.href)), lang).toEqual(homeBands(lang).map((band) => band.cards.map((card) => card.href)));
      for (const card of named.flatMap((band) => band.cards)) {
        expect(card.name, `${lang} ${card.href}`).not.toBe('');
        expect(card.description, `${lang} ${card.href}`).not.toBe('');
      }
    }
  });
});

describe.runIf(BUILT)('the built home of each language', () => {
  it('says the count of the site in the H1: 46 tools in English, 29 in Portuguese and 35 in Spanish', () => {
    const h1 = { en: '46 tools. 0 uploads.', pt: '29 ferramentas. 0 uploads.', es: '35 herramientas. 0 subidas.' };
    for (const lang of LANGS) {
      const root = page(lang);
      expect(root.querySelectorAll('h1'), lang).toHaveLength(1);
      expect(read(root.querySelector('h1')), lang).toBe(h1[lang]);
    }
  });

  // Ajuste-home-cards (decision 12; DECISOES § 613): on the dist/ of the starting point it fails (the sections are bands of
  // chips, and no section.fo-section--cat exists).
  it('shows in each category section one ToolCard per tool of its list, with the H3 of the name, the description and the icon, and no band, chip or number of the F13b in <main>', () => {
    for (const lang of LANGS) {
      const root = page(lang);
      const bands = homeBands(lang, TEXTS[lang].common);
      const sections = root.querySelectorAll('main > section.fo-section.fo-section--cat');
      expect(sections.map((section) => section.getAttribute('aria-labelledby')), lang).toEqual(bands.map((band) => band.headingId));
      for (const band of bands) {
        const label = `${lang} ${band.headingId}`;
        const section = root.querySelector(`main > section.fo-section--cat[aria-labelledby="${band.headingId}"]`);
        // The H2 of the section is the heading of its texts, and its one sentence is a p.fo-prose before the grid.
        expect(section?.querySelector(`h2#${band.headingId}`), label).not.toBeNull();
        const kids = (section?.childNodes ?? []).filter((node): node is HTMLElement => node.nodeType === 1);
        expect(kids.map((kid) => `${kid.tagName.toLowerCase()}.${kid.classList.value.join('.')}`), label).toEqual(['h2.', 'p.fo-prose', 'ul.fo-grid', ...band.hubs.map(() => 'p.fo-more')]);
        const cards = section?.querySelectorAll('ul.fo-grid > li > a.fo-tool') ?? [];
        expect(cards.map((card) => card.getAttribute('href')), label).toEqual(band.cards.map((card) => card.href));
        cards.forEach((card, index) => {
          const want = band.cards[index];
          const where = `${label} ${want?.href}`;
          expect(card.querySelectorAll('h3.fo-tool__name'), where).toHaveLength(1);
          expect(read(card.querySelector('h3.fo-tool__name')), where).toBe(plain(want?.name ?? '-'));
          expect(read(card.querySelector('p.fo-tool__desc')), where).toBe(plain(want?.description ?? '-'));
          expect(card.querySelector('.fo-tool__icon')?.getAttribute('aria-hidden'), where).toBe('true');
          expect(iconOf(card), where).toBe(want?.icon);
          expect(card.classList.contains(`fo-cat--${want?.category}`), where).toBe(true);
        });
      }
      // Nothing of the bands of the F13b is left: no band, no chip, no number of a band.
      const main = root.querySelector('main');
      expect(main?.querySelectorAll('.fo-catband'), lang).toHaveLength(0);
      expect(main?.querySelectorAll('.fo-chip'), lang).toHaveLength(0);
      expect(main?.querySelectorAll('.fo-catband__num'), lang).toHaveLength(0);
      expect(main?.outerHTML ?? '', lang).not.toMatch(/fo-catband/);
    }
  });

  it('links each card to a page of the language in the order of its list, never to a preset, and each section to its hubs', () => {
    for (const lang of LANGS) {
      const root = page(lang);
      const presets = IMAGE_PRESET_IDS.flatMap((id) => routeById(id).paths[lang] ?? []);
      // Every card of the home, in the order of the page, is a path of the lists (homeCardPaths, the order of home-bands.ts).
      expect(root.querySelectorAll('main > section.fo-section--cat .fo-grid a.fo-tool').map((card) => card.getAttribute('href')), lang).toEqual(homeCardPaths(lang));
      for (const band of homeBands(lang)) {
        const section = root.querySelector(`main > section[aria-labelledby="${band.headingId}"]`);
        const hrefs = section?.querySelectorAll('.fo-grid a.fo-tool').map((card) => card.getAttribute('href') ?? '') ?? [];
        expect(hrefs, `${lang} ${band.id}`).toEqual(band.cards.map((card) => card.href));
        for (const href of hrefs) {
          expect(presets, `${lang} ${href}`).not.toContain(href);
          if (lang !== 'en') expect(href.startsWith(`/${lang}/`), `${lang} ${href}`).toBe(true);
        }
        expect(section?.querySelectorAll('p.fo-more a').map((link) => link.getAttribute('href')), `${lang} ${band.id}`).toEqual(band.hubs);
      }
    }
  });

  // Review F13b e-2 and f-6 (DECISOES § 591): the sentence of the money section speaks for every calculator of the hub, so it
  // says only what each of them does (its sentence, the Download PDF of the card and the Download CSV under it), never a
  // result some lack (the payment and the schedule of a loan, the CET of two of the eight in pt).
  it('says in the money section only what every money calculator of the language does', () => {
    const never: Record<Lang, RegExp> = { en: /\b(payment|interest|schedule)\b/i, pt: /\b(CET|parcela|juros|cronograma)\b/i, es: /\b(pago|intereses|tabla)\b/i };
    for (const lang of LANGS) {
      const more = read(page(lang).querySelector('main > section[aria-labelledby="money-home"] > p.fo-prose'));
      expect(more, lang).toMatch(/\bPDF\b.*\bCSV\b/);
      expect(more, lang).not.toMatch(never[lang]);
      const csv = { en: 'Download CSV', pt: 'Baixar CSV', es: 'Descargar CSV' }[lang];
      for (const id of HUB_MONEY_IDS[lang]) {
        const path = moneyPage(id, lang)?.path ?? `/(${id})/`;
        const html = readFileSync(join(DIST, path, 'index.html'), 'utf8');
        expect(html, `${lang} ${path}: o Baixar PDF do card`).toMatch(/class="fo-btn fo-btn--download[^"]*"/);
        expect(html, `${lang} ${path}: o ${csv}`).toContain(csv);
      }
    }
  });
});
