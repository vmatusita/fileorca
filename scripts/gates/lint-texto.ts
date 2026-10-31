// lint:texto (PLANO "Conteúdo de apoio › LanguageTool"): checks the site texts changed against the
// merge-base with origin/main, in the three languages, and fails only on grammar errors; style,
// typography and spelling are warnings. The public LanguageTool API forbids automated requests
// ("Do not send automated requests", dev.languagetool.org/public-http-api), so the check runs on
// a local LanguageTool server from the official distribution (DECISOES § 24). LANGUAGETOOL_URL
// points it to another server. If no server can start, it warns and does not fail.
import { execFileSync, spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { LANGUAGETOOL, JRE, ensureTool } from '../lib/tools.ts';

const LANGUAGE: Record<string, string> = { en: 'en-US', pt: 'pt-BR', es: 'es' };
// Every text file the route map lists (src/i18n/routes.ts): page texts, a tool's texts, the texts
// shared by the image tools and the texts of a preset (src/tools/<tool>/presets/<name>/i18n/<lang>.ts).
// tests/unit/lint-texto-files.test.ts keeps this filter and the route map in step.
export const TEXT_FILE = /^src\/(?:i18n\/(en|pt|es)\/[\w-]+\.ts|tools\/[\w-]+(?:\/presets\/[\w-]+)?\/i18n\/(en|pt|es)\.ts)$/;
const SKIP_KEYS = new Set(['langCode', 'langSr', 'shortcut', 'pasteKey', 'synonyms', 'langNames', 'kbd']);
const SAMPLES: Record<string, string> = { name: 'Victor', city: 'Curitiba', percent: '68%', query: 'mortgage', kbd: 'Ctrl V' };
const CHUNK = 15_000;

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

/** Language of a site text file, or undefined when the path is not one. */
export function textFileLang(file: string): string | undefined {
  return TEXT_FILE.exec(file)?.slice(1).find(Boolean);
}

/** The site text files among `files` that exist, without repeats and sorted. */
export function selectTextFiles(files: string[], exists: (file: string) => boolean = existsSync): string[] {
  return [...new Set(files.map((file) => file.trim()).filter((file) => TEXT_FILE.test(file) && exists(file)))].sort();
}

/** Text files changed since the merge-base with the base branch (committed or not). */
export function changedTextFiles(): string[] {
  const base = process.env['LINT_TEXTO_BASE'] ?? 'origin/main';
  let files: string[];
  try {
    const mergeBase = git(['merge-base', base, 'HEAD']);
    files = git(['diff', '--name-only', mergeBase]).split('\n');
    files.push(...git(['ls-files', '--others', '--exclude-standard']).split('\n'));
  } catch {
    console.warn(`lint:texto: sem merge-base com ${base}; confere todos os textos`);
    files = git(['ls-files']).split('\n');
  }
  return selectTextFiles(files);
}

export function collectStrings(value: unknown, key = '', out: string[] = []): string[] {
  if (SKIP_KEYS.has(key)) return out;
  if (typeof value === 'string') out.push(value.replace(/\{(\w+)\}/g, (_, name: string) => SAMPLES[name] ?? name));
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, key, out);
  else if (value && typeof value === 'object') for (const [child, item] of Object.entries(value)) collectStrings(item, child, out);
  return out;
}

function chunks(texts: string[]): string[] {
  const out: string[] = [];
  let current = '';
  for (const text of texts) {
    if (current && current.length + text.length + 2 > CHUNK) {
      out.push(current);
      current = '';
    }
    current += `${text}\n\n`;
  }
  if (current) out.push(current);
  return out;
}

interface Match {
  message: string;
  offset: number;
  length: number;
  context: { text: string };
  rule: { id: string; issueType: string; category: { id: string } };
}

export function isGrammar(match: Match): boolean {
  return match.rule.issueType === 'grammar' || /^(GRAMMAR|AGREEMENT)/.test(match.rule.category.id);
}

