// The six home calculators end to end (prompt F7, decision 11), in both browsers: the example each page opens with and
// two cases of the oracle typed in (a corner of its grid and a random draw), each read on the ResultHero, in the open
// table of the result and in the CSV saved from the page, against fixtures/calc (written before the engines); the PDF
// with its fixed name; the Oli's one cheer of a visit (§ 140); and the number of the ResultHero on one line.
// The name starts with "money-" only for the order of the WebKit parts (DECISOES § 142).
import { isDeepStrictEqual } from 'node:util';
import { expect, test, type Page } from '@playwright/test';
import { LIFE_CALC_PAGES, type HouseCalcId } from '../../src/tools/calc/registry.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import type {
  BtuInput,
  BtuResult,
  ConcreteInput,
  ConcreteResult,
  MulchInput,
  MulchResult,
  PaintInput,
  SquareFootageInput,
  TileInput,
  TileResult,
} from '../../src/calc/home.ts';
import squareTexts from '../../src/tools/square-footage-calculator/i18n/en.ts';
import concreteTexts from '../../src/tools/concrete-calculator/i18n/en.ts';
import mulchTexts from '../../src/tools/mulch-calculator/i18n/en.ts';
import paintTexts from '../../src/tools/paint-calculator/i18n/en.ts';
import tileTexts from '../../src/tools/tile-calculator/i18n/en.ts';
import btuTexts from '../../src/tools/btu-calculator/i18n/en.ts';
import { pdfTextLines } from './lib/pdf-text.ts';
import { strictPdf } from './lib/pdf.ts';
import { settle } from './lib/page.ts';
import {
  chooseOption,
  expectCsv,
  expectHero,
  expectPdf,
  expectTable,
  filled,
  heroLines,
  heroNumber,
  oracleCase,
  openCalc,
  scaled,
  type,
  typed,
  whole,
  type Cell,
} from './lib/life-calc.ts';

interface Result {
  hero: string;
  sentence: string;
  rows: Cell[][];
}

interface House<I, E> {
  id: HouseCalcId;
  /** A corner of the oracle's grid and a random draw, typed in the fields. */
  cases: readonly string[];
  head: readonly string[];
  fill: (page: Page, input: I) => Promise<void>;
  result: (input: I, expected: E) => Result;
}

const m2 = (value: number): string => scaled(value, 2, 2);
const signed = (n: number): string => (n < 0 ? `−${whole(-n)}` : `+${whole(n)}`);

// --- square footage -------------------------------------------------------------------------------------------------

const SHAPES = ['rect', 'triangle', 'circle'] as const;
const sq = squareTexts.panel.view;

const squareFootage: House<SquareFootageInput, { items: { sqft: number }[]; sqft: number; sqyd: number }> = {
  id: 'square-footage-calculator',
  cases: ['grid-051', 'random-001'],
  head: [sq.colArea, sq.colShape, sq.colSize, sq.colSqft],
  async fill(page, input) {
    const rows = page.locator('.fo-debt');
    // The Add button comes after the result (ListSpec.addBelow); Remove is in each area.
    while ((await rows.count()) < input.areas.length) {
      const before = await rows.count();
      await page.locator('#fo-calc-a-add').click();
      await expect(rows).toHaveCount(before + 1);
    }
    while ((await rows.count()) > input.areas.length) {
      const before = await rows.count();
      await page.locator(`#fo-calc-a${before - 1}-remove`).click();
      await expect(rows).toHaveCount(before - 1);
    }
    for (const [index, area] of input.areas.entries()) {
      await page.locator(`#fo-calc-a${index}s`).selectOption(String(SHAPES.indexOf(area.shape)));
      await type(page, `a${index}x`, typed(area.x, 2));
      // A circle is measured by its diameter: its second field is hidden.
      if (area.shape === 'circle') await expect(page.locator(`#fo-calc-a${index}y`)).toHaveCount(0);
      else await type(page, `a${index}y`, typed(area.y, 2));
    }
  },
  result(input, expected) {
    const total = m2(expected.sqft);
    return {
      hero: `${total} ${sq.unit}`,
      sentence: filled(sq.sentence, { yards: m2(expected.sqyd), n: whole(input.areas.length) }),
      rows: input.areas.map((area, index) => [
        filled(sq.row, { n: String(index + 1) }),
        squareTexts.panel.options.s[area.shape],
        area.shape === 'circle' ? filled(sq.diameter, { x: scaled(area.x, 2) }) : filled(sq.sides, { x: scaled(area.x, 2), y: scaled(area.y, 2) }),
        { scaled: expected.items[index]?.sqft ?? NaN, decimals: 2 },
      ]),
    };
  },
};

