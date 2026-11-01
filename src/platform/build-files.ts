import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { headerRules, redirectRules, toHeadersFile, toRedirectsFile } from './headers.ts';
import { copyPdfjsData } from './pdfjs-data.ts';
import { LAUNCHED } from './site.ts';

/** Commit for build.txt: Workers Builds sets WORKERS_CI_COMMIT_SHA; elsewhere, git HEAD. */
export function buildCommit(env: NodeJS.ProcessEnv = process.env): string {
  const fromCi = env['WORKERS_CI_COMMIT_SHA']?.trim();
  if (fromCi) return fromCi;
  return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

/** Writes _headers, _redirects and build.txt into dist after the static build, and copies PDF.js's data files (F5a). */
export function platformFiles(): AstroIntegration {
  return {
    name: 'fileorca:platform-files',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        writeFileSync(`${out}/_headers`, toHeadersFile(headerRules({ launched: LAUNCHED })));
        writeFileSync(`${out}/_redirects`, toRedirectsFile(redirectRules()));
        const commit = buildCommit();
        writeFileSync(`${out}/build.txt`, `${commit}\n`);
        const pdfjs = copyPdfjsData(out);
        logger.info(`_headers, _redirects and build.txt (${commit.slice(0, 7)}) written; ${pdfjs} PDF.js data files copied`);
      },
    },
  };
}
