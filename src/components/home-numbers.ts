// The numbers of the home's bands (F13b, decision 6; UX-03 B; F10 p-16; DECISOES § H-2 and § H-3), read at build time from
// their source, never typed in a text: the page passes each one to a {placeholder} of src/i18n/<lang>/home.ts. Three kinds
// of source, as the specification of home-b.html says:
//   - measured: data/guides-measured.json (pnpm guias:medir). The image band uses the 3 real phone photos of the
//     fixtures, measured twice: their total in the guide "JPG or PNG" (jpgTotal) and their size after Compress image with
//     the default setting in the guide "Remove location from photos" (compressImageBytes, the same in Chromium and
//     WebKit). The PDF band uses the PDF of photos of the guide "Why is my PDF so large?" and its size in the recommended
//     mode of Compress PDF.
//   - example: the result the calculator shows when it opens, computed here by the calculator's own definition from its
//     example (`initial`), the same that tests/unit/calc-oracle.test.ts holds to the page-example case of fixtures/calc/.
//   - exact: what the tool does by specification (the 1,273 bytes of a QR code of version 40 at error correction H).
// Node only, like tool-count.ts: never import this from an island. tests/unit/home-numbers.test.ts reads the built home
// and checks every number against the source on its own.
import { fileSize, groupDigits, percent } from '../i18n/format.ts';
import type { Lang } from '../i18n/routes.ts';
import { dollars, formatScaled, money, ratePercent } from '../calc/parse.ts';
import { mortgageDef } from '../tools/calc/defs/mortgage.ts';
import { brSacPriceDef } from '../tools/calc/defs/br.ts';
import { paintDef } from '../tools/calc/defs/house.ts';
import { MAX_BYTES } from '../tools/qr-code-generator/qr.ts';
import { MEASURED } from '../tools/guides/measured.ts';
import type { MortgageResult } from '../calc/loans.ts';
import type { SacPriceResult } from '../calc/br.ts';
import type { PaintResult } from '../calc/home.ts';

/** A number of guides-measured.json, by guide and name (the build fails when it is gone). */
function measured(guide: string, name: string): number {
  const value = (MEASURED.guides as Record<string, { numbers: Record<string, { value: unknown }> }>)[guide]?.numbers[name]?.value;
  if (typeof value !== 'number') throw new Error(`home-numbers: ${guide}.${name} não é um número em data/guides-measured.json`);
  return value;
}

/** The raw values of the bands, the same in every language. */
export interface HomeValues {
  image: { photos: number; before: number; after: number };
  pdf: { before: number; after: number };
  mortgage: { price: number; downRate: number; rate: number; years: number; monthlyTotal: number };
  sacPrice: { loan: number; months: number; rate: number; interestDiff: number };
  paint: { gallons: number; coats: number; perimeter: number; height: number };
  qr: { max: number };
}

/** Reads every value of the bands from its source. */
export function homeValues(): HomeValues {
  const mortgageExample = mortgageDef.initial;
  const mortgage = mortgageDef.compute(mortgageDef.toInput(mortgageExample)) as MortgageResult;
  const sacExample = brSacPriceDef.initial;
  const sacPrice = brSacPriceDef.compute(brSacPriceDef.toInput(sacExample)) as SacPriceResult;
  const paintExample = paintDef.initial;
  const paint = paintDef.compute(paintDef.toInput(paintExample)) as PaintResult;
  if (!('gallons' in paint)) throw new Error('home-numbers: o exemplo da Paint calculator não tem galões');
  return {
    image: {
      photos: measured('guides-remove-location-from-photos', 'photos'),
      before: measured('guides-jpg-vs-png', 'jpgTotal'),
      after: measured('guides-remove-location-from-photos', 'compressImageBytesChromium'),
    },
    pdf: {
      before: measured('guides-why-is-my-pdf-so-large', 'photosTotal'),
      after: measured('guides-why-is-my-pdf-so-large', 'photosRecommended'),
    },
    mortgage: {
      price: Number(mortgageExample['p']),
      downRate: Number(mortgageExample['dp']),
      rate: Number(mortgageExample['r']),
      years: Number(mortgageExample['t']),
      monthlyTotal: mortgage.monthlyTotal,
    },
    sacPrice: { loan: sacPrice.loan, months: Number(sacExample['n']), rate: Number(sacExample['r']), interestDiff: sacPrice.interestDiff },
    paint: { gallons: paint.gallons, coats: Number(paintExample['co']), perimeter: Number(paintExample['pe']), height: Number(paintExample['he']) },
    qr: { max: MAX_BYTES },
  };
}

/** How much lighter a file got, in whole percent: 1 − after ÷ before. */
export const lighter = (before: number, after: number): number => Math.round((1 - after / before) * 100);

/** The placeholders of each band, written as the language writes numbers (src/i18n/format.ts and src/calc/parse.ts). */
export interface HomeNumbers {
  image: Record<'from' | 'to' | 'photos' | 'percent', string>;
  pdf: Record<'from' | 'to' | 'percent', string>;
  /** English and Spanish: the example mortgage; Portuguese: the SAC × PRICE example. */
  money: Record<string, string>;
  /** English only: the paint calculator's example. */
  life: Record<'gallons' | 'coats' | 'perimeter' | 'height', string>;
  qr: Record<'max', string>;
}

export function homeNumbers(lang: Lang): HomeNumbers {
  const v = homeValues();
  const money$ =
    lang === 'pt'
      ? {
          diff: dollars(v.sacPrice.interestDiff, lang),
          loan: dollars(v.sacPrice.loan, lang),
          months: groupDigits(v.sacPrice.months, lang),
          rate: ratePercent(v.sacPrice.rate, lang),
        }
      : {
          payment: money(v.mortgage.monthlyTotal, lang),
          price: dollars(v.mortgage.price, lang),
          down: ratePercent(v.mortgage.downRate, lang),
          rate: ratePercent(v.mortgage.rate, lang),
          years: groupDigits(v.mortgage.years, lang),
        };
  return {
    image: {
      from: fileSize(v.image.before, lang),
      to: fileSize(v.image.after, lang),
      photos: groupDigits(v.image.photos, lang),
      percent: percent(lighter(v.image.before, v.image.after), lang),
    },
    pdf: { from: fileSize(v.pdf.before, lang), to: fileSize(v.pdf.after, lang), percent: percent(lighter(v.pdf.before, v.pdf.after), lang) },
    money: money$,
    life: {
      gallons: formatScaled(v.paint.gallons, 2, lang),
      coats: groupDigits(v.paint.coats, lang),
      perimeter: formatScaled(v.paint.perimeter, 2, lang),
      height: formatScaled(v.paint.height, 2, lang),
    },
    qr: { max: groupDigits(v.qr.max, lang) },
  };
}