// --- concrete -------------------------------------------------------------------------------------------------------

const cv = concreteTexts.panel.view;

const concrete: House<ConcreteInput, ConcreteResult> = {
  id: 'concrete-calculator',
  cases: ['grid-072', 'random-001'],
  head: [cv.colBag, cv.colYield, cv.colBags],
  async fill(page, input) {
    await chooseOption(page, 'sh', input.shape);
    if (input.shape === 'slab') {
      await type(page, 'l', typed(input.length, 2));
      await type(page, 'w', typed(input.width, 2));
      await type(page, 't', typed(input.thickness, 2));
    } else {
      await type(page, 'd', typed(input.diameter, 2));
      await type(page, 'h', typed(input.depth, 2));
    }
    await type(page, 'q', String(input.quantity));
    await type(page, 'wa', String(input.waste));
    await type(page, 'y4', typed(input.y40, 2));
    await type(page, 'y6', typed(input.y60, 2));
    await type(page, 'y8', typed(input.y80, 2));
  },
  result(input, expected) {
    return {
      hero: `${m2(expected.total.cuyd)} ${cv.unit}`,
      sentence: filled(cv.sentence, { feet: m2(expected.total.cuft), waste: whole(input.waste), bags: whole(expected.bags.b80) }),
      rows: [
        [cv.bag40, { scaled: input.y40, decimals: 2 }, whole(expected.bags.b40)],
        [cv.bag60, { scaled: input.y60, decimals: 2 }, whole(expected.bags.b60)],
        [cv.bag80, { scaled: input.y80, decimals: 2 }, whole(expected.bags.b80)],
      ],
    };
  },
};

// --- mulch and gravel -----------------------------------------------------------------------------------------------

const mv = mulchTexts.panel.view;

const mulch: House<MulchInput, MulchResult> = {
  id: 'mulch-calculator',
  cases: ['grid-162', 'random-009'],
  head: [mv.colItem, mv.colAmount],
  async fill(page, input) {
    await page.locator('#fo-calc-mo').selectOption(input.mode);
    await type(page, 'de', typed(input.depth, 2));
    if (input.mode === 'dims') {
      await type(page, 'l', typed(input.length, 2));
      await type(page, 'w', typed(input.width, 2));
    } else await type(page, 'ar', typed(input.area, 2));
    await chooseOption(page, 'm', input.material);
    if (input.material === 'gravel') {
      await type(page, 'bg', typed(input.bag, 2));
      await type(page, 'dn', typed(input.density, 2));
    } else await type(page, 'bm', typed(input.bag, 2));
  },
  result(input, expected) {
    const gravel = input.material === 'gravel';
    const bag = scaled(input.bag, 2);
    const tons = expected.tons === null ? '' : m2(expected.tons);
    return {
      hero: `${m2(expected.cuyd)} ${mv.unit}`,
      sentence: filled(gravel ? mv.sentenceGravel : mv.sentence, { feet: m2(expected.cuft), bags: whole(expected.bags), bag, tons }),
      rows: [
        [mv.area, `${m2(expected.sqft)} ${mv.areaUnit}`],
        [mv.label, `${m2(expected.cuyd)} ${mv.unit}`],
        [mv.feet, `${m2(expected.cuft)} ${mv.feetUnit}`],
        [filled(mv.bags, { bag }), whole(expected.bags)],
        ...(gravel ? [[mv.tons, tons]] : []),
      ],
    };
  },
};

// --- paint ----------------------------------------------------------------------------------------------------------

const pv = paintTexts.panel.view;

