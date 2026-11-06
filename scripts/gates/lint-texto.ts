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
import type { GUIDE_FACTS as GUIDE_FACTS_TYPE, GuideLang } from '../../src/tools/calc/guides.ts';
import type * as MEASURED_MODULE from '../../src/tools/guides/measured.ts';
import type { FileGuidesSharedTexts, FileGuideTexts } from '../../src/i18n/types.ts';
import type { Lang } from '../../src/i18n/routes.ts';
import { FILE_GUIDE_IDS, type FileGuideId } from '../../src/tools/guides/registry.ts';
import { GUIDE_IDS, LIFE_CALC_IDS, type GuideId } from '../../src/tools/calc/registry.ts';

const LANGUAGE: Record<string, string> = { en: 'en-US', pt: 'pt-BR', es: 'es' };
// Every text file the route map lists (src/i18n/routes.ts): page texts, a tool's texts, the texts
// shared by the image tools and the texts of a preset (src/tools/<tool>/presets/<name>/i18n/<lang>.ts).
// tests/unit/lint-texto-files.test.ts keeps this filter and the route map in step.
export const TEXT_FILE = /^src\/(?:i18n\/(en|pt|es)\/[\w-]+\.ts|tools\/[\w-]+(?:\/presets\/[\w-]+)?\/i18n\/(en|pt|es)\.ts)$/;
// href and read are the links and dates of a guide's sources (F5b): data, not prose.
const SKIP_KEYS = new Set(['langCode', 'langSr', 'shortcut', 'pasteKey', 'synonyms', 'langNames', 'kbd', 'href', 'read']);
const SAMPLES: Record<string, string> = { name: 'Victor', city: 'Curitiba', percent: '68%', query: 'mortgage', kbd: 'Ctrl V' };
/** The same samples in the format of Portuguese and Spanish (F6): "68 %" with a no-break space in Spanish. */
const SAMPLES_BY_LANG: Record<string, Record<string, string>> = {
  en: SAMPLES,
  pt: { ...SAMPLES, query: 'comprimir' },
  es: { ...SAMPLES, percent: '68\u00a0%', query: 'comprimir' },
};
const samplesOf = (file: string): Record<string, string> => SAMPLES_BY_LANG[textFileLang(file) ?? 'en'] ?? SAMPLES;
/**
 * F13b: the About and Terms pages count the tools through placeholders that the views fill from
 * src/components/tool-count.ts (DECISOES § 540). The samples are the counts of that module in each language, and
 * tests/unit/tool-count.test.ts checks that they still are.
 */
export const COUNT_SAMPLES: Record<string, Record<string, string>> = {
  en: { image: '8', pdf: '12', money: '14', life: '11', total: '46', brazil: '8', spanish: '14', languages: '3' },
  pt: { image: '8', pdf: '12', money: '8', life: '0', total: '29', brazil: '8', spanish: '14', languages: '3' },
  es: { image: '8', pdf: '12', money: '14', life: '0', total: '35', brazil: '8', spanish: '14', languages: '3' },
};
const isCountText = (file: string): boolean => /[\\/](about|terms)\.ts$/.test(file);
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
  // F13b (DECISOES § 545): the field of "Last result that worked: {label} {value}." and its value in the last result.
  label: 'Rate',
  value: '6.5%',
};
const MONEY_DEFAULT = '$1,234';

/**
 * The money samples of the Portuguese pages (the calculators adapted to Brazil) and of the Spanish ones (F6): numbers,
 * money and dates in the format of each language (docs/i18n), so a sentence reads as the page shows it. A placeholder
 * without a sample reads as money: "R$ 1.234,56" in Portuguese, "$1,234.56" in Spanish (DECISOES § 227).
 */
