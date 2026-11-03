// pnpm publico:auditar: the audit before the repository goes public (prompt F9, decision 8; DECISOES § 332).
//
// 1. A mirror clone in .cache/auditoria/ (git clone --mirror): it brings refs/pull/*/head, where the commits of the
//    run branches deleted after the squash still live, and which GitHub publishes with the repository.
// 2. gitleaks (pinned in scripts/lib/tools.ts) over the whole history of the mirror, and over the tree of its HEAD
//    and of the local branch, exported with git archive (gitleaks dir on the clone would read node_modules and dist).
// 3. Personal data in every blob of the mirror and of the local branch: GPS and identity tags of the images, and
//    e-mail, phone, CPF, address and personal profiles in the text; the commit messages; the author and committer
//    identities.
// 4. Each finding deduplicated by value and classified (scripts/publico/lib/classify.ts).
//
// The detail goes only to .cache/auditoria-publico.md (ignored by git). The terminal shows counts, never a value.
// Nothing is fixed here: deciding is the owner's job (PLANO-MELHORIAS.md, section F).
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import * as pix from '../../src/platform/pix.ts';
import * as site from '../../src/platform/site.ts';
import { GITLEAKS, ensureTool } from '../lib/tools.ts';
import type { AuditContext, FindingType } from './lib/classify.ts';
import { sniff } from '../../tests/e2e/lib/images.ts';
import { coordinate, imageMetadata } from './lib/exif.ts';
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
  type BlobPlace,
  type GitleaksRun,
} from './lib/git-parse.ts';
import { looksLikeText, scanText } from './lib/pii.ts';
import { REPORT_PATH, aggregate, renderReport, safeOutput, summaryLines, type Occurrence, type ScanStats } from './lib/report.ts';

/** The public repository (the owner's login is the first path segment). Never the URL of the local remote, which may carry a token. */
const ORIGIN = 'https://github.com/vmatusita/fileorca.git';
const OWNER_LOGIN = 'vmatusita';
/**
 * The git log options of the history scan. gitleaks' default (--all --full-history) leaves out the diffs of merge
 * commits, which only -m shows (each parent's diff). --no-textconv and --no-ext-diff: Git for Windows maps *.pdf to a
 * textconv driver in its system gitattributes, a bare mirror does not read the repository's "*.pdf binary", and the
 * driver failed on a fixture: git log stopped and gitleaks reported 225 of 566 commits as if it were all (§ 332).
 */
const HISTORY_LOG_OPTS = '--all --full-history -m --no-textconv --no-ext-diff';
const MAX_TEXT_BYTES = 20 * 1024 * 1024;
/** Stands for "the local branch, not pushed yet" where a commit sha would go. */
const LOCAL_COMMIT = 'HEAD-local';

function argValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

// The output is checked before any work: a path outside .cache/ stops the script with nothing written.
const reportFile = safeOutput(argValue('--saida') ?? REPORT_PATH);
const work = safeOutput('.cache/auditoria');
const mirror = join(work, 'fileorca.git');

const git = (args: string[], options: { cwd?: string; gitDir?: string } = {}): string =>
  execFileSync('git', [...(options.gitDir ? [`--git-dir=${options.gitDir}`] : []), '-c', 'core.quotePath=false', ...args], {
    cwd: options.cwd ?? process.cwd(),
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
const inMirror = (args: string[]): string => git(args, { gitDir: mirror });

function updateMirror(): void {
  mkdirSync(work, { recursive: true });
  if (existsSync(join(mirror, 'HEAD'))) {
    console.log('espelho: git remote update --prune');
    inMirror(['remote', 'update', '--prune']);
  } else {
    console.log(`espelho: git clone --mirror ${ORIGIN}`);
    git(['clone', '--mirror', '--quiet', ORIGIN, mirror]);
  }
}

/** Streams the content of each blob through `git cat-file --batch`, in the given repository. */
function readBlobs(shas: string[], gitDir: string | null, onBlob: (sha: string, data: Uint8Array) => void): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('git', [...(gitDir ? [`--git-dir=${gitDir}`] : []), 'cat-file', '--batch'], { stdio: ['pipe', 'pipe', 'pipe'] });
    const reader = new BatchReader();
    let errors = '';
    child.stdout.on('data', (chunk: Buffer) => {
      for (const object of reader.push(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength))) {
        if (object.type === 'blob') onBlob(object.sha, object.data);
      }
    });
    child.stderr.on('data', (chunk: Buffer) => (errors += chunk.toString()));
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolvePromise() : reject(new Error(`git cat-file saiu com ${code}: ${errors.slice(0, 200)}`))));
    child.stdin.end(`${shas.join('\n')}\n`);
  });
}