const paint: House<PaintInput, { wall: number; openings: number; paintable: number; gallons: number; buy: number }> = {
  id: 'paint-calculator',
  cases: ['grid-108', 'random-001'],
  head: [pv.colItem, pv.colAmount],
  async fill(page, input) {
    await page.locator('#fo-calc-mo').selectOption(input.mode);
    await type(page, 'co', String(input.coats));
    if (input.mode === 'walls') {
      await type(page, 'pe', typed(input.perimeter, 2));
      await type(page, 'he', typed(input.height, 2));
    } else await type(page, 'ar', typed(input.area, 2));
    await type(page, 'cv', String(input.coverage));
    await type(page, 'dr', String(input.doors));
    await type(page, 'da', typed(input.doorArea, 2));
    await type(page, 'wi', String(input.windows));
    await type(page, 'wn', typed(input.windowArea, 2));
  },
  result(input, expected) {
    const sqft = pv.areaUnit;
    return {
      hero: `${m2(expected.gallons)} ${pv.unit}`,
      sentence: filled(pv.sentence, { buy: whole(expected.buy), coats: whole(input.coats), area: m2(expected.paintable), coverage: whole(input.coverage) }),
      rows: [
        [pv.wall, `${m2(expected.wall)} ${sqft}`],
        [pv.openings, `${m2(expected.openings)} ${sqft}`],
        [pv.paintable, `${m2(expected.paintable)} ${sqft}`],
        [pv.coats, whole(input.coats)],
        [pv.label, `${m2(expected.gallons)} ${pv.unit}`],
        [pv.buy, whole(expected.buy)],
      ],
    };
  },
};

// --- tile -----------------------------------------------------------------------------------------------------------

const tv = tileTexts.panel.view;

const tile: House<TileInput, TileResult> = {
  id: 'tile-calculator',
  cases: ['grid-001', 'random-001'],
  head: [tv.colItem, tv.colAmount],
  async fill(page, input) {
    await type(page, 'ar', typed(input.area, 2));
    await type(page, 'wa', String(input.waste));
    await type(page, 'tl', typed(input.length, 2));
    await type(page, 'tw', typed(input.width, 2));
    await type(page, 'pb', String(input.perBox));
  },
  result(input, expected) {
    const size = filled(tv.size, { x: scaled(input.length, 2), y: scaled(input.width, 2) });
    const waste = whole(input.waste);
    return {
      hero: `${whole(expected.tiles)} ${tv.unit}`,
      sentence:
        expected.boxes === null
          ? filled(tv.sentenceNoBox, { size, waste })
          : filled(tv.sentence, { size, waste, boxes: whole(expected.boxes), per: whole(input.perBox) }),
      rows: [
        [tv.area, `${m2(input.area)} ${tv.areaUnit}`],
        [tv.tile, size],
        [tv.waste, `${waste}%`],
        [tv.label, whole(expected.tiles)],
        [tv.boxes, expected.boxes === null ? tv.noBox : whole(expected.boxes)],
      ],
    };
  },
};

// --- BTU ------------------------------------------------------------------------------------------------------------

const bv = btuTexts.panel.view;

const btu: House<BtuInput, BtuResult> = {
  id: 'btu-calculator',
  cases: ['grid-008', 'random-001'],
  head: [bv.colStep, bv.colBtu],
  async fill(page, input) {
    await type(page, 'ar', typed(input.area, 2));
    await type(page, 'pe', String(input.people));
    await chooseOption(page, 'su', input.sun);
    await page.locator('#fo-calc-ki').selectOption(input.kitchen ? 'yes' : 'no');
  },
  result(input, expected) {
    return {
      hero: `${whole(expected.btu)} ${bv.unit}`,
      sentence: filled(bv.sentence, { base: whole(expected.base) }),
      rows: [
        [filled(bv.base, { area: m2(input.area) }), whole(expected.base)],
        [input.sun === 'shade' ? bv.shade : input.sun === 'sun' ? bv.sunny : bv.normal, signed(expected.sun)],
        [bv.people, signed(expected.people)],
        [bv.kitchen, signed(expected.kitchen)],
        [bv.label, whole(expected.btu)],
      ],
    };
  },
};

const HOUSE = [squareFootage, concrete, mulch, paint, tile, btu] as unknown as readonly House<unknown, unknown>[];

async function expectResult<I, E>(page: Page, house: House<I, E>, input: I, expected: E): Promise<void> {
  const { hero, sentence, rows } = house.result(input, expected);
  await expectHero(page, hero, sentence);
  await expectTable(page, house.head, rows);
  await expectCsv(page, house.id, house.head, rows);
}

