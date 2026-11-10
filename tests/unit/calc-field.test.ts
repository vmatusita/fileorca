// The number field of the calculators in the F16 (items 1 to 4; DECISOES § 683 to § 686): the message of a typed text (none,
// the decimals message with the n of the field, or the range with the hint of the decimals), the store's record of the
// fields whose text does not read (the card's region waits while there is one) and where the focus goes when the Download
// leaves the page. Every expected text is written here by hand, never taken from the code it tests.
import { describe, expect, it } from 'vitest';
import en from '../../src/tools/calc/i18n/en.ts';
import pt from '../../src/tools/calc/i18n/pt.ts';
import es from '../../src/tools/calc/i18n/es.ts';
import { decimalsMessage, fieldMessage, type FieldRule } from '../../src/tools/calc/form.ts';
import { createStore } from '../../src/tools/calc/store.ts';
import { nextControl } from '../../src/tools/calc/ResultHero.tsx';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { panelData } from '../../src/tools/calc/page.ts';
import { startValues } from '../../src/tools/calc/CalcPanel.tsx';

const SHARED = { en: en.island, pt: pt.island, es: es.island };

// The fields of the cases, with their fixed ranges in the units of the engine.
const PRICE: FieldRule = { kind: 'money', min: 1_000_000, max: 2_000_000_000 };
const AMOUNT: FieldRule = { kind: 'money', min: 0, max: 2_000_000_000 };
const RATE: FieldRule = { kind: 'rate', min: 0, max: 400_000 };
const TERM: FieldRule = { kind: 'int', min: 1, max: 40 };
const WEIGHT: FieldRule = { kind: 'dec', decimals: 1, min: 500, max: 10_000 };
const ADJUST: FieldRule = { kind: 'dec', decimals: 0, min: -50, max: 50, negative: true };

/** The message of `text` in a field, with the range "Range." and the hint of the language. */
const said = (lang: 'en' | 'pt' | 'es', text: string, field: FieldRule) =>
  fieldMessage(text, lang, field, { ...SHARED[lang], error: 'Range.', hint: SHARED[lang].decimalHint });
const HINT = { en: 'Use a dot for the decimals, like 6.5.', pt: 'Use vírgula nos decimais, como 11,5.', es: 'Usa punto en los decimales, como 6.5.' };