/** Major version of a java binary (java -version writes to stderr); 0 when it does not run. */
function javaMajor(binary: string): number {
  const result = spawnSync(binary, ['-version'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) return 0;
  return Number(/version "(\d+)/.exec(`${result.stderr}${result.stdout}`)?.[1] ?? 0);
}

/** A Java 17+ already installed (the CI runner has one), or the pinned Temurin JRE. */
async function findJava(): Promise<string> {
  const candidates = [process.env['JAVA_HOME_21_X64'], process.env['JAVA_HOME'], process.env['JAVA_HOME_17_X64']]
    .filter((dir): dir is string => Boolean(dir))
    .map((dir) => join(dir, 'bin', process.platform === 'win32' ? 'java.exe' : 'java'));
  for (const candidate of [...candidates, 'java']) if (javaMajor(candidate) >= 17) return candidate;
  return ensureTool(JRE);
}

async function startServer(): Promise<{ url: string; child: ChildProcess | null }> {
  const external = process.env['LANGUAGETOOL_URL'];
  if (external) return { url: external.replace(/\/$/, ''), child: null };
  const jar = resolve(await ensureTool(LANGUAGETOOL));
  const found = await findJava();
  const java = /[\\/]/.test(found) ? resolve(found) : found;
  const port = 8081;
  const child = spawn(java, ['-Xmx1g', '-cp', jar, 'org.languagetool.server.HTTPServer', '--port', String(port)], {
    cwd: dirname(jar),
    stdio: 'ignore',
  });
  let failed: Error | null = null;
  child.on('error', (error) => {
    failed = error;
  });
  const url = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (failed) throw failed;
    try {
      if ((await fetch(`${url}/v2/languages`)).ok) return { url, child };
    } catch {
      /* not up yet */
    }
    await new Promise((done) => setTimeout(done, 500));
  }
  child.kill();
  throw new Error('o servidor do LanguageTool não subiu em 90 s');
}

async function check(url: string, language: string, text: string): Promise<Match[]> {
  const response = await fetch(`${url}/v2/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ text, language }),
  });
  if (!response.ok) throw new Error(`LanguageTool respondeu ${response.status}`);
  return ((await response.json()) as { matches: Match[] }).matches;
}

if (import.meta.main) {
  const files = changedTextFiles();
  if (files.length === 0) {
    console.log('lint:texto: nenhum texto alterado');
    process.exit(0);
  }
  const byLang = new Map<string, string[]>();
  for (const file of files) {
    const lang = textFileLang(file) ?? 'en';
    const module = (await import(pathToFileURL(resolve(file)).href)) as { default: unknown };
    byLang.set(lang, [...(byLang.get(lang) ?? []), ...collectStrings(module.default)]);
  }
  let server: { url: string; child: ChildProcess | null };
  try {
    server = await startServer();
  } catch (error) {
    console.warn(`lint:texto: AVISO, LanguageTool indisponível (${(error as Error).message}); nada reprovado`);
    process.exit(0);
  }
  let errors = 0;
  let warnings = 0;
  try {
    for (const [lang, texts] of byLang) {
      for (const text of chunks(texts)) {
        for (const match of await check(server.url, LANGUAGE[lang] ?? lang, text)) {
          const where = match.context.text.slice(Math.max(0, match.context.text.length / 2 - 40)).trim();
          const line = `[${lang}] ${match.rule.id} (${match.rule.category.id}): ${match.message} … "${where}"`;
          if (isGrammar(match)) {
            errors += 1;
            console.error(`ERRO  ${line}`);
          } else {
            warnings += 1;
            console.log(`aviso ${line}`);
          }
        }
      }
    }
  } catch (error) {
    console.warn(`lint:texto: AVISO, LanguageTool falhou no meio (${(error as Error).message}); nada reprovado`);
    server.child?.kill();
    process.exit(0);
  }
  server.child?.kill();
  const total = [...byLang.values()].reduce((sum, texts) => sum + texts.length, 0);
  console.log(`lint:texto: ${files.length} arquivo(s), ${total} textos, ${errors} erro(s) de gramática, ${warnings} aviso(s)`);
  process.exit(errors ? 1 : 0);
}
