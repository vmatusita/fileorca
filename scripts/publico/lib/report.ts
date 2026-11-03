// Aggregation and output of the public-repository audit (DECISOES § 332). The detail (values, coordinates, where)
// goes only to .cache/auditoria-publico.md, which .gitignore covers: in a public repository, a finding written to a
// tracked file would publish what it found. The terminal gets only counts, never a value.
import { isAbsolute, relative, resolve } from 'node:path';
import { CATEGORIES, CATEGORY_LABEL, TYPE_LABEL, classify, type AuditContext, type Category, type Finding, type FindingType } from './classify.ts';

export const REPORT_PATH = '.cache/auditoria-publico.md';

/** One place where a value appears. */
export interface Occurrence {
  type: FindingType;
  value: string;
  rule?: string;
  context?: string;
  /** Repository paths of the file that holds it (a blob can sit at several paths); empty for commits. */
  paths: string[];
  line?: number;
  /** Commits that carry it (introduce the blob, or authored/committed it). */
  commits: string[];
  /** Where the scan saw it: a blob of the history, the current tree, a commit message, a commit identity. */
  source: 'historico' | 'arvore' | 'mensagem' | 'identidade' | 'gitleaks-historico' | 'gitleaks-arvore' | 'local';
}

export interface Aggregate {
  type: FindingType;
  value: string;
  rule?: string;
  category: Category;
  note: string;
  occurrences: number;
  paths: string[];
  commits: string[];
  refs: string[];
  /** True when the value is in the current tree (HEAD of the mirror or the local branch), not only in the history. */
  inTree: boolean;
}

const keyOf = (type: FindingType, value: string): string => `${type}\u0000${type === 'segredo' ? value : value.trim().toLowerCase()}`;

/** Deduplicates by type and value, counts the occurrences and joins where they are; then classifies each. */
export function aggregate(occurrences: Occurrence[], context: AuditContext, refsOf: (commit: string) => string[]): Aggregate[] {
  const groups = new Map<string, Occurrence[]>();
  for (const occurrence of occurrences) {
    const key = keyOf(occurrence.type, occurrence.value);
    const group = groups.get(key);
    if (group) group.push(occurrence);
    else groups.set(key, [occurrence]);
  }
  const out: Aggregate[] = [];
  for (const group of groups.values()) {
    const first = group[0];
    if (!first) continue;
    const paths = [...new Set(group.flatMap((occurrence) => occurrence.paths))].sort();
    const commits = [...new Set(group.flatMap((occurrence) => occurrence.commits))];
    const refs = [...new Set(commits.flatMap((commit) => refsOf(commit)))].sort();
    const finding: Finding = { type: first.type, value: first.value, paths, ...(first.rule ? { rule: first.rule } : {}), ...(first.context ? { context: first.context } : {}) };
    const verdict = classify(finding, context);
    out.push({
      type: first.type,
      value: first.value,
      ...(first.rule ? { rule: first.rule } : {}),
      category: verdict.category,
      note: verdict.note,
      occurrences: group.length,
      paths,
      commits,
      refs,
      inTree: group.some((occurrence) => occurrence.source === 'arvore' || occurrence.source === 'gitleaks-arvore' || occurrence.source === 'local'),
    });
  }
  return out.sort((left, right) => CATEGORIES.indexOf(left.category) - CATEGORIES.indexOf(right.category) || left.type.localeCompare(right.type) || right.occurrences - left.occurrences);
}

export type Counts = Record<Category, Partial<Record<FindingType, number>>>;

/** Unique findings per category and type. */
export function countByType(aggregates: Aggregate[]): Counts {
  const counts = Object.fromEntries(CATEGORIES.map((category) => [category, {}])) as Counts;
  for (const item of aggregates) counts[item.category][item.type] = (counts[item.category][item.type] ?? 0) + 1;
  return counts;
}

export interface ScanStats {
  refs: number;
  pullRefs: number;
  commits: number;
  blobs: number;
  textBlobs: number;
  imageBlobs: number;
  skippedBlobs: number;
  /** Why each skipped blob was skipped: its format by signature (pdf, gif, zip...), "acima de 20 MB" or "erro de leitura". */
  skippedKinds: Record<string, number>;
  localBlobs: number;
  gitleaksHistory: string;
  gitleaksTree: string;
}

const skipped = (stats: ScanStats): string => {
  const kinds = Object.entries(stats.skippedKinds).sort(([left], [right]) => left.localeCompare(right));
  return kinds.length === 0 ? '' : `: ${kinds.map(([kind, count]) => `${kind} ${count}`).join(', ')}`;
};

