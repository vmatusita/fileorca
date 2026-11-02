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
import type { GUIDE_FACTS as GUIDE_FACTS_TYPE } from '../../src/tools/calc/guides.ts';
import type * as MEASURED_MODULE from '../../src/tools/guides/measured.ts';
import type { FileGuideTexts } from '../../src/i18n/types.ts';
import { FILE_GUIDE_IDS, type FileGuideId } from '../../src/tools/guides/registry.ts';

const LANGUAGE: Record<string, string> = { en: 'en-US', pt: 'pt-BR', es: 'es' };
// Every text file the route map lists (src/i18n/routes.ts): page texts, a tool's texts, the texts
// shared by the image tools and the texts of a preset (src/tools/<tool>/presets/<name>/i18n/<lang>.ts).
// tests/unit/lint-texto-files.test.ts keeps this filter and the route map in step.
export const TEXT_FILE = /^src\/(?:i18n\/(en|pt|es)\/[\w-]+\.ts|tools\/[\w-]+(?:\/presets\/[\w-]+)?\/i18n\/(en|pt|es)\.ts)$/;
// href and read are the links and dates of a guide's sources (F5b): data, not prose.
const SKIP_KEYS = new Set(['langCode', 'langSr', 'shortcut', 'pasteKey', 'synonyms', 'langNames', 'kbd', 'href', 'read']);
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

/**
 * Values the money texts (F4) are filled with before the check, so LanguageTool reads a sentence as the page
 * shows it: "costs {more} more" read as "costs more more" was a false grammar error. A placeholder of a money
 * text without a sample here reads as an amount of money, which is what most of them are (DECISOES § 123).
 */
export const MONEY_SAMPLES: Record<string, string> = {
  time: '3 years 4 months',
  years: '30 years',
  rate: '6.5%',
  result: '5.13%',
  apr: '15.09%',
  front: '28%',
  back: '36%',
  n: '12',
  count: '36',
  month: '24',
  how: 'monthly',
  unit: 'years',
  rule: 'the 28% housing limit',
  date: 'October 31, 2026',
  name: 'Victor Yuki Matusita',
  paymentDiff: '$308 less',
  totalDiff: '$3,490 more',
  interestEffect: 'saves $212,238 of interest',
  interestPart: 'pays $484 less interest',
  timePart: 'is done 1 month sooner',
};
const MONEY_DEFAULT = '$1,234';

/** The id of a file guide (F5b) whose texts this is, or undefined: src/i18n/en/guide-<slug>.ts of a guide in FILE_GUIDE_IDS. */
export function fileGuideOf(file: string): FileGuideId | undefined {
  const slug = /^src\/i18n\/en\/guide-([\w-]+)\.ts$/.exec(file)?.[1];
  const id = slug ? `guides-${slug}` : '';
  return (FILE_GUIDE_IDS as readonly string[]).includes(id) ? (id as FileGuideId) : undefined;
}

/** A money text file: a calculator's or preset's texts, the texts the calculators share, the money hub or a money guide. */
export function isMoneyText(file: string): boolean {
  if (fileGuideOf(file)) return false;
  return /^src\/(?:tools\/[\w-]+-calculator\/|tools\/calc\/i18n\/|i18n\/en\/(?:money-calculators|guide-[\w-]+)\.ts)/.test(file);
}

export function collectStrings(value: unknown, key = '', out: string[] = [], fill: (name: string) => string = (name) => SAMPLES[name] ?? name): string[] {
  if (SKIP_KEYS.has(key)) return out;
  if (typeof value === 'string') out.push(value.replace(/\{(\w+)\}/g, (_, name: string) => fill(name)));
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, key, out, fill);
  else if (value && typeof value === 'object') for (const [child, item] of Object.entries(value)) collectStrings(item, child, out, fill);
  return out;
}

/**
 * How a file's placeholders are filled: a guide with the numbers its page shows, a money text with samples. A file guide
 * (F5b) is filled from data/guides-measured.json and its own official facts, the values its page shows (DECISOES § 189).
 */
export async function fillFor(file: string): Promise<(name: string) => string> {
  const fileGuide = fileGuideOf(file);
  if (fileGuide) {
    const { fillValues, placeholdersIn } = (await import(pathToFileURL(resolve('src/tools/guides/measured.ts')).href)) as typeof MEASURED_MODULE;
    const texts = ((await import(pathToFileURL(resolve(file)).href)) as { default: FileGuideTexts }).default;
    const values = fillValues(fileGuide, texts, [...placeholdersIn(texts)]);
    return (name) => values[name] ?? SAMPLES[name] ?? name;
  }
  if (!isMoneyText(file)) return (name) => SAMPLES[name] ?? name;
  const guide = /^src\/i18n\/en\/guide-([\w-]+)\.ts$/.exec(file)?.[1];
  if (guide) {
    const { GUIDE_FACTS } = (await import(pathToFileURL(resolve('src/tools/calc/guides.ts')).href)) as { GUIDE_FACTS: typeof GUIDE_FACTS_TYPE };
    const facts = GUIDE_FACTS[`guides-${guide}` as keyof typeof GUIDE_FACTS]().facts;
    return (name) => facts[name] ?? MONEY_SAMPLES[name] ?? MONEY_DEFAULT;
  }
  return (name) => MONEY_SAMPLES[name] ?? MONEY_DEFAULT;
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
    byLang.set(lang, [...(byLang.get(lang) ?? []), ...collectStrings(module.default, '', [], await fillFor(file))]);
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
