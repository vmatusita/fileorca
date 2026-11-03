import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { headerRules, redirectRules, toHeadersFile, toRedirectsFile } from './headers.ts';
import { copyPdfjsData } from './pdfjs-data.ts';
import { INDEXNOW_KEY, LAUNCHED, SW_ENABLED } from './site.ts';
import { LANGS, pathFor } from '../i18n/routes.ts';
import { offlineAssets, swScript, type OfflinePages } from '../sw/build.ts';

/** Paths that never enter the service worker cache and never go through it (F8, decision 5; DECISOES § 286). */
export const SW_NEVER = ['/build.txt', '/ads.txt', '/robots.txt', '/sw.js', `/${INDEXNOW_KEY}.txt`];

/** /sw.js for the built site: the commit, the offline page of each language and its files, and the share actions. */
export async function writeServiceWorker(out: string, commit: string, enabled: boolean = SW_ENABLED): Promise<void> {
  const offline = Object.fromEntries(
    LANGS.map((lang) => {
      const page = pathFor('offline', lang);
      const html = readFileSync(join(out, page, 'index.html'), 'utf8');
      return [lang, { page, assets: offlineAssets(html, (path) => readFileSync(join(out, path), 'utf8')) }];
    }),
  ) as OfflinePages;
  const share = LANGS.map((lang) => pathFor('open-with', lang));
  writeFileSync(join(out, 'sw.js'), await swScript({ version: commit, enabled, offline, share, never: SW_NEVER }));
}

/** Commit for build.txt: Workers Builds sets WORKERS_CI_COMMIT_SHA; elsewhere, git HEAD. */
export function buildCommit(env: NodeJS.ProcessEnv = process.env): string {
  const fromCi = env['WORKERS_CI_COMMIT_SHA']?.trim();
  if (fromCi) return fromCi;
  return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

/** Writes _headers, _redirects, build.txt and sw.js into dist after the static build, and copies PDF.js's data files (F5a). */
export function platformFiles(): AstroIntegration {
  return {
    name: 'fileorca:platform-files',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        writeFileSync(`${out}/_headers`, toHeadersFile(headerRules({ launched: LAUNCHED })));
        writeFileSync(`${out}/_redirects`, toRedirectsFile(redirectRules()));
        const commit = buildCommit();
        writeFileSync(`${out}/build.txt`, `${commit}\n`);
        const pdfjs = copyPdfjsData(out);
        await writeServiceWorker(out, commit);
        logger.info(`_headers, _redirects, build.txt and sw.js (${commit.slice(0, 7)}, ${SW_ENABLED ? 'on' : 'kill switch'}) written; ${pdfjs} PDF.js data files copied`);
      },
    },
  };
}
