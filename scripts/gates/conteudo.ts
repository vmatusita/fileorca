// Gate: minimum content of the image tool and preset pages, and a clean site (prompt F2, decision 10).
// Tool and preset pages come from the route map (ids of src/tools/image/registry.ts); each carries
// the how, specs, faq, privacy and related blocks, and a preset has at least three blocks of its own.
// Across the whole dist/ (404s aside): no repeated title or description and no placeholder wording.
// The checks are pure functions in scripts/lib/conteudo.ts, tested in tests/unit/conteudo.test.ts.
import { existsSync, readFileSync } from 'node:fs';
import { DIST, Problems, allPages, fileForPath, listFiles, requireDist } from '../lib/dist.ts';
import { checkPresetPage, checkSite, checkToolPage, comparisonPaths, isImagePage, isNotFoundPath, pathOfFile } from '../lib/conteudo.ts';
import { IMAGE_PAGES } from '../../src/tools/image/registry.ts';

requireDist();
const problems = new Problems();
const read = (path: string): string => readFileSync(fileForPath(path), 'utf8');

const pages = allPages();
for (const id of Object.keys(IMAGE_PAGES)) {
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

const sitePages = listFiles(DIST)
  .filter((file) => file.endsWith('.html'))
  .map((file) => ({ path: pathOfFile(file, DIST), html: readFileSync(file, 'utf8') }))
  .filter((page) => !isNotFoundPath(page.path));
for (const problem of checkSite(sitePages)) problems.add(problem);

problems.finish('conteúdo', `${toolPages} página(s) de ferramenta e de preset e ${sitePages.length} página(s) do site conferida(s)`);
