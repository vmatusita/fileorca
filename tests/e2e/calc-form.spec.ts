// The form and the open table of the home and health calculators after the review F7 (docs/relatorios/REVISAO-F7.md,
// DECISOES § 274), in both browsers: at 320 and 360 px every open table fits its frame with each heading over its own
// column, every number shows whole in its box (the example and the top of the range), every option of a menu fits it,
// and below 360 px a menu or a date takes the whole row; the unit of a field is in its description; a range error marks
// the result stale and turns the PDF and the CSV off; a scenario link with several areas leaves the focus alone; a menu
// keeps its height beside a field in error; the chosen option shows in high contrast; the QR placeholder is legible.
// The second pass (§ 282): the money pages keep their half rows below 360 px, and the range error works there too.
// The name puts this file before the design spec, in a light part of the WebKit (DECISOES § 142 and § 274).
import { expect, test, type Page } from '@playwright/test';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { BR_CALC_IDS, CALC_PAGE_IDS, LIFE_CALC_IDS, moneyPage, type AnyCalcId } from '../../src/tools/calc/registry.ts';
import { csvButton, openCalc, pdfButton, scaled } from './lib/life-calc.ts';
import { dismissCookies, hydrated } from './lib/page.ts';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('fo-consent', 'denied'));
});

const decimalsOf = (spec: { kind: string; decimals?: number | undefined }): number => (spec.kind === 'dec' ? (spec.decimals ?? 0) : 0);

/** Lets Preact run the effects of the last render. */
const frames = (page: Page) => page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));

/** The open table of the result: no sideways scroll, and each heading over the cells of its own column (f-1, f-2). */
async function tableProblems(page: Page): Promise<string[]> {
  return page.locator('.fo-calc-schedule .fo-amort-wrap').evaluate((wrap) => {
    const out: string[] = [];
    if (wrap.scrollWidth > wrap.clientWidth) out.push(`a tabela rola para o lado: ${wrap.scrollWidth} > ${wrap.clientWidth}`);
    const heads = [...wrap.querySelectorAll('thead th')];
    const cells = [...(wrap.querySelector('tbody tr')?.children ?? [])];
    heads.forEach((head, index) => {
      const cell = cells[index];
      if (!cell) return;
      const h = head.getBoundingClientRect();
      const c = cell.getBoundingClientRect();
      if (Math.abs(h.left - c.left) > 1 || Math.abs(h.right - c.right) > 1) out.push(`"${head.textContent}" fora da coluna: ${Math.round(h.left)}–${Math.round(h.right)} sobre ${Math.round(c.left)}–${Math.round(c.right)}`);
    });
    return out;
  });
}

/** The options of every menu against the room left of its arrow, measured with the menu's own font (f-4). */
async function menuProblems(page: Page): Promise<string[]> {
  return page.locator('#fo-tool-root select').evaluateAll((selects) =>
    selects.flatMap((element) => {
      const select = element as HTMLSelectElement;
      const style = getComputedStyle(select);
      const context = document.createElement('canvas').getContext('2d');
      if (!context) return ['sem canvas'];
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      // The native arrow takes about 26 px at the right of the text (measured in both browsers).
      const room = select.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 26;
      return [...select.options].flatMap((option) => {
        const need = context.measureText(option.text).width;
        return need > room ? [`#${select.id} "${option.text}" pede ${Math.ceil(need)} px e tem ${Math.floor(room)}`] : [];
      });
    }),
  );
}

