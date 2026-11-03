// docs/PENDENCIAS.md, the single list of what is still open (F8, decision 3; DECISOES § 304): every item the decision
// names is there, every row says its source, severity, defect, fix and who solves it, and every low finding of the
// reviews of the F8 (REVISAO-F4-F7.md and REVISAO-F8.md) has its row.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const DOC = readFileSync('docs/PENDENCIAS.md', 'utf8');
/** The rows of the six-column tables: id, source, severity, defect, fix, who. */
const rows = DOC.split('\n')
  .filter((line) => line.startsWith('| ') && !line.startsWith('| ---') && !line.startsWith('| Id ') && !line.startsWith('| Grupo ') && !line.startsWith('| Item '))
  .map((line) => line.slice(2, -2).split(' | '))
  .filter((cells) => cells.length === 6);

describe('docs/PENDENCIAS.md', () => {
  it('has the items the decision 3 of the F8 names', () => {
    const ids = rows.map((cells) => cells[0]);
    for (const id of ['F2 2b', '§ 283', 'F7 e-1', 'Worktrees', 'Fontes', 'F3 d-02', 'F3 c-04', 'F3 c-08', 'F3 b-07', 'F3 e-05']) expect(ids, id).toContain(id);
    // The F9 closed the § 242 (pnpm verificar --partes, DECISOES § 329): it left the open rows for the table of what was
    // fixed, and never disappears from the list (DECISOES § 341).
    expect(ids).not.toContain('§ 242');
    expect(DOC).toMatch(/^\| § 242: .+ \| F9, § 329: .+ \|$/m);
    expect(DOC).toContain('§ 85');
    expect(DOC).toContain('§ 103');
    expect(DOC).toMatch(/ACOG CO 700/);
    expect(DOC).toMatch(/DTIC/);
  });

  it('says, for every row, where it comes from, how serious it is, what is wrong, the fix and who solves it', () => {
    expect(rows.length).toBeGreaterThan(100);
    for (const [id, source, severity, defect, fix, who] of rows) {
      expect(source, id).not.toBe('');
      expect(severity, id).toMatch(/^(?:baixo|médio|alto)/);
      expect(defect?.length, id).toBeGreaterThan(20);
      expect(fix?.length, id).toBeGreaterThan(10);
      expect(who, id).toMatch(/^(?:Run|Victor)/);
    }
  });

  // Review F8 c-5 (DECISOES § 307): the list was checked against ids written here by hand, and the low F3 a-05 was
  // missing. Every finding the reviews F3 to F7 left open is read from them: a row of their tables whose destination is
  // not fixed, refuted, a duplicate or registered as a decision, and the lows the F5b lists in "Os baixos que ficam".
  // Each must be in the list, under its own id ("F3 a-05") or in the source of a row ("REVISAO-F6.md d-5 e g-7").
  it('has every finding the reviews F3 to F7 left open', () => {
    const covered = new Set<string>();
    for (const match of DOC.matchAll(/REVISAO-([A-Za-z0-9-]+)\.md ([^|;]*)/g)) for (const id of (match[2] ?? '').matchAll(/\b[A-Za-z]+-\d+\b/g)) covered.add(`${match[1]} ${id[0]}`);
    for (const match of DOC.matchAll(/\b(F\d[a-z]?(?:-F\d)?) ([A-Za-z]+-\d+)\b/g)) covered.add(`${match[1]} ${match[2]}`);
    const closed = /orrigid|efutad|duplic|mesmo defeito|feito pela|resolvid|já está|registrad/i;
    const open: string[] = [];
    for (const review of ['F3', 'F4', 'F5a', 'F6', 'F7', 'F4-F7']) {
      for (const row of readFileSync(`docs/relatorios/REVISAO-${review}.md`, 'utf8').split('\n')) {
        const id = /^\| ([A-Za-z0-9]+-\d+) \|/.exec(row)?.[1];
        if (id && !closed.test(row)) open.push(`${review} ${id}`);
      }
    }
    const f5b = readFileSync('docs/relatorios/REVISAO-F5b.md', 'utf8');
    const stay = f5b.slice(f5b.indexOf('## Os baixos que ficam'), f5b.indexOf('## A worktree'));
    for (const match of stay.matchAll(/\*\*([^*]+):\*\*/g)) for (const id of (match[1] ?? '').matchAll(/\b[A-Z]-\d+\b/g)) open.push(`F5b ${id[0]}`);
    expect(open.length).toBeGreaterThan(100);
    expect(open.filter((id) => !covered.has(id))).toEqual([]);
  });

  it('has a row for every low finding of the reviews of the F8', () => {
    for (const review of ['docs/relatorios/REVISAO-F4-F7.md', 'docs/relatorios/REVISAO-F8.md']) {
      // The fourth column of the tables is the final severity, after the skeptic.
      const lows = [...readFileSync(review, 'utf8').matchAll(/^\| ([a-h]\d?-\d+) \| [^|]+\| [^|]+\| baixo \|/gm)].map((match) => match[1]);
      expect(lows.length, review).toBeGreaterThan(0);
      const prefix = review.includes('F8') ? 'F8' : 'F4-F7';
      for (const low of lows) expect(DOC, `${prefix} ${low}`).toContain(`${prefix} ${low}`);
    }
  });
});