export const MONEY_SAMPLES_BY_LANG: Record<string, { samples: Record<string, string>; fallback: string }> = {
  en: { samples: MONEY_SAMPLES, fallback: MONEY_DEFAULT },
  pt: {
    samples: {
      time: '3 anos e 4 meses',
      months: '30 anos',
      years: '10',
      sooner: '8 anos',
      snow: '1 ano e 2 meses',
      aval: '1 ano e 2 meses',
      rate: '6,5%',
      tr: '0,1%',
      cetYear: '26,57%',
      cetMonth: '1,98%',
      x: 'R$ 1.234,56',
      n: '12',
      count: '36',
      date: '1 de novembro de 2026',
      name: 'Victor Yuki Matusita',
      interestPart: 'paga R$ 484 a menos de juros',
      timePart: 'termina 1 mês antes',
      amount: '5',
      label: 'Juros a.a.',
      value: '11%',
    },
    fallback: 'R$ 1.234,56',
  },
  es: {
    samples: {
      time: '3 años 4 meses',
      years: '30 años',
      rate: '6.5\u00a0%',
      result: '5.13\u00a0%',
      apr: '15.09\u00a0%',
      n: '12',
      count: '36',
      month: '24',
      how: 'mensual',
      unit: 'años',
      date: '1 de noviembre de 2026',
      name: 'Victor Yuki Matusita',
      // The languages adjustment: the placeholders of the nine calculators and four presets new in Spanish that are not an
      // amount of money, written as the Spanish page writes them (docs/i18n/es.md: "28 %" with a no-break space). Home
      // affordability: the two limits and the rule they make.
      front: '28\u00a0%',
      back: '36\u00a0%',
      rule: 'el límite de vivienda del 28\u00a0%',
      // Refinance, debt consolidation and 15 vs 30-year: what B costs against A, said with its direction.
      paymentDiff: '$308 menos',
      totalDiff: '$3,490 más',
      interestEffect: 'ahorra $212,238 de intereses',
      interestPart: 'paga $484 menos de intereses',
      timePart: 'termina 1 mes antes',
      // Biweekly and extra payments: the term of the loan without the change.
      base: '30 años',
      label: 'Tasa',
      value: '6.5 %',
      // F13b (DECISOES § 547): the total of the costs in the title of the block that folds.
      extras: '$500.00',
    },
    fallback: '$1,234.56',
  },
};

/**
 * Money samples that depend on the page (the languages adjustment): the same name is a plain number on one calculator and
 * a duration or an amount on another. "{years}" is a duration on the mortgage ("En {years} al {rate}") and a count before
 * the word on Rent vs buy ("Después de {years} años"); "{saved}" is the time saved on the two mortgage presets and an
 * amount on Savings goal. Keyed by the folder of the texts under src/tools/, per language; English keeps the F4 samples.
 */
export const MONEY_SAMPLES_BY_PAGE: Record<string, Record<string, Record<string, string>>> = {
  es: {
    'rent-vs-buy-calculator': { years: '10' },
    'mortgage-calculator/presets/biweekly': { saved: '3 años 4 meses' },
    'mortgage-calculator/presets/extra-payments': { saved: '3 años 4 meses' },
  },
};

/** The folder of a tool's or preset's texts under src/tools/ ("mortgage-calculator/presets/biweekly"), or undefined. */
const toolFolderOf = (file: string): string | undefined => /^src\/tools\/([\w-]+(?:\/presets\/[\w-]+)?)\/i18n\/(?:en|pt|es)\.ts$/.exec(file)?.[1];

/**
 * The samples of the QR code generator's texts, in each language (the languages adjustment): the limit in bytes ("{max}"),
 * the count next to the label ("{count} of {max}") and the side of the PNG ("{side} px"), with the digit groups of the
 * language. Apart from SAMPLES because "{count}" and "{max}" mean other things in the image and PDF texts.
 */
export const QR_SAMPLES_BY_LANG: Record<string, Record<string, string>> = {
  en: { max: '1,273', count: '42', side: '512' },
  pt: { max: '1.273', count: '42', side: '512' },
  es: { max: '1,273', count: '42', side: '512' },
};

/** A text file of the QR code generator: src/tools/qr-code-generator/i18n/<lang>.ts. */
export function isQrText(file: string): boolean {
  return /^src\/tools\/qr-code-generator\/i18n\/(?:en|pt|es)\.ts$/.test(file);
}

/**
 * The samples of the home and health calculators and their hubs (F7, decision 11): measures, counts and dates as their
 * pages show them, from the page examples of the oracle (fixtures/calc/<id>.json). They are apart from the money samples
 * because some names mean something else there: "{x}" is an amount of money on a money page ("You would pay {x} less")
 * and a length on Square footage and Tile ("{x} × {y} in"). A placeholder of these texts without a sample reads as a plain
 * number, never as money.
 */
