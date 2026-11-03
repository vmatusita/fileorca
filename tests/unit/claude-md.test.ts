// The slim CLAUDE.md keeps every rule (F9, decision 7; DECISOES, the § "O CLAUDE.md enxuto e a pasta docs/claude/").
// The logic is tests/unit/lib/claude-md.ts; the controls run it on altered copies and must fail.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { claudeMdProblems, coreLines, goneLines, indexEntries, linesOf, MARKER, MAX_BYTES, newRules, type ClaudeMdInput } from './lib/claude-md.ts';

// The main of before the F9. If the main moves before the F9 is merged, the new lines of its CLAUDE.md go, word for
// word, to the topic file in docs/claude/, and this constant moves to that new commit of the main.
const BEFORE_F9 = 'bbd30c8367baeed677d1bf05648856847cdf5d8e';

function realInput(): ClaudeMdInput {
  const topics: Record<string, string> = {};
  for (const name of readdirSync('docs/claude').filter((file) => file.endsWith('.md')).sort()) topics[name] = readFileSync(`docs/claude/${name}`, 'utf8');
  return {
    before: execFileSync('git', ['show', `${BEFORE_F9}:CLAUDE.md`], { encoding: 'utf8' }),
    core: readFileSync('CLAUDE.md', 'utf8'),
    topics,
    decisoes: readFileSync('DECISOES.md', 'utf8'),
    plano: readFileSync('PLANO-MELHORIAS.md', 'utf8'),
  };
}

const REAL = realInput();
const TOPIC_FILES = ['anuncios.md', 'calculadoras.md', 'ci.md', 'design-e-oli.md', 'idiomas.md', 'imagem.md', 'pdf.md', 'playwright.md', 'service-worker.md', 'windows-git-bash.md'];

/** A line of before the F9 that lives in `file` of docs/claude/ and nowhere else. */
function onlyIn(input: ClaudeMdInput, file: string): string {
  const before = new Set(linesOf(input.before).filter((line) => line.trim() !== ''));
  const elsewhere = [input.core, ...Object.entries(input.topics).filter(([name]) => name !== file).map(([, text]) => text)].flatMap(linesOf);
  const line = linesOf(input.topics[file] ?? '').find((candidate) => before.has(candidate) && !elsewhere.includes(candidate) && candidate.startsWith('- '));
  if (!line) throw new Error(`no line of before the F9 only in ${file}`);
  return line;
}

