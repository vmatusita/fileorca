// What the home and health specs share (prompt F7, decision 11): the oracle's cases (fixtures/calc, written before the
// engines), the numbers and days as the English page writes them (by hand here, never with the site's own formatters),
// the open table of the result, the CSV read back and the files saved from the page.
import { readFileSync } from 'node:fs';
import { expect, type Locator, type Page } from '@playwright/test';
import { LIFE_CALC_PAGES, type LifeCalcId } from '../../../src/tools/calc/registry.ts';
import { dismissCookies, hydrated } from './page.ts';

export interface OracleCase<I, E> {
  id: string;
  source: string;
  input: I;
  expected: E;
}

/** A case of the oracle's fixture of a calculator, by its id. */
export function oracleCase<I, E>(id: LifeCalcId, caseId: string): OracleCase<I, E> {
  const cases = (JSON.parse(readFileSync(`fixtures/calc/${id}.json`, 'utf8')) as { cases: OracleCase<I, E>[] }).cases;
  const found = cases.find((entry) => entry.id === caseId);
  if (!found) throw new Error(`no oracle case ${caseId} for ${id}`);
  return found;
}

/**
 * A whole number of 10^-decimals as the English page writes it: 1,234.5 (trailing zeros cut down to `min`), with the
 * thousands comma (also in four digits) unless `group` is off, as in the CSV.
 */