export const LIFE_SAMPLES: Record<string, string> = {
  // Square footage: "That is {yards} square yards. Areas added up: {n}." and the sides of an area.
  yards: '20.00',
  n: '2',
  x: '15',
  y: '12',
  // Concrete and Mulch & gravel: "That is {feet} cu ft with {waste}% extra, or {bags} bags of {bag} cu ft".
  feet: '36.67',
  waste: '10',
  bags: '62',
  bag: '2',
  tons: '1.58',
  // Paint: "That is {area} sq ft to paint, times {coats} for the coats, at {coverage} sq ft a gallon. ... buy {buy} gal."
  area: '333',
  coats: '2',
  coverage: '350',
  buy: '2',
  // Tile: "Counted for {size} tiles with {waste}% extra for cuts. Boxes of {per} to buy: {boxes}."
  size: '12 × 12 in',
  per: '10',
  boxes: '14',
  // BTU: "The Energy Star table gives {base} BTU per hour".
  base: '9,000',
  // BMI: "a BMI of {bmi} is in {category}, the range from {band}".
  bmi: '23.6',
  category: 'Healthy Weight',
  band: '18.5 to 24.9',
  // Calorie: "By the {sex} formula, the equation gives {ree} kcal a day at rest; times an activity level of {pal}, ..."
  sex: 'female',
  ree: '1,376',
  pal: '1.6',
  tdee: '2,202',
  // Ovulation: "Your fertile window is about {from} to {to}, and your next period about {next}."
  from: 'October 27, 2026',
  to: 'November 1, 2026',
  next: 'November 16, 2026',
  // Body fat: "with the {sex} formula, these measures give an estimated {percent}% body fat".
  percent: '25.9',
  // Due date: "Counted from a first day of the last period on {lmp}. {today}", with "{weeks} and {days}".
  lmp: 'September 7, 2026',
  today: 'Today the pregnancy is 8 weeks and 1 day along.',
  age: '8 weeks and 1 day',
  weeks: '8 weeks',
  days: '1 day',
};
/**
 * A sample that depends on the string it fills (F7): "{n} week" and "{n} day" are the singular forms, which the page shows
 * only for 1; "{n} weeks", "{n} days" and "Area {n}" read with the plural sample.
 */
export const LIFE_SAMPLES_BY_KEY: Record<string, Record<string, string>> = { week: { n: '1' }, day: { n: '1' } };
const LIFE_DEFAULT = '12';

/** A text file of the home and health calculators or of their hubs (F7): src/tools/<id>/i18n/<lang>.ts or the hub texts. */
export function isLifeText(file: string): boolean {
  const tool = /^src\/tools\/([\w-]+)\/i18n\/(?:en|pt|es)\.ts$/.exec(file)?.[1];
  if (tool) return (LIFE_CALC_IDS as readonly string[]).includes(tool);
  return /^src\/i18n\/(?:en|pt|es)\/(?:home|health)-calculators\.ts$/.test(file);
}

/**
 * The id of a file guide (F5b) whose texts this is, or undefined: src/i18n/<lang>/guide-<slug>.ts of a guide in
 * FILE_GUIDE_IDS, in English, Portuguese or Spanish since the languages adjustment (the file keeps the English slug).
 */
export function fileGuideOf(file: string): FileGuideId | undefined {
  const slug = /^src\/i18n\/(?:en|pt|es)\/guide-([\w-]+)\.ts$/.exec(file)?.[1];
  const id = slug ? `guides-${slug}` : '';
  return (FILE_GUIDE_IDS as readonly string[]).includes(id) ? (id as FileGuideId) : undefined;
}

/**
 * The money guide (F4) whose texts this is, with the language, or undefined: src/i18n/<lang>/guide-<slug>.ts of a guide in
 * GUIDE_IDS, in English or, since the languages adjustment, Spanish (no US money page exists in Portuguese).
 */
export function moneyGuideOf(file: string): { id: GuideId; lang: GuideLang } | undefined {
  const match = /^src\/i18n\/(en|es)\/guide-([\w-]+)\.ts$/.exec(file);
  const id = match ? `guides-${match[2]}` : '';
  return match && (GUIDE_IDS as readonly string[]).includes(id) ? { id: id as GuideId, lang: match[1] as GuideLang } : undefined;
}

/**
 * A money text file: a calculator's or preset's texts (also the Brazilian calculators, src/tools/br-*), the texts the
 * calculators share, a money hub of any language or a money guide (English or Spanish). F7: the texts of the home and health
 * calculators are calculator texts but not money (isLifeText), filled with their own samples.
 */