describe('the slim CLAUDE.md', () => {
  it('keeps every line of before the F9, fits in 25,600 bytes, and indexes docs/claude/', () => {
    expect(claudeMdProblems(REAL)).toEqual([]);
  });

  it('has the ten topic files of decision 7, each in one line of the index', () => {
    // A later run may add a topic file, with its line in the index (the first test checks that); none of the ten leaves.
    expect(Object.keys(REAL.topics)).toEqual(expect.arrayContaining(TOPIC_FILES));
    expect(indexEntries(REAL.core).flat()).toEqual(expect.arrayContaining(TOPIC_FILES));
  });

  it('lists the lines that left in the §: the replaced CI parts and the lines rewritten on purpose', () => {
    const gone = goneLines(REAL.decisoes);
    expect(Array.isArray(gone), String(gone)).toBe(true);
    // 19 descriptions of CI parts (with their "Isto substitui" lines) and 5 rewritten lines (the opening, the
    // source of truth 2 to 4, and the pull request opened at the end).
    expect((gone as string[]).length).toBe(24);
    expect((gone as string[]).filter((line) => /Isto substitui|As partes:\*\* são|^ {2}- o `/.test(line)).length).toBe(12);
  });

  // The review of the F9 (E-3). The § gave to the core the sections from "O projeto em cinco linhas" to "Idioma" (35
  // lines, the gone ones aside) and the command tables of the phases with the lines that open them (44 lines).
  it('keeps in the CLAUDE.md itself the lines of before the F9 that the § gave to the core', () => {
    const gone = new Set(goneLines(REAL.decisoes) as string[]);
    const kept = coreLines(REAL.before, gone);
    expect(Array.isArray(kept), String(kept)).toBe(true);
    expect((kept as { line: string }[]).length).toBe(79);
    const core = new Set(linesOf(REAL.core));
    for (const { line } of kept as { line: string }[]) expect(core.has(line), line).toBe(true);
    // None of them is also in a topic file: the core is the one place of each.
    const topics = new Set(Object.values(REAL.topics).flatMap(linesOf));
    expect((kept as { line: string }[]).filter(({ line }) => topics.has(line) && !/^(?:\| Comando \||\| --- \||Comandos novos:)/.test(line))).toEqual([]);
  });

  it('reads the six rules of every run from PLANO-MELHORIAS.md', () => {
    const rules = newRules(REAL.plano);
    expect(rules.filter((line) => /^\d+\. \*\*/.test(line))).toHaveLength(6);
    for (const rule of rules) expect(REAL.core).toContain(rule);
  });
});

describe('the controls: the same check fails on altered copies', () => {
  it('fails when a line is deleted from a file of docs/claude/', () => {
    for (const file of ['ci.md', 'windows-git-bash.md', 'calculadoras.md']) {
      const line = onlyIn(REAL, file);
      const topics = { ...REAL.topics, [file]: linesOf(REAL.topics[file] ?? '').filter((candidate) => candidate !== line).join('\n') + '\n' };
      const problems = claudeMdProblems({ ...REAL, topics });
      expect(problems.some((problem) => problem.includes('is in no file') && problem.endsWith(line)), problems.join('\n')).toBe(true);
    }
  });

  it('fails when a line is changed, even by text added at its end (the whole line counts, never a part of it)', () => {
    const line = onlyIn(REAL, 'pdf.md');
    for (const changed of [`${line} (changed)`, line.replace(/\S/, (char) => (char === 'x' ? 'y' : 'x'))]) {
      const topics = { ...REAL.topics, 'pdf.md': (REAL.topics['pdf.md'] ?? '').replace(line, () => changed) };
      const problems = claudeMdProblems({ ...REAL, topics });
      expect(problems.some((problem) => problem.includes('is in no file') && problem.endsWith(line)), problems.join('\n')).toBe(true);
    }
  });

  it('fails when the CLAUDE.md has 25,601 bytes, and passes at 25,600', () => {
    const bytes = Buffer.byteLength(REAL.core, 'utf8');
    expect(bytes).toBeLessThan(MAX_BYTES);
    const at = (size: number) => claudeMdProblems({ ...REAL, core: REAL.core + 'x'.repeat(size - bytes) });
    expect(at(MAX_BYTES + 1)).toEqual([`CLAUDE.md has ${MAX_BYTES + 1} bytes, more than ${MAX_BYTES}`]);
    expect(at(MAX_BYTES)).toEqual([]);
  });

  it('fails when a file of docs/claude/ is not in the index', () => {
    const problems = claudeMdProblems({ ...REAL, topics: { ...REAL.topics, 'extra.md': '# Extra\n' } });
    expect(problems).toEqual(['docs/claude/extra.md is not in the index of CLAUDE.md']);
  });

  it('fails when the index cites a file that does not exist', () => {
    const topics = Object.fromEntries(Object.entries(REAL.topics).filter(([name]) => name !== 'anuncios.md'));
    // A topic file can only go after its lines went elsewhere: here they go to the end of ci.md.
    topics['ci.md'] = `${topics['ci.md'] ?? ''}\n${REAL.topics['anuncios.md'] ?? ''}`;
    expect(claudeMdProblems({ ...REAL, topics })).toEqual(['the index cites docs/claude/anuncios.md, which does not exist']);
  });

  it('fails when a file is cited twice in the index, or a line of the index cites two files', () => {
    const line = '- Mexeu em anúncio, no `gate:prontidao`, no GA4 ou no Pix: `docs/claude/anuncios.md`.';
    expect(REAL.core).toContain(line);
    const twice = claudeMdProblems({ ...REAL, core: REAL.core.replace(line, () => `${line}\n${line}`) });
    expect(twice).toEqual(['docs/claude/anuncios.md is in 2 lines of the index']);
    const two = claudeMdProblems({ ...REAL, core: REAL.core.replace(line, () => `${line.slice(0, -1)} e \`docs/claude/pdf.md\`.`) });
    expect(two).toContain('a line of the index cites 2 files: anuncios.md, pdf.md');
  });

  it('fails when a line the § lists as gone is still in docs/claude/, or is not a line of before', () => {
    const gone = goneLines(REAL.decisoes) as string[];
    const back = gone[gone.length - 1] ?? '';
    const problems = claudeMdProblems({ ...REAL, topics: { ...REAL.topics, 'ci.md': `${REAL.topics['ci.md'] ?? ''}\n${back}\n` } });
    expect(problems).toEqual([`the § lists as gone a line that is still in CLAUDE.md or docs/claude/: ${back}`]);
    const open = `${MARKER}\n\n\`\`\`text\n`;
    expect(REAL.decisoes).toContain(open);
    const decisoes = REAL.decisoes.replace(open, () => `${open}- A line that never was in the CLAUDE.md.\n`);
    expect(claudeMdProblems({ ...REAL, decisoes })).toEqual(['the § lists a line that is not in the CLAUDE.md of before the F9: - A line that never was in the CLAUDE.md.']);
  });

  it('fails when the § cannot be found, so no line can leave without it', () => {
    const decisoes = REAL.decisoes.replace('O CLAUDE.md enxuto e a pasta docs/claude/', 'Another title');
    const problems = claudeMdProblems({ ...REAL, decisoes });
    expect(problems[0]).toContain('DECISOES.md has no § with the title');
    expect(problems.filter((problem) => problem.includes('is in no file'))).toHaveLength(24);
  });

  it('fails when a line of the core moves from the CLAUDE.md to a file of docs/claude/', () => {
    for (const line of [
      '- Nenhuma página recebe COOP/COEP; nenhuma ferramenta usa SharedArrayBuffer.',
      '| `pnpm serve` | Serve o `dist/` como o Cloudflare (barra no fim, 404 mais próximo, `_headers`) |',
    ]) {
      expect(REAL.core).toContain(`${line}\n`);
      const core = REAL.core.replace(`${line}\n`, '');
      const topics = { ...REAL.topics, 'ci.md': `${REAL.topics['ci.md'] ?? ''}\n${line}\n` };
      const problems = claudeMdProblems({ ...REAL, core, topics });
      expect(problems).toHaveLength(1);
      expect(problems[0]).toMatch(/^line \d+ of the CLAUDE\.md of before the F9 belongs to the core and is not in CLAUDE\.md: /);
      expect(problems[0]?.endsWith(line)).toBe(true);
    }
  });

  it('fails when a rule of every run is not in the CLAUDE.md, word for word', () => {
    const rule = newRules(REAL.plano).find((line) => line.startsWith('4. ')) ?? '';
    const core = REAL.core.replace(rule, () => rule.replace('nunca inteiro', 'quase nunca inteiro'));
    expect(claudeMdProblems({ ...REAL, core })).toEqual([`CLAUDE.md lacks the rule of every run: ${rule}`]);
  });
});
