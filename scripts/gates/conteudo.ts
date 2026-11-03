// Gate: minimum content of the image tool and preset pages, and a clean site (prompt F2, decision 10).
// Tool and preset pages come from the route map (ids of src/tools/image/registry.ts); each carries
// the how, specs, faq, privacy and related blocks, and a preset has at least three blocks of its own.
// The money calculators and presets of the F4 (ids of src/tools/calc/registry.ts) carry how (3 steps or more),
// faq (4 questions or more), privacy ("Your numbers stay on your device") and related, and a calculator preset
// has three blocks of its own too (DECISOES § 121).
// The 12 PDF tools and the PDF hub of the F5a come from the PDF registry (src/tools/pdf/registry.ts): each tool page has
// the five blocks, an H1 and a title that start with the tool name, the PrivacySeal, specs that say what it takes, a limit,
// what stays and what each mode does, four real questions, a privacy note, at most six related cards and no unmeasured
// claim; the hub has a card and a guide link for each tool (DECISOES § 162).
// The ten file guides of the F5b come from their registry (src/tools/guides/registry.ts): each one has the blocks of the
// page in order, 800 to 1,500 words of its own text and no filler phrase (scripts/lib/file-guides.ts; DECISOES § 188).
// Across the whole dist/ (404s aside): no repeated title or description and no placeholder wording.
// F6 (decision 9): every page in every language of the route map. The calculators of the registries in each language they
// have (the Spanish ones of ES_CALC_IDS and the Brazilian ones too), with the privacy phrase of the language; the PDF tools
// and the hub in the three languages, with the names, seal and words of the language (DECISOES § 162 extended).
// F7 (decision 8): the QR code generator, from the route map (QR_ID): its four blocks, real questions, a privacy note that says
// the text stays on the device and the link typed is never opened, and no unmeasured claim.
// The languages adjustment: the QR code generator and the ten file guides in Portuguese and Spanish too, each held to the
// words of its language (the privacy phrases, the date of the measurement, the filler phrases, the claims).
// The checks are pure functions in scripts/lib/conteudo.ts, tested in tests/unit/conteudo.test.ts.
import { existsSync, readFileSync } from 'node:fs';
import { DIST, Problems, allPages, fileForPath, listFiles, requireDist } from '../lib/dist.ts';
import {
  calcComparisonPaths,
  checkCalcPage,
  checkPdfHub,
  checkPdfPage,
  checkPresetPage,
  checkQrPage,
  checkSite,
  checkToolPage,
  comparisonPaths,
  isCalcPage,
  isImagePage,
  isNotFoundPath,
  pathOfFile,
} from '../lib/conteudo.ts';
import { LANGS, QR_ID, languagesOf, routeById } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { IMAGE_PAGES } from '../../src/tools/image/registry.ts';
import { BR_CALC_IDS, CALC_PAGES, CALC_PAGE_IDS, LIFE_CALC_IDS, isBrCalc, isLifeCalc, moneyPage } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';
import { checkFileGuide, guideWords } from '../lib/file-guides.ts';

requireDist();
const problems = new Problems();
const read = (path: string): string => readFileSync(fileForPath(path), 'utf8');

const pages = allPages();
for (const id of [...Object.keys(IMAGE_PAGES), ...Object.keys(CALC_PAGES), ...PDF_TOOL_IDS, PDF_HUB_ID]) {
  if (!pages.some((page) => page.route.id === id)) problems.add(`${id}: a página do registro não está no mapa de rotas`);
}

let toolPages = 0;
for (const page of pages) {
  const id = page.route.id;
  if (!isImagePage(id)) continue;
  toolPages += 1;
  if (!existsSync(fileForPath(page.path))) {
    problems.add(`${page.path}: a página não existe no dist`);
    continue;
  }
  const html = read(page.path);
  for (const problem of checkToolPage(html)) problems.add(`${page.path}: ${problem}`);
  if (!IMAGE_PAGES[id].parent) continue;
  const others: Record<string, string> = {};
  for (const path of comparisonPaths(id, page.lang)) {
    if (existsSync(fileForPath(path))) others[path] = read(path);
    else problems.add(`${page.path}: a página ${path}, usada na comparação, não existe no dist`);
  }
  for (const problem of checkPresetPage(html, others)) problems.add(`${page.path}: ${problem}`);
}

// The calculators of the registries, in every language of the route map: the English ones (and the Spanish page of the
// five of ES_CALC_IDS), the Brazilian ones, each with the privacy phrase of its language (F6), and since the F7 the 11 home
// and health ones, in English.
let calcPages = 0;
for (const page of pages) {
  const id = page.route.id;
  if (!isCalcPage(id) && !isBrCalc(id) && !isLifeCalc(id)) continue;
  calcPages += 1;
  if (!existsSync(fileForPath(page.path))) {
    problems.add(`${page.path}: a página não existe no dist`);
    continue;
  }
  const html = read(page.path);
  for (const problem of checkCalcPage(html, page.lang)) problems.add(`${page.path}: ${problem}`);
  if (!isCalcPage(id) || !CALC_PAGES[id].parent) continue;
  const others: Record<string, string> = {};
  for (const path of calcComparisonPaths(id, page.lang)) {
    if (existsSync(fileForPath(path))) others[path] = read(path);
    else problems.add(`${page.path}: a página ${path}, usada na comparação, não existe no dist`);
  }
  for (const problem of checkPresetPage(html, others)) problems.add(`${page.path}: ${problem}`);
}
// Every language the registries give a calculator is a page the gate read: English for the 18, Spanish for the five of
// ES_CALC_IDS, Portuguese for the Brazilian ones whose rows are in the map. A row missing from the map, or a language the
// map drops, makes the count differ.
const brInMap = BR_CALC_IDS.filter((id) => pages.some((page) => page.route.id === id));
const calcWanted = [...CALC_PAGE_IDS, ...brInMap, ...LIFE_CALC_IDS].reduce((sum, id) => sum + LANGS.filter((lang) => moneyPage(id, lang) !== null).length, 0);
if (calcPages !== calcWanted) problems.add(`${calcPages} página(s) de calculadora conferida(s), os registros têm ${calcWanted} (cada calculadora em cada idioma dela)`);