export function isMoneyText(file: string): boolean {
  if (fileGuideOf(file) || isLifeText(file)) return false;
  if (moneyGuideOf(file)) return true;
  return /^src\/(?:tools\/(?:[\w-]+-calculator|br-[\w-]+)\/|tools\/calc\/i18n\/|i18n\/(?:en|pt|es)\/money-calculators\.ts)/.test(file);
}

/** How a placeholder is filled: by its name and, for the few samples that depend on it, the key of the string (F7). */
export type Fill = (name: string, key: string) => string;

export function collectStrings(value: unknown, key = '', out: string[] = [], fill: Fill = (name) => SAMPLES[name] ?? name): string[] {
  if (SKIP_KEYS.has(key)) return out;
  if (typeof value === 'string') out.push(value.replace(/\{(\w+)\}/g, (_, name: string) => fill(name, key)));
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, key, out, fill);
  else if (value && typeof value === 'object') for (const [child, item] of Object.entries(value)) collectStrings(item, child, out, fill);
  return out;
}

/**
 * How a file's placeholders are filled: a guide with the numbers its page shows, a money text with samples. A file guide
 * (F5b) is filled from data/guides-measured.json and its own official facts, the values its page shows (DECISOES § 189).
 */
export async function fillFor(file: string): Promise<Fill> {
  const lang = textFileLang(file) ?? 'en';
  const fileGuide = fileGuideOf(file);
  if (fileGuide) {
    // The languages adjustment: a guide of Portuguese or Spanish is filled the way its page writes the numbers (separators,
    // "%", no-break spaces, counts in words with their gender, the date written out), from the shared texts of its language.
    // Those are imported directly: src/tools/guides/page.ts holds them too, but reads the guide texts with import.meta.glob,
    // which only runs under Vite.
    const { MEASURED, fillValues, placeholdersIn } = (await import(pathToFileURL(resolve('src/tools/guides/measured.ts')).href)) as typeof MEASURED_MODULE;
    const shared = ((await import(pathToFileURL(resolve(`src/i18n/${lang}/file-guides.ts`)).href)) as { default: FileGuidesSharedTexts }).default;
    const texts = ((await import(pathToFileURL(resolve(file)).href)) as { default: FileGuideTexts }).default;
    const values = fillValues(fileGuide, texts, [...placeholdersIn(texts)], MEASURED, { lang: lang as Lang, shared });
    const samples = samplesOf(file);
    return (name) => values[name] ?? samples[name] ?? name;
  }
  // F7: the home and health calculators and their hubs, with measures, counts and dates, never money.
  if (isLifeText(file)) return (name, key) => LIFE_SAMPLES_BY_KEY[key]?.[name] ?? LIFE_SAMPLES[name] ?? LIFE_DEFAULT;
  const samples = samplesOf(file);
  // The languages adjustment: the QR code generator, with its limit and sizes in the digits of its language.
  if (isQrText(file)) {
    const qr = QR_SAMPLES_BY_LANG[lang] ?? {};
    return (name) => qr[name] ?? samples[name] ?? name;
  }
  if (isCountText(file)) {
    const counts = COUNT_SAMPLES[lang] ?? {};
    return (name) => counts[name] ?? samples[name] ?? name;
  }
  if (!isMoneyText(file)) return (name) => samples[name] ?? name;
  const money = MONEY_SAMPLES_BY_LANG[lang] ?? { samples: MONEY_SAMPLES, fallback: MONEY_DEFAULT };
  const guide = moneyGuideOf(file);
  if (guide) {
    // A money guide, in English or Spanish: the facts the engines give its page in its language, and the samples of the
    // language for the words of its table ("month {n}", "Savings earn {rate}").
    const { GUIDE_FACTS } = (await import(pathToFileURL(resolve('src/tools/calc/guides.ts')).href)) as { GUIDE_FACTS: typeof GUIDE_FACTS_TYPE };
    const facts = GUIDE_FACTS[guide.id](guide.lang).facts;
    return (name) => facts[name] ?? money.samples[name] ?? money.fallback;
  }
  const page = MONEY_SAMPLES_BY_PAGE[lang]?.[toolFolderOf(file) ?? ''] ?? {};
  // A singular form ("monthsOne: '{n} mes'", review of the languages adjustment, C-3) is shown only for 1, so it reads with 1.
  return (name, key) => (name === 'n' && key.endsWith('One') ? '1' : (page[name] ?? money.samples[name] ?? money.fallback));
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
