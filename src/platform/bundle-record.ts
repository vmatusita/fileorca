// Records which modules end up in which JavaScript chunk of the browser build, so the license gate can
// compare the real bundle with what /licenses lists (DECISOES § 13). Build-time only; the file is
// written under .cache/ (git-ignored), never into dist/, so nothing here is deployed.
//
// The plugin is registered for the page build and for the worker build (a worker is bundled on its own
// by Vite), both with the same instance: every chunk of both ends up in one record. The server build
// that renders the HTML runs the same plugin, but its chunks live outside `_astro/` and nothing from
// it reaches the browser, so they are skipped.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/** Where the record is written, relative to the project root. */
export const BUNDLE_RECORD = '.cache/bundle-modules.json';

/** chunk file name (as emitted, relative to dist/) -> ids of the modules rendered in it. */
export type BundleRecord = Record<string, string[]>;

interface EmittedEntry {
  type: string;
  modules?: Record<string, unknown>;
}

/** The chunks the browser can get: Astro puts them (and the worker's) under `_astro/`. */
const BROWSER_CHUNK = /^_astro\/.+\.js$/;

export function recordBundledModules(file: string = BUNDLE_RECORD) {
  const chunks: BundleRecord = {};
  return {
    name: 'fileorca:record-bundled-modules',
    generateBundle(_options: unknown, bundle: Record<string, EmittedEntry>): void {
      let changed = false;
      for (const [name, entry] of Object.entries(bundle)) {
        if (entry.type !== 'chunk' || !entry.modules || !BROWSER_CHUNK.test(name)) continue;
        const ids = new Set(chunks[name] ?? []);
        for (const id of Object.keys(entry.modules)) ids.add(id.replace(/\\/g, '/').replace(/\0/g, ''));
        chunks[name] = [...ids].sort();
        changed = true;
      }
      if (!changed) return;
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, `${JSON.stringify(chunks, null, 1)}\n`);
    },
  };
}
