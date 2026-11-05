// Gate: the design system rules on the built site (F1b). On every page: a single stylesheet, the Oli
// sprite (unique ids, one oli-clip, closed pose list, [data-oli] boxes) and no arrow the fonts cannot
// draw. On the CSS the pages link: theme variables are tokens, movement is transform/opacity only,
// and the two latin fonts are the only .woff2 with the Fredoka preload on the exact URL of the CSS.
// The pure rules are in scripts/lib/design-checks.ts (tests/unit/design-checks.test.ts).
import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'node-html-parser';
import { DIST, Problems, listFiles, requireDist } from '../lib/dist.ts';
import { checkArrows, checkFonts, checkLoops, checkMotion, checkSingleStylesheet, checkSprite, checkThemeVars } from '../lib/design-checks.ts';
import { tokenNames } from '../lib/theme.ts';
import { fileGuideVoicePages, newVoicePages, pageVoiceProblems, pdfVoicePages, type VoicePage } from '../lib/voice-pages.ts';
import { languagesOf, routeById } from '../../src/i18n/routes.ts';
import { HEALTH_CALC_IDS } from '../../src/tools/calc/registry.ts';
import { FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';

requireDist();

/** Poses every page needs (the search dialog is on every page) and the ones the tool panel swaps in the client. */
const PAGE_POSES = ['peek'];
/** F12 (DECISOES § 417): sad is only on the ad-block wall, which the default build (this dist/) never has. */
const WALL_ONLY = ['sad'];
const TOOL_POSES = ['wave', 'gulp', 'swim', 'cheer', 'oops'];

const webPath = (file: string): string => `/${relative(DIST, file).split('\\').join('/')}`;
const pagePath = (file: string): string => webPath(file).replace(/index\.html$/, '');

const files = listFiles(DIST);
const pages = files
  .filter((file) => file.endsWith('.html'))
  .sort()
  .map((file) => ({ path: pagePath(file), html: readFileSync(file, 'utf8') }));

// Token names: tokens.json plus every custom property that tokens.css defines (fonts, shadows, radii...).
const tokensJson: unknown = JSON.parse(readFileSync('docs/design/tokens.json', 'utf8'));
const tokensCss = readFileSync('docs/design/tokens.css', 'utf8');
const names = new Set([...tokenNames(tokensJson), ...[...tokensCss.matchAll(/--([\w-]+)\s*:/g)].map((match) => match[1] ?? '')]);

const failures: string[] = [];
function report(name: string, problems: Problems, ok: string): void {
  if (!problems.list.length) {
    console.log(`design ${name}: ok, ${ok}`);
    return;
  }
  failures.push(name);
  console.error(`design ${name}: ${problems.list.length} problema(s)`);
  for (const problem of problems.list) console.error(`  - ${problem}`);
}

/** The pages of the health calculators, read from the registry and the route map. */
const HEALTH_PATHS = new Set(HEALTH_CALC_IDS.flatMap((id) => languagesOf(routeById(id)).map((lang) => routeById(id).paths[lang] ?? '')));

function perPage(check: (page: { path: string; html: string }) => string[]): Problems {
  const problems = new Problems();
  for (const page of pages) for (const problem of check(page)) problems.add(`${page.path}: ${problem}`);
  return problems;
}

report('folha de estilo única', perPage((page) => checkSingleStylesheet(page.html)), `${pages.length} páginas, cada uma com um <link rel="stylesheet"> e nenhum <style>`);
report(
  'sprite da Oli',
  perPage((page) =>
    // F7 (decision 5): the health calculators never cheer a result, so their sprite has every tool pose but cheer.
    HEALTH_PATHS.has(page.path)
      ? checkSprite(page.html, { requiredPoses: [...PAGE_POSES, ...TOOL_POSES.filter((pose) => pose !== 'cheer')], forbiddenPoses: ['cheer', ...WALL_ONLY] })
      : checkSprite(page.html, {
          requiredPoses: page.html.includes('id="fo-tool-root"')
            ? // F8: the image and PDF panels (their drop zone) also have the offline line in buoy (DECISOES § 292).
              [...PAGE_POSES, ...TOOL_POSES, ...(page.html.includes('class="fo-drop"') ? ['buoy'] : [])]
            : PAGE_POSES,
          forbiddenPoses: WALL_ONLY,
        }),
  ),
  `${pages.length} páginas, ids únicos, um oli-clip, poses da lista fechada e caixas [data-oli] com o próprio símbolo`,
);
report('setas', perPage((page) => checkArrows(page.html)), `${pages.length} páginas sem → nem ↔ no texto`);

/** The voice problems of a list of pages, each read in its language; a page of the list missing from the dist is one too. */
function voiceOf(list: readonly VoicePage[], missing: string, props: boolean): Problems {
  const problems = new Problems();
  for (const { lang, path } of list) {
    const page = pages.find((candidate) => candidate.path === path);
    if (!page) {
      problems.add(`${path}: ${missing}`);
      continue;
    }
    for (const problem of pageVoiceProblems(page.html, lang, props)) problems.add(`${path}: ${problem}`);
  }
  return problems;
}

// The voice of the PDF pages as built (F5a, DECISOES § 164): the visible text of each tool page and of the hub, and
// the texts the island gets in data-props (`t`, the panel bits every PDF tool shares, and `texts`, the tool's own), against the
// rules of the README: no forbidden marketing word, no emoji, no arrow, and an exclamation only in a success line (`done`,
// `doneMany`), so a visible text has none. The pages come from the PDF registry. F6: in every language of the route (the
// three since the F6), with the marketing words of that language too (FORBIDDEN_WORDS_BY_LANG).
const pdfPages = pdfVoicePages();
report('voz das páginas de PDF', voiceOf(pdfPages, 'a página do registro de PDF não existe no dist', true), `${pdfPages.length} páginas do registro de PDF (as ferramentas e o hub, em cada idioma): texto visível e textos do painel sem palavra proibida, emoji, seta nem exclamação fora do sucesso`);

// The file guides of the F5b, read from their registry: the same voice rules on the text a person reads (DECISOES § 188).
// Since the languages adjustment, in the three languages, each with the marketing words of its language.
const guidePages = fileGuideVoicePages();
report('voz dos guias de arquivo', voiceOf(guidePages, 'o guia do registro não existe no dist', false), `${guidePages.length} guias do registro (${FILE_GUIDE_IDS.length} em cada idioma): texto visível sem palavra proibida, emoji, seta nem exclamação fora do sucesso`);

// The other pages of the languages adjustment, in the same mold as the PDF pages (the visible text and the island's texts):
// the QR code generator in pt and es, and in es the nine calculators and four presets new there, the money hub and the five
// money guides. The pages that existed before stay out until PENDENCIAS F7 f-11.
const newPages = newVoicePages();
report('voz das páginas novas em pt e es', voiceOf(newPages, 'a página do mapa de rotas não existe no dist', true), `${newPages.length} páginas (o QR em pt e es; em es as calculadoras e os presets novos, o hub e os guias de dinheiro): texto visível e textos da ilha sem palavra proibida, emoji, seta nem exclamação fora do sucesso`);

// The CSS files the pages link, each with the pages that use it.
const sheets = new Map<string, string[]>();
const linkProblems = new Problems();
for (const page of pages) {
  for (const link of parse(page.html).querySelectorAll('link[rel="stylesheet"]')) {
    const href = link.getAttribute('href') ?? '';
    if (!href.startsWith('/') || href.startsWith('//')) {
      linkProblems.add(`${page.path}: folha de estilo fora do site (${href || 'sem href'})`);
      continue;
    }
    const file = join(DIST, decodeURI(href.split('?')[0] ?? href));
    if (!existsSync(file)) {
      linkProblems.add(`${page.path}: ${href} não existe no dist`);
      continue;
    }
    sheets.set(href, [...(sheets.get(href) ?? []), page.path]);
  }
}
report('folhas ligadas', linkProblems, `${sheets.size} arquivo(s) CSS em ${pages.length} páginas`);

const themeProblems = new Problems();
const motionProblems = new Problems();
const fontProblems = new Problems();
const woff2Files = files.filter((file) => file.endsWith('.woff2')).map(webPath);
for (const [href, users] of sheets) {
  const css = readFileSync(join(DIST, decodeURI(href.split('?')[0] ?? href)), 'utf8');
  for (const problem of checkThemeVars(css, names)) themeProblems.add(`${href}: ${problem}`);
  for (const problem of checkMotion(css)) motionProblems.add(`${href}: ${problem}`);
  // F13a · a Oli por estado (DECISOES § 460): "infinite" only on the selectors of the progress.
  for (const problem of checkLoops(css)) motionProblems.add(`${href}: ${problem}`);
  const usingPages = pages.filter((page) => users.includes(page.path));
  // Page messages already start with the page path; the ones about the CSS or the files get the CSS name.
  for (const problem of checkFonts({ css, pages: usingPages, woff2Files })) fontProblems.add(problem.startsWith('/') ? problem : `${href}: ${problem}`);
}
report('variáveis do tema', themeProblems, `${sheets.size} CSS, todo --color-*, --radius-*, --shadow-* e --font-* é token`);
report('movimento', motionProblems, `${sheets.size} CSS, @keyframes e transition só com transform, opacity, translate, scale e rotate, e laço sem fim só no progresso`);
report('fontes', fontProblems, `${woff2Files.length} .woff2 (Fredoka e Figtree latinas), preload só da Fredoka com a URL do @font-face`);

if (failures.length) {
  console.error(`design: falhou em ${failures.length} verificação(ões): ${failures.join(', ')}`);
  process.exit(1);
}
console.log(`design: ok, ${pages.length} páginas e ${sheets.size} CSS conferidos`);