/** The lines the terminal may show: counts only. A test proves no value of the findings gets here. */
export function summaryLines(aggregates: Aggregate[], stats: ScanStats): string[] {
  const counts = countByType(aggregates);
  const lines = [
    `espelho: ${stats.refs} refs (${stats.pullRefs} refs/pull/*), ${stats.commits} commits, ${stats.blobs} blobs (${stats.textBlobs} de texto, ${stats.imageBlobs} imagens, ${stats.skippedBlobs} pulados${skipped(stats)})${stats.localBlobs > 0 ? `; ${stats.localBlobs} blobs só na branch local` : ''}`,
    `gitleaks no histórico: ${stats.gitleaksHistory}; na árvore: ${stats.gitleaksTree}`,
    `achados únicos: ${aggregates.length}`,
  ];
  for (const category of CATEGORIES) {
    const types = Object.entries(counts[category]) as [FindingType, number][];
    const total = types.reduce((sum, [, count]) => sum + count, 0);
    const detail = types.map(([type, count]) => `${TYPE_LABEL[type]} ${count}`).join(', ');
    lines.push(`- ${CATEGORY_LABEL[category]}: ${total}${detail ? ` (${detail})` : ''}`);
  }
  return lines;
}

const cell = (text: string): string => text.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const list = (items: string[], max: number): string => (items.length <= max ? items.join(', ') : `${items.slice(0, max).join(', ')} e mais ${items.length - max}`);

export interface ReportMeta {
  date: string;
  origin: string;
  mirrorHead: string;
  localHead: string;
  gitleaksVersion: string;
  gitleaksHistoryArgs: string;
  limits: string[];
}

/** The full Markdown report, with the values. Only for .cache/. */
export function renderReport(aggregates: Aggregate[], stats: ScanStats, meta: ReportMeta): string {
  const out: string[] = [];
  out.push('# Auditoria para o repositório público', '');
  out.push('> Este arquivo fica só em `.cache/`, fora do Git. Ele traz os valores achados: não copie nada daqui para um arquivo rastreado, um commit, uma PR ou uma issue.', '');
  out.push(`- Data: ${meta.date}`);
  out.push(`- Origem do espelho: ${meta.origin} (HEAD ${meta.mirrorHead.slice(0, 12)})`);
  out.push(`- Branch local varrida também: HEAD ${meta.localHead.slice(0, 12)}`);
  out.push(`- gitleaks ${meta.gitleaksVersion}, histórico com \`${meta.gitleaksHistoryArgs}\``);
  out.push('');
  out.push('## Contagem', '');
  for (const line of summaryLines(aggregates, stats)) out.push(line.startsWith('- ') ? line : `- ${line}`);
  out.push('');
  out.push('## Como decidir', '');
  out.push('- **Segredo real:** gire o segredo no serviço dele e não publique até resolver.');
  out.push('- **Dado de terceiro:** tirar do arquivo atual numa run curta resolve o arquivo, mas não o histórico. Veja se o dado já era público no site da pessoa.');
  out.push('- **GPS:** cada foto com a coordenada. Confira se nenhuma aponta para um lugar que você não quer mostrar.');
  out.push('- **E-mail dos commits:** fica público com o histórico.');
  out.push('- **Público por natureza e falso positivo:** listados para conferência; não pedem ação.');
  out.push('');
  for (const category of CATEGORIES) {
    const items = aggregates.filter((item) => item.category === category);
    out.push(`## ${CATEGORY_LABEL[category]} (${items.length})`, '');
    if (items.length === 0) {
      out.push('Nenhum.', '');
      continue;
    }
    out.push('| Tipo | Valor | Regra ou tag | Ocorrências | Na árvore atual | Onde (arquivos) | Commits | Refs | Nota |');
    out.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
    for (const item of items) {
      out.push(
        `| ${TYPE_LABEL[item.type]} | ${cell(item.value)} | ${cell(item.rule ?? '')} | ${item.occurrences} | ${item.inTree ? 'sim' : 'não'} | ${cell(list(item.paths, 6))} | ${cell(list(item.commits.map((commit) => commit.slice(0, 10)), 6))} | ${cell(list(item.refs, 8))} | ${cell(item.note)} |`,
      );
    }
    out.push('');
  }
  out.push('## O que a auditoria não cobre', '');
  for (const limit of meta.limits) out.push(`- ${limit}`);
  out.push('');
  return `${out.join('\n')}\n`;
}

/** The absolute path to write, refusing anything outside the .cache/ folder of the root. */
export function safeOutput(target: string, root: string = process.cwd()): string {
  const cache = resolve(root, '.cache');
  const absolute = resolve(root, target);
  const inside = relative(cache, absolute);
  if (inside === '' || inside.startsWith('..') || isAbsolute(inside)) throw new Error(`a auditoria só grava dentro de .cache/: recusado ${target}`);
  return absolute;
}