for (const width of [320, 360]) {
  test(`at ${width} px the open table, the numbers and the menus fit (f-1, f-2, d-2, f-3, f-4)`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 740 });
    for (const id of LIFE_CALC_IDS) {
      await page.goto('about:blank');
      await openCalc(page, id);
      expect.soft(await tableProblems(page), `${id} a ${width} px`).toEqual([]);
      expect.soft(await menuProblems(page), `${id} a ${width} px`).toEqual([]);
      // Each visible number shows whole: the page's example and the top of the field's range.
      for (const spec of DEFS[id].fields) {
        if (spec.kind !== 'int' && spec.kind !== 'dec') continue;
        const input = page.locator(`#fo-calc-${spec.key}`);
        if (!(await input.isVisible())) continue;
        for (const value of [null, scaled(spec.max, decimalsOf(spec))]) {
          if (value !== null) {
            await input.fill(value);
            await input.blur();
          }
          const [scroll, client, text] = await input.evaluate((element: HTMLInputElement) => [element.scrollWidth, element.clientWidth, element.value] as const);
          expect.soft(scroll, `${id} #fo-calc-${spec.key} "${text}" a ${width} px`).toBeLessThanOrEqual(client);
        }
      }
      // Below 360 px a menu or a day of the main fields takes the whole row (d-3, f-6, f-4).
      const rows = await page.locator('.fo-calc__main > .fo-field:has(select, input[type="date"])').evaluateAll((fields) =>
        fields.map((field) => [field.querySelector('select, input')?.id ?? '', Math.round(field.getBoundingClientRect().width), Math.round(field.parentElement?.getBoundingClientRect().width ?? 0)] as const),
      );
      for (const [field, own, grid] of rows) {
        if (width < 360) expect.soft(own, `${id} #${field} a ${width} px`).toBe(grid);
        else expect.soft(own, `${id} #${field} a ${width} px`).toBeLessThan(grid);
      }
    }
  });
}

test('the unit of a field is in its accessible description (d-1)', async ({ page }) => {
  for (const id of LIFE_CALC_IDS) {
    await page.goto('about:blank');
    await openCalc(page, id);
    const missing = await page.locator('#fo-tool-root .fo-input:has(.fo-input__affix) input').evaluateAll((inputs) =>
      inputs.flatMap((input) => {
        const units = [...(input.parentElement?.querySelectorAll('.fo-input__affix') ?? [])].map((affix) => affix.textContent?.trim() ?? '');
        const description = (input.getAttribute('aria-describedby') ?? '')
          .split(/\s+/)
          .map((ref) => document.getElementById(ref)?.textContent?.trim() ?? '')
          .join(' ');
        return units.filter((unit) => !description.includes(unit)).map((unit) => `#${input.id} sem "${unit}"`);
      }),
    );
    expect.soft(missing, id).toEqual([]);
  }
});

/** The line under a stale result, in the language of the page. */
const STALE = {
  en: 'Fix the highlighted field to update the result.',
  pt: 'Corrija o campo destacado para atualizar o resultado.',
  es: 'Corrige el campo marcado para actualizar el resultado.',
} as const;

/** The page of a calculator in a language, opened and hydrated. */
async function openMoney(page: Page, id: AnyCalcId, lang: 'en' | 'pt' | 'es'): Promise<string> {
  const path = moneyPage(id, lang)?.path;
  if (!path) throw new Error(`no ${lang} page for ${id}`);
  await page.goto('about:blank');
  expect((await page.goto(path))?.status(), path).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
  return path;
}

test('a field out of its range marks the result stale, puts no PDF and turns the CSV off (g-1, s-2, DECISOES § 116)', async ({ page }) => {
  const cases: [AnyCalcId, 'en' | 'pt' | 'es', string, string, string][] = [
    ['bmi-calculator', 'en', 'ag', '19', '35'],
    ['calorie-calculator', 'en', 'ag', '80', '35'],
    ['body-fat-calculator', 'en', 'ag', '15', '35'],
    ['concrete-calculator', 'en', 'q', '0', '1'],
    ['due-date-calculator', 'en', 'd', '1999-12-31', '2026-09-07'],
    // The money pages follow the same rule (second pass, s-2): a rate over its range in English and Spanish, an amount
    // under it in Portuguese.
    ['mortgage-calculator', 'en', 'r', '99', '6.5'],
    ['mortgage-calculator', 'es', 'r', '99', '6.5'],
    ['br-personal-loan', 'pt', 'a', '0', '10000'],
  ];
  for (const [id, lang, key, wrong, right] of cases) {
    await openMoney(page, id, lang);
    const field = page.locator(`#fo-calc-${key}`);
    await field.fill(wrong);
    await expect(field, `${id} ${wrong}`).toHaveAttribute('aria-invalid', 'true');
    // F13b (DECISOES § C-2): the line is in the card, after the last result that worked, and the Download leaves its place.
    await expect(page.locator('.fo-rhero__stale'), id).toContainText(STALE[lang]);
    await expect(pdfButton(page), id).toHaveCount(0);
    await expect(csvButton(page), id).toBeDisabled();
    await field.fill(right);
    await expect(page.locator('.fo-rhero__stale'), id).toHaveCount(0);
    await expect(pdfButton(page), id).toBeEnabled();
    await expect(csvButton(page), id).toBeEnabled();
  }
});

