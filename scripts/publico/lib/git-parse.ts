// Parsers of what git and gitleaks print, for the public-repository audit (DECISOES § 332). Pure, so the Vitest
// covers them without a repository: the audit script runs the commands and hands the text here.

export interface ObjectInfo {
  sha: string;
  type: string;
  size: number;
}

/** `git cat-file --batch-all-objects --batch-check`: one "<sha> <type> <size>" per line. */
export function parseBatchCheck(text: string): ObjectInfo[] {
  const out: ObjectInfo[] = [];
  for (const line of text.split('\n')) {
    const [sha, type, size] = line.trim().split(' ');
    if (sha && type && size && /^[0-9a-f]{40,64}$/.test(sha)) out.push({ sha, type, size: Number(size) });
  }
  return out;
}

export interface BlobPlace {
  commit: string;
  path: string;
}

/**
 * `git -c core.quotePath=false log --all -m --raw --no-abbrev --no-renames --format=@%H`: for each blob, the
 * commits whose diff writes it and the path it has there. Deletions (an all-zero new blob) are skipped.
 */
export function parseRawLog(text: string): Map<string, BlobPlace[]> {
  const places = new Map<string, BlobPlace[]>();
  let commit = '';
  for (const line of text.split('\n')) {
    if (line.startsWith('@')) {
      commit = line.slice(1).trim();
      continue;
    }
    if (!line.startsWith(':')) continue;
    const tab = line.indexOf('\t');
    if (tab === -1) continue;
    const fields = line.slice(1, tab).split(' ');
    const blob = fields[3] ?? '';
    const path = line.slice(tab + 1);
    if (!/^[0-9a-f]{40,64}$/.test(blob) || /^0+$/.test(blob)) continue;
    const list = places.get(blob);
    const place = { commit, path };
    if (!list) places.set(blob, [place]);
    else if (!list.some((known) => known.commit === commit && known.path === path)) list.push(place);
  }
  return places;
}

export interface CommitChange {
  /** Blobs the commit writes (added or modified files). */
  blobs: Set<string>;
  /** It deletes at least one file. */
  deletes: boolean;
}

/** What each commit of the same raw log changes: every commit with at least one changed file is here. */
export function commitChanges(text: string): Map<string, CommitChange> {
  const out = new Map<string, CommitChange>();
  let commit = '';
  for (const line of text.split('\n')) {
    if (line.startsWith('@')) {
      commit = line.slice(1).trim();
      continue;
    }
    const tab = line.indexOf('\t');
    if (!line.startsWith(':') || !commit || tab === -1) continue;
    const blob = line.slice(1, tab).split(' ')[3] ?? '';
    const change = out.get(commit) ?? { blobs: new Set<string>(), deletes: false };
    if (/^0+$/.test(blob)) change.deletes = true;
    else change.blobs.add(blob);
    out.set(commit, change);
  }
  return out;
}

/**
 * How many commits a complete history scan of gitleaks reads: the ones whose diff has text. A commit that only adds or
 * changes binary files (images, PDFs) gives git log -p no text, and gitleaks does not count it.
 */
export function commitsWithText(changes: Map<string, CommitChange>, isText: (blob: string) => boolean): number {
  let count = 0;
  for (const change of changes.values()) if (change.deletes || [...change.blobs].some(isText)) count += 1;
  return count;
}

export interface GitleaksRun {
  status: 'sem achados' | 'com achados' | 'erro';
  code: number | null;
  /** What gitleaks says it scanned ("N commits scanned"), null for a directory scan or a log without the line. */
  commitsScanned: number | null;
  /** Its ERR lines: a git error in the middle of the log stops the history scan while the exit code still says 7. */
  errors: string[];
}

/** Reads the exit code and the log of a gitleaks run (exit code 7 means findings, 0 none, anything else an error). */
export function readGitleaksLog(code: number | null, log: string): GitleaksRun {
  const clean = log.replace(/\u001b\[[0-9;]*m/g, '');
  const scanned = /(\d+) commits scanned/.exec(clean);
  const errors = clean
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /\bERR\b/.test(line));
  const status = code === 0 ? 'sem achados' : code === 7 ? 'com achados' : 'erro';
  return { status, code, commitsScanned: scanned ? Number(scanned[1]) : null, errors };
}

/** One line about a run, with no value in it: the status, the commits and whether it stopped on an error. */
export function describeRun(run: GitleaksRun, expectedCommits?: number): string {
  const parts: string[] = [run.status === 'erro' ? `erro (código ${String(run.code)})` : run.status];
  if (run.commitsScanned !== null) parts.push(`${run.commitsScanned} commits lidos${expectedCommits === undefined ? '' : ` de ${expectedCommits} com mudança de texto`}`);
  const short = expectedCommits !== undefined && run.commitsScanned !== null && run.commitsScanned < expectedCommits;
  if (run.errors.length > 0 || short || run.status === 'erro') parts.push(`INCOMPLETO (${run.errors.length} linhas de erro)`);
  return parts.join(', ');
}

/** `git ls-tree -r HEAD` (with core.quotePath=false): blob sha to path. */
export function parseLsTree(text: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const line of text.split('\n')) {
    const tab = line.indexOf('\t');
    if (tab === -1) continue;
    const [, type, sha] = line.slice(0, tab).split(' ');
    if (type !== 'blob' || !sha) continue;
    const path = line.slice(tab + 1);
    const list = out.get(sha);
    if (list) list.push(path);
    else out.set(sha, [path]);
  }
  return out;
}

