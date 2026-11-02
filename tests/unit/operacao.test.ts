// docs/OPERACAO.md stays true (F8, decision 16; DECISOES § 303): every `pnpm` script it cites exists, every path and
// workflow exists, and the titles of the issues it lists are the ones the workflows open, no more and no fewer.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const DOC = readFileSync('docs/OPERACAO.md', 'utf8');
const SCRIPTS = Object.keys((JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> }).scripts);
const WORKFLOWS = ['.github/workflows/ci.yml', '.github/workflows/pos-deploy.yml'];
/** pnpm commands that are not scripts of package.json. */
const PNPM_OWN = new Set(['install', 'exec', 'outdated', 'up', 'view']);

/** The text inside backticks. */
const code = [...DOC.matchAll(/`([^`\n]+)`/g)].map((match) => match[1] ?? '');

/** The issue titles a workflow opens, with its variables written as the document writes them. */
function workflowTitles(): string[] {
  return WORKFLOWS.flatMap((file) => {
    const source = readFileSync(file, 'utf8');
    const assigned = /title="([^"]+)"/.exec(source)?.[1];
    return [...source.matchAll(/gh issue create --title "([^"]+)"/g)].map((match) => (match[1] === '$title' ? (assigned ?? '') : (match[1] ?? '')));
  }).map((title) => title.replaceAll('${COMMIT:0:7}', '<commit>').replaceAll('$PR', '<n>'));
}

describe('docs/OPERACAO.md', () => {
  it('cites only pnpm scripts that exist', () => {
    const cited = code.flatMap((text) => [...text.matchAll(/\bpnpm ([a-z][\w:-]*)/g)].map((match) => match[1] ?? ''));
    expect(cited.length).toBeGreaterThan(0);
    for (const name of cited) expect(SCRIPTS.includes(name) || PNPM_OWN.has(name), `pnpm ${name}`).toBe(true);
  });

  it('cites only files and folders of the repository that exist', () => {
    const paths = code.filter((text) => /^(?:\.github|src|scripts|tests|docs|data|fixtures|public)\/[\w./-]+$|^[\w-]+\.(?:md|json|jsonc|ts|yml)$|^\.node-version$/.test(text));
    expect(paths.length).toBeGreaterThan(10);
    for (const path of paths) expect(existsSync(path), path).toBe(true);
  });

  it('cites only workflows that exist', () => {
    for (const match of DOC.matchAll(/gh workflow run ([\w.-]+\.yml)/g)) expect(existsSync(`.github/workflows/${match[1]}`), match[1]).toBe(true);
    for (const match of DOC.matchAll(/\.github\/workflows\/([\w.-]+\.yml)/g)) expect(existsSync(`.github/workflows/${match[1]}`), match[1]).toBe(true);
  });

  it('lists exactly the titles of the issues the workflows open, each with a section', () => {
    const listed = [...DOC.matchAll(/^- Título: "([^"]+)"$/gm)].map((match) => match[1]);
    const titles = workflowTitles();
    expect(titles).toHaveLength(4);
    expect([...listed].sort()).toEqual([...titles].sort());
    for (const title of titles) expect(DOC, title).toContain(title.includes('Merge') ? `"${title}"` : `## Issue "${title}"`);
  });

  it('has a section for every alert of the F8', () => {
    for (const heading of [
      'Issue "Pós-deploy falhou para <commit>"',
      'Issues do job de merge',
      'PR de major do Dependabot',
      'Issue "CI vermelho na PR #<n> do Dependabot"',
      'PR de GitHub Actions do Dependabot',
      'Execução "Dependabot Updates" vermelha',
      'Build do Workers Builds vermelho',
      'Queda no UptimeRobot',
      'Googlebot barrado',
      'Minutos do Actions acabando',
      'Defeito no service worker (desativação de emergência)',
      'Pico de `tool_error` no GA4',
      'E-mail de política do AdSense',
      'Uma parte do CI com `ENOSPC`',
      'Revisão mensal (30 minutos)',
      'Revisão anual (meia hora)',
      'Configuração que é sua',
      'Pendências',
    ]) {
      expect(DOC, heading).toContain(`## ${heading}`);
    }
  });
});