// Every money page in the three languages: the 18 in English, the same 18 in Spanish (every row of the registry has its
// Spanish page since the languages adjustment) and the 8 of Brazil, in blocks of pages, a test each (DECISOES § 306).
const MONEY_PAGES: [AnyCalcId, 'en' | 'pt' | 'es'][] = [
  ...CALC_PAGE_IDS.map((id): [AnyCalcId, 'en'] => [id, 'en']),
  ...CALC_PAGE_IDS.map((id): [AnyCalcId, 'es'] => [id, 'es']),
  ...BR_CALC_IDS.map((id): [AnyCalcId, 'pt'] => [id, 'pt']),
];
const MONEY_BLOCK = 15;
for (let start = 0; start < MONEY_PAGES.length; start += MONEY_BLOCK) {
  const block = MONEY_PAGES.slice(start, start + MONEY_BLOCK);
  test(`below 360 px the money pages keep their half rows, the down payment beside the price among them (s-1; pages ${start + 1} to ${start + block.length})`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 320, height: 740 });
    for (const [id, lang] of block) {
      const path = await openMoney(page, id, lang);
      const wide = await page.locator('.fo-calc__main > .fo-field--half').evaluateAll((fields) =>
        fields.flatMap((field) => {
          const own = Math.round(field.getBoundingClientRect().width);
          const grid = Math.round(field.parentElement?.getBoundingClientRect().width ?? 0);
          return own >= grid ? [field.querySelector('input, select')?.id ?? '?'] : [];
        }),
      );
      expect.soft(wide, path).toEqual([]);
    }
  });
}

test('a scenario link with three areas leaves the focus and the scroll alone; Add an area takes the focus (a-1)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openCalc(page, 'square-footage-calculator', '#v=1&a0s=0&a0x=1000&a0y=500&a1s=1&a1x=1725&a1y=850&a2s=2&a2x=2450&a2y=1000');
  await expect(page.locator('.fo-debt')).toHaveCount(3);
  await frames(page);
  expect(await page.evaluate(() => [document.activeElement?.closest('.fo-debts') === null, window.scrollY])).toEqual([true, 0]);
  await page.locator('#fo-calc-a-add').click();
  await expect(page.locator('#fo-calc-a3s')).toBeFocused();
});

test('a menu keeps its height when the field beside it shows an error (f-5)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openCalc(page, 'paint-calculator');
  const box = page.locator('.fo-field:has(#fo-calc-mo) .fo-input');
  const before = (await box.boundingBox())?.height ?? 0;
  await page.locator('#fo-calc-co').fill('9');
  // F13b (DECISOES § C-2): the words are in the card; the field shows its stroke.
  await expect(page.locator('#fo-calc-co')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#fo-rhero-error')).toBeVisible();
  expect((await box.boundingBox())?.height).toBe(before);
});

test('in high contrast the chosen option is marked (d-8)', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await openCalc(page, 'bmi-calculator');
  const forced = await page.evaluate(() => window.matchMedia('(forced-colors: active)').matches);
  const look = await page.locator('.fo-seg__opt').evaluateAll((options) =>
    options.slice(0, 2).map((option) => {
      const style = getComputedStyle(option);
      return { checked: option.querySelector('input')?.checked ?? false, line: style.textDecorationLine, fill: style.backgroundColor };
    }),
  );
  const [chosen, other] = [look.find((option) => option.checked), look.find((option) => !option.checked)];
  if (forced) {
    // Forced colours paint both options alike: the underline is the mark.
    expect(chosen?.line).toBe('underline');
    expect(other?.line).toBe('none');
  } else {
    // A browser that cannot emulate forced colours (WebKit): the chosen option keeps its fill.
    expect(chosen?.fill).not.toBe(other?.fill);
  }
});

