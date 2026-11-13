// The How it works page never names the code host of FileOrca (F19a, decision 7; DECISOES § 759; Victor's choice): in
// the three languages, the built page says neither "GitHub", "repository" ("repositório", "repositorio"), "open source"
// ("open-source", "código aberto", "código abierto"), in its text, its title, its description or any attribute a person
// can read, nor links anywhere on github.com. The Licenses page keeps its links to the libraries; the table of How it
// works links only to the Licenses page (tests/unit/how-it-works.test.ts). Read over dist/ after `pnpm build`.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { LANGS, pathFor } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';

const FORBIDDEN = /github|reposit[oó]r|open[\s-]+source|c[óo]digo\s+(?:aberto|abierto)/i;

/** The words a person can read on a page, and every address it links to. */
function readable(html: string): { text: string; hrefs: string[] } {
  const root = parse(html);
  root.querySelectorAll('script, style').forEach((element) => element.remove());
  const attributes = root.querySelectorAll('[alt], [title], [aria-label], [placeholder], meta[content]').flatMap((element) => ['alt', 'title', 'aria-label', 'placeholder', 'content'].map((name) => element.getAttribute(name) ?? ''));
  return {
    text: [root.querySelector('title')?.text ?? '', root.querySelector('body')?.structuredText ?? '', ...attributes].join('\n'),
    hrefs: root.querySelectorAll('[href]').map((element) => element.getAttribute('href') ?? ''),
  };
}

/** What a page has that this rule forbids. */
function forbidden(html: string): string[] {
  const { text, hrefs } = readable(html);
  const words = [...text.matchAll(new RegExp(FORBIDDEN.source, 'gi'))].map((match) => match[0]);
  return [...words, ...hrefs.filter((href) => /^(?:https?:)?\/\/(?:[\w-]+\.)*github\.com(?:[/:]|$)/i.test(href))];
}

/** Every string of a text file of the page, at any depth. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('How it works never names the code host of FileOrca', () => {
  it('has none of the words in its texts, in the three languages', () => {
    for (const lang of LANGS) expect(strings(TEXTS[lang]['how-it-works']).filter((text) => FORBIDDEN.test(text)), lang).toEqual([]);
  });

  it('catches each word and a link to github.com on a page made here, and leaves a page without them alone (controls)', () => {
    for (const word of ['GitHub', 'the repository', 'o repositório', 'el repositorio', 'open source', 'open-source', 'código aberto', 'código abierto']) {
      expect(forbidden(`<html><head><title>x</title></head><body><p>See ${word}.</p></body></html>`), word).not.toEqual([]);
    }
    expect(forbidden('<html><head><title>x</title></head><body><a href="https://github.com/vmatusita/fileorca">code</a></body></html>')).toEqual(['https://github.com/vmatusita/fileorca']);
    expect(forbidden('<html><head><title>x</title><meta name="description" content="The GitHub page"></head><body><p>x</p></body></html>')).toEqual(['GitHub']);
    expect(forbidden('<html><head><title>How it works</title></head><body><p>Files stay on your device.</p><a href="/licenses/">Licenses</a></body></html>')).toEqual([]);
  });
});

const DIST = 'dist';
const BUILT = existsSync(join(DIST, 'index.html'));
const html = (path: string): string => readFileSync(join(DIST, ...path.split('/').filter(Boolean), 'index.html'), 'utf8');

describe.runIf(BUILT)('the built How it works page, in the three languages', () => {
  for (const lang of LANGS) {
    it(`says none of the words and links nowhere on github.com (${lang})`, () => {
      expect(forbidden(html(pathFor('how-it-works', lang))), lang).toEqual([]);
    });
  }

  it('the Licenses page keeps its links to the libraries (the detector sees them there: a positive control)', () => {
    for (const lang of LANGS) expect(forbidden(html(pathFor('licenses', lang))).some((found) => /github\.com/i.test(found)), lang).toBe(true);
  });
});
