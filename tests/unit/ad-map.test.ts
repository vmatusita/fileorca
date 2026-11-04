// The ad map at build time (F12, decisions 3 and 4; DECISOES § 419 and § 420): the rules of the marks a view puts in
// <main>, the choice of the marks by the estimate at 360 px, the boxes with the unit of each position (none without its id),
// the multiplex, the rails, the one push script, and the words of <main> counted as gate:prontidao counts them.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { adsConfigFrom } from '../../src/ads/config.ts';
import { placeMarks } from '../../src/ads/estimate.ts';
import { AD_MARK, wordsOf } from '../../src/ads/html.ts';
import { AD_DISTANCE, AD_DISTANCE_SLACK, RAIL2_COLUMN, RAIL2_WORDS, adBoxHtml, chooseMarks, layOutAds, markProblems, pushScript, withoutMarks } from '../../src/ads/map.ts';
import { TEST_SLOTS } from '../../scripts/lib/test-build.ts';
import { visibleText } from '../../scripts/lib/conteudo.ts';
import { listFiles } from '../../scripts/lib/dist.ts';

const { first: FIRST, break: BREAK } = AD_MARK;
const CLIENT = 'ca-pub-0000000000000000';
const ALL = adsConfigFrom({ PUBLIC_ADSENSE_CLIENT: CLIENT, PUBLIC_ADSENSE_SLOTS: JSON.stringify(TEST_SLOTS), PUBLIC_ADS_ENABLED: 'true' });
const NONE = adsConfigFrom({});
/** A paragraph of 96 words and 479 characters: 10 lines of 48 at 360 px, 260 px and 12 px under it in the text. */
const P = `<p>${'word '.repeat(96).trim()}</p>`;
const section = (body: string): string => `<section class="fo-section fo-prose"><h2>Part</h2>${body}</section>`;

