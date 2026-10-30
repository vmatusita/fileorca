// Post-deploy check of production (PLANO "Da run ao ar", item 7; ADR-001, item 5).
// Waits until https://fileorca.com/build.txt carries the commit (or a later one), then checks
// injected scripts, robots.txt and X-Robots-Tag against the LAUNCHED of that commit, and pings
// IndexNow with the changed URLs when the site is launched. Exits 1 on any failure.
import { execFileSync } from 'node:child_process';
import { INDEXNOW_KEY, PRODUCTION_HOSTNAME, SITE_ORIGIN, parseLaunched } from '../../src/platform/site.ts';
import { changedUrls, filesChangedBy } from './urls-alteradas.ts';

export const CHECK_PAGES = ['/', '/compress-image/', '/pt/', '/es/'] as const;
const INJECTED = ['/cdn-cgi/', 'cloudflareinsights'] as const;
const POLL_MS = 30_000;

export interface Fetcher {
  (url: string, init?: RequestInit): Promise<Response>;
}

export interface CheckResult {
  ok: boolean;
  problems: string[];
}

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

/** True when `commit` is `deployed` or one of its ancestors (the deploy has that commit). */
export function hasCommit(commit: string, deployed: string, run: (args: string[]) => void = (a) => void git(a)): boolean {
  try {
    run(['merge-base', '--is-ancestor', commit, deployed]);
    return true;
  } catch {
    return false;
  }
}

/** Problems in production HTML: scripts injected by the Cloudflare zone. */
export function injectedScripts(html: string): string[] {
  return INJECTED.filter((needle) => html.includes(needle));
}

/** X-Robots-Tag must say noindex before the launch and must be absent after it. */
export function robotsHeaderProblem(header: string | null, launched: boolean): string | null {
  const noindex = header !== null && /\bnoindex\b/i.test(header);
  if (!launched && !noindex) return `X-Robots-Tag sem noindex com LAUNCHED = false (recebido: ${header ?? 'ausente'})`;
  if (launched && header !== null) return `X-Robots-Tag presente com LAUNCHED = true (recebido: ${header})`;
  return null;
}

export function indexNowBody(urls: string[]): string {
  return JSON.stringify({
    host: PRODUCTION_HOSTNAME,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  });
}

async function readDeployed(fetcher: Fetcher): Promise<string | null> {
  try {
    const response = await fetcher(`${SITE_ORIGIN}/build.txt?nocache=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return (await response.text()).trim().split('\n')[0] ?? null;
  } catch {
    return null;
  }
}

export async function waitForDeploy(commit: string, minutes: number, fetcher: Fetcher = fetch): Promise<string | null> {
  const deadline = Date.now() + minutes * 60_000;
  for (;;) {
    const deployed = await readDeployed(fetcher);
    if (deployed && /^[0-9a-f]{40}$/.test(deployed)) {
      try {
        git(['cat-file', '-e', `${deployed}^{commit}`]);
      } catch {
        // A newer push may not be in the checkout yet.
        try { git(['fetch', '--quiet', 'origin', 'main']); } catch { /* checked again below */ }
      }
      if (hasCommit(commit, deployed)) return deployed;
      console.log(`build.txt traz ${deployed.slice(0, 7)}, ainda sem ${commit.slice(0, 7)}`);
    } else {
      console.log(`build.txt ainda não responde com um commit (${deployed ?? 'sem resposta'})`);
    }
    if (Date.now() + POLL_MS > deadline) return null;
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}

export async function checkProduction(commit: string, fetcher: Fetcher = fetch): Promise<CheckResult> {
  const problems: string[] = [];
  const launched = parseLaunched(git(['show', `${commit}:src/platform/site.ts`]));
  for (const page of CHECK_PAGES) {
    const response = await fetcher(`${SITE_ORIGIN}${page}`, { headers: { 'Cache-Control': 'no-cache' } });
    if (!response.ok) problems.push(`${page} respondeu ${response.status}`);
    const html = await response.text();
    for (const needle of injectedScripts(html)) problems.push(`${page} tem "${needle}" no HTML`);
    const robots = robotsHeaderProblem(response.headers.get('x-robots-tag'), launched);
    if (robots) problems.push(`${page}: ${robots}`);
  }
  const expected = execFileSync('git', ['show', `${commit}:public/robots.txt`]);
  const robotsResponse = await fetcher(`${SITE_ORIGIN}/robots.txt`, { headers: { 'Cache-Control': 'no-cache' } });
  const actual = Buffer.from(await robotsResponse.arrayBuffer());
  if (!actual.equals(expected)) problems.push('robots.txt de produção diferente do public/robots.txt do commit');
  return { ok: problems.length === 0, problems };
}

async function pingIndexNow(urls: string[], fetcher: Fetcher = fetch): Promise<void> {
  const response = await fetcher('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: indexNowBody(urls),
  });
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow respondeu ${response.status}: ${await response.text()}`);
  }
  console.log(`IndexNow: ${urls.length} URL(s) enviadas (${response.status})`);
}

if (import.meta.main) {
  // Usage: node scripts/ci/pos-deploy.ts <commit> [minutes]
  const commit = process.argv[2];
  const minutes = Number(process.argv[3] ?? '20');
  if (!commit || !/^[0-9a-f]{7,40}$/.test(commit)) throw new Error('usage: pos-deploy.ts <commit-sha> [minutes]');
  const full = git(['rev-parse', `${commit}^{commit}`]);
  console.log(`Esperando ${SITE_ORIGIN}/build.txt trazer ${full.slice(0, 7)} (até ${minutes} min)`);
  const deployed = await waitForDeploy(full, minutes);
  if (!deployed) {
    console.error(`O deploy de ${full.slice(0, 7)} não chegou em ${minutes} min.`);
    process.exit(1);
  }
  const result = await checkProduction(full);
  for (const problem of result.problems) console.error(`- ${problem}`);
  if (!result.ok) process.exit(1);
  const launched = parseLaunched(git(['show', `${full}:src/platform/site.ts`]));
  if (!launched) {
    console.log('LAUNCHED = false: produção conferida, IndexNow não disparado (site em noindex).');
  } else {
    const urls = changedUrls(filesChangedBy(full));
    if (urls.length === 0) console.log('Nenhuma URL de página mudou: IndexNow não disparado.');
    else await pingIndexNow(urls);
  }
  console.log('Pós-deploy ok.');
}