export interface Identity {
  commit: string;
  authorName: string;
  authorEmail: string;
  committerName: string;
  committerEmail: string;
}

/** `git log --all --format=%H%x09%an%x09%ae%x09%cn%x09%ce`. */
export function parseIdentities(text: string): Identity[] {
  const out: Identity[] = [];
  for (const line of text.split('\n')) {
    const [commit, authorName, authorEmail, committerName, committerEmail] = line.split('\t');
    if (commit && /^[0-9a-f]{40,64}$/.test(commit)) out.push({ commit, authorName: authorName ?? '', authorEmail: authorEmail ?? '', committerName: committerName ?? '', committerEmail: committerEmail ?? '' });
  }
  return out;
}

/** `git log --all --format=%H%x00%B%x00`: commit message bodies. */
export function parseMessages(text: string): { commit: string; body: string }[] {
  const parts = text.split('\u0000');
  const out: { commit: string; body: string }[] = [];
  for (let index = 0; index + 1 < parts.length; index += 2) {
    const commit = (parts[index] ?? '').trim();
    if (/^[0-9a-f]{40,64}$/.test(commit)) out.push({ commit, body: parts[index + 1] ?? '' });
  }
  return out;
}

/** The sample images that fixtures/ORIGEM.md lists in its tables ("| images/<name> | ..."), as repository paths. */
export function parseOrigem(markdown: string): Set<string> {
  const out = new Set<string>();
  for (const match of markdown.matchAll(/^\|\s*(images\/[^\s|]+)\s*\|/gm)) out.add(`fixtures/${match[1] ?? ''}`);
  return out;
}

export interface GitleaksFinding {
  rule: string;
  secret: string;
  match: string;
  file: string;
  commit: string;
  line: number;
}

/** The JSON report of gitleaks (-f json): an array of findings, or null when there is no file. */
export function parseGitleaks(text: string): GitleaksFinding[] {
  if (!text.trim()) return [];
  const raw = JSON.parse(text) as unknown;
  if (!Array.isArray(raw)) throw new Error('relatório do gitleaks sem lista');
  return raw.map((item: Record<string, unknown>) => ({
    rule: String(item['RuleID'] ?? ''),
    secret: String(item['Secret'] ?? ''),
    match: String(item['Match'] ?? ''),
    file: String(item['File'] ?? '').split('\\').join('/'),
    commit: String(item['Commit'] ?? ''),
    line: Number(item['StartLine'] ?? 0),
  }));
}

/** Every string inside the exports of a module (nested objects and arrays too), lower case, four characters or more. */
export function stringsOf(...modules: unknown[]): Set<string> {
  const out = new Set<string>();
  const walk = (value: unknown, depth: number): void => {
    if (depth > 4) return;
    if (typeof value === 'string') {
      if (value.trim().length >= 4) out.add(value.trim().toLowerCase());
    } else if (Array.isArray(value)) {
      for (const item of value) walk(item, depth + 1);
    } else if (value && typeof value === 'object') {
      for (const item of Object.values(value)) walk(item, depth + 1);
    }
  };
  for (const module of modules) walk(module, 0);
  return out;
}

export interface BatchObject {
  sha: string;
  type: string;
  data: Uint8Array;
}

/**
 * Streaming parser of `git cat-file --batch`: "<sha> <type> <size>\n", the content, "\n". A "<sha> missing" line
 * gives an object with type "missing" and no data.
 */
export class BatchReader {
  private chunks: Uint8Array[] = [];
  private size = 0;
  /** Bytes the object being read needs (header, content and the closing newline); 0 while the header is unread. */
  private expected = 0;

  private flatten(): Uint8Array {
    if (this.chunks.length > 1) {
      const all = new Uint8Array(this.size);
      let at = 0;
      for (const chunk of this.chunks) {
        all.set(chunk, at);
        at += chunk.length;
      }
      this.chunks = [all];
    }
    return this.chunks[0] ?? new Uint8Array(0);
  }

  private consume(count: number): void {
    const rest = this.flatten().subarray(count);
    this.chunks = rest.length > 0 ? [rest] : [];
    this.size = rest.length;
  }

  push(chunk: Uint8Array): BatchObject[] {
    this.chunks.push(chunk);
    this.size += chunk.length;
    const out: BatchObject[] = [];
    for (;;) {
      if (this.expected > 0 && this.size < this.expected) break;
      const buffer = this.flatten();
      const newline = buffer.indexOf(10);
      if (newline === -1) break;
      const [sha = '', type = '', size] = new TextDecoder().decode(buffer.subarray(0, newline)).split(' ');
      if (type === 'missing' || size === undefined) {
        out.push({ sha, type: 'missing', data: new Uint8Array(0) });
        this.consume(newline + 1);
        continue;
      }
      const end = newline + 1 + Number(size);
      this.expected = end + 1;
      if (buffer.length < this.expected) break;
      out.push({ sha, type, data: buffer.slice(newline + 1, end) });
      this.consume(end + 1);
      this.expected = 0;
    }
    return out;
  }
}