describe('the message of a number field (F16, items 1 and 2)', () => {
  it('says the decimals of the field, with n = 0, 1, 2 and 4, in the three languages', () => {
    const CASES: [lang: 'en' | 'pt' | 'es', text: string, field: FieldRule, message: string][] = [
      // n = 2: money.
      ['en', '1,234.567', AMOUNT, 'Use up to 2 decimal places.'],
      ['es', '1,234.567', AMOUNT, 'Usa hasta 2 decimales.'],
      ['pt', '1.234,567', AMOUNT, 'Use até 2 casas decimais.'],
      ['pt', 'R$ 3755.000,505', PRICE, 'Use até 2 casas decimais.'],
      // n = 4: a rate.
      ['en', '6.55555', RATE, 'Use up to 4 decimal places.'],
      ['es', '6.55555%', RATE, 'Usa hasta 4 decimales.'],
      ['pt', '6,55555', RATE, 'Use até 4 casas decimais.'],
      // n = 1: a measure in tenths.
      ['en', '160.25', WEIGHT, 'Use up to 1 decimal place.'],
      ['es', '160.25', WEIGHT, 'Usa hasta 1 decimal.'],
      ['pt', '160,25', WEIGHT, 'Use até 1 casa decimal.'],
      // n = 0: a count, and a whole measure that takes a minus.
      ['en', '30.5', TERM, 'Use a whole number.'],
      ['es', '30.5', TERM, 'Usa un número entero.'],
      ['pt', '12,5', TERM, 'Use um número inteiro.'],
      ['en', '-5.5', ADJUST, 'Use a whole number.'],
    ];
    for (const [lang, text, field, message] of CASES) expect(said(lang, text, field), `${lang} "${text}"`).toBe(message);
  });

  it('writes the n of the field in the message of two decimals or more', () => {
    expect(decimalsMessage(en.island, 2)).toBe('Use up to 2 decimal places.');
    expect(decimalsMessage(pt.island, 4)).toBe('Use até 4 casas decimais.');
    expect(decimalsMessage(es.island, 3)).toBe('Usa hasta 3 decimales.');
    expect(decimalsMessage(en.island, 1)).toBe('Use up to 1 decimal place.');
    expect(decimalsMessage(pt.island, 0)).toBe('Use um número inteiro.');
  });

  it('gives the decimals message only when the value with the decimals cut off is in the range', () => {
    // 0.5 is under one year, and 40.5 cut is 40, in the range; 20,000,000.01 passes $20,000,000.
    expect(said('en', '0.5', TERM)).toBe('Range.');
    expect(said('en', '40.5', TERM)).toBe('Use a whole number.');
    expect(said('es', '20,000,000.001', PRICE)).toBe('Usa hasta 2 decimales.');
    expect(said('es', '20,000,000.011', PRICE)).toBe('Range.');
    // Out of the range, a field with decimals keeps the hint of § 254 when the text reads with the separators swapped (plan
    // 5 N.2): 45.1234% passes 40%, and "45,12345" reads 4,512,345; $1.23 is under $10,000, and "1,234" reads 1,234.
    expect(said('en', '45.12345', RATE)).toBe(`Range. ${HINT.en}`);
    expect(said('pt', '45,12345', RATE)).toBe(`Range. ${HINT.pt}`);
    expect(said('en', '1.234', PRICE)).toBe(`Range. ${HINT.en}`);
    expect(said('pt', '375,000', PRICE)).toBe(`Range. ${HINT.pt}`);
  });

  it('says nothing for a number that reads in the range, also typed in the middle of a grouped one', () => {
    expect(said('en', '3755,000', PRICE)).toBeUndefined();
    expect(said('es', '3755,000', PRICE)).toBeUndefined();
    expect(said('pt', '3755.000', PRICE)).toBeUndefined();
    expect(said('en', '6.5', RATE)).toBeUndefined();
    expect(said('pt', '6,5', RATE)).toBeUndefined();
    expect(said('en', '30', TERM)).toBeUndefined();
    expect(said('en', '-5', ADJUST)).toBeUndefined();
  });

  it('adds how the page writes decimals to the range in a field with decimals, as § 251 and § 254 say', () => {
    // A thousands separator and one or two digits at the end of the text.
    expect(said('en', '6,5', RATE)).toBe(`Range. ${HINT.en}`);
    expect(said('es', '6,5', RATE)).toBe(`Range. ${HINT.es}`);
    expect(said('pt', '11.5', RATE)).toBe(`Range. ${HINT.pt}`);
    expect(said('en', '3,755,00', PRICE)).toBe(`Range. ${HINT.en}`);
    expect(said('pt', '3.755.00', PRICE)).toBe(`Range. ${HINT.pt}`);
    expect(said('en', '12,34,56', PRICE)).toBe(`Range. ${HINT.en}`);
    // The number of the other language: it reads with the two separators swapped.
    expect(said('en', '1.234,56', AMOUNT)).toBe(`Range. ${HINT.en}`);
    expect(said('es', '1.234,56', AMOUNT)).toBe(`Range. ${HINT.es}`);
    expect(said('pt', '1,234.56', AMOUNT)).toBe(`Range. ${HINT.pt}`);
  });

  it('gives the range alone to letters, an empty field, a number out of the range and a field without decimals', () => {
    for (const lang of ['en', 'pt', 'es'] as const) {
      expect(said(lang, 'abc', RATE), lang).toBe('Range.');
      expect(said(lang, '', RATE), lang).toBe('Range.');
      expect(said(lang, '99', RATE), lang).toBe('Range.');
      expect(said(lang, '-5', RATE), lang).toBe('Range.');
    }
    expect(said('en', '12,5', TERM)).toBe('Range.');
    expect(said('pt', '12.5', TERM)).toBe('Range.');
    expect(said('en', '1234567890123456', AMOUNT)).toBe('Range.');
    // No hint text, no hint: the field of the down payment in a guide passes none.
    expect(fieldMessage('6,5', 'en', RATE, { ...en.island, error: 'Range.' })).toBe('Range.');
  });
});

