// How lint:texto fills the placeholders of the money texts (F4; DECISOES § 123): a guide with the numbers its
// page shows, a calculator text with realistic samples, so LanguageTool reads the sentence the person reads.
// The other texts keep the old filling (the placeholder's name, or the few samples of the F1a).
import { describe, expect, it } from 'vitest';
import { MONEY_SAMPLES, collectStrings, fileGuideOf, fillFor, isMoneyText } from '../../scripts/gates/lint-texto.ts';

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
