// The second server of the Playwright run (F12, decision 2; DECISOES § 414): it serves the test build (the ads with the
// fake ids of the 37 units and the wall in "bloqueio") with the rules of scripts/serve-dist.ts, on its own port (FO_PORT
// plus 100). It starts at once and builds nothing until a spec asks: the specs that read the test build call
// /__test-build in their beforeAll, and the first call of a Playwright run (FO_RUN_ID) makes or reuses the build
// (scripts/lib/test-build.ts), once; the other calls of the same run wait for that one. So a part of the CI with no such
// spec pays only for starting this process. Any other path before the build answers 503.
import { createServer, type RequestListener } from 'node:http';
import { distHandler } from './serve-dist.ts';
import { buildVariant, type BuildResult } from './lib/test-build.ts';

const PORT = Number(process.env['PORT'] ?? 4273);

let current: { run: string; build: Promise<BuildResult>; handler?: RequestListener } | null = null;

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  if (url.pathname === '/__health') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('ok');
    return;
  }
  if (url.pathname === '/__test-build') {
    const run = url.searchParams.get('run') ?? '';
    if (!current || current.run !== run) {
      const entry: NonNullable<typeof current> = { run, build: buildVariant('teste') };
      current = entry;
      entry.build.then(
        (result) => {
          entry.handler = distHandler({ root: result.dir });
          console.log(`[serve-test-build] build de teste ${result.built ? `feito em ${result.seconds.toFixed(1)} s` : 'reaproveitado'} (${result.dir})`);
        },
        (error: unknown) => console.error(`[serve-test-build] ${String(error)}`),
      );
    }
    current.build.then(
      (result) => {
        response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify(result));
      },
      (error: unknown) => {
        response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end(String(error));
      },
    );
    return;
  }
  if (!current?.handler) {
    response.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('build de teste ainda não pedido: chame /__test-build antes (tests/e2e/lib/test-build.ts)');
    return;
  }
  current.handler(request, response);
});

server.listen(PORT, '127.0.0.1', () => console.log(`build de teste servido em http://127.0.0.1:${PORT} (ready)`));
