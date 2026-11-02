// The QR code library as ES modules for the page build (F7, DECISOES § 271). `qrcode/lib/core/` and `dijkstrajs` are
// CommonJS, and Rolldown wraps CommonJS in a helper that it puts in a chunk shared with the lazy chunks of the image
// tools (rolldown-runtime.*.js): the QR page would load it as a third JS file. Their CommonJS is plain (top-level
// `const X = require('./x')`, `exports.name =` and `module.exports =`, no cycle), so this plugin hands them to the bundler
// as ES modules: each `require()` becomes the default import of that module, the file runs with a local `module` and
// `exports`, and `module.exports` is the default export (plus the names assigned to `exports.name`). The module ids stay
// the files in node_modules, so the bundle record and gate:licencas see the same packages. Build-time only.
import type { Plugin } from 'vite';

/** The CommonJS files the QR code generator bundles: the core of qrcode and the dijkstrajs it requires. */
export const QRCODE_CJS = /[\\/]node_modules[\\/](?:\.pnpm[\\/][^\\/]+[\\/]node_modules[\\/])?(?:qrcode[\\/]lib[\\/]core[\\/][\w-]+\.js|dijkstrajs[\\/]dijkstra\.js)$/;

/** One CommonJS file as an ES module (the shapes the qrcode core uses; anything else is refused with an error). */
export function cjsToEsm(code: string, id: string): string {
  if (/\brequire\s*\(\s*[^'"\s]/.test(code)) throw new Error(`qrcode-esm: a require() that is not a plain string in ${id}`);
  const imports: string[] = [];
  const body = code.replace(/\brequire\(\s*(['"])([^'"]+)\1\s*\)/g, (_match: string, _quote: string, specifier: string) => {
    const name = `__cjs${imports.length}`;
    imports.push(`import ${name} from ${JSON.stringify(specifier)};`);
    return name;
  });
  const names = [...new Set([...body.matchAll(/^exports\.(\w+)\s*=/gm)].map((match) => match[1] ?? ''))].filter(Boolean);
  const named = names.map((name) => `export const ${name} = module.exports.${name};`);
  return [...imports, 'const module = { exports: {} };', 'const exports = module.exports;', body, 'export default module.exports;', ...named, ''].join('\n');
}

export function qrcodeEsm(): Plugin {
  return {
    name: 'fileorca:qrcode-esm',
    enforce: 'pre',
    transform(code, id) {
      if (!QRCODE_CJS.test(id)) return null;
      return { code: cjsToEsm(code, id), map: null };
    },
  };
}
