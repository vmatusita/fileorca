// The authorship of the guides and the calculators (F19a, decision 6; DECISOES § 763), over dist/ after `pnpm build`:
//  - the name in every "Reviewed by" line (the 10 file guides in en, pt and es, the 5 money guides in en and es, every
//    calculator and the hubs of the calculators) is a link to the About of the language, and the signature of a file guide
//    keeps its one <time> (tests/unit/guide-page.test.ts);
//  - the 40 guides end with the author box right before the related pages: the name with the link, who he is, and how the
//    numbers of the guide were obtained (a file guide: measured on the day of data/guides-measured.json; a money guide:
//    worked out by the calculator inside it). The box is out of the word count of a file guide, which checkFileGuide
//    still counts from 800 to 1,500 words without it, and it has the order of checkFileGuide.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { LANGS, pathFor, type Lang } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { longDate } from '../../src/i18n/dates.ts';
import { AUTHOR } from '../../src/platform/site.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';
import { MEASURED } from '../../src/tools/guides/measured.ts';
import { GUIDE_IDS, guidePathIn } from '../../src/tools/calc/registry.ts';
import { MAX_GUIDE_WORDS, MIN_GUIDE_WORDS, checkFileGuide, guideWords } from '../../scripts/lib/file-guides.ts';

const DIST = 'dist';
const BUILT = existsSync(join(DIST, 'index.html'));
const fileOf = (path: string): string => join(DIST, ...path.split('/').filter(Boolean), 'index.html');
const html = (path: string): string => readFileSync(fileOf(path), 'utf8');
const mainOf = (source: string): HTMLElement => {
  const main = parse(source).querySelector('main');
  if (!main) throw new Error('no <main>');
  return main;
};
const text = (element: HTMLElement | null | undefined): string => (element?.text ?? '').replace(/\s+/g, ' ').trim();

const FILE_GUIDE_PAGES = FILE_GUIDE_IDS.flatMap((id) => LANGS.map((lang) => ({ id, lang, path: FILE_GUIDES[id].paths[lang] })));
const MONEY_GUIDE_PAGES = GUIDE_IDS.flatMap((id) => LANGS.flatMap((lang) => {
  const path = guidePathIn(id, lang);
  return path ? [{ id, lang, path }] : [];
}));

/** Every page of dist/ (its path) with the "Reviewed by" line of a calculator, a hub or a money guide. */
function signedMoneyPages(): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name === 'index.html' && readFileSync(path, 'utf8').includes('data-ymyl="reviewed"')) out.push(`/${relative(DIST, dir).replace(/\\/g, '/')}/`.replace('//', '/'));
    }
  };
  walk(DIST);
  return out;
}

const langOf = (path: string): Lang => (path.startsWith('/pt/') ? 'pt' : path.startsWith('/es/') ? 'es' : 'en');

describe.runIf(BUILT)('the name of the author links to the About of the language (DECISOES § 763)', () => {
  it('in the signature of the 30 file guides, which keeps its one date', () => {
    expect(FILE_GUIDE_PAGES).toHaveLength(30);
    const wrong: string[] = [];
    for (const { lang, path } of FILE_GUIDE_PAGES) {
      const signature = mainOf(html(path)).querySelector('.fo-top .fo-reviewed');
      const link = signature?.querySelector('a');
      if (link?.getAttribute('href') !== pathFor('about', lang) || text(link) !== AUTHOR.name) wrong.push(`${path}: "${text(signature)}"`);
      if (signature?.querySelectorAll('time[datetime]').length !== 1) wrong.push(`${path}: ${signature?.querySelectorAll('time').length} datas`);
    }
    expect(wrong).toEqual([]);
  });

  it('in the "Reviewed by" line of every calculator, hub and money guide, in each language', () => {
    const pages = signedMoneyPages();
    // The money guides, the calculators and presets of the three languages and the hubs: well over a hundred pages.
    expect(pages.length).toBeGreaterThan(MONEY_GUIDE_PAGES.length + 50);
    for (const { path } of MONEY_GUIDE_PAGES) expect(pages).toContain(path);
    const wrong: string[] = [];
    for (const path of pages) {
      for (const line of mainOf(html(path)).querySelectorAll('[data-ymyl="reviewed"]')) {
        const link = line.querySelector('a[rel="author"]');
        if (link?.getAttribute('href') !== pathFor('about', langOf(path)) || text(link) !== AUTHOR.name) wrong.push(`${path}: "${text(line)}"`);
        if (line.querySelectorAll('time[datetime]').length === 0) wrong.push(`${path}: sem data`);
      }
    }
    expect(wrong).toEqual([]);
  });
});

