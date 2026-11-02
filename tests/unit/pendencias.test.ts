// docs/PENDENCIAS.md, the single list of what is still open (F8, decision 3; DECISOES § 304): every item the decision
// names is there, every row says its source, severity, defect, fix and who solves it, and every low finding of the
// reviews of the F8 (REVISAO-F4-F7.md and REVISAO-F8.md) has its row.
import { existsSync, readFileSync } from 'node:fs';
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
    for (const id of ['F2 2b', '§ 242', '§ 283', 'F7 e-1', 'Worktrees', 'Fontes', 'F3 d-02', 'F3 c-04', 'F3 c-08', 'F3 b-07', 'F3 e-05']) expect(ids, id).toContain(id);
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

  it('has a row for every low finding of the reviews of the F8', () => {
    for (const review of ['docs/relatorios/REVISAO-F4-F7.md', 'docs/relatorios/REVISAO-F8.md']) {
      if (!existsSync(review)) continue;
      const lows = [...readFileSync(review, 'utf8').matchAll(/^\| ([a-h]\d?-\d+) \| [^|]*\| baixo \|/gm)].map((match) => match[1]);
      const prefix = review.includes('F8') ? 'F8' : 'F4-F7';
      for (const low of lows) expect(DOC, `${prefix} ${low}`).toContain(`${prefix} ${low}`);
    }
  });
});
