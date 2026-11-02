// The structure of .github/dependabot.yml (F8, decisions 11 and 12; DECISOES § 298). GitHub only validates the file
// after it reaches main, so this checks what the run decided: npm and GitHub Actions at the root, monthly in São Paulo
// time, one group of minor and patch per ecosystem (a major always gets its own PR, which the merge job leaves to the
// owner), a cooldown, a limit of open PRs, Conventional Commits, and an ignore only with its reason written next to it.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseYaml, type YamlValue } from './lib/mini-yaml.ts';

const SOURCE = readFileSync('.github/dependabot.yml', 'utf8');
const config = parseYaml(SOURCE) as Record<string, YamlValue>;
const updates = config['updates'] as Record<string, YamlValue>[];
const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};
const nodeMajor = Number(readFileSync('.node-version', 'utf8').trim().split('.')[0]);

function byEcosystem(name: string): Record<string, YamlValue> {
  const entry = updates.find((update) => update['package-ecosystem'] === name);
  if (!entry) throw new Error(`dependabot.yml sem ${name}`);
  return entry;
}

describe('.github/dependabot.yml', () => {
  it('is version 2 with exactly npm and github-actions at the root', () => {
    expect(config['version']).toBe(2);
    expect(updates.map((update) => update['package-ecosystem']).sort()).toEqual(['github-actions', 'npm']);
    for (const update of updates) expect(update['directory']).toBe('/');
  });

  it.each(['npm', 'github-actions'])('%s runs monthly, at a set hour, in São Paulo time', (name) => {
    const schedule = byEcosystem(name)['schedule'] as Record<string, YamlValue>;
    expect(schedule['interval']).toBe('monthly');
    expect(schedule['time']).toMatch(/^\d{2}:\d{2}$/);
    expect(schedule['timezone']).toBe('America/Sao_Paulo');
  });

  it.each(['npm', 'github-actions'])('%s has one group, of minor and patch only, for every dependency', (name) => {
    const groups = byEcosystem(name)['groups'] as Record<string, Record<string, YamlValue>>;
    const entries = Object.entries(groups);
    expect(entries).toHaveLength(1);
    const [, group] = entries[0]!;
    expect(group['patterns']).toEqual(['*']);
    expect([...(group['update-types'] as string[])].sort()).toEqual(['minor', 'patch']);
    expect(group['applies-to']).toBe('version-updates');
    expect(JSON.stringify(group)).not.toContain('major');
  });

  it.each(['npm', 'github-actions'])('%s waits a cooldown and caps the open PRs', (name) => {
    const update = byEcosystem(name);
    const cooldown = update['cooldown'] as Record<string, YamlValue>;
    expect(cooldown['default-days']).toBeGreaterThanOrEqual(3);
    const limit = update['open-pull-requests-limit'];
    expect(limit).toBeTypeOf('number');
    expect(limit).toBeGreaterThanOrEqual(1);
    expect(limit).toBeLessThanOrEqual(5);
  });

  it.each(['npm', 'github-actions'])('%s writes Conventional Commits', (name) => {
    const message = byEcosystem(name)['commit-message'] as Record<string, YamlValue>;
    expect(message['prefix']).toMatch(/^(chore|build|ci)$/);
    expect(message['include']).toBe('scope');
  });

  it('adds no labels, reviewers, assignees, registries or secrets', () => {
    for (const update of updates) {
      for (const key of ['labels', 'reviewers', 'assignees', 'registries', 'milestone']) expect(update[key], key).toBeUndefined();
    }
    expect(config['registries']).toBeUndefined();
    expect(SOURCE).not.toMatch(/secrets\.|pull_request_target/);
  });

  it('ignores only with the reason written in a comment right above the entry', () => {
    const lines = SOURCE.split('\n');
    const ignoreLines = lines.flatMap((line, i) => (/^\s*- dependency-name:/.test(line) ? [i] : []));
    for (const update of updates) {
      for (const entry of (update['ignore'] as Record<string, YamlValue>[] | undefined) ?? []) {
        expect(entry['dependency-name'], 'ignore sem nome').toBeTypeOf('string');
      }
    }
    for (const i of ignoreLines) {
      expect(lines[i - 1], `ignore da linha ${i + 1} sem a razão no comentário de cima`).toMatch(/^\s*# .*(§|DECISOES)/);
    }
  });

  it('keeps Node at the major of .node-version (DECISOES § 17 and § 37)', () => {
    const ignore = (byEcosystem('npm')['ignore'] as Record<string, YamlValue>[] | undefined) ?? [];
    const typesNode = ignore.find((entry) => entry['dependency-name'] === '@types/node');
    expect(typesNode?.['update-types']).toEqual(['version-update:semver-major']);
    expect(pkg.devDependencies['@types/node']).toMatch(new RegExp(`^\\^${nodeMajor}\\.`));
  });
});