test('the placeholder of the QR box reads at 4.5:1 or more in both themes (d-9)', async ({ page }) => {
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    expect((await page.goto('/qr-code-generator/'))?.status()).toBe(200);
    const ratio = await page.locator('#fo-tool-root textarea').evaluate((area) => {
      const rgb = (color: string) => (color.match(/[\d.]+/g) ?? []).map(Number);
      const lum = ([r = 0, g = 0, b = 0]: number[]) =>
        [r, g, b].map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4)).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i]!, 0);
      const placeholder = getComputedStyle(area, '::placeholder');
      const [r = 0, g = 0, b = 0, a = 1] = rgb(placeholder.color);
      const alpha = a * Number(placeholder.opacity || 1);
      const ground = rgb(getComputedStyle(area.closest('.fo-input') ?? area).backgroundColor);
      const mixed = [r, g, b].map((v, i) => v * alpha + (ground[i] ?? 0) * (1 - alpha));
      const [hi, lo] = [lum(mixed), lum(ground)].sort((x, y) => y - x);
      return (hi! + 0.05) / (lo! + 0.05);
    });
    expect(ratio, scheme).toBeGreaterThanOrEqual(4.5);
  }
});

// ---- After the review F4-F7 (DECISOES § 305) ------------------------------------------------------------------------

test('a valid number typed key by key never shows the range error on the way, and a wrong one shows it after a pause (d-4)', async ({ page }) => {
  await page.goto(moneyPage('mortgage-calculator', 'en')?.path ?? '');
  await hydrated(page);
  await dismissCookies(page);
  await page.evaluate(() => {
    const seen = { alerts: 0, invalid: 0 };
    (window as unknown as { __seen: typeof seen }).__seen = seen;
    new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'attributes' && (record.target as Element).getAttribute('aria-invalid') === 'true') seen.invalid += 1;
        // F13b (DECISOES § C-2): the words of an error are the card's message (#fo-rhero-error), no longer an alert of the field.
        for (const node of record.addedNodes) if (node instanceof Element && (node.matches('[role="alert"], #fo-rhero-error') || node.querySelector('[role="alert"], #fo-rhero-error'))) seen.alerts += 1;
      }
    }).observe(document.getElementById('fo-tool-root') as HTMLElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-invalid'] });
  });
  const field = page.locator('#fo-calc-p');
  await field.click();
  await field.press('ControlOrMeta+a');
  await field.pressSequentially('425000', { delay: 60 });
  await expect(page.locator('.fo-rhero__num')).toContainText(/\d/);
  expect(await page.evaluate(() => (window as unknown as { __seen: { alerts: number; invalid: number } }).__seen)).toEqual({ alerts: 0, invalid: 0 });
  // A value that stays out of the range is said, after the pause or when the field is left.
  await field.fill('42');
  await expect(page.locator('#fo-tool-root #fo-rhero-error')).toBeVisible();
  await expect(field).toHaveAttribute('aria-invalid', 'true');
});

test('with the text spacing of WCAG 1.4.12 the result card keeps its number and its sentence inside, at 320 px (d-3)', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const path of [moneyPage('loan-amortization-calculator-balloon-payment', 'en')?.path ?? '', moneyPage('br-early-payoff', 'pt')?.path ?? '']) {
    await page.goto(path);
    await hydrated(page);
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }' });
    const overflow = await page.evaluate(() =>
      ['.fo-rhero', '.fo-rhero__num', '.fo-rhero__sentence'].flatMap((selector) => {
        const element = document.querySelector(selector);
        return element && element.scrollWidth > element.clientWidth + 1 ? [`${selector} ${element.scrollWidth} > ${element.clientWidth}`] : [];
      }),
    );
    expect(overflow, path).toEqual([]);
  }
});