describe('the drafts that do not read (F16, item 3)', () => {
  const data = panelData('mortgage-calculator', 'en');
  const fresh = () => createStore(DEFS['mortgage-calculator'], data, startValues(data));

  it('tells only the passages, and never repaints the island', () => {
    const store = fresh();
    let repaints = 0;
    let passages = 0;
    store.subscribe(() => (repaints += 1));
    store.onDraft(() => (passages += 1));
    expect(store.drafting()).toBe(false);
    store.draft('fo-calc-r', true);
    expect([store.drafting(), passages]).toEqual([true, 1]);
    store.draft('fo-calc-r', true);
    store.draft('fo-calc-p', true);
    store.draft('fo-calc-r', false);
    expect([store.drafting(), passages]).toEqual([true, 1]);
    store.draft('fo-calc-p', false);
    expect([store.drafting(), passages]).toEqual([false, 2]);
    store.draft('fo-calc-p', false);
    expect(passages).toBe(2);
    expect(repaints).toBe(0);
  });

  it('ends the draft of a field when its error shows, before the island hears of the error', () => {
    const store = fresh();
    const seen: boolean[] = [];
    let passages = 0;
    store.subscribe(() => seen.push(store.drafting()));
    store.onDraft(() => (passages += 1));
    store.draft('fo-calc-r', true);
    store.wrong('fo-calc-r', { message: 'Enter a rate from 0 to 40%.', label: 'Rate' });
    expect(seen).toEqual([false]);
    expect([store.drafting(), passages]).toEqual([false, 2]);
    // The same error again does not repaint, and still ends a draft.
    store.draft('fo-calc-r', true);
    store.wrong('fo-calc-r', { message: 'Enter a rate from 0 to 40%.', label: 'Rate' });
    expect(seen).toEqual([false]);
    expect(store.drafting()).toBe(false);
  });

  it('keeps the draft of another field, and a field that stops showing an error keeps its own', () => {
    const store = fresh();
    store.draft('fo-calc-p', true);
    store.wrong('fo-calc-r', { message: 'Enter a rate from 0 to 40%.', label: 'Rate' });
    expect(store.drafting()).toBe(true);
    store.wrong('fo-calc-p', null);
    expect(store.drafting()).toBe(true);
    store.draft('fo-calc-p', false);
    expect(store.drafting()).toBe(false);
  });

  it('stops listening when asked', () => {
    const store = fresh();
    let passages = 0;
    const stop = store.onDraft(() => (passages += 1));
    stop();
    store.draft('fo-calc-r', true);
    expect(passages).toBe(0);
  });
});

describe('the control after the Download (F16, item 4)', () => {
  const control = (name: string, disabled = false, tabIndex = 0, drawn = true) => ({ name, disabled, tabIndex, drawn });

  it('is the first control after its place that the Tab reaches: the Copy link while the CSV is off', () => {
    expect(nextControl([control('Download CSV', true), control('Copy link'), control('costs')])?.name).toBe('Copy link');
    expect(nextControl([control('Download CSV'), control('Copy link')])?.name).toBe('Download CSV');
  });

  it('skips a control out of the order of the Tab or with no box, and finds none in an empty page', () => {
    expect(nextControl([control('sentence', false, -1), control('closed', false, 0, false), control('Add an area')])?.name).toBe('Add an area');
    expect(nextControl([control('Download CSV', true)])).toBeUndefined();
    expect(nextControl([])).toBeUndefined();
  });
});
