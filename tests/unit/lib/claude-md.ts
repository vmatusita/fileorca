// The rules of the slim CLAUDE.md (F9, decision 7; DECISOES, the § "O CLAUDE.md enxuto e a pasta docs/claude/"):
// every line of the CLAUDE.md of before the F9 is still in the CLAUDE.md or in a file of docs/claude/, word for word,
// unless the § lists it as gone; the CLAUDE.md fits in 25,600 bytes; the index cites every file of docs/claude/ once
// and nothing else; and the rules of every run of PLANO-MELHORIAS.md are in the CLAUDE.md, word for word.
// A pure function, so the tests run it on the real files and on altered copies (the controls).

/** The most the CLAUDE.md may weigh, in UTF-8 bytes (decision 7: 25 KB). */
export const MAX_BYTES = 25_600;
/** Part of the title of the § that lists the lines that left. The number of the § can change in a merge; the title cannot. */
export const SECTION_TITLE = 'O CLAUDE.md enxuto e a pasta docs/claude/';
/** The sentence that opens the block of the lines that left, inside that §. */
export const MARKER = 'Linhas que saíram do CLAUDE.md de bbd30c8, texto igual:';
/** The heading of the index in the CLAUDE.md. */
export const INDEX_HEADING = '## Índice';
/** The heading of the rules of every run in PLANO-MELHORIAS.md. */
export const RULES_HEADING = '## Regras novas de toda run';

export interface ClaudeMdInput {
  /** The CLAUDE.md of before the F9. */
  before: string;
  /** The CLAUDE.md now. */
  core: string;
  /** The files of docs/claude/, by name ("ci.md"), with their text. */
  topics: Record<string, string>;
  /** DECISOES.md. */
  decisoes: string;
  /** PLANO-MELHORIAS.md. */
  plano: string;
}

/** The lines of a text, without the line breaks. */
export function linesOf(text: string): string[] {
  const lines = text.split(/\r?\n/);
  if (lines.at(-1) === '') lines.pop();
  return lines;
}

/** The lines of the section that starts at the first line `isHeading` accepts, up to the next `## ` heading. */
function section(text: string, isHeading: (line: string) => boolean): string[] | undefined {
  const lines = linesOf(text);
  const start = lines.findIndex(isHeading);
  if (start < 0) return undefined;
  const end = lines.findIndex((line, at) => at > start && line.startsWith('## '));
  return lines.slice(start + 1, end < 0 ? undefined : end);
}

/** The lines the § lists as gone (the fenced block after the marker), or a problem. */
export function goneLines(decisoes: string): string[] | string {
  const lines = section(decisoes, (line) => /^## § \d+ · /.test(line) && line.includes(SECTION_TITLE));
  if (!lines) return `DECISOES.md has no § with the title "${SECTION_TITLE}"`;
  const marker = lines.indexOf(MARKER);
  if (marker < 0) return `the § "${SECTION_TITLE}" has no line "${MARKER}"`;
  const open = lines.findIndex((line, at) => at > marker && line.trim() !== '');
  if (lines[open] !== '```text') return `the line after "${MARKER}" is not the start of a text block`;
  const close = lines.findIndex((line, at) => at > open && line === '```');
  if (close < 0) return 'the block of the lines that left does not close';
  return lines.slice(open + 1, close).filter((line) => line.trim() !== '');
}

/** The lines of the section "Regras novas de toda run" of PLANO-MELHORIAS.md, without the blank ones. */
export function newRules(plano: string): string[] {
  return (section(plano, (line) => line.startsWith(RULES_HEADING)) ?? []).filter((line) => line.trim() !== '');
}

/** The paths of docs/claude/ the index of the CLAUDE.md cites, one array per line of the index that cites any. */
export function indexEntries(core: string): string[][] {
  return (section(core, (line) => line.startsWith(INDEX_HEADING)) ?? [])
    .map((line) => [...line.matchAll(/`docs\/claude\/([^`/]+\.md)`/g)].map((match) => match[1] ?? ''))
    .filter((paths) => paths.length > 0);
}

/** What breaks the rules of the slim CLAUDE.md; empty when nothing does. */
export function claudeMdProblems(input: ClaudeMdInput): string[] {
  const problems: string[] = [];

  // The size, counted with LF line breaks (the repository keeps LF; a CRLF checkout does not count twice).
  const bytes = Buffer.byteLength(input.core.replaceAll('\r\n', '\n'), 'utf8');
  if (bytes > MAX_BYTES) problems.push(`CLAUDE.md has ${bytes} bytes, more than ${MAX_BYTES}`);

  // The index: each file of docs/claude/ on one line of it, and no line citing a file that is not there.
  const entries = indexEntries(input.core);
  if (entries.length === 0) problems.push(`CLAUDE.md has no index ("${INDEX_HEADING}") citing docs/claude/`);
  const cited = entries.flat();
  for (const paths of entries) if (paths.length > 1) problems.push(`a line of the index cites ${paths.length} files: ${paths.join(', ')}`);
  for (const name of Object.keys(input.topics)) {
    const times = cited.filter((path) => path === name).length;
    if (times === 0) problems.push(`docs/claude/${name} is not in the index of CLAUDE.md`);
    if (times > 1) problems.push(`docs/claude/${name} is in ${times} lines of the index`);
  }
  for (const path of new Set(cited)) if (!(path in input.topics)) problems.push(`the index cites docs/claude/${path}, which does not exist`);

  // Every line of before is still somewhere, the whole line (trailing spaces aside), unless the § lists it.
  const now = new Set([input.core, ...Object.values(input.topics)].flatMap((text) => linesOf(text).map((line) => line.trimEnd())));
  const gone = goneLines(input.decisoes);
  if (typeof gone === 'string') problems.push(gone);
  const goneSet = new Set(typeof gone === 'string' ? [] : gone.map((line) => line.trimEnd()));
  const before = linesOf(input.before).map((line) => line.trimEnd());
  const beforeSet = new Set(before);
  before.forEach((line, at) => {
    if (line.trim() === '' || now.has(line) || goneSet.has(line)) return;
    problems.push(`line ${at + 1} of the CLAUDE.md of before the F9 is in no file and not in the § list: ${line}`);
  });
  for (const line of goneSet) {
    if (!beforeSet.has(line)) problems.push(`the § lists a line that is not in the CLAUDE.md of before the F9: ${line}`);
    if (now.has(line)) problems.push(`the § lists as gone a line that is still in CLAUDE.md or docs/claude/: ${line}`);
  }

  // The rules of every run of PLANO-MELHORIAS.md, word for word, in the CLAUDE.md itself.
  const rules = newRules(input.plano);
  if (rules.filter((line) => /^\d+\. /.test(line)).length !== 6) problems.push(`PLANO-MELHORIAS.md does not have the six rules under "${RULES_HEADING}"`);
  const core = new Set(linesOf(input.core).map((line) => line.trimEnd()));
  for (const rule of rules) if (!core.has(rule.trimEnd())) problems.push(`CLAUDE.md lacks the rule of every run: ${rule}`);

  return problems;
}
