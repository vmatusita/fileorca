// The small YAML reader of the tests (tests/unit/lib/mini-yaml.ts; DECISOES § 296): the subset our config files use,
// and a refusal for what it does not read, so a test never checks a half-read file.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseYaml } from './lib/mini-yaml.ts';

describe('mini-yaml', () => {
  it('reads mappings, sequences, flow lists, quotes, comments and block scalars', () => {
    const source = [
      '# comment',
      'version: 2',
      'name: "a: b" # trailing',
      "single: 'it''s'",
      'list: [minor, patch, "x y"]',
      'empty: {}',
      'items:',
      '  - plain',
      '  - key: value',
      '    other: 2',
      '  -',
      '    nested: true',
      'same:',
      '- a',
      '- b',
      'run: |',
      '  echo "#not a comment"',
      '',
      '  if true; then',
      '    echo ok',
      '  fi',
      'after: ~',
    ].join('\n');
    expect(parseYaml(source)).toEqual({
      version: 2,
      name: 'a: b',
      single: "it's",
      list: ['minor', 'patch', 'x y'],
      empty: {},
      items: ['plain', { key: 'value', other: 2 }, { nested: true }],
      same: ['a', 'b'],
      run: 'echo "#not a comment"\n\nif true; then\n  echo ok\nfi\n',
      after: null,
    });
  });

  it('refuses anchors, repeated keys, bad indentation and several documents', () => {
    expect(() => parseYaml('a: &x 1\nb: *x')).toThrow(/âncora/);
    expect(() => parseYaml('a: 1\na: 2')).toThrow(/repetida/);
    expect(() => parseYaml('a: 1\n   b: 2')).toThrow(/recuo/);
    expect(() => parseYaml('a: 1\n---\nb: 2')).toThrow(/documento/);
  });

  it('reads every workflow of the repository and the dependabot.yml', () => {
    const files = readdirSync('.github/workflows').map((name) => `.github/workflows/${name}`);
    for (const file of [...files, '.github/dependabot.yml']) {
      const parsed = parseYaml(readFileSync(file, 'utf8'));
      expect(parsed, file).toBeTypeOf('object');
    }
  });
});
