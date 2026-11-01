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
