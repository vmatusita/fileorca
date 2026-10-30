// Helpers for the post-build gates: read dist/ and parse its HTML.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';
import { ROUTES, languagesOf, type Lang, type RouteDef } from '../../src/i18n/routes.ts';

export const DIST = 'dist';

export function requireDist(): void {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('dist/ não existe: rode pnpm build antes deste portão.');
    process.exit(1);
  }
}

/** dist file for a URL path: '/pt/sobre/' -> dist/pt/sobre/index.html; '/pt/404.html' as is. */
export function fileForPath(path: string): string {
  const clean = decodeURI(path.split('#')[0]?.split('?')[0] ?? '/');
  if (clean.endsWith('/')) return join(DIST, clean, 'index.html');
  return join(DIST, clean);
}

export function readHtml(path: string): HTMLElement {
  return parse(readFileSync(fileForPath(path), 'utf8'));
}

export interface PageRef {
  route: RouteDef;
  lang: Lang;
  path: string;
}

export function allPages(): PageRef[] {
  return ROUTES.flatMap((route) => languagesOf(route).map((lang) => ({ route, lang, path: route.paths[lang] ?? '/' })));
}

export function listFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) listFiles(path, out);
    else out.push(path);
  }
  return out;
}

export class Problems {
  readonly list: string[] = [];

  add(message: string): void {
    this.list.push(message);
  }

  finish(gate: string, okMessage: string): void {
    if (this.list.length) {
      console.error(`${gate}: ${this.list.length} problema(s)`);
      for (const problem of this.list) console.error(`  - ${problem}`);
      process.exit(1);
    }
    console.log(`${gate}: ok, ${okMessage}`);
  }
}
