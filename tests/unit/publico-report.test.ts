// Output of the public-repository audit (scripts/publico/lib/report.ts and scripts/publico/auditar.ts, DECISOES § 332):
// the detail only in .cache/, the terminal only counts, and the parsers of what git and gitleaks print.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { AuditContext } from '../../scripts/publico/lib/classify.ts';
import {
  BatchReader,
  commitChanges,
  commitsWithText,
  describeRun,
  parseBatchCheck,
  parseGitleaks,
  parseIdentities,
  parseLsTree,
  parseMessages,
  parseOrigem,
  parseRawLog,
  readGitleaksLog,
  stringsOf,
} from '../../scripts/publico/lib/git-parse.ts';
import { REPORT_PATH, aggregate, renderReport, safeOutput, summaryLines, type Occurrence, type ScanStats } from '../../scripts/publico/lib/report.ts';

const SHA = (seed: string): string => seed.repeat(40).slice(0, 40);

const context: AuditContext = {
  publicValues: new Set(['contato@marca-ficticia-auditoria.net']),
  brandDomains: new Set(['marca-ficticia-auditoria.net']),
  ownerEmails: new Set(),
  ownerNames: new Set(),
  samplePaths: new Set(),
  sampleCoordinates: new Set(),
};

const stats: ScanStats = { refs: 3, pullRefs: 2, commits: 10, blobs: 40, textBlobs: 30, imageBlobs: 8, skippedBlobs: 2, skippedKinds: { pdf: 2 }, localBlobs: 1, gitleaksHistory: 'com achados', gitleaksTree: 'sem achados' };

const occurrences: Occurrence[] = [
  { type: 'email', value: 'Pessoa.Distinta@caixa-terceiro-ficticia.net', paths: ['docs/a.md'], commits: [SHA('a')], source: 'historico' },
  { type: 'email', value: 'pessoa.distinta@caixa-terceiro-ficticia.net', paths: ['docs/b.md'], commits: [SHA('b')], source: 'arvore' },
  { type: 'gps', value: '-12.345678, 98.765432', paths: ['docs/foto.jpg'], commits: [SHA('c')], source: 'historico' },
  { type: 'email', value: 'contato@marca-ficticia-auditoria.net', paths: ['src/x.ts'], commits: [SHA('a')], source: 'arvore' },
];

describe('aggregate', () => {
  const refsOf = (commit: string): string[] => (commit === SHA('a') ? ['refs/heads/main'] : ['refs/pull/7/head']);
  const items = aggregate(occurrences, context, refsOf);

  it('deduplicates by value (case of an e-mail does not matter), counts and joins where it is', () => {
    const third = items.find((item) => item.type === 'email' && item.category === 'terceiro');
    expect(items).toHaveLength(3);
    expect(third?.occurrences).toBe(2);
    expect(third?.paths).toEqual(['docs/a.md', 'docs/b.md']);
    expect(third?.refs).toEqual(['refs/heads/main', 'refs/pull/7/head']);
    expect(third?.inTree).toBe(true);
  });

  it('the terminal lines carry counts and never a value', () => {
    const lines = summaryLines(items, stats).join('\n');
    for (const occurrence of occurrences) expect(lines.toLowerCase()).not.toContain(occurrence.value.toLowerCase());
    expect(lines).not.toContain('98.765');
    expect(lines).toContain('achados únicos: 3');
    expect(lines).toContain('dado de terceiro: 1');
    expect(lines).toContain('dado do Victor: 1');
    expect(lines).toContain('2 refs/pull/*');
  });

  it('the .cache/ report carries the values, with the warning not to copy them', () => {
    const report = renderReport(items, stats, { date: '2026-11-03', origin: 'https://example.invalid/repo.git', mirrorHead: SHA('d'), localHead: SHA('e'), gitleaksVersion: '0.0.0', gitleaksHistoryArgs: 'x', limits: ['nada'] });
    expect(report.toLowerCase()).toContain('pessoa.distinta@caixa-terceiro-ficticia.net');
    expect(report).toContain('-12.345678, 98.765432');
    expect(report).toContain('não copie nada daqui');
  });
});

