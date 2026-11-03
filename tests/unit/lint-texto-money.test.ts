// How lint:texto fills the placeholders of the money texts (F4; DECISOES § 123): a guide with the numbers its
// page shows, a calculator text with realistic samples, so LanguageTool reads the sentence the person reads.
// The other texts keep the old filling (the placeholder's name, or the few samples of the F1a).
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  LIFE_SAMPLES,
  LIFE_SAMPLES_BY_KEY,
  MONEY_SAMPLES,
  MONEY_SAMPLES_BY_LANG,
  MONEY_SAMPLES_BY_PAGE,
  QR_SAMPLES_BY_LANG,
  collectStrings,
  fileGuideOf,
  fillFor,
  isLifeText,
  isMoneyText,
  isQrText,
  moneyGuideOf,
} from '../../scripts/gates/lint-texto.ts';
import { GUIDE_IDS, LIFE_CALC_IDS } from '../../src/tools/calc/registry.ts';
import { GUIDE_FACTS } from '../../src/tools/calc/guides.ts';
import { MEASURED, VARIANTS, placeholdersIn, resolvePlaceholder } from '../../src/tools/guides/measured.ts';
import { longDate } from '../../src/i18n/dates.ts';
import type { FileGuideTexts, FileGuidesSharedTexts } from '../../src/i18n/types.ts';

