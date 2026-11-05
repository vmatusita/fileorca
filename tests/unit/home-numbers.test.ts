// The home as the sea by category (F13b, decision 6; UX-03 B; F10 p-16 and p-17; DECISOES § 567 to § 571), read in the
// built home of each language: the H1 says the count of the site (46, 29 and 35, without the presets; § 540), and every
// number of the bands says what its source says, read here on its own: the measured ones from data/guides-measured.json,
// the examples from the page-example case of fixtures/calc/ (the oracle, never the engine), the exact one from qr.ts.
// No digit is typed in the texts of the home (each number is a {placeholder}); the chips are the registries'; and <main>
// has the words of the 3 ads by width (450 or more, and under the 595 where the lateral-2 comes near: § 361 and § 571).
// Run `pnpm build` first; FO_HOME_DIST=<folder> reads another build (the proof against the starting point).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { LANGS, type Lang } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { fileSize, fmt, groupDigits, percent } from '../../src/i18n/format.ts';
import { dollars, formatScaled, money, ratePercent } from '../../src/calc/parse.ts';
import { MAX_BYTES } from '../../src/tools/qr-code-generator/qr.ts';
import { wordsOf } from '../../src/ads/html.ts';
import { HOME_BAND_MONEY_IDS, homeBands } from '../../src/components/home-bands.ts';
import { BR_CALC_IDS, HOME_MONEY_IDS, HEALTH_CALC_IDS, HOUSE_CALC_IDS, HUB_MONEY_IDS, moneyPage } from '../../src/tools/calc/registry.ts';
import { IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';

const DIST = process.env['FO_HOME_DIST'] ?? 'dist';
const BUILT = existsSync(join(DIST, 'index.html'));
const HOME: Record<Lang, string> = { en: 'index.html', pt: 'pt/index.html', es: 'es/index.html' };
const page = (lang: Lang) => parse(readFileSync(join(DIST, HOME[lang]), 'utf8'));
/** The text a person reads, with the no-break spaces as spaces. */
const read = (element: HTMLElement | null | undefined) => (element?.text ?? '').replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
const nbsp = (text: string) => text.replace(/[  ]/g, ' ');

// ---- The sources, read on their own -------------------------------------------------------------------------------

interface MeasuredNumber {
  value: number;
  sample?: { files?: string[] };
}
const measuredFile = JSON.parse(readFileSync('data/guides-measured.json', 'utf8')) as { guides: Record<string, { numbers: Record<string, MeasuredNumber> }> };
const measured = (guide: string, name: string): MeasuredNumber => {
  const found = measuredFile.guides[guide]?.numbers[name];
  if (!found) throw new Error(`${guide}.${name}`);
  return found;
};
interface OracleCase {
  id: string;
  input: Record<string, unknown>;
  expected: Record<string, unknown>;
}
const example = (calculator: string): OracleCase => {
  const file = JSON.parse(readFileSync(`fixtures/calc/${calculator}.json`, 'utf8')) as { cases: OracleCase[] };
  const found = file.cases.find((one) => one.id === 'page-example');
  if (!found) throw new Error(`${calculator}: page-example`);
  return found;
};

const photosBefore = measured('guides-jpg-vs-png', 'jpgTotal');
const photosAfter = measured('guides-remove-location-from-photos', 'compressImageBytesChromium');
const photosAfterWebkit = measured('guides-remove-location-from-photos', 'compressImageBytesWebkit');
const photoCount = measured('guides-remove-location-from-photos', 'photos');
const pdfBefore = measured('guides-why-is-my-pdf-so-large', 'photosTotal');
const pdfAfter = measured('guides-why-is-my-pdf-so-large', 'photosRecommended');
const mortgage = example('mortgage-calculator');
const sacPrice = example('br-sac-price');
const paint = example('paint-calculator');
const lighterBy = (before: number, after: number) => Math.round((1 - after / before) * 100);

/** What each band must say, from the sources, as the language writes numbers. */
function expected(lang: Lang): Record<string, { count: string; num: string; say: string }> {
  const t = TEXTS[lang].home;
  const n = (value: number) => groupDigits(value, lang);
  const to = t.to.trim();
  const image = { photos: n(photoCount.value), percent: percent(lighterBy(photosBefore.value, photosAfter.value), lang) };
  const pdf = { percent: percent(lighterBy(pdfBefore.value, pdfAfter.value), lang) };
  const down = mortgage.input['down'] as { rate: number };
  const moneyValues =
    lang === 'pt'
      ? {
          diff: dollars(Number(sacPrice.expected['interestDiff']), lang),
          loan: dollars(Number(sacPrice.expected['loan']), lang),
          months: n(Number(sacPrice.input['months'])),
          rate: ratePercent(Number(sacPrice.input['rate']), lang),
        }
      : {
          payment: money(Number(mortgage.expected['monthlyTotal']), lang),
          price: dollars(Number(mortgage.input['price']), lang),
          down: ratePercent(down.rate, lang),
          rate: ratePercent(Number(mortgage.input['rate']), lang),
          years: n(Number(mortgage.input['years'])),
        };
  const life = {
    gallons: formatScaled(Number(paint.expected['gallons']), 2, lang),
    coats: n(Number(paint.input['coats'])),
    perimeter: formatScaled(Number(paint.input['perimeter']), 2, lang),
    height: formatScaled(Number(paint.input['height']), 2, lang),
  };
  const bands: Record<string, { count: string; num: string; say: string }> = {
    tools: { count: fmt(t.image.count, { n: n(8) }), num: `${fileSize(photosBefore.value, lang)} ${to} ${fileSize(photosAfter.value, lang)}`, say: fmt(t.image.say, image) },
    'pdf-home': { count: fmt(t.pdf.count, { n: n(12) }), num: `${fileSize(pdfBefore.value, lang)} ${to} ${fileSize(pdfAfter.value, lang)}`, say: fmt(t.pdf.say, pdf) },
    'money-home': { count: fmt(t.money.count, { n: n(lang === 'pt' ? 8 : 14) }), num: fmt(t.money.num ?? '', moneyValues), say: fmt(t.money.say, moneyValues) },
  };
  if (t.life) bands['life-home'] = { count: fmt(t.life.count, { n: n(11) }), num: fmt(t.life.num ?? '', life), say: fmt(t.life.say, life) };
  if (t.qr) bands['qr-home'] = { count: fmt(t.qr.count, { n: n(1) }), num: fmt(t.qr.num ?? '', { max: n(MAX_BYTES) }), say: t.qr.say };
  return bands;
}

describe('the sources of the home numbers', () => {
  it('measure the same 3 phone photos twice: their total in "JPG or PNG" and their Compress image result in "Remove location"', () => {
    const files = photosBefore.sample?.files ?? [];
    expect(files).toHaveLength(3);
    expect(photosAfter.sample?.files).toEqual(files);
    expect(photoCount.value).toBe(3);
    // The same bytes in both browsers, so the home says one number.
    expect(photosAfterWebkit.value).toBe(photosAfter.value);
    expect([nbsp(fileSize(photosBefore.value, 'en')), nbsp(fileSize(photosAfter.value, 'en')), lighterBy(photosBefore.value, photosAfter.value)]).toEqual(['9.3 MB', '2.5 MB', 73]);
    expect([nbsp(fileSize(pdfBefore.value, 'en')), nbsp(fileSize(pdfAfter.value, 'en')), lighterBy(pdfBefore.value, pdfAfter.value)]).toEqual(['2.9 MB', '950 KB', 67]);
  });

  it('take the examples of the oracle: $2,396.20 a month and R$ 284.596 less interest', () => {
    expect(money(Number(mortgage.expected['monthlyTotal']), 'en')).toBe('$2,396.20');
    expect(nbsp(dollars(Number(sacPrice.expected['interestDiff']), 'pt'))).toBe('R$ 284.596');
    expect(formatScaled(Number(paint.expected['gallons']), 2, 'en')).toBe('1.9');
    expect(groupDigits(MAX_BYTES, 'en')).toBe('1,273');
  });

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

  it('give the bands the registries: 8 image, 12 PDF, the 6 credit calculators of the specification in en and es, the 8 of Brazil in pt, 11 home and health, 1 QR', () => {
    expect(HOME_BAND_MONEY_IDS.en).toEqual([...HOME_MONEY_IDS.en, 'credit-card-payoff-calculator']);
    expect(HOME_BAND_MONEY_IDS.es).toEqual(HOME_BAND_MONEY_IDS.en);
    expect(HOME_BAND_MONEY_IDS.pt).toEqual(BR_CALC_IDS);
    const sizes = (lang: Lang) => Object.fromEntries(homeBands(lang).map((band) => [band.id, band.chips.length]));
    expect(sizes('en')).toEqual({ image: IMAGE_TOOL_IDS.length, pdf: PDF_TOOL_IDS.length, money: 6, life: HOUSE_CALC_IDS.length + HEALTH_CALC_IDS.length, qr: 1 });
    expect(sizes('pt')).toEqual({ image: 8, pdf: 12, money: 8, qr: 1 });
    expect(sizes('es')).toEqual({ image: 8, pdf: 12, money: 6, qr: 1 });
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

  it('says in every band the count, the number and the line of its source', () => {
    for (const lang of LANGS) {
      const root = page(lang);
      const want = expected(lang);
      const bands = root.querySelectorAll('main > section.fo-catband');
      expect(bands.map((band) => band.getAttribute('aria-labelledby')), lang).toEqual(Object.keys(want));
      for (const band of bands) {
        const id = band.getAttribute('aria-labelledby') ?? '';
        const label = `${lang} ${id}`;
        expect(read(band.querySelector('.fo-catband__count')), label).toBe(nbsp(want[id]?.count ?? ''));
        expect(read(band.querySelector('.fo-catband__num')), label).toBe(nbsp(want[id]?.num ?? ''));
        expect(read(band.querySelector('.fo-catband__say')), label).toBe(nbsp(want[id]?.say ?? ''));
        // Every number of the band is one of its source's (the chips and the links are names).
        const numbers = (read(band.querySelector('.fo-catband__fact')).match(/\d[\d.,]*/g) ?? []).map((number) => number.replace(/[.,]$/, ''));
        const sourced = (read(band.querySelector('.fo-catband__num')) + ' ' + nbsp(want[id]?.say ?? '') + ' ' + nbsp(want[id]?.num ?? '')).match(/\d[\d.,]*/g) ?? [];
        for (const number of numbers) expect(sourced.map((one) => one.replace(/[.,]$/, '')), `${label}: ${number}`).toContain(number);
      }
    }
  });

  it('links each chip to a tool of the registries, in the order of the band, and the bands to their hubs', () => {
    for (const lang of LANGS) {
      const root = page(lang);
      for (const band of homeBands(lang)) {
        const section = root.querySelector(`main > section[aria-labelledby="${band.headingId}"]`);
        expect(section?.querySelectorAll('.fo-catband__chips a.fo-chip').map((chip) => chip.getAttribute('href')), `${lang} ${band.id}`).toEqual(band.chips.map((chip) => chip.href));
        expect(section?.querySelectorAll('.fo-catband__links a').map((link) => link.getAttribute('href')), `${lang} ${band.id}`).toEqual(band.hubs);
      }
    }
  });

  // Review F13b e-2 and f-6 (DECISOES § 591): the sentence more of the money band speaks for every calculator of the hub, so it
  // says only what each of them does (its sentence, the Download PDF of the card and the Download CSV under it), never a result
  // some lack (the payment and the schedule of a loan, the CET of two of the eight in pt); and the paint example is said with
  // the doors and windows it takes off (the 1.9 gallons are after them).
  it('says in the money band only what every money calculator of the language does, and the paint example after its doors and windows', () => {
    const never: Record<Lang, RegExp> = { en: /\b(payment|interest|schedule)\b/i, pt: /\b(CET|parcela|juros|cronograma)\b/i, es: /\b(pago|intereses|tabla)\b/i };
    for (const lang of LANGS) {
      const more = read(page(lang).querySelector('main > section[aria-labelledby="money-home"] .fo-catband__more'));
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
    expect(Number(paint.input['doors'])).toBeGreaterThan(0);
    expect(Number(paint.input['windows'])).toBeGreaterThan(0);
    expect(read(page('en').querySelector('main > section[aria-labelledby="life-home"] .fo-catband__say'))).toMatch(/\bafter the doors and windows\b/);
    // Review F13b e-3: the PRICE is feminine in the rest of the site ("a tabela PRICE", "Na PRICE: …").
    expect(read(page('pt').querySelector('main > section[aria-labelledby="money-home"] .fo-catband__say'))).toMatch(/\bna PRICE\b/);
  });

  it('has the words of the 3 ads by width in <main>: 450 or more, under the 595 of the lateral-2, 75 to 105 of them in the sentences more', () => {
    for (const lang of LANGS) {
      const html = readFileSync(join(DIST, HOME[lang]), 'utf8');
      const main = /<main\b[^>]*>([\s\S]*?)<\/main>/.exec(html)?.[1] ?? '';
      const words = wordsOf(main);
      expect(words, lang).toBeGreaterThanOrEqual(450);
      expect(words, lang).toBeLessThan(595);
      const more = page(lang).querySelectorAll('.fo-catband__more').reduce((sum, line) => sum + read(line).split(' ').length, 0);
      expect(more, lang).toBeGreaterThanOrEqual(75);
      expect(more, lang).toBeLessThanOrEqual(105);
    }
  });
});
