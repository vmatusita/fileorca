import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { checkProduction, hasCommit, indexNowBody, injectedScripts, robotsHeaderProblem, waitForDeploy, type Fetcher } from '../../scripts/ci/pos-deploy.ts';
import { INDEXNOW_KEY, LAUNCHED, parseLaunched } from '../../src/platform/site.ts';

const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const parent = execFileSync('git', ['rev-parse', 'HEAD~1'], { encoding: 'utf8' }).trim();
const robots = execFileSync('git', ['show', `${head}:public/robots.txt`]);

function fakeFetch(options: { robotsTag?: string | null; html?: string; robots?: Buffer; build?: string }): Fetcher {
  return async (url: string) => {
    const path = new URL(url).pathname;
    if (path === '/build.txt') return new Response(`${options.build ?? head}\n`);
    if (path === '/robots.txt') return new Response(new Uint8Array(options.robots ?? robots));
    const headers = new Headers();
    if (options.robotsTag !== null) headers.set('X-Robots-Tag', options.robotsTag ?? 'noindex');
    return new Response(options.html ?? '<html><body>ok</body></html>', { headers });
  };
}

describe('pós-deploy: conferência de produção', () => {
  it('passes with noindex (LAUNCHED = false), clean HTML and the same robots.txt', async () => {
    expect(await checkProduction(head, fakeFetch({}))).toEqual({ ok: true, problems: [] });
  });

  it('fails without noindex, with an injected script, or with a robots.txt one byte off', async () => {
    expect((await checkProduction(head, fakeFetch({ robotsTag: null }))).problems.join()).toMatch(/sem noindex/);
    expect((await checkProduction(head, fakeFetch({ html: '<script src="/cdn-cgi/x.js"></script>' }))).problems.join()).toMatch(/cdn-cgi/);
    const changed = Buffer.concat([robots, Buffer.from('\n')]);
    expect((await checkProduction(head, fakeFetch({ robots: changed }))).problems.join()).toMatch(/robots\.txt/);
  });

  it('accepts the commit itself or a later one in build.txt, and gives up at the deadline', async () => {
    expect(await waitForDeploy(head, 1, fakeFetch({ build: head }))).toBe(head);
    expect(await waitForDeploy(parent, 1, fakeFetch({ build: head }))).toBe(head);
    expect(await waitForDeploy(head, 0, fakeFetch({ build: parent }))).toBeNull();
    expect(await waitForDeploy(head, 0, fakeFetch({ build: 'not-a-commit' }))).toBeNull();
  });
});

describe('pós-deploy', () => {
  it('reads LAUNCHED from the source of site.ts', () => {
    const source = readFileSync('src/platform/site.ts', 'utf8');
    expect(parseLaunched(source)).toBe(LAUNCHED);
    expect(parseLaunched('export const LAUNCHED = true;\n')).toBe(true);
    expect(() => parseLaunched('const LAUNCHED = false')).toThrow();
  });

  it('keeps LAUNCHED false in the F1a', () => {
    expect(LAUNCHED).toBe(false);
  });

  it('accepts the commit itself or a later one, via git merge-base --is-ancestor', () => {
    const calls: string[][] = [];
    expect(hasCommit('aaa', 'bbb', (args) => void calls.push(args))).toBe(true);
    expect(calls).toEqual([['merge-base', '--is-ancestor', 'aaa', 'bbb']]);
    expect(hasCommit('aaa', 'bbb', () => { throw new Error('exit 1'); })).toBe(false);
  });

  it('flags Cloudflare-injected scripts', () => {
    expect(injectedScripts('<html><script src="/cdn-cgi/challenge-platform/x.js"></script></html>')).toEqual(['/cdn-cgi/']);
    expect(injectedScripts('<script src="https://static.cloudflareinsights.com/beacon.min.js"></script>')).toEqual(['cloudflareinsights']);
    expect(injectedScripts('<html><body>ok</body></html>')).toEqual([]);
  });

  it('requires noindex before launch and no X-Robots-Tag after it', () => {
    expect(robotsHeaderProblem('noindex', false)).toBeNull();
    expect(robotsHeaderProblem('noindex, noindex', false)).toBeNull();
    expect(robotsHeaderProblem(null, false)).toMatch(/sem noindex/);
    expect(robotsHeaderProblem(null, true)).toBeNull();
    expect(robotsHeaderProblem('noindex', true)).toMatch(/presente/);
  });

  it('builds the IndexNow body with the public key file', () => {
    expect(JSON.parse(indexNowBody(['https://fileorca.com/compress-image/']))).toEqual({
      host: 'fileorca.com',
      key: INDEXNOW_KEY,
      keyLocation: `https://fileorca.com/${INDEXNOW_KEY}.txt`,
      urlList: ['https://fileorca.com/compress-image/'],
    });
    expect(readFileSync(`public/${INDEXNOW_KEY}.txt`, 'utf8')).toBe(INDEXNOW_KEY);
    expect(INDEXNOW_KEY).toMatch(/^[a-f0-9]{32}$/);
  });
});
