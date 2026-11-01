// No number typed by hand in a file guide (prompt F5b, decisions 3 and 5.1; DECISOES § 189). Every digit of a guide's
// texts sits in a {placeholder}, which the page fills from data/guides-measured.json or from an official figure of the
// guide's own short list (`facts`, each with a source the guide cites), or in a technical name of the guide's `names`
// ("Windows 11", "H.264"). Anything else fails: a measured result written by hand would not change when the measurement
// does. The voice of the design README holds too: no forbidden word, emoji, arrow or exclamation.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkVoice } from '../../scripts/lib/design-checks.ts';
import enCommon from '../../src/i18n/en/common.ts';
import shared from '../../src/i18n/en/file-guides.ts';
import type { FileGuideTexts } from '../../src/i18n/types.ts';
import type { MeasuredFile } from '../../src/tools/guides/measured-types.ts';
import { FILE_GUIDE_IDS, type FileGuideId } from '../../src/tools/guides/registry.ts';

const texts = import.meta.glob<FileGuideTexts>('/src/i18n/en/guide-*.ts', { import: 'default', eager: true });
const measured = JSON.parse(readFileSync('data/guides-measured.json', 'utf8')) as MeasuredFile;

const textsOf = (id: FileGuideId): FileGuideTexts => {
  const found = texts[`/src/i18n/en/guide-${id.replace(/^guides-/, '')}.ts`];
  if (!found) throw new Error(`no texts for ${id}`);
  return found;
};

/** Every string of a value with its path, except the keys that are data, not prose: the sources' links and dates. */
function prose(value: unknown, path: string, out: [string, string][] = []): [string, string][] {
  if (typeof value === 'string') out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((item, index) => prose(item, `${path}[${index}]`, out));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (['href', 'read', 'id', 'source', 'facts', 'names'].includes(key)) continue;
      prose(item, `${path}.${key}`, out);
    }
  }
  return out;
}

/** The digits left in a text once its placeholders and its technical names are taken out. */
function strayDigits(text: string, names: readonly string[]): string[] {
  let rest = text.replace(/\{\w+\}/g, ' ');
  for (const name of [...names].sort((a, b) => b.length - a.length)) rest = rest.split(name).join(' ');
  return [...rest.matchAll(/[^\s]*\d[^\s]*/g)].map((match) => match[0]);
}

/** Problems of one guide's texts: stray digits, facts with no source, sources no fact or table needs are fine. */
function numberProblems(id: string, t: FileGuideTexts): string[] {
  const problems: string[] = [];
  for (const [path, text] of prose(t, id)) {
    // The table heads and captions describe columns; they may not carry numbers either.
    const stray = strayDigits(text, t.names);
    if (stray.length) problems.push(`${path}: algarismo fora de placeholder: ${stray.join(', ')}`);
  }
  const sources = new Set(t.sources.map((source) => source.id));
  for (const [name, fact] of Object.entries(t.facts)) {
    if (!sources.has(fact.source)) problems.push(`${id}.facts.${name}: a fonte ${fact.source} não está nas fontes do guia`);
    if (!/\d|free/i.test(fact.text)) problems.push(`${id}.facts.${name}: um fato oficial sem número`);
  }
  for (const source of t.sources) {
    if (!/^https:\/\//.test(source.href)) problems.push(`${id}: a fonte ${source.id} sem link https`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(source.read)) problems.push(`${id}: a fonte ${source.id} sem a data da leitura`);
  }
  for (const name of t.names) if (!/\d/.test(name)) problems.push(`${id}.names: "${name}" não tem algarismo (não precisa estar na lista)`);
  return problems;
}

describe('the numbers of the file guides', () => {
  it('are all placeholders, official figures with a source, or technical names', () => {
    const problems = FILE_GUIDE_IDS.flatMap((id) => numberProblems(id, textsOf(id)));
    expect(problems).toEqual([]);
  });

  it('cite, in guide 3, every page the measured sizes were read on', () => {
    const t = textsOf('guides-social-media-image-sizes');
    const cited = new Set(t.sources.map((source) => source.href));
    for (const size of measured.guides['guides-social-media-image-sizes'].official ?? []) expect(cited.has(size.source.href), size.id).toBe(true);
  });

  it('hold no stray digit in the texts every guide shares, nor in the cards of the guides', () => {
    const { names, ...rest } = shared;
    for (const [path, text] of prose(rest, 'file-guides')) expect(strayDigits(text, names), path).toEqual([]);
    for (const id of FILE_GUIDE_IDS) {
      const blurb = enCommon.fileGuides[id];
      expect(strayDigits(`${blurb.name} ${blurb.description}`, []), id).toEqual([]);
    }
  });

  it('follow the voice of the design README: no forbidden word, emoji, arrow or exclamation', () => {
    for (const id of FILE_GUIDE_IDS) expect(checkVoice(textsOf(id), id), id).toEqual([]);
    expect(checkVoice(shared, 'file-guides')).toEqual([]);
    expect(checkVoice(enCommon.fileGuides, 'fileGuides')).toEqual([]);
  });
});

describe('the number check catches what it should (controls)', () => {
  const base = textsOf('guides-heic-to-jpg-on-windows');
  const variant = (patch: Partial<FileGuideTexts>): FileGuideTexts => ({ ...base, ...patch });

  it('passes a guide whose numbers are placeholders, facts and names', () => {
    expect(numberProblems('control', base)).toEqual([]);
    expect(strayDigits('The JPG was {ratio_more} bigger on Windows 11.', ['Windows 11'])).toEqual([]);
  });

  it('fails a measured result typed by hand, in prose, a list, a heading or a table head', () => {
    expect(numberProblems('control', variant({ intro: ['The JPGs were 25% bigger.'] })).join()).toMatch(/algarismo fora de placeholder: 25%/);
    expect(numberProblems('control', variant({ sections: [{ heading: 'Our 10 photos', paragraphs: ['x'] }] })).join()).toMatch(/algarismo fora de placeholder: 10/);
    expect(numberProblems('control', variant({ sections: [{ heading: 'x', paragraphs: ['x'], list: ['about 3 MB'] }] })).join()).toMatch(/algarismo fora de placeholder: 3/);
    expect(numberProblems('control', variant({ tables: [{ heading: 'x', caption: 'x', head: ['Size at 300 ppi'] }] })).join()).toMatch(/algarismo fora de placeholder: 300/);
    expect(strayDigits('Install it on Windows 12.', ['Windows 11'])).toEqual(['12.']);
  });

  it('fails an official figure whose source the guide does not cite, and a source with no date', () => {
    expect(numberProblems('control', variant({ facts: { limit: { text: '25 MB', source: 'nowhere' } } })).join()).toMatch(/a fonte nowhere não está nas fontes do guia/);
    const sources = [{ id: 'x', label: 'X', href: 'https://example.com/', read: 'today' }];
    expect(numberProblems('control', variant({ sources, facts: {} })).join()).toMatch(/sem a data da leitura/);
  });

  it('catches a forbidden word and an exclamation in a guide', () => {
    expect(checkVoice(variant({ lead: 'A seamless way to convert!' }), 'control').length).toBeGreaterThan(0);
  });
});
