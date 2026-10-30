// Gate: actionlint on both workflows. The pinned release binary is downloaded once into .cache/
// and checked by SHA-256 (scripts/lib/tools.ts). The npm "actionlint" package is stale: not used.
import { spawnSync } from 'node:child_process';
import { chmodSync } from 'node:fs';
import { ACTIONLINT, ensureTool } from '../lib/tools.ts';

const binary = await ensureTool(ACTIONLINT);
if (process.platform !== 'win32') chmodSync(binary, 0o755);
const files = ['.github/workflows/ci.yml', '.github/workflows/pos-deploy.yml'];
const result = spawnSync(binary, ['-color', ...files], { stdio: 'inherit' });
if (result.status !== 0) {
  console.error(`actionlint: falhou (código ${result.status ?? 'sem código'})`);
  process.exit(1);
}
console.log(`actionlint ${ACTIONLINT.version}: ok, ${files.join(' e ')} sem erro`);
