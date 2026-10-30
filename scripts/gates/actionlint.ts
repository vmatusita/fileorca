// Gate: actionlint on every workflow in .github/workflows/. The pinned release binary is downloaded once into .cache/
// and checked by SHA-256 (scripts/lib/tools.ts). The npm "actionlint" package is stale: not used.
import { spawnSync } from 'node:child_process';
import { chmodSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ACTIONLINT, SHELLCHECK, ensureTool } from '../lib/tools.ts';

const binary = await ensureTool(ACTIONLINT);
const shellcheck = resolve(await ensureTool(SHELLCHECK));
if (process.platform !== 'win32') {
  chmodSync(binary, 0o755);
  chmodSync(shellcheck, 0o755);
}
const files = readdirSync('.github/workflows').filter((name) => /\.ya?ml$/.test(name)).map((name) => `.github/workflows/${name}`);
if (files.length === 0) {
  console.error('actionlint: nenhum workflow em .github/workflows/');
  process.exit(1);
}
// The pinned shellcheck checks the run: blocks the same way on Windows and on the Ubuntu runner.
const result = spawnSync(binary, ['-color', `-shellcheck=${shellcheck}`, ...files], { stdio: 'inherit' });
if (result.status !== 0) {
  console.error(`actionlint: falhou (código ${result.status ?? 'sem código'})`);
  process.exit(1);
}
console.log(`actionlint ${ACTIONLINT.version} com shellcheck ${SHELLCHECK.version}: ok, ${files.join(' e ')} sem erro`);
