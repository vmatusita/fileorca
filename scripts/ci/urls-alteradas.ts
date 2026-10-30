// Changed page URLs for IndexNow (PLANO "Da run ao ar", item 7).
// Crosses the changed files of a commit with the route map: only files that belong to a page
// (its page file, its view, its texts) produce URLs. Dependency, CI and shared files produce none.
import { execFileSync } from 'node:child_process';
import { ROUTES, languagesOf, pageFileFor, textFilesFor, type RouteDef } from '../../src/i18n/routes.ts';
import { SITE_ORIGIN } from '../../src/platform/site.ts';

function normalize(file: string): string {
  return file.replaceAll('\\', '/').replace(/^\.\//, '');
}

function matches(file: string, source: string): boolean {
  return source.endsWith('/') ? file.startsWith(source) : file === source;
}

/** Absolute URLs of indexable pages whose own files changed, in route-map order. */
export function changedUrls(
  changedFiles: readonly string[],
  routes: readonly RouteDef[] = ROUTES,
  origin: string = SITE_ORIGIN,
): string[] {
  const files = changedFiles.map(normalize);
  const urls: string[] = [];
  for (const route of routes) {
    if (!route.indexable) continue;
    // A text file belongs to one language even when it sits inside the view folder; tests never count.
    const allTexts = new Set(languagesOf(route).flatMap((lang) => textFilesFor(route, lang)));
    const viewChanged = files.some(
      (file) => matches(file, route.view) && !allTexts.has(file) && !/\.test\.tsx?$/.test(file),
    );
    for (const lang of languagesOf(route)) {
      const path = route.paths[lang];
      if (path === undefined) continue;
      const own = [pageFileFor(path), ...textFilesFor(route, lang)];
      if (viewChanged || files.some((file) => own.some((source) => matches(file, source)))) {
        urls.push(new URL(path, origin).href);
      }
    }
  }
  return urls;
}

/** Files changed by a commit, against its first parent. */
export function filesChangedBy(commit: string): string[] {
  const out = execFileSync('git', ['diff', '--name-only', `${commit}^1`, commit], { encoding: 'utf8' });
  return out.split('\n').map((line) => line.trim()).filter(Boolean);
}

if (import.meta.main) {
  // Usage: node scripts/ci/urls-alteradas.ts <commit>  -> one URL per line
  const commit = process.argv[2] ?? 'HEAD';
  for (const url of changedUrls(filesChangedBy(commit))) console.log(url);
}