export function scaled(value: number, decimals: number, min = 0, group = true): string {
  const digits = String(Math.abs(value)).padStart(decimals + 1, '0');
  let whole = digits.slice(0, digits.length - decimals);
  let fraction = decimals ? digits.slice(digits.length - decimals) : '';
  while (fraction.length > min && fraction.endsWith('0')) fraction = fraction.slice(0, -1);
  if (group) whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${value < 0 ? '−' : ''}${whole}${fraction ? `.${fraction}` : ''}`;
}

export const whole = (value: number): string => scaled(value, 0);

/** What a person types for a measure: the number with the decimal point, no thousands comma (1250 hundredths → "12.5"). */
export const typed = (value: number, decimals: number): string => scaled(value, decimals, 0, false);

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** An ISO day written out as the page writes it: "2027-06-14" → "June 14, 2027". */
export function longDay(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
}

/** A template's {placeholders} filled in. */
export function filled(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (all, key: string) => values[key] ?? all);
}

/** A cell of a result table: text, or a measure the screen writes with its decimals and the CSV without the comma. */
export type Cell = string | { scaled: number; decimals: number };
export const screenCell = (cell: Cell): string => (typeof cell === 'string' ? cell : scaled(cell.scaled, cell.decimals, cell.decimals));
export const csvCell = (cell: Cell): string => (typeof cell === 'string' ? cell : scaled(cell.scaled, cell.decimals, cell.decimals, false));

export async function openCalc(page: Page, id: LifeCalcId, hash = ''): Promise<void> {
  expect((await page.goto(`${LIFE_CALC_PAGES[id].path}${hash}`))?.status(), id).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
}

export const heroNumber = (page: Page): Locator => page.locator('.fo-rhero__num');
export const heroSentence = (page: Page): Locator => page.locator('.fo-rhero__sentence');
// F13b (DECISOES § 545): the Download PDF is in the card; Download CSV and Copy link share the row under it.
export const pdfButton = (page: Page): Locator => page.locator('.fo-rhero .fo-btn--download');
export const csvButton = (page: Page): Locator => page.locator('.fo-export .fo-btn').nth(0);

const squash = (text: string): string => text.replace(/\s+/g, '');

/** The big number with its unit: its numbers and words are separate pieces, so spaces are left out of the comparison. */
export async function expectHero(page: Page, value: string, sentence?: string): Promise<void> {
  await expect.poll(async () => squash((await heroNumber(page).textContent()) ?? '')).toBe(squash(value));
  if (sentence !== undefined) await expect(heroSentence(page)).toHaveText(sentence);
}

/** The table of the result shows open in the island (before the chips since the F13b), with no button to show it (F7, CalcView.open). */
export async function expectTable(page: Page, head: readonly string[], rows: readonly (readonly Cell[])[]): Promise<void> {
  const section = page.locator('#fo-calc-schedule');
  await expect(section.locator('button')).toHaveCount(0);
  const table = section.locator('.fo-amort');
  await expect(table.locator('thead th')).toHaveText([...head]);
  await expect
    .poll(() => table.locator('tbody tr').evaluateAll((trs) => trs.map((tr) => [...tr.querySelectorAll('th, td')].map((td) => td.textContent ?? ''))))
    .toEqual(rows.map((row) => row.map(screenCell)));
}

export async function saved(page: Page, button: Locator): Promise<{ name: string; bytes: Buffer }> {
  const download = page.waitForEvent('download');
  await button.click();
  const file = await download;
  return { name: file.suggestedFilename(), bytes: readFileSync((await file.path()) ?? '') };
}

/** The lines of a CSV, with RFC 4180 quotes ("June 14, 2027" comes quoted). */
export function parseCsv(text: string): string[][] {
  const lines: string[][] = [];
  let line: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      line.push(field);
      field = '';
    } else if (char === '\r' && text[i + 1] === '\n') {
      line.push(field);
      lines.push(line);
      line = [];
      field = '';
      i += 1;
    } else field += char;
  }
  if (field !== '' || line.length > 0) lines.push([...line, field]);
  return lines;
}

/** Saves the CSV from the page and reads it back: the fixed name, the BOM, CRLF, the head of the open table and its rows. */
export async function expectCsv(page: Page, id: LifeCalcId, head: readonly string[], rows: readonly (readonly Cell[])[]): Promise<void> {
  const { name, bytes } = await saved(page, csvButton(page));
  expect(name).toBe(`${LIFE_CALC_PAGES[id].file}.csv`);
  const text = bytes.toString('utf8');
  expect(text.startsWith('﻿'), 'BOM UTF-8').toBe(true);
  expect(text.endsWith('\r\n'), 'the file ends with CRLF').toBe(true);
  expect(text.slice(1).replace(/\r\n/g, ''), 'no line ends without CR').not.toMatch(/\n/);
  const [header, ...lines] = parseCsv(text.slice(1));
  expect(header).toEqual([...head]);
  expect(lines).toEqual(rows.map((row) => row.map(csvCell)));
}

/** Saves the PDF from the page: a PDF (%PDF-), with the fixed name of the registry. */
export async function expectPdf(page: Page, id: LifeCalcId): Promise<Buffer> {
  const { name, bytes } = await saved(page, pdfButton(page));
  expect(name).toBe(`${LIFE_CALC_PAGES[id].file}.pdf`);
  expect(bytes.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  return bytes;
}

/** Picks an option of a segmented OptionGroup: its radio is hidden, so the label is clicked (docs/claude/pdf.md, F5a). */
export async function chooseOption(page: Page, key: string, value: string): Promise<void> {
  const radio = page.locator(`input[name="fo-calc-${key}"][value="${value}"]`);
  await page.locator('.fo-seg__opt').filter({ has: radio }).click();
  await expect(radio).toBeChecked();
}

/** Types a value in a field of the calculator, by its key. */
export async function type(page: Page, key: string, text: string): Promise<void> {
  const field = page.locator(`#fo-calc-${key}`);
  await field.fill(text);
  await expect(field).toHaveValue(text);
}

/** The ResultHero number on one line, and the page never sideways, at this width. */
export async function heroLines(page: Page, width: number): Promise<{ lines: number; size: number; scroll: number }> {
  await page.setViewportSize({ width, height: 900 });
  const box = await heroNumber(page)
    .first()
    .evaluate((num) => ({
      lines: Math.round(num.getBoundingClientRect().height / parseFloat(getComputedStyle(num).lineHeight)),
      size: parseFloat(getComputedStyle(num).fontSize),
    }));
  return { ...box, scroll: await page.evaluate(() => document.documentElement.scrollWidth) };
}