describe('safeOutput', () => {
  const root = resolve('.');

  it('accepts a path inside .cache/', () => {
    expect(safeOutput(REPORT_PATH, root)).toBe(join(root, '.cache', 'auditoria-publico.md'));
    expect(safeOutput('.cache/auditoria/x.json', root)).toBe(join(root, '.cache', 'auditoria', 'x.json'));
  });

  it('refuses anything outside .cache/, .cache itself and an escape with ..', () => {
    for (const target of ['README.md', 'docs/auditoria.md', '.cache', '.cache/../docs/x.md', resolve(root, '..', 'x.md'), '.cachex/y.md']) {
      expect(() => safeOutput(target, root)).toThrow(/só grava dentro de \.cache\//);
    }
  });

  it('the script stops before any work when --saida points outside .cache/', () => {
    const target = 'docs/auditoria-que-nao-pode-existir.md';
    const result = spawnSync(process.execPath, ['scripts/publico/auditar.ts', '--saida', target], { encoding: 'utf8' });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('só grava dentro de .cache/');
    expect(result.stdout).not.toContain('espelho');
    expect(existsSync(target)).toBe(false);
  });
});

describe('parsers', () => {
  it('batch-check, ls-tree, identities and messages', () => {
    expect(parseBatchCheck(`${SHA('a')} blob 12\n${SHA('b')} tree 40\nlixo\n`)).toEqual([
      { sha: SHA('a'), type: 'blob', size: 12 },
      { sha: SHA('b'), type: 'tree', size: 40 },
    ]);
    expect(parseLsTree(`100644 blob ${SHA('a')}\tdocs/a b.md\n100644 blob ${SHA('a')}\tdocs/c.md\n040000 tree ${SHA('b')}\tdocs\n`)).toEqual(new Map([[SHA('a'), ['docs/a b.md', 'docs/c.md']]]));
    expect(parseIdentities(`${SHA('a')}\tAna\tana@caixa-ficticia-auditoria.net\tGitHub\tnoreply@github.com\n`)).toEqual([{ commit: SHA('a'), authorName: 'Ana', authorEmail: 'ana@caixa-ficticia-auditoria.net', committerName: 'GitHub', committerEmail: 'noreply@github.com' }]);
    expect(parseMessages(`${SHA('a')}\u0000feat: x\n\nCo-Authored-By: y\n\u0000\n${SHA('b')}\u0000fix\n\u0000`)).toEqual([
      { commit: SHA('a'), body: 'feat: x\n\nCo-Authored-By: y\n' },
      { commit: SHA('b'), body: 'fix\n' },
    ]);
  });

  it('the raw log gives each blob its commits and paths, and which commits have text', () => {
    const zero = '0'.repeat(40);
    const raw = [`@${SHA('1')}`, '', `:000000 100644 ${zero} ${SHA('a')} A\tdocs/a.md`, `:000000 100644 ${zero} ${SHA('f')} A\tfixtures/x.jpg`, `@${SHA('2')}`, '', `:100644 000000 ${SHA('a')} ${zero} D\tdocs/a.md`, `@${SHA('3')}`, '', `:000000 100644 ${zero} ${SHA('d')} A\tfixtures/y.jpg`, `@${SHA('4')}`, ''].join('\n');
    expect(parseRawLog(raw)).toEqual(
      new Map([
        [SHA('a'), [{ commit: SHA('1'), path: 'docs/a.md' }]],
        [SHA('f'), [{ commit: SHA('1'), path: 'fixtures/x.jpg' }]],
        [SHA('d'), [{ commit: SHA('3'), path: 'fixtures/y.jpg' }]],
      ]),
    );
    const changes = commitChanges(raw);
    expect([...changes.keys()]).toEqual([SHA('1'), SHA('2'), SHA('3')]);
    // commit 3 only adds a binary file: git log -p has no text for it, and gitleaks does not count it
    expect(commitsWithText(changes, (blob) => blob === SHA('a'))).toBe(2);
  });

  it('gitleaks: the JSON report, the log and a run that stopped on a git error', () => {
    const json = JSON.stringify([{ RuleID: 'generic-api-key', Secret: 's', Match: 'k = s', File: 'a\\b.ts', Commit: SHA('a'), StartLine: 3 }]);
    expect(parseGitleaks(json)).toEqual([{ rule: 'generic-api-key', secret: 's', match: 'k = s', file: 'a/b.ts', commit: SHA('a'), line: 3 }]);
    expect(parseGitleaks('')).toEqual([]);
    const stopped = readGitleaksLog(7, '\u001b[31m11:15AM ERR\u001b[0m [git] fatal: unable to read files to diff\n11:15AM INF 225 commits scanned.\n');
    expect(stopped).toMatchObject({ status: 'com achados', commitsScanned: 225, errors: ['11:15AM ERR [git] fatal: unable to read files to diff'] });
    expect(describeRun(stopped, 564)).toContain('INCOMPLETO');
    const complete = readGitleaksLog(7, '11:15AM INF 564 commits scanned.\n');
    expect(describeRun(complete, 564)).toBe('com achados, 564 commits lidos de 564 com mudança de texto');
    expect(describeRun(readGitleaksLog(0, ''))).toBe('sem achados');
    expect(describeRun(readGitleaksLog(1, ''))).toContain('erro (código 1)');
  });

  it('ORIGEM.md rows and the strings of a module', () => {
    expect(parseOrigem('| Arquivo | O que é |\n| --- | --- |\n| images/a-gps.jpg | foto |\n| pdf/b.pdf | pdf |\n')).toEqual(new Set(['fixtures/images/a-gps.jpg']));
    expect(stringsOf({ A: 'Valor-Um', B: { c: 'outro valor', d: ['lista-item'] }, e: true, f: 'ab' })).toEqual(new Set(['valor-um', 'outro valor', 'lista-item']));
  });

  it('BatchReader reads objects split across chunks, and a missing one', () => {
    const encoder = new TextEncoder();
    const stream = encoder.encode(`${SHA('a')} blob 5\nhello\n${SHA('b')} missing\n${SHA('c')} blob 3\nabc\n`);
    const reader = new BatchReader();
    const objects = [...reader.push(stream.subarray(0, 30)), ...reader.push(stream.subarray(30, 47)), ...reader.push(stream.subarray(47))];
    expect(objects.map((object) => [object.sha, object.type, new TextDecoder().decode(object.data)])).toEqual([
      [SHA('a'), 'blob', 'hello'],
      [SHA('b'), 'missing', ''],
      [SHA('c'), 'blob', 'abc'],
    ]);
  });
});
