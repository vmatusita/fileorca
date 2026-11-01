// Gate: minimum content of the image tool and preset pages, and a clean site (prompt F2, decision 10).
// Tool and preset pages come from the route map (ids of src/tools/image/registry.ts); each carries
// the how, specs, faq, privacy and related blocks, and a preset has at least three blocks of its own.
// The money calculators and presets of the F4 (ids of src/tools/calc/registry.ts) carry how (3 steps or more),
// faq (4 questions or more), privacy ("Your numbers stay on your device") and related, and a calculator preset
// has three blocks of its own too (DECISOES § 121).
// The 12 PDF tools and the PDF hub of the F5a come from the PDF registry (src/tools/pdf/registry.ts): each tool page has
// the five blocks, an H1 and a title that start with the tool name, the PrivacySeal, specs that say what it takes, a limit,
// what stays and what each mode does, four real questions, a privacy note, at most six related cards and no unmeasured
// claim; the hub has a card and a guide link for each tool (DECISOES § F5a-conteudo-pdf).
// Across the whole dist/ (404s aside): no repeated title or description and no placeholder wording.
// The checks are pure functions in scripts/lib/conteudo.ts, tested in tests/unit/conteudo.test.ts.
import { existsSync, readFileSync } from 'node:fs';
import { DIST, Problems, allPages, fileForPath, listFiles, requireDist } from '../lib/dist.ts';
import {
  calcComparisonPaths,
  checkCalcPage,
  checkPdfHub,
  checkPdfPage,
  checkPresetPage,
  checkSite,
  checkToolPage,
  comparisonPaths,
  isCalcPage,
  isImagePage,
  isNotFoundPath,
  pathOfFile,
} from '../lib/conteudo.ts';
import { routeById } from '../../src/i18n/routes.ts';
import enCommon from '../../src/i18n/en/common.ts';
import { IMAGE_PAGES } from '../../src/tools/image/registry.ts';
import { CALC_PAGES } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_PAGES, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';

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

let calcPages = 0;
for (const page of pages) {
  const id = page.route.id;
  if (!isCalcPage(id)) continue;
  calcPages += 1;
  if (!existsSync(fileForPath(page.path))) {
    problems.add(`${page.path}: a página não existe no dist`);
    continue;
  }
  const html = read(page.path);
  for (const problem of checkCalcPage(html)) problems.add(`${page.path}: ${problem}`);
  if (!CALC_PAGES[id].parent) continue;
  const others: Record<string, string> = {};
  for (const path of calcComparisonPaths(id)) {
    if (existsSync(fileForPath(path))) others[path] = read(path);
    else problems.add(`${page.path}: a página ${path}, usada na comparação, não existe no dist`);
  }
  for (const problem of checkPresetPage(html, others)) problems.add(`${page.path}: ${problem}`);
}
if (calcPages !== Object.keys(CALC_PAGES).length) problems.add(`${calcPages} calculadora(s) conferida(s), o registro tem ${Object.keys(CALC_PAGES).length}`);

// The PDF tools, read from the PDF registry (never a hand list): the route map must have each one, and the page must
// pass the PDF rules; the hub lists the 12 and the Image to PDF card, and the guide links to each of them.
let pdfPages = 0;
for (const id of PDF_TOOL_IDS) {
  const path = PDF_PAGES[id].path;
  if (!existsSync(fileForPath(path))) {
    problems.add(`${path}: a página não existe no dist`);
    continue;
  }
  pdfPages += 1;
  for (const problem of checkPdfPage(read(path), { id, name: enCommon.pdf[id].name, seal: enCommon.seal })) problems.add(`${path}: ${problem}`);
}
const hubPath = routeById(PDF_HUB_ID).paths.en ?? '/pdf-tools/';
if (!existsSync(fileForPath(hubPath))) problems.add(`${hubPath}: a página não existe no dist`);
else {
  pdfPages += 1;
  const paths = [...PDF_TOOL_IDS.map((id) => PDF_PAGES[id].path), routeById('image-to-pdf').paths.en ?? '/image-to-pdf/'];
  for (const problem of checkPdfHub(read(hubPath), { name: enCommon.pdfTools, paths })) problems.add(`${hubPath}: ${problem}`);
}
if (pdfPages !== PDF_TOOL_IDS.length + 1) problems.add(`${pdfPages} página(s) de PDF conferida(s), o registro tem ${PDF_TOOL_IDS.length} ferramentas e o hub`);

const sitePages = listFiles(DIST)
  .filter((file) => file.endsWith('.html'))
  .map((file) => ({ path: pathOfFile(file, DIST), html: readFileSync(file, 'utf8') }))
  .filter((page) => !isNotFoundPath(page.path));
for (const problem of checkSite(sitePages)) problems.add(problem);

problems.finish('conteúdo', `${toolPages} página(s) de ferramenta e de preset, ${calcPages} de calculadora, ${pdfPages} de PDF (as ferramentas e o hub) e ${sitePages.length} página(s) do site conferida(s)`);
