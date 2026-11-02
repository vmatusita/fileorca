// The qrcode core as ES modules (DECISOES § 271): the plugin turns every CommonJS file of qrcode/lib/core and dijkstrajs
// into an ES module the bundler needs no CommonJS helper for, and refuses a shape it does not know. The converted files,
// run as real ES modules in Node, build the same QR matrix as the package itself.
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { QRCODE_CJS, cjsToEsm } from '../../src/platform/qrcode-esm.ts';

const require = createRequire(import.meta.url);
const core = dirname(require.resolve('qrcode/lib/core/qrcode.js'));
const dijkstra = require.resolve('dijkstrajs');

describe('the qrcode core as ES modules', () => {
  it('takes exactly the core files of qrcode and dijkstrajs, on any path separator', () => {
    expect(QRCODE_CJS.test(join(core, 'qrcode.js'))).toBe(true);
    expect(QRCODE_CJS.test(join(core, 'segments.js').split('\\').join('/'))).toBe(true);
    expect(QRCODE_CJS.test(dijkstra)).toBe(true);
    expect(QRCODE_CJS.test(join(core, '..', 'server.js'))).toBe(false);
    expect(QRCODE_CJS.test(join(core, '..', 'renderer', 'svg.js'))).toBe(false);
    expect(QRCODE_CJS.test('/src/tools/qr-code-generator/qr.ts')).toBe(false);
  });

  it('turns require() into default imports and exports the module and its named exports', () => {
    const out = cjsToEsm("const Utils = require('./utils')\nconst size = require('./utils').getSymbolSize\nexports.create = function () {}\n", 'x.js');
    expect(out).toContain('import __cjs0 from "./utils";');
    expect(out).toContain('import __cjs1 from "./utils";');
    expect(out).toContain('const Utils = __cjs0');
    expect(out).toContain('export default module.exports;');
    expect(out).toContain('export const create = module.exports.create;');
    expect(out).not.toMatch(/\brequire\(/);
    expect(() => cjsToEsm('const name = "./x"; const X = require(name)', 'y.js')).toThrow(/plain string/);
  });

  it('builds the same matrix as the package, run as ES modules', async () => {
    const dir = join('.cache', 'qrcode-esm-test');
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(join(dir, 'core'), { recursive: true });
    for (const file of readdirSync(core).filter((name) => name.endsWith('.js'))) {
      const code = cjsToEsm(readFileSync(join(core, file), 'utf8'), file).replace(/from "dijkstrajs"/g, 'from "../dijkstra.mjs"');
      writeFileSync(join(dir, 'core', file.replace(/\.js$/, '.mjs')), code.replace(/from "\.\/([\w-]+)"/g, 'from "./$1.mjs"'));
    }
    writeFileSync(join(dir, 'dijkstra.mjs'), cjsToEsm(readFileSync(dijkstra, 'utf8'), 'dijkstra.js'));
    const esm = (await import(pathToFileURL(join(dir, 'core', 'qrcode.mjs')).href)) as { create: (data: unknown, options: unknown) => { version: number; modules: { size: number; data: Uint8Array } } };
    const cjs = require('qrcode/lib/core/qrcode.js') as typeof esm;
    for (const text of ['https://fileorca.com/', 'Olá, mundo — ação', 'x'.repeat(1_000)]) {
      const segments = [{ data: new TextEncoder().encode(text), mode: 'byte' }];
      const a = esm.create(segments, { errorCorrectionLevel: 'H' });
      const b = cjs.create(segments, { errorCorrectionLevel: 'H' });
      expect(a.version, text).toBe(b.version);
      expect([...a.modules.data], text).toEqual([...b.modules.data]);
    }
    rmSync(dir, { recursive: true, force: true });
  });
});