for (const house of HOUSE) {
  test(`${LIFE_CALC_PAGES[house.id].path}: the example and two oracle cases on the ResultHero, in the open table and in the CSV`, async ({ page }) => {
    const example = oracleCase(house.id, 'page-example');
    // The page opens with the oracle's page-example (DECISOES § 268): the definition's example is that case's input.
    const def = DEFS[house.id];
    expect(isDeepStrictEqual(JSON.parse(JSON.stringify(def.toInput(def.initial as never))), example.input), 'the page example is the oracle case').toBe(true);
    await openCalc(page, house.id);
    await expectResult(page, house, example.input, example.expected);
    for (const id of house.cases) {
      const kase = oracleCase(house.id, id);
      await house.fill(page, kase.input);
      await expectResult(page, house, kase.input, kase.expected);
    }
  });
}

test('the concrete PDF has the fixed name and draws the result of the example', async ({ page }) => {
  await openCalc(page, 'concrete-calculator');
  const bytes = await expectPdf(page, 'concrete-calculator');
  const strict = await strictPdf(new Uint8Array(bytes));
  expect(strict.problems).toEqual([]);
  const example = oracleCase<ConcreteInput, ConcreteResult>('concrete-calculator', 'page-example').expected;
  // The oracle: 1.36 cu yd with the extra, 36.67 cu ft, and 62 bags of 80 lb.
  const lines = pdfTextLines(new Uint8Array(bytes));
  expect(lines).toContain(`${m2(example.total.cuyd)} ${cv.unit}`);
  expect(lines).toContain(`${m2(example.total.cuft)} ${cv.feetUnit}`);
  expect(lines).toContain(whole(example.bags.b80));
});

test('a home calculator: the Oli cheers on the first change of the visit only (DECISOES § 140)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openCalc(page, 'concrete-calculator');
  const cheer = page.locator('.fo-rhero__oli');
  // The home pages carry the cheer pose in their sprite; it shows only after a change. F13b (DECISOES § 545): the Oli is in
  // the card from the first paint, waving, and cheers in the same box.
  await expect(page.locator('symbol#oli-cheer')).toHaveCount(1);
  await settle(page);
  await expect(cheer).toHaveAttribute('data-oli', 'wave');
  await type(page, 'l', '12');
  await expect(cheer).toHaveAttribute('data-oli', 'cheer');
  await expect(cheer.locator('use')).toHaveAttribute('href', '#oli-cheer');
  // On a phone the number stays above the fold, the cheer in the same box.
  expect(await heroNumber(page).evaluate((node) => node.getBoundingClientRect().bottom + window.scrollY)).toBeLessThanOrEqual(740);
  expect(await page.evaluate(() => sessionStorage.getItem('fo-calc-cheer'))).toBe('1');
  await type(page, 'l', '14');
  await expect(cheer).toHaveAttribute('data-oli', 'cheer');
  // Another page of the same visit: no second cheer.
  await openCalc(page, 'tile-calculator');
  const before = (await heroNumber(page).textContent()) ?? '';
  await type(page, 'ar', '150');
  await expect(heroNumber(page)).not.toHaveText(before);
  await settle(page);
  await expect(cheer).toHaveAttribute('data-oli', 'wave');
});

// The number of the ResultHero, with its unit, stays on one line from 320 to 1280px (DECISOES § 246 and § 253), on the
// example of each home page and on the longest result of the oracle cases typed above (34,906.59 cu yd).
test('the ResultHero number of the home calculators stays on one line at 320, 360, 768 and 1280px', async ({ page }) => {
  test.setTimeout(120_000);
  const broken: string[] = [];
  const check = async (label: string) => {
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 360, 768, 1280]) {
      const { lines, scroll } = await heroLines(page, width);
      if (lines !== 1) broken.push(`${label} a ${width}px: ${lines} linhas`);
      if (scroll > width) broken.push(`${label} a ${width}px: a página rola para o lado (${scroll}px)`);
    }
  };
  for (const house of HOUSE) {
    await page.setViewportSize({ width: 320, height: 900 });
    await openCalc(page, house.id);
    await check(house.id);
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await openCalc(page, 'concrete-calculator');
  const widest = oracleCase<ConcreteInput, ConcreteResult>('concrete-calculator', 'grid-072');
  await concrete.fill(page, widest.input);
  await expectHero(page, concrete.result(widest.input, widest.expected).hero);
  await check('concrete grid-072');
  expect(broken).toEqual([]);
});