// The PDF tools, read from the PDF registry (never a hand list), in every language of their route (F6): the route map must
// have each one, and the page must pass the PDF rules in its language; the hub lists the 12 and the Image to PDF card of its
// language, and the guide links to each of them.
let pdfPages = 0;
let pdfWanted = 0;
for (const id of PDF_TOOL_IDS) {
  const route = pages.find((page) => page.route.id === id)?.route;
  for (const lang of route ? languagesOf(route) : []) {
    const path = route?.paths[lang] ?? '';
    pdfWanted += 1;
    if (!existsSync(fileForPath(path))) {
      problems.add(`${path}: a página não existe no dist`);
      continue;
    }
    pdfPages += 1;
    const common = TEXTS[lang].common;
    for (const problem of checkPdfPage(read(path), { id, name: common.pdf[id].name, seal: common.seal, lang })) problems.add(`${path}: ${problem}`);
  }
}
const hub = routeById(PDF_HUB_ID);
for (const lang of languagesOf(hub)) {
  const hubPath = hub.paths[lang] ?? '/pdf-tools/';
  pdfWanted += 1;
  if (!existsSync(fileForPath(hubPath))) {
    problems.add(`${hubPath}: a página não existe no dist`);
    continue;
  }
  pdfPages += 1;
  const paths = [...PDF_TOOL_IDS, 'image-to-pdf' as const].flatMap((id) => routeById(id).paths[lang] ?? []);
  for (const problem of checkPdfHub(read(hubPath), { name: TEXTS[lang].common.pdfTools, paths, lang })) problems.add(`${hubPath}: ${problem}`);
}
if (pdfPages !== pdfWanted || pdfWanted < PDF_TOOL_IDS.length + 1) {
  problems.add(`${pdfPages} página(s) de PDF conferida(s), o mapa de rotas tem ${pdfWanted} (as ${PDF_TOOL_IDS.length} ferramentas e o hub, em cada idioma)`);
}

// The QR code generator (F7), in every language of its route (English, and Portuguese and Spanish since the languages
// adjustment), each with the privacy phrases and the claims of its language.
let qrPages = 0;
const qrRoute = pages.find((page) => page.route.id === QR_ID)?.route;
if (!qrRoute) problems.add(`${QR_ID}: a página não está no mapa de rotas`);
for (const lang of qrRoute ? languagesOf(qrRoute) : []) {
  const path = qrRoute?.paths[lang] ?? '';
  if (!existsSync(fileForPath(path))) {
    problems.add(`${path}: a página não existe no dist`);
    continue;
  }
  qrPages += 1;
  for (const problem of checkQrPage(read(path), lang)) problems.add(`${path}: ${problem}`);
}

// The file guides, read from their registry, in each of their languages (the three since the languages adjustment): the
// route map must have each one at the path of the registry, and the page must pass the guide rules of its language, with
// the link to the tool page of that language.
let guidePages = 0;
let guideWanted = 0;
const guideWordCounts: string[] = [];
for (const id of FILE_GUIDE_IDS) {
  const route = pages.find((page) => page.route.id === id)?.route;
  if (!route) problems.add(`${id}: o guia do registro não está no mapa de rotas`);
  for (const lang of LANGS) {
    const path = FILE_GUIDES[id].paths[lang];
    guideWanted += 1;
    if (route && route.paths[lang] !== path) problems.add(`${path}: o mapa de rotas não tem o guia ${id} em ${lang} neste caminho`);
    if (!existsSync(fileForPath(path))) {
      problems.add(`${path}: a página não existe no dist`);
      continue;
    }
    guidePages += 1;
    const toolPath = routeById(FILE_GUIDES[id].tool).paths[lang] ?? '';
    if (!toolPath) problems.add(`${path}: a ferramenta ${FILE_GUIDES[id].tool} não tem página em ${lang}`);
    const html = read(path);
    for (const problem of checkFileGuide(html, { toolPath, lang })) problems.add(`${path}: ${problem}`);
    guideWordCounts.push(`${lang}/${path.split('/').at(-2) ?? path} ${guideWords(html)}`);
  }
}
if (guidePages !== guideWanted) problems.add(`${guidePages} guia(s) de arquivo conferido(s), o registro tem ${guideWanted} (${FILE_GUIDE_IDS.length} guias em ${LANGS.length} idiomas)`);
console.log(`palavras dos guias de arquivo: ${guideWordCounts.join(', ')}`);

const sitePages = listFiles(DIST)
  .filter((file) => file.endsWith('.html'))
  .map((file) => ({ path: pathOfFile(file, DIST), html: readFileSync(file, 'utf8') }))
  .filter((page) => !isNotFoundPath(page.path));
for (const problem of checkSite(sitePages)) problems.add(problem);

problems.finish('conteúdo', `${toolPages} página(s) de ferramenta e de preset, ${calcPages} de calculadora, ${pdfPages} de PDF (as ferramentas e o hub), ${guidePages} guia(s) de arquivo, ${qrPages} do gerador de QR code e ${sitePages.length} página(s) do site conferida(s)`);