/** Exports a tree with git archive and extracts it (bsdtar on Windows, tar on Linux). */
function exportTree(gitDir: string | null, target: string): void {
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  const tarFile = `${target}.tar`;
  git(['archive', '--format=tar', '-o', tarFile, 'HEAD'], gitDir ? { gitDir } : {});
  const tar = process.platform === 'win32' ? join(process.env['SystemRoot'] ?? 'C:\\Windows', 'System32', 'tar.exe') : 'tar';
  execFileSync(tar, ['-xf', tarFile, '-C', target], { stdio: 'ignore' });
  rmSync(tarFile, { force: true });
}

/**
 * Runs gitleaks without echoing what it prints (its log could carry a match): the status, the number of commits it
 * says it scanned and its error lines (kept for the .cache/ report; the terminal gets only how many).
 */
function runGitleaks(binary: string, args: string[], reportJson: string): GitleaksRun {
  rmSync(reportJson, { force: true });
  const result = spawnSync(binary, [...args, '--no-banner', '--no-color', '--log-level', 'info', '--exit-code', '7', '-f', 'json', '-r', reportJson], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  return readGitleaksLog(result.status, `${result.stdout ?? ''}\n${result.stderr ?? ''}`);
}

async function main(): Promise<void> {
  const started = Date.now();
  updateMirror();

  // ---- What the mirror holds ---------------------------------------------------------------------------------
  const refs = inMirror(['for-each-ref', '--format=%(refname)']).split('\n').filter(Boolean);
  const refsOfCommit = new Map<string, string[]>();
  for (const ref of refs) {
    for (const commit of inMirror(['rev-list', ref]).split('\n').filter(Boolean)) {
      const list = refsOfCommit.get(commit);
      if (list) list.push(ref);
      else refsOfCommit.set(commit, [ref]);
    }
  }
  const commits = inMirror(['rev-list', '--all']).split('\n').filter(Boolean);
  const rawLog = inMirror(['log', '--all', '-m', '--raw', '--no-abbrev', '--no-renames', '--format=@%H']);
  const places = parseRawLog(rawLog);
  const changes = commitChanges(rawLog);
  const textBlobs = new Set<string>();
  const mirrorHead = inMirror(['rev-parse', 'HEAD']).trim();
  const headTree = parseLsTree(inMirror(['ls-tree', '-r', 'HEAD']));
  const blobs = parseBatchCheck(inMirror(['cat-file', '--batch-all-objects', '--batch-check'])).filter((object) => object.type === 'blob');
  const mirrorBlobs = new Set(blobs.map((blob) => blob.sha));

  const localHead = git(['rev-parse', 'HEAD']).trim();
  const localTree = parseLsTree(git(['ls-tree', '-r', 'HEAD']));
  const localOnly = [...localTree.keys()].filter((sha) => !mirrorBlobs.has(sha));

  // ---- The context of the classification, read from the repository, never written by hand ------------------
  const samplePaths = parseOrigem(readFileSync('fixtures/ORIGEM.md', 'utf8'));
  const publicValues = stringsOf(site, pix);
  const brandDomains = new Set([site.CONTACT_EMAIL.split('@')[1] ?? '', new URL(site.SITE_ORIGIN).hostname].map((domain) => domain.toLowerCase()).filter(Boolean));
  const configValue = (key: string): string => {
    try {
      return git(['config', '--get', key]).trim().toLowerCase();
    } catch {
      return '';
    }
  };
  const ownerNames = new Set([site.AUTHOR.name.toLowerCase(), configValue('user.name'), OWNER_LOGIN].filter(Boolean));
  const identities = parseIdentities(inMirror(['log', '--all', '--format=%H%x09%an%x09%ae%x09%cn%x09%ce']));
  const ownerEmails = new Set([configValue('user.email')].filter(Boolean));
  for (const identity of identities) {
    if (ownerNames.has(identity.authorName.toLowerCase())) ownerEmails.add(identity.authorEmail.toLowerCase());
    if (ownerNames.has(identity.committerName.toLowerCase())) ownerEmails.add(identity.committerEmail.toLowerCase());
  }
  const context: AuditContext = { publicValues, brandDomains, ownerEmails, ownerNames, samplePaths, sampleCoordinates: new Set() };

  // ---- Every blob: images by their metadata, text by the patterns ---------------------------------------------
  const occurrences: Occurrence[] = [];
  const stats: ScanStats = { refs: refs.length, pullRefs: refs.filter((ref) => ref.startsWith('refs/pull/')).length, commits: commits.length, blobs: blobs.length, textBlobs: 0, imageBlobs: 0, skippedBlobs: 0, skippedKinds: {}, localBlobs: localOnly.length, gitleaksHistory: '', gitleaksTree: '' };
  const scanBlob = (sha: string, data: Uint8Array, where: BlobPlace[], inTree: boolean, local: boolean): void => {
    const paths = [...new Set(where.map((place) => place.path))];
    const commitsOf = [...new Set(where.map((place) => place.commit).filter(Boolean))];
    const source: Occurrence['source'] = local ? 'local' : inTree ? 'arvore' : 'historico';
    const push = (type: FindingType, value: string, extra: { rule?: string; line?: number; context?: string } = {}): void => {
      occurrences.push({ type, value, paths, commits: commitsOf, source, ...extra });
    };
    try {
      const image = imageMetadata(data);
      if (image) {
        stats.imageBlobs += 1;
        if (image.latitude !== null && image.longitude !== null) {
          const value = coordinate(image.latitude, image.longitude);
          if (paths.some((path) => samplePaths.has(path))) context.sampleCoordinates.add(value);
          push('gps', value, { rule: image.format });
        } else if (image.gpsKind === 'real') {
          push('gps', `GPS real sem coordenada legível (${sha.slice(0, 10)})`, { rule: image.format });
        }
        for (const raw of image.xmpGps) push('gps', `XMP ${raw}`, { rule: image.format });
        for (const tag of image.identity) push('identidade-imagem', `${tag.tag}: ${tag.value}`, { rule: tag.tag });
        return;
      }
      if (data.length > MAX_TEXT_BYTES || !looksLikeText(data)) {
        stats.skippedBlobs += 1;
        const kind = data.length > MAX_TEXT_BYTES ? 'acima de 20 MB' : sniff(data);
        stats.skippedKinds[kind] = (stats.skippedKinds[kind] ?? 0) + 1;
        return;
      }
      stats.textBlobs += 1;
      textBlobs.add(sha);
      const text = new TextDecoder().decode(data);
      const lines = text.split('\n');
      const profiles = paths.some((path) => path.startsWith('docs/lancamento/'));
      for (const hit of scanText(text, { profiles })) push(hit.kind, hit.value, { line: hit.line, context: (lines[hit.line - 1] ?? '').slice(0, 300) });
    } catch (error) {
      stats.skippedBlobs += 1;
      stats.skippedKinds['erro de leitura'] = (stats.skippedKinds['erro de leitura'] ?? 0) + 1;
      console.warn(`blob ${sha.slice(0, 10)} não lido: ${(error as Error).message}`);
    }
  };

  console.log(`varrendo ${blobs.length} blobs do espelho e ${localOnly.length} só da branch local`);
  await readBlobs(
    blobs.map((blob) => blob.sha),
    mirror,
    (sha, data) => {
      const inTree = headTree.has(sha) || localTree.has(sha);
      const where = places.get(sha) ?? (headTree.get(sha) ?? []).map((path) => ({ commit: mirrorHead, path }));
      scanBlob(sha, data, where, inTree, false);
    },
  );
  if (localOnly.length > 0) {
    await readBlobs(localOnly, null, (sha, data) => scanBlob(sha, data, (localTree.get(sha) ?? []).map((path) => ({ commit: LOCAL_COMMIT, path })), true, true));
  }

  // ---- Commit messages and identities ---------------------------------------------------------------------------
  for (const { commit, body } of parseMessages(inMirror(['log', '--all', '--format=%H%x00%B%x00']))) {
    for (const hit of scanText(body)) occurrences.push({ type: hit.kind, value: hit.value, paths: [], commits: [commit], source: 'mensagem', line: hit.line });
  }
  for (const identity of identities) {
    const author = `${identity.authorName} <${identity.authorEmail}>`;
    const committer = `${identity.committerName} <${identity.committerEmail}>`;
    occurrences.push({ type: 'autor-commit', value: author, paths: [], commits: [identity.commit], source: 'identidade', rule: 'autor' });
    if (committer !== author) occurrences.push({ type: 'autor-commit', value: committer, paths: [], commits: [identity.commit], source: 'identidade', rule: 'quem commitou' });
  }

  // ---- gitleaks: the whole history of the mirror, then the trees --------------------------------------------
  const gitleaks = await ensureTool(GITLEAKS);
  const historyJson = join(work, 'gitleaks-historico.json');
  const historyRun = runGitleaks(gitleaks, ['git', mirror, `--log-opts=${HISTORY_LOG_OPTS}`], historyJson);
  stats.gitleaksHistory = describeRun(historyRun, commitsWithText(changes, (blob) => textBlobs.has(blob)));
  const gitleaksErrors = historyRun.errors.map((line) => `histórico: ${line}`);
  for (const finding of existsSync(historyJson) ? parseGitleaks(readFileSync(historyJson, 'utf8')) : []) {
    occurrences.push({ type: 'segredo', value: finding.secret, rule: finding.rule, context: finding.match, paths: [finding.file], commits: [finding.commit], source: 'gitleaks-historico', line: finding.line });
  }
  const trees: { name: string; gitDir: string | null }[] = [{ name: 'tree', gitDir: mirror }];
  if (localHead !== mirrorHead) trees.push({ name: 'tree-local', gitDir: null });
  const treeStatus: string[] = [];
  for (const tree of trees) {
    const target = join(work, tree.name);
    const json = join(work, `gitleaks-${tree.name}.json`);
    try {
      exportTree(tree.gitDir, target);
      const run = runGitleaks(gitleaks, ['dir', target], json);
      treeStatus.push(`${tree.name === 'tree' ? 'HEAD do espelho' : 'HEAD local'} ${describeRun(run)}`);
      gitleaksErrors.push(...run.errors.map((line) => `${tree.name}: ${line}`));
      const prefix = `${target.split('\\').join('/')}/`;
      for (const finding of existsSync(json) ? parseGitleaks(readFileSync(json, 'utf8')) : []) {
        const file = finding.file.includes(prefix) ? finding.file.slice(finding.file.indexOf(prefix) + prefix.length) : finding.file.replace(/^.*?\/tree(-local)?\//, '');
        occurrences.push({ type: 'segredo', value: finding.secret, rule: finding.rule, context: finding.match, paths: [file], commits: [], source: 'gitleaks-arvore', line: finding.line });
      }
    } finally {
      // the exported tree has .ts files, and tsconfig.json does not exclude .cache/: never leave it behind
      rmSync(target, { recursive: true, force: true });
    }
  }
  stats.gitleaksTree = treeStatus.join('; ');

  // ---- Classify, write the detail to .cache/ and print the counts ---------------------------------------------------
  const aggregates = aggregate(occurrences, context, (commit) => refsOfCommit.get(commit) ?? (commit === LOCAL_COMMIT ? ['branch local (ainda não publicada)'] : []));
  const report = renderReport(aggregates, stats, {
    date: new Date().toISOString(),
    origin: ORIGIN,
    mirrorHead,
    localHead,
    gitleaksVersion: GITLEAKS.version,
    gitleaksHistoryArgs: `gitleaks git <espelho> --log-opts="${HISTORY_LOG_OPTS}"`,
    limits: [
      'Títulos, descrições e comentários de PRs e de issues, e os logs e artefatos do Actions, não estão no Git: não foram lidos.',
      'O texto dentro de PDFs (fluxos comprimidos) e de outros binários não foi lido; das imagens, só os metadados (Exif, XMP).',
      'Telefone, CPF e endereço são achados pelo formato (Brasil e EUA): um formato diferente passa.',
      'O perfil pessoal só é procurado em docs/lancamento/.',
      'A classificação é automática: confira cada linha de "segredo real", "dado de terceiro" e "dado do Victor".',
      ...gitleaksErrors.map((line) => `Erro do gitleaks (a varredura pode ter parado aqui): ${line}`),
    ],
  });
  mkdirSync(dirname(reportFile), { recursive: true });
  writeFileSync(reportFile, report);
  for (const line of summaryLines(aggregates, stats)) console.log(line);
  console.log(`detalhe em ${relative(process.cwd(), reportFile).split('\\').join('/')} (fora do Git), em ${Math.round((Date.now() - started) / 1000)} s`);
}

await main();