describe('lint:texto and the money texts', () => {
  it('knows which files are money texts', () => {
    for (const file of [
      'src/tools/mortgage-calculator/i18n/en.ts',
      'src/tools/mortgage-calculator/presets/biweekly/i18n/en.ts',
      'src/tools/calc/i18n/en.ts',
      'src/i18n/en/money-calculators.ts',
      'src/i18n/en/guide-refinance-break-even.ts',
    ])
      expect(isMoneyText(file), file).toBe(true);
    for (const file of ['src/tools/compress-image/i18n/en.ts', 'src/tools/image/i18n/en.ts', 'src/i18n/en/privacy.ts', 'src/i18n/pt/home.ts']) expect(isMoneyText(file), file).toBe(false);
  });

  // F6 (DECISOES § 227): the Brazilian calculators, the money hubs of pt and es and the Spanish calculators are money
  // texts, filled in the format of their language.
  it('knows the money texts of Portuguese and Spanish and fills them in their format', async () => {
    for (const file of ['src/tools/br-sac-price/i18n/pt.ts', 'src/i18n/pt/money-calculators.ts', 'src/i18n/es/money-calculators.ts', 'src/tools/mortgage-calculator/i18n/es.ts', 'src/tools/calc/i18n/pt.ts'])
      expect(isMoneyText(file), file).toBe(true);
    for (const file of ['src/tools/br-sac-price.ts', 'src/i18n/pt/privacy.ts', 'src/tools/compress-image/i18n/es.ts']) expect(isMoneyText(file), file).toBe(false);
    const pt = await fillFor('src/tools/br-sac-price/i18n/pt.ts');
    expect(collectStrings({ a: 'Você paga {total} em {time}, com juros de {rate}.' }, '', [], pt)).toEqual(['Você paga R$ 1.234,56 em 3 anos e 4 meses, com juros de 6,5%.']);
    const es = await fillFor('src/tools/mortgage-calculator/i18n/es.ts');
    expect(collectStrings({ a: 'Pagas {total} en {time} a {rate}.' }, '', [], es)).toEqual(['Pagas $1,234.56 en 3 años 4 meses a 6.5\u00a0%.']);
    const plain = await fillFor('src/tools/compress-image/i18n/es.ts');
    expect(collectStrings({ a: 'Un {percent} más ligera.' }, '', [], plain)).toEqual(['Un 68\u00a0% más ligera.']);
  });

  it('fills a guide with the numbers the engines give its page', async () => {
    const fill = await fillFor('src/i18n/en/guide-15-vs-30-year-mortgage.ts');
    expect(collectStrings({ a: 'The 15-year loan costs {p15}: {more} more each month, on {date}.' }, '', [], fill)).toEqual([
      'The 15-year loan costs $2,613.32: $717 more each month, on October 31, 2026.',
    ]);
  });

  it('fills a calculator text with samples, and an unknown name with an amount of money', async () => {
    const fill = await fillFor('src/tools/refinance-calculator/i18n/en.ts');
    expect(collectStrings({ a: 'B costs {paymentDiff} a month over {time}; you pay {x}.' }, '', [], fill)).toEqual([
      `B costs ${MONEY_SAMPLES['paymentDiff']} a month over ${MONEY_SAMPLES['time']}; you pay $1,234.`,
    ]);
  });

  it('fills a file guide (F5b) with its measured values and official facts, and never reads it as money (DECISOES § 189)', async () => {
    expect(isMoneyText('src/i18n/en/guide-heic-to-jpg-on-windows.ts')).toBe(false);
    expect(fileGuideOf('src/i18n/en/guide-heic-to-jpg-on-windows.ts')).toBe('guides-heic-to-jpg-on-windows');
    expect(fileGuideOf('src/i18n/en/guide-refinance-break-even.ts')).toBeUndefined();
    const fill = await fillFor('src/i18n/en/guide-heic-to-jpg-on-windows.ts');
    const [line] = collectStrings({ a: 'Our {files} photos grew by {ratioTotalChromium_more}; the extension costs {hevcPrice}, measured on {date}.' }, '', [], fill);
    expect(line).not.toMatch(/\{|\$1,234|ratioTotal/);
    expect(line).toMatch(/^Our \d+ photos grew by \d+%; the extension costs \$\d\.\d\d, measured on [A-Z][a-z]+ \d{1,2}, \d{4}\.$/);
  });

  it('keeps the old filling for the other texts', async () => {
    const fill = await fillFor('src/tools/compress-image/i18n/en.ts');
    expect(collectStrings({ a: 'Made by {name}: {count} files' }, '', [], fill)).toEqual(['Made by Victor: count files']);
  });
});

// F7 (decision 11): the home and health calculators and their hubs are calculator texts, but not money. Their samples are
// measures, counts and dates from the page examples of the oracle, apart from the money samples, where a name like "{x}"
// is an amount of money.
describe('lint:texto and the home and health texts (F7)', () => {
  const LIFE_FILES = [...LIFE_CALC_IDS.map((id) => `src/tools/${id}/i18n/en.ts`), 'src/i18n/en/home-calculators.ts', 'src/i18n/en/health-calculators.ts'];

  it('knows the texts of the 11 calculators and the two hubs, and never takes them for money', () => {
    expect(LIFE_FILES).toHaveLength(13);
    for (const file of LIFE_FILES) {
      expect(existsSync(file), file).toBe(true);
      expect(isLifeText(file), file).toBe(true);
      expect(isMoneyText(file), file).toBe(false);
    }
    // Controls: the money calculators, the shared calculator texts, the money hub and the other texts are not.
    for (const file of ['src/tools/mortgage-calculator/i18n/en.ts', 'src/tools/calc/i18n/en.ts', 'src/i18n/en/money-calculators.ts', 'src/tools/br-sac-price/i18n/pt.ts', 'src/i18n/en/home.ts', 'src/tools/compress-image/i18n/en.ts', 'src/tools/bmi-calculator.ts']) {
      expect(isLifeText(file), file).toBe(false);
    }
    expect(isMoneyText('src/tools/mortgage-calculator/i18n/en.ts')).toBe(true);
    expect(isMoneyText('src/tools/calc/i18n/en.ts')).toBe(true);
  });

  it('fills every placeholder of those texts with a sample of its own, never with money and never with the fallback', async () => {
    let filled = 0;
    for (const file of LIFE_FILES) {
      const texts = ((await import(pathToFileURL(resolve(file)).href)) as { default: unknown }).default;
      const names = new Set<string>();
      collectStrings(texts, '', [], (name) => {
        names.add(name);
        return '';
      });
      for (const name of names) expect(Object.hasOwn(LIFE_SAMPLES, name), `${file}: {${name}} has no sample`).toBe(true);
      const fill = await fillFor(file);
      for (const line of collectStrings(texts, '', [], fill)) {
        expect(line, file).not.toMatch(/\{\w+\}|\$\d/);
        filled += 1;
      }
    }
    expect(filled).toBeGreaterThan(100);
  });

  it('reads each sentence as its page shows it: lengths, counts, the singular for one, dates by extenso', async () => {
    const tile = await fillFor('src/tools/tile-calculator/i18n/en.ts');
    expect(collectStrings({ size: '{x} × {y} in', sentence: 'Counted for {size} tiles with {waste}% extra for cuts. Boxes of {per} to buy: {boxes}.' }, '', [], tile)).toEqual([
      '15 × 12 in',
      'Counted for 12 × 12 in tiles with 10% extra for cuts. Boxes of 10 to buy: 14.',
    ]);
    const due = await fillFor('src/tools/due-date-calculator/i18n/en.ts');
    expect(collectStrings({ week: '{n} week', weeks: '{n} weeks', day: '{n} day', days: '{n} days', age: '{weeks} and {days}' }, '', [], due)).toEqual([
      '1 week',
      '2 weeks',
      '1 day',
      '2 days',
      '8 weeks and 1 day',
    ]);
    const square = await fillFor('src/tools/square-footage-calculator/i18n/en.ts');
    expect(collectStrings({ row: 'Area {n}', sentence: 'That is {yards} square yards. Areas added up: {n}.' }, '', [], square)).toEqual(['Area 2', 'That is 20.00 square yards. Areas added up: 2.']);
    const fat = await fillFor('src/tools/body-fat-calculator/i18n/en.ts');
    expect(collectStrings({ a: 'an estimated {percent}% body fat' }, '', [], fat)).toEqual(['an estimated 25.9% body fat']);
    // A name with no sample reads as a plain number in these texts, never as money.
    expect(collectStrings({ a: 'About {unknown} sq ft.' }, '', [], square)).toEqual(['About 12 sq ft.']);
  });

  it('leaves the money texts as they were: the same name still reads as money there (the other side of the samples)', async () => {
    const refinance = await fillFor('src/tools/refinance-calculator/i18n/en.ts');
    expect(collectStrings({ a: 'You would pay {x} less a month.', b: '{n} payments' }, '', [], refinance)).toEqual(['You would pay $1,234 less a month.', '12 payments']);
    const debt = await fillFor('src/tools/debt-payoff-calculator/i18n/en.ts');
    expect(collectStrings({ a: 'pays {x} less interest', b: 'Area {area}' }, '', [], debt)).toEqual(['pays $1,234 less interest', 'Area $1,234']);
    // The F7 samples are not money samples: no money sample was added or changed for them.
    for (const name of ['x', 'y', 'area', 'size', 'percent', 'from', 'to', 'next', 'base', 'per', 'buy']) expect(Object.hasOwn(MONEY_SAMPLES, name), name).toBe(false);
    expect(MONEY_SAMPLES['n']).toBe('12');
    // And the key-dependent sample of the singular never reaches a money text.
    expect(collectStrings({ week: '{n} week' }, '', [], refinance)).toEqual(['12 week']);
    expect(LIFE_SAMPLES_BY_KEY).toEqual({ week: { n: '1' }, day: { n: '1' } });
  });
});

// The languages adjustment: the Spanish pages of the nine calculators and four presets that had none, the five money guides
// in Spanish, the ten file guides in Portuguese and Spanish and the QR code generator in the three languages, each filled
// the way its page writes the sentence, in its language.
describe('lint:texto and the texts of the languages adjustment', () => {
  /** The folders of the 13 calculator and preset texts new in Spanish (src/tools/<folder>/i18n/es.ts). */
  const NEW_ES = [
    'auto-loan-calculator',
    'refinance-calculator',
    'home-affordability-calculator',
    'loan-amortization-calculator',
    'debt-consolidation-calculator',
    'rent-vs-buy-calculator',
    'savings-goal-calculator',
    'simple-interest-calculator',
    'apr-to-apy-calculator',
    'mortgage-calculator/presets/extra-payments',
    'mortgage-calculator/presets/biweekly',
    'mortgage-calculator/presets/15-vs-30-year',
    'loan-amortization-calculator/presets/balloon-payment',
  ];
  /**
   * The placeholders of those texts that are an amount of money, read as one by the Spanish fallback ("$1,234.56"). Any
   * other name needs a Spanish sample: a new placeholder that is neither fails the test below until it is put on one side.
   */
  const MONEY_NAMES = new Set(['financed', 'interest', 'total', 'x', 'costs', 'pi', 'loan', 'fee', 'current', 'minimum', 'buyer', 'renter', 'deposit', 'final', 'deposited', 'goal', 'principal', 'half', 'payment', 'housing', 'saved']);
  const es = MONEY_SAMPLES_BY_LANG['es'];

  const namesOf = async (file: string): Promise<Set<string>> => {
    const texts = ((await import(pathToFileURL(resolve(file)).href)) as { default: unknown }).default;
    const names = new Set<string>();
    collectStrings(texts, '', [], (name) => {
      names.add(name);
      return '';
    });
    return names;
  };

  it('gives every placeholder of the 13 new Spanish calculator and preset texts that is not money a Spanish sample', async () => {
    let checked = 0;
    for (const folder of NEW_ES) {
      for (const lang of ['en', 'es'] as const) {
        const file = `src/tools/${folder}/i18n/${lang}.ts`;
        expect(existsSync(file), file).toBe(true);
        expect(isMoneyText(file), file).toBe(true);
        for (const name of await namesOf(file)) {
          const sample = MONEY_SAMPLES_BY_PAGE['es']?.[folder]?.[name] ?? es?.samples[name];
          if (MONEY_NAMES.has(name) && sample === undefined) continue;
          expect(sample, `${file}: {${name}} has no Spanish sample`).toBeDefined();
          checked += 1;
        }
      }
      // And the Spanish fill never leaves a placeholder.
      for (const line of collectStrings(((await import(pathToFileURL(resolve(`src/tools/${folder}/i18n/es.ts`)).href)) as { default: unknown }).default, '', [], await fillFor(`src/tools/${folder}/i18n/es.ts`))) {
        expect(line, folder).not.toMatch(/\{\w+\}/);
      }
    }
    expect(checked).toBeGreaterThan(30);
    expect(es?.fallback).toBe('$1,234.56');
  });

  it('reads each Spanish sentence as its page shows it: percents with a no-break space, directions, durations', async () => {
    const affordability = await fillFor('src/tools/home-affordability-calculator/i18n/es.ts');
    expect(collectStrings({ a: 'Con {rule}, tu vivienda puede costar {housing} al mes.', b: 'Límite de vivienda, {front}', c: 'Límite de deuda total, {back}' }, '', [], affordability)).toEqual([
      'Con el límite de vivienda del 28\u00a0%, tu vivienda puede costar $1,234.56 al mes.',
      'Límite de vivienda, 28\u00a0%',
      'Límite de deuda total, 36\u00a0%',
    ]);
    const refinance = await fillFor('src/tools/refinance-calculator/i18n/es.ts');
    expect(collectStrings({ a: 'B cuesta {paymentDiff} al mes y {totalDiff} en total.', b: 'Mes {n}' }, '', [], refinance)).toEqual(['B cuesta $308 menos al mes y $3,490 más en total.', 'Mes 12']);
    const fifteen = await fillFor('src/tools/mortgage-calculator/presets/15-vs-30-year/i18n/es.ts');
    expect(collectStrings({ a: 'B cuesta {paymentDiff} al mes y {interestEffect}.' }, '', [], fifteen)).toEqual(['B cuesta $308 menos al mes y ahorra $212,238 de intereses.']);
    const extra = await fillFor('src/tools/mortgage-calculator/presets/extra-payments/i18n/es.ts');
    expect(collectStrings({ a: 'El préstamo termina en {time} en vez de {base}, {saved} antes.' }, '', [], extra)).toEqual(['El préstamo termina en 3 años 4 meses en vez de 30 años, 3 años 4 meses antes.']);
  });

  it('fills a name by its page where it means another thing on another calculator, in Spanish only', async () => {
    // "{years}": a count before the word on Rent vs buy, a duration on the mortgage.
    const rent = await fillFor('src/tools/rent-vs-buy-calculator/i18n/es.ts');
    expect(collectStrings({ a: 'Después de {years} años, comprar te deja {buyer}.' }, '', [], rent)).toEqual(['Después de 10 años, comprar te deja $1,234.56.']);
    const mortgage = await fillFor('src/tools/mortgage-calculator/i18n/es.ts');
    expect(collectStrings({ a: 'En {years} al {rate}, pagarás {total}.' }, '', [], mortgage)).toEqual(['En 30 años al 6.5\u00a0%, pagarás $1,234.56.']);
    // "{saved}": the time saved on the biweekly preset, an amount on Savings goal.
    const biweekly = await fillFor('src/tools/mortgage-calculator/presets/biweekly/i18n/es.ts');
    expect(collectStrings({ a: 'B termina el préstamo {saved} antes.' }, '', [], biweekly)).toEqual(['B termina el préstamo 3 años 4 meses antes.']);
    const goal = await fillFor('src/tools/savings-goal-calculator/i18n/es.ts');
    expect(collectStrings({ a: 'Ahorras {saved} hasta {final}.' }, '', [], goal)).toEqual(['Ahorras $1,234.56 hasta $1,234.56.']);
    // English keeps the samples of the F4 for the same files.
    expect(Object.keys(MONEY_SAMPLES_BY_PAGE)).toEqual(['es']);
    const rentEn = await fillFor('src/tools/rent-vs-buy-calculator/i18n/en.ts');
    expect(collectStrings({ a: 'After {years} years' }, '', [], rentEn)).toEqual([`After ${MONEY_SAMPLES['years']} years`]);
  });

  it('knows the five money guides in Spanish and fills them with the facts the engines give the Spanish page', async () => {
    for (const id of GUIDE_IDS) {
      const slug = id.replace(/^guides-/, '');
      const file = `src/i18n/es/guide-${slug}.ts`;
      expect(existsSync(file), file).toBe(true);
      expect(isMoneyText(file), file).toBe(true);
      expect(moneyGuideOf(file), file).toEqual({ id, lang: 'es' });
      expect(moneyGuideOf(`src/i18n/en/guide-${slug}.ts`), file).toEqual({ id, lang: 'en' });
      // No US money guide exists in Portuguese.
      expect(moneyGuideOf(`src/i18n/pt/guide-${slug}.ts`), file).toBeUndefined();
      const fill = await fillFor(file);
      const facts = GUIDE_FACTS[id]('es').facts;
      for (const [name, value] of Object.entries(facts)) expect(fill(name, ''), `${id} {${name}}`).toBe(value);
      // The words of the table: "mes {n}", "Los ahorros rinden {rate}".
      expect(fill('n', ''), id).toBe('12');
      expect(fill('rate', ''), id).toBe(facts['rate'] ?? '6.5\u00a0%');
      for (const line of collectStrings(((await import(pathToFileURL(resolve(file)).href)) as { default: unknown }).default, '', [], fill)) expect(line, file).not.toMatch(/\{\w+\}/);
    }
    // The Spanish facts are written in Spanish: the rate of the 15 vs 30-year guide has the no-break space before "%".
    const fifteen = await fillFor('src/i18n/es/guide-15-vs-30-year-mortgage.ts');
    expect(fifteen('rate', '')).toMatch(/\d\u00a0%$/);
    expect((await fillFor('src/i18n/en/guide-15-vs-30-year-mortgage.ts'))('rate', '')).toMatch(/\d%$/);
    // A file guide is never a money guide, in any language.
    expect(moneyGuideOf('src/i18n/es/guide-jpg-vs-png.ts')).toBeUndefined();
  });

  it('fills a file guide of Portuguese and Spanish with its measured values in the format of its language (DECISOES § 213)', async () => {
    const id = 'guides-heic-to-jpg-on-windows';
    for (const lang of ['pt', 'es'] as const) {
      const file = `src/i18n/${lang}/guide-heic-to-jpg-on-windows.ts`;
      expect(fileGuideOf(file), file).toBe(id);
      expect(isMoneyText(file), file).toBe(false);
      const texts = ((await import(pathToFileURL(resolve(file)).href)) as { default: FileGuideTexts }).default;
      const shared = ((await import(pathToFileURL(resolve(`src/i18n/${lang}/file-guides.ts`)).href)) as { default: FileGuidesSharedTexts }).default;
      const fill = await fillFor(file);
      const fillEn = await fillFor('src/i18n/en/guide-heic-to-jpg-on-windows.ts');
      expect(fill('date', ''), lang).toBe(longDate(MEASURED.measuredOn, lang));
      let differs = 0;
      let resolved = 0;
      for (const name of placeholdersIn(texts)) {
        const found = resolvePlaceholder(id, name);
        if (!found) continue;
        resolved += 1;
        expect(fill(name, ''), `${lang} {${name}}`).toBe(VARIANTS[found.variant](found.number, { lang, shared }));
        if (fill(name, '') !== fillEn(name, '')) differs += 1;
      }
      expect(resolved, lang).toBeGreaterThan(3);
      // At least one number reads differently from English ("2,4 MB", "68 %", a no-break space before a unit).
      expect(differs, lang).toBeGreaterThan(0);
      for (const line of collectStrings(texts, '', [], fill)) expect(line, file).not.toMatch(/\{\w+\}/);
    }
    // A file guide's file outside FILE_GUIDE_IDS, or in another folder, is not one.
    expect(fileGuideOf('src/i18n/pt/guide-nothing.ts')).toBeUndefined();
    expect(fileGuideOf('src/i18n/fr/guide-jpg-vs-png.ts')).toBeUndefined();
    expect(fileGuideOf('src/tools/jpg-vs-png/i18n/pt.ts')).toBeUndefined();
  });

  it('fills the QR code generator with its limit and sizes in the digits of each language', async () => {
    const strings = { help: '{max}', count: '{count} / {max}', px: '{side} px' };
    for (const [lang, max] of [['en', '1,273'], ['pt', '1.273'], ['es', '1,273']] as const) {
      const file = `src/tools/qr-code-generator/i18n/${lang}.ts`;
      expect(isQrText(file), file).toBe(true);
      expect(isMoneyText(file), file).toBe(false);
      expect(collectStrings(strings, '', [], await fillFor(file)), lang).toEqual([max, `42 / ${max}`, '512 px']);
      expect(QR_SAMPLES_BY_LANG[lang]?.['max'], lang).toBe(max);
      for (const line of collectStrings(((await import(pathToFileURL(resolve(file)).href)) as { default: unknown }).default, '', [], await fillFor(file))) expect(line, file).not.toMatch(/\{\w+\}/);
    }
    // The other texts keep their filling: "{count}" and "{max}" of an image tool are not the QR samples.
    expect(isQrText('src/tools/compress-image/i18n/pt.ts')).toBe(false);
    expect(collectStrings({ a: '{count} de {max}' }, '', [], await fillFor('src/tools/compress-image/i18n/pt.ts'))).toEqual(['count de max']);
  });
});