describe('the marks of a view', () => {
  it('accepts marks between sections, between paragraphs, between a paragraph and a list and between the questions', () => {
    const main = `<div class="fo-hero"><h1>Home</h1></div><section><h2>A</h2><ul class="fo-grid"><li>card</li></ul></section>${FIRST}${section(`${P}${BREAK}${P}${BREAK}<ul><li>item</li></ul>`)}${BREAK}<section><h2>Q</h2><div class="fo-faq"><details><summary>a</summary></details>${BREAK}<details><summary>b</summary></details></div></section>`;
    expect(markProblems(main)).toEqual([]);
  });

  it('refuses a mark inside a grid, a list, a question, a table, the panel, the schedule or a band, after a heading, against a table or beside "What we measured"', () => {
    const cases: [string, RegExp][] = [
      [`<section><h2>A</h2>${P}</section><ul class="fo-grid"><li>a</li>${BREAK}<li>b</li></ul>${FIRST}<p>end</p>`, /dentro de ul\.fo-grid/],
      [`${P}${FIRST}<section><h2>A</h2><ul><li>a</li>${BREAK}<li>b</li></ul></section>`, /dentro de ul/],
      [`${P}${FIRST}<div class="fo-faq"><details><summary>a</summary><div>${P}${BREAK}${P}</div></details></div>`, /dentro de details/],
      [`<div id="fo-tool-root"><p>a</p>${FIRST}<p>b</p></div>`, /dentro de div#fo-tool-root/],
      [`<div id="fo-calc-schedule"><p>a</p>${FIRST}<p>b</p></div>`, /dentro de div#fo-calc-schedule/],
      [`<div class="fo-hubband"><p>a</p>${FIRST}<p>b</p></div>`, /dentro de div\.fo-hubband/],
      [`<section><h2>A</h2>${FIRST}${P}</section>`, /logo depois de um título/],
      [`<section><h2>A</h2><table><tr><td>1</td></tr></table></section>${FIRST}${section(P)}`, /colada no fim de uma tabela/],
      [`${section(P)}${FIRST}<div class="fo-table-wrap"><table><tr><td>1</td></tr></table></div>`, /colada no começo de uma tabela/],
      [`${section(P)}${FIRST}<section data-content="measured"><h2>What we measured</h2>${P}</section>`, /ao lado da seção "O que medimos"/],
      [`<section aria-labelledby="measured"><h2 id="measured">M</h2>${P}</section>${FIRST}${section(P)}`, /ao lado da seção "O que medimos"/],
      [`${FIRST}${P}`, /no começo de main/],
      [`${P}${FIRST}`, /no fim de main/],
      [`${P}${FIRST}${P}${FIRST}${P}`, /2 marcas do 1º anúncio/],
      [`${P}${BREAK}${P}${FIRST}${P}`, /1 marca\(s\) antes da do 1º anúncio/],
      [`${P}${BREAK}${P}`, /nenhuma marca do 1º anúncio/],
    ];
    for (const [main, problem] of cases) expect(markProblems(main).join('; '), main).toMatch(problem);
    // A page with no ads may have no mark at all.
    expect(markProblems(P, false)).toEqual([]);
  });
});

describe('the choice of the marks by the estimate at 360 px', () => {
  it('lays out the text with 48 characters a line, 26 px a line and the 16 px gap of <main>', () => {
    const { marks, height } = placeMarks(`${P}${FIRST}${P}`);
    // 260 + 12 (the margin of a paragraph only in .fo-prose: none here) and the gap of 16 px.
    expect(marks).toEqual([{ kind: 'first', y: 260 }]);
    expect(height).toBe(260 + 16 + 260);
    expect(placeMarks(section(`${P}${BREAK}${P}`)).marks).toEqual([{ kind: 'break', y: 48 + 42 + 272 }]);
  });

  it(`puts the next ad at the first mark the estimate puts ${AD_DISTANCE} × ${AD_DISTANCE_SLACK} px or more from the one before, edge to edge`, () => {
    // Each paragraph takes 272 px in the text; the box margins (150 + 150, less the 12 px the box swallows) count too:
    // 288 + 272 × 4 = 1,376 is the first distance over 1,276.5.
    const text = Array.from({ length: 12 }, () => P).join(BREAK);
    const main = `${section(P)}${FIRST}${section(text)}`;
    const chosen = chooseMarks(main);
    expect(chosen[0]).toBe(0);
    const { marks } = placeMarks(main);
    for (let index = 1; index < chosen.length; index += 1) {
      const gap = 288 + (marks[chosen[index] ?? 0]?.y ?? 0) - (marks[chosen[index - 1] ?? 0]?.y ?? 0);
      expect(gap).toBeGreaterThanOrEqual(AD_DISTANCE * AD_DISTANCE_SLACK);
      // The mark just before would have been too close: the choice takes the first one that passes.
      const before = 288 + (marks[(chosen[index] ?? 0) - 1]?.y ?? 0) - (marks[chosen[index - 1] ?? 0]?.y ?? 0);
      expect(before).toBeLessThan(AD_DISTANCE * AD_DISTANCE_SLACK);
    }
    expect(chosen.length).toBe(3);
  });

  it('stops at conteudo-9, the last unit a position can have', () => {
    const text = Array.from({ length: 60 }, () => P).join(BREAK);
    expect(chooseMarks(`${section(P)}${FIRST}${section(text)}`)).toHaveLength(9);
  });
});

describe('the boxes of a page', () => {
  const page = `${section(P)}${FIRST}${section(Array.from({ length: 12 }, () => P).join(BREAK))}`;

  it('puts the unit of each position, the multiplex at the end of <main> and the rails, and no mark left', () => {
    const layout = layOutAds(page, { area: 'arquivos', label: 'Advertisements', config: ALL });
    expect(layout.units).toEqual(['conteudo', 'conteudo-2', 'conteudo-3', 'multiplex', 'lateral', 'lateral-2']);
    expect(layout.main).not.toContain('<!--fo-ad');
    expect(layout.main.trimEnd().endsWith('</div>')).toBe(true);
    expect(parse(layout.main).querySelectorAll(':scope > .fo-ad--multiplex')).toHaveLength(1);
    expect(parse(layout.rail).querySelectorAll('.fo-ad--rail').map((box) => box.getAttribute('data-ad-unit'))).toEqual(['lateral', 'lateral-2']);
    expect(layout.push).toBe(pushScript(CLIENT));
    expect(layout.words).toBeGreaterThanOrEqual(RAIL2_WORDS);
  });

  it(`leaves the lateral-2 out of a page with fewer than ${RAIL2_WORDS} words in <main>`, () => {
    const short = `<section><h2>A</h2><p>${'word '.repeat(400)}</p></section>${FIRST}<section><h2>B</h2><p>${'word '.repeat(150)}</p></section>`;
    const layout = layOutAds(short, { area: 'arquivos', label: 'Advertisements', config: ALL });
    expect(layout.words).toBeLessThan(RAIL2_WORDS);
    expect(layout.units).toEqual(['conteudo', 'multiplex', 'lateral']);
  });

  it('puts no box where the unit of the position has no id, and nothing at all without the variables', () => {
    const fewer = adsConfigFrom({ PUBLIC_ADSENSE_CLIENT: CLIENT, PUBLIC_ADSENSE_SLOTS: JSON.stringify({ arquivos: { conteudo: '1234567', 'conteudo-3': '2345678' } }), PUBLIC_ADS_ENABLED: 'true' });
    expect(layOutAds(page, { area: 'arquivos', label: 'Advertisements', config: fewer }).units).toEqual(['conteudo', 'conteudo-3']);
    const none = layOutAds(page, { area: 'arquivos', label: 'Advertisements', config: NONE });
    expect(none).toMatchObject({ units: [], rail: '', push: null });
    expect(none.main).toBe(withoutMarks(page));
    expect(none.main).not.toContain('fo-ad');
    // A view that marks a wrong place fails the build, with the variables or without.
    expect(() => layOutAds(`<section><h2>A</h2>${FIRST}${P}</section>`, { area: 'geral', label: 'Advertisements', config: NONE })).toThrow(/logo depois de um título/);
  });

  it('writes each box with its width, its unit, its id and its format, and no <ins>', () => {
    const box = (unit: Parameters<typeof adBoxHtml>[0]['unit']) => parse(adBoxHtml({ area: 'geral', unit, id: '9100000000', label: 'Publicidade' })).querySelector('div');
    expect(box('conteudo')?.getAttribute('class')).toBe('fo-ad fo-ad--content');
    expect(box('conteudo')?.getAttribute('data-ad-media')).toBeUndefined();
    expect(box('conteudo-2')?.getAttribute('class')).toBe('fo-ad fo-ad--content fo-ad--phone');
    expect(box('conteudo-2')?.getAttribute('data-ad-media')).toBe('(max-width: 459px)');
    expect(box('multiplex')?.getAttribute('data-ad-format')).toBe('autorelaxed');
    expect(box('multiplex')?.getAttribute('data-ad-media')).toBe('(min-width: 768px)');
    expect(box('lateral')?.getAttribute('data-ad-media')).toBe('(min-width: 1280px)');
    expect(box('lateral-2')?.getAttribute('class')).toBe('fo-ad fo-ad--rail fo-ad--rail2');
    expect(box('lateral-2')?.getAttribute('data-ad-fit')).toBe(String(RAIL2_COLUMN));
    expect(box('lateral-2')?.hasAttribute('hidden')).toBe(true);
    for (const unit of ['conteudo', 'conteudo-5', 'multiplex', 'lateral', 'lateral-2'] as const) {
      const html = adBoxHtml({ area: 'geral', unit, id: '9100000000', label: 'Publicidade' });
      expect(html).toContain('<span class="fo-ad__label">Publicidade</span>');
      expect(html).not.toMatch(/<ins|<script|role=|tabindex|aria-/);
    }
    expect(RAIL2_COLUMN).toBe(150 + 644 + 1200 + 644);
  });

  it('pushes only on fileorca.com, once per box that matches its width, with the unit the box says', () => {
    const script = pushScript(CLIENT);
    expect(script.startsWith('if(location.hostname==="fileorca.com"){')).toBe(true);
    expect(script).toContain('matchMedia(m).matches');
    expect(script).toContain('b.remove()');
    expect(script).toContain('b.removeAttribute("data-ad-media")');
    expect(script).toContain(`i.setAttribute("data-ad-client","${CLIENT}")`);
    expect(script).toContain('data-full-width-responsive');
    expect(script.match(/\.push\(\{\}\)/g)).toHaveLength(1);
    expect(script).not.toMatch(/setInterval|setTimeout|addEventListener|resize|refresh/);
  });
});

// The build places the lateral-2 by the words of <main> (600 or more); the gate asks 150 words for each box that shows on a
// computer, counted with its own reader. They have to agree on every page, or a page could have the lateral-2 the gate
// refuses (DECISOES § 420 and § 421).
const DIST = 'dist';
describe.runIf(existsSync(join(DIST, 'index.html')))('the words of <main> as the gate counts them', () => {
  it('counts the words of every page of dist/ like gate:prontidao', () => {
    const files = listFiles(DIST).filter((file) => file.endsWith('.html'));
    expect(files.length).toBeGreaterThanOrEqual(211);
    for (const file of files) {
      const html = readFileSync(file, 'utf8');
      const inner = parse(html).querySelector('main')?.innerHTML ?? '';
      const gate = visibleText(html, 'main', ['.fo-ad']).split(/\s+/).filter(Boolean).length;
      expect(wordsOf(inner), file).toBe(gate);
    }
  });
});
