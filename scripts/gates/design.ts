// Gate: the design system rules on the built site (F1b). On every page: a single stylesheet, the Oli
// sprite (unique ids, one oli-clip, closed pose list, [data-oli] boxes) and no arrow the fonts cannot
// draw. On the CSS the pages link: theme variables are tokens, movement is transform/opacity only,
// and the two latin fonts are the only .woff2 with the Fredoka preload on the exact URL of the CSS.
// The pure rules are in scripts/lib/design-checks.ts (tests/unit/design-checks.test.ts).
import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'node-html-parser';
import { DIST, Problems, listFiles, requireDist } from '../lib/dist.ts';
import { checkArrows, checkFonts, checkMotion, checkSingleStylesheet, checkSprite, checkThemeVars, checkVoice } from '../lib/design-checks.ts';
import { tokenNames } from '../lib/theme.ts';
import { visibleText } from '../lib/conteudo.ts';
import { PDF_HUB_ID, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { languagesOf, routeById, type RouteId } from '../../src/i18n/routes.ts';
import { HEALTH_CALC_IDS } from '../../src/tools/calc/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';

requireDist();

/** Poses every page needs (the search dialog is on every page) and the ones the tool panel swaps in the client. */
const PAGE_POSES = ['peek'];
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
      ? checkSprite(page.html, { requiredPoses: [...PAGE_POSES, ...TOOL_POSES.filter((pose) => pose !== 'cheer')], forbiddenPoses: ['cheer'] })
      : checkSprite(page.html, { requiredPoses: page.html.includes('id="fo-tool-root"') ? [...PAGE_POSES, ...TOOL_POSES] : PAGE_POSES }),
  ),
  `${pages.length} páginas, ids únicos, um oli-clip, poses da lista fechada e caixas [data-oli] com o próprio símbolo`,
);
report('setas', perPage((page) => checkArrows(page.html)), `${pages.length} páginas sem → nem ↔ no texto`);

// The voice of the PDF pages as built (F5a, DECISOES § 164): the visible text of each tool page and of the hub, and
// the texts the island gets in data-props (`t`, the panel bits every PDF tool shares, and `texts`, the tool's own), against the
// rules of the README: no forbidden marketing word, no emoji, no arrow, and an exclamation only in a success line (`done`,
// `doneMany`), so a visible text has none. The pages come from the PDF registry. F6: in every language of the route (the
// three since the F6), with the marketing words of that language too (FORBIDDEN_WORDS_BY_LANG).
const voiceIds: RouteId[] = [...PDF_TOOL_IDS, PDF_HUB_ID];
const voicePages = voiceIds.flatMap((id) => {
  const route = routeById(id);
  return languagesOf(route).map((lang) => ({ lang, path: route.paths[lang] ?? '' }));
});
const voiceProblems = new Problems();
for (const { lang, path } of voicePages) {
  const page = pages.find((candidate) => candidate.path === path);
  if (!page) {
    voiceProblems.add(`${path}: a página do registro de PDF não existe no dist`);
    continue;
  }
  const root = parse(page.html);
  const props = root.querySelectorAll('[data-props]').flatMap((element) => {
    const parsed = JSON.parse(element.getAttribute('data-props') ?? '{}') as { t?: unknown; texts?: unknown };
    return [checkVoice(parsed.t, 'data-props.t', lang), checkVoice(parsed.texts, 'data-props.texts', lang)].flat();
  });
  // visibleText puts a space at every element boundary, so "…AES-256.<a>Unlock PDF</a><p>Remove…" reads "Unlock PDF Remove".
  for (const problem of [...checkVoice(visibleText(page.html), 'texto visível', lang), ...props]) voiceProblems.add(`${path}: ${problem}`);
}
report('voz das páginas de PDF', voiceProblems, `${voicePages.length} páginas do registro de PDF (as ferramentas e o hub, em cada idioma): texto visível e textos do painel sem palavra proibida, emoji, seta nem exclamação fora do sucesso`);

// The file guides of the F5b, read from their registry: the same voice rules on the text a person reads (DECISOES § 188).
const guideVoice = new Problems();
for (const id of FILE_GUIDE_IDS) {
  const path = FILE_GUIDES[id].path;
  const page = pages.find((candidate) => candidate.path === path);
  if (!page) {
    guideVoice.add(`${path}: o guia do registro não existe no dist`);
    continue;
  }
  for (const problem of checkVoice(visibleText(page.html), 'texto visível')) guideVoice.add(`${path}: ${problem}`);
}
report('voz dos guias de arquivo', guideVoice, `${FILE_GUIDE_IDS.length} guias do registro: texto visível sem palavra proibida, emoji, seta nem exclamação fora do sucesso`);

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
  const usingPages = pages.filter((page) => users.includes(page.path));
  // Page messages already start with the page path; the ones about the CSS or the files get the CSS name.
  for (const problem of checkFonts({ css, pages: usingPages, woff2Files })) fontProblems.add(problem.startsWith('/') ? problem : `${href}: ${problem}`);
}
report('variáveis do tema', themeProblems, `${sheets.size} CSS, todo --color-*, --radius-*, --shadow-* e --font-* é token`);
report('movimento', motionProblems, `${sheets.size} CSS, @keyframes e transition só com transform, opacity, translate, scale e rotate`);
report('fontes', fontProblems, `${woff2Files.length} .woff2 (Fredoka e Figtree latinas), preload só da Fredoka com a URL do @font-face`);

if (failures.length) {
  console.error(`design: falhou em ${failures.length} verificação(ões): ${failures.join(', ')}`);
  process.exit(1);
}
console.log(`design: ok, ${pages.length} páginas e ${sheets.size} CSS conferidos`);