describe.runIf(BUILT)('the author box at the end of the 40 guides (DECISOES § 763)', () => {
  it('is in the 30 file guides, right before the related pages, with the day of the measurement', () => {
    const wrong: string[] = [];
    for (const { id, lang, path } of FILE_GUIDE_PAGES) {
      const source = html(path);
      const main = mainOf(source);
      const box = main.querySelector('[data-content="author"]');
      const t = TEXTS[lang].about.author;
      if (!box) {
        wrong.push(`${path}: sem o quadro`);
        continue;
      }
      if (box.nextElementSibling?.getAttribute('data-content') !== 'related') wrong.push(`${path}: o quadro não vem logo antes das relacionadas`);
      const link = box.querySelector('a[rel="author"]');
      if (link?.getAttribute('href') !== pathFor('about', lang) || text(link) !== AUTHOR.name) wrong.push(`${path}: o link do nome`);
      if (text(box.querySelector('h2')) !== t.heading) wrong.push(`${path}: o título`);
      const time = box.querySelector('time');
      if (time?.getAttribute('datetime') !== MEASURED.measuredOn || text(time) !== longDate(MEASURED.measuredOn, lang)) wrong.push(`${path}: a data da medida`);
      const [before = ''] = t.fileGuide.split('{date}');
      if (!text(box).includes(before.trim())) wrong.push(`${path}: a frase de como os números foram obtidos`);
      if (box.hasAttribute('data-guide-text') || box.querySelector('[data-guide-text]')) wrong.push(`${path}: o quadro conta palavras`);
      // The word count of the guide does not change with the box, and checkFileGuide passes with it in its place.
      const without = source.replace(box.toString(), '');
      if (guideWords(source) !== guideWords(without)) wrong.push(`${path}: o quadro mudou a contagem`);
      const count = guideWords(source);
      if (count < MIN_GUIDE_WORDS || count > MAX_GUIDE_WORDS) wrong.push(`${path}: ${count} palavras`);
      // The default build has no ad (gate:conteudo runs checkFileGuide on the build with ads, where the AdSlots are).
      const problems = checkFileGuide(source, { toolPath: pathFor(FILE_GUIDES[id].tool, lang), lang }).filter((problem) => !problem.includes('AdSlot'));
      if (problems.length > 0) wrong.push(`${path}: ${problems.join('; ')}`);
    }
    expect(wrong).toEqual([]);
  });

  it('is in the 10 money guides, right before the related calculators, saying the calculator worked the numbers out', () => {
    expect(MONEY_GUIDE_PAGES).toHaveLength(10);
    const wrong: string[] = [];
    for (const { lang, path } of MONEY_GUIDE_PAGES) {
      const main = mainOf(html(path));
      const box = main.querySelector('[data-content="author"]');
      if (!box) {
        wrong.push(`${path}: sem o quadro`);
        continue;
      }
      if (box.nextElementSibling?.getAttribute('aria-labelledby') !== 'related') wrong.push(`${path}: o quadro não vem logo antes das relacionadas`);
      if (box.querySelector('a[rel="author"]')?.getAttribute('href') !== pathFor('about', lang)) wrong.push(`${path}: o link do nome`);
      if (!text(box).includes(TEXTS[lang].about.author.moneyGuide)) wrong.push(`${path}: a frase das contas`);
      if (box.querySelectorAll('time').length !== 0) wrong.push(`${path}: uma data no quadro de dinheiro`);
    }
    expect(wrong).toEqual([]);
  });
});

describe('checkFileGuide and the author box (scripts/lib/file-guides.ts)', () => {
  const PAGE = (box: string, order: 'before' | 'after' = 'before') => {
    const related = '<section data-content="related"><h2>Related</h2><a href="/compress-image/">Compress image</a></section>';
    return `<html><body><main>${order === 'before' ? box + related : related + box}</main></body></html>`;
  };
  const BOX = '<section data-content="author"><h2>About the author</h2><p><a href="/about/" rel="author">Victor Yuki Matusita</a> makes FileOrca.</p></section>';
  const problems = (source: string) => checkFileGuide(source, { toolPath: '/heic-to-jpg/' });

  it('asks for the box between the sources and the related pages, with the link to the About', () => {
    expect(problems(PAGE(''))).toContain('sem o quadro do autor ([data-content="author"])');
    expect(problems(PAGE(BOX))).not.toContain('sem o quadro do autor ([data-content="author"])');
    expect(problems(PAGE(BOX, 'after'))).toContain('as relacionadas vem antes de o quadro do autor');
    expect(problems(PAGE(BOX.replace('href="/about/"', 'href="/pt/sobre/"')))).toContain('o quadro do autor sem o link para o Sobre (/about/)');
    expect(problems(PAGE(BOX.replace('<section data-content="author">', '<section data-content="author" data-guide-text>')))).toContain('o quadro do autor entra na contagem de palavras do guia (data-guide-text)');
  });
});
